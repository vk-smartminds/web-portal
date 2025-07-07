"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaUserTie, FaBook, FaRegListAlt, FaCog, FaBullhorn, FaChartBar, FaUserShield, FaBars, FaTimes, FaUser, FaBookOpen, FaLaptop, FaFilePdf, FaPalette, FaFileAlt, FaImage, FaBookReader, FaPenFancy, FaTasks, FaFileVideo, FaBell, FaTrashAlt } from "react-icons/fa";
import DashboardCommon from "../DashboardCommon";
import ProtectedRoute from '../../components/ProtectedRoute';
import { getToken, logout } from "../../utils/auth.js";
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

function AdminSidebar({ userEmail, userPhoto, onMenuSelect, selectedMenu, isSuperAdmin, newAnnouncementCount, renderAnnouncementBadge }) {
  const menuItems = [
    { key: "manage-admins-users", label: "Manage Admins and Users", icon: <FaUserShield style={{ fontSize: 18 }} />, action: () => window.location.href = "/manage-admins-users" },
    { key: "manage-books", label: "Manage Books", icon: <FaBook style={{ fontSize: 18 }} /> },
    { key: "records", label: "Records", icon: <FaRegListAlt style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/announcement" },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/cbse-updates" },
    { key: "mindmap", label: "Mind Map", icon: <FaBookOpen style={{ fontSize: 18 }} />, action: () => window.location.href = "/mindmaps" },
    { key: "reports", label: "Reports", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "settings", label: "Settings", icon: <FaCog style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} />, action: () => window.location.href = "/admin/profile" },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} />, action: () => window.location.href = "/avlrs" },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/dlrs" },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} />, action: () => window.location.href = "/creative-corner" },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "notifications", label: "Notifications", icon: <FaBell style={{ fontSize: 18 }} /> },
    { key: "delete-account", label: "Delete Account", icon: <FaTrashAlt style={{ fontSize: 18, color: '#c00' }} />, action: () => window.location.href = "/delete-account" },
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
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Admin Panel</div>
            <img
              src={userPhoto || "/default-avatar.png"}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
            />
            <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
          </div>
          <nav>
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={item.action ? item.action : () => { onMenuSelect(item.key); }}
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
  { key: "manage-admins-users", label: "Manage Admins and Users" },
  { key: "manage-books", label: "Manage Books" },
  { key: "records", label: "Records" },
  { key: "announcements", label: "Announcements" },
  { key: "cbse-updates", label: "CBSE Updates" },
  { key: "mindmap", label: "Mind Map" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
  { key: "profile", label: "Profile" },
  { key: "avlrs", label: "AVLRs" },
  { key: "dlrs", label: "DLRs" },
  { key: "creative-corner", label: "Creative Corner" },
  { key: "discussion-panel", label: "Discussion Panel" },
  { key: "notifications", label: "Notifications" },
  { key: "delete-account", label: "Delete Account" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardCommon
      SidebarComponent={AdminSidebar}
      menuItems={menuItems}
      userType="Admin"
    />
  );
}