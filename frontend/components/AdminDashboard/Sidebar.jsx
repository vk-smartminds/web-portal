import React from 'react';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineFolder, HiOutlineCog } from 'react-icons/hi';

// Example sections: [{ key: 'home', label: 'Home', icon: <HiOutlineHome /> }, ...]
export default function Sidebar({ sections = [], current, onSectionChange, user }) {
  return (
    <aside className="bg-white shadow h-full rounded-r-2xl flex flex-col items-center py-6 px-2 w-20 md:w-56">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img src="/vk-logo.png" alt="VK Logo" className="w-10 h-10 mb-2" />
        <span className="text-xs font-bold text-gray-700 hidden md:block">VK Portal</span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 w-full">
        <ul className="space-y-2">
          {sections.map((item) => (
            <li key={item.key}>
              <button
                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${current === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => onSectionChange && onSectionChange(item.key)}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* User avatar */}
      <div className="mt-8 flex flex-col items-center">
        <img src={user?.avatar || '/default-avatar.png'} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-gray-200" />
        <span className="text-xs text-gray-500 mt-1 hidden md:block">{user?.name || 'User'}</span>
      </div>
    </aside>
  );
}
