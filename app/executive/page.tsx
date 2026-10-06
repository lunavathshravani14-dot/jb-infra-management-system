'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  MapPin,
  Share2,
  ExternalLink,
} from 'lucide-react';
import IdCardPreview from '@/components/IdCardPreview';

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchEnrollmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/executive/enrollment');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  const handleShareWhatsApp = () => {
    if (!person || !latestIdCard) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jbinfragroup.com';
    const verifyUrl = `${origin}/verify/${encodeURIComponent(person.permanent_unique_id)}`;
    const text = encodeURIComponent(
      `*JB INFRA GROUP — Official Digital ID Card*\n\n` +
      `Name: ${person.full_name}\n` +
      `JB Code: ${person.permanent_unique_id}\n` +
      `Designation: ${enrollment.requested_cadre?.name || 'Executive'}\n` +
      `Verification Link: ${verifyUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading executive records...</p>
      </div>
    );
  }

  const enrollment = data?.enrollment;
  const person = enrollment?.person;
  const latestIdCard = person?.id_cards?.[0];
  const isApproved = enrollment?.status === 'APPROVED' || enrollment?.status === 'ID_CARD_GENERATED';

  // Photo document
  const photoDoc = enrollment?.kyc_documents?.find(
    (d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE'
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-white tracking-wide">
              {isApproved ? 'MY JB INFRA ID CARD' : 'JB INFRA GROUP — EXECUTIVE PORTAL'}
            </h1>
            {isApproved ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: ACTIVE ✓</span>
              </span>
            ) : enrollment ? (
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                enrollment.status === 'CORRECTION_REQUIRED'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : enrollment.status === 'REJECTED'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Status: PENDING ADMIN APPROVAL</span>
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {enrollment
              ? `Application ID: ${enrollment.application_number} • Submitted on ${new Date(enrollment.created_at).toLocaleDateString()}`
              : 'Submit your executive details to get your official JB Infra digital card.'}
          </p>
        </div>

        <div>
          {enrollment?.status === 'CORRECTION_REQUIRED' && (
            <Link
              href="/executive/enroll"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-amber-600/30"
            >
              <span>EDIT APPLICATION & RESUBMIT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {!enrollment && (
            <Link
              href="/executive/enroll"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-red-700/30"
            >
              <span>APPLY FOR EXECUTIVE ID CARD</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* CORRECTION REQUIRED ALERT */}
      {enrollment?.status === 'CORRECTION_REQUIRED' && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-amber-300">Correction Required on Your Application</h3>
            <p className="text-xs text-amber-100/90 mt-1 leading-relaxed bg-amber-950/60 p-3 rounded-lg border border-amber-900/80 font-mono">
              {enrollment.correction_reason || 'Please update your uploaded documents as requested by admin.'}
            </p>
            <div className="mt-3">
              <Link
                href="/executive/enroll"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-300 hover:text-white underline underline-offset-4"
              >
                <span>Edit your application now →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION NOTICE */}
      {enrollment?.status === 'REJECTED' && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-800/80 text-red-200 flex items-start space-x-4">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-red-300">Application Rejected</h3>
            <p className="text-xs text-red-200/90 mt-1">
              Reason: {enrollment.rejection_reason || 'Application did not meet requirements.'}
            </p>
          </div>
        </div>
      )}

      {/* NO APPLICATION ON FILE */}
      {!enrollment && (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">No Application on File</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            You haven't submitted your JB Infra Executive ID Card application yet.
          </p>
          <Link
            href="/executive/enroll"
            className="inline-flex items-center space-x-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 text-white text-sm font-semibold transition shadow-lg shadow-red-700/30"
          >
            <span>Fill ID Card Form</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* APPROVED STATE: SHOW OFFICIAL DIGITAL ID CARD */}
      {isApproved && person && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* DIGITAL CARD PREVIEW (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center">
              <IdCardPreview
                fullName={person.full_name}
                cadre={enrollment.requested_cadre?.name || 'Executive'}
                jbCode={person.permanent_unique_id}
                mobile={person.mobile}
                photoUrl={photoDoc ? `/api/documents/kyc/${photoDoc.id}` : null}
                downloadUrl={latestIdCard ? `/api/documents/id-card/${latestIdCard.id}` : null}
                onSendWhatsApp={handleShareWhatsApp}
              />

              {shareSuccess && (
                <div className="mt-3 text-xs text-emerald-400 font-bold">
                  ✓ Verification link ready for WhatsApp!
                </div>
              )}
            </div>
          </div>

          {/* APPROVED EXECUTIVE PROFILE (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Executive Credential Details</span>
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">JB Code</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-1">
                    {person.permanent_unique_id}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Permanent Company Identity</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Designation / Cadre</div>
                  <div className="text-base font-bold text-white mt-1">
                    {enrollment.requested_cadre?.name || 'Executive'}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Official Cadre</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Full Name</div>
                  <div className="text-sm font-bold text-white mt-1 uppercase">
                    {person.full_name}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Mobile</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                    {person.mobile}
                  </div>
                </div>
              </div>

              {/* Communication Address */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Registered Communication Address
                </div>
                <div className="text-slate-300 leading-relaxed">
                  {[
                    enrollment.house_no,
                    enrollment.street,
                    enrollment.village_city,
                    enrollment.mandal,
                    enrollment.district,
                    enrollment.state,
                    enrollment.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ') || enrollment.address || '—'}
                </div>
              </div>

              {/* Cadre Reporting Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold mb-2">
                  Reporting Cadre Hierarchy
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {enrollment.me_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">ME: </span>
                      <span className="text-slate-200">{enrollment.me_name}</span>
                    </div>
                  )}
                  {enrollment.mm_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">MM: </span>
                      <span className="text-slate-200">{enrollment.mm_name}</span>
                    </div>
                  )}
                  {enrollment.smm_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">SMM: </span>
                      <span className="text-slate-200">{enrollment.smm_name}</span>
                    </div>
                  )}
                  {enrollment.agm_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">AGM: </span>
                      <span className="text-slate-200">{enrollment.agm_name}</span>
                    </div>
                  )}
                  {enrollment.dgm_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">DGM: </span>
                      <span className="text-slate-200">{enrollment.dgm_name}</span>
                    </div>
                  )}
                  {enrollment.gm_name && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-bold text-red-400">GM: </span>
                      <span className="text-slate-200">{enrollment.gm_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Public Verification Link */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">Public Verification Certificate:</span>
                <Link
                  href={`/verify/${encodeURIComponent(person.permanent_unique_id)}`}
                  target="_blank"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <span>View Public Certificate</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PENDING APPROVAL STATE: INFORMATIVE STATUS BOX (DO NOT SHOW CARD YET) */}
      {!isApproved && enrollment && (
        <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 max-w-2xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            Application Under Admin Verification
          </h2>

          <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            Status: PENDING ADMIN APPROVAL
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
            Your application (<strong>{enrollment.application_number}</strong>) has been submitted successfully and is currently under verification by the administrative team.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-left text-xs space-y-2">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Next Steps in Workflow:
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Executive Form Submitted ✓</span>
            </div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Admin Verification & Document Inspection (In Progress)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Admin Approval & Automatic ID Card Generation</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Digital ID Card Activated & WhatsApp Delivery</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: Per security guidelines, official ID cards are only generated and displayed after formal admin approval.
          </p>
        </div>
      )}
    </div>
  );
}
