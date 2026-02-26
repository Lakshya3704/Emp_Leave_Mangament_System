import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import styles from "./EmployeeLayout.module.css";

const EmployeeLayout = ({ children }) => {
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

export default EmployeeLayout;
