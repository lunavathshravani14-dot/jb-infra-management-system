'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, KeyRound, ArrowRight, AlertCircle, Lock, UserCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('superadmin');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (data.user.role === 'EXECUTIVE') {
        router.push('/executive');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden grid md:grid-cols-2">
        {/* Left Side: Corporate Animated Visual */}
        <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col justify-between relative">
          <div>
            <Link href="/" className="inline-flex items-center space-x-2.5 mb-6 group">
              <img
                src="/logo.png"
                alt="JB Infra Group Logo"
                className="h-10 w-auto object-contain drop-shadow"
              />
              <div>
                <span className="font-extrabold text-white text-base tracking-wider block">JB INFRA</span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">
                  Executive Management System
                </span>
              </div>
            </Link>

            <h2 className="text-xl font-bold text-white tracking-wide mt-2">
              Secure Operations Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unified enterprise platform for executive cadre hierarchy, permanent JB ID issuance, and digital ID card lifecycle management.
            </p>
          </div>

          {/* Subtle Animated Illustration of a Female Technology Professional */}
          <div className="my-6 flex justify-center items-center relative py-4">
            <div className="w-56 h-56 relative flex items-center justify-center">
              {/* Subtle Tech Orbit / Glow Animation */}
              <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '24s' }}>
                <span className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-md shadow-purple-500" />
                <span className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <div className="absolute inset-4 rounded-full border border-blue-500/15 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />

              {/* Female Software / Tech Professional Vector SVG */}
              <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#4c1d95" />
                  </linearGradient>
                  <linearGradient id="blazer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="laptop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Ambient Soft Glow Behind Head */}
                <circle cx="100" cy="90" r="55" fill="#818cf8" fillOpacity="0.12" />

                {/* Hair back */}
                <path d="M70 70 C60 100 65 140 75 155 C80 155 85 145 85 130 C85 85 85 70 70 70 Z" fill="url(#hair)" />
                <path d="M130 70 C140 100 135 140 125 155 C120 155 115 145 115 130 C115 85 115 70 130 70 Z" fill="url(#hair)" />

                {/* Torso / Blazer */}
                <path d="M60 185 C60 150 78 135 100 135 C122 135 140 150 140 185 Z" fill="url(#blazer)" />
                {/* Shirt Collar */}
                <path d="M90 135 L100 155 L110 135 Z" fill="#ffffff" />
                {/* ID Badge on Lanyard */}
                <path d="M96 150 L96 168 L104 168 L104 150 Z" fill="#0284c7" />
                <rect x="94" y="162" width="12" height="15" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <circle cx="100" cy="167" r="2" fill="#0284c7" />

                {/* Neck */}
                <rect x="93" y="115" width="14" height="22" rx="4" fill="url(#skin)" />

                {/* Head */}
                <ellipse cx="100" cy="85" rx="24" ry="28" fill="url(#skin)" />

                {/* Face Features: Eyes & Professional Eyeglasses */}
                <rect x="83" y="77" width="14" height="10" rx="3" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                <rect x="103" y="77" width="14" height="10" rx="3" fill="none" stroke="#1e293b" strokeWidth="1.8" />
                <line x1="97" y1="81" x2="103" y2="81" stroke="#1e293b" strokeWidth="1.8" />
                <circle cx="90" cy="82" r="1.5" fill="#0f172a" />
                <circle cx="110" cy="82" r="1.5" fill="#0f172a" />

                {/* Smile */}
                <path d="M94 98 Q100 103 106 98" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />

                {/* Modern Professional Bob Hair Front */}
                <path d="M76 80 C74 55 126 55 124 80 C118 68 112 66 100 66 C88 66 82 68 76 80 Z" fill="url(#hair)" />
                <path d="M76 80 C72 90 74 108 77 115 C79 105 82 92 84 85 Z" fill="url(#hair)" />
                <path d="M124 80 C128 90 126 108 123 115 C121 105 118 92 116 85 Z" fill="url(#hair)" />

                {/* Tech Laptop with JB logo pulse */}
                <path d="M68 180 L132 180 L124 162 L76 162 Z" fill="#334155" />
                <rect x="76" y="163" width="48" height="15" rx="1" fill="#0f172a" />
                <path d="M62 182 L138 182 C140 182 141 183 140 185 L136 188 L64 188 L60 185 C59 183 60 182 62 182 Z" fill="#64748b" />
                {/* Glowing screen code lines */}
                <line x1="82" y1="168" x2="98" y2="168" stroke="url(#laptop)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="82" y1="172" x2="114" y2="172" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-3">
            <span className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>RBAC Session Protection</span>
            </span>
            <span className="font-mono text-slate-400">JB-SYS-v2.6</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px] font-bold tracking-wider uppercase">
              Admin Authentication
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide mt-2">Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your authorized Admin ID and secure password.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  placeholder="e.g. superadmin, admin"
                  className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Credential Helpers */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              Quick Admin Accounts (Development Demo):
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setAdminId('superadmin');
                  setPassword('Password@123');
                }}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left transition border border-slate-700/50"
              >
                <div className="font-bold text-amber-400">Super Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">superadmin</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminId('admin');
                  setPassword('Password@123');
                }}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-left transition border border-slate-700/50"
              >
                <div className="font-bold text-blue-400">General Admin</div>
                <div className="text-[10px] text-slate-500 font-mono">admin</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
