import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMyLeavesAPI,
  getMyLeaveBalanceAPI,
  cancelLeaveAPI,
} from "../../services/api";
import StatusBadge from "../../components/Common/StatusBadge";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlinePlusCircle,
  HiOutlineEye,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineClock,
} from "react-icons/hi";
import styles from "./MyLeaves.module.css";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchBalance();
  }, [statusFilter, typeFilter, pagination.page]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeavesAPI({
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

  const fetchBalance = async () => {
    try {
      const res = await getMyLeaveBalanceAPI();
      setBalance(res.data.data);
    } catch (error) {
      console.error("Balance error:", error);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this leave?")) {
      try {
        await cancelLeaveAPI(id);
        toast.success("Leave cancelled successfully");
        fetchLeaves();
        fetchBalance();
      } catch (error) {
        toast.error(error.response?.data?.message || "Cancel failed");
      }
    }
  };

  const leaveTypeLabels = {
    casual: "Casual Leave",
    sick: "Sick Leave",
    earned: "Earned Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    unpaid: "Unpaid Leave",
    compensatory: "Comp Off",
    bereavement: "Bereavement",
  };

  const leaveTypeEmoji = {
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
      year: "numeric",
    });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Leaves</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} leave requests total
          </p>
        </div>
        <Link
          to="/employee/apply-leave"
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlusCircle size={18} />
          Apply Leave
        </Link>
      </div>

      {/* Balance Cards */}
      {balance?.summary && (
        <div className={styles.balanceRow}>
          {balance.summary
            .filter(
              (b) =>
                !["maternity", "paternity", "bereavement", "unpaid"].includes(
                  b.type,
                ),
            )
            .map((b) => (
              <div key={b.type} className={styles.miniBalance}>
                <span className="text-sm">{leaveTypeEmoji[b.type]}</span>
                <div>
                  <p className="text-xs text-gray-500 capitalize">{b.type}</p>
                  <p className="text-sm font-bold text-gray-800">
                    {b.available}
                    <span className="text-xs font-normal text-gray-400">
                      /{b.total}
                    </span>
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <HiOutlineFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="input-field"
            >
              <option value="">All Types</option>
              {Object.entries(leaveTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leave List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card text-center py-8 text-gray-400">Loading...</div>
        ) : leaves.length === 0 ? (
          <div className="card text-center py-12">
            <HiOutlineCalendar
              size={40}
              className="text-gray-300 mx-auto mb-3"
            />
            <p className="text-gray-400 mb-2">No leave requests found</p>
            <Link
              to="/employee/apply-leave"
              className="text-primary-600 hover:underline text-sm"
            >
              Apply for leave
            </Link>
          </div>
        ) : (
          leaves.map((leave) => (
            <div key={leave._id} className={styles.leaveCard}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">
                      {leaveTypeEmoji[leave.leaveType]}
                    </span>
                    <h3 className="font-semibold text-gray-800">
                      {leaveTypeLabels[leave.leaveType]}
                    </h3>
                    <StatusBadge status={leave.status} />
                    {leave.isHalfDay && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Half Day
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                    {leave.reason}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <HiOutlineCalendar size={14} />
                      {formatDate(leave.startDate)}
                      {leave.startDate !== leave.endDate &&
                        ` - ${formatDate(leave.endDate)}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineClock size={14} />
                      {leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}
                    </span>
                    <span>Applied: {formatDate(leave.createdAt)}</span>
                  </div>
                  {leave.adminRemarks && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <span className="font-medium">Admin: </span>
                      {leave.adminRemarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-4">
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
                  {["pending", "approved"].includes(leave.status) && (
                    <button
                      onClick={() => handleCancel(leave._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                      title="Cancel"
                    >
                      <HiOutlineXCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {leaveTypeEmoji[selectedLeave.leaveType]}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {leaveTypeLabels[selectedLeave.leaveType]}
                </h3>
                <StatusBadge status={selectedLeave.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selectedLeave.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">End Date</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selectedLeave.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Days</p>
                <p className="text-xl font-bold text-gray-800">
                  {selectedLeave.totalDays}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Half Day</p>
                <p className="font-medium text-gray-800">
                  {selectedLeave.isHalfDay
                    ? selectedLeave.halfDayType === "first_half"
                      ? "First Half"
                      : "Second Half"
                    : "No"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-gray-600">{selectedLeave.reason}</p>
            </div>

            {selectedLeave.emergencyContact && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Emergency Contact</p>
                <p className="text-gray-600">
                  {selectedLeave.emergencyContact}
                </p>
              </div>
            )}

            {selectedLeave.adminRemarks && (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-500">
                <p className="text-xs text-gray-400 mb-1">Admin Remarks</p>
                <p className="text-gray-700">{selectedLeave.adminRemarks}</p>
                {selectedLeave.reviewedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Reviewed on {formatDate(selectedLeave.reviewedAt)}
                    {selectedLeave.reviewedBy &&
                      ` by ${selectedLeave.reviewedBy.firstName} ${selectedLeave.reviewedBy.lastName}`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyLeaves;
