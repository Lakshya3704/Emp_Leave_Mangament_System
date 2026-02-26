import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leaveAPI } from "../../services/api";
import Loader from "../Common/Loader";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchCalendar();
  }, [month, year]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await leaveAPI.getCalendar({ month, year });
      setLeaves(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar grid calculation
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      currentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month days
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  // Get leaves for a specific date
  const getLeavesForDate = (date) => {
    return leaves.filter((l) => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const d = new Date(date);
      d.setHours(12, 0, 0, 0);
      return d >= start && d <= end;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="calendar-container">
      <div className="calendar-header-bar">
        <h3>
          🗓️ {MONTH_NAMES[month]} {year}
        </h3>
        <div className="calendar-nav">
          <button onClick={prevMonth}>◀ Prev</button>
          <button onClick={goToday}>Today</button>
          <button onClick={nextMonth}>Next ▶</button>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-day-header">
            {d}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((cd, idx) => {
          const dayLeaves = getLeavesForDate(cd.date);
          return (
            <div
              key={idx}
              className={`calendar-day ${!cd.currentMonth ? "other-month" : ""} ${isToday(cd.date) ? "today" : ""}`}
            >
              <div className="day-number">
                {isToday(cd.date) ? (
                  <span
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                    }}
                  >
                    {cd.day}
                  </span>
                ) : (
                  cd.day
                )}
              </div>

              {dayLeaves.slice(0, 3).map((l, i) => (
                <Link
                  key={i}
                  to={`/leaves/${l._id}`}
                  className={`calendar-event ${l.status}`}
                  title={`${l.employee?.firstName} ${l.employee?.lastName} - ${l.leaveType}`}
                >
                  {l.employee?.firstName?.[0]}
                  {l.employee?.lastName?.[0]} {l.leaveType}
                </Link>
              ))}

              {dayLeaves.length > 3 && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-secondary)",
                    padding: "0 4px",
                  }}
                >
                  +{dayLeaves.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "20px",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#d1fae5",
            }}
          ></div>
          Approved
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#fef3c7",
            }}
          ></div>
          Pending
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendar;
