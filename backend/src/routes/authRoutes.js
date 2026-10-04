import express from "express";
import {
  checkAdminExists,
  deleteCurrentAdmin,
  forgotPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  resetPassword,
} from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin-exists", checkAdminExists);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protectAdmin, getCurrentAdmin);
router.delete("/me", protectAdmin, deleteCurrentAdmin);
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
