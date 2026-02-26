import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCurrencyRupee,
} from "react-icons/hi";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      // handled in context
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === "admin") {
      setEmail("admin@company.com");
      setPassword("admin123");
    } else {
      setEmail("rahul@company.com");
      setPassword("employee123");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.logoBox}>
            <HiOutlineCurrencyRupee size={36} />
          </div>
          <h1 className={styles.brandTitle}>ReimburseHub</h1>
          <p className={styles.brandSubtitle}>
            Streamlined expense reimbursement management system
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}></div>
              <span>Submit expense claims easily</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}></div>
              <span>Track approval status in real-time</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}></div>
              <span>Admin dashboard with full control</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureDot}></div>
              <span>Secure role-based access</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Welcome back
          </h2>
          <p className="text-gray-500 mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <HiOutlineMail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <HiOutlineLockClosed className={styles.inputIcon} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={styles.input}
                  required
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className={styles.registerSection}>
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Register as Employee
              </Link>
            </p>
          </div>

          <div className={styles.demoSection}>
            <p className="text-xs text-gray-400 mb-3 text-center">
              Quick Demo Access
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className={styles.demoBtn}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("employee")}
                className={styles.demoBtnAlt}
              >
                Employee Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
