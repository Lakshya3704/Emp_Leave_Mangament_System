import Leave from "../models/Leave.js";
import LeaveBalance from "../models/LeaveBalance.js";

// ============ EMPLOYEE CONTROLLERS ============

// @desc    Apply for leave
// @route   POST /api/leaves
export const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay,
      halfDayType,
      emergencyContact,
    } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Leave type, start date, and reason are required",
      });
    }

    // Check for overlapping leaves
    const actualEndDate = isHalfDay ? startDate : endDate;
    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startDate: { $lte: new Date(actualEndDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for these dates",
      });
    }

    // Check leave balance
    const currentYear = new Date().getFullYear();
    let balance = await LeaveBalance.findOne({
      employee: req.user._id,
      year: currentYear,
    });

    if (!balance) {
      // Create default balance if not exists
      balance = await LeaveBalance.create({
        employee: req.user._id,
        year: currentYear,
      });
    }

    // Calculate days
    let totalDays;
    if (isHalfDay) {
      totalDays = 0.5;
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate || startDate);
      let count = 0;
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
      }
      totalDays = count;
    }

    // Check available balance
    const available = balance.getAvailable(leaveType);
    if (totalDays > available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${available} days, Requested: ${totalDays} days`,
      });
    }

    // Create leave
    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayType: isHalfDay ? halfDayType : null,
      emergencyContact,
      totalDays,
    });

    // Update pending count in balance
    balance[leaveType].pending += totalDays;
    await balance.save();

    await leave.populate(
      "employee",
      "firstName lastName email employeeId department",
    );

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
export const getMyLeaves = async (req, res) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;

    let query = { employee: req.user._id };
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my leave balance
// @route   GET /api/leaves/my-balance
export const getMyLeaveBalance = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    let balance = await LeaveBalance.findOne({
      employee: req.user._id,
      year: currentYear,
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee: req.user._id,
        year: currentYear,
      });
    }

    const summary = balance.getSummary();

    res.json({
      success: true,
      data: {
        balance,
        summary,
        year: currentYear,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel my leave
// @route   PUT /api/leaves/:id/cancel
export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!["pending", "approved"].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: "Can only cancel pending or approved leaves",
      });
    }

    const previousStatus = leave.status;
    leave.status = "cancelled";
    await leave.save();

    // Update leave balance
    const currentYear = new Date(leave.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: req.user._id,
      year: currentYear,
    });

    if (balance) {
      if (previousStatus === "pending") {
        balance[leave.leaveType].pending = Math.max(
          0,
          balance[leave.leaveType].pending - leave.totalDays,
        );
      } else if (previousStatus === "approved") {
        balance[leave.leaveType].used = Math.max(
          0,
          balance[leave.leaveType].used - leave.totalDays,
        );
      }
      await balance.save();
    }

    res.json({
      success: true,
      message: "Leave cancelled successfully",
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave stats for employee
// @route   GET /api/leaves/my-stats
export const getMyLeaveStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Leave counts by status
    const statusStats = await Leave.aggregate([
      {
        $match: {
          employee: req.user._id,
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
    ]);

    // Leave counts by type
    const typeStats = await Leave.aggregate([
      {
        $match: {
          employee: req.user._id,
          status: { $in: ["approved", "pending"] },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
    ]);

    // Upcoming leaves
    const upcomingLeaves = await Leave.find({
      employee: req.user._id,
      status: "approved",
      startDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(5);

    // Get balance
    let balance = await LeaveBalance.findOne({
      employee: req.user._id,
      year: currentYear,
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee: req.user._id,
        year: currentYear,
      });
    }

    res.json({
      success: true,
      data: {
        statusStats,
        typeStats,
        upcomingLeaves,
        balance: balance.getSummary(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN CONTROLLERS ============

// @desc    Get all leaves (admin)
// @route   GET /api/leaves/all
export const getAllLeaves = async (req, res) => {
  try {
    const {
      status,
      leaveType,
      employee,
      department,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employee) query.employee = employee;

    // If department filter, find employees first
    if (department) {
      const User = (await import("../models/User.js")).default;
      const employeeIds = await User.find({ department }).distinct("_id");
      query.employee = { $in: employeeIds };
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate(
        "employee",
        "firstName lastName email employeeId department designation",
      )
      .populate("reviewedBy", "firstName lastName")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review leave (approve/reject)
// @route   PUT /api/leaves/:id/review
export const reviewLeave = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only review pending leaves",
      });
    }

    // Update leave balance
    const leaveYear = new Date(leave.startDate).getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: leave.employee,
      year: leaveYear,
    });

    if (balance) {
      // Remove from pending
      balance[leave.leaveType].pending = Math.max(
        0,
        balance[leave.leaveType].pending - leave.totalDays,
      );

      if (status === "approved") {
        // Add to used
        balance[leave.leaveType].used += leave.totalDays;
      }
      await balance.save();
    }

    // Update leave
    leave.status = status;
    leave.adminRemarks = adminRemarks || "";
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    await leave.populate(
      "employee",
      "firstName lastName email employeeId department",
    );
    await leave.populate("reviewedBy", "firstName lastName");

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave dashboard stats (admin)
// @route   GET /api/leaves/dashboard-stats
export const getLeaveDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const totalLeaves = await Leave.countDocuments({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });

    const pendingLeaves = await Leave.countDocuments({ status: "pending" });
    const approvedLeaves = await Leave.countDocuments({
      status: "approved",
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });
    const rejectedLeaves = await Leave.countDocuments({
      status: "rejected",
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });

    // By leave type
    const byType = await Leave.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // By department
    const byDepartment = await Leave.aggregate([
      {
        $match: {
          status: "approved",
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "emp",
        },
      },
      { $unwind: "$emp" },
      {
        $group: {
          _id: "$emp.department",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { totalDays: -1 } },
    ]);

    // Employees on leave today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const onLeaveToday = await Leave.find({
      status: "approved",
      startDate: { $lte: todayEnd },
      endDate: { $gte: today },
    }).populate(
      "employee",
      "firstName lastName employeeId department designation",
    );

    // Recent leave requests
    const recentLeaves = await Leave.find()
      .populate("employee", "firstName lastName employeeId department")
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly trend
    const monthlyTrend = await Leave.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        byType,
        byDepartment,
        onLeaveToday,
        recentLeaves,
        monthlyTrend,
        year: currentYear,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single leave detail
// @route   GET /api/leaves/:id
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate(
        "employee",
        "firstName lastName email employeeId department designation phone",
      )
      .populate("reviewedBy", "firstName lastName email");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    // Employee can only view own leaves
    if (
      req.user.role === "employee" &&
      leave.employee._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this leave",
      });
    }

    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
