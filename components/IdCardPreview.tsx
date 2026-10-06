'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

interface IdCardPreviewProps {
  fullName: string;
  cadre: string;
  jbCode: string;
  mobile: string;
  photoUrl?: string | null;
  downloadUrl?: string | null;
  onRegenerate?: () => void;
  onSendWhatsApp?: () => void;
  isRegenerating?: boolean;
  isSendingWhatsApp?: boolean;
  showAdminActions?: boolean;
}

export default function IdCardPreview({
  fullName,
  cadre,
  jbCode,
  mobile,
  photoUrl,
  downloadUrl,
  onRegenerate,
  onSendWhatsApp,
  isRegenerating = false,
  isSendingWhatsApp = false,
  showAdminActions = false,
}: IdCardPreviewProps) {
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  React.useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jbinfragroup.com';
    const verifyUrl = `${origin}/verify/${encodeURIComponent(jbCode)}`;
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 120, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [jbCode]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Front / Back Toggle Tabs */}
      <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-inner">
        <button
          onClick={() => setActiveSide('FRONT')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSide === 'FRONT'
              ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>FRONT SIDE</span>
        </button>
        <button
          onClick={() => setActiveSide('BACK')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            activeSide === 'BACK'
              ? 'bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>BACK SIDE</span>
        </button>
      </div>

      {/* Card Visual Container (Standard CR80 Portrait 54mm x 85.6mm aspect ~ 1 : 1.58) */}
      <div className="relative">
        {activeSide === 'FRONT' ? (
          /* FRONT SIDE */
          <div
            id="jb-id-card-front"
            className="w-[280px] h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/60 bg-white text-slate-900 relative flex flex-col justify-between select-none"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 70%, #F5F5F7 100%)',
            }}
          >
            {/* Top decorative crimson & gold banner */}
            <div className="relative pt-3 pb-2 px-4 flex flex-col items-center bg-gradient-to-b from-amber-50/40 to-transparent border-b border-amber-200/50">
              <img
                src="/logo.png"
                alt="JB Infra Group Logo"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <div className="text-[7.5px] uppercase tracking-widest font-black text-red-800 mt-1">
                JB INFRA GROUP
              </div>
            </div>

            {/* Central Executive Details Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 text-center">
              {/* Circular Photograph with concentric gold & crimson rings */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-red-600 shadow-md">
                <div className="p-0.5 rounded-full bg-white">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-red-800/40">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-black text-2xl text-red-900">
                        {fullName
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name in bold uppercase */}
              <h2 className="mt-3 text-[13px] font-black tracking-wide text-slate-900 uppercase leading-snug max-w-[240px]">
                {fullName}
              </h2>

              {/* Designation / Cadre */}
              <div className="mt-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-800 to-red-900 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                {cadre}
              </div>

              {/* JB Code & Cell details */}
              <div className="mt-3 w-full bg-amber-50/70 border border-amber-300/60 rounded-xl py-1.5 px-3 text-left space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">JB Code :</span>
                  <span className="font-mono font-black text-red-900 tracking-wider">
                    {jbCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">Cell :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {mobile}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer: QR & Authorised Signature */}
            <div className="px-4 pb-3 pt-2 bg-gradient-to-t from-red-50 to-transparent flex items-end justify-between border-t border-amber-200/50">
              {/* Verification QR */}
              <div className="flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Verify QR"
                    className="w-12 h-12 rounded border border-slate-300 p-0.5 bg-white shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded border border-slate-200 bg-white" />
                )}
                <span className="text-[6.5px] font-bold text-slate-500 mt-0.5">SCAN TO VERIFY</span>
              </div>

              {/* Authorised Signature */}
              <div className="flex flex-col items-center">
                <div className="font-serif italic text-red-900 text-[11px] font-semibold tracking-tight -mb-1 opacity-90">
                  JB Infra Auth
                </div>
                <div className="w-24 h-[1px] bg-slate-500 mb-0.5" />
                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter">
                  Authorised Signature
                </span>
              </div>
            </div>

            {/* Bottom decorative crimson band */}
            <div className="h-1.5 bg-gradient-to-r from-red-700 via-amber-500 to-red-800" />
          </div>
        ) : (
          /* BACK SIDE */
          <div
            id="jb-id-card-back"
            className="w-[280px] h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/60 bg-white text-slate-900 relative flex flex-col justify-between select-none"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 70%, #F5F5F7 100%)',
            }}
          >
            {/* Top Logo */}
            <div className="pt-4 pb-2 px-4 flex flex-col items-center bg-gradient-to-b from-amber-50/40 to-transparent border-b border-amber-200/50">
              <img
                src="/logo.png"
                alt="JB Infra Group Logo"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <div className="text-[8px] uppercase tracking-widest font-black text-red-800 mt-1">
                JB INFRA GROUP
              </div>
            </div>

            {/* Guidelines / Terms */}
            <div className="px-5 py-3 text-center flex-1 flex flex-col justify-center space-y-2.5">
              <div className="text-[8px] text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                This card is the property of <strong className="text-red-900">JB INFRA GROUP</strong>.
                If found, please kindly return to the address mentioned below.
              </div>

              {/* Company Address */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300/60 text-slate-800 space-y-1">
                <div className="text-[8px] font-black uppercase text-red-900 tracking-wider">
                  Corporate Office
                </div>
                <div className="text-[8.5px] leading-tight font-medium text-slate-800">
                  # 7-1/B, 1st Floor,<br />
                  Sai Nagar Colony, Pedda Amberpet,<br />
                  Abdullapurmet Mdl.,<br />
                  R.R.Dist - 501 505,<br />
                  Telangana
                </div>
              </div>

              {/* Website */}
              <div className="pt-1">
                <span className="text-[7.5px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Official Website
                </span>
                <span className="text-[10px] font-bold text-red-800 font-mono">
                  www.jbinfragroup.com
                </span>
              </div>
            </div>

            {/* Bottom Footer & Decorative Strip */}
            <div className="pb-3 text-center">
              <div className="text-[7px] text-slate-400 font-medium">
                ISO 9001:2015 Certified Organization
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-red-700 via-amber-500 to-red-800" />
          </div>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-[320px]">
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            download={`JB_Infra_ID_Card_${jbCode}.pdf`}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-red-800/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD ID CARD (PDF)</span>
          </a>
        )}

        {onSendWhatsApp && (
          <button
            onClick={onSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-700/30 disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isSendingWhatsApp ? 'Sending...' : 'SEND ON WHATSAPP'}</span>
          </button>
        )}

        {showAdminActions && onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'REGENERATE CARD'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
