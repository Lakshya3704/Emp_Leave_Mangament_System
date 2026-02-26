import Reimbursement from "../models/Reimbursement.js";

// ============ EMPLOYEE CONTROLLERS ============

// @desc    Create reimbursement request
// @route   POST /api/reimbursements
export const createReimbursement = async (req, res) => {
  try {
    const { title, description, amount, category, expenseDate } = req.body;

    const reimbursement = await Reimbursement.create({
      employee: req.user._id,
      title,
      description,
      amount,
      category,
      expenseDate,
      receipt: req.file ? req.file.filename : "",
    });

    await reimbursement.populate(
      "employee",
      "name email employeeId department",
    );

    res.status(201).json({
      success: true,
      data: reimbursement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my reimbursements (employee)
// @route   GET /api/reimbursements/my
export const getMyReimbursements = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    let query = { employee: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Reimbursement.countDocuments(query);
    const reimbursements = await Reimbursement.find(query)
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Stats for employee dashboard
    const stats = await Reimbursement.aggregate([
      { $match: { employee: req.user._id } },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: reimbursements,
      stats,
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

// @desc    Get single reimbursement
// @route   GET /api/reimbursements/:id
export const getReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findById(req.params.id)
      .populate("employee", "name email employeeId department designation")
      .populate("reviewedBy", "name email");

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement not found",
      });
    }

    // Check ownership if employee
    if (
      req.user.role === "employee" &&
      reimbursement.employee._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this reimbursement",
      });
    }

    res.json({ success: true, data: reimbursement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reimbursement (employee, only if pending)
// @route   PUT /api/reimbursements/:id
export const updateReimbursement = async (req, res) => {
  try {
    let reimbursement = await Reimbursement.findById(req.params.id);

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement not found",
      });
    }

    if (reimbursement.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (reimbursement.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only edit pending reimbursements",
      });
    }

    const { title, description, amount, category, expenseDate } = req.body;

    reimbursement = await Reimbursement.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        amount,
        category,
        expenseDate,
        receipt: req.file ? req.file.filename : reimbursement.receipt,
      },
      { new: true, runValidators: true },
    ).populate("employee", "name email employeeId department");

    res.json({ success: true, data: reimbursement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete reimbursement (employee, only if pending)
// @route   DELETE /api/reimbursements/:id
export const deleteReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findById(req.params.id);

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement not found",
      });
    }

    if (reimbursement.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (reimbursement.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only delete pending reimbursements",
      });
    }

    await Reimbursement.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Reimbursement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN CONTROLLERS ============

// @desc    Get all reimbursements (admin)
// @route   GET /api/reimbursements/all
export const getAllReimbursements = async (req, res) => {
  try {
    const {
      status,
      category,
      employee,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (employee) query.employee = employee;

    const total = await Reimbursement.countDocuments(query);
    const reimbursements = await Reimbursement.find(query)
      .populate("employee", "name email employeeId department designation")
      .populate("reviewedBy", "name")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: reimbursements,
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

// @desc    Review reimbursement (approve/reject)
// @route   PUT /api/reimbursements/:id/review
export const reviewReimbursement = async (req, res) => {
  try {
    const { status, adminRemarks, paymentStatus } = req.body;

    if (!["approved", "rejected", "under_review"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const reimbursement = await Reimbursement.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminRemarks,
        paymentStatus:
          paymentStatus || (status === "approved" ? "processing" : "unpaid"),
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true },
    )
      .populate("employee", "name email employeeId department")
      .populate("reviewedBy", "name");

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: "Reimbursement not found",
      });
    }

    res.json({ success: true, data: reimbursement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get employee dashboard stats
// @route   GET /api/reimbursements/my-stats
export const getMyStats = async (req, res) => {
  try {
    const stats = await Reimbursement.aggregate([
      { $match: { employee: req.user._id } },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const recentClaims = await Reimbursement.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const categorySpending = await Reimbursement.aggregate([
      { $match: { employee: req.user._id, status: "approved" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: { stats, recentClaims, categorySpending },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
