import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReimbursementAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineDocumentAdd,
  HiOutlineUpload,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
} from "react-icons/hi";
import styles from "./NewReimbursement.module.css";

const NewReimbursement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    expenseDate: "",
  });
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setReceipt(file);
      if (file.type.startsWith("image/")) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("amount", form.amount);
      formData.append("category", form.category);
      formData.append("expenseDate", form.expenseDate);
      if (receipt) {
        formData.append("receipt", receipt);
      }

      await createReimbursementAPI(formData);
      toast.success("Reimbursement claim submitted successfully!");
      navigate("/employee/reimbursements");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "travel", label: "Travel", emoji: "✈️" },
    { value: "food", label: "Food & Meals", emoji: "🍽️" },
    { value: "accommodation", label: "Accommodation", emoji: "🏨" },
    { value: "equipment", label: "Equipment", emoji: "💻" },
    { value: "medical", label: "Medical", emoji: "🏥" },
    { value: "training", label: "Training", emoji: "📚" },
    { value: "office_supplies", label: "Office Supplies", emoji: "📎" },
    { value: "other", label: "Other", emoji: "📋" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HiOutlineDocumentAdd size={28} className="text-primary-600" />
          New Reimbursement Claim
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details to submit your expense claim
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Client meeting travel expenses"
              className="input-field"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`${styles.categoryBtn} ${
                    form.category === cat.value ? styles.categoryActive : ""
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiOutlineCurrencyRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field pl-10"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiOutlineCalendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  className="input-field pl-10"
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide details about the expense..."
              className="input-field"
              rows="4"
              required
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Receipt (Optional)
            </label>
            <div className={styles.uploadArea}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className={styles.uploadLabel}>
                {receipt ? (
                  <div className="text-center">
                    {receiptPreview ? (
                      <img
                        src={receiptPreview}
                        alt="Preview"
                        className="max-h-32 mx-auto mb-2 rounded-lg"
                      />
                    ) : (
                      <HiOutlineDocumentAdd
                        size={32}
                        className="text-primary-500 mx-auto mb-2"
                      />
                    )}
                    <p className="text-sm text-gray-600">{receipt.name}</p>
                    <p className="text-xs text-gray-400">
                      {(receipt.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <HiOutlineUpload
                      size={32}
                      className="text-gray-400 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      Click to upload receipt
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, PDF up to 5MB
                    </p>
                  </div>
                )}
              </label>
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
                  Submit Claim
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/employee/reimbursements")}
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

export default NewReimbursement;
