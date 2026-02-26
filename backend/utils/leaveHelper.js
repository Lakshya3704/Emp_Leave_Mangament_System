// Calculate business days between two dates (excluding weekends)
export const calculateBusinessDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Calculate total leave days based on dayType
export const calculateLeaveDays = (startDate, endDate, dayType) => {
  const businessDays = calculateBusinessDays(startDate, endDate);

  if (dayType === "first_half" || dayType === "second_half") {
    return businessDays > 0 ? businessDays - 0.5 : 0.5;
  }

  return businessDays;
};

// Check for overlapping leaves
export const checkOverlap = (existingLeaves, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return existingLeaves.some((leave) => {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);
    return start <= leaveEnd && end >= leaveStart;
  });
};

// Get leave type display name
export const getLeaveTypeLabel = (type) => {
  const labels = {
    casual: "Casual Leave",
    sick: "Sick Leave",
    annual: "Annual Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    unpaid: "Unpaid Leave",
    compensatory: "Compensatory Off",
    bereavement: "Bereavement Leave",
    marriage: "Marriage Leave",
    study: "Study Leave",
  };
  return labels[type] || type;
};
