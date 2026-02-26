import LeaveBalance from "../models/LeaveBalance.js";
import User from "../models/User.js";

// @desc    Get all employee leave balances (admin)
// @route   GET /api/leave-balances
export const getAllLeaveBalances = async (req, res) => {
  try {
    const { year, department, search, page = 1, limit = 10 } = req.query;

    const currentYear = year || new Date().getFullYear();

    // Find matching employees
    let employeeQuery = { role: "employee", isActive: true };

    if (department) employeeQuery.department = department;
    if (search) {
      employeeQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await User.find(employeeQuery)
      .sort({ firstName: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(employeeQuery);

    // Get balances for these employees
    const balances = await Promise.all(
      employees.map(async (emp) => {
        let balance = await LeaveBalance.findOne({
          employee: emp._id,
          year: parseInt(currentYear),
        });

        if (!balance) {
          balance = await LeaveBalance.create({
            employee: emp._id,
            year: parseInt(currentYear),
          });
        }

        return {
          employee: {
            _id: emp._id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            fullName: emp.fullName,
            email: emp.email,
            employeeId: emp.employeeId,
            department: emp.department,
            designation: emp.designation,
          },
          balance: balance.getSummary(),
          balanceId: balance._id,
          year: parseInt(currentYear),
        };
      }),
    );

    res.json({
      success: true,
      data: balances,
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

// @desc    Update employee leave balance (admin)
// @route   PUT /api/leave-balances/:employeeId
export const updateLeaveBalance = async (req, res) => {
  try {
    const { year, leaveType, total } = req.body;
    const currentYear = year || new Date().getFullYear();

    let balance = await LeaveBalance.findOne({
      employee: req.params.employeeId,
      year: currentYear,
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee: req.params.employeeId,
        year: currentYear,
      });
    }

    if (leaveType && total !== undefined) {
      if (!balance[leaveType]) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave type",
        });
      }
      balance[leaveType].total = total;
    }

    // Bulk update if multiple types sent
    if (req.body.balances) {
      for (const item of req.body.balances) {
        if (balance[item.type]) {
          balance[item.type].total = item.total;
        }
      }
    }

    await balance.save();

    res.json({
      success: true,
      message: "Leave balance updated successfully",
      data: {
        balance: balance.getSummary(),
        balanceId: balance._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset all leave balances for new year (admin)
// @route   POST /api/leave-balances/reset
export const resetLeaveBalances = async (req, res) => {
  try {
    const { year } = req.body;
    const targetYear = year || new Date().getFullYear();

    const employees = await User.find({
      role: "employee",
      isActive: true,
    });

    let created = 0;
    let skipped = 0;

    for (const emp of employees) {
      const existing = await LeaveBalance.findOne({
        employee: emp._id,
        year: targetYear,
      });

      if (!existing) {
        await LeaveBalance.create({
          employee: emp._id,
          year: targetYear,
        });
        created++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Leave balances reset for ${targetYear}. Created: ${created}, Already existed: ${skipped}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee balance (admin)
// @route   GET /api/leave-balances/:employeeId
export const getEmployeeBalance = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const employee = await User.findById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    let balance = await LeaveBalance.findOne({
      employee: req.params.employeeId,
      year: parseInt(currentYear),
    });

    if (!balance) {
      balance = await LeaveBalance.create({
        employee: req.params.employeeId,
        year: parseInt(currentYear),
      });
    }

    res.json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          fullName: employee.fullName,
          email: employee.email,
          employeeId: employee.employeeId,
          department: employee.department,
        },
        balance: balance.getSummary(),
        balanceId: balance._id,
        year: parseInt(currentYear),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
