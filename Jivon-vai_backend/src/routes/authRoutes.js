import express from "express";
import {
  checkAdminExists,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin-exists", checkAdminExists);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
