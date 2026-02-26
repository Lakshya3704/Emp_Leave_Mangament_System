import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leaveAPI } from "../../services/api";
import Loader from "../Common/Loader";

const LEAVE_TYPES = [
  "casual",
  "sick",
  "annual",
  "maternity",
  "paternity",
  "unpaid",
  "compensatory",
  "bereavement",
  "marriage",
  "study",
];

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    leaveType: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(filters).forEach((k) => {
        if (filters[k]) params[k] = filters[k];
      });
      const res = await leaveAPI.getAll(params);
      setLeaves(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave application?")) return;
    try {
      await leaveAPI.cancel(id);
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || "Error cancelling");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this leave application?")) return;
    try {
      await leaveAPI.delete(id);
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting");
    }
  };

  return (
    <div>
      <div className="filters-bar">
        <select
          name="status"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          name="leaveType"
          value={filters.leaveType}
          onChange={(e) =>
            setFilters({ ...filters, leaveType: e.target.value, page: 1 })
          }
        >
          <option value="">All Types</option>
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <div style={{ marginLeft: "auto" }}>
          <Link to="/leaves/new" className="btn btn-primary btn-sm">
            ✏️ Apply Leave
          </Link>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Day Type</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map((l) => (
                      <tr key={l._id}>
                        <td
                          style={{ fontFamily: "monospace", fontSize: "12px" }}
                        >
                          {l.referenceNumber}
                        </td>
                        <td>
                          <span className={`leave-type-badge ${l.leaveType}`}>
                            {l.leaveType}
                          </span>
                        </td>
                        <td>{new Date(l.startDate).toLocaleDateString()}</td>
                        <td>{new Date(l.endDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>{l.totalDays}</td>
                        <td
                          style={{
                            textTransform: "capitalize",
                            fontSize: "13px",
                          }}
                        >
                          {l.dayType.replace("_", " ")}
                        </td>
                        <td>
                          <span className={`status-badge ${l.status}`}>
                            {l.status}
                          </span>
                          {l.isEmergency && (
                            <span
                              className="emergency-tag"
                              style={{ marginLeft: "6px" }}
                            >
                              🚨
                            </span>
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
                              <button
                                onClick={() => handleDelete(l._id)}
                                className="btn btn-sm btn-danger"
                              >
                                Delete
                              </button>
                            )}
                            {["pending", "approved"].includes(l.status) && (
                              <button
                                onClick={() => handleCancel(l._id)}
                                className="btn btn-sm btn-warning"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">
                        <div className="empty-state">
                          <div className="empty-icon">📅</div>
                          <h3>No Leave Applications</h3>
                          <p>You haven't applied for any leave yet</p>
                          <Link to="/leaves/new" className="btn btn-primary">
                            ✏️ Apply for Leave
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination" style={{ padding: "16px" }}>
                <button
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={filters.page >= pagination.pages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveList;
