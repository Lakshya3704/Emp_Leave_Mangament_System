import { useAuth } from "../../context/AuthContext";
import { HiOutlineLogout, HiOutlineBell, HiOutlineUser } from "react-icons/hi";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <h2 className={styles.greeting}>
          Welcome, <span className="text-primary-600">{user?.name}</span>
        </h2>
        <p className={styles.role}>
          {user?.role === "admin"
            ? "Administrator"
            : user?.designation || "Employee"}
          {user?.department && ` • ${user.department}`}
        </p>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn}>
          <HiOutlineBell size={20} />
          <span className={styles.badge}>3</span>
        </button>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <HiOutlineUser size={18} />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user?.name}
          </span>
        </div>

        <button onClick={logout} className={styles.logoutBtn}>
          <HiOutlineLogout size={18} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
