import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/Layout/AdminLayout";
import EmployeeLayout from "./components/Layout/EmployeeLayout";


import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageEmployees from "./pages/Admin/ManageEmployees";
import ManageReimbursements from "./pages/Admin/ManageReimbursements";
import ManageLeaves from "./pages/Admin/ManageLeaves";
import LeaveBalances from "./pages/Admin/LeaveBalances";
import RegisterAdmin from "./pages/Admin/RegisterAdmin";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import MyReimbursements from "./pages/Employee/MyReimbursements";
import NewReimbursement from "./pages/Employee/NewReimbursement";
import MyLeaves from "./pages/Employee/MyLeaves";
import ApplyLeave from "./pages/Employee/ApplyLeave";
import Profile from "./pages/Employee/Profile";
import Loader from "./components/Common/Loader";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      {/* ========== PUBLIC ========== */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin/dashboard"
                  : "/employee/dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin/dashboard"
                  : "/employee/dashboard"
              }
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* ========== ADMIN ========== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageEmployees />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reimbursements"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageReimbursements />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaves"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ManageLeaves />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leave-balances"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <LeaveBalances />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/register-admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <RegisterAdmin />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== EMPLOYEE ========== */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <EmployeeDashboard />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/reimbursements"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <MyReimbursements />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/new-reimbursement"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <NewReimbursement />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/my-leaves"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <MyLeaves />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/apply-leave"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <ApplyLeave />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout>
              <Profile />
            </EmployeeLayout>
          </ProtectedRoute>
        }
      />

      {/* ========== DEFAULT ========== */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === "admin"
                  ? "/admin/dashboard"
                  : "/employee/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
