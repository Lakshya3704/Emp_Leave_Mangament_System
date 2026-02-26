import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReimbursementByIdAPI } from "../services/api";
import StatusBadge from "../components/Common/StatusBadge";

const ReimbursementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reimbursement, setReimbursement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReimbursement();
  }, [id]);

  const fetchReimbursement = async () => {
    try {
      setLoading(true);
      const res = await getReimbursementByIdAPI(id);
      setReimbursement(res.data.reimbursement || res.data);
    } catch (error) {
      console.error("Error fetching reimbursement:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!reimbursement) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Reimbursement not found.</p>
        <button onClick={() => navigate("/reimbursements")}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/reimbursements")}
        style={{ marginBottom: "1rem", cursor: "pointer" }}
      >
        ← Back to Reimbursements
      </button>

      <h2>Reimbursement Details</h2>

      <div
        style={{
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <p>
          <strong>Title:</strong> {reimbursement.title}
        </p>
        <p>
          <strong>Amount:</strong> ₹{reimbursement.amount}
        </p>
        <p>
          <strong>Category:</strong> {reimbursement.category}
        </p>
        <p>
          <strong>Status:</strong> <StatusBadge status={reimbursement.status} />
        </p>
        <p>
          <strong>Description:</strong> {reimbursement.description}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(
            reimbursement.date || reimbursement.createdAt,
          ).toLocaleDateString()}
        </p>
        {reimbursement.adminRemarks && (
          <p>
            <strong>Admin Remarks:</strong> {reimbursement.adminRemarks}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReimbursementDetailPage;
