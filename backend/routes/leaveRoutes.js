import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getMyLeaveBalance,
  getMyLeaveStats,
  cancelLeave,
  getAllLeaves,
  reviewLeave,
  getLeaveDashboardStats,
  getLeaveById,
} from "../controllers/leaveController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// ===== EMPLOYEE ROUTES =====
router.post(
  "/",
  authorize("employee", "manager"),
  upload.single("attachment"),
  applyLeave,
);
router.get("/my", authorize("employee", "manager"), getMyLeaves);
router.get("/my-balance", authorize("employee", "manager"), getMyLeaveBalance);
router.get("/my-stats", authorize("employee", "manager"), getMyLeaveStats);
router.put("/:id/cancel", authorize("employee", "manager"), cancelLeave);

// ===== ADMIN ROUTES =====
router.get("/all", authorize("admin", "manager"), getAllLeaves);
router.get(
  "/dashboard-stats",
  authorize("admin", "manager"),
  getLeaveDashboardStats,
);
router.put("/:id/review", authorize("admin", "manager"), reviewLeave);

// ===== SHARED =====
router.get("/:id", getLeaveById);

export default router;
