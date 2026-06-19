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


connectDB();


app.use(cors());
app.use(express.json());


app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/projects", projectRoutes);


app.use(express.static(path.join(__dirname, "./dist"))); 


app.get("*any", (req, res) => {
    res.sendFile(path.join(__dirname, "./dist/index.html"));
});


app.use(errorMiddleware);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});