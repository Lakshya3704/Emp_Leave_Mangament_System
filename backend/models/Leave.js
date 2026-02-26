import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      required: [true, "Leave type is required"],
      enum: [
        "casual",
        "sick",
        "earned",
        "maternity",
        "paternity",
        "unpaid",
        "compensatory",
        "bereavement",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [0.5, "Minimum leave is half day"],
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    halfDayType: {
      type: String,
      enum: ["first_half", "second_half", null],
      default: null,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    adminRemarks: {
      type: String,
      default: "",
      maxlength: 500,
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
    appliedOn: {
      type: Date,
      default: Date.now,
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    attachments: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Validate end date >= start date
leaveSchema.pre("validate", function (next) {
  if (this.endDate < this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
  next();
});

// Calculate total days before saving
leaveSchema.pre("save", function (next) {
  if (this.isHalfDay) {
    this.totalDays = 0.5;
    this.endDate = this.startDate;
  } else if (this.isModified("startDate") || this.isModified("endDate")) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      // Skip weekends (Saturday=6, Sunday=0)
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    this.totalDays = count;
  }
  next();
});

// Indexes
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ status: 1, createdAt: -1 });
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
