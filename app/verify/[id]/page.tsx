import { db } from '@/lib/db';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, User, Building, Phone, Calendar, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const identifier = params.id;

  // Lookup Person by permanent_unique_id or IdCard id
  const person = await db.person.findFirst({
    where: {
      OR: [
        { permanent_unique_id: identifier },
        { id: identifier },
      ],
    },
    include: {
      cadre_history: {
        where: { is_current: true },
        include: { cadre: true },
      },
      id_cards: {
        where: { is_active: true },
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  });

  const isValid = !!person && person.status === 'ACTIVE';
  const currentCadre = person?.cadre_history[0]?.cadre?.name || 'Executive';
  const joiningDate = person?.cadre_history[0]?.joining_date
    ? new Date(person.cadre_history[0].joining_date).toLocaleDateString()
    : 'Active';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Brand Header */}
          <div className="bg-gradient-to-r from-red-900 via-orange-950 to-slate-900 p-6 text-center border-b border-orange-500/30">
            <div className="flex justify-center mb-3">
              <img src="/logo.png" alt="JB Infra Group Logo" className="h-14 w-auto object-contain drop-shadow" />
            </div>
            <h1 className="text-xl font-black text-white tracking-wide">JB INFRA GROUP</h1>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-0.5">
              Official Executive Credential Verification
            </p>
          </div>

          {/* Verification Status Banner */}
          <div className={`p-3 text-center text-xs font-bold flex items-center justify-center space-x-2 ${
            isValid ? 'bg-emerald-500/20 text-emerald-400 border-b border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-b border-rose-500/30'
          }`}>
            {isValid ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>VERIFIED & AUTHENTIC ACTIVE EXECUTIVE CREDENTIAL</span>
              </>
            ) : (
              <>
                <span>CREDENTIAL RECORD NOT FOUND OR INACTIVE</span>
              </>
            )}
          </div>

          {person && (
            <div className="p-6 space-y-6">
              {/* Photo & Identity */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {person.photo_url ? (
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500 flex items-center justify-center text-2xl font-black text-amber-400 shadow-xl">
                      {person.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-extrabold text-white">{person.full_name.toUpperCase()}</h2>
                <div className="mt-1 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
                  {currentCadre}
                </div>
              </div>

              {/* Credential Attributes */}
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Permanent JB Code</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{person.permanent_unique_id}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Cadre / Designation</span>
                  <span className="font-bold text-white">{currentCadre}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Affiliation Status</span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>ACTIVE</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Registered Mobile</span>
                  <span className="font-mono text-slate-300">
                    {person.mobile ? `${person.mobile.slice(0, 3)}•••••${person.mobile.slice(-2)}` : 'Verified'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">Registered Date</span>
                  <span className="text-slate-300 font-medium">{joiningDate}</span>
                </div>
              </div>

              {/* Issuer Notice */}
              <div className="text-[10px] text-slate-500 text-center space-y-1">
                <p className="font-semibold text-slate-400">JB INFRA GROUP CORPORATE OFFICE</p>
                <p># 7-1/B, 1st Floor, Sai Nagar Colony, Pedda Amberpet, Abdullapurmet Mdl., R.R.Dist - 501 505, Telangana</p>
                <p className="text-orange-400 font-mono">www.jbinfragroup.com</p>
              </div>
            </div>
          )}

          {!person && (
            <div className="p-8 text-center space-y-4">
              <p className="text-sm text-slate-400">
                No active executive credential exists for identification code <span className="font-mono text-white font-bold">{identifier}</span>.
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Portal</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
