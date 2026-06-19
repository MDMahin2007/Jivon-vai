import express from "express";
import cors from "cors";

import adminRoutes from "./src/routes/admin.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use(errorMiddleware);

export default app;