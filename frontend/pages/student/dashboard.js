"use client";
import React, { useEffect, useState } from "react";
import { FaClipboardList, FaBookOpen, FaChartBar, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser, FaTrashAlt, FaFilePdf, FaPalette, FaFileVideo, FaBell, FaRegListAlt } from "react-icons/fa";
import DashboardCommon from "../DashboardCommon";
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from "../../utils/apiurl";

// Add this style block at the top of the file (or in a global CSS if preferred)
const blinkStyle = `
@keyframes blink-badge {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.blink-badge {
  animation: blink-badge 1s steps(1, end) infinite;
}
`;

function StudentSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu, profile, newAnnouncementCount, renderAnnouncementBadge }) {
  const menuItems = [
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaRegListAlt style={{ fontSize: 18 }} />, action: () => window.location.href = "/cbse-updates" },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/announcement" },
    { key: "quizzes", label: "Quizzes", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "sample-papers", label: "Sample Papers", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} />, action: () => window.location.href = "/avlrs" },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/dlrs" },
    { key: "mind-maps", label: "Mind Maps", icon: <FaChartBar style={{ fontSize: 18 }} />, action: () => window.location.href = "/mindmaps" },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} />, action: () => window.location.href = "/creative-corner" },
    { key: "books", label: "Books", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "performance", label: "Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} />, action: () => window.location.href = "/student/profile" },
    { key: "delete-account", label: "Delete Account", icon: <FaTrashAlt style={{ fontSize: 18, color: '#c00' }} />, action: () => window.location.href = "/delete-account" },
    { key: "notifications", label: "Notifications", icon: <FaBell style={{ fontSize: 18 }} /> },
  ];
  return (
    <>
      <style>{blinkStyle}</style>
      <aside style={{
        width: 300,
        background: "#fff",
        borderRight: "1px solid #e0e0e0",
        minHeight: "100vh",
        padding: "32px 0 0 0",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2000,
        boxShadow: "2px 0 16px rgba(30,60,114,0.07)",
        overflow: "hidden"
      }}>
        <div style={{ height: "calc(100vh - 120px)", overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Student Panel</div>
            <img
              src={userPhoto || "/default-avatar.png"}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
            />
            {userName && <div style={{ fontWeight: 600, fontSize: 16, color: "#1e3c72", marginBottom: 2 }}>{userName}</div>}
            <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
          </div>
          <nav>
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={() => { item.action ? item.action() : onMenuSelect(item.key); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  background: selectedMenu === item.key ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "none",
                  border: "none",
                  textAlign: "left",
                  padding: "14px 28px",
                  fontSize: 17,
                  color: selectedMenu === item.key ? "#1e3c72" : "#444",
                  cursor: "pointer",
                  fontWeight: 600,
                  borderLeft: selectedMenu === item.key ? "4px solid #1e3c72" : "4px solid transparent",
                  transition: "background 0.18s, color 0.18s",
                  position: "relative"
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                <span style={{ display: "flex", alignItems: "center" }}>{item.label}</span>
                {item.key === "announcements" && renderAnnouncementBadge && renderAnnouncementBadge(newAnnouncementCount)}
              </button>
            ))}
          </nav>
          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            style={{
              margin: "32px auto 0 auto",
              width: "80%",
              background: "#ff0080",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "center"
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

const menuItems = [
  { key: "cbse-updates", label: "CBSE Updates" },
  { key: "announcements", label: "Announcements" },
  { key: "quizzes", label: "Quizzes" },
  { key: "sample-papers", label: "Sample Papers" },
  { key: "avlrs", label: "AVLRs" },
  { key: "dlrs", label: "DLRs" },
  { key: "mind-maps", label: "Mind Maps" },
  { key: "discussion-panel", label: "Discussion Panel" },
  { key: "creative-corner", label: "Creative Corner" },
  { key: "books", label: "Books" },
  { key: "performance", label: "Performance" },
  { key: "profile", label: "Profile" },
  { key: "delete-account", label: "Delete Account" },
  { key: "notifications", label: "Notifications" },
];

export default function StudentDashboardPage() {
  return (
    <DashboardCommon
      SidebarComponent={StudentSidebar}
      menuItems={menuItems}
      userType="Student"
    />
  );
}


