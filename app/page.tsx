'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Shield,
  UserCheck,
  Building2,
  KeyRound,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  GitFork,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const quickLogin = async (username: string, targetPath: string) => {
    setLoadingRole(username);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'Password@123' }),
      });
      if (res.ok) {
        router.push(targetPath);
      } else {
        alert('Login failed. Ensure database has been seeded with npm run db:seed.');
      }
    } catch (e) {
      console.error(e);
      alert('Error during login');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="JB Infra Group"
            className="h-12 w-auto object-contain drop-shadow"
          />
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">JB INFRA</h1>
            <p className="text-xs text-amber-400 font-medium tracking-wider">EXECUTIVE & ADMIN MANAGEMENT SYSTEM</p>
          </div>
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-md shadow-blue-600/30"
        >
          <KeyRound className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="JB Infra Group Logo"
              className="h-24 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Enterprise Rule: ONE PERSON = ONE PERMANENT UNIQUE ID</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive Cadre & Associate Operations Portal
          </h2>
          <p className="mt-4 text-slate-400 text-base md:text-lg">
            Guaranteed permanent unique identity across career promotions, split-screen KYC review,
            dynamic reporting hierarchy, universal search, Excel reports, and wallet-sized ID card generation.
          </p>
        </div>

        {/* 2 Main Portals */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Executive Portal Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 flex flex-col justify-between hover:border-blue-500/50 transition duration-300 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Portal 1 — Executive Portal</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Multi-step associate enrollment, mandatory Aadhaar & PAN PDF upload, real-time application status tracker, KYC correction workflow, and official wallet ID card download.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Personal, team & reporting manager selection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Mandatory Aadhaar & PAN PDF validation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Permanent ID Card preview with QR code</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => quickLogin('executive_user', '/executive')}
                disabled={!!loadingRole}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/30"
              >
                <span>{loadingRole === 'executive_user' ? 'Authenticating...' : 'Enter Executive Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/executive/enroll"
                className="block text-center text-xs text-slate-400 hover:text-white py-1"
              >
                New Executive? Start Enrollment Form →
              </Link>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 flex flex-col justify-between hover:border-amber-500/50 transition duration-300 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Portal 2 — Admin Portal</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Enterprise control center with split-screen KYC review, cadre upgrade timeline, ED/GM tree downlines, universal multi-filter search, Excel export, and confidential CED access control.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Split-screen applicant review & PDF viewer</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Cadre upgrade without altering permanent ID</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Interactive ED / GM organizational hierarchy tree</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => quickLogin('superadmin', '/admin')}
                disabled={!!loadingRole}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-amber-600/30"
              >
                <span>{loadingRole === 'superadmin' ? 'Authenticating...' : 'Enter Admin Portal (Super Admin)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center space-x-3 text-xs text-slate-400 pt-1">
                <span>Switch Role:</span>
                <button
                  onClick={() => quickLogin('admin', '/admin')}
                  className="text-blue-400 hover:underline"
                >
                  Admin
                </button>
                <span>•</span>
                <button
                  onClick={() => quickLogin('restrictedadmin', '/admin/ced')}
                  className="text-amber-400 hover:underline"
                >
                  Restricted (CED)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Layers className="w-5 h-5 text-blue-400 mb-2" />
            <div className="font-semibold text-sm text-white">Permanent ID Engine</div>
            <div className="text-xs text-slate-400 mt-1">JBIN000001 series or continuing legacy series</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <FileCheck2 className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-semibold text-sm text-white">Split-Screen Review</div>
            <div className="text-xs text-slate-400 mt-1">Live PDF viewer for Aadhaar & PAN docs</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <GitFork className="w-5 h-5 text-purple-400 mb-2" />
            <div className="font-semibold text-sm text-white">ED & GM Downline</div>
            <div className="text-xs text-slate-400 mt-1">Automatic tree with circular loop checks</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <Lock className="w-5 h-5 text-amber-400 mb-2" />
            <div className="font-semibold text-sm text-white">Confidential CED</div>
            <div className="text-xs text-slate-400 mt-1">Restricted at API & database level</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/50 py-4 px-6 text-center text-xs text-slate-500">
        JB Infra Executive & Admin Management System • Built with Next.js, Prisma, Tailwind CSS & ExcelJS
      </footer>
    </div>
  );
}
