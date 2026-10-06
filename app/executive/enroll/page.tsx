'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  MapPin,
  GitFork,
  FileCheck2,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function ExecutiveEnrollmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get('appId');

  // Official JB Infra Cadres: ME, MM, SMM, AGM, DGM, GM
  const [cadres, setCadres] = useState<any[]>([
    { id: 'ME', name: 'ME' },
    { id: 'MM', name: 'MM' },
    { id: 'SMM', name: 'SMM' },
    { id: 'AGM', name: 'AGM' },
    { id: 'DGM', name: 'DGM' },
    { id: 'GM', name: 'GM' },
  ]);
  const [loading, setLoading] = useState(true);

  // Form State - Personal
  const [fullName, setFullName] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('Marketing & Sales Operations');
  const [requestedCadreId, setRequestedCadreId] = useState('ME');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');

  // Form State - Address
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [mandal, setMandal] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');

  // Form State - Cadre / Reporting Details (All open)
  const [meId, setMeId] = useState('');
  const [meName, setMeName] = useState('');
  const [mmId, setMmId] = useState('');
  const [mmName, setMmName] = useState('');
  const [smmId, setSmmId] = useState('');
  const [smmName, setSmmName] = useState('');
  const [agmId, setAgmId] = useState('');
  const [agmName, setAgmName] = useState('');
  const [dgmId, setDgmId] = useState('');
  const [dgmName, setDgmName] = useState('');
  const [gmId, setGmId] = useState('');
  const [gmName, setGmName] = useState('');

  // Documents State
  const [photoDocId, setPhotoDocId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [aadhaarFrontDocId, setAadhaarFrontDocId] = useState<string | null>(null);
  const [aadhaarFrontName, setAadhaarFrontName] = useState<string | null>(null);
  const [aadhaarFrontUploading, setAadhaarFrontUploading] = useState(false);

  const [aadhaarBackDocId, setAadhaarBackDocId] = useState<string | null>(null);
  const [aadhaarBackName, setAadhaarBackName] = useState<string | null>(null);
  const [aadhaarBackUploading, setAadhaarBackUploading] = useState(false);

  const [panDocId, setPanDocId] = useState<string | null>(null);
  const [panName, setPanName] = useState<string | null>(null);
  const [panUploading, setPanUploading] = useState(false);

  // Camera / Webcam modal state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Declaration & Submission State
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-submit state or existing enrollment
  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const [existingEnrollment, setExistingEnrollment] = useState<any>(null);

  // Calculate age automatically when DOB changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const birthDate = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : '');
    } else {
      setAge('');
    }
  };

  useEffect(() => {
    fetch('/api/executive/enrollment')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableCadres) {
          setCadres(data.availableCadres);
          if (data.availableCadres.length > 0 && !requestedCadreId) {
            setRequestedCadreId(data.availableCadres[0].id);
          }
        }

        const app = data.enrollment;
        if (app) {
          setExistingEnrollment(app);
          setFullName(app.full_name || '');
          setMobile(app.mobile || '');
          setEmail(app.email || '');
          setRequestedCadreId(app.requested_cadre_id || '');
          setFatherOrHusbandName(app.father_or_husband_name || '');
          if (app.dob) {
            setDob(new Date(app.dob).toISOString().split('T')[0]);
          }
          setAge(app.age || '');

          setHouseNo(app.house_no || '');
          setStreet(app.street || '');
          setVillageCity(app.village_city || '');
          setMandal(app.mandal || '');
          setDistrict(app.district || '');
          setState(app.state || 'Telangana');
          setPincode(app.pincode || '');

          setMeId(app.me_id || '');
          setMeName(app.me_name || '');
          setMmId(app.mm_id || '');
          setMmName(app.mm_name || '');
          setSmmId(app.smm_id || '');
          setSmmName(app.smm_name || '');
          setAgmId(app.agm_id || '');
          setAgmName(app.agm_name || '');
          setDgmId(app.dgm_id || '');
          setDgmName(app.dgm_name || '');
          setGmId(app.gm_id || '');
          setGmName(app.gm_name || '');

          // Documents
          if (app.kyc_documents && app.kyc_documents.length > 0) {
            const photo = app.kyc_documents.find((d: any) => d.document_type === 'PHOTO' || d.document_type === 'SELFIE');
            const aFront = app.kyc_documents.find((d: any) => d.document_type === 'AADHAAR_FRONT');
            const aBack = app.kyc_documents.find((d: any) => d.document_type === 'AADHAAR_BACK');
            const pan = app.kyc_documents.find((d: any) => d.document_type === 'PAN');

            if (photo) {
              setPhotoDocId(photo.id);
              setPhotoPreview(`/api/documents/kyc/${photo.id}`);
            }
            if (aFront) {
              setAadhaarFrontDocId(aFront.id);
              setAadhaarFrontName(aFront.file_name || 'Aadhaar Front');
            }
            if (aBack) {
              setAadhaarBackDocId(aBack.id);
              setAadhaarBackName(aBack.file_name || 'Aadhaar Back');
            }
            if (pan) {
              setPanDocId(pan.id);
              setPanName(pan.file_name || 'PAN Card');
            }
          }
        }
      })
      .catch((err) => console.error('Fetch enrollment error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Generic File Upload Handler
  const uploadFile = async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const res = await fetch('/api/executive/kyc/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Upload failed for ${documentType}`);
    }
    return data;
  };

  // Upload Photo File
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setErrorMessage(null);
    try {
      const data = await uploadFile(file, 'PHOTO');
      setPhotoDocId(data.documentId);
      setPhotoPreview(data.fileUrl || URL.createObjectURL(file));
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Start Camera for Selfie
  const startCamera = async () => {
    setCameraActive(true);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraActive(false);
      alert('Could not access camera. Please allow camera permissions or use "Upload Photo".');
    }
  };

  // Capture Selfie Photo from Camera
  const captureSelfie = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setPhotoUploading(true);
      try {
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const data = await uploadFile(file, 'PHOTO');
        setPhotoDocId(data.documentId);
        setPhotoPreview(data.fileUrl || URL.createObjectURL(blob));
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setPhotoUploading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Upload Aadhaar Front
  const handleAadhaarFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAadhaarFrontUploading(true);
    try {
      const data = await uploadFile(file, 'AADHAAR_FRONT');
      setAadhaarFrontDocId(data.documentId);
      setAadhaarFrontName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setAadhaarFrontUploading(false);
    }
  };

  // Upload Aadhaar Back
  const handleAadhaarBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAadhaarBackUploading(true);
    try {
      const data = await uploadFile(file, 'AADHAAR_BACK');
      setAadhaarBackDocId(data.documentId);
      setAadhaarBackName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setAadhaarBackUploading(false);
    }
  };

  // Upload PAN Card
  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPanUploading(true);
    try {
      const data = await uploadFile(file, 'PAN');
      setPanDocId(data.documentId);
      setPanName(file.name);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setPanUploading(false);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || !mobile.trim() || !email.trim()) {
      setErrorMessage('Full Name, Mobile Number, and Email ID are mandatory.');
      return;
    }

    if (!photoDocId) {
      setErrorMessage('Executive Photo / Selfie is mandatory for the ID card.');
      return;
    }

    if (!aadhaarFrontDocId || !aadhaarBackDocId) {
      setErrorMessage('Both Aadhaar Front and Aadhaar Back documents are mandatory.');
      return;
    }

    if (!panDocId) {
      setErrorMessage('PAN Card document is mandatory.');
      return;
    }

    if (!declarationConfirmed) {
      setErrorMessage('You must agree to the declaration checkbox before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName,
        joiningDate,
        mobile,
        whatsapp: whatsapp || mobile,
        email,
        team,
        requestedCadreId,
        fatherOrHusbandName,
        dob: dob || null,
        age: age || null,
        houseNo,
        street,
        villageCity,
        mandal,
        district,
        state,
        pincode,
        meId,
        meName,
        mmId,
        mmName,
        smmId,
        smmName,
        agmId,
        agmName,
        dgmId,
        dgmName,
        gmId,
        gmName,
        photoDocId,
        aadhaarFrontDocId,
        aadhaarBackDocId,
        panDocId,
        declarationConfirmed: true,
        isUpdate: !!existingEnrollment,
        enrollmentId: existingEnrollment?.id || undefined,
      };

      const res = await fetch('/api/executive/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedApp(data.enrollment || data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // If already submitted and in pending review
  const activeEnrollment = submittedApp || (existingEnrollment?.status !== 'CORRECTION_REQUIRED' ? existingEnrollment : null);

  if (activeEnrollment && (activeEnrollment.status === 'PENDING_REVIEW' || activeEnrollment.status === 'UNDER_REVIEW' || activeEnrollment.status === 'APPROVED' || activeEnrollment.status === 'ID_CARD_GENERATED')) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <img src="/logo.png" alt="JB Infra Group" className="h-16 w-auto object-contain drop-shadow" />
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              APPLICATION SUBMITTED SUCCESSFULLY ✓
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Your official Executive ID Card application has been received and stored securely.
            </p>
          </div>

          {/* Application Badge */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Application ID:</span>
              <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                {activeEnrollment.application_number || activeEnrollment.applicationNumber}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Executive Name:</span>
              <span className="text-sm font-bold text-white uppercase">{activeEnrollment.full_name}</span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-semibold uppercase">Registered Mobile:</span>
              <span className="font-mono text-sm text-slate-200">{activeEnrollment.mobile}</span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">Status:</span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {activeEnrollment.status === 'APPROVED' || activeEnrollment.status === 'ID_CARD_GENERATED'
                    ? 'APPROVED / ID CARD GENERATED'
                    : 'PENDING ADMIN VERIFICATION'}
                </span>
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 leading-relaxed">
            Upon Admin review and document verification, your official <strong className="text-amber-400">JB Code</strong> will be assigned, your <strong>digital ID Card (Front + Back)</strong> will be generated, and automatically dispatched to your WhatsApp number.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/executive"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition"
            >
              Go to Executive Dashboard
            </Link>
            <Link
              href="/"
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="JB Infra Group Logo" className="h-16 w-auto object-contain drop-shadow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
            JB INFRA GROUP
          </h1>
          <h2 className="text-base sm:text-lg font-extrabold text-orange-400 tracking-wider uppercase">
            EXECUTIVE ID CARD APPLICATION
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Please fill in your authentic personal, address, and reporting cadre details to issue your official JB Infra Executive ID Card.
          </p>
        </div>

        {/* Correction Alert Banner */}
        {existingEnrollment?.status === 'CORRECTION_REQUIRED' && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-300 space-y-2 shadow-xl">
            <div className="flex items-center space-x-2 font-bold text-sm text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <span>CORRECTION REQUIRED BY ADMIN</span>
            </div>
            <p className="text-xs leading-relaxed">
              <strong>Admin Note:</strong> {existingEnrollment.correction_reason || 'Please verify and re-upload your documents.'}
            </p>
            <p className="text-[11px] text-slate-400">
              Your previously submitted information has been preserved below. Update the requested details and click <strong>Resubmit Application</strong>.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* The Main Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: PERSONAL DETAILS */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">1. Personal Details</h3>
                <p className="text-xs text-slate-400">Mandatory personal information for identity credential</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name * */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Full Name (as per Aadhaar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. VENKAT RAO K"
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Mobile Number * */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Same as mobile or separate"
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Email ID * */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Email ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. associate@example.com"
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Mandatory Joining Date * */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Date of official joining with JB Infra</p>
              </div>

              {/* Team Name */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  placeholder="e.g. Marketing & Sales Operations"
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Designation / Cadre * */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Designation / Cadre <span className="text-rose-500">*</span>
                </label>
                <select
                  value={requestedCadreId}
                  onChange={(e) => setRequestedCadreId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  {cadres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  {cadres.length === 0 && (
                    <>
                      <option value="ME">ME</option>
                      <option value="MM">MM</option>
                      <option value="SMM">SMM</option>
                      <option value="AGM">AGM</option>
                      <option value="DGM">DGM</option>
                      <option value="GM">GM</option>
                    </>
                  )}
                </select>
              </div>

              {/* Father / Husband Name */}
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                  Father / Husband Name (Optional)
                </label>
                <input
                  type="text"
                  value={fatherOrHusbandName}
                  onChange={(e) => setFatherOrHusbandName(e.target.value)}
                  placeholder="e.g. RAMA RAO K"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={handleDobChange}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Age (Auto-calculated) */}
              <div>
                <label className="block text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                  Age (Automatically calculated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={age !== '' ? `${age} Years` : ''}
                  placeholder="Auto-calculated from DOB"
                  className="w-full px-4 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-amber-400 font-bold focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: ADDRESS DETAILS */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">2. Communication Address</h3>
                <p className="text-xs text-slate-400">Executive residential & correspondence address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  House / Door No.
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 302, Sai Residency"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Street / Locality
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Main Road, Beside Temple"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Village / City
                </label>
                <input
                  type="text"
                  value={villageCity}
                  onChange={(e) => setVillageCity(e.target.value)}
                  placeholder="e.g. Pedda Amberpet / Hyderabad"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  Mandal
                </label>
                <input
                  type="text"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                  placeholder="e.g. Abdullapurmet"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Ranga Reddy"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Telangana"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 501505"
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: CADRE / REPORTING DETAILS (ALL OPEN) */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  3. Cadre / Reporting Details
                </h3>
                <p className="text-xs text-slate-400">
                  All cadre levels are open for direct manual entry. Enter respective IDs & Names.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* ME */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">ME</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={meId}
                    onChange={(e) => setMeId(e.target.value)}
                    placeholder="[ ME ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={meName}
                    onChange={(e) => setMeName(e.target.value)}
                    placeholder="[ ME NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* MM */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">MM</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={mmId}
                    onChange={(e) => setMmId(e.target.value)}
                    placeholder="[ MM ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={mmName}
                    onChange={(e) => setMmName(e.target.value)}
                    placeholder="[ MM NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* SMM */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">SMM</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={smmId}
                    onChange={(e) => setSmmId(e.target.value)}
                    placeholder="[ SMM ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={smmName}
                    onChange={(e) => setSmmName(e.target.value)}
                    placeholder="[ SMM NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* AGM */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">AGM</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={agmId}
                    onChange={(e) => setAgmId(e.target.value)}
                    placeholder="[ AGM ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={agmName}
                    onChange={(e) => setAgmName(e.target.value)}
                    placeholder="[ AGM NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* DGM */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">DGM</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={dgmId}
                    onChange={(e) => setDgmId(e.target.value)}
                    placeholder="[ DGM ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={dgmName}
                    onChange={(e) => setDgmName(e.target.value)}
                    placeholder="[ DGM NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* GM */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 text-xs tracking-wide uppercase">GM</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={gmId}
                    onChange={(e) => setGmId(e.target.value)}
                    placeholder="[ GM ID ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white font-mono"
                  />
                  <input
                    type="text"
                    value={gmName}
                    onChange={(e) => setGmName(e.target.value)}
                    placeholder="[ GM NAME ]"
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: DOCUMENT VERIFICATION (PHOTO, AADHAAR, PAN) */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  4. Document Verification
                </h3>
                <p className="text-xs text-slate-400">
                  Provide verified photo, Aadhaar front & back, and PAN. No private data is printed on the card.
                </p>
              </div>
            </div>

            {/* 1. PHOTO / SELFIE */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>1. Executive Photo / Selfie</span>
                    <span className="text-rose-500">*</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This approved photo will be printed directly in the center of your digital ID card.
                  </p>
                </div>

                {/* Two Photo Options: TAKE SELFIE or UPLOAD PHOTO */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-2 rounded-xl bg-orange-600/20 border border-orange-500/40 hover:bg-orange-600 text-orange-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Selfie</span>
                  </button>

                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="flex items-center space-x-4 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <img
                    src={photoPreview}
                    alt="Executive Photo Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-orange-500 shadow-md"
                  />
                  <div className="text-xs">
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Photo Selected & Ready</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Clear facial portrait ready for ID card formatting.
                    </p>
                  </div>
                </div>
              )}

              {photoUploading && (
                <div className="text-xs text-amber-400 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing and uploading photo...</span>
                </div>
              )}
            </div>

            {/* 2. AADHAAR CARD (FRONT & BACK) */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div>
                <div className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <span>2. Aadhaar Card (Front & Back)</span>
                  <span className="text-rose-500">*</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload both front and back sides for government identity verification (PDF or JPG/PNG).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Aadhaar Front */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Aadhaar Front</span>
                    {aadhaarFrontDocId && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <label className="block w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-xl text-center cursor-pointer transition">
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-semibold block truncate">
                      {aadhaarFrontName || 'Click to Upload Front Side'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={handleAadhaarFrontUpload}
                      className="hidden"
                    />
                  </label>
                  {aadhaarFrontUploading && (
                    <div className="text-[10px] text-amber-400 animate-pulse">Uploading front side...</div>
                  )}
                </div>

                {/* Aadhaar Back */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Aadhaar Back</span>
                    {aadhaarBackDocId && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <label className="block w-full py-3 px-4 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-xl text-center cursor-pointer transition">
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-semibold block truncate">
                      {aadhaarBackName || 'Click to Upload Back Side'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      onChange={handleAadhaarBackUpload}
                      className="hidden"
                    />
                  </label>
                  {aadhaarBackUploading && (
                    <div className="text-[10px] text-amber-400 animate-pulse">Uploading back side...</div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. PAN CARD */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center space-x-2">
                    <span>3. PAN Card</span>
                    <span className="text-rose-500">*</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload your PAN Card for corporate regulatory verification (PDF or JPG/PNG).
                  </p>
                </div>
                {panDocId && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>

              <label className="block w-full py-4 px-4 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-xl text-center cursor-pointer transition">
                <FileText className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                <span className="text-xs text-slate-300 font-semibold block truncate">
                  {panName || 'Click to Upload PAN Card Document'}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handlePanUpload}
                  className="hidden"
                />
              </label>
              {panUploading && (
                <div className="text-[10px] text-amber-400 animate-pulse">Uploading PAN card...</div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 5: DECLARATION & SUBMISSION */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3">
              <input
                id="declaration"
                type="checkbox"
                required
                checked={declarationConfirmed}
                onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label htmlFor="declaration" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                I confirm that the information and documents provided by me are correct and genuine. I understand that my official JB Infra Executive ID Card will be generated upon Admin verification.
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider transition shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating & Submitting...</span>
                </>
              ) : (
                <>
                  <span>{existingEnrollment?.status === 'CORRECTION_REQUIRED' ? 'Resubmit Application' : 'Submit Application'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Camera / Live Webcam Capture Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Camera className="w-4 h-4 text-orange-400" />
                <span>Take Executive Selfie</span>
              </div>
              <button onClick={closeCamera} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border-2 border-orange-500/50">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-dashed border-white/20 rounded-full m-8 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Align your face inside the circle for a clear portrait ID card photo.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={captureSelfie}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Capture & Use Photo</span>
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExecutiveEnrollmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 text-sm">Loading Executive ID Card Application Form...</p>
        </div>
      }
    >
      <ExecutiveEnrollmentContent />
    </Suspense>
  );
}

