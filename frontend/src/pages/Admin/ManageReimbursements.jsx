import { useState, useEffect } from "react";
import {
  getAllReimbursementsAPI,
  reviewReimbursementAPI,
} from "../../services/api";
import StatusBadge from "../../components/Common/StatusBadge";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineClock,
} from "react-icons/hi";
import styles from "./ManageReimbursements.module.css";

const ManageReimbursements = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "",
    adminRemarks: "",
  });

  useEffect(() => {
    fetchReimbursements();
  }, [statusFilter, categoryFilter, pagination.page]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const res = await getAllReimbursementsAPI({
        status: statusFilter,
        category: categoryFilter,
        page: pagination.page,
        limit: 10,
      });
      setReimbursements(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch reimbursements");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await reviewReimbursementAPI(selectedClaim._id, reviewForm);
      toast.success(`Claim ${reviewForm.status} successfully`);
      setShowReviewModal(false);
      setSelectedClaim(null);
      fetchReimbursements();
    } catch (error) {
      toast.error("Review failed");
    }
  };

  const openReviewModal = (claim, action) => {
    setSelectedClaim(claim);
    setReviewForm({ status: action, adminRemarks: "" });
    setShowReviewModal(true);
  };

  const categoryLabels = {
    travel: "Travel",
    food: "Food & Meals",
    accommodation: "Accommodation",
    equipment: "Equipment",
    medical: "Medical",
    training: "Training",
    office_supplies: "Office Supplies",
    other: "Other",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Reimbursements
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and process employee claims
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="input-field"
            >
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 pl-4 font-medium">Employee</th>
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
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
              ) : reimbursements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    No reimbursements found
                  </td>
                </tr>
              ) : (
                reimbursements.map((claim) => (
                  <tr
                    key={claim._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3.5 pl-4">
                      <div>
                        <p className="font-medium text-gray-700">
                          {claim.employee?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {claim.employee?.employeeId} •{" "}
                          {claim.employee?.department}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 text-gray-600 max-w-[200px] truncate">
                      {claim.title}
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {categoryLabels[claim.category]}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-gray-800">
                      ₹{claim.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-gray-500 text-xs">
                      {new Date(claim.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                          title="View Details"
                        >
                          <HiOutlineEye size={16} />
                        </button>
                        {(claim.status === "pending" ||
                          claim.status === "under_review") && (
                          <>
                            <button
                              onClick={() => openReviewModal(claim, "approved")}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                              title="Approve"
                            >
                              <HiOutlineCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openReviewModal(claim, "rejected")}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                              title="Reject"
                            >
                              <HiOutlineXCircle size={16} />
                            </button>
                            {claim.status === "pending" && (
                              <button
                                onClick={() =>
                                  openReviewModal(claim, "under_review")
                                }
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                                title="Mark Under Review"
                              >
                                <HiOutlineClock size={16} />
                              </button>
                            )}
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
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClaim(null);
        }}
        title="Claim Details"
        size="lg"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Employee</p>
                <p className="font-medium text-gray-800">
                  {selectedClaim.employee?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedClaim.employee?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Employee ID</p>
                <p className="font-medium text-gray-800">
                  {selectedClaim.employee?.employeeId}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedClaim.employee?.department}
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Title</p>
                <p className="font-medium text-gray-800">
                  {selectedClaim.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Amount</p>
                <p className="text-xl font-bold text-gray-800">
                  ₹{selectedClaim.amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-gray-600">{selectedClaim.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <p className="text-gray-800">
                  {categoryLabels[selectedClaim.category]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Expense Date</p>
                <p className="text-gray-800">
                  {new Date(selectedClaim.expenseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <StatusBadge status={selectedClaim.status} />
              </div>
            </div>

            {selectedClaim.receipt && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Receipt</p>
                <a
                  href={`http://localhost:5000/uploads/${selectedClaim.receipt}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm"
                >
                  View Receipt
                </a>
              </div>
            )}

            {selectedClaim.adminRemarks && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Admin Remarks</p>
                <p className="text-gray-700">{selectedClaim.adminRemarks}</p>
              </div>
            )}

            {(selectedClaim.status === "pending" ||
              selectedClaim.status === "under_review") && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openReviewModal(selectedClaim, "approved");
                  }}
                  className="btn-success flex items-center gap-2 flex-1"
                >
                  <HiOutlineCheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openReviewModal(selectedClaim, "rejected");
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
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedClaim(null);
        }}
        title={`${reviewForm.status === "approved" ? "Approve" : reviewForm.status === "rejected" ? "Reject" : "Review"} Claim`}
        size="md"
      >
        {selectedClaim && (
          <form onSubmit={handleReview} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-800">{selectedClaim.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                By {selectedClaim.employee?.name} • ₹
                {selectedClaim.amount.toLocaleString()}
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
                <option value="under_review">Under Review</option>
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
                    : reviewForm.status === "rejected"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Confirm{" "}
                {reviewForm.status === "approved"
                  ? "Approval"
                  : reviewForm.status === "rejected"
                    ? "Rejection"
                    : "Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedClaim(null);
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

export default ManageReimbursements;
