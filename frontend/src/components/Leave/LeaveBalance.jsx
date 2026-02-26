import React, { useState, useEffect } from "react";
import { leaveBalanceAPI } from "../../services/api";
import Loader from "../Common/Loader";

const LEAVE_TYPE_LABELS = {
  casual: "🏖️ Casual",
  sick: "🤒 Sick",
  annual: "🌴 Annual",
  maternity: "🤱 Maternity",
  paternity: "👨‍👦 Paternity",
  unpaid: "💼 Unpaid",
  compensatory: "🔄 Comp Off",
  bereavement: "🕊️ Bereavement",
  marriage: "💍 Marriage",
  study: "📚 Study",
};

const LeaveBalanceComponent = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBalance();
  }, [year]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const res = await leaveBalanceAPI.getMyBalance(year);
      setBalance(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const balances = balance?.balances || {};

  return (
    <div>
      {/* Year Selector */}
      <div className="filters-bar" style={{ marginBottom: "24px" }}>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <h3 style={{ marginLeft: "12px" }}>Leave Balance — {year}</h3>
      </div>

      {/* Balance Grid */}
      <div className="balance-grid">
        {Object.entries(balances).map(([type, data]) => {
          const available = data.total - data.used - data.pending;
          const usedPercent =
            data.total > 0 ? (data.used / data.total) * 100 : 0;
          const pendingPercent =
            data.total > 0 ? (data.pending / data.total) * 100 : 0;

          return (
            <div key={type} className="balance-card">
              <div className="balance-type">
                {LEAVE_TYPE_LABELS[type] || type}
              </div>

              <div className="balance-progress">
                <div
                  className="used-bar"
                  style={{ width: `${usedPercent}%` }}
                ></div>
                <div
                  className="pending-bar"
                  style={{ width: `${pendingPercent}%` }}
                ></div>
              </div>

              <div className="balance-numbers">
                <div className="balance-num">
                  <div className="num total">{data.total}</div>
                  <div className="num-label">Total</div>
                </div>
                <div className="balance-num">
                  <div className="num used">{data.used}</div>
                  <div className="num-label">Used</div>
                </div>
                <div className="balance-num">
                  <div className="num pending-num">{data.pending}</div>
                  <div className="num-label">Pending</div>
                </div>
                <div className="balance-num">
                  <div className="num available">{available}</div>
                  <div className="num-label">Available</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalanceComponent;
