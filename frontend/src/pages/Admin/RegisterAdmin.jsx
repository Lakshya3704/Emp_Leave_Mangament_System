import { useState, useEffect } from "react";
import { registerAdminAPI, getAllAdminsAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheckCircle,
  HiOutlineUserCircle,
} from "react-icons/hi";
import styles from "./RegisterAdmin.module.css";

const RegisterAdmin = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "Management",
    designation: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await getAllAdminsAPI();
      setAdmins(res.data.data);
    } catch (error) {
      console.error("Failed to fetch admins");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await registerAdminAPI(form);
      setCreatedAdmin(res.data.user);
      setShowSuccess(true);
      toast.success("Admin account created successfully!");

      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "Management",
        designation: "",
        phone: "",
      });

      // Refresh admin list
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HiOutlineShieldCheck size={28} className="text-purple-600" />
          Register New Admin
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new administrator account with full system access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          {/* Success message */}
          {showSuccess && createdAdmin && (
            <div className={styles.successCard}>
              <div className="flex items-center gap-3 mb-3">
                <HiOutlineCheckCircle size={28} className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-emerald-700">
                  Admin Created Successfully!
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Name</p>
                  <p className="font-medium text-gray-700">
                    {createdAdmin.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="font-medium text-gray-700">
                    {createdAdmin.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Employee ID</p>
                  <p className="font-medium text-gray-700">
                    {createdAdmin.employeeId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Role</p>
                  <p className="font-medium text-purple-600 uppercase">
                    {createdAdmin.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className={styles.formIcon}>
                <HiOutlineShieldCheck size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  Admin Registration Form
                </h2>
                <p className="text-xs text-gray-400">
                  All fields marked with * are required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={styles.label}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineUser className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.label}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineMail className={styles.inputIcon} size={18} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@company.com"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={styles.label}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineLockClosed
                      className={styles.inputIcon}
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className={styles.input}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={16} />
                      ) : (
                        <HiOutlineEye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={styles.label}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineLockClosed
                      className={styles.inputIcon}
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={styles.eyeBtn}
                    >
                      {showConfirmPassword ? (
                        <HiOutlineEyeOff size={16} />
                      ) : (
                        <HiOutlineEye size={16} />
                      )}
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <p
                      className={`text-xs mt-1 ${
                        form.password === form.confirmPassword
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {form.password === form.confirmPassword
                        ? "✓ Passwords match"
                        : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={styles.label}>Department</label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineOfficeBuilding
                      className={styles.inputIcon}
                      size={18}
                    />
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className={styles.input}
                    >
                      <option value="Management">Management</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={styles.label}>Designation</label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineBriefcase
                      className={styles.inputIcon}
                      size={18}
                    />
                    <input
                      type="text"
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      placeholder="e.g., System Administrator"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="max-w-sm">
                <label className={styles.label}>Phone</label>
                <div className={styles.inputWrapper}>
                  <HiOutlinePhone className={styles.inputIcon} size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Warning */}
              <div className={styles.warningBox}>
                <HiOutlineShieldCheck
                  size={20}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Admin Access Warning
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Admin accounts have full system access including managing
                    employees, approving/rejecting claims, and creating other
                    admin accounts.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
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
                      Creating Admin...
                    </span>
                  ) : (
                    <>
                      <HiOutlineShieldCheck size={18} />
                      Create Admin Account
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      department: "Management",
                      designation: "",
                      phone: "",
                    })
                  }
                  className="btn-secondary"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Admins List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck size={20} className="text-purple-600" />
              Existing Admins
            </h3>

            {loadingAdmins ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">Loading...</p>
              </div>
            ) : admins.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No admins found
              </p>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin._id} className={styles.adminCard}>
                    <div className="flex items-center gap-3">
                      <div className={styles.adminAvatar}>
                        <HiOutlineUserCircle size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 text-sm truncate">
                          {admin.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {admin.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-11">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                      <span className="text-xs text-gray-400">
                        {admin.employeeId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">
                Total: {admins.length} admin
                {admins.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
