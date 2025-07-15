"use client";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import DashboardCommon from "../../../pages/DashboardCommon";

const menuItems = [
  { key: "quiz", label: "Quiz" },
];

export default function QuizHome() {
  return (
    <DashboardCommon
      SidebarComponent={Sidebar}
      menuItems={menuItems}
      userType="Student"
      renderContent={() => (
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="w-full max-w-xs bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h1 className="text-xl font-bold text-slate-800 mb-6">Quiz Portal</h1>
            <Link href="/student/quiz/attempt" className="w-full">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-md transition">
                Attempt Quiz
              </button>
            </Link>
            <Link href="/student/quiz/past" className="w-full mt-2">
              <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm py-2 rounded-md transition">
                View Past Quizzes
              </button>
            </Link>
          </div>
        </div>
      )}
    />
  );
}
