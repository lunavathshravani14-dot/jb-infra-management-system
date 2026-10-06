'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Search,
  GitFork,
  FileSpreadsheet,
  CreditCard,
  Lock,
  History,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  Shield,
  Menu,
  X,
  UserPlus,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          // If executive, redirect to executive portal
          if (data.user.role === 'EXECUTIVE') {
            router.push('/executive');
          } else {
            setCurrentUser(data.user);
          }
        }
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isRestrictedAdmin = currentUser?.role === 'RESTRICTED_ADMIN';
  const canViewCed = isSuperAdmin || isRestrictedAdmin;

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Pending Applications', href: '/admin/enrollments', icon: FileCheck },
    { name: 'All Executives', href: '/admin/people', icon: Users },
    { name: 'Self Enroll Higher Cadre', href: '/admin/self-enroll', icon: UserPlus },
    { name: 'Universal Search', href: '/admin/search', icon: Search },
    { name: 'Hierarchy Tree', href: '/admin/hierarchy', icon: GitFork },
    { name: 'Reports & Excel', href: '/admin/reports', icon: FileSpreadsheet },
    { name: 'ID Cards & WhatsApp', href: '/admin/id-cards', icon: CreditCard },
    ...(canViewCed
      ? [{ name: 'Confidential CED', href: '/admin/ced', icon: Lock, confidential: true }]
      : []),
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    { name: 'ID Sequences', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 h-screen z-30">
        <div>
          {/* Logo */}
          <Link href="/admin" className="p-5 border-b border-slate-800 flex items-center space-x-3 hover:bg-slate-800/30 transition">
            <img
              src="/logo.png"
              alt="JB Infra Group"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-white text-base tracking-wide">JB INFRA</span>
              </div>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Admin Operations
              </p>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? item.confidential
                        ? 'bg-purple-950/60 border border-purple-800/80 text-purple-300'
                        : 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? item.confidential
                          ? 'text-purple-400'
                          : 'text-blue-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.confidential && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                      CED
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          {currentUser && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                  {currentUser.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                    {currentUser.username}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold uppercase leading-tight">
                    {currentUser.role?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/admin" className="md:hidden flex items-center space-x-2">
              <img src="/logo.png" alt="JB Infra" className="h-7 w-auto object-contain" />
              <span className="font-bold text-white text-sm">JB INFRA</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Management System</span>
              <span>/</span>
              <span className="text-blue-400 font-medium capitalize">
                {pathname.split('/')[2] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/search"
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center space-x-2 border border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Search ID, Name, Mobile, PAN, Aadhaar...</span>
            </Link>

            <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center space-x-1.5">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>{currentUser?.role || 'ADMIN'}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4 text-blue-400" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
