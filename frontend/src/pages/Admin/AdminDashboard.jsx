import { useState, useEffect } from "react";
import { getAdminDashboardAPI } from "../../services/api";
import StatusBadge from "../../components/Common/StatusBadge";
import {
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
} from "react-icons/hi";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboardAPI();
      setData(res.data.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Employees",
      value: data?.totalEmployees || 0,
      icon: HiOutlineUsers,
      color: "blue",
      subtitle: `${data?.activeEmployees || 0} active`,
    },
    {
      title: "Pending Claims",
      value: data?.pendingReimbursements || 0,
      icon: HiOutlineClock,
      color: "amber",
      subtitle: `₹${(data?.totalPendingAmount || 0).toLocaleString()}`,
    },
    {
      title: "Approved Claims",
      value: data?.approvedReimbursements || 0,
      icon: HiOutlineCheckCircle,
      color: "emerald",
      subtitle: `₹${(data?.totalApprovedAmount || 0).toLocaleString()}`,
    },
    {
      title: "Rejected Claims",
      value: data?.rejectedReimbursements || 0,
      icon: HiOutlineXCircle,
      color: "red",
      subtitle: "Total rejected",
    },
    {
      title: "Total Approved",
      value: `₹${(data?.totalApprovedAmount || 0).toLocaleString()}`,
      icon: HiOutlineCurrencyRupee,
      color: "purple",
      subtitle: "Total disbursed",
    },
    {
      title: "Total Claims",
      value: data?.totalReimbursements || 0,
      icon: HiOutlineTrendingUp,
      color: "indigo",
      subtitle: "All time",
    },
  ];

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    emerald: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of reimbursement system
        </p>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center`}
              >
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Reimbursements */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Claims
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentReimbursements?.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.employee?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.employee?.employeeId}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{item.title}</td>
                    <td className="py-3 font-semibold text-gray-800">
                      ₹{item.amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            By Category
          </h3>
          <div className="space-y-3">
            {data?.categoryBreakdown?.map((cat) => (
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
            {(!data?.categoryBreakdown ||
              data.categoryBreakdown.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">
                No approved claims yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
