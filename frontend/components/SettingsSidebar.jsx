import React from "react";

const settingsOptions = [
  { key: "update-profile", label: "Update Profile", icon: "📝" },
  { key: "change-password", label: "Change Password", icon: "🔑" },
  { key: "alternative-email", label: "Alternative Email", icon: "✉️" },
  { key: "account-settings", label: "Account Settings", icon: "⚙️" },
  { key: "notification", label: "Notification Settings", icon: "🔔" },
  { key: "appearance", label: "Appearance", icon: "🎨" },
  { key: "privacy", label: "Privacy Settings", icon: "🔒" },
  { key: "payment", label: "Payment & Subscriptions", icon: "💳" },
  { key: "support", label: "Support & Help", icon: "💬" },
];

export default function SettingsSidebar({ selected, onSelect }) {
  return (
    <aside className="settings-sidebar">
      <div className="sidebar-title">Settings</div>
      <ul>
        {settingsOptions.map(opt => (
          <li
            key={opt.key}
            className={selected === opt.key ? "active" : ""}
            onClick={() => onSelect(opt.key)}
          >
            <span className="icon">{opt.icon}</span>
            {opt.label}
          </li>
        ))}
      </ul>
      <style jsx>{`
        .settings-sidebar {
          width: 220px;
          background: #f8fafc;
          border-right: 1px solid #e5e7eb;
          padding: 24px 0;
          min-height: 100vh;
        }
        .sidebar-title {
          font-weight: bold;
          font-size: 1.2rem;
          margin-bottom: 24px;
          text-align: center;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          padding: 12px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 6px;
          margin-bottom: 4px;
          transition: background 0.2s;
        }
        li.active, li:hover {
          background: #e0e7ff;
        }
        .icon {
          margin-right: 12px;
        }
      `}</style>
    </aside>
  );
} 