import React from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import LeaveList from "../components/Leave/LeaveList";

const LeavesPage = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar title="My Leaves" />
      <div className="page-content">
        <LeaveList />
      </div>
    </div>
  </div>
);

export default LeavesPage;
