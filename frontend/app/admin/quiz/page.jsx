"use client";
import Sidebar from '../../../components/AdminSidebar';
import AdminQuizPage from "../../../quiz/pages/admin";

export default function AdminQuizAppPage() {
  return (
    <>
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-60">
        <Sidebar />
      </div>
      <main className="pl-64">
        <AdminQuizPage />
      </main>
    </>
  );
} 