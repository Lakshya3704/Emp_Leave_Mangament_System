import express from "express";
import {
  login,
  registerEmployee,
  registerAdmin,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/register", registerEmployee);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Admin only - register another admin
router.post("/register-admin", protect, authorize("admin"), registerAdmin);

export default router;
