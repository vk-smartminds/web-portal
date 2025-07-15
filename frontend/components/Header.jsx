"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileIcon from "../icons/ProfileIcon";
import Link from "next/link";
import { getToken, logout } from "../utils/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white flex justify-between items-center px-10 py-6 shadow-sm">
      <div className="flex items-center gap-2 font-bold text-lg text-[#4f46e5]">
        <svg width="28" height="28" viewBox="0 0 512 512" fill="#4f46e5">
          <circle cx="256" cy="256" r="200" />
        </svg>
        <span>VK Global</span>
      </div>

      <ul className="hidden md:flex gap-6 text-sm items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`transition px-3 py-1.5 rounded-full ${
                  isActive
                    ? "bg-black text-white font-semibold"
                    : "text-gray-700 hover:bg-black/10"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleProfileClick}
          className="outline-none border-none bg-transparent"
        >
          <ProfileIcon className="w-6 h-6 text-gray-700 hover:text-black transition-colors" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
            <button
              onClick={handleProfile}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
