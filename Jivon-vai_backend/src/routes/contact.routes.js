import express from "express";
import {
  createContact,
  getContacts,
  deleteContact,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/send-email", createContact);
router.get("/contacts", getContacts);
router.delete("/contacts/:id", deleteContact);

export default router;