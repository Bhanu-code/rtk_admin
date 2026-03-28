import { ProfileDropdown } from "./ProfileDropdown";
import { Bell, Search } from "lucide-react";

const Navbar = () => {
  return (
    <header className="
      h-14 w-full
      bg-slate-900/95 backdrop-blur-sm
      border-b border-white/5
      px-6 flex items-center justify-between
      sticky top-0 z-30
    ">
      {/* Left — Logo */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-wide hidden sm:block">
          Admin Panel
        </span>
      </div>

      {/* Center — Search */}
      <div className="flex-1 max-w-sm mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="
              w-full bg-white/5 border border-white/5
              rounded-lg pl-9 pr-4 py-1.5
              text-sm text-slate-300 placeholder:text-slate-600
              focus:outline-none focus:border-indigo-500/50 focus:bg-white/8
              transition-all duration-200
            "
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right — Actions + Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 ring-1 ring-slate-900" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;