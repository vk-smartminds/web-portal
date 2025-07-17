"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileIcon from "../icons/ProfileIcon";
import Link from "next/link";
import { getToken, logout } from "../utils/auth";
import BellIcon from '../icons/BellIcon';
import { useNotifications } from './NotificationProvider';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [signupDropdown, setSignupDropdown] = useState(false);
  const signupRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      setShowDropdown((prev) => !prev);
    } else {
      setIsLoggedIn(false);
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setIsLoggedIn(false);
    router.push("/login");
  };

  const handleProfile = () => {
    setShowDropdown(false);
    router.push("/student/profile");
  };

  const handleNotifClick = () => {
    setShowNotif((prev) => !prev);
    // Mark all as read when opening
    if (unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length) markAsRead(unreadIds);
    }
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Catalogue", href: "/catalogue" },
    { label: "Contact", href: "/contact" },
  ];

  // Helper: is Home, is Login
  const isHome = pathname === "/";
  const isLogin = pathname === "/login";

  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-md bg-opacity-90 shadow-md px-6 md:px-10 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <img
          src="https://media.licdn.com/dms/image/v2/D560BAQEiRiYRaNIksg/company-logo_200_200/company-logo_200_200/0/1726037885587/vk_global_publications_logo?e=2147483647&v=beta&t=zU5B8ipnAop9UTACFSvWmMWQyE2cjekzGEAfLRBrYoQ"
          alt="VK Global"
          className="w-10 h-10 rounded-md object-cover"
        />
      </Link>

      {/* Navigation */}
      <ul className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-700">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`transition px-4 py-2 rounded-full ${
                  isActive
                    ? "bg-[#4f46e5] text-white shadow font-semibold"
                    : "hover:bg-[#4f46e510] hover:text-[#4f46e5]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Show nothing on Login page */}
        {!isLogin && (
          <>
            {/* Home page: show LOGIN and SIGN UP if not logged in, else Profile+Logout */}
            {isHome ? (
              isLoggedIn ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Profile"
                  >
                    <ProfileIcon className="w-6 h-6 text-gray-600 hover:text-[#4f46e5]" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Logout"
                  >
                    {/* Simple logout SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 hover:text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 rounded-full bg-[#4f46e5] text-white font-semibold hover:bg-[#3730a3] transition"
                  >
                    LOGIN
                  </button>
                  <div
                    className="relative"
                    ref={signupRef}
                    onMouseEnter={() => setSignupDropdown(true)}
                    onMouseLeave={() => setSignupDropdown(false)}
                  >
                    <button
                      onClick={() => setSignupDropdown((v) => !v)}
                      className="px-4 py-2 rounded-full bg-[#6366f1] text-white font-semibold hover:bg-[#3730a3] transition ml-2"
                      aria-haspopup="true"
                      aria-expanded={signupDropdown}
                    >
                      SIGN UP
                    </button>
                    {signupDropdown && (
                      <div
                        className="absolute right-0 top-full w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in"
                        // No mouse events needed here, parent handles persistence
                      >
                        <button
                          onClick={() => { setSignupDropdown(false); router.push("/student/register"); }}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Student
                        </button>
                        <button
                          onClick={() => { setSignupDropdown(false); router.push("/teacher/register"); }}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Teacher
                        </button>
                        <button
                          onClick={() => { setSignupDropdown(false); router.push("/guardian/register"); }}
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Guardian
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )
            ) : (
              // Other pages: show Profile+Logout if logged in, else LOGIN
              isLoggedIn ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Profile"
                  >
                    <ProfileIcon className="w-6 h-6 text-gray-600 hover:text-[#4f46e5]" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Logout"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 hover:text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-full bg-[#4f46e5] text-white font-semibold hover:bg-[#3730a3] transition"
                >
                  LOGIN
                </button>
              )
            )}
          </>
        )}
      </div>
    </nav>
  );
}