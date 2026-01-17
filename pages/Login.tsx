
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';
import { Mail, User, Briefcase, ChevronRight, Sparkles, ShieldCheck, ShoppingCart, KeyRound, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) login(email, role);
  };

  const roleConfigs = {
    USER: { title: 'Client Workspace', icon: User, desc: 'Enterprise auto-branding tools.', accent: 'indigo' },
    CREATOR: { title: 'Seller Portal', icon: ShoppingCart, desc: 'Monetize your creative assets.', accent: 'emerald' },
    ADMIN: { title: 'System Console', icon: ShieldCheck, desc: 'Master repository control.', accent: 'rose' }
  };

  const currentRole = roleConfigs[role];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[160px] animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4.5rem] p-16 shadow-[0_0_150px_rgba(0,0,0,0.7)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 bg-indigo-600 p-6 rounded-[2.25rem] mb-10 shadow-2xl shadow-indigo-600/50 group hover:scale-110 transition-transform duration-500">
            <Sparkles className="text-white h-10 w-10 group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-5xl font-black text-white font-brand tracking-tighter mb-4">AutoBrand <span className="text-indigo-400">Studio</span></h1>
          <p className="text-slate-400 font-medium text-lg px-8">The autonomous production engine for brand-aligned creatives.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex bg-slate-900/60 p-2 rounded-[2.5rem] border border-white/5">
            {(['USER', 'CREATOR', 'ADMIN'] as const).map((r) => {
              const Icon = roleConfigs[r].icon;
              const isActive = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setPassword(''); // Clear password when switching roles
                  }}
                  className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-[2rem] transition-all duration-500 ${
                    isActive 
                      ? 'bg-white text-slate-950 shadow-2xl scale-105' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{r === 'USER' ? 'Client' : r === 'CREATOR' ? 'Seller' : 'Admin'}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-black text-white tracking-tight">{currentRole.title}</h2>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">{currentRole.desc}</p>
          </div>

          <div className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                required
                placeholder="Access ID / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-white placeholder-slate-600 focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
              />
            </div>
            
            {role !== 'ADMIN' && (
              <div className="relative group animate-in slide-in-from-top-2 duration-300">
                <KeyRound className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Security Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-6 text-white placeholder-slate-600 focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                />
              </div>
            )}
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-3">
               <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
               <p className="text-[10px] text-slate-400 font-medium">Master Access ID: <span className="text-indigo-300 font-bold">admin@autobrand.studio</span></p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-7 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-700 hover:-translate-y-1.5 transition-all flex items-center justify-center gap-5 shadow-2xl shadow-indigo-600/40 group active:scale-95"
          >
            Enter Workspace <ChevronRight className="h-8 w-8 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};
