"use client";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

export default function QuizHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="pl-80 pt-24 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Quiz Portal</h1>

          <Link href="/quiz/attempt" className="w-full">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 rounded-lg transition">
              Attempt Quiz
            </button>
          </Link>

          <Link href="/quiz/past" className="w-full mt-4">
            <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-lg py-3 rounded-lg transition">
              View Past Quizzes
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
