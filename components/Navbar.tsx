
import React from 'react';
import { Bell, Search, User, ChevronDown, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar: React.FC = () => {
  const { user } = useStore();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-200/50">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm" 
          placeholder="Search for festivals, occasions, or assets..." 
        />
      </div>

      <div className="flex items-center gap-8 ml-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center relative">
            <Bell className="h-5 w-5 text-indigo-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">3</span>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200"></div>

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.brand?.companyName || user?.name}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center justify-end gap-1">
              <Sparkles className="h-2.5 w-2.5" /> PRO ACCOUNT
            </p>
          </div>
          <div className="h-12 w-12 rounded-[1rem] bg-slate-100 border-2 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            {user?.brand?.logoUrl ? (
              <img src={user.brand.logoUrl} className="w-full h-full object-contain p-1.5" alt="Logo" />
            ) : (
              <User className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
        </div>
      </div>
    </header>
  );
};
