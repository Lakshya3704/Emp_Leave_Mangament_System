import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMyReimbursementsAPI,
  deleteReimbursementAPI,
} from "../../services/api";
import StatusBadge from "../../components/Common/StatusBadge";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import {
  HiOutlinePlusCircle,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineFilter,
} from "react-icons/hi";
import styles from "./MyReimbursements.module.css";

const MyReimbursements = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchReimbursements();
  }, [statusFilter, pagination.page]);

  const fetchReimbursements = async () => {
    try {
      setLoading(true);
      const res = await getMyReimbursementsAPI({
        status: statusFilter,
        page: pagination.page,
        limit: 10,
      });
      setReimbursements(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch claims");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this claim?")) {
      try {
        await deleteReimbursementAPI(id);
        toast.success("Claim deleted");
        fetchReimbursements();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Reimbursements
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} claims total
          </p>
        </div>
        <Link
          to="/employee/new-reimbursement"
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlusCircle size={18} />
          New Claim
        </Link>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <HiOutlineFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="input-field max-w-xs"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card text-center py-8 text-gray-400">Loading...</div>
        ) : reimbursements.length === 0 ? (
          <div className="card text-center py-12">
            <HiOutlineFilter size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No claims found</p>
            <Link
              to="/employee/new-reimbursement"
              className="text-primary-600 hover:underline text-sm"
            >
              Submit a new claim
            </Link>
          </div>
        ) : (
          reimbursements.map((claim) => (
            <div key={claim._id} className={styles.claimCard}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {claim.title}
                    </h3>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                    {claim.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {categoryLabels[claim.category]}
                    </span>
                    <span>
                      Expense:{" "}
                      {new Date(claim.expenseDate).toLocaleDateString()}
                    </span>
                    <span>
                      Submitted:{" "}
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {claim.adminRemarks && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <span className="font-medium">Admin: </span>
                      {claim.adminRemarks}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <p className="text-xl font-bold text-gray-800">
                    ₹{claim.amount.toLocaleString()}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setShowDetail(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                      title="View"
                    >
                      <HiOutlineEye size={16} />
                    </button>
                    {claim.status === "pending" && (
                      <button
                        onClick={() => handleDelete(claim._id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                        title="Delete"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    )}
                  </div>
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
          setSelectedClaim(null);
        }}
        title="Claim Details"
        size="lg"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedClaim.title}
              </h3>
              <StatusBadge status={selectedClaim.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Amount</p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{selectedClaim.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <p className="text-gray-800">
                  {categoryLabels[selectedClaim.category]}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-gray-600">{selectedClaim.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Expense Date</p>
                <p className="text-gray-800">
                  {new Date(selectedClaim.expenseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Submitted On</p>
                <p className="text-gray-800">
                  {new Date(selectedClaim.createdAt).toLocaleDateString()}
                </p>
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
                  View Receipt →
                </a>
              </div>
            )}

            {selectedClaim.paymentStatus &&
              selectedClaim.status === "approved" && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Payment Status</p>
                  <StatusBadge status={selectedClaim.paymentStatus} />
                </div>
              )}

            {selectedClaim.adminRemarks && (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-500">
                <p className="text-xs text-gray-400 mb-1">Admin Remarks</p>
                <p className="text-gray-700">{selectedClaim.adminRemarks}</p>
                {selectedClaim.reviewedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    Reviewed on{" "}
                    {new Date(selectedClaim.reviewedAt).toLocaleDateString()}
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

export default MyReimbursements;
