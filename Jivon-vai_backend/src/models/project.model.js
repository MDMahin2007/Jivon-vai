import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, required: true },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;