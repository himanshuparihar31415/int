import { useState, useMemo } from 'react';
import { Observation, AppNode } from '../types';
import { ShieldAlert, AlertCircle, HelpCircle, CheckCircle, Search, Download, Code, Code2, Clipboard, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface FindingsListProps {
  observations: Observation[];
  nodes: AppNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export default function FindingsList({
  observations,
  nodes,
  selectedNodeId,
  onSelectNode
}: FindingsListProps) {
  const [filterType, setFilterType] = useState<'all' | 'deviation' | 'inconclusive' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedObsId, setExpandedObsId] = useState<string | null>(null);
  const [showExportDrawer, setShowExportDrawer] = useState(false);

  // Filter Observations
  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      // 1. Search Query
      const matchesSearch = obs.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            obs.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (obs.selector && obs.selector.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Tab Filter
      if (filterType === 'all') return true;
      return obs.outcome === filterType;
    });
  }, [observations, filterType, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedObsId(expandedObsId === id ? null : id);
  };

  const getOutcomeBadge = (outcome: Observation['outcome']) => {
    switch (outcome) {
      case 'deviation':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5 fill-rose-50 text-rose-700" />
            <span>CONTRADICTION</span>
          </span>
        );
      case 'inconclusive':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <HelpCircle className="w-3.5 h-3.5 fill-amber-50 text-amber-700" />
            <span>INCONCLUSIVE</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5 fill-emerald-50 text-emerald-700" />
            <span>CONFIRMED</span>
          </span>
        );
    }
  };

  // Generate full JSON report export download payload (FR-17)
  const reportJsonString = useMemo(() => {
    return JSON.stringify({
      agentName: 'Intellion Testing Agent MVP',
      exportTimestamp: new Date().toISOString(),
      coverageMetrics: {
        structuralPercent: 85,
        interactionPercent: 60
      },
      appTarget: 'https://estoreswift.stg.corp-cloud.internal',
      findingsCount: observations.length,
      activeObservations: observations
    }, null, 2);
  }, [observations]);

  // Copy report trigger
  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportJsonString);
    alert('✓ Full JSON report copied to clipboard!');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-full">
      
      {/* Findings Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h4 className="text-slate-800 font-extrabold text-sm tracking-tight flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Domain Assertion Log & Reports
          </h4>
          <p className="text-[10.5px] text-slate-400">FR-16 / Automated domain schema departure flags</p>
        </div>

        {/* Export JSON Button */}
        <button
          onClick={() => setShowExportDrawer(!showExportDrawer)}
          className="py-1.5 px-3 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 text-slate-600 bg-white"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON Report</span>
        </button>
      </div>

      {/* Export Drawer Panel Overlay */}
      {showExportDrawer && (
        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 relative border border-slate-800 space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              INTELLION_REPORT_EXPORT.JSON
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="text-[10px] bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-2.5 py-1 rounded transition"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setShowExportDrawer(false)}
                className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition"
              >
                Hide
              </button>
            </div>
          </div>
          <pre className="text-[9px] font-mono leading-tight max-h-36 overflow-y-auto whitespace-pre-wrap p-2 bg-slate-950 rounded text-amber-500">
            {reportJsonString}
          </pre>
        </div>
      )}

      {/* 2. Search & Tab Filter Controls */}
      <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search selectors, logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 transition"
          />
        </div>

        <div className="flex rounded-md bg-slate-50 border border-slate-100 p-0.5 shrink-0 self-end">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-[10.5px] rounded font-bold transition ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('deviation')}
            className={`px-3 py-1 text-[10.5px] rounded font-bold transition ${
              filterType === 'deviation'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Gaps
          </button>
          <button
            onClick={() => setFilterType('inconclusive')}
            className={`px-3 py-1 text-[10.5px] rounded font-bold transition ${
              filterType === 'inconclusive'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            Flaky
          </button>
          <button
            onClick={() => setFilterType('confirmed')}
            className={`px-3 py-1 text-[10.5px] rounded font-bold transition ${
              filterType === 'confirmed'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            Passes
          </button>
        </div>
      </div>

      {/* 3. Findings List rows */}
      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
        {filteredObservations.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl space-y-1.5">
            <CheckCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <h5 className="text-xs font-bold text-slate-600">No matching observations found</h5>
            <p className="text-[10px] text-slate-400">All tests are conforming with existing expectations graphs.</p>
          </div>
        ) : (
          filteredObservations.map((obs) => {
            const isExpanded = expandedObsId === obs.id;
            const targetNode = nodes.find(n => n.id === obs.nodeId);
            const isSelected = selectedNodeId === obs.nodeId;

            return (
              <div
                key={obs.id}
                className={`border rounded-xl transition-all p-3.5 space-y-2 ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/10'
                    : obs.outcome === 'deviation'
                    ? 'border-red-100 bg-red-50/5 hover:border-red-200'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                {/* Visual Row Header */}
                <div className="flex gap-3 items-start justify-between cursor-pointer" onClick={() => toggleExpand(obs.id)}>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded">
                        {obs.sessionName}
                      </span>
                      <span className="text-slate-400 font-extrabold text-[10px]">&gt;</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(obs.nodeId);
                        }}
                        className="text-indigo-600 hover:underline font-extrabold text-[11px]"
                      >
                        {targetNode ? targetNode.label : 'Unknown Node'}
                      </span>
                    </div>

                    <p className="text-[11.5px] font-semibold text-slate-700 leading-tight">
                      {obs.detail}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getOutcomeBadge(obs.outcome)}
                    <button className="text-slate-400 p-0.5 hover:bg-slate-50 rounded">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5">
                    {obs.selector && (
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">DOM Element Selector</span>
                        <div className="flex gap-1.5 items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-600 overflow-x-auto">
                          <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{obs.selector}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {obs.expected && (
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/50 space-y-0.5">
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tight block">Expected Behavior</span>
                          <span className="text-[10px] font-medium text-slate-600">{obs.expected}</span>
                        </div>
                      )}

                      {obs.observed && (
                        <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100/30 space-y-0.5">
                          <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-tight block">Observed Output</span>
                          <span className="text-[10px] font-bold text-rose-700">{obs.observed}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[9.5px] font-medium font-sans text-slate-400 text-right italic">
                      Discovered at {obs.timestamp} | Confidence Penalty rating: -0.50 decays
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
