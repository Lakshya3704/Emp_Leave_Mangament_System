import React from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import LeaveBalanceComponent from "../components/Leave/LeaveBalance";

const LeaveBalancePage = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar title="Leave Balance" />
      <div className="page-content">
        <LeaveBalanceComponent />
      </div>
    </div>
  </div>
);

export default LeaveBalancePage;
