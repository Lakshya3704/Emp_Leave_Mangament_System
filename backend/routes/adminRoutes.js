import express from "express";
import {
  getDashboardStats,
  getAllEmployees,
  getAllAdmins,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/employees", getAllEmployees);
router.get("/admins", getAllAdmins);
router.post("/employees", createEmployee);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

export default router;
