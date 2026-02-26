import React from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import LeaveForm from "../components/Leave/LeaveForm";

const NewLeavePage = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar title="Apply for Leave" />
      <div className="page-content">
        <LeaveForm />
      </div>
    </div>
  </div>
);

export default NewLeavePage;
