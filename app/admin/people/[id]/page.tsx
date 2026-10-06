'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  GitFork,
  ArrowDown,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export default function PersonProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [availableCadres, setAvailableCadres] = useState<any[]>([]);
  const [potentialManagers, setPotentialManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upgrade Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newCadreId, setNewCadreId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [promotionDate, setPromotionDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportingPersonId, setReportingPersonId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [generateNewCard, setGenerateNewCard] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/people/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setPerson(json.person);
        setAvailableCadres(json.availableCadres || []);
        setPotentialManagers(json.potentialManagers || []);

        if (json.person.currentCadreId) {
          // Default upgrade to next cadre if available
          const currentIdx = json.availableCadres.findIndex(
            (c: any) => c.id === json.person.currentCadreId
          );
          if (currentIdx !== -1 && currentIdx + 1 < json.availableCadres.length) {
            setNewCadreId(json.availableCadres[currentIdx + 1].id);
          } else if (json.availableCadres.length > 0) {
            setNewCadreId(json.availableCadres[0].id);
          }
        }

        if (json.person.currentJoiningDate) {
          setJoiningDate(new Date(json.person.currentJoiningDate).toISOString().split('T')[0]);
        }
        if (json.person.reportingTo?.id) {
          setReportingPersonId(json.person.reportingTo.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgrading(true);
    setUpgradeSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/people/${params.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newCadreId,
          joiningDate,
          promotionDate,
          reportingPersonId: reportingPersonId || null,
          remarks,
          generateNewIdCard: generateNewCard,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Upgrade failed');
      }

      setUpgradeSuccessMsg(json.message);
      setShowUpgradeModal(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to upgrade cadre');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading career timeline & identity profile...</p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Profile not found.</p>
        <Link href="/admin/people" className="text-xs text-blue-400 mt-2 block">
          ← Return to People Directory
        </Link>
      </div>
    );
  }

  const latestCard = person.idCards?.[0];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Permanent ID Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/people"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-extrabold border border-amber-500/40">
                {person.permanentId}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-wide">{person.fullName}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {person.currentCadre}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanent Identity Record • ID Invariant Across All Career Promotions
            </p>
          </div>
        </div>

        {/* Upgrade Cadre Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
          >
            <TrendingUp className="w-4 h-4" />
            <span>UPGRADE CADRE</span>
          </button>
        </div>
      </div>

      {upgradeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{upgradeSuccessMsg}</span>
        </div>
      )}

      {/* Grid of Profile Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Visual Career Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Personal Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Personal & Verification Details</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Permanent Unique ID:</span>
                <div className="font-mono text-base font-black text-amber-400 mt-0.5">
                  {person.permanentId}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Assigned permanently for life</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Current Official Cadre:</span>
                <div className="text-base font-bold text-white mt-0.5">{person.currentCadre}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Active organizational rank</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Mobile & WhatsApp:</span>
                <div className="font-mono text-slate-200 mt-0.5">{person.mobile}</div>
                <div className="text-slate-400">{person.email || 'No email registered'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">DOB & Address:</span>
                <div className="text-slate-200 mt-0.5">
                  {new Date(person.dob).toLocaleDateString()}
                </div>
                <div className="text-slate-400 truncate">{person.address}</div>
              </div>
            </div>
          </div>

          {/* VISUAL CAREER TIMELINE (Section 9, 10) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Visual Career Progression Timeline</span>
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Permanent ID: {person.permanentId}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Complete historical progression. Previous cadre assignments are immutably preserved.
            </p>

            <div className="relative pl-6 space-y-6 pt-2 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {person.timeline?.map((entry: any, index: number) => {
                const isCurrent = entry.isCurrent;

                return (
                  <div key={entry.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/20'
                          : 'border-blue-500 bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-emerald-400' : 'bg-blue-400'}`}
                      />
                    </div>

                    {/* Step Card */}
                    <div
                      className={`p-4 rounded-xl border text-xs transition ${
                        isCurrent
                          ? 'bg-slate-950 border-emerald-500/40 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{entry.cadreName}</span>
                          {isCurrent ? (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              CURRENT POSITION
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              HISTORICAL
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Recorded by {entry.changedBy || 'Admin'}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-semibold">Joining Date:</span>{' '}
                          <span className="text-slate-300">
                            {new Date(entry.joiningDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Promotion Date:</span>{' '}
                          <span className="text-slate-300">
                            {entry.promotionDate
                              ? new Date(entry.promotionDate).toLocaleDateString()
                              : 'Initial Join'}
                          </span>
                        </div>
                      </div>

                      {entry.remarks && (
                        <div className="mt-2 text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          &ldquo;{entry.remarks}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Reporting Relationships & Official ID Card */}
        <div className="space-y-6">
          {/* Reporting Line Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-purple-400" />
              <span>Reporting Hierarchy</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Direct Manager (Reports To):</span>
                <div className="font-bold text-white text-sm mt-1">
                  {person.reportingTo?.name || 'Direct to Board'}
                </div>
                {person.reportingTo && (
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                    {person.reportingTo.permanentId} ({person.reportingTo.cadre})
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block mb-2">
                  Direct Subordinates ({person.directReportees?.length || 0})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {person.directReportees?.length === 0 ? (
                    <div className="text-slate-500 text-xs italic">No direct subordinates</div>
                  ) : (
                    person.directReportees?.map((rep: any) => (
                      <Link
                        key={rep.id}
                        href={`/admin/people/${rep.id}`}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-xs block transition"
                      >
                        <span className="font-semibold text-white">{rep.name}</span>
                        <span className="text-blue-400 font-mono text-[10px]">{rep.cadre}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generated ID Cards & PDF Download */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Issued ID Cards</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                {person.idCards?.length || 0} Versions
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {person.idCards?.map((card: any) => (
                <div
                  key={card.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-amber-400">{card.cardNumber}</div>
                    <div className="text-[10px] text-slate-400">
                      Version {card.version} • Issued {new Date(card.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <a
                    href={`/api/documents/id-card/${card.id}`}
                    download
                    className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition"
                    title="Download Card PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CADRE UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Upgrade Official Cadre</span>
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Permanent ID invariant reassurance */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              <span className="font-bold">Rule Check:</span> Upgrading cadre does{' '}
              <span className="font-black underline">NOT</span> change the permanent ID.
              Permanent ID <span className="font-black">{person.permanentId}</span> remains identical.
            </div>

            <form onSubmit={handleUpgradeSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Current Cadre</label>
                  <input
                    disabled
                    value={person.currentCadre}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-800 rounded-lg text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    New Cadre <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newCadreId}
                    onChange={(e) => setNewCadreId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    {availableCadres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Level {c.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cadre Joining Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Promotion/Upgrade Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={promotionDate}
                    onChange={(e) => setPromotionDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assigned Reporting Person (Optional)
                </label>
                <select
                  value={reportingPersonId}
                  onChange={(e) => setReportingPersonId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="">-- Maintain / Direct --</option>
                  {potentialManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.permanentId} • {m.cadre})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Circular assignments are automatically checked and blocked by cycle detection.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks / Note</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Promoted to General Manager for exceptional H2 performance"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={generateNewCard}
                  onChange={(e) => setGenerateNewCard(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600"
                />
                <span className="text-slate-300 font-medium">
                  Generate new versioned wallet ID card with updated cadre badge
                </span>
              </label>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgrading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/30"
                >
                  {upgrading ? 'Upgrading...' : 'Confirm Upgrade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
