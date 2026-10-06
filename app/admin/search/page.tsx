'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  X,
  FileSpreadsheet,
  User,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function UniversalSearchPage() {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filters
  const [cadres, setCadres] = useState<any[]>([]);
  const [eds, setEds] = useState<any[]>([]);
  const [gms, setGms] = useState<any[]>([]);

  const [selectedCadre, setSelectedCadre] = useState('ALL');
  const [selectedEd, setSelectedEd] = useState('ALL');
  const [selectedGm, setSelectedGm] = useState('ALL');
  const [selectedKyc, setSelectedKyc] = useState('ALL');
  const [joiningDateFrom, setJoiningDateFrom] = useState('');
  const [joiningDateTo, setJoiningDateTo] = useState('');
  const [promotionDateFrom, setPromotionDateFrom] = useState('');

  // Results & Pagination
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Quick View Right Drawer
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  // Excel exporting
  const [exporting, setExporting] = useState(false);

  // Fetch filter metadata (cadres, EDs, GMs)
  useEffect(() => {
    fetch('/api/admin/hierarchy')
      .then((res) => res.json())
      .then((data) => {
        if (data.eds) setEds(data.eds);
        if (data.gms) setGms(data.gms);
      });

    fetch('/api/executive/enrollment')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableCadres) setCadres(data.availableCadres);
      });

    // Initial search
    executeSearch(1);
  }, []);

  const executeSearch = async (page: number = 1) => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/search', window.location.origin);
      if (query.trim()) url.searchParams.set('q', query.trim());
      if (selectedCadre !== 'ALL') url.searchParams.set('cadreId', selectedCadre);
      if (selectedEd !== 'ALL') url.searchParams.set('edId', selectedEd);
      if (selectedGm !== 'ALL') url.searchParams.set('gmId', selectedGm);
      if (selectedKyc !== 'ALL') url.searchParams.set('kycStatus', selectedKyc);
      if (joiningDateFrom) url.searchParams.set('joiningDateFrom', joiningDateFrom);
      if (joiningDateTo) url.searchParams.set('joiningDateTo', joiningDateTo);
      if (promotionDateFrom) url.searchParams.set('promotionDateFrom', promotionDateFrom);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('pageSize', '15');

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setResults(json.results || []);
        setPagination(json.pagination || { page: 1, totalCount: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(1);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCadre('ALL');
    setSelectedEd('ALL');
    setSelectedGm('ALL');
    setSelectedKyc('ALL');
    setJoiningDateFrom('');
    setJoiningDateTo('');
    setPromotionDateFrom('');
    executeSearch(1);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const appliedSummary = [
        query ? `Query: ${query}` : null,
        selectedCadre !== 'ALL' ? `Cadre: ${cadres.find((c) => c.id === selectedCadre)?.name}` : null,
        selectedEd !== 'ALL' ? `ED: ${eds.find((e) => e.id === selectedEd)?.name}` : null,
        selectedGm !== 'ALL' ? `GM: ${gms.find((g) => g.id === selectedGm)?.name}` : null,
      ]
        .filter(Boolean)
        .join(', ') || 'All Filtered Search Results';

      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Search Results Export',
          filtersApplied: appliedSummary,
          personIds: results.map((r) => r.id),
        }),
      });

      if (!res.ok) {
        throw new Error('Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JB_Infra_Search_Export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Error exporting to Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Universal Admin Search</h1>
        <p className="text-xs text-slate-400 mt-1">
          Instant multi-index search across Permanent ID, Name, Mobile, DOB, PAN, Aadhaar, ED, and GM downlines.
        </p>
      </div>

      {/* Main Search Input & Filter Controls */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-amber-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, name, mobile, DOB, PAN, Aadhaar, ED, GM..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500 shadow-inner"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
            >
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                showAdvanced
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
              title="Clear All Filters"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Cadre Filter */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cadre</label>
              <select
                value={selectedCadre}
                onChange={(e) => setSelectedCadre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All Cadres</option>
                {cadres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ED Filter */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Under Executive Director</label>
              <select
                value={selectedEd}
                onChange={(e) => {
                  setSelectedEd(e.target.value);
                  setSelectedGm('ALL');
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All ED Downlines</option>
                {eds.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.permanentId})
                  </option>
                ))}
              </select>
            </div>

            {/* GM Filter */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Under General Manager</label>
              <select
                value={selectedGm}
                onChange={(e) => setSelectedGm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All GM Downlines</option>
                {gms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.permanentId})
                  </option>
                ))}
              </select>
            </div>

            {/* KYC Status */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">KYC Status</label>
              <select
                value={selectedKyc}
                onChange={(e) => setSelectedKyc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All KYC</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Joining Date From */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Joining Date From</label>
              <input
                type="date"
                value={joiningDateFrom}
                onChange={(e) => setJoiningDateFrom(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Joining Date To */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Joining Date To</label>
              <input
                type="date"
                value={joiningDateTo}
                onChange={(e) => setJoiningDateTo(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Promotion Date */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Promotion Date After</label>
              <input
                type="date"
                value={promotionDateFrom}
                onChange={(e) => setPromotionDateFrom(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => executeSearch(1)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="text-white font-bold">{pagination.totalCount}</span> results found
        </div>

        <button
          onClick={handleExportExcel}
          disabled={exporting || results.length === 0}
          className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1.5 shadow"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{exporting ? 'Generating Excel...' : 'Export Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Results Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Searching indexed records...
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No people records match the current search query and filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Permanent ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Current Cadre</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Promotion Date</th>
                  <th className="py-3 px-4">ED</th>
                  <th className="py-3 px-4">GM</th>
                  <th className="py-3 px-4">KYC</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {results.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPerson(row)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {row.permanentId}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{row.fullName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-400">{row.currentCadre}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{row.mobile}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {row.joiningDate ? new Date(row.joiningDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {row.promotionDate ? new Date(row.promotionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{row.edName}</td>
                    <td className="py-3 px-4 text-slate-300">{row.gmName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.kycStatus === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {row.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold">{row.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(row);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
                      >
                        View Drawer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => executeSearch(pagination.page - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => executeSearch(pagination.page + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* RIGHT-SIDE QUICK VIEW DRAWER (Section 46) */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-base">Person Quick View</h3>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Identity Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  {selectedPerson.fullName
                    .split(' ')
                    .slice(0, 2)
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <h4 className="text-lg font-bold text-white uppercase">{selectedPerson.fullName}</h4>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs">
                  {selectedPerson.permanentId}
                </div>
                <div className="text-[11px] text-slate-400">
                  Permanent Unique ID (Invariant Across Upgrades)
                </div>
              </div>

              {/* Data Rows */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Cadre:</span>
                  <span className="font-bold text-blue-400">{selectedPerson.currentCadre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Executive Director (ED):</span>
                  <span className="font-semibold text-slate-200">{selectedPerson.edName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">General Manager (GM):</span>
                  <span className="font-semibold text-slate-200">{selectedPerson.gmName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Direct Manager:</span>
                  <span className="font-semibold text-slate-200">{selectedPerson.managerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Joining Date:</span>
                  <span className="text-slate-300">
                    {selectedPerson.joiningDate ? new Date(selectedPerson.joiningDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latest Promotion Date:</span>
                  <span className="text-slate-300">
                    {selectedPerson.promotionDate ? new Date(selectedPerson.promotionDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Masked Aadhaar:</span>
                  <span className="font-mono text-slate-300">{selectedPerson.aadhaarMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Masked PAN:</span>
                  <span className="font-mono text-slate-300">{selectedPerson.panMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">KYC Status:</span>
                  <span className="font-bold text-emerald-400">{selectedPerson.kycStatus}</span>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="space-y-2 pt-6 border-t border-slate-800">
              <Link
                href={`/admin/people/${selectedPerson.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <span>OPEN COMPLETE PROFILE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              {selectedPerson.idCardId && (
                <a
                  href={`/api/documents/id-card/${selectedPerson.idCardId}`}
                  download
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Download ID Card PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
