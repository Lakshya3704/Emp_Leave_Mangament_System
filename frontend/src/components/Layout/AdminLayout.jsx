import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import styles from "./AdminLayout.module.css";

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Navbar />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
