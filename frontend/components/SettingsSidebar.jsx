import React from "react";
import { FaUserEdit, FaUser, FaLock, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaQuestionCircle } from "react-icons/fa";

const settingsOptions = [
  { key: "update-profile", label: "Update Profile", icon: <FaUserEdit /> },
  { key: "account-settings", label: "Account Settings", icon: <FaUser /> },
  { key: "change-password", label: "Change Password", icon: <FaLock /> },
  { key: "alternative-email", label: "Alternative Email", icon: <FaEnvelope /> },
  { key: "notification", label: "Notification Settings", icon: <FaBell /> },
  { key: "appearance", label: "Appearance", icon: <FaPalette /> },
  { key: "privacy", label: "Privacy Settings", icon: <FaShieldAlt /> },
  { key: "support", label: "Support & Help", icon: <FaQuestionCircle /> },
  // Add more as needed
];

export default function SettingsSidebar({ selected, onSelect }) {
  return (
    <aside className="settings-sidebar-custom">
      <div className="sidebar-title-custom">Settings</div>
      <ul>
        {settingsOptions.map(opt => (
          <li
            key={opt.key}
            className={selected === opt.key ? "active-custom" : ""}
            onClick={() => onSelect(opt.key)}
          >
            <span className="icon-custom">{opt.icon}</span>
            {opt.label}
          </li>
        ))}
      </ul>
      <style jsx>{`
        .settings-sidebar-custom {
          width: 220px;
          background: #181d23;
          border-right: 1px solid #23272e;
          padding: 32px 0 0 0;
          min-height: 100vh;
          color: #fff;
          font-family: 'Segoe UI', 'Arial', sans-serif;
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }
        .sidebar-title-custom {
          font-weight: bold;
          font-size: 1.3rem;
          margin-bottom: 28px;
          text-align: center;
          letter-spacing: 1px;
          color: #fff;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 14px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 8px;
          margin-bottom: 6px;
          transition: background 0.2s, color 0.2s;
          color: #cfd8dc;
        }
        li.active-custom, li:hover {
          background: #2563eb;
          color: #fff;
        }
        .icon-custom {
          margin-right: 16px;
          font-size: 1.1em;
          display: flex;
          align-items: center;
        }
      `}</style>
    </aside>
  );
} 