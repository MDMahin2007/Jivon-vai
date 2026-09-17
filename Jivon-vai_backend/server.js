import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";


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

// স্ট্যাটিক ফ্রন্টএন্ড ফাইল সার্ভ করা
app.use(express.static(path.join(__dirname, "./dist")));

// ফ্রন্টএন্ড রাউট রিফ্রেশ সাপোর্ট
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "./dist/index.html"));
});

// গ্লোবাল এরর হ্যান্ডলার মিডলওয়যার
app.use(errorMiddleware);

// সার্ভার রান করা
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});