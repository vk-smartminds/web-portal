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

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

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

      {/* Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ProfileIcon className="w-6 h-6 text-gray-600 hover:text-[#4f46e5]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleProfile}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}