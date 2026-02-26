import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Reimbursement from "../models/Reimbursement.js";
import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Drop stale indexes that may conflict
    try {
      await mongoose.connection
        .collection("leaves")
        .dropIndex("referenceNumber_1");
    } catch (_) {
      // Index may not exist, ignore
    }

    // Clear existing data
    await User.deleteMany({});
    await Reimbursement.deleteMany({});
    await Leave.deleteMany({});
    await LeaveBalance.deleteMany({});

    // Create admin
    const admin = await User.create({
      name: "Admin User",
      email: "admin@company.com",
      password: "admin123",
      role: "admin",
      department: "HR",
      designation: "System Administrator",
      phone: "9999999999",
      employeeId: "ADM00001",
    });

    // Create employees
    const employees = await User.create([
      {
        name: "Rahul Sharma",
        email: "rahul@company.com",
        password: "employee123",
        role: "employee",
        department: "Engineering",
        designation: "Software Developer",
        phone: "9876543210",
        employeeId: "EMP00001",
      },
      {
        name: "Priya Patel",
        email: "priya@company.com",
        password: "employee123",
        role: "employee",
        department: "Marketing",
        designation: "Marketing Manager",
        phone: "9876543211",
        employeeId: "EMP00002",
      },
      {
        name: "Amit Kumar",
        email: "amit@company.com",
        password: "employee123",
        role: "employee",
        department: "Sales",
        designation: "Sales Executive",
        phone: "9876543212",
        employeeId: "EMP00003",
      },
      {
        name: "Sneha Gupta",
        email: "sneha@company.com",
        password: "employee123",
        role: "employee",
        department: "HR",
        designation: "HR Specialist",
        phone: "9876543213",
        employeeId: "EMP00004",
      },
    ]);

    // Create leave balances for current year
    const currentYear = new Date().getFullYear();

    const leaveBalances = await LeaveBalance.create([
      {
        employee: employees[0]._id,
        year: currentYear,
        casual: { total: 12, used: 3, pending: 1 },
        sick: { total: 10, used: 2, pending: 0 },
        earned: { total: 15, used: 0, pending: 0 },
      },
      {
        employee: employees[1]._id,
        year: currentYear,
        casual: { total: 12, used: 1, pending: 0 },
        sick: { total: 10, used: 0, pending: 1 },
        earned: { total: 15, used: 2, pending: 0 },
      },
      {
        employee: employees[2]._id,
        year: currentYear,
        casual: { total: 12, used: 4, pending: 0 },
        sick: { total: 10, used: 1, pending: 0 },
        earned: { total: 15, used: 3, pending: 2 },
      },
      {
        employee: employees[3]._id,
        year: currentYear,
        casual: { total: 12, used: 2, pending: 0 },
        sick: { total: 10, used: 3, pending: 0 },
        earned: { total: 15, used: 1, pending: 0 },
      },
    ]);

    // Create sample leaves
    const leaves = await Leave.create([
      {
        employee: employees[0]._id,
        leaveType: "casual",
        startDate: new Date("2024-11-25"),
        endDate: new Date("2024-11-27"),
        totalDays: 3,
        reason: "Family function - cousin wedding in Jaipur",
        status: "approved",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        adminRemarks: "Approved. Enjoy!",
      },
      {
        employee: employees[0]._id,
        leaveType: "casual",
        startDate: new Date("2024-12-24"),
        endDate: new Date("2024-12-24"),
        totalDays: 1,
        reason: "Christmas eve preparation",
        status: "pending",
      },
      {
        employee: employees[0]._id,
        leaveType: "sick",
        startDate: new Date("2024-10-15"),
        endDate: new Date("2024-10-16"),
        totalDays: 2,
        reason: "Fever and cold",
        status: "approved",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        adminRemarks: "Get well soon",
      },
      {
        employee: employees[1]._id,
        leaveType: "sick",
        startDate: new Date("2024-12-20"),
        endDate: new Date("2024-12-20"),
        totalDays: 1,
        isHalfDay: true,
        halfDayType: "first_half",
        reason: "Doctor appointment for routine checkup",
        status: "pending",
      },
      {
        employee: employees[1]._id,
        leaveType: "earned",
        startDate: new Date("2024-11-11"),
        endDate: new Date("2024-11-12"),
        totalDays: 2,
        reason: "Short vacation to Goa",
        status: "approved",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        adminRemarks: "Approved",
      },
      {
        employee: employees[2]._id,
        leaveType: "casual",
        startDate: new Date("2024-12-30"),
        endDate: new Date("2024-12-31"),
        totalDays: 2,
        reason: "New Year celebration with family",
        status: "pending",
      },
      {
        employee: employees[2]._id,
        leaveType: "earned",
        startDate: new Date("2024-10-21"),
        endDate: new Date("2024-10-25"),
        totalDays: 5,
        reason: "Annual family trip to Shimla",
        status: "rejected",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        adminRemarks: "Quarter end - critical sales period. Please reschedule.",
      },
      {
        employee: employees[3]._id,
        leaveType: "sick",
        startDate: new Date("2024-11-05"),
        endDate: new Date("2024-11-07"),
        totalDays: 3,
        reason: "Severe migraine and doctor advised rest",
        status: "approved",
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        adminRemarks: "Take care. Approved.",
      },
    ]);

    console.log("\n✅ Database seeded successfully!");
    console.log("─────────────────────────────────");
    console.log("Admin Login  : admin@company.com / admin123");
    console.log("Employee Login: rahul@company.com / employee123");
    console.log("Employee Login: priya@company.com / employee123");
    console.log("─────────────────────────────────");
    console.log(`Created: 1 admin, ${employees.length} employees`);
    console.log(`Created: ${leaveBalances.length} leave balances`);
    console.log(`Created: ${leaves.length} sample leaves`);
    console.log("─────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDB();
