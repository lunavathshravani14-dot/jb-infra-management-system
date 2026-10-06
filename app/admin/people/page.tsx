'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  Calendar,
} from 'lucide-react';

export default function AdminPeopleDirectoryPage() {
  const [people, setPeople] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/people', window.location.origin);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPeople(data.people || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPeople();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">People & Permanent Identities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of all issued permanent identities. Upgrading cadres preserves the permanent ID.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Permanent ID, Name, Mobile, Email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid of People Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading directory records...</div>
      ) : people.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs">No records found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <div
              key={person.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {person.fullName
                        .split(' ')
                        .slice(0, 2)
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{person.fullName}</div>
                      <div className="font-mono text-amber-400 text-xs font-bold">
                        {person.permanentId}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    {person.currentCadre}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Mobile:</span>
                    <span className="font-mono text-slate-200">{person.mobile}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reporting To:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">
                      {person.reportingToName || 'Direct'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Joining Date:</span>
                    <span className="text-slate-200">
                      {person.joiningDate ? new Date(person.joiningDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400">
                  {person.status}
                </span>
                <Link
                  href={`/admin/people/${person.id}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <span>Profile & Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
