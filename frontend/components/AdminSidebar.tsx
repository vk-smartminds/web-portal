"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");
  const router = useRouter();

  const mainMenu = [
    { label: "Dashboard", icon: dashboardIcon()},
    { label: "Users", icon: calendarIcon()},
    { label: "Announcements", icon: messageIcon() },
    { label: "Activity", icon: activityIcon() },
    // { label: "Report", icon: reportIcon() },
  ];

  const paymentMenu = [
    { label: "Payroll", icon: payrollIcon() },
    { label: "Billing", icon: billingIcon() },
    { label: "Contact", icon: contactIcon() },
  ];

  return (
    <aside className="bg-[#0D0E12] text-white h-screen w-64 flex flex-col justify-between p-4">
      <div>
        <div className="text-xl font-bold mb-8 flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
          <span>HR Manager</span>
        </div>

        <div className="text-gray-400 text-xs font-semibold mb-2">MAIN MENU</div>
        <nav className="flex flex-col gap-1 mb-6">
          {mainMenu.map(({ label, icon }) => (
            // <Link href={`/admin/${label.toLowerCase()}`} key={label}>
              <button
                key={label}
                onClick={() => {
                  // Navigate to the corresponding page
                  router.push(`/admin/${label.toLowerCase()}`);
                  setActive(label);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-[#1A1B21] transition ${
                  active === label ? "bg-[#1A1B21] text-white" : "text-gray-400"
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
          ))}
        </nav>

        <div className="text-gray-400 text-xs font-semibold mb-2">PAYMENTS</div>
        <nav className="flex flex-col gap-1">
          {paymentMenu.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-[#1A1B21] transition ${
                active === label ? "bg-[#1A1B21] text-white" : "text-gray-400"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/settings">          
            <div className="text-gray-400 text-sm flex items-center gap-3 hover:text-white transition">{settingsIcon()} Settings</div>
          </Link>
          <button className="text-gray-400 text-sm flex items-center gap-3 hover:text-white transition">{userIcon()} User Management</button>
          <button className="text-gray-400 text-sm flex items-center gap-3 hover:text-white transition">{supportIcon()} Help & Support</button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#1A1B21] rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gray-500"></div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Austin Martin</span>
            <span className="text-xs text-gray-400">austin@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function dashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zm0-8h8V3h-8v10zM3 21h8v-6H3v6z" />
    </svg>
  );
}

function calendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function teamsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  );
}

function activityIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function messageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function reportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 17v-2a4 4 0 1 1 8 0v2M9 17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4m0 0V3h4v2m0 0h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

function payrollIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
      <path d="M19.4 15a9 9 0 1 0-14.8 0" />
    </svg>
  );
}

function billingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 3h18v18H3V3z" />
      <path d="M16 3v18" />
      <path d="M8 3v18" />
    </svg>
  );
}

function contactIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function settingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.29-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.29 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09c0 .7.4 1.29 1 1.51.22.1.46.16.71.16H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function userIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
    </svg>
  );
}

function supportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 10c0-3.31-2.69-6-6-6S6 6.69 6 10v4h12v-4z" />
      <path d="M6 14a6 6 0 0 0 12 0" />
    </svg>
  );
}
