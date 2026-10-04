import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import errorMiddleware from "./src/middleware/error.middleware.js";
import serviceRoutes from "./src/routes/service.routes.js";
import projectRoutes from "./src/routes/project.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl =
    process.env.FRONTEND_URL || "https://jivon-vai-five.vercel.app";
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");


// ডাটাবেজ কানেক্ট করা
connectDB();

// CORS ও সাইজ লিমিট কনফিগারেশন
app.use(helmet());
app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication requests. Please try again later." },
});
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many contact requests. Please try again later." },
});

// এপিআই রাউটস
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);

if (fs.existsSync(frontendIndexPath)) {
    app.use(express.static(frontendDistPath));

    // Frontend routes work on refresh when the frontend build is present.
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(frontendIndexPath);
    });
} else {
    // The frontend is usually deployed separately on Vercel.
    app.get(/^\/(?!api).*/, (req, res) => {
        res.redirect(302, `${frontendUrl}${req.originalUrl}`);
    });
}

// গ্লোবাল এরর হ্যান্ডলার মিডলওয়যার
app.use(errorMiddleware);

// সার্ভার রান করা
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});