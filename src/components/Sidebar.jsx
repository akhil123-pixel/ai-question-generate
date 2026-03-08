import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Sparkles, 
  History, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileUp, label: 'Upload Resume', path: '/upload' },
    { icon: Sparkles, label: 'Generate Questions', path: '/generate' },
    { icon: History, label: 'History', path: '/history' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <div className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
              isActive 
                ? "bg-primary-50 text-primary-600 font-bold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={clsx(
                "transition-colors",
                "group-hover:text-primary-500"
              )} />
              <span>{item.label}</span>
            </div>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
