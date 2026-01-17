
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, UserCircle, ShieldCheck, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0 relative z-[60] shadow-2xl">
      <div className="p-8">
        <h1 className="text-2xl font-black text-white font-brand flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
            <div className="h-5 w-5 bg-white rounded-sm"></div>
          </div>
          <span className="tracking-tight">AutoBrand</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`mr-4 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-slate-900/50">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group"
        >
          <LogOut className="mr-4 h-4 w-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          Log Out
        </button>
      </div>
    </aside>
  );
};
