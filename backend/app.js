import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import contactRoutes from "./src/routes/contact.routes.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

const app = express();
const frontendOrigin = new URL(
  process.env.FRONTEND_URL || "https://jivon-vai-five.vercel.app",
).origin;

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Contact API is running." });
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact requests. Please try again later.",
  },
});

app.use("/api/contact", contactLimiter, contactRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

app.use(errorMiddleware);

export default app;