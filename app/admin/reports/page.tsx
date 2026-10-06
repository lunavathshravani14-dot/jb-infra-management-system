'use client';

import { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Filter,
  Shield,
  Layers,
  Users,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('ALL');
  const [downloading, setDownloading] = useState(false);

  const reportPresets = [
    { id: 'ALL', name: 'Complete Associate Directory', desc: 'All active associates, current cadres, and reporting lines' },
    { id: 'PROMOTIONS', name: 'Promotion History Report', desc: 'Historical career timeline records and promotion dates' },
    { id: 'PENDING_KYC', name: 'Pending KYC Verification Roster', desc: 'Associates with unverified or correction-required KYC' },
    { id: 'GMS_EDS', name: 'Senior Leadership (GMs & EDs)', desc: 'Executive Directors and General Managers with unit designations' },
  ];

  const handleExport = async () => {
    setDownloading(true);
    try {
      const preset = reportPresets.find((p) => p.id === reportType);
      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: preset?.name || 'Associate Directory',
          filtersApplied: `Preset: ${preset?.name}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Export generation failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JB_Infra_${reportType}_Report_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Error generating report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Excel Export & Reporting Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate formatted .xlsx workbooks with executive headers, date stamps, and masked sensitive data.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Select Report Category</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {reportPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => setReportType(preset.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                reportType === preset.id
                  ? 'bg-blue-600/10 border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{preset.name}</span>
                {reportType === preset.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{preset.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300">Data Masking Security Policy:</div>
          <p>
            Aadhaar and PAN numbers are automatically masked (e.g. <span className="font-mono text-amber-400">XXXX XXXX 1234</span>) to comply with data protection standards.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={handleExport}
            disabled={downloading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling Workbook...' : 'Download .xlsx Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
