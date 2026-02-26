import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaveAPI, leaveBalanceAPI } from "../../services/api";

const LEAVE_TYPES = [
  { value: "casual", label: "Casual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "compensatory", label: "Compensatory Off" },
  { value: "bereavement", label: "Bereavement Leave" },
  { value: "marriage", label: "Marriage Leave" },
  { value: "study", label: "Study Leave" },
];

const LeaveForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    dayType: "full",
    reason: "",
    contactNumber: "",
    address: "",
    isEmergency: false,
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await leaveBalanceAPI.getMyBalance();
      setBalance(res.data.data?.balances);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const getAvailableBalance = () => {
    if (!form.leaveType || !balance) return null;
    const b = balance[form.leaveType];
    if (!b) return null;
    return b.total - b.used - b.pending;
  };

  const calculateDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    if (form.dayType !== "full" && count > 0) count -= 0.5;
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });
      if (file) {
        formData.append("attachment", file);
      }

      await leaveAPI.apply(formData);
      navigate("/leaves");
    } catch (err) {
      setError(err.response?.data?.message || "Error applying for leave");
    } finally {
      setLoading(false);
    }
  };

  const availableBalance = getAvailableBalance();
  const estimatedDays = calculateDays();

  return (
    <div className="card">
      <div className="card-header">
        <h3>📝 Apply for Leave</h3>
      </div>
      <div className="card-body">
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Leave Type *</label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                required
              >
                <option value="">Select Leave Type</option>
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
              {availableBalance !== null && (
                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    color:
                      availableBalance > 0 ? "var(--success)" : "var(--danger)",
                    fontWeight: 600,
                  }}
                >
                  Available: {availableBalance} days
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Day Type</label>
              <select
                name="dayType"
                value={form.dayType}
                onChange={handleChange}
              >
                <option value="full">Full Day</option>
                <option value="first_half">First Half</option>
                <option value="second_half">Second Half</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate}
                required
              />
            </div>
          </div>

          {/* Estimated Days Display */}
          {estimatedDays > 0 && (
            <div
              style={{
                background: "#eff6ff",
                padding: "12px 16px",
                borderRadius: "var(--radius)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "20px" }}>📅</span>
              <div>
                <strong style={{ color: "var(--primary)" }}>
                  {estimatedDays} working day(s)
                </strong>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  Weekends are excluded automatically
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label>Reason *</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Please provide the reason for your leave..."
              required
            />
          </div>

          {/* Contact & Address */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number (during leave)</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="form-group">
              <label>Address (during leave)</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Where will you be?"
              />
            </div>
          </div>

          {/* Emergency & Attachment */}
          <div className="form-row">
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="isEmergency"
                  checked={form.isEmergency}
                  onChange={handleChange}
                  style={{ width: "auto" }}
                />
                <span>🚨 Emergency Leave</span>
              </label>
            </div>
            <div className="form-group">
              <label>Attachment (Medical cert, etc.)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ padding: "8px" }}
              />
            </div>
          </div>

          <div className="btn-group" style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "⏳ Submitting..." : "📤 Submit Leave Request"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/leaves")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
