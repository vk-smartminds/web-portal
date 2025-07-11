import ClockIcon from "@/icons/ClockIcon";
import ProfileIcon from "@/icons/ProfileIcon";
import SearchIcon from "@/icons/SearchIcon";

export default function Header() {
  return (
    <header className="w-full bg-[#f5faff] py-4 px-6 flex items-center justify-between shadow-sm">
      {/* Left: Title */}
      <h1 className="text-xl font-semibold text-[#1e3a8a]">Dashboard</h1>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-4 pr-10 py-2 rounded-lg bg-white shadow text-sm text-gray-700 outline-none placeholder-gray-400"
          />
          <SearchIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Right: Timer, Button, Icon */}
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
          1 hour remaining
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md shadow-sm transition">
          New Courses
        </button>

        <ProfileIcon className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />
      </div>
    </header>
  );
}
