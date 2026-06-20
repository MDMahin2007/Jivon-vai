import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"
import connectDB from "./src/config/db.js";
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

// ডাটাবেজ কানেক্ট করা
connectDB();

// CORS ও সাইজ লিমিট কনফিগারেশন
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// এপিআই রাউটস
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);

// স্ট্যাটিক ফ্রন্টএন্ড ফাইল সার্ভ করা
app.use(express.static(path.join(__dirname, "./dist")));

// 🌟 [ফিক্সড ওয়াইল্ডকার্ড রাউট]: এখানে শুধুমাত্র "*" হবে, "*any" বা "/*" হবে না
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./dist/index.html"));
});

// গ্লোবাল এরর হ্যান্ডলার মিডলওয়যার
app.use(errorMiddleware);

// সার্ভার রান করা
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});