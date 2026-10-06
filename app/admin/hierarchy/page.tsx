'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitFork,
  ChevronRight,
  ChevronDown,
  User,
  Building,
  Search,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface TreeNodeProps {
  node: any;
  searchTerm: string;
}

function TreeNode({ node, searchTerm }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;
  const matchesSearch =
    searchTerm &&
    (node.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.permanent_unique_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.cadre.toLowerCase().includes(searchTerm.toLowerCase()));

  const getCadreColor = (cadre: string) => {
    switch (cadre) {
      case 'ED':
        return 'bg-amber-500/10 border-amber-500/40 text-amber-300';
      case 'GM':
        return 'bg-blue-500/10 border-blue-500/40 text-blue-300';
      case 'Manager':
        return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
      case 'Executive':
        return 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="relative pl-6 pt-2">
      {/* Node Card */}
      <div
        className={`inline-flex items-center space-x-3 p-3 rounded-xl border transition duration-150 ${
          matchesSearch
            ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Toggle Expand / Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-500">
            •
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-xs">{node.full_name}</span>
              <span className="font-mono text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30">
                {node.permanent_unique_id}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Mobile: {node.mobile}
            </div>
          </div>

          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getCadreColor(node.cadre)}`}>
            {node.cadre}
          </span>

          <Link
            href={`/admin/people/${node.id}`}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Open Profile"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && expanded && (
        <div className="relative pl-6 before:absolute before:left-3 before:top-0 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} searchTerm={searchTerm} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationalHierarchyPage() {
  const [eds, setEds] = useState<any[]>([]);
  const [gms, setGms] = useState<any[]>([]);
  const [selectedRootType, setSelectedRootType] = useState<'ED' | 'GM'>('ED');
  const [selectedRootId, setSelectedRootId] = useState('');
  const [treeData, setTreeData] = useState<any | null>(null);
  const [totalDownline, setTotalDownline] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial fetch of EDs and GMs
  useEffect(() => {
    fetch('/api/admin/hierarchy')
      .then((res) => res.json())
      .then((data) => {
        if (data.eds) {
          setEds(data.eds);
          if (data.eds.length > 0 && !selectedRootId) {
            setSelectedRootId(data.eds[0].id);
          }
        }
        if (data.gms) {
          setGms(data.gms);
        }
      });
  }, []);

  // Fetch Tree when selectedRootId changes
  useEffect(() => {
    if (!selectedRootId) return;
    setLoading(true);
    const endpoint =
      selectedRootType === 'ED'
        ? `/api/admin/hierarchy/ed/${selectedRootId}`
        : `/api/admin/hierarchy/gm/${selectedRootId}`;

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setTreeData(data.root);
        setTotalDownline(data.totalDownlineCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedRootId, selectedRootType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Organizational Hierarchy Explorer</h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamically generated downline tree derived from relational database reporting lines. Guaranteed cycle-free.
        </p>
      </div>

      {/* Root Selector & Search Filter Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Root Type Toggle (ED Junior Search vs GM Junior Search) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedRootType('ED');
                if (eds.length > 0) setSelectedRootId(eds[0].id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedRootType === 'ED'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>ED Junior Search</span>
            </button>

            <button
              onClick={() => {
                setSelectedRootType('GM');
                if (gms.length > 0) setSelectedRootId(gms[0].id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                selectedRootType === 'GM'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>GM Junior Search</span>
            </button>
          </div>

          {/* Root Leader Dropdown */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Select {selectedRootType}:
            </span>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-blue-500"
            >
              {selectedRootType === 'ED'
                ? eds.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.permanentId})
                    </option>
                  ))
                : gms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.permanentId} • Reports to {g.reportingTo})
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Tree Search & Total Stats */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Highlight person in hierarchy..."
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs w-60"
            />
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <span>Total Downline Team Members:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{totalDownline}</span>
          </div>
        </div>
      </div>

      {/* Tree Visualization Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto min-h-[400px]">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Traversing relational tree...
          </div>
        ) : !treeData ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No hierarchy tree found for this selection.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              Interactive Downline Tree (Click node arrow to expand/collapse)
            </div>
            <div className="py-2">
              <TreeNode node={treeData} searchTerm={searchTerm} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
