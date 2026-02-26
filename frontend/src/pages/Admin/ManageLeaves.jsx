import { useState, useEffect } from "react";
import {
  getAllLeavesAPI,
  reviewLeaveAPI,
  getLeaveDashboardStatsAPI,
} from "../../services/api";
import StatusBadge from "../../components/Common/StatusBadge";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import styles from "./ManageLeaves.module.css";

const ManageLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "",
    adminRemarks: "",
  });

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, [statusFilter, typeFilter, pagination.page]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getAllLeavesAPI({
        status: statusFilter,
        leaveType: typeFilter,
        page: pagination.page,
        limit: 10,
      });
      setLeaves(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getLeaveDashboardStatsAPI();
      setStats(res.data.data);
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewLeaveAPI(selectedLeave._id, reviewForm);
      toast.success(`Leave ${reviewForm.status} successfully`);
      setShowReview(false);
      setSelectedLeave(null);
      fetchLeaves();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Review failed");
    }
  };

  const openReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewForm({ status: action, adminRemarks: "" });
    setShowReview(true);
  };

  const leaveTypeLabels = {
    casual: "Casual",
    sick: "Sick",
    earned: "Earned",
    maternity: "Maternity",
    paternity: "Paternity",
    unpaid: "Unpaid",
    compensatory: "Comp Off",
    bereavement: "Bereavement",
  };

  const leaveEmoji = {
    casual: "🏖️",
    sick: "🤒",
    earned: "⭐",
    maternity: "🤱",
    paternity: "👨‍👧",
    unpaid: "📋",
    compensatory: "🔄",
    bereavement: "🕊️",
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Leaves</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and manage employee leave requests
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
              <HiOutlineClock size={20} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.pendingLeaves}
            </h3>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className={styles.statCard}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
              <HiOutlineCheckCircle size={20} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.approvedLeaves}
            </h3>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <div className={styles.statCard}>
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-2">
              <HiOutlineXCircle size={20} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.rejectedLeaves}
            </h3>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
          <div className={styles.statCard}>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
              <HiOutlineUsers size={20} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.onLeaveToday?.length || 0}
            </h3>
            <p className="text-sm text-gray-500">On Leave Today</p>
          </div>
          <div className={styles.statCard}>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
              <HiOutlineTrendingUp size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.totalLeaves}
            </h3>
            <p className="text-sm text-gray-500">Total ({stats.year})</p>
          </div>
        </div>
      )}

      {/* On Leave Today */}
      {stats?.onLeaveToday?.length > 0 && (
        <div className="card mb-6 mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Employees on Leave Today
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.onLeaveToday.map((leave) => (
              <span
                key={leave._id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
              >
                {leave.employee?.firstName} {leave.employee?.lastName}
                <span className="text-blue-400">
                  ({leave.employee?.department})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="input-field flex-1"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="input-field flex-1"
          >
            <option value="">All Leave Types</option>
            {Object.entries(leaveTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 pl-4 font-medium">Employee</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Dates</th>
                <th className="pb-3 font-medium">Days</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    No leaves found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3.5 pl-4">
                      <div>
                        <p className="font-medium text-gray-700">
                          {leave.employee?.firstName} {leave.employee?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {leave.employee?.employeeId} •{" "}
                          {leave.employee?.department}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {leaveEmoji[leave.leaveType]}{" "}
                        {leaveTypeLabels[leave.leaveType]}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-gray-600">
                      {formatDate(leave.startDate)}
                      {leave.startDate !== leave.endDate &&
                        ` - ${formatDate(leave.endDate)}`}
                    </td>
                    <td className="py-3.5 font-semibold text-gray-800">
                      {leave.totalDays}
                      {leave.isHalfDay && (
                        <span className="text-xs text-purple-500 ml-1">½</span>
                      )}
                    </td>
                    <td className="py-3.5 text-gray-500 max-w-[150px] truncate text-xs">
                      {leave.reason}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowDetail(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                          title="View"
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        {leave.status === "pending" && (
                          <>
                            <button
                              onClick={() => openReview(leave, "approved")}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600"
                              title="Approve"
                            >
                              <HiOutlineCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openReview(leave, "rejected")}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                              title="Reject"
                            >
                              <HiOutlineXCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
              total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedLeave(null);
        }}
        title="Leave Details"
        size="lg"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Employee</p>
                <p className="font-medium text-gray-800">
                  {selectedLeave.employee?.firstName}{" "}
                  {selectedLeave.employee?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedLeave.employee?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Department</p>
                <p className="font-medium text-gray-800">
                  {selectedLeave.employee?.department}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedLeave.employee?.employeeId}
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Leave Type</p>
                <p className="font-medium text-gray-800">
                  {leaveEmoji[selectedLeave.leaveType]}{" "}
                  {leaveTypeLabels[selectedLeave.leaveType]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Duration</p>
                <p className="text-xl font-bold text-gray-800">
                  {selectedLeave.totalDays} day
                  {selectedLeave.totalDays !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <StatusBadge status={selectedLeave.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                <p className="text-gray-800">
                  {new Date(selectedLeave.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">End Date</p>
                <p className="text-gray-800">
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-gray-600">{selectedLeave.reason}</p>
            </div>

            {selectedLeave.adminRemarks && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Admin Remarks</p>
                <p className="text-gray-700">{selectedLeave.adminRemarks}</p>
              </div>
            )}

            {selectedLeave.status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    openReview(selectedLeave, "approved");
                  }}
                  className="btn-success flex items-center gap-2 flex-1"
                >
                  <HiOutlineCheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    openReview(selectedLeave, "rejected");
                  }}
                  className="btn-danger flex items-center gap-2 flex-1"
                >
                  <HiOutlineXCircle size={18} /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReview}
        onClose={() => {
          setShowReview(false);
          setSelectedLeave(null);
        }}
        title={`${
          reviewForm.status === "approved" ? "Approve" : "Reject"
        } Leave`}
        size="md"
      >
        {selectedLeave && (
          <form onSubmit={handleReview} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-800">
                {leaveEmoji[selectedLeave.leaveType]}{" "}
                {leaveTypeLabels[selectedLeave.leaveType]} -{" "}
                {selectedLeave.totalDays} day(s)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                By {selectedLeave.employee?.firstName}{" "}
                {selectedLeave.employee?.lastName} •{" "}
                {new Date(selectedLeave.startDate).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.endDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={reviewForm.status}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, status: e.target.value })
                }
                className="input-field"
                required
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={reviewForm.adminRemarks}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, adminRemarks: e.target.value })
                }
                className="input-field"
                rows="3"
                placeholder="Add remarks (optional)"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-lg font-medium text-white transition-colors ${
                  reviewForm.status === "approved"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Confirm{" "}
                {reviewForm.status === "approved" ? "Approval" : "Rejection"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReview(false);
                  setSelectedLeave(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageLeaves;
