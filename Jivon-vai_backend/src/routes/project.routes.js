import express from "express";
import Project from "../models/project.model.js";

const router = express.Router();

// ১. সব প্রজেক্ট নিয়ে আসা
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ২. নতুন প্রজেক্ট তৈরি করা
router.post("/", async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৩. প্রজেক্ট আপডেট বা এডিট করা
router.put("/:id", async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
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