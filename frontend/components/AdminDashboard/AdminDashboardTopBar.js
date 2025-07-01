import React from "react";

export default function AdminDashboardTopBar() {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm z-10">
      <img src="/vk-logo.png" alt="VK Logo" className="h-9 w-9 mr-4" />
      <span className="font-bold text-xl text-vkblue tracking-wide">VK Admin Dashboard</span>
      <div className="flex-1" />
      {/* Future: User menu, notifications, etc. */}
    </header>
  );
} 