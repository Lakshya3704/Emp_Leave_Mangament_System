import React from "react";
import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import LeaveCalendar from "../components/Leave/LeaveCalendar";

const LeaveCalendarPage = () => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Navbar title="Leave Calendar" />
      <div className="page-content">
        <LeaveCalendar />
      </div>
    </div>
  </div>
);

export default LeaveCalendarPage;
