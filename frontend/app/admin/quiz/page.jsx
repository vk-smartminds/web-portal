"use client";
import DashboardCommon from "../../../pages/DashboardCommon";
import Sidebar from "../../../components/Sidebar";
import AdminQuizPage from "../../../quiz/pages/admin";

const menuItems = [
  { key: "quiz", label: "Quiz" },
];

export default function AdminQuizAppPage() {
  return (
    <DashboardCommon
      SidebarComponent={Sidebar}
      menuItems={menuItems}
      userType="Admin"
      renderContent={() => <AdminQuizPage />}
    />
  );
} 