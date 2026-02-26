import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./Admin/AdminDashboard";
import EmployeeDashboard from "./Employee/EmployeeDashboard";

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === "admin" || user?.role === "manager") {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default DashboardPage;
