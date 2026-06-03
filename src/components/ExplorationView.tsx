import React, { useState, useMemo, useEffect } from 'react';
import { AppNode, AppEdge, AppBudget, RunningSession, Observation } from '../types';
import { Play, Pause, Square, Sliders, Layout, MousePointer, ShieldAlert, CheckCircle2, ChevronRight, Compass, ShieldCheck, Terminal, HelpCircle, RefreshCw } from 'lucide-react';

interface ExplorationViewProps {
  nodes: AppNode[];
  edges: AppEdge[];
  budget: AppBudget;
  session: RunningSession;
  onUpdateBudget: (budget: AppBudget) => void;
  onStartSession: (type: 'exploration' | 'test_run') => void;
  onStopSession: () => void;
  onSelectNode: (node: AppNode | null) => void;
  selectedNode: AppNode | null;
}

export default function ExplorationView({
  nodes,
  edges,
  budget,
  session,
  onUpdateBudget,
  onStartSession,
  onStopSession,
  onSelectNode,
  selectedNode
}: ExplorationViewProps) {
  
  const [filterType, setFilterType] = useState<'all' | 'page' | 'interaction'>('all');

  // Interactive local states for simulation slider rate
  const [exploreSpeed, setExploreSpeed] = useState<number>(1000); // ms per step

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return nodes;
    return nodes.filter(n => n.type === filterType);
  }, [nodes, filterType]);

  // Compute SVG Boundaries dynamically from node coordinates
  const svgBounds = useMemo(() => {
    let minX = 40, maxX = 920;
    let minY = 40, maxY = 520;
    nodes.forEach(n => {
      if (n.x && n.x > maxX) maxX = n.x + 80;
      if (n.x && n.x < minX) minX = n.x - 80;
      if (n.y && n.y > maxY) maxY = n.y + 80;
      if (n.y && n.y < minY) minY = n.y - 80;
    });
    return { width: 960, height: 500 };
  }, [nodes]);

  // Render edge logic
  const renderedEdges = useMemo(() => {
    return edges.map(edge => {
      const fromNode = nodes.find(n => n.id === edge.fromNode);
      const toNode = nodes.find(n => n.id === edge.toNode);
      if (!fromNode || !toNode) return null;
      return {
        id: edge.id,
        x1: fromNode.x || 100,
        y1: fromNode.y || 100,
        x2: toNode.x || 100,
        y2: toNode.y || 100,
        type: edge.type,
        confidence: edge.confidence
      };
    }).filter(Boolean);
  }, [edges, nodes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Left Side: Interactive Mapping Arena (Col Span 8) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        
        {/* Arena Header Toolbar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 leading-tight">Interactive Application Graph Arena</h3>
              <p className="text-[10px] text-slate-400">Click elements or trigger self-learning routines below</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">Filter View:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button 
                onClick={() => setFilterType('all')} 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${filterType === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('page')} 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${filterType === 'page' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Pages Only
              </button>
              <button 
                onClick={() => setFilterType('interaction')} 
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${filterType === 'interaction' ? 'bg-emerald-50 text-emerald-700 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Interactions Only
              </button>
            </div>
          </div>

        </div>

        {/* The Live Interactive Canvas */}
        <div className="bg-slate-900 border border-slate-950 rounded-2xl shadow-inner relative overflow-hidden flex-1 min-h-[460px] flex flex-col justify-between">
          <div className="absolute top-3 left-3 flex gap-2 z-10 text-[9px] font-mono select-none">
            <span className="px-2 py-0.5 bg-slate-800/80 text-indigo-400 border border-slate-700 rounded-md">
              Target ID: eStore_Swift_Staging
            </span>
            <span className="px-2 py-0.5 bg-slate-800/80 text-emerald-400 border border-slate-700 rounded-md">
              FPS: 60 (Hardware Accel)
            </span>
          </div>

          {/* Canvas Legend */}
          <div className="absolute top-3 right-3 flex gap-3 text-[9px] text-slate-400 font-medium bg-slate-950/80 backdrop-blur-xs p-2 rounded-lg border border-slate-800 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block"></span>
              <span>Web Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block animate-pulse"></span>
              <span>DOM Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
              <span>Inconsistency</span>
            </div>
          </div>

          {/* SVG Elements Layer */}
          <div className="relative flex-1 p-2">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 960 500" 
              className="absolute inset-0 select-none cursor-grab"
            >
              {/* Definition block for markers */}
              <defs>
                <marker id="arrow-navigates" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 Z" fill="#6366f1" />
                </marker>
                <marker id="arrow-triggers" markerWidth="6" markerHeight="6" refX="28" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 Z" fill="#10b981" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {renderedEdges.map((edge: any) => {
                const isInteractionTrig = edge.type === 'triggers';
                return (
                  <g key={edge.id}>
                    {/* Inner glowing trace line for debugging when session is busy */}
                    {session.isActive && (
                      <line 
                        x1={edge.x1} 
                        y1={edge.y1} 
                        x2={edge.x2} 
                        y2={edge.y2} 
                        stroke={isInteractionTrig ? '#10b981' : '#6366f1'} 
                        strokeWidth="5" 
                        strokeOpacity="0.15"
                      />
                    )}
                    <line 
                      x1={edge.x1} 
                      y1={edge.y1} 
                      x2={edge.x2} 
                      y2={edge.y2} 
                      stroke={edge.type === 'contains' ? '#475569' : isInteractionTrig ? '#10b981' : '#6366f1'} 
                      strokeWidth={edge.type === 'contains' ? '1' : '1.5'} 
                      strokeDasharray={edge.type === 'contains' ? '2,3' : '0'}
                      markerEnd={edge.type === 'contains' ? undefined : isInteractionTrig ? 'url(#arrow-triggers)' : 'url(#arrow-navigates)'}
                    />
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isSessionCurrentNode = session.currentNodeId === node.id;
                
                // Color mapping
                let outerRingColor = "stroke-slate-700";
                let innerFillColor = "fill-slate-800";
                let dotColor = "fill-slate-400";

                if (node.type === 'page') {
                  outerRingColor = "stroke-indigo-500/50";
                  innerFillColor = "fill-slate-900";
                  dotColor = "fill-indigo-400";
                  if (node.status === 'deviation') {
                    outerRingColor = "stroke-rose-500";
                    dotColor = "fill-rose-500";
                  }
                } else {
                  outerRingColor = "stroke-emerald-500/45";
                  innerFillColor = "fill-slate-950";
                  dotColor = "fill-emerald-400";
                  if (node.status === 'deviation') {
                    outerRingColor = "stroke-rose-500";
                    dotColor = "fill-rose-500";
                  } else if (node.isMutating) {
                    outerRingColor = "stroke-amber-400/80";
                    dotColor = "fill-amber-400";
                  }
                }

                // If active simulated node
                if (isSessionCurrentNode) {
                  outerRingColor = "stroke-cyan-400 animate-pulse stroke-[3px]";
                  dotColor = "fill-cyan-300";
                }

                return (
                  <g 
                    key={node.id}
                    transform={`translate(${node.x || 100}, ${node.y || 100})`}
                    onClick={() => onNavigateNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Hover Glow Background */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={node.type === 'page' ? '30' : '22'} 
                      fill={node.type === 'page' ? '#6366f1' : '#10b981'} 
                      fillOpacity={isSessionCurrentNode ? '0.2' : '0'} 
                      className="group-hover:fill-opacity-15 transition duration-200" 
                    />

                    {/* Node Core Geometry */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={node.type === 'page' ? '20' : '13'} 
                      className={`${innerFillColor} ${outerRingColor} transition duration-200 ${isSelected ? 'stroke-indigo-400 stroke-[2.5px]' : 'stroke-1'}`}
                    />

                    {/* Central core status bullet */}
                    <circle 
                      cx="0" 
                      cy="0" 
                      r={node.type === 'page' ? '5.5' : '3.5'} 
                      className={`${dotColor} ${isSessionCurrentNode ? 'animate-ping' : ''}`}
                    />

                    {/* Text Label Backdrop representation */}
                    <text
                      x="0"
                      y={node.type === 'page' ? '35' : '26'}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={node.type === 'page' ? 'bold' : 'normal'}
                      className={`${isSelected ? 'fill-indigo-300 font-extrabold' : 'fill-slate-400 group-hover:fill-white'} pointer-events-none transition`}
                    >
                      {node.label.length > 25 ? `${node.label.substring(0, 25)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Sim Output Logs Console representation */}
          <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                INTELLION_EXPLORER_CONSOLE::STATUS
              </span>
              <span className="text-right">
                {session.isActive ? 'RUNNING PROBE SEQ' : 'STANDBY - READY'}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 rounded-lg p-2.5 min-h-[60px] text-[11px] font-mono text-slate-200 space-y-1 overflow-y-auto leading-relaxed">
              {session.isActive ? (
                <>
                  <p className="text-cyan-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 block shrink-0"></span>
                    <span>{session.currentActionText}</span>
                  </p>
                  <p className="text-slate-500 pl-3">
                    [METRICS] Verified: {session.pagesVisited} conceptual pages. Indexed: {session.interactionsExecuted} interactive components. Highlighted: {session.findingsCount} Gaps.
                  </p>
                </>
              ) : (
                <p className="text-slate-500">
                  ⚡ Console idle. Trigger an autonomous domain validation session on the right panel to watch the schema rebuild and inspect entities automatically.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 2. Right Side: Parameters Controls & Element Inspector (Col Span 4) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        {/* 2A. ACTIVE COMPONENT INSPECTOR DOCK */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="text-slate-800 font-extrabold text-[12px] tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Domain Knowledge Entity Inspector
            </h4>
            <p className="text-[9.5px] text-slate-400 leading-tight">Inspect model selectors and semantic validation expectations</p>
          </div>

          {selectedNode ? (
            <div className="space-y-3.5 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded ${selectedNode.type === 'page' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-800'}`}>
                    {selectedNode.type === 'page' ? 'Page Root URL' : 'Interactive Element'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence: {(selectedNode.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <h5 className="font-extrabold text-slate-800">{selectedNode.label}</h5>
                <code className="block text-[10px] font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded text-slate-600 truncate">
                  Path: {selectedNode.route}
                </code>
              </div>

              {selectedNode.selector && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">DOM Selector Query</label>
                  <code className="block text-[10.5px] font-mono bg-slate-900 text-teal-300 p-2 rounded-lg break-all select-all leading-tight border border-slate-950">
                    {selectedNode.selector}
                  </code>
                </div>
              )}

              {selectedNode.expectedEffect && (
                <div className="space-y-1 bg-indigo-50/20 border border-indigo-100/40 p-2.5 rounded-xl">
                  <label className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-widest block">Expected Domain Assertion</label>
                  <p className="text-slate-600 font-medium text-[11px] leading-tight mt-0.5">{selectedNode.expectedEffect}</p>
                </div>
              )}

              {selectedNode.notes && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notes / Findings Log</label>
                  <p className="text-slate-500 italic text-[11.5px] leading-relaxed">{selectedNode.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Created: {selectedNode.createdAt}</span>
                <span>Seen: {selectedNode.lastSeen}</span>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-500">No element selected</p>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[190px] mx-auto">
                Select any node on the graph canvas to inspect selectors and confidence metrics.
              </p>
            </div>
          )}
        </div>

        {/* 2B. RUN CONTROLS & ACTION TRIGGER BLOCK */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h4 className="text-slate-800 font-extrabold text-[12px] tracking-tight">
              Self-Learning Walkthrough Actions
            </h4>
            <p className="text-[9.5px] text-slate-400">Configure parameters before starting exploration cycles</p>
          </div>

          {/* Budget Controllers */}
          <div className="space-y-3.5 text-xs">
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Max Route Pages:</span>
                <span className="font-mono text-indigo-600 font-bold">{budget.maxPages} pages</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="25" 
                value={budget.maxPages}
                onChange={(e) => onUpdateBudget({ ...budget, maxPages: parseInt(e.target.value) })}
                disabled={session.isActive}
                className="w-full accent-indigo-600 range bg-slate-100 h-1 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                <span className="uppercase tracking-wider">Domain Session Duration:</span>
                <span className="font-mono text-indigo-600 font-bold">{budget.timeLimitMinutes} minutes</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={budget.timeLimitMinutes}
                onChange={(e) => onUpdateBudget({ ...budget, timeLimitMinutes: parseInt(e.target.value) })}
                disabled={session.isActive}
                className="w-full accent-indigo-600 range bg-slate-100 h-1 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="space-y-0.5">
                <label className="font-bold text-slate-700 block">Avoid State Mutations</label>
                <span className="text-[9.5px] text-slate-400 block max-w-[190px]">Skip payment submission and database update triggers</span>
              </div>
              <input 
                type="checkbox" 
                checked={budget.avoidMutations}
                disabled={session.isActive}
                onChange={(e) => onUpdateBudget({ ...budget, avoidMutations: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
            </div>

            {/* Run/Trigger Core buttons */}
            <div className="pt-2.5 space-y-2">
              {session.isActive ? (
                <button 
                  onClick={onStopSession}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Active Probe Simulator</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onStartSession('exploration')}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1 text-center text-[10px] uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Train Phase</span>
                  </button>
                  <button 
                    onClick={() => onStartSession('test_run')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-1 text-center text-[10px] uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Pass</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );

  function onNavigateNode(node: AppNode) {
    onSelectNode(node);
  }
}
