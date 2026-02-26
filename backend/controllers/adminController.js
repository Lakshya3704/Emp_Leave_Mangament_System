import User from "../models/User.js";
import Reimbursement from "../models/Reimbursement.js";


export const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeEmployees = await User.countDocuments({
      role: "employee",
      isActive: true,
    });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalReimbursements = await Reimbursement.countDocuments();
    const pendingReimbursements = await Reimbursement.countDocuments({
      status: "pending",
    });
    const approvedReimbursements = await Reimbursement.countDocuments({
      status: "approved",
    });
    const rejectedReimbursements = await Reimbursement.countDocuments({
      status: "rejected",
    });

    const totalAmountResult = await Reimbursement.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalApprovedAmount = totalAmountResult[0]?.total || 0;

    const pendingAmountResult = await Reimbursement.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPendingAmount = pendingAmountResult[0]?.total || 0;

    const categoryBreakdown = await Reimbursement.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recentReimbursements = await Reimbursement.find()
      .populate("employee", "name email employeeId department")
      .sort({ createdAt: -1 })
      .limit(10);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Reimbursement.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalAdmins,
        totalReimbursements,
        pendingReimbursements,
        approvedReimbursements,
        rejectedReimbursements,
        totalApprovedAmount,
        totalPendingAmount,
        categoryBreakdown,
        recentReimbursements,
        monthlyTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
export const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    let query = { role: "employee" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (status) query.isActive = status === "active";

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: employees,
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

// @desc    Get all admins
// @route   GET /api/admin/admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: admins,
      total: admins.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/admin/employees
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, department, designation, phone } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "employee",
      department,
      designation,
      phone,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { name, email, department, designation, phone, isActive } = req.body;

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, designation, phone, isActive },
      { new: true, runValidators: true },
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete employee (soft)
// @route   DELETE /api/admin/employees/:id
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.isActive = false;
    await employee.save();

    res.json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
