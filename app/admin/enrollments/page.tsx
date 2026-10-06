'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/enrollments', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setEnrollments(json.enrollments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnrollments();
  };

  const statusBadges: Record<string, { bg: string; text: string; icon: any }> = {
    PENDING_REVIEW: { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', text: 'PENDING VERIFICATION', icon: Clock },
    UNDER_REVIEW: { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', text: 'UNDER REVIEW', icon: Clock },
    CORRECTION_REQUIRED: { bg: 'bg-purple-500/10 border-rose-500/30 text-purple-400', text: 'CORRECTION REQUIRED', icon: AlertTriangle },
    APPROVED: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'APPROVED', icon: CheckCircle2 },
    ID_CARD_GENERATED: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'ID CARD GENERATED ✓', icon: CheckCircle2 },
    REJECTED: { bg: 'bg-red-500/10 border-red-500/30 text-red-400', text: 'REJECTED', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Executive Applications & ID Cards</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming applications, inspect selfie photo and Aadhaar/PAN documents, verify open cadre downline, and approve for automatic ID card generation.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'PENDING_REVIEW', 'CORRECTION_REQUIRED', 'APPROVED', 'ID_CARD_GENERATED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status === 'PENDING_REVIEW' ? 'PENDING' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, App ID, Mobile..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading executive applications...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No executive applications match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Executive Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Cadre Details</th>
                  <th className="py-3.5 px-4">Documents</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {enrollments.map((app) => {
                  const badge = statusBadges[app.status] || {
                    bg: 'bg-slate-800 text-slate-400',
                    text: app.status,
                    icon: Clock,
                  };
                  const BadgeIcon = badge.icon;
                  const kycDocs = app.kyc_documents || [];
                  const photoDoc = kycDocs.find((d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE');
                  const hasAadhaarFront = kycDocs.some((d: any) => d.document_type === 'AADHAAR_FRONT' || d.document_type === 'AADHAAR');
                  const hasAadhaarBack = kycDocs.some((d: any) => d.document_type === 'AADHAAR_BACK');
                  const hasPan = kycDocs.some((d: any) => d.document_type === 'PAN');

                  // Cadre Summary
                  const cadreEntries = [
                    app.me_name ? `ME: ${app.me_name}` : null,
                    app.mm_name ? `MM: ${app.mm_name}` : null,
                    app.smm_name ? `SMM: ${app.smm_name}` : null,
                    app.agm_name ? `AGM: ${app.agm_name}` : null,
                    app.dgm_name ? `DGM: ${app.dgm_name}` : null,
                    app.gm_name ? `GM: ${app.gm_name}` : null,
                  ].filter(Boolean);

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {app.application_number}
                      </td>
                      <td className="py-3.5 px-4">
                        {photoDoc ? (
                          <img
                            src={`/api/documents/kyc/${photoDoc.id}`}
                            alt={app.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-amber-500 shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-700">
                            {app.full_name?.[0] || 'E'}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white uppercase">{app.full_name}</div>
                        <div className="text-[10px] text-slate-400">{app.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono">{app.mobile}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-orange-400">
                          {app.requested_cadre?.name || 'Executive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[140px] truncate text-[11px] text-slate-400">
                        {cadreEntries.length > 0 ? cadreEntries.join(' • ') : 'Direct'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              hasAadhaarFront && hasAadhaarBack
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            Aadhaar {hasAadhaarFront && hasAadhaarBack ? 'F+B' : 'Partial'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              hasPan
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            PAN
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.text}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/enrollments/${app.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 border border-orange-500/30 hover:border-orange-500 text-orange-300 hover:text-white font-semibold transition text-xs"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
