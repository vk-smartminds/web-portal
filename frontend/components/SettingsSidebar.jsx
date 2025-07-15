import React from "react";
import { FaUserEdit, FaUser, FaLock, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaQuestionCircle, FaTrashAlt, FaHistory, FaClock } from "react-icons/fa";

const settingsOptions = [
  { key: "update-profile", label: "Update Profile", icon: <FaUserEdit /> },
  { key: "account-settings", label: "Account Settings", icon: <FaUser /> },
  { key: "change-password", label: "Change Password", icon: <FaLock /> },
  { key: "alternative-email", label: "Alternative Email", icon: <FaEnvelope /> },
  { key: "notification", label: "Notification Settings", icon: <FaBell /> },
  { key: "appearance", label: "Appearance", icon: <FaPalette /> },
  { key: "privacy", label: "Privacy Settings", icon: <FaShieldAlt /> },
  { key: "screen-time", label: "Screen Time", icon: <FaClock /> },
  { key: "support", label: "Support & Help", icon: <FaQuestionCircle /> },
  // Add more as needed
];

const accountSubOptions = [
  { key: "delete", label: "Delete Account", icon: <FaTrashAlt /> },
  { key: "login", label: "Login Activity", icon: <FaHistory /> },
];

export default function SettingsSidebar({ selected, onSelect }) {
  const [showAccountSub, setShowAccountSub] = React.useState(false);
  return (
    <aside className="settings-sidebar-custom">
      <div className="sidebar-title-custom">Settings</div>
      <ul>
        {settingsOptions.map(opt => (
          <li
            key={opt.key}
            className={selected === opt.key ? "active-custom" : ""}
            onClick={() => onSelect(opt.key)}
            onMouseEnter={() => {
              if (opt.key === "account-settings") setShowAccountSub(true);
            }}
            onMouseLeave={() => {
              if (opt.key === "account-settings") setTimeout(() => setShowAccountSub(false), 150);
            }}
            style={{ position: "relative" }}
          >
            <span className="icon-custom">{opt.icon}</span>
            {opt.label}
            {/* Submenu for Account Settings */}
            {opt.key === "account-settings" && showAccountSub && (
              <div
                className="account-submenu"
                onMouseEnter={() => setShowAccountSub(true)}
                onMouseLeave={() => setShowAccountSub(false)}
              >
                <ul>
                  {accountSubOptions.map(sub => (
                    <li
                      key={sub.key}
                      className={selected === sub.key ? "active-custom" : ""}
                      onClick={e => {
                        e.stopPropagation();
                        onSelect(sub.key);
                        setShowAccountSub(false);
                      }}
                    >
                      <span className="icon-custom">{sub.icon}</span>
                      {sub.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          position: relative;
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
        .account-submenu {
          position: absolute;
          left: 100%;
          top: 0;
          background: #23272e;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(30,60,114,0.13);
          min-width: 200px;
          z-index: 100;
          padding: 8px 0;
        }
        .account-submenu ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .account-submenu li {
          padding: 12px 24px;
          color: #cfd8dc;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: background 0.18s, color 0.18s;
        }
        .account-submenu li.active-custom, .account-submenu li:hover {
          background: #2563eb;
          color: #fff;
        }
        .account-submenu .icon-custom {
          margin-right: 14px;
        }
      `}</style>
    </aside>
  );
} 