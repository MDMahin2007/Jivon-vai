import express from "express";
import Project from "../models/project.model.js";
import uploadCloud from "../config/cloudinaryConfig.js";

const router = express.Router();

// ১. Shob project niye asa
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ২. Single Project details niye asa
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৩. New project create kora
router.post("/", uploadCloud.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const coverImageUrl = req.files && req.files['coverImage'] ? req.files['coverImage'][0].path : '';
        const galleryUrls = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const videoUrl = req.files && req.files['videoFile'] ? req.files['videoFile'][0].path : '';

        if (!coverImageUrl) {
            return res.status(400).json({ success: false, message: "Cover image is required!" });
        }

        const newProject = new Project({
            title: req.body.title,
            category: req.body.category,
            description: req.body.description || '',
            featured: req.body.featured === 'true' || req.body.featured === true,
            coverImage: coverImageUrl,
            images: galleryUrls,
            videoUrl: videoUrl || req.body.videoUrl || '',
            client: req.body.client || '',
            location: req.body.location || '',
            year: req.body.year || '',
            scale: req.body.scale || ''
        });

        await newProject.save();
        res.json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৪. Project Update / Change Kora (🌟 Full Fixed)
router.put("/:id", uploadCloud.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const existingProject = await Project.findById(req.params.id);
        if (!existingProject) return res.status(404).json({ success: false, message: "Project not found" });

        let coverImageUrl = existingProject.coverImage;
        if (req.files && req.files['coverImage']) {
            coverImageUrl = req.files['coverImage'][0].path;
        }

        let galleryUrls = existingProject.images;
        if (req.files && req.files['images']) {
            galleryUrls = req.files['images'].map(file => file.path);
        }

        let videoUrl = existingProject.videoUrl;
        if (req.files && req.files['videoFile']) {
            videoUrl = req.files['videoFile'][0].path;
        } else if (req.body.videoUrl !== undefined) {
            videoUrl = req.body.videoUrl;
        }

        const updatedData = {
            title: req.body.title || existingProject.title,
            category: req.body.category || existingProject.category,
            description: req.body.description !== undefined ? req.body.description : existingProject.description,
            featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existingProject.featured,
            coverImage: coverImageUrl,
            images: galleryUrls,
            videoUrl: videoUrl,
            client: req.body.client !== undefined ? req.body.client : existingProject.client,
            location: req.body.location !== undefined ? req.body.location : existingProject.location,
            year: req.body.year !== undefined ? req.body.year : existingProject.year,
            scale: req.body.scale !== undefined ? req.body.scale : existingProject.scale
        };

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json({ success: true, data: updatedProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৫. Delete route
router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;