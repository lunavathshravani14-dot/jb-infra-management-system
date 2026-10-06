'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  FileText,
  CreditCard,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/auth/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <a href="/executive" className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="JB Infra Group"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base tracking-wide">JB INFRA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700/50 text-blue-300">
                  Executive Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Associate Onboarding & Cadre Self-Service</p>
            </div>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <a
              href="/executive"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                pathname === '/executive'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Dashboard & Status
            </a>
            <a
              href="/executive/enroll"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                pathname === '/executive/enroll'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Enrollment Form
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                {currentUser.username?.[0]?.toUpperCase() || 'E'}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser.person?.fullName || currentUser.username}
                </div>
                <div className="text-[10px] text-blue-400 font-mono leading-tight">
                  {currentUser.person?.permanentId ? `ID: ${currentUser.person.permanentId}` : 'Associate'}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition flex items-center space-x-1 text-xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        {children}
      </div>

      <footer className="border-t border-slate-800 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        JB Infra Executive Portal • One Person = One Permanent Unique ID
      </footer>
    </div>
  );
}
