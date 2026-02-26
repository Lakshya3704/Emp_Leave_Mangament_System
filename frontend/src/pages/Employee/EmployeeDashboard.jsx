import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyStatsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/Common/StatusBadge";
import {
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";
import styles from "./EmployeeDashboard.module.css";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getMyStatsAPI();
      setData(res.data.data);
    } catch (error) {
      console.error("Stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatByStatus = (status) => {
    const stat = data?.stats?.find((s) => s._id === status);
    return { total: stat?.total || 0, count: stat?.count || 0 };
  };

  const totalClaims = data?.stats?.reduce((acc, s) => acc + s.count, 0) || 0;
  const totalAmount = data?.stats?.reduce((acc, s) => acc + s.total, 0) || 0;

  const categoryLabels = {
    travel: "Travel",
    food: "Food & Meals",
    accommodation: "Accommodation",
    equipment: "Equipment",
    medical: "Medical",
    training: "Training",
    office_supplies: "Office Supplies",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.employeeId} • {user?.department}
          </p>
        </div>
        <Link
          to="/employee/new-reimbursement"
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlusCircle size={18} />
          New Claim
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <HiOutlineDocumentText size={20} className="text-indigo-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{totalClaims}</h3>
          <p className="text-sm text-gray-500">Total Claims</p>
          <p className="text-xs text-gray-400 mt-1">
            ₹{totalAmount.toLocaleString()} total
          </p>
        </div>

        <div className={styles.statCard}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <HiOutlineClock size={20} className="text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {getStatByStatus("pending").count}
          </h3>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xs text-gray-400 mt-1">
            ₹{getStatByStatus("pending").total.toLocaleString()}
          </p>
        </div>

        <div className={styles.statCard}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <HiOutlineCheckCircle size={20} className="text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {getStatByStatus("approved").count}
          </h3>
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-xs text-gray-400 mt-1">
            ₹{getStatByStatus("approved").total.toLocaleString()}
          </p>
        </div>

        <div className={styles.statCard}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <HiOutlineXCircle size={20} className="text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {getStatByStatus("rejected").count}
          </h3>
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-xs text-gray-400 mt-1">
            ₹{getStatByStatus("rejected").total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Claims */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Claims
            </h3>
            <Link
              to="/employee/reimbursements"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {data?.recentClaims?.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineDocumentText
                size={40}
                className="text-gray-300 mx-auto mb-3"
              />
              <p className="text-gray-400">No claims yet</p>
              <Link
                to="/employee/new-reimbursement"
                className="text-primary-600 hover:underline text-sm mt-2 inline-block"
              >
                Submit your first claim
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentClaims?.map((claim) => (
                <div
                  key={claim._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 text-sm">
                      {claim.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {categoryLabels[claim.category]} •{" "}
                      {new Date(claim.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-800 text-sm">
                      ₹{claim.amount.toLocaleString()}
                    </p>
                    <StatusBadge status={claim.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Spending */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Approved by Category
          </h3>
          {data?.categorySpending?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No approved claims
            </p>
          ) : (
            <div className="space-y-3">
              {data?.categorySpending?.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-700 text-sm">
                      {categoryLabels[cat._id] || cat._id}
                    </p>
                    <p className="text-xs text-gray-400">{cat.count} claims</p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    ₹{cat.total.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
