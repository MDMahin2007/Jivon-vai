import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, required: true },
    images: { type: [String], default: [] }, // Multiple gallery images
    videoUrl: { type: String, default: "" },  // Video link or file path
    featured: { type: Boolean, default: false },

    // 🌟 Project Sheet Data (b160cc.jpg screen-er jonnno)
    client: { type: String, default: "" },
    location: { type: String, default: "" },
    year: { type: String, default: "" },
    scale: { type: String, default: "" }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;