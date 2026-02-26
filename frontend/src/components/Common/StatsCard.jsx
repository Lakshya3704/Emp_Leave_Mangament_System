import React from "react";

const colorMap = {
  blue: { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  green: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  yellow: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  red: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  purple: { bg: "#FAF5FF", text: "#9333EA", border: "#E9D5FF" },
  indigo: { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" },
  pink: { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
  orange: { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
};

const StatsCard = ({ icon, label, value, color = "blue" }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <div>
        <p
          style={{
            fontSize: "13px",
            color: "#6B7280",
            marginBottom: "4px",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
