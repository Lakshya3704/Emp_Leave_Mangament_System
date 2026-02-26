import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("employee"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

export default router;
