import mongoose from "mongoose";

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    casual: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    sick: {
      total: { type: Number, default: 10 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    earned: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    maternity: {
      total: { type: Number, default: 180 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    paternity: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    unpaid: {
      total: { type: Number, default: 365 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    compensatory: {
      total: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    bereavement: {
      total: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Unique constraint: one balance per employee per year
leaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

// Virtual: available balance per type
leaveBalanceSchema.methods.getAvailable = function (leaveType) {
  if (!this[leaveType]) return 0;
  return this[leaveType].total - this[leaveType].used - this[leaveType].pending;
};

// Virtual: get full summary
leaveBalanceSchema.methods.getSummary = function () {
  const types = [
    "casual",
    "sick",
    "earned",
    "maternity",
    "paternity",
    "unpaid",
    "compensatory",
    "bereavement",
  ];

  return types.map((type) => ({
    type,
    total: this[type].total,
    used: this[type].used,
    pending: this[type].pending,
    available: this[type].total - this[type].used - this[type].pending,
  }));
};

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
export default LeaveBalance;
