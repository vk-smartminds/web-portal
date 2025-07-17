import React from "react";
import { FaUsers, FaUserTie, FaBook, FaRegListAlt, FaCog, FaBullhorn, FaChartBar, FaUserShield, FaUser, FaBookOpen, FaTasks } from "react-icons/fa";

export default function AdminDashboardSidebar({ userEmail, userPhoto, onMenuSelect, selectedMenu, isSuperAdmin, setShowAddAdmin, setShowRemoveAdmin, setShowViewAdmins }) {
  const menuItems = [
    ...(isSuperAdmin ? [
      { key: "add-admin", label: "Add Admin", icon: <FaUserShield className="text-lg" />, action: () => setShowAddAdmin(true) },
      { key: "remove-admin", label: "Remove Admin", icon: <FaUserShield className="text-lg text-red-700" />, action: () => setShowRemoveAdmin(true) },
      { key: "manage-users", label: "Manage Users", icon: <FaUsers className="text-lg" /> },
    ] : []),
    { key: "view-admins", label: "View Admins", icon: <FaUsers className="text-lg" />, action: () => setShowViewAdmins(true) },
    { key: "manage-books", label: "Manage Books", icon: <FaBook className="text-lg" /> },
    { key: "records", label: "Records", icon: <FaRegListAlt className="text-lg" /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn className="text-lg" /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn className="text-lg" /> },
    { key: "mindmap", label: "Mind Map", icon: <FaBookOpen className="text-lg" /> },
    { key: "reports", label: "Reports", icon: <FaChartBar className="text-lg" /> },
    { key: "settings", label: "Settings", icon: <FaCog className="text-lg" /> },
    { key: "profile", label: "Profile", icon: <FaUser className="text-lg" /> },
    { key: "avlr", label: "AVLR", icon: <FaBookOpen className="text-lg" /> },
    { key: "quiz", label: "Quiz", icon: <FaTasks className="text-lg" />, action: () => window.location.href = "/quiz/admin" },
  ];
  return (
    <aside className="w-[260px] bg-white border-r border-gray-200 min-h-screen pt-8 fixed left-0 top-0 z-[2000] shadow-lg overflow-hidden">
      <div className="h-[calc(100vh-120px)] overflow-y-auto pb-6 flex flex-col">
        <div className="px-6 mb-8 flex flex-col items-center">
          <div className="font-bold text-xl mb-1 self-start text-vkblue">Admin Panel</div>
          <img
            src={userPhoto || "/default-avatar.png"}
            alt="Profile"
            className="w-18 h-18 rounded-full my-3 object-cover shadow-md"
          />
          <div className="text-sm text-gray-500 mb-1">{userEmail}</div>
        </div>
        <nav>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={item.action ? item.action : () => { onMenuSelect(item.key); }}
              className={`flex items-center gap-3 w-full text-left px-7 py-3 text-base font-semibold transition-colors border-l-4 ${selectedMenu === item.key ? 'bg-vkbluelight text-vkblue border-vkblue' : 'border-transparent text-gray-700 hover:bg-vkbluelight/60'} `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => { window.localStorage.clear(); window.location.href = "/login"; }}
          className="mt-8 w-4/5 bg-pink-600 text-white rounded-lg py-2 font-semibold mx-auto self-center shadow hover:bg-pink-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
} 