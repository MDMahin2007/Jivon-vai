import express from "express";
import Service from "../models/service.model.js";

const router = express.Router();

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
router.post("/", async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.json({ success: true, data: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৩. সার্ভিস এডিট করা
router.put("/:id", async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ৪. সার্ভিস ডিলিট করা
router.delete("/:id", async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;