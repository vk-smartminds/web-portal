"use client";
import DashboardCommon from "../../../pages/DashboardCommon";
// import { getToken, logout } from "../../../utils/auth";
// import ProtectedRoute from '../../../components/ProtectedRoute';
// import { BASE_API_URL } from "../../../utils/apiurl";
import AnnouncementPage from "../../../pages/announcement";
import Sidebar from "../../../components/Sidebar";


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
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" }
];

export default function StudentDashboardPage() {
  return (
    <div>
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