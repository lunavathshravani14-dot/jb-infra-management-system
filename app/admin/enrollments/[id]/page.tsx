'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Save,
  Clock,
  Shield,
  User,
  ExternalLink,
  Share2,
  RefreshCw,
  Camera,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Send,
} from 'lucide-react';
import IdCardPreview from '@/components/IdCardPreview';

export default function SplitScreenReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Split-screen active document tab ('PHOTO' | 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN')
  const [activeDocTab, setActiveDocTab] = useState<'PHOTO' | 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN'>('PHOTO');

  // Approval state & series selection
  const [selectedSeries, setSelectedSeries] = useState('DEFAULT');
  const [approving, setApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<any>(null);

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Correction modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [requestingCorrection, setRequestingCorrection] = useState(false);

  // WhatsApp & Regenerate states
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [regeneratingCard, setRegeneratingCard] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setEnrollment(json.enrollment);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [params.id]);

  // Handle Approve
  const handleApprove = async () => {
    if (!confirm('Approve this applicant? Their official JB Infra Executive ID Card will be automatically generated.')) {
      return;
    }
    setApproving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesName: selectedSeries,
          approvedCadreId: enrollment.requested_cadre_id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Approval failed');
      }

      setApprovalResult(json);
      setStatusMessage('ID Card Generated & Approved successfully!');
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason is mandatory.');
      return;
    }
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      if (res.ok) {
        setShowRejectModal(false);
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to reject');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRejecting(false);
    }
  };

  // Handle Correction Request
  const handleCorrection = async () => {
    if (!correctionReason.trim()) {
      alert('Correction instructions are mandatory.');
      return;
    }
    setRequestingCorrection(true);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}/correction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctionReason }),
      });
      if (res.ok) {
        setShowCorrectionModal(false);
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to request correction');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRequestingCorrection(false);
    }
  };

  // Handle Resend WhatsApp
  const handleResendWhatsApp = async () => {
    setSendingWhatsApp(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}/resend-whatsapp`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`WhatsApp status: ${data.status || 'SENT'}`);
      } else {
        alert(data.error || 'Failed to send WhatsApp message');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Handle Regenerate ID Card
  const handleRegenerateCard = async () => {
    if (!confirm('Regenerate official digital ID card (v+1)?')) return;
    setRegeneratingCard(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/enrollments/${params.id}/regenerate-id-card`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`ID Card regenerated successfully (v${data.version})!`);
        fetchDetails();
      } else {
        alert(data.error || 'Failed to regenerate card');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRegeneratingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading JB Infra applicant details & documents...</p>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400">Enrollment not found</p>
        <Link href="/admin/enrollments" className="text-xs text-blue-400 mt-2 block">
          ← Return to Enrollments
        </Link>
      </div>
    );
  }

  const kycDocs = enrollment.kyc_documents || [];
  const photoDoc = kycDocs.find((d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE');
  const aadhaarFrontDoc = kycDocs.find((d: any) => d.document_type === 'AADHAAR_FRONT' || d.document_type === 'AADHAAR');
  const aadhaarBackDoc = kycDocs.find((d: any) => d.document_type === 'AADHAAR_BACK');
  const panDoc = kycDocs.find((d: any) => d.document_type === 'PAN');

  const activeDoc =
    activeDocTab === 'PHOTO'
      ? photoDoc
      : activeDocTab === 'AADHAAR_FRONT'
      ? aadhaarFrontDoc
      : activeDocTab === 'AADHAAR_BACK'
      ? aadhaarBackDoc
      : panDoc;

  const isApproved = enrollment.status === 'APPROVED' || enrollment.status === 'ID_CARD_GENERATED';
  const person = enrollment.person;
  const latestIdCard = person?.id_cards?.[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/enrollments"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-wide">{enrollment.full_name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-950/80 text-amber-300 border border-amber-600/40">
                {enrollment.application_number}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isApproved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : enrollment.status === 'CORRECTION_REQUIRED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : enrollment.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}
              >
                {enrollment.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              JB Infra Executive Verification & Card Generation Desk
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {!isApproved && enrollment.status !== 'REJECTED' && (
            <>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition flex items-center space-x-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Request Correction</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition flex items-center space-x-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              {/* ID Series */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                <span className="text-[10px] text-slate-400 font-bold">Series:</span>
                <select
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                  className="bg-slate-800 text-amber-400 text-xs font-mono font-bold rounded px-1.5 py-0.5 border-none focus:outline-none"
                >
                  <option value="DEFAULT">JB260000 (Sequential Permanent JB ID)</option>
                  <option value="LEGACY_SERIES">JB Legacy (JB10250+)</option>
                </select>
              </div>

              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{approving ? 'Generating ID Card...' : 'APPROVE APPLICATION'}</span>
              </button>
            </>
          )}

          {isApproved && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                <CheckCircle className="w-4 h-4" />
                <span>APPROVED & ACTIVE</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/70 border border-blue-500/50 text-blue-200 text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: APPLICATION DETAILS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-red-500" />
              <span>1. Personal Information</span>
            </h2>

            <div className="flex items-start gap-4 pt-1">
              {/* Photo Thumbnail */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 bg-slate-800 flex-shrink-0 flex items-center justify-center shadow-md">
                {photoDoc ? (
                  <img
                    src={`/api/documents/kyc/${photoDoc.id}`}
                    alt="Applicant Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-500" />
                )}
              </div>

              {/* Personal Details Grid */}
              <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Full Name</div>
                  <div className="font-bold text-white text-sm">{enrollment.full_name}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Designation / Cadre</div>
                  <div className="font-bold text-amber-300">
                    {enrollment.requested_cadre?.name || 'Executive'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Mobile Number</div>
                  <div className="font-semibold text-slate-200 font-mono">{enrollment.mobile}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Email ID</div>
                  <div className="font-semibold text-slate-200">{enrollment.email || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Father / Husband Name</div>
                  <div className="text-slate-300">{enrollment.father_or_husband_name || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Date of Birth / Age</div>
                  <div className="text-slate-300">
                    {enrollment.dob ? new Date(enrollment.dob).toLocaleDateString() : '—'}
                    {enrollment.age ? ` (${enrollment.age} yrs)` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMUNICATION ADDRESS */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>2. Address Details</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-400 text-[10px]">House / Door No.</div>
                <div className="font-medium text-slate-200">{enrollment.house_no || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Street / Locality</div>
                <div className="font-medium text-slate-200">{enrollment.street || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Village / City</div>
                <div className="font-medium text-slate-200">{enrollment.village_city || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Mandal</div>
                <div className="font-medium text-slate-200">{enrollment.mandal || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">District</div>
                <div className="font-medium text-slate-200">{enrollment.district || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">State & PIN Code</div>
                <div className="font-medium text-slate-200">
                  {enrollment.state || 'Telangana'} - {enrollment.pincode || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CADRE / REPORTING DETAILS */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Building className="w-4 h-4 text-red-500" />
              <span>3. Cadre / Reporting Hierarchy</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
              {/* ME */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">ME</span>
                  <div className="text-slate-300 font-medium">{enrollment.me_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.me_id || '—'}
                </div>
              </div>

              {/* MM */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">MM</span>
                  <div className="text-slate-300 font-medium">{enrollment.mm_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.mm_id || '—'}
                </div>
              </div>

              {/* SMM */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">SMM</span>
                  <div className="text-slate-300 font-medium">{enrollment.smm_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.smm_id || '—'}
                </div>
              </div>

              {/* AGM */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">AGM</span>
                  <div className="text-slate-300 font-medium">{enrollment.agm_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.agm_id || '—'}
                </div>
              </div>

              {/* DGM */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">DGM</span>
                  <div className="text-slate-300 font-medium">{enrollment.dgm_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.dgm_id || '—'}
                </div>
              </div>

              {/* GM */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-400">GM</span>
                  <div className="text-slate-300 font-medium">{enrollment.gm_name || 'Not filled'}</div>
                </div>
                <div className="text-right font-mono text-[11px] text-amber-400">
                  {enrollment.gm_id || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: DOCUMENT PREVIEW DESK */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span>4. Uploaded Verification Documents</span>
              </h2>

              {activeDoc && (
                <a
                  href={`/api/documents/kyc/${activeDoc.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Document</span>
                </a>
              )}
            </div>

            {/* Document Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveDocTab('PHOTO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  activeDocTab === 'PHOTO'
                    ? 'bg-red-700 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Selfie / Photo</span>
                {photoDoc && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => setActiveDocTab('AADHAAR_FRONT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  activeDocTab === 'AADHAAR_FRONT'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Aadhaar Front</span>
                {aadhaarFrontDoc && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => setActiveDocTab('AADHAAR_BACK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  activeDocTab === 'AADHAAR_BACK'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Aadhaar Back</span>
                {aadhaarBackDoc && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>

              <button
                onClick={() => setActiveDocTab('PAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                  activeDocTab === 'PAN'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PAN Card</span>
                {panDoc && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>
            </div>

            {/* Document Viewer Frame */}
            {activeDoc ? (
              <div className="w-full min-h-[380px] max-h-[500px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 relative">
                {activeDoc.mime_type?.startsWith('image/') || activeDoc.file_path?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img
                    src={`/api/documents/kyc/${activeDoc.id}`}
                    alt="Document Preview"
                    className="max-h-[460px] w-auto object-contain rounded"
                  />
                ) : (
                  <iframe
                    src={`/api/documents/kyc/${activeDoc.id}`}
                    className="w-full h-[460px]"
                    title="Document PDF Viewer"
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                <FileText className="w-8 h-8 text-slate-600 mb-2" />
                <span>No document uploaded for this section</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: DIGITAL ID CARD PREVIEW & DISPATCH ACTIONS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-red-500" />
                <span>Official Digital ID Card</span>
              </h2>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isApproved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isApproved ? 'ID CARD GENERATED' : 'NOT YET APPROVED'}
              </span>
            </div>

            {isApproved && person ? (
              <div className="w-full flex flex-col items-center">
                <IdCardPreview
                  fullName={person.full_name}
                  cadre={enrollment.requested_cadre?.name || 'Executive'}
                  jbCode={person.permanent_unique_id}
                  mobile={person.mobile}
                  photoUrl={photoDoc ? `/api/documents/kyc/${photoDoc.id}` : null}
                  downloadUrl={latestIdCard ? `/api/documents/id-card/${latestIdCard.id}` : null}
                  onRegenerate={handleRegenerateCard}
                  onSendWhatsApp={handleResendWhatsApp}
                  isRegenerating={regeneratingCard}
                  isSendingWhatsApp={sendingWhatsApp}
                  showAdminActions={true}
                />

                {/* Delivery & Status Summary */}
                <div className="w-full mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Card Version:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      v{latestIdCard?.version || 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Permanent Unique ID:</span>
                    <span className="font-mono text-white font-bold">
                      {person.permanent_unique_id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">WhatsApp Dispatch:</span>
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <Send className="w-3 h-3" />
                      <span>Ready / Retriable</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-white">ID Card Pending Approval</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  The official JB Infra front and back digital ID card will be automatically generated upon clicking <strong>APPROVE APPLICATION</strong> above.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                  >
                    <span>{approving ? 'Generating...' : 'Approve & Generate Now'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>Reject Enrollment Application</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mandatory: Provide an official reason for rejection. This reason is recorded in the audit logs.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              required
              placeholder="Enter mandatory rejection reason..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORRECTION REQUIRED MODAL */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Request Corrections from Applicant</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Specify what needs to be corrected (e.g. "Please upload a clearer PAN card image" or "Re-upload selfie with plain background").
            </p>
            <textarea
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              rows={4}
              required
              placeholder="Please upload a clearer PAN card..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCorrection}
                disabled={requestingCorrection}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                {requestingCorrection ? 'Submitting...' : 'SEND CORRECTION REQUEST'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
