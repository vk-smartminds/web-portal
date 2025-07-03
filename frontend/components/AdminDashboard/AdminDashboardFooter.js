import React from "react";

export default function AdminDashboardFooter() {
  return (
    <footer className="w-full bg-vkblue text-white text-center py-4 text-sm shadow-md relative">
      © {new Date().getFullYear()} VK Admin Portal. All rights reserved. | Demo Footer Info
    </footer>
  );
} 