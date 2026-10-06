'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldAlert,
  ShieldCheck,
  User,
  Calendar,
  Eye,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';

export default function ConfidentialCedPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/ced')
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.members) {
          setMembers(data.members);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Verifying confidential CED permissions...</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl bg-rose-950/40 border border-rose-800 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">403 Forbidden: Access Restricted</h2>
        <p className="text-xs text-rose-200/80 leading-relaxed">
          The Confidential Executive Director (CED) cadre is strictly protected. Your current role does not possess the mandatory <span className="font-mono font-bold text-rose-300">CED_VIEW</span> permission.
        </p>
        <p className="text-[11px] text-slate-400">
          This unauthorized access attempt has been recorded in the enterprise audit log.
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-wide">Confidential CED Module</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 border border-purple-700/50 text-purple-300 uppercase">
              TOP SECRET
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Admin-only confidential cadre. Completely hidden from general searches, public APIs, and standard Admins.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-purple-400 font-semibold px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-800/80">
            Permission: CED_VIEW
          </span>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs flex items-start space-x-3">
        <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-white">Compliance Guarantee:</span> The CED cadre is guarded at the backend API, query, and reporting levels. Standard Admins and Associates cannot discover these records even via direct API requests or universal searches.
        </div>
      </div>

      {/* CED Member Roster */}
      <div className="grid sm:grid-cols-2 gap-4">
        {members.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-2xl bg-slate-900 border border-purple-900/40 hover:border-purple-600/50 transition duration-200 flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-black text-lg flex items-center justify-center">
                    {m.fullName
                      .split(' ')
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{m.fullName}</h3>
                    <div className="font-mono text-amber-400 text-xs font-bold mt-0.5">
                      {m.permanentId}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-600">
                  CONFIDENTIAL CED
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Mobile:</span>
                  <span className="font-mono text-slate-200">{m.mobile}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Email:</span>
                  <span className="text-slate-200">{m.email || 'Confidential'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Appointment Date:</span>
                  <span className="text-slate-200">
                    {m.joiningDate ? new Date(m.joiningDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                {m.remarks && (
                  <div className="pt-2 text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    &ldquo;{m.remarks}&rdquo;
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Link
                href={`/admin/people/${m.id}`}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <span>View Complete File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
