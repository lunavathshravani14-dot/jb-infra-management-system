'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  GitFork,
  Camera,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function HigherCadreSelfEnrollPage() {
  const [fullName, setFullName] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cadreName, setCadreName] = useState<'SGM' | 'ED' | 'CED'>('SGM');
  const [team, setTeam] = useState('Corporate Executive Board');
  const [reportingPersonId, setReportingPersonId] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  // Available higher managers for reporting dropdown
  const [executives, setExecutives] = useState<any[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);

  // Fetch executives to populate potential reporting persons
  useEffect(() => {
    setLoadingExecs(true);
    fetch('/api/admin/people')
      .then((res) => res.json())
      .then((data) => {
        setExecutives(data.people || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingExecs(false));
  }, []);

  // Filter allowed reporting persons based on selected cadre
  // SGM can report to ED or CED
  // ED can report to CED
  // CED has no higher reporting person
  const eligibleManagers = executives.filter((e) => {
    const level = e.cadreLevel || 0;
    if (cadreName === 'SGM') return level >= 8; // ED (8) or CED (9)
    if (cadreName === 'ED') return level >= 9; // CED (9)
    return false; // CED has none
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/self-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          joiningDate,
          address,
          mobile,
          whatsapp: whatsapp || mobile,
          email,
          cadreName,
          team,
          reportingPersonId: cadreName === 'CED' ? null : reportingPersonId || null,
          photoBase64,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to enroll higher cadre executive.');
      }

      setSuccessResult(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'Enrollment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setAddress('');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setCadreName('SGM');
    setReportingPersonId('');
    setPhotoBase64(null);
    setSuccessResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold tracking-wider uppercase">
              Admin Restricted
            </span>
            <h1 className="text-2xl font-bold text-white tracking-wide">Self Enroll Higher Cadre</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enroll leadership cadres (<strong>SGM, ED, CED</strong>). Automatically generates permanent unique JB ID, assigns reporting structure, and generates digital ID card.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 space-y-4 shadow-xl">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-200">Higher Cadre Enrolled Successfully!</h3>
              <p className="text-xs text-emerald-300/90">{successResult.message}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs">
            <div>
              <span className="text-slate-400">Permanent JB ID:</span>
              <div className="font-mono text-base font-bold text-amber-400">{successResult.person.permanent_unique_id}</div>
            </div>
            <div>
              <span className="text-slate-400">Executive Name:</span>
              <div className="font-bold text-white">{successResult.person.full_name}</div>
            </div>
            <div>
              <span className="text-slate-400">Assigned Cadre:</span>
              <div className="font-bold text-purple-400">{successResult.person.cadre}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admin/hierarchy"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>View in Hierarchy Tree</span>
            </Link>

            <Link
              href="/admin/people"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>All Executives</span>
            </Link>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 font-semibold text-xs transition"
            >
              + Enroll Another Higher Cadre
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      {!successResult && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          {/* Section 1: Cadre Selection */}
          <div className="space-y-3 pb-6 border-b border-slate-800">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. Select Leadership Cadre
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'SGM', level: 'Level 7', desc: 'Senior General Manager' },
                { name: 'ED', level: 'Level 8', desc: 'Executive Director' },
                { name: 'CED', level: 'Level 9', desc: 'Chief Executive Director (Confidential)' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => {
                    setCadreName(c.name as any);
                    if (c.name === 'CED') setReportingPersonId('');
                  }}
                  className={`p-4 rounded-xl border text-left transition ${
                    cadreName === c.name
                      ? 'bg-purple-950/70 border-purple-500 shadow-lg shadow-purple-900/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{c.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/40">
                      {c.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4 pb-6 border-b border-slate-800">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              2. Personal Details
            </label>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Joining Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mobile Number (10 digits) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Leave blank to match mobile"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh.chandra@jbinfra.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Official Communication Address <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete residential or office address"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Organization & Reporting Structure */}
          <div className="space-y-4 pb-6 border-b border-slate-800">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              3. Organization & Reporting Assignment
            </label>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Team / Division Name</label>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. Corporate Executive Board"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reporting Person
                  {cadreName === 'CED' && <span className="text-slate-500 text-[11px] ml-1">(None - Top of Hierarchy)</span>}
                </label>

                {cadreName === 'CED' ? (
                  <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-xs italic">
                    CED is the apex cadre of JB Infra and reports to no higher person.
                  </div>
                ) : (
                  <select
                    value={reportingPersonId}
                    onChange={(e) => setReportingPersonId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">— Select Direct Manager (Higher Cadre) —</option>
                    {eligibleManagers.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.cadre}] {m.name} ({m.permanentId})
                      </option>
                    ))}
                  </select>
                )}
                {cadreName !== 'CED' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {cadreName === 'SGM' && 'SGM can report to ED or CED.'}
                    {cadreName === 'ED' && 'ED reports to CED.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Profile Photo */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              4. Executive Profile Photo
            </label>

            <div className="flex items-center space-x-6 text-xs">
              <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoBase64 ? (
                  <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-600" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-900/60 file:text-purple-300 hover:file:bg-purple-900"
                />
                <p className="text-[11px] text-slate-500">
                  Upload crisp passport photo for digital ID card generation. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Enrolling & Generating ID...' : `Confirm & Enroll ${cadreName}`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
