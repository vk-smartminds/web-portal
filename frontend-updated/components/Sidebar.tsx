import CalenderIcon from "@/icons/CalenderIcon";
import DashboardIcon from "@/icons/DashboardIcon";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#3b68e1] text-white flex flex-col justify-between">
      {/* Top Logo & Profile */}
      <div>
        {/* Logo */}
        <div className="text-center py-4">
          <img src="/logo.svg" alt="Logo" className="h-8 mx-auto" />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 px-4 pb-6">
          <div className="w-10 h-10 rounded-full object-cover border-2 border-white flex justify-center items-center">H</div>
          <div>
            <div className="text-sm font-semibold">Haleema Sultan</div>
            <div className="text-xs text-white/80">Student</div>
          </div>
        </div>

        {/* Section: Learning */}
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70 px-4 mb-2">Learning</p>
          <nav className="space-y-1">
            <SidebarItem icon={<DashboardIcon />} label="Dashboard" active />
            <SidebarItem icon={<CalenderIcon />} label="Time Schedule" />
            {/* <SidebarItem icon={<Bell size={16} />} label="Notifications" />
            <SidebarItem icon={<Flag size={16} />} label="Messages" />
            <SidebarItem icon={<BookOpen size={16} />} label="Learning Plan" />
            <SidebarItem icon={<Settings size={16} />} label="Time Schedule" /> */}
          </nav>
        </div>

        {/* Section: Help */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-white/70 px-4 mb-2">Help & Support</p>
          <nav className="space-y-1">
            {/* <SidebarItem icon={<HelpCircle size={16} />} label="Help/Report" />
            <SidebarItem icon={<Mail size={16} />} label="Contact Us" /> */}
          </nav>
        </div>
      </div>

      {/* Footer: Upgrade */}
      <div className="bg-white rounded-md m-4 text-center py-3 px-4">
        <p className="text-xs text-gray-700">
          Upgrade to <span className="font-bold text-[#3b68e1]">PRO</span> for more resources
        </p>
        <button className="mt-2 bg-[#3b68e1] text-white text-xs py-1.5 px-4 rounded-md hover:bg-blue-700 transition">
          Upgrade
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center px-4 py-2 text-sm font-medium cursor-pointer hover:bg-[#3157c4] transition ${
        active ? "bg-white text-[#3b68e1] rounded-l-full pr-6" : "text-white/90"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </div>
  );
}
