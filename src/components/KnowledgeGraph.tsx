import React, { useState, useMemo } from 'react';
import { AppNode, AppEdge } from '../types';
import { Layout, MousePointer, ShieldAlert, Zap, Flame, Search, Layers, RefreshCw, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';

interface KnowledgeGraphProps {
  nodes: AppNode[];
  edges: AppEdge[];
  onSelectNode: (node: AppNode) => void;
  selectedNodeId: string | null;
  activeNodeId: string | null; // node currently being tested/explored in animation
}

export default function KnowledgeGraph({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  activeNodeId
}: KnowledgeGraphProps) {
  // SVG Translation and Scale Controls for zoom/pan
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter criteria
  const [filterType, setFilterType] = useState<'all' | 'pages_only' | 'low_confidence' | 'mutating' | 'deviations'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dimensions of SVG canvas
  const canvasWidth = 1000;
  const canvasHeight = 550;

  // Render variables derived from filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // 1. Search filter
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            node.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (node.selector && node.selector.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 2. Tab filters
      if (filterType === 'pages_only') return node.type === 'page';
      if (filterType === 'low_confidence') return node.confidence < 0.90;
      if (filterType === 'mutating') return node.isMutating === true;
      if (filterType === 'deviations') return node.status === 'deviation';
      return true;
    });
  }, [nodes, filterType, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Handle Dragging / Panning of the SVG Canvas
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    // Avoid dragging when clicking directly on a node button
    const target = e.target as HTMLElement;
    if (target.closest('.node-element')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Graph Filter & Toolbar header */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-sm">Interactive Knowledge Base Graph</h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded-md">
            2-Layer Core (Pages + Interactions)
          </span>
        </div>

        {/* Filters Select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search elements / route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none w-48 text-slate-700 transition"
            />
          </div>

          <div className="flex rounded-md bg-white border border-slate-100 p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterType === 'all'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('pages_only')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterType === 'pages_only'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pages
            </button>
            <button
              onClick={() => setFilterType('low_confidence')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterType === 'low_confidence'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Flaky (&lt;90%)
            </button>
            <button
              onClick={() => setFilterType('mutating')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterType === 'mutating'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mutations
            </button>
            <button
              onClick={() => setFilterType('deviations')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                filterType === 'deviations'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Gaps
            </button>
          </div>
        </div>

        {/* Map view adjustments */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 2))}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 border border-slate-100 bg-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 border border-slate-100 bg-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset Pan & Zoom"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 border border-slate-100 bg-white text-xs font-mono"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Container Canvas Canvas */}
      <div className="relative flex-1 bg-slate-50/40 select-none overflow-hidden min-h-[380px]">
        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-white/80">
            <EyeOff className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No elements match your criteria</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Try resetting filters or clear your text query to display the target application nodes.
            </p>
          </div>
        )}

        <svg
          width="105%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {/* Zoom & Translate Wrapper */}
          <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
            
            {/* 1. LAYER: Draw Connecting Vector Lines / Bezier Paths */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.fromNode);
              const targetNode = nodes.find((n) => n.id === edge.toNode);

              if (!sourceNode || !targetNode) return null;

              // Extract coordinates (default to fallback if missing coordinates)
              const x1 = sourceNode.x ?? 100;
              const y1 = sourceNode.y ?? 100;
              const x2 = targetNode.x ?? 200;
              const y2 = targetNode.y ?? 200;

              // Hide connections if connected nodes are filtered out to reduce clutters
              const isSourceVisible = filteredNodeIds.has(edge.fromNode);
              const isTargetVisible = filteredNodeIds.has(edge.toNode);
              const isDullConnection = !isSourceVisible || !isTargetVisible;

              // Customize connection appearance depending on edge type
              let strokeColor = '#cbd5e1'; // light slate for contain
              let strokeDash = '';
              let strokeWidth = '1.5';

              if (edge.type === 'navigates_to') {
                strokeColor = '#a5b4fc'; // solid indigo-300
                strokeWidth = '2';
              } else if (edge.type === 'triggers') {
                strokeColor = '#38bdf8'; // light blue-400
                strokeWidth = '2';
              } else if (edge.type === 'contains') {
                strokeDash = '3,3';
                strokeColor = '#e2e8f0'; // slate-200
              }

              // Bezier math to make connections curving elegantly instead of straight lines
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              let pathD = `M ${x1} ${y1} Q ${midX + 15} ${midY - 15} ${x2} ${y2}`;
              if (edge.type === 'contains') {
                pathD = `M ${x1} ${y1} L ${x2} ${y2}`; // straight for containment child
              }

              return (
                <g key={edge.id} className="transition-opacity duration-300">
                  <path
                    id={`path-${edge.id}`}
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    opacity={isDullConnection ? 0.15 : 0.75}
                  />
                  {/* Arrowhead markers logic for navigation curves */}
                  {edge.type !== 'contains' && !isDullConnection && (
                    <circle
                      cx={(x1 + x2 * 2) / 3 + 1}
                      cy={(y1 + y2 * 2) / 3 - 1}
                      r="3.5"
                      fill={edge.type === 'triggers' ? '#0284c7' : '#4f46e5'}
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            })}

            {/* 2. LAYER: Renders Pulse Radiations for currently investigated node */}
            {activeNodeId && (
              (() => {
                const activeNode = nodes.find(n => n.id === activeNodeId);
                if (activeNode) {
                  const x = activeNode.x ?? 100;
                  const y = activeNode.y ?? 100;
                  return (
                    <g>
                      <circle
                        cx={x}
                        cy={y}
                        r="35"
                        fill="none"
                        className="animate-ping"
                        stroke="#818cf8"
                        strokeWidth="3"
                        opacity="0.3"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="55"
                        fill="none"
                        className="animate-pulse"
                        stroke="#a5b4fc"
                        strokeWidth="1.5"
                        opacity="0.2"
                      />
                    </g>
                  );
                }
                return null;
              })()
            )}

            {/* 3. LAYER: Render Nodes as stylized clickable cards */}
            {nodes.map((node) => {
              const x = node.x ?? 100;
              const y = node.y ?? 100;
              const isSelected = selectedNodeId === node.id;
              const isActive = activeNodeId === node.id;
              const isVisible = filteredNodeIds.has(node.id);

              // Standard values depending on node levels
              const isPage = node.type === 'page';
              const cardRadius = isPage ? '10' : '50'; // standard page is card, interaction is pill/circle

              // Determine diagnostic border coloring
              let borderStroke = 'none';
              let fillBg = '#ffffff';
              let titleColor = '#1e293b'; // slate-800
              let borderStrokeWidth = '0';

              if (isSelected) {
                borderStroke = '#4f46e5'; // solid premium indigo boundary
                borderStrokeWidth = '2.5';
              } else if (isActive) {
                borderStroke = '#818cf8';
                borderStrokeWidth = '2';
              }

              // Icon selector helper
              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  className="node-element transition-opacity duration-300 cursor-pointer"
                  onClick={() => onSelectNode(node)}
                  opacity={isVisible ? 1 : 0.25}
                >
                  {isPage ? (
                    // Page Renders (Square rounded modular browser cards)
                    <g>
                      {/* Drop shadows */}
                      <rect
                        x="-70"
                        y="-25"
                        width="140"
                        height="50"
                        rx="8"
                        fill="#000000"
                        opacity={isSelected ? "0.08" : "0.03"}
                        transform="translate(1, 2)"
                      />
                      {/* Core container card */}
                      <rect
                        x="-70"
                        y="-25"
                        width="140"
                        height="50"
                        rx="8"
                        fill={fillBg}
                        stroke={borderStroke !== 'none' ? borderStroke : '#e2e8f0'}
                        strokeWidth={borderStrokeWidth !== '0' ? borderStrokeWidth : '1'}
                      />
                      {/* Browser top-bar accent */}
                      <path
                        d="M -70 -17 L 70 -17"
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <circle cx="-60" cy="-21" r="2" fill="#ef4444" opacity="0.6"/>
                      <circle cx="-54" cy="-21" r="2" fill="#f59e0b" opacity="0.6"/>
                      <circle cx="-48" cy="-21" r="2" fill="#10b981" opacity="0.6"/>

                      {/* Display Icon */}
                      <g transform="translate(-56, 10)">
                        <Layout className="w-3.5 h-3.5 text-indigo-500" />
                      </g>

                      {/* Page Info text */}
                      <text
                        x="-38"
                        y="5"
                        textAnchor="start"
                        fontSize="9.5"
                        fontWeight="700"
                        fill="#0f172a"
                        fontFamily="sans-serif"
                      >
                        {node.route}
                      </text>
                      
                      <text
                        x="-38"
                        y="16"
                        textAnchor="start"
                        fontSize="7"
                        fontWeight="500"
                        fill="#64748b"
                        fontFamily="sans-serif"
                      >
                        {node.label.substring(0, 18)}...
                      </text>

                      {/* Status indicator badge (lower right of page) */}
                      {node.status === 'deviation' && (
                        <g transform="translate(56, 12)">
                          <circle cx="0" cy="0" r="5" fill="#f43f5e" />
                          <path d="M 0 -2 L 0 1 M 0 2 L 0 2.5" stroke="white" strokeWidth="1" />
                        </g>
                      )}
                    </g>
                  ) : (
                    // Interaction nodes (Circle action target)
                    <g>
                      {/* Shadow */}
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill="#000000"
                        opacity={isSelected ? "0.06" : "0.02"}
                        transform="translate(0.5, 1.5)"
                      />

                      {/* Diagnostic status background */}
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill={
                          node.status === 'deviation'
                            ? '#fff1f2' // rose back
                            : node.isMutating
                            ? '#fef3c7' // amber backing for mutations
                            : '#f0fdf4' // green backing
                        }
                        stroke={
                          isSelected
                            ? '#4f46e5'
                            : node.status === 'deviation'
                            ? '#f43f5e'
                            : node.isMutating
                            ? '#f59e0b'
                            : '#86efac'
                        }
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                      />

                      {/* Action specific Icon indicator inside circles */}
                      <g transform="translate(-7, -7)">
                        {node.status === 'deviation' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        ) : node.isMutating ? (
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                        ) : node.elementType === 'input' ? (
                          <Search className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </g>

                      {/* Text label floating under circles */}
                      <text
                        x="0"
                        y="29"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="#334155"
                        fontFamily="sans-serif"
                      >
                        {node.label.split(' (')[0].split('Link')[0].split('Button')[0]}
                      </text>

                      <text
                        x="0"
                        y="38"
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="500"
                        fill="#94a3b8"
                        fontFamily="monospace"
                      >
                        {node.selector?.substring(0, 15) || 'node-action'}...
                      </text>

                      {/* Mini Confidence Gauge Ring surrounding bubble */}
                      <circle
                        cx="0"
                        cy="0"
                        r="22.5"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <path
                        d={(() => {
                          const conf = node.confidence;
                          const r = 22.5;
                          const angle = conf * 360;
                          const xVal = r * Math.sin((angle * Math.PI) / 180);
                          const yVal = -r * Math.cos((angle * Math.PI) / 180);
                          const largeArc = angle > 180 ? 1 : 0;
                          return `M 0 -${r} A ${r} ${r} 0 ${largeArc} 1 ${xVal} ${yVal}`;
                        })()}
                        fill="none"
                        stroke={node.confidence > 0.9 ? '#10b981' : node.confidence < 0.85 ? '#f59e0b' : '#3b82f6'}
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Dynamic Canvas Legend and State info HUD overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl p-3 text-[10px] space-y-2 z-10 shadow-sm max-w-[240px]">
          <p className="font-bold text-slate-700 text-xs border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>Visual Canvas Legend</span>
            <span className="text-[9px] font-mono font-normal text-slate-400">FPS: 60 (WebGL SVG)</span>
          </p>
          <div className="space-y-1 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2.5 rounded-sm bg-white border border-slate-300 block"></span>
              <span><strong>Page Nodes</strong>: URL Client Routing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 border border-emerald-300 block"></span>
              <span><strong>Interactions</strong>: Safe DOM elements</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-50 border border-amber-300 block"></span>
              <span><strong>Mutations</strong>: API Mutation nodes (Muted)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-50 border border-rose-300 block"></span>
              <span><strong>Gaps Found</strong>: Active Contradiction (Fails expectations)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 border-t border-indigo-400 block"></span>
              <span><strong>Flow Navigations</strong>: Router path vectors</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-50 text-[9px] text-slate-400 leading-tight">
            💡 <em>Click elements on graph to inspect selectors, expectations, and confidence logs details. Drag canvas space to pan viewport.</em>
          </div>
        </div>
      </div>
    </div>
  );
}
