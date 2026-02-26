import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leaveAPI } from "../../services/api";
import Loader from "../Common/Loader";

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, page]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getAll({
        status: statusFilter,
        page,
        limit: 15,
      });
      setLeaves(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id) => {
    setProcessing((p) => ({ ...p, [id]: true }));
    try {
      await leaveAPI.process(id, {
        action: "approved",
        comment: "Quick approved",
      });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    } finally {
      setProcessing((p) => ({ ...p, [id]: false }));
    }
  };

  const handleQuickReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    setProcessing((p) => ({ ...p, [id]: true }));
    try {
      await leaveAPI.process(id, {
        action: "rejected",
        rejectionReason: reason,
      });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    } finally {
      setProcessing((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <div>
      <div className="filters-bar">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Emergency</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {l.employee?.firstName} {l.employee?.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {l.employee?.employeeId}
                        </div>
                      </td>
                      <td>{l.employee?.department}</td>
                      <td>
                        <span className={`leave-type-badge ${l.leaveType}`}>
                          {l.leaveType}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {new Date(l.startDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.totalDays}</td>
                      <td>
                        <span className={`status-badge ${l.status}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.isEmergency ? (
                          <span className="emergency-tag">🚨 Yes</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link
                            to={`/leaves/${l._id}`}
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                          {l.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleQuickApprove(l._id)}
                                className="btn btn-sm btn-success"
                                disabled={processing[l._id]}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleQuickReject(l._id)}
                                className="btn btn-sm btn-danger"
                                disabled={processing[l._id]}
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10">
                      <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <h3>All caught up!</h3>
                        <p>
                          No {statusFilter || ""} leave applications to display
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="pagination" style={{ padding: "16px" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <span className="page-info">
              Page {page} of {pagination.pages}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;
