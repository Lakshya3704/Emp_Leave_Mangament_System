import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leaveAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Common/Loader";

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager } = useAuth();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await leaveAPI.getById(id);
      setLeave(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await leaveAPI.process(id, {
        action: "approved",
        comment: approvalComment,
      });
      fetchDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Enter rejection reason");
      return;
    }
    setProcessing(true);
    try {
      await leaveAPI.process(id, {
        action: "rejected",
        rejectionReason,
        comment: approvalComment,
      });
      fetchDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this leave?")) return;
    try {
      await leaveAPI.cancel(id);
      fetchDetail();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await leaveAPI.addComment(id, { text: comment });
      setComment("");
      fetchDetail();
    } catch (error) {
      alert("Error adding comment");
    }
  };

  if (loading) return <Loader />;
  if (!leave)
    return (
      <div className="empty-state">
        <h3>Leave not found</h3>
      </div>
    );

  const l = leave;
  const canApprove = (isAdmin || isManager) && l.status === "pending";
  const isOwner = l.employee?._id === user?.id;

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          ← Back
        </button>
      </div>

      <div className="detail-grid">
        {/* Left - Main Info */}
        <div>
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>
                <span className={`leave-type-badge ${l.leaveType}`}>
                  {l.leaveType}
                </span>
                {l.isEmergency && (
                  <span
                    className="emergency-tag"
                    style={{ marginLeft: "10px" }}
                  >
                    🚨 Emergency
                  </span>
                )}
              </h3>
              <span className={`status-badge ${l.status}`}>{l.status}</span>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div className="detail-field">
                  <div className="label">Reference</div>
                  <div className="value" style={{ fontFamily: "monospace" }}>
                    {l.referenceNumber}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="label">Total Days</div>
                  <div className="value amount">{l.totalDays} day(s)</div>
                </div>
                <div className="detail-field">
                  <div className="label">Start Date</div>
                  <div className="value">
                    {new Date(l.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="label">End Date</div>
                  <div className="value">
                    {new Date(l.endDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="label">Day Type</div>
                  <div
                    className="value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {l.dayType.replace("_", " ")}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="label">Applied On</div>
                  <div className="value">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="detail-field" style={{ marginTop: "16px" }}>
                <div className="label">Reason</div>
                <div className="value">{l.reason}</div>
              </div>

              {l.contactNumber && (
                <div className="detail-field">
                  <div className="label">Contact During Leave</div>
                  <div className="value">{l.contactNumber}</div>
                </div>
              )}

              {l.address && (
                <div className="detail-field">
                  <div className="label">Address During Leave</div>
                  <div className="value">{l.address}</div>
                </div>
              )}

              {l.rejectionReason && (
                <div
                  style={{
                    background: "#fee2e2",
                    padding: "14px",
                    borderRadius: "var(--radius)",
                    marginTop: "16px",
                    border: "1px solid #fecaca",
                  }}
                >
                  <strong style={{ color: "#991b1b", fontSize: "13px" }}>
                    Rejection Reason:
                  </strong>
                  <p style={{ color: "#991b1b", marginTop: "4px" }}>
                    {l.rejectionReason}
                  </p>
                </div>
              )}

              {l.attachment?.fileName && (
                <div style={{ marginTop: "16px" }}>
                  <div className="label" style={{ marginBottom: "8px" }}>
                    Attachment
                  </div>
                  <div className="receipt-item">📎 {l.attachment.fileName}</div>
                </div>
              )}

              {/* Timeline */}
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "16px" }}>📋 Timeline</h4>
                <div className="leave-timeline">
                  <div className="timeline-item completed">
                    <div className="timeline-date">
                      {new Date(l.createdAt).toLocaleString()}
                    </div>
                    <div className="timeline-text">
                      Leave applied by {l.employee?.firstName}{" "}
                      {l.employee?.lastName}
                    </div>
                  </div>
                  {l.approvedAt && (
                    <div
                      className={`timeline-item ${l.status === "approved" ? "completed" : "rejected-item"}`}
                    >
                      <div className="timeline-date">
                        {new Date(l.approvedAt).toLocaleString()}
                      </div>
                      <div className="timeline-text">
                        {l.status === "approved"
                          ? "✅ Approved"
                          : "❌ Rejected"}{" "}
                        by {l.approver?.firstName} {l.approver?.lastName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h3>💬 Comments ({l.comments?.length || 0})</h3>
            </div>
            <div className="card-body">
              {l.comments?.length > 0 ? (
                l.comments.map((c, idx) => (
                  <div key={idx} className="comment-item">
                    <div className="comment-avatar">
                      {c.user?.firstName?.[0]}
                      {c.user?.lastName?.[0]}
                    </div>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <strong>
                          {c.user?.firstName} {c.user?.lastName}
                        </strong>
                        {" · "}
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="comment-text">{c.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No comments
                </p>
              )}
              <form onSubmit={handleAddComment} className="comment-input">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div>
          {/* Employee Info */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>👤 Employee</h3>
            </div>
            <div className="card-body">
              <div className="detail-field">
                <div className="label">Name</div>
                <div className="value">
                  {l.employee?.firstName} {l.employee?.lastName}
                </div>
              </div>
              <div className="detail-field">
                <div className="label">Employee ID</div>
                <div className="value" style={{ fontFamily: "monospace" }}>
                  {l.employee?.employeeId}
                </div>
              </div>
              <div className="detail-field">
                <div className="label">Department</div>
                <div className="value">{l.employee?.department}</div>
              </div>
              <div className="detail-field">
                <div className="label">Email</div>
                <div className="value">{l.employee?.email}</div>
              </div>
            </div>
          </div>

          {/* Approver Info */}
          {l.approver && (
            <div className="card" style={{ marginBottom: "24px" }}>
              <div className="card-header">
                <h3>✅ Processed By</h3>
              </div>
              <div className="card-body">
                <div className="detail-field">
                  <div className="label">Approver</div>
                  <div className="value">
                    {l.approver?.firstName} {l.approver?.lastName}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="label">Date</div>
                  <div className="value">
                    {l.approvedAt
                      ? new Date(l.approvedAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancel by Employee */}
          {isOwner && ["pending", "approved"].includes(l.status) && (
            <div style={{ marginBottom: "16px" }}>
              <button
                onClick={handleCancel}
                className="btn btn-warning btn-block"
              >
                ⚠️ Cancel Leave
              </button>
            </div>
          )}

          {/* Approval Actions */}
          {canApprove && (
            <div className="approval-actions">
              <h4>⚡ Take Action</h4>
              <textarea
                placeholder="Add comment (optional)..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
              <button
                onClick={handleApprove}
                className="btn btn-success btn-block"
                disabled={processing}
                style={{ marginBottom: "10px" }}
              >
                {processing ? "⏳..." : "✅ Approve Leave"}
              </button>
              <textarea
                placeholder="Rejection reason (required)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ marginBottom: "8px" }}
              />
              <button
                onClick={handleReject}
                className="btn btn-danger btn-block"
                disabled={processing}
              >
                {processing ? "⏳..." : "❌ Reject Leave"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetail;
