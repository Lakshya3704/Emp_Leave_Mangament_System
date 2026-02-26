import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCurrencyRupee,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import styles from "./Register.module.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      return "Full name is required";
    }
    if (!form.email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateStep2 = () => {
    if (!form.password) {
      return "Password is required";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      return "Please confirm your password";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      document.getElementById("step-error").textContent = error;
      return;
    }
    document.getElementById("step-error").textContent = "";
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateStep2();
    if (error) {
      document.getElementById("step-error").textContent = error;
      return;
    }

    setLoading(true);
    try {
      const userData = await register(form);
      navigate("/employee/dashboard");
    } catch (err) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Design",
    "General",
  ];

  return (
    <div className={styles.container}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logoBox}>
            <HiOutlineCurrencyRupee size={36} />
          </div>
          <h1 className={styles.brandTitle}>ReimburseHub</h1>
          <p className={styles.brandSubtitle}>
            Join our platform to manage your expense reimbursements effortlessly
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefitItem}>
              <HiOutlineCheckCircle
                size={20}
                className="text-green-300 flex-shrink-0"
              />
              <div>
                <p className="font-medium">Quick Submissions</p>
                <p className="text-sm opacity-70">
                  Submit claims in under 2 minutes
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <HiOutlineCheckCircle
                size={20}
                className="text-green-300 flex-shrink-0"
              />
              <div>
                <p className="font-medium">Real-time Tracking</p>
                <p className="text-sm opacity-70">
                  Track your claim status instantly
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <HiOutlineCheckCircle
                size={20}
                className="text-green-300 flex-shrink-0"
              />
              <div>
                <p className="font-medium">Secure & Reliable</p>
                <p className="text-sm opacity-70">
                  Your data is encrypted and safe
                </p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <HiOutlineCheckCircle
                size={20}
                className="text-green-300 flex-shrink-0"
              />
              <div>
                <p className="font-medium">Fast Approvals</p>
                <p className="text-sm opacity-70">
                  Get approved within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Create Account
          </h2>
          <p className="text-gray-500 mb-6">
            Register as an employee to get started
          </p>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div
              className={`${styles.stepDot} ${
                step >= 1 ? styles.stepActive : ""
              }`}
            >
              1
            </div>
            <div
              className={`${styles.stepLine} ${
                step >= 2 ? styles.stepLineActive : ""
              }`}
            ></div>
            <div
              className={`${styles.stepDot} ${
                step >= 2 ? styles.stepActive : ""
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mb-6">
            <span
              className={`text-xs ${
                step === 1 ? "text-primary-600 font-medium" : "text-gray-400"
              }`}
            >
              Personal Info
            </span>
            <span
              className={`text-xs ${
                step === 2 ? "text-primary-600 font-medium" : "text-gray-400"
              }`}
            >
              Security & Details
            </span>
          </div>

          {/* Error display */}
          <p
            id="step-error"
            className="text-red-500 text-sm mb-3 min-h-[20px]"
          ></p>

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.inputGroup}>
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
                      placeholder="Enter your full name"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <HiOutlineMail className={styles.inputIcon} size={18} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <HiOutlinePhone className={styles.inputIcon} size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={styles.input}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className={styles.nextBtn}
                >
                  Next Step →
                </button>
              </div>
            )}

            {/* STEP 2: Password & Details */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.inputGroup}>
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
                      placeholder="Minimum 6 characters"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
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
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={styles.eyeBtn}
                    >
                      {showConfirmPassword ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  </div>
                  {/* Password match indicator */}
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

                <div className="grid grid-cols-2 gap-3">
                  <div className={styles.inputGroup}>
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
                        className={`${styles.input} ${styles.selectInput}`}
                      >
                        <option value="">Select</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
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
                        placeholder="Your role"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={styles.backBtn}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitBtn}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
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
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className={styles.loginLink}>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
