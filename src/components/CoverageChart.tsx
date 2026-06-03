import { CheckCircle2, TrendingUp, Cpu, Award } from 'lucide-react';
import { successComparisonMetrics } from '../mockData';

interface CoverageChartProps {
  structuralCoverage: number; // e.g. 85
  interactionCoverage: number; // e.g. 60
}

export default function CoverageChart({ structuralCoverage, interactionCoverage }: CoverageChartProps) {
  // Compute metrics
  const intellionEff = successComparisonMetrics.intellionExecutes;
  const crawlerEff = successComparisonMetrics.blindCrawlerExecutes;
  const savingsPct = Math.round(((crawlerEff - intellionEff) / crawlerEff) * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Target Metrics Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h4 className="text-slate-800 font-extrabold text-sm tracking-tight flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Coverage and Benchmark Diagnostics
          </h4>
          <p className="text-[10.5px] text-slate-400">Memory-guided targeting vs. Blind crawling comparisons</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg text-xs">
          <Award className="w-3.5 h-3.5" />
          <span>+{savingsPct}% Efficiency Gain</span>
        </div>
      </div>

      {/* 1. Live Exploration Coverage Map gauges (FR-15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Radial Progress Ring A */}
        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="4.5"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - structuralCoverage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 text-xs font-mono">
              {structuralCoverage}%
            </div>
          </div>
          <div className="space-y-0.5 leading-tight">
            <h5 className="text-[11.5px] font-bold text-slate-800">Structural Route Coverage</h5>
            <p className="text-[9.5px] text-slate-400">Pages discovered / registered in navigation graph layers.</p>
          </div>
        </div>

        {/* Radial Progress Ring B */}
        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#10b981"
                strokeWidth="4.5"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - interactionCoverage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-700 text-xs font-mono">
              {interactionCoverage}%
            </div>
          </div>
          <div className="space-y-0.5 leading-tight">
            <h5 className="text-[11.5px] font-bold text-slate-800">Interaction Node Coverage</h5>
            <p className="text-[9.5px] text-slate-400">Pushed buttons, fields and dropdown actions fully tested.</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Side-by-Side Comparison Columns (PRD Success Metrics Section 10) */}
      <div className="space-y-4">
        <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Targeting Performance Duel (MVP Benchmark)</h5>
        
        {/* Metric Column Block 1: Executions */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Total Run Executions (Lower is Better)</span>
            <div className="flex gap-4 font-mono text-[10px]">
              <span className="text-slate-400">Blind Crawler: <strong>{successComparisonMetrics.blindCrawlerExecutes}</strong></span>
              <span className="text-indigo-600 font-bold">Intellion: <strong>{successComparisonMetrics.intellionExecutes}</strong></span>
            </div>
          </div>
          <div className="h-6 bg-slate-50 rounded-lg overflow-hidden flex flex-col p-1 gap-1.5">
            {/* Blind Crawler Bar */}
            <div className="h-2 rounded bg-slate-200 transition-all duration-700 flex items-center justify-between px-2 text-[8px] font-bold text-slate-500" style={{ width: '100%' }}>
              <span>Blind Crawler (Crawl Map)</span>
              <span>{successComparisonMetrics.blindCrawlerExecutes} steps</span>
            </div>
            {/* Intellion Bar */}
            <div className="h-2 rounded bg-indigo-600 transition-all duration-700 flex items-center justify-between px-2 text-[8px] font-bold text-white shadow-sm shadow-indigo-100" style={{ width: `${(successComparisonMetrics.intellionExecutes / successComparisonMetrics.blindCrawlerExecutes) * 100}%` }}>
              <span>Intellion (Graph Memory Guidance)</span>
              <span>{successComparisonMetrics.intellionExecutes} steps</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 italic">
            * Intelligence target-driven exploring results in **40% lower execution cost** to identify the exact same set of schema contradictions.
          </p>
        </div>

        {/* Metric Column Block 2: Bugs caught */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Inconsistencies Captured</span>
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-semibold">Standard Crawler</p>
                <p className="text-lg font-mono font-bold text-slate-600">{successComparisonMetrics.blindCrawlerFindings} <span className="text-xs text-slate-400 font-normal">issue</span></p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-indigo-600 font-bold">Intellion Agent</p>
                <p className="text-lg font-mono font-bold text-indigo-600">{successComparisonMetrics.intellionFindings} <span className="text-xs font-normal">caught</span></p>
              </div>
            </div>
            {/* Comparative progress bar slider */}
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="bg-slate-400 h-full" style={{ width: `${(successComparisonMetrics.blindCrawlerFindings / successComparisonMetrics.intellionFindings) * 100}%` }}></div>
              <div className="bg-indigo-500 h-full flex-1"></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">DOM Fingerprint Stability</span>
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-semibold">False Positives (Crawler)</p>
                <p className="text-lg font-mono font-bold text-slate-600">69% <span className="text-[9px] text-red-500 font-semibold">drift rate</span></p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[10px] text-emerald-600 font-bold">Intellion Node Identity</p>
                <p className="text-lg font-mono font-bold text-emerald-600">96% <span className="text-[9px] text-emerald-500 font-semibold">matches</span></p>
              </div>
            </div>
            {/* Comparative progress bar slider */}
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="bg-slate-400 h-full" style={{ width: '69%' }}></div>
              <div className="bg-emerald-500 h-full flex-1" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>

        {/* Confidence Decay Note */}
        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 text-[10px] text-indigo-800 leading-tight">
          ℹ️ <strong>Meso Feedback Loops (PRD FR-14):</strong> On repeat sessions, Intellion automatically decays confidence weights on stale nodes while prioritizing unvisited/mutating connections. The graph gets smarter with every workspace deployment validation run!
        </div>

      </div>

    </div>
  );
}
