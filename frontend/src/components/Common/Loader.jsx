import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  );
};

export default Loader;
