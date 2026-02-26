const statusConfig = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    label: "Pending",
  },
  approved: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
    label: "Rejected",
  },
  cancelled: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: "Cancelled",
  },
  under_review: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    label: "Under Review",
  },
  paid: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    label: "Paid",
  },
  processing: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-500",
    label: "Processing",
  },
  unpaid: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    dot: "bg-gray-500",
    label: "Unpaid",
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
