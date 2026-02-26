import express from "express";
import {
  createReimbursement,
  getMyReimbursements,
  getReimbursement,
  updateReimbursement,
  deleteReimbursement,
  getAllReimbursements,
  reviewReimbursement,
  getMyStats,
} from "../controllers/reimbursementController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

// Employee routes
router.post(
  "/",
  authorize("employee"),
  upload.single("receipt"),
  createReimbursement,
);
router.get("/my", authorize("employee"), getMyReimbursements);
router.get("/my-stats", authorize("employee"), getMyStats);
router.put(
  "/:id",
  authorize("employee"),
  upload.single("receipt"),
  updateReimbursement,
);
router.delete("/:id", authorize("employee"), deleteReimbursement);

// Admin routes
router.get("/all", authorize("admin"), getAllReimbursements);
router.put("/:id/review", authorize("admin"), reviewReimbursement);

// Shared
router.get("/:id", getReimbursement);

export default router;
