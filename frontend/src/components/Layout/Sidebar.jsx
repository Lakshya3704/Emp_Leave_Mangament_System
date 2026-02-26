import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlinePlusCircle,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineCollection,
} from "react-icons/hi";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { user } = useAuth();

  const adminLinks = [
    { to: "/admin/dashboard", icon: HiOutlineHome, label: "Dashboard" },
    { to: "/admin/employees", icon: HiOutlineUsers, label: "Employees" },
    {
      to: "/admin/reimbursements",
      icon: HiOutlineCurrencyRupee,
      label: "Reimbursements",
    },
    {
      to: "/admin/leaves",
      icon: HiOutlineCalendar,
      label: "Manage Leaves",
    },
    {
      to: "/admin/leave-balances",
      icon: HiOutlineCollection,
      label: "Leave Balances",
    },
    {
      to: "/admin/register-admin",
      icon: HiOutlineShieldCheck,
      label: "Register Admin",
    },
  ];

  const employeeLinks = [
    { to: "/employee/dashboard", icon: HiOutlineHome, label: "Dashboard" },
    {
      to: "/employee/reimbursements",
      icon: HiOutlineDocumentText,
      label: "My Claims",
    },
    {
      to: "/employee/new-reimbursement",
      icon: HiOutlinePlusCircle,
      label: "New Claim",
    },
    {
      to: "/employee/my-leaves",
      icon: HiOutlineCalendar,
      label: "My Leaves",
    },
    {
      to: "/employee/apply-leave",
      icon: HiOutlineClipboardList,
      label: "Apply Leave",
    },
    { to: "/employee/profile", icon: HiOutlineUser, label: "Profile" },
  ];

  const links = user?.role === "admin" ? adminLinks : employeeLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <HiOutlineCurrencyRupee size={24} />
        </div>
        <div>
          <h1 className={styles.logoText}>ReimburseHub</h1>
          <span className={styles.logoSub}>
            {user?.role === "admin" ? "Admin Panel" : "Employee Portal"}
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        <p className={styles.navLabel}>MAIN MENU</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerCard}>
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-semibold text-gray-700 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-400">{user?.employeeId}</p>
          <span
            className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.role === "admin"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {user?.role === "admin" ? "Admin" : "Employee"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
