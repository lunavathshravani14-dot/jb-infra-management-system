'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function AdminIdCardsAndWhatsAppPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp');
      if (res.ok) {
        const json = await res.json();
        setMessages(json.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleRetry = async (messageId: string) => {
    setRetryingId(messageId);
    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Retry failed');
      } else {
        alert(data.note || 'WhatsApp notification retried successfully!');
        fetchMessages();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            ID Cards & WhatsApp Delivery Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track automated WhatsApp delivery of approved wallet ID cards with retry capability.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* WhatsApp Integration Status Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300">
        <MessageSquare className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-white">Meta WhatsApp Cloud API Integration:</span>{' '}
          When approved, an automated message with the verified PDF ID card link is dispatched. If credentials are not specified in <code className="text-amber-400">.env</code>, delivery runs in local test mode and accurately logs statuses.
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading delivery logs...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No WhatsApp messages dispatched yet. Approving an application will trigger delivery.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Permanent ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Delivery Note</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {messages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {m.permanentId}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{m.personName}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{m.recipientPhone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'SENT' || m.status === 'DELIVERED' || m.status === 'READ'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : m.status === 'FAILED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {m.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{m.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {m.errorMessage || 'Delivered successfully'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRetry(m.id)}
                        disabled={retryingId === m.id}
                        className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition"
                      >
                        {retryingId === m.id ? 'Retrying...' : 'Retry WhatsApp'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
