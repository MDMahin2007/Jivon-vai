import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import contactRoutes from "./src/routes/contact.routes.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

// Dynamic CORS configuration (Vercel preview & main domains allow korbe)
app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / Mobile / No origin request
      if (!origin) return callback(null, true);

      // Main domain or ANY Vercel preview domain (.vercel.app) or Localhost allow
      if (
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Silent rejection (Exception throw na kore app safe rakha)
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
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