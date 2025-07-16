"use client";
import Sidebar from '../../../components/AdminSidebar';
import AdminQuizPage from "../../../quiz/pages/admin";

export default function AdminQuizAppPage() {
  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-64 z-40">
        <Sidebar />
      </div>
      <main className="pl-64">
        <AdminQuizPage />
      </main>
    </>
  );
} 