import mongoose from "mongoose";

const reimbursementSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "travel",
        "food",
        "accommodation",
        "equipment",
        "medical",
        "training",
        "office_supplies",
        "other",
      ],
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense date is required"],
    },
    receipt: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under_review"],
      default: "pending",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "paid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
reimbursementSchema.index({ employee: 1, status: 1 });
reimbursementSchema.index({ status: 1, createdAt: -1 });

const Reimbursement = mongoose.model("Reimbursement", reimbursementSchema);
export default Reimbursement;
