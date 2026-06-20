import express from "express";
import Project from "../models/project.model.js";
import uploadCloud from "../config/cloudinaryConfig.js"; // 🌟 [ফিক্সড পাথ] আপনার ফাইলটি config ফোল্ডারে আছে

const router = express.Router();

// ১. সব প্রজেক্ট নিয়ে আসা
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ২. নতুন প্রজেক্ট তৈরি করা (Create Project)
router.post("/", uploadCloud.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
    try {
        // ফাইল থাকলে ক্লাউডিনারি পাথ আসবে, না থাকলে খালি থাকবে
        const coverImageUrl = req.files && req.files['coverImage'] ? req.files['coverImage'][0].path : '';
        const galleryUrls = req.files && req.files['images'] ? req.files['images'].map(file => file.path) : [];
        const videoUrl = req.files && req.files['videoFile'] ? req.files['videoFile'][0].path : '';

        // ভ্যালিডেশন চেক: মডেলে কাভার ইমেজ রিকোয়ার্ড (required: true) করা আছে
        if (!coverImageUrl) {
            return res.status(400).json({ success: false, message: "Cover image is required!" });
        }

        const projectData = {
            title: req.body.title,
            category: req.body.category,
            description: req.body.description || '',
            videoUrl: videoUrl || req.body.videoUrl || '', // সরাসরি ফাইল না থাকলে লিঙ্ক ব্যাকআপ হিসেবে কাজ করবে
            featured: req.body.featured === 'true' || req.body.featured === true,
            coverImage: coverImageUrl,
            images: galleryUrls
        };

        const newProject = new Project(projectData);
        await newProject.save();
        res.json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৩. প্রজেক্ট আপডেট বা এডিট করা (Update Project)
router.put("/:id", uploadCloud.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const existingProject = await Project.findById(req.params.id);
        if (!existingProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

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
            videoUrl: videoUrl,
            featured: req.body.featured !== undefined ? (req.body.featured === 'true' || req.body.featured === true) : existingProject.featured,
            coverImage: coverImageUrl,
            images: galleryUrls
        };

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json({ success: true, data: updatedProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৪. প্রজেক্ট ডিলিট করা
router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;