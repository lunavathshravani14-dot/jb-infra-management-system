'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldAlert,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form for sequence configuration
  const [seriesName, setSeriesName] = useState('LEGACY_SERIES');
  const [prefix, setPrefix] = useState('JB');
  const [startValue, setStartValue] = useState('10250');
  const [pattern, setPattern] = useState('{PREFIX}{SERIAL}');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings/id-sequence');
      if (res.ok) {
        const json = await res.json();
        setSequences(json.sequences || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  const handleSaveSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/settings/id-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesName,
          prefix,
          startValue: parseInt(startValue, 10),
          pattern,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update sequence');
      }

      setSuccessMsg(`ID Series "${seriesName}" successfully configured! Next issued ID will start at value ${startValue}.`);
      fetchSequences();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">ID Sequence Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure permanent ID generation patterns and seamlessly continue existing legacy sequence series (e.g. JB10250 → JB10251).
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Sequences in DB */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Active Permanent ID Sequences</span>
        </h2>

        {loading ? (
          <div className="text-slate-400 text-xs">Loading sequences...</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {sequences.map((seq) => (
              <div
                key={seq.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{seq.series_name}</span>
                  <span className="font-mono text-emerald-400 font-bold">Active</span>
                </div>
                <div className="text-slate-400">
                  Current Value: <span className="font-mono font-bold text-amber-400">{seq.current_value}</span>
                </div>
                <div className="text-slate-400">
                  Format Pattern: <code className="text-blue-300 font-mono">{seq.pattern}</code>
                </div>
                <div className="space-y-1 text-xs pt-1 border-t border-slate-900">
                  <div className="flex justify-between text-slate-400">
                    <span>Current Last JB ID:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {seq.current_value > 0
                        ? (seq.pattern || '{PREFIX}{SERIAL:4}')
                            .replace('{PREFIX}', seq.prefix)
                            .replace('{YEAR:2}', new Date().getFullYear().toString().slice(-2))
                            .replace('{YEAR}', new Date().getFullYear().toString())
                            .replace(/\{SERIAL:(\d+)\}/g, (_: any, len: string) =>
                              String(seq.current_value - 1).padStart(parseInt(len, 10), '0')
                            )
                            .replace('{SERIAL}', String(seq.current_value - 1))
                        : 'None yet (Initial)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Next Available ID:</span>
                    <span className="font-mono font-bold">
                      {(seq.pattern || '{PREFIX}{SERIAL:4}')
                        .replace('{PREFIX}', seq.prefix)
                        .replace('{YEAR:2}', new Date().getFullYear().toString().slice(-2))
                        .replace('{YEAR}', new Date().getFullYear().toString())
                        .replace(/\{SERIAL:(\d+)\}/g, (_: any, len: string) =>
                          String(seq.current_value).padStart(parseInt(len, 10), '0')
                        )
                        .replace('{SERIAL}', String(seq.current_value))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form: Continue / Configure Series */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Hash className="w-4 h-4 text-blue-400" />
          <span>Continue Existing ID Series</span>
        </h2>

        <form onSubmit={handleSaveSequence} className="space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Series Identifier</label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Last Used / Starting Serial Number
              </label>
              <input
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                required
                placeholder="e.g. 10250"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The next generated ID will start at this value + 1 (e.g. 10251).
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pattern Template</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Use <code className="text-amber-300">{'{PREFIX}{SERIAL:6}'}</code> (e.g. JBIN000001),{' '}
                <code className="text-amber-300">{'{PREFIX}{SERIAL}'}</code>, or{' '}
                <code className="text-amber-300">{'{PREFIX}{YEAR}{SERIAL:4}'}</code>
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
