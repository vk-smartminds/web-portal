"use client";
import { useState } from "react";

export default function Sidebar({
  userEmail,
  userPhoto,
  userName,
  onMenuSelect,
  selectedMenu,
  renderAnnouncementBadge,
  newAnnouncementCount,
}) {
  const [staticsOpen, setStaticsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleStatics = () => setStaticsOpen((prev) => !prev);
  const toggleAnnouncements = () => setAnnouncementsOpen((prev) => !prev);
  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const icons = {
    cbse: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
    announcements: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8a6 6 0 00-12 0v4a6 6 0 0012 0V8z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    quiz: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6M9 8h6M4 6h16M4 18h16" />
      </svg>
    ),
    book: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20h9M12 4h9M3 6h18M3 18h18M3 6v12" />
      </svg>
    ),
    laptop: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 19h20M5 5v14" />
      </svg>
    ),
    pdf: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2h9l5 5v15H6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v5h9M9 9v3M9 15h6" />
      </svg>
    ),
    chart: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M9 17l3-6 3 6" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7.972 7.972 0 0112 15a7.972 7.972 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    paint: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h3m12 0h3M12 3v3m0 12v3" />
      </svg>
    ),
    bell: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V9a6 6 0 10-12 0v5c0 .183-.035.359-.101.526L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    cog: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3a3.75 3.75 0 013.75 0m4.5 2.25a3.752 3.752 0 00-4.5-2.25m-3 0a3.75 3.75 0 11-3.75 0m3 18a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
  };

  const staticsItems = [
    { key: "avlrs", label: "AVLRs", icon: icons.laptop, href: "/avlrs" },
    { key: "dlrs", label: "DLRs", icon: icons.pdf, href: "/dlrs" },
    { key: "mind-maps", label: "Mind Maps", icon: icons.chart, href: "/mindmaps" },
    { key: "sqps", label: "SQPs", icon: icons.pdf, href: "/sqps" },
    { key: "pyqs", label: "PYQs", icon: icons.pdf, href: "/pyqs" },
    { key: "pyps", label: "PYPs", icon: icons.pdf, href: "/pyps" },
  ];

  const announcementItems = [
    { key: "cbse-updates", label: "CBSE Updates", icon: icons.cbse, href: "/cbse-updates" },
    { key: "announcements", label: "Announcements", icon: icons.announcements, href: "/announcement" },
  ];

  const menuItems = [
    // "Statics" is handled separately
    { key: "quiz", label: "Quiz", icon: icons.quiz, href: "/student/quiz" },
    { key: "discussion-panel", label: "Discussion Panel", icon: icons.user, href: "/student/discussion" },
    { key: "creative-corner", label: "Creative Corner", icon: icons.paint, href: "/creative-corner" },
    { key: "books", label: "Books", icon: icons.book },
    { key: "performance", label: "Performance", icon: icons.chart },
    { key: "settings", label: "Settings", icon: icons.cog, href: "/settings" },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-200">
            Student Panel
          </h2>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>

        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 flex">
          <img
            src={userPhoto || "/default-avatar.png"}
            alt="profile"
            className="w-12 h-12 rounded-full object-cover mb-2"
          />
          <div>
            {userName && <div className="font-semibold text-indigo-900 dark:text-white">{userName}</div>}
            <div className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {/* Announcements Section */}
        <div className="px-2">
          <button
            onClick={toggleAnnouncements}
            className="w-full flex items-center px-3 py-2 text-sm font-semibold text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <span className="mr-2">{icons.chart}</span>
            {!collapsed && <span className="flex-1">Announcements</span>}
            {!collapsed && <span className="transform transition-transform">{announcementsOpen ? "▲" : "▼"}</span>}
          </button>
          {!collapsed && announcementsOpen && (
            <div className="space-y-1">
              {announcementItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    item.href ? (window.location.href = item.href) : onMenuSelect(item.key)
                  }
                  className={`flex items-center px-3 py-2 gap-2 text-sm rounded-md w-full text-left ${
                    selectedMenu === item.key
                      ? "bg-indigo-100 dark:bg-gray-700 text-indigo-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.key === "announcements" && renderAnnouncementBadge && renderAnnouncementBadge(newAnnouncementCount)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Menu Items */}
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() =>
              item.href ? (window.location.href = item.href) : onMenuSelect(item.key)
            }
            className={`flex items-center px-3 py-2 gap-2 text-sm rounded-md w-full text-left ${
                    selectedMenu === item.key
                      ? "bg-indigo-100 dark:bg-gray-700 text-indigo-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
          >
            {item.icon}
            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          </button>
        ))}

        {/* Statics Section */}
        <div className="px-2">
          <button
            onClick={toggleStatics}
            className="w-full flex items-center px-3 py-2 text-sm font-semibold text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <span className="mr-2">{icons.chart}</span>
            {!collapsed && <span className="flex-1">Statics</span>}
            {!collapsed && <span className="transform transition-transform">{staticsOpen ? "▲" : "▼"}</span>}
          </button>
          {!collapsed && staticsOpen && (
            <div className="space-y-1">
              {staticsItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    item.href ? (window.location.href = item.href) : onMenuSelect(item.key)
                  }
                  className={`flex items-center px-3 py-2 gap-2 text-sm rounded-md w-full text-left ${
                    selectedMenu === item.key
                      ? "bg-indigo-100 dark:bg-gray-700 text-indigo-800 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
