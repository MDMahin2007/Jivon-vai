import express from "express";
import mongoose from "mongoose";
import Project from "../models/project.model.js";
import uploadCloud from "../config/cloudinaryConfig.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["true", "1", "yes", "on"].includes(value.toLowerCase());
    return false;
};

const mapUploadedFiles = (files = {}, fieldName) => {
    const uploaded = files[fieldName];
    if (!uploaded || !uploaded.length) return [];
    return uploaded.map((file) => file.path);
};

const validateProjectInput = ({ title, category, description }) => {
    if (!title || title.trim().length < 2) return "Project title must be at least 2 characters.";
    if (!category || category.trim().length < 2) return "Project category is required.";
    if (!description || description.trim().length < 10) return "Project description must be at least 10 characters.";
    return null;
};

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid project identifier." });
        }
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post(
    "/",
    protectAdmin,
    uploadCloud.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "images", maxCount: 15 },
        { name: "renderImages", maxCount: 15 },
        { name: "floorPlans", maxCount: 15 },
        { name: "videoFile", maxCount: 1 },
        { name: "videos", maxCount: 10 },
    ]),
    async (req, res) => {
        try {
            const validationError = validateProjectInput(req.body);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            const coverImageUrl = req.files?.coverImage?.[0]?.path || "";
            if (!coverImageUrl) {
                return res.status(400).json({ success: false, message: "Cover image is required!" });
            }

            const payload = {
                title: req.body.title || "",
                category: req.body.category || "",
                description: req.body.description || "",
                featured: normalizeBoolean(req.body.featured),
                coverImage: coverImageUrl,
                images: mapUploadedFiles(req.files, "images"),
                renderImages: mapUploadedFiles(req.files, "renderImages"),
                floorPlans: mapUploadedFiles(req.files, "floorPlans"),
                videos: mapUploadedFiles(req.files, "videos"),
                videoUrl: req.body.videoUrl || req.files?.videoFile?.[0]?.path || "",
                client: req.body.client || "",
                location: req.body.location || "",
                year: req.body.year || "",
                scale: req.body.scale || "",
                status: req.body.status || "Published",
                area: req.body.area || "",
                projectType: req.body.projectType || "",
                projectSheet: {
                    client: req.body.client || "",
                    location: req.body.location || "",
                    year: req.body.year || "",
                    scale: req.body.scale || "",
                    status: req.body.status || "Published",
                    area: req.body.area || "",
                    projectType: req.body.projectType || "",
                },
            };

            const ignoredFields = new Set(["title", "category", "description", "featured", "coverImage", "images", "renderImages", "floorPlans", "videos", "videoFile", "videoUrl", "client", "location", "year", "scale", "status", "area", "projectType"]);
            Object.entries(req.body).forEach(([key, value]) => {
                if (!ignoredFields.has(key)) {
                    payload[key] = value;
                }
            });

            const newProject = await Project.create(payload);
            res.json({ success: true, data: newProject });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
);

router.put(
    "/:id",
    protectAdmin,
    uploadCloud.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "images", maxCount: 15 },
        { name: "renderImages", maxCount: 15 },
        { name: "floorPlans", maxCount: 15 },
        { name: "videoFile", maxCount: 1 },
        { name: "videos", maxCount: 10 },
    ]),
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ success: false, message: "Invalid project identifier." });
            }

            const existingProject = await Project.findById(req.params.id);
            if (!existingProject) {
                return res.status(404).json({ success: false, message: "Project not found" });
            }

            const payload = {
                title: req.body.title !== undefined ? req.body.title : existingProject.title,
                category: req.body.category !== undefined ? req.body.category : existingProject.category,
                description: req.body.description !== undefined ? req.body.description : existingProject.description,
                featured: req.body.featured !== undefined ? normalizeBoolean(req.body.featured) : existingProject.featured,
                coverImage: req.files?.coverImage?.[0]?.path || existingProject.coverImage,
                images: req.files?.images ? mapUploadedFiles(req.files, "images") : existingProject.images || [],
                renderImages: req.files?.renderImages ? mapUploadedFiles(req.files, "renderImages") : existingProject.renderImages || [],
                floorPlans: req.files?.floorPlans ? mapUploadedFiles(req.files, "floorPlans") : existingProject.floorPlans || [],
                videos: req.files?.videos ? mapUploadedFiles(req.files, "videos") : existingProject.videos || [],
                videoUrl: req.files?.videoFile?.[0]?.path || (req.body.videoUrl !== undefined ? req.body.videoUrl : existingProject.videoUrl || ""),
                client: req.body.client !== undefined ? req.body.client : existingProject.client,
                location: req.body.location !== undefined ? req.body.location : existingProject.location,
                year: req.body.year !== undefined ? req.body.year : existingProject.year,
                scale: req.body.scale !== undefined ? req.body.scale : existingProject.scale,
                status: req.body.status !== undefined ? req.body.status : existingProject.status,
                area: req.body.area !== undefined ? req.body.area : existingProject.area,
                projectType: req.body.projectType !== undefined ? req.body.projectType : existingProject.projectType,
                projectSheet: {
                    client: req.body.client !== undefined ? req.body.client : existingProject.client,
                    location: req.body.location !== undefined ? req.body.location : existingProject.location,
                    year: req.body.year !== undefined ? req.body.year : existingProject.year,
                    scale: req.body.scale !== undefined ? req.body.scale : existingProject.scale,
                    status: req.body.status !== undefined ? req.body.status : existingProject.status,
                    area: req.body.area !== undefined ? req.body.area : existingProject.area,
                    projectType: req.body.projectType !== undefined ? req.body.projectType : existingProject.projectType,
                },
            };

            const ignoredFields = new Set(["title", "category", "description", "featured", "coverImage", "images", "renderImages", "floorPlans", "videos", "videoFile", "videoUrl", "client", "location", "year", "scale", "status", "area", "projectType"]);
            Object.entries(req.body).forEach(([key, value]) => {
                if (!ignoredFields.has(key)) {
                    payload[key] = value;
                }
            });

            const validationError = validateProjectInput(payload);
            if (validationError) {
                return res.status(400).json({ success: false, message: validationError });
            }

            const updatedProject = await Project.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
            res.json({ success: true, data: updatedProject });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
);

router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid project identifier." });
        }
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;