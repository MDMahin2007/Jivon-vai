import express from "express";
import mongoose from "mongoose";
import Service from "../models/service.model.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const validateServiceInput = ({ title, description }) => {
    if (!title || title.trim().length < 2) return "Service title must be at least 2 characters.";
    if (!description || description.trim().length < 10) return "Service description must be at least 10 characters.";
    return null;
};

// ১. সব সার্ভিস নিয়ে আসা
router.get("/", async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ২. নতুন সার্ভিস তৈরি করা
router.post("/", protectAdmin, async (req, res) => {
    try {
        const validationError = validateServiceInput(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }
        const newService = new Service(req.body);
        await newService.save();
        res.json({ success: true, data: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৩. সার্ভিস এডিট করা
router.put("/:id", protectAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid service identifier." });
        }
        const validationError = validateServiceInput(req.body);
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৪. সার্ভিস ডিলিট করা
router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid service identifier." });
        }
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;