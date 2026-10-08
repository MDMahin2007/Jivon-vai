import express from "express";
import { createContact } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/send-email", createContact);
router.get("/test", (_req, res) => {
    res.json({ success: true, message: "Contact API is running." });
});

export default router;