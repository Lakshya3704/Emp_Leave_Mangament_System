import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { applyLeaveAPI, getMyLeaveBalanceAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineDocumentAdd,
  HiOutlinePhone,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import styles from "./ApplyLeave.module.css";

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [form, setForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    isHalfDay: false,
    halfDayType: "first_half",
    emergencyContact: "",
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await getMyLeaveBalanceAPI();
      setBalance(res.data.data);
    } catch (error) {
      console.error("Balance fetch error:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getAvailableDays = (type) => {
    if (!balance?.summary) return 0;
    const item = balance.summary.find((b) => b.type === type);
    return item ? item.available : 0;
  };

  const calculateDays = () => {
    if (form.isHalfDay) return 0.5;
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
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.leaveType) {
      toast.error("Please select leave type");
      return;
    }

    if (!form.startDate) {
      toast.error("Please select start date");
      return;
    }

    if (!form.isHalfDay && !form.endDate) {
      toast.error("Please select end date");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    const days = calculateDays();
    const available = getAvailableDays(form.leaveType);

    if (days > available) {
      toast.error(
        `Insufficient balance! Available: ${available} days, Requested: ${days} days`,
      );
      return;
    }

    setLoading(true);
    try {
      await applyLeaveAPI({
        ...form,
        endDate: form.isHalfDay ? form.startDate : form.endDate,
      });
      toast.success("Leave application submitted successfully!");
      navigate("/employee/my-leaves");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: "casual", label: "Casual Leave", emoji: "🏖️", color: "blue" },
    { value: "sick", label: "Sick Leave", emoji: "🤒", color: "red" },
    { value: "earned", label: "Earned Leave", emoji: "⭐", color: "amber" },
    { value: "maternity", label: "Maternity", emoji: "🤱", color: "pink" },
    { value: "paternity", label: "Paternity", emoji: "👨‍👧", color: "indigo" },
    { value: "compensatory", label: "Comp Off", emoji: "🔄", color: "purple" },
    { value: "bereavement", label: "Bereavement", emoji: "🕊️", color: "gray" },
    { value: "unpaid", label: "Unpaid Leave", emoji: "📋", color: "orange" },
  ];

  const requestedDays = calculateDays();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HiOutlineCalendar size={28} className="text-primary-600" />
          Apply for Leave
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details to submit your leave request
        </p>
      </div>

      {/* Leave Balance Summary */}
      {!balanceLoading && balance?.summary && (
        <div className={styles.balanceGrid}>
          {balance.summary
            .filter(
              (b) =>
                !["maternity", "paternity", "bereavement", "unpaid"].includes(
                  b.type,
                ),
            )
            .map((b) => (
              <div key={b.type} className={styles.balanceCard}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize font-medium">
                    {b.type}
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    {b.available}
                  </span>
                </div>
                <div className={styles.balanceBar}>
                  <div
                    className={styles.balanceBarFill}
                    style={{
                      width: `${((b.used + b.pending) / b.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {b.used} used • {b.pending} pending • {b.total} total
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="card mt-6">
        <div className="space-y-5">
          {/* Leave Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <div className={styles.typeGrid}>
              {leaveTypes.map((type) => {
                const available = getAvailableDays(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, leaveType: type.value })}
                    className={`${styles.typeBtn} ${
                      form.leaveType === type.value ? styles.typeActive : ""
                    } ${available === 0 ? styles.typeDisabled : ""}`}
                    disabled={available === 0}
                  >
                    <span className="text-xl">{type.emoji}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                    <span
                      className={`text-xs ${
                        available > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {available} left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Half Day Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isHalfDay"
                checked={form.isHalfDay}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">
              Half Day Leave
            </span>
            {form.isHalfDay && (
              <select
                name="halfDayType"
                value={form.halfDayType}
                onChange={handleChange}
                className="ml-auto input-field max-w-[160px] text-sm"
              >
                <option value="first_half">First Half</option>
                <option value="second_half">Second Half</option>
              </select>
            )}
          </div>

          {/* Date Selection */}
          <div
            className={`grid ${form.isHalfDay ? "grid-cols-1" : "grid-cols-2"} gap-4`}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.isHalfDay ? "Date" : "Start Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiOutlineCalendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {!form.isHalfDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiOutlineCalendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    min={
                      form.startDate || new Date().toISOString().split("T")[0]
                    }
                    className="input-field pl-10"
                    required={!form.isHalfDay}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Days Preview */}
          {requestedDays > 0 && (
            <div className={styles.daysPreview}>
              <HiOutlineInformationCircle
                size={18}
                className="text-primary-600"
              />
              <span className="text-sm text-primary-700 font-medium">
                Requesting {requestedDays} working day
                {requestedDays !== 1 ? "s" : ""}
                {form.leaveType && (
                  <span>
                    {" "}
                    • Available:{" "}
                    <strong>{getAvailableDays(form.leaveType)}</strong> days
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Please provide a detailed reason for your leave..."
              className="input-field"
              rows="3"
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {form.reason.length}/500
            </p>
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact (Optional)
            </label>
            <div className="relative">
              <HiOutlinePhone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="tel"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="Contact number during leave"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <HiOutlineDocumentAdd size={18} />
                  Submit Leave Application
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/employee/my-leaves")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;
