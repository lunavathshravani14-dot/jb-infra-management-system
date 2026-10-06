'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, KeyRound, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('superadmin');
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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role === 'EXECUTIVE') {
        router.push('/executive');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const setRoleQuick = (u: string) => {
    setUsername(u);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3 hover:opacity-90 transition">
            <img
              src="/logo.png"
              alt="JB Infra Group Logo"
              className="h-20 w-auto object-contain mx-auto drop-shadow-xl"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-wide">JB INFRA</h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
            Executive & Admin Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2.5 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="e.g. superadmin, admin, executive_user"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Role Fill Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-3 text-center">
            One-Click Test Persona Selector
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRoleQuick('superadmin')}
              className={`p-2 rounded-lg border text-left transition ${
                username === 'superadmin'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">Super Admin</div>
              <div className="text-[10px] text-slate-400">Full Access</div>
            </button>
            <button
              type="button"
              onClick={() => setRoleQuick('admin')}
              className={`p-2 rounded-lg border text-left transition ${
                username === 'admin'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">Standard Admin</div>
              <div className="text-[10px] text-slate-400">General Operations</div>
            </button>
            <button
              type="button"
              onClick={() => setRoleQuick('restrictedadmin')}
              className={`p-2 rounded-lg border text-left transition ${
                username === 'restrictedadmin'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">Restricted Admin</div>
              <div className="text-[10px] text-slate-400">CED + Sensitive KYC</div>
            </button>
            <button
              type="button"
              onClick={() => setRoleQuick('executive_user')}
              className={`p-2 rounded-lg border text-left transition ${
                username === 'executive_user'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">Executive</div>
              <div className="text-[10px] text-slate-400">Portal Associate</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Return to Home Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
