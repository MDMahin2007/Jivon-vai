import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    coverImage: { type: String, required: true },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;