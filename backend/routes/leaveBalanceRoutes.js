import express from "express";
import {
  getAllLeaveBalances,
  updateLeaveBalance,
  resetLeaveBalances,
  getEmployeeBalance,
} from "../controllers/leaveBalanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getAllLeaveBalances);
router.post("/reset", resetLeaveBalances);
router.get("/:employeeId", getEmployeeBalance);
router.put("/:employeeId", updateLeaveBalance);

export default router;
