import { useState, useEffect } from "react";
import {
  getAllLeaveBalancesAPI,
  updateLeaveBalanceAPI,
  resetLeaveBalancesAPI,
} from "../../services/api";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineRefresh,
  HiOutlineUserCircle,
} from "react-icons/hi";
import styles from "./LeaveBalances.module.css";

const LeaveBalances = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBalances();
  }, [search, department, pagination.page]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await getAllLeaveBalancesAPI({
        search,
        department,
        page: pagination.page,
        limit: 10,
        year: currentYear,
      });
      setBalances(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch leave balances");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedEmployee(item);
    const formData = {};
    item.balance.forEach((b) => {
      formData[b.type] = b.total;
    });
    setEditForm(formData);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const balancesArray = Object.entries(editForm).map(([type, total]) => ({
        type,
        total: parseInt(total),
      }));

      await updateLeaveBalanceAPI(selectedEmployee.employee._id, {
        year: currentYear,
        balances: balancesArray,
      });

      toast.success("Leave balance updated successfully");
      setShowEdit(false);
      fetchBalances();
    } catch (error) {
      toast.error("Failed to update balance");
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        `Reset leave balances for ${currentYear}? This creates default balances for employees who don't have one.`,
      )
    ) {
      try {
        const res = await resetLeaveBalancesAPI({ year: currentYear });
        toast.success(res.data.message);
        fetchBalances();
      } catch (error) {
        toast.error("Reset failed");
      }
    }
  };

  const leaveTypeLabels = {
    casual: "Casual",
    sick: "Sick",
    earned: "Earned",
    compensatory: "Comp",
  };

  const mainTypes = ["casual", "sick", "earned", "compensatory"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Balances</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage employee leave balances for {currentYear}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="btn-secondary flex items-center gap-2"
        >
          <HiOutlineRefresh size={18} />
          Reset Balances
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Balances Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 pl-4 font-medium">Employee</th>
                {mainTypes.map((type) => (
                  <th key={type} className="pb-3 font-medium text-center">
                    {leaveTypeLabels[type]}
                  </th>
                ))}
                <th className="pb-3 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={mainTypes.length + 2}
                    className="text-center py-8 text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td
                    colSpan={mainTypes.length + 2}
                    className="text-center py-8 text-gray-400"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                balances.map((item) => (
                  <tr
                    key={item.employee._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className={styles.empAvatar}>
                          <HiOutlineUserCircle size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            {item.employee.firstName} {item.employee.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.employee.employeeId} •{" "}
                            {item.employee.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    {mainTypes.map((type) => {
                      const b = item.balance.find((x) => x.type === type);
                      return (
                        <td key={type} className="py-3.5 text-center">
                          <div>
                            <span className="font-bold text-gray-800">
                              {b?.available || 0}
                            </span>
                            <span className="text-xs text-gray-400">
                              /{b?.total || 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {b?.used || 0}u • {b?.pending || 0}p
                          </p>
                        </td>
                      );
                    })}
                    <td className="py-3.5 pr-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="Edit Balance"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                disabled={pagination.page === pagination.pages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          setSelectedEmployee(null);
        }}
        title="Edit Leave Balance"
        size="md"
      >
        {selectedEmployee && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">
                {selectedEmployee.employee.firstName}{" "}
                {selectedEmployee.employee.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {selectedEmployee.employee.employeeId} •{" "}
                {selectedEmployee.employee.department}
              </p>
            </div>

            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Total Leave Days Allocation ({currentYear})
            </p>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(editForm).map(([type, value]) => (
                <div key={type}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                    {type} Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        [type]: e.target.value,
                      })
                    }
                    className="input-field text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="submit" className="btn-primary flex-1">
                Update Balance
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEdit(false);
                  setSelectedEmployee(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LeaveBalances;
