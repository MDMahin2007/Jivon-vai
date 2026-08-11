import express from "express";
import {
  createContact,
  getContacts,
  deleteContact,
} from "../controllers/contact.controller.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-email", createContact);
router.get("/contacts", protectAdmin, getContacts);
router.delete("/contacts/:id", protectAdmin, deleteContact);

export default router;