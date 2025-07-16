"use client";

import React from "react";

import DashboardCommon from "../../../pages/DashboardCommon";
// import { getToken, logout } from "../../../utils/auth";
// import ProtectedRoute from '../../../components/ProtectedRoute';
// import { BASE_API_URL } from "../../../utils/apiurl";
import AnnouncementPage from "../../../pages/announcement";
import Sidebar from "../../../components/Sidebar";
import PracticeDashboard from "../../../components/PracticeDashboard";
import BellIcon from '../../../icons/BellIcon';
import { useNotifications } from '../../../components/NotificationProvider';
import { useRouter } from 'next/navigation';


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
  { key: "settings", label: "Settings" }
];

export default function StudentDashboardPage() {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [showNotif, setShowNotif] = React.useState(false);
  const router = useRouter();

  const handleNotifClick = () => {
    setShowNotif((prev) => !prev);
    if (unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length) markAsRead(unreadIds);
    }
  };

  const handleNotificationItemClick = (notif) => {
    setShowNotif(false);
    // If postId is present, scroll to comment, else just open thread
    if (notif.threadId && notif.postId) {
      router.push(`/student/discussion/${notif.threadId}?highlight=${notif.postId}`);
    } else if (notif.threadId) {
      router.push(`/student/discussion/${notif.threadId}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Notification Bell in top right */}
      <div className="absolute top-4 right-6 z-20">
        <button onClick={handleNotifClick} className="p-2 rounded-full hover:bg-gray-100 transition relative">
          <BellIcon className="w-7 h-7 text-gray-700 hover:text-[#4f46e5]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="p-3 border-b font-semibold">Notifications</div>
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-2 text-sm border-b last:border-b-0 cursor-pointer ${n.read ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}
                  onClick={() => handleNotificationItemClick(n)}
                >
                  {n.message}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <DashboardCommon
        SidebarComponent={Sidebar}
        menuItems={menuItems}
        userType="Student"
        renderContent={({ selectedMenu, ...rest }) =>
          selectedMenu === "announcements"
            ? <AnnouncementPage {...rest} />
            : null
        }
      />
    </div>
  );
}