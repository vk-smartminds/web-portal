
"use client";
import ProfileIcon from "@/icons/ProfileIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function LandingHeader() {
    const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ];
  return (<nav className="flex justify-between items-center px-10 py-6">
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
        <Link href="/login"><ProfileIcon /></Link>
      </nav>
  );
}