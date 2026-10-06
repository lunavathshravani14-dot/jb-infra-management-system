'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
  Sparkles,
  Search,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Aggregating enterprise telemetry...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const cadreDistribution = data?.cadreDistribution || [];
  const recentPromotions = data?.recentPromotions || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Enterprise Management Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of enrollments, KYC verifications, permanent identities, and career progressions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/enrollments"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-blue-600/20"
          >
            <FileCheck className="w-4 h-4" />
            <span>Review Applications ({metrics.pendingEnrollments || 0})</span>
          </Link>
          <Link
            href="/admin/search"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center space-x-2"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Universal Search</span>
          </Link>
        </div>
      </div>

      {/* Top 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Executives */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Executives
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {metrics.totalPeople || 0}
          </div>
          <div className="text-[10px] text-blue-400/90 mt-1 font-medium">
            Permanent JB IDs
          </div>
        </div>

        {/* Pending Applications */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Pending Apps
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {metrics.pendingEnrollments || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Awaiting Review
          </div>
        </div>

        {/* Total Approved */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {metrics.approved || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Applications Approved
          </div>
        </div>

        {/* Total Rejected */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              Rejected
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
            {metrics.rejected || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Reasons Logged
          </div>
        </div>

        {/* Active Executives */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Active Status
            </span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-2 font-mono">
            {metrics.active !== undefined ? metrics.active : metrics.totalPeople || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            In Service
          </div>
        </div>

        {/* Inactive Executives */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Inactive
            </span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-400 mt-2 font-mono">
            {metrics.inactive || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Preserved Records
          </div>
        </div>
      </div>

      {/* Middle Grid: Cadre Distribution & Career Progression */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cadre Distribution Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Cadre Distribution</span>
            </h2>
            <span className="text-[10px] font-semibold text-slate-400">Current Assignments</span>
          </div>

          <div className="space-y-3.5">
            {cadreDistribution.map((cadre: any) => {
              const total = metrics.totalPeople || 1;
              const percent = Math.min(100, Math.round((cadre.count / total) * 100));

              return (
                <div key={cadre.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-1.5">
                      <span className="text-slate-200">{cadre.name}</span>
                      {cadre.isConfidential && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                          CONFIDENTIAL
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400">
                      {cadre.count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cadre.isConfidential
                          ? 'bg-purple-500'
                          : cadre.name === 'ED'
                          ? 'bg-amber-500'
                          : cadre.name === 'GM'
                          ? 'bg-blue-500'
                          : cadre.name === 'Manager'
                          ? 'bg-emerald-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Organizational Rule:</span>
            <span className="font-semibold text-amber-400">Cadre changes, ID never changes</span>
          </div>
        </div>

        {/* Recent Career Upgrades (Visual timeline proof) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Recent Cadre Promotions (ID Invariant)</span>
            </h2>
            <Link
              href="/admin/people"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>View All People</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentPromotions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No promotions recorded yet</div>
            ) : (
              recentPromotions.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      UPG
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{p.fullName}</span>
                        <span className="font-mono text-amber-400 text-[11px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                          {p.permanentId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Promoted to <span className="text-emerald-400 font-bold">{p.newCadre}</span> • {p.remarks}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-400 font-mono text-[10px]">
                      {p.promotionDate ? new Date(p.promotionDate).toLocaleDateString() : 'Recent'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">By {p.changedBy || 'Admin'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Audit Log Activity Stream */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-400" />
            <span>Administrative Audit Activity Stream</span>
          </h2>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Full Audit Trail →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentActivities.map((act: any) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  {act.action}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-slate-300 truncate text-[11px] font-medium pt-1">
                Actor: <span className="text-white font-semibold">{act.userName}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Entity: {act.entityType} {act.entityId ? `(${act.entityId})` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
