import React from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import LeaveDetail from "../components/Leave/LeaveDetail";

const LeaveDetailPage = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar title="Leave Details" />
      <div className="page-content">
        <LeaveDetail />
      </div>
    </div>
  </div>
);

export default LeaveDetailPage;
