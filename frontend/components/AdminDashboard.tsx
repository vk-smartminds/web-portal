"use client";

import Sidebar from "./AdminSidebar";

export default function AdminDashboard() {
  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-64 z-40">
        <Sidebar />
      </div>
      <main className="pl-64">
        {/* Dashboard content goes here */}
      </main>
    </>
  );
}