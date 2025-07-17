"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserData, getToken } from "../utils/auth";
import { BASE_API_URL } from "../utils/apiurl";

interface SidebarProps {
  newAnnouncementCount?: number;
  loadingAnnouncement?: boolean;
}

export default function Sidebar({ newAnnouncementCount = 0, loadingAnnouncement = false }: SidebarProps) {
  const [active, setActive] = useState("Dashboard");
  const [staticsOpen, setStaticsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "", photo: "" });
  const [photoUrl, setPhotoUrl] = useState("/default-avatar.png");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Fetch user info from backend for accurate photo (like student dashboard)
    const u = getUserData();
    if (u && u.email) {
      setUser({
        name: u.name || "",
        email: u.email || "",
        photo: ""
      });
      fetch(`${BASE_API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.photo && data.user.photo !== "") {
            setPhotoUrl(data.user.photo);
          } else {
            setPhotoUrl("/default-avatar.png");
          }
        })
        .catch(() => setPhotoUrl("/default-avatar.png"));
    }
    // Check superadmin status
    setIsSuperAdmin(localStorage.getItem("isSuperAdmin") === "true");
  }, []);

  const mainMenu = [
    { label: "Manage Users & Admins", icon: userIcon(), href: "/admin/manage-admins-users" },
    { label: "Creative Corner", icon: paintIcon(), href: "/creative-corner" },
    { label: "Activity", icon: activityIcon(), href: "/admin/activity" },
    { label: "Discussion Panel", icon: messageIcon(), href: "/admin/discussion" }, // Use messageIcon for Discussion Panel
    ...(isSuperAdmin ? [{ label: "Track Screen Time", icon: clockIcon(), href: "/admin/track-screen-time" }] : []),
    { label: "Settings", icon: settingsIcon(), href: "/admin/settings" },
    { label: "Quiz", icon: quizIcon(), href: "/admin/quiz" },
    // { label: "Report", icon: reportIcon() },
  ];

  const announcementMenu = [
    { label: "CBSE Updates", icon: cbseIcon(), href: "/cbse-updates" },
    { label: "Announcements", icon: messageIcon(), href: "/admin/announcements" },
  ];

  const staticsMenu = [
    { label: "AVLRs", icon: laptopIcon(), href: "/avlrs" },
    { label: "DLRs", icon: pdfIcon(), href: "/dlrs" },
    { label: "Mind Maps", icon: chartIcon(), href: "/mindmaps" },
    { label: "SQPs", icon: pdfIcon(), href: "/sqps" },
    { label: "PYQs", icon: pdfIcon(), href: "/pyqs" },
    { label: "PYPs", icon: pdfIcon(), href: "/pyps" },
  ];

  const paymentMenu = [
    { label: "Payroll", icon: payrollIcon() },
    { label: "Billing", icon: billingIcon() },
    { label: "Contact", icon: contactIcon() },
  ];

  return (
    <aside className="bg-[#0D0E12] text-white h-full min-h-screen w-64 flex flex-col p-4 rounded-l-3xl">
      <div>
        {/* User info at the top */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={photoUrl}
            alt="Profile"
            className="w-14 h-14 rounded-full border-2 border-gray-400 mb-2 object-cover"
          />
          <span className="text-base font-bold text-white">
            {user.name ? user.name : user.email}
          </span>
          {user.email && (
            <span className="text-xs text-gray-400 mt-1">{user.email}</span>
          )}
        </div>

        <div className="text-gray-400 text-xs font-semibold mb-2">MAIN MENU</div>
        <nav className="flex flex-col gap-1 mb-6">
          {/* Announcements collapsible menu */}
          <div>
            <button
              onClick={() => setAnnouncementsOpen((prev) => !prev)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-[#1A1B21] transition text-gray-400 w-full"
            >
              {messageIcon()}
              <span>Announcements</span>
              <span className="ml-auto">{announcementsOpen ? "▲" : "▼"}</span>
            </button>
            {announcementsOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                {announcementMenu.map(({ label, icon, href }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (href) router.push(href);
                      setActive(label);
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm hover:bg-[#23243a] transition ${
                      active === label ? "bg-[#23243a] text-white" : "text-gray-400"
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                    {label === "Announcements" && (
                      <span className="ml-2">
                        {loadingAnnouncement ? (
                          <span className="inline-block align-middle">
                            <svg className="animate-spin h-4 w-4 text-purple-400" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          </span>
                        ) : newAnnouncementCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-pink-600 text-white animate-pulse">
                            {newAnnouncementCount}
                          </span>
                        ) : null}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Main menu */}
          {mainMenu.map(({ label, icon, href }) => (
            <button
              key={label}
              onClick={() => {
                if (href) router.push(href);
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
          {/* Statics collapsible menu */}
          <div>
            <button
              onClick={() => setStaticsOpen((prev) => !prev)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-[#1A1B21] transition text-gray-400 w-full"
            >
              {chartIcon()}
              <span>Statics</span>
              <span className="ml-auto">{staticsOpen ? "▲" : "▼"}</span>
            </button>
            {staticsOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                {staticsMenu.map(({ label, icon, href }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (href) router.push(href);
                      setActive(label);
                    }}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm hover:bg-[#23243a] transition ${
                      active === label ? "bg-[#23243a] text-white" : "text-gray-400"
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="text-gray-400 text-xs font-semibold mb-2">PAYMENTS</div>
        <nav className="flex flex-col gap-1 mb-2">
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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.29-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.29 1 1.51.22.1.46.16.71.16H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

// Add icons for new menu items
function paintIcon() {
  return (
    <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h3m12 0h3M12 3v3m0 12v3" />
    </svg>
  );
}
function pdfIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2h9l5 5v15H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2v5h9M9 9v3M9 15h6" />
    </svg>
  );
}
function laptopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 19h20M5 5v14" />
    </svg>
  );
}
function chartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M9 17l3-6 3 6" />
    </svg>
  );
}

function cbseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  );
}

function clockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
  );
}

function quizIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm-3-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}
