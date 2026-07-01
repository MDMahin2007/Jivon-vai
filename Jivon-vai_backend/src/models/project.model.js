import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        coverImage: { type: String, required: true },
        images: { type: [String], default: [] },
        renderImages: { type: [String], default: [] },
        floorPlans: { type: [String], default: [] },
        videos: { type: [String], default: [] },
        videoUrl: { type: String, default: "" },
        featured: { type: Boolean, default: false },
        status: { type: String, default: "Published" },
        client: { type: String, default: "" },
        location: { type: String, default: "" },
        year: { type: String, default: "" },
        scale: { type: String, default: "" },
        area: { type: String, default: "" },
        projectType: { type: String, default: "" },
        projectSheet: { type: Object, default: {} },
    },
    { timestamps: true, strict: false },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;