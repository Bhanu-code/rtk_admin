import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/redux/userRedux";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Settings, User, LogOut } from "lucide-react";

export function ProfileDropdown() {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const firstName = useSelector((state: any) => state.user.firstName);
  const lastName  = useSelector((state: any) => state.user.lastName);

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-200 outline-none">
          {/* Avatar */}
          <div className="h-7 w-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {initials || "U"}
          </div>
          {/* Name + role */}
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-slate-200 text-xs font-medium">{fullName || "User"}</span>
            <span className="text-slate-500 text-[11px]">Admin</span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 bg-slate-800 border-white/10 text-slate-300 p-1.5">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b border-white/10">
          <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {initials || "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-200 text-sm font-medium truncate">{fullName || "User"}</span>
            <span className="text-slate-500 text-xs truncate">Admin</span>
          </div>
        </div>

        <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white">
          <User className="h-4 w-4 text-slate-500" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white">
          <Settings className="h-4 w-4 text-slate-500" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        <DropdownMenuItem
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
          onClick={() => { dispatch(logOut()); navigateTo("/"); }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}