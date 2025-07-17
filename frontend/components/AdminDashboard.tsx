"use client";

import Sidebar from "./AdminSidebar";

export default function AdminDashboard() {
  return (
    <>
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-60">
        <Sidebar />
      </div>
      <main className="pl-64">
        {/* Dashboard content goes here */}
      </main>
    </>
  );
}