import React, { useMemo } from 'react';
import { AppNode, Observation, WorkOpFlow } from '../types';
import { Layout, MousePointer, ShieldCheck, ShieldAlert, Cpu, Activity, TrendingUp, Sparkles, CheckCircle2, ChevronRight, AlertTriangle, BookOpen, Clock, RefreshCw } from 'lucide-react';

interface DashboardViewProps {
  nodes: AppNode[];
  observations: Observation[];
  workflows: WorkOpFlow[];
  onNavigateTab: (tab: 'dashboard' | 'exploration' | 'evaluation' | 'workspace') => void;
}

export default function DashboardView({
  nodes,
  observations,
  workflows,
  onNavigateTab
}: DashboardViewProps) {
  
  // Calculate analytics
  const pagesCount = useMemo(() => nodes.filter(n => n.type === 'page').length, [nodes]);
  const interactionsCount = useMemo(() => nodes.filter(n => n.type === 'interaction').length, [nodes]);
  const mutatingCount = useMemo(() => nodes.filter(n => n.isMutating).length, [nodes]);
  const activeBugsCount = useMemo(() => observations.filter(o => o.outcome === 'deviation').length, [observations]);
  
  const avgConfidence = useMemo(() => {
    const sum = nodes.reduce((acc, n) => acc + n.confidence, 0);
    return nodes.length > 0 ? Math.round((sum / nodes.length) * 100) : 0;
  }, [nodes]);

  // Decoupled status categories for our checklist
  const masteredItems = useMemo(() => {
    return nodes.filter(n => n.confidence >= 0.90 && n.status === 'confirmed');
  }, [nodes]);

  const rawFlakyItems = useMemo(() => {
    return nodes.filter(n => n.confidence < 0.90 || n.status === 'deviation');
  }, [nodes]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header Hero Welcome Panel */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/30 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative ambient visual highlights */}
        <div className="absolute right-0 top-0 w-80 h-full bg-linear-to-l from-indigo-100/30 to-transparent pointer-events-none rounded-r-3xl"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl"></div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700">
            <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
            <span>Autonomous Domain Knowledge Agent Online</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Onboard Intellion once. It ingests how your business runs, builds a living model of your domain, and performs like a veteran that never needs re-training.
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Unlike static record-and-replay crawlers, Intellion dynamically explores application states, maps structured components to logical domain schemas, and validates knowledge coherence in real time.
          </p>
          
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button 
              onClick={() => onNavigateTab('exploration')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-100" />
              <span>Train & Map Domains</span>
            </button>
            <button 
              onClick={() => onNavigateTab('workspace')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Verify Synced Operations</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KPI 1: Knowledge Points */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs hover:shadow-xs transition space-y-2">
          <div className="flex justify-between items-center text-indigo-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Knowledge Points</span>
            <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-200/50" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-extrabold text-indigo-900 tracking-tight font-mono">
                {((nodes.length * 110) + (observations.length * 20))} XP
              </p>
              <p className="text-[9.5px] text-slate-400 font-semibold">Verified accumulated domain points</p>
            </div>
            <span className="text-[9.5px] text-indigo-600 bg-indigo-50 font-mono font-bold px-2 py-0.5 rounded-md">Indexed</span>
          </div>
        </div>

        {/* KPI 2: Hours Spent */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs hover:shadow-xs transition space-y-2">
          <div className="flex justify-between items-center text-emerald-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Hrs Spent on The Application</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">18.5 Hrs</p>
              <p className="text-[9.5px] text-slate-400 font-semibold">Total active mapping session time</p>
            </div>
            <span className="text-[9.5px] text-emerald-600 bg-emerald-50 font-mono font-bold px-2 py-0.5 rounded-md">Continuous</span>
          </div>
        </div>

      </div>

      {/* 3. Analytical Charts and Real-time Operation Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Custom SVG Learning Progression Trend Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="space-y-0.5">
              <h4 className="text-slate-800 font-extrabold text-xs tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Autonomous Domain Convergence Map
              </h4>
              <p className="text-[9.5px] text-slate-400">Evolution of mapped schemas & contradiction isolation rates across 5 sessions</p>
            </div>
            <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              Real-time update
            </span>
          </div>

          {/* SVG Line Graph */}
          <div className="p-1">
            <svg width="100%" height="150" viewBox="0 0 500 150" className="overflow-visible">
              {/* Background horizontal guide lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="55" x2="480" y2="55" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="125" x2="480" y2="125" stroke="#cbd5e1" strokeWidth="1" />

              {/* Chart labels */}
              <text x="15" y="25" fontSize="8" fill="#94a3b8" fontFamily="monospace">100%</text>
              <text x="15" y="60" fontSize="8" fill="#94a3b8" fontFamily="monospace">60%</text>
              <text x="15" y="95" fontSize="8" fill="#94a3b8" fontFamily="monospace">20%</text>
              <text x="15" y="130" fontSize="8" fill="#94a3b8" fontFamily="monospace">0%</text>

              {/* Bottom axes labels */}
              <text x="50" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Session 1</text>
              <text x="150" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Session 2</text>
              <text x="250" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Session 3</text>
              <text x="350" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Session 4</text>
              <text x="450" y="145" fontSize="8" fill="#64748b" textAnchor="middle">Active 5</text>

              {/* Area path for Area Line 1: Routing coverage % */}
              <path
                d="M 50 125 L 50 90 L 150 70 L 250 40 L 350 30 L 450 22 L 450 125 Z"
                fill="url(#indigo-grad-area)"
                opacity="0.1"
              />

              {/* Line 1 (Indigo): Routing coverage percentage (50, 90) -> (150, 70) -> (250, 40) -> (350, 30) -> (450, 22) */}
              <path
                d="M 50 90 L 150 70 L 250 40 L 350 30 L 450 22"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Line 2 (Emerald): Interaction confidence progress (50, 110) -> (150, 95) -> (250, 70) -> (350, 52) -> (450, 41) */}
              <path
                d="M 50 110 L 150 95 L 250 70 L 350 52 L 450 41"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4,2"
                strokeLinecap="round"
              />

              {/* Interactive nodes dots */}
              <circle cx="50" cy="90" r="3.5" fill="#6366f1" />
              <circle cx="150" cy="70" r="3.5" fill="#6366f1" />
              <circle cx="250" cy="40" r="3.5" fill="#6366f1" />
              <circle cx="350" cy="30" r="3.5" fill="#6366f1" />
              <circle cx="450" cy="22" r="3.5" fill="#4f46e5" />

              <circle cx="450" cy="41" r="3" fill="#10b981" />

              {/* Gradients declaration inside SVG */}
              <defs>
                <linearGradient id="indigo-grad-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#fff" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-center gap-6 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 block"></span>
              <span>Primary Routing Mappings (91% overall Mastered)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 border-dashed border-t  block"></span>
              <span>Domain Knowledge Predictability Confidence (Avg {avgConfidence}%)</span>
            </span>
          </div>
        </div>

        {/* Business/Operations Flow Telemetry */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-800 font-extrabold text-xs tracking-tight flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Connected Domain Operations Webhook Health
              </h4>
              <span className="text-[9.5px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full">
                {workflows.length} Mapped Flowcharts
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400">Telemetry tracing from configured outbound application API nodes</p>
          </div>

          <div className="space-y-2 pt-1.5">
            {workflows.map((flow) => (
              <div 
                key={flow.id} 
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs"
              >
                <div className="space-y-0.5 leading-tight">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{flow.name}</span>
                    <span className="text-[8px] font-mono text-slate-400 block px-1 bg-white border border-slate-100 rounded">
                      {flow.category}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{flow.steps.length} operational steps integrated</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    Run: {flow.lastExecuted}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    flow.overallStatus === 'healthy' 
                      ? 'bg-emerald-500' 
                      : flow.overallStatus === 'critical' 
                      ? 'bg-rose-500 animate-pulse' 
                      : 'bg-slate-300'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigateTab('workspace')}
            className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center justify-center gap-1.5 pt-2 border-t border-slate-50"
          >
            Go to Operations Workspace Directory
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 4. Active Domain Discrepancies & Mastery checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Dynamic Critical Findings list (Col-span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h4 className="text-slate-800 font-extrabold text-xs tracking-tight flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Active Domain Logic Contradictions
            </h4>
            <p className="text-[9.5px] text-slate-400">Seeded discrepancies causing contradictions in verified knowledge expectations</p>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {observations.filter(o => o.outcome === 'deviation').length === 0 ? (
              <div className="p-8 text-center bg-slate-50/55 rounded-xl border border-dashed border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <h5 className="text-xs font-bold text-slate-700">All Knowledge Assertions Intact</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">No critical active domain contradictions or gaps seeded currently.</p>
              </div>
            ) : (
              observations.filter(o => o.outcome === 'deviation').map((obs) => (
                <div 
                  key={obs.id}
                  className="flex gap-3 p-3 bg-rose-50/40 border border-rose-100 rounded-xl hover:border-rose-200 transition text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-rose-500 text-white shrink-0 h-fit self-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1 leading-tight">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-rose-900 block font-sans">{obs.detail}</span>
                      <span className="font-mono text-[8px] text-rose-400 bg-white border border-rose-100 px-1 py-0.5 rounded">
                        {obs.timestamp}
                      </span>
                    </div>
                    {obs.selector && (
                      <code className="block bg-white text-rose-700 p-1 rounded border border-rose-100/50 text-[9px] font-mono leading-none truncate mt-1">
                        Selector: {obs.selector}
                      </code>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigateTab('evaluation')}
            className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center justify-center gap-1 pt-1"
          >
            <span>Review domain assertions &amp; interactive telemetry</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mastery Checklist stats (Col-span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h4 className="text-slate-800 font-extrabold text-xs tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Automated Element Mastery Ratio
            </h4>
            <p className="text-[9.5px] text-slate-400">Total verified stable DOM layers vs active flakiness</p>
          </div>

          {/* Mini progress stack */}
          <div className="space-y-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-600 font-mono text-[10px]">
                <span>CONFIRMED MASTERED (&gt;90% Score)</span>
                <span className="text-indigo-600">{masteredItems.length} elements</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${(masteredItems.length / Math.max(nodes.length, 1)) * 100}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-600 font-mono text-[10px]">
                <span>FLAKY OR DEVIATING STATUS</span>
                <span className="text-amber-600">{rawFlakyItems.length} elements</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${(rawFlakyItems.length / Math.max(nodes.length, 1)) * 100}%` }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50 font-medium text-[10px] text-slate-400 leading-tight">
              ✅ Intellion raises element mastery values automatically after expected results are repeatedly verified during daily staging sessions.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
