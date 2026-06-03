import { useState, useEffect } from 'react';
import { RunningSession, AppBudget, AppNode } from '../types';
import { Play, RotateCcw, ShieldAlert, Cpu, Settings, ToggleLeft, ToggleRight, Sparkles, HelpCircle, Check, Bug } from 'lucide-react';
import { flowStepsExploration, flowStepsTestRun } from '../mockData';

interface ControlCenterProps {
  onUpdateSession: (session: RunningSession) => void;
  session: RunningSession;
  onUpdateNodesAndScores: (updatedNodes: AppNode[], updatedFindingsCount: number) => void;
  activeNodesList: AppNode[];
  onTriggerBugInjection: (inject: boolean) => void;
  isBugInjected: boolean;
}

export default function ControlCenter({
  onUpdateSession,
  session,
  onUpdateNodesAndScores,
  activeNodesList,
  onTriggerBugInjection,
  isBugInjected
}: ControlCenterProps) {
  // Config Local State (FR-1, FR-3)
  const [targetUrl, setTargetUrl] = useState('https://estoreswift.stg.corp-cloud.internal');
  const [username, setUsername] = useState('qa_agent_runner');
  const [isCredentialVisible, setIsCredentialVisible] = useState(false);
  
  const [budget, setBudget] = useState<AppBudget>({
    maxPages: 12,
    timeLimitMinutes: 10,
    avoidMutations: true
  });

  const [activePresetFlow, setActivePresetFlow] = useState<'none' | 'exploration' | 'test'>('none');
  const [flowIndex, setFlowIndex] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(1200); // ms per step

  // Timer simulation state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Incremental simulator clock
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (session.isActive) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [session.isActive]);

  const toggleMutationAvoidance = () => {
    setBudget(prev => ({
      ...prev,
      avoidMutations: !prev.avoidMutations
    }));
  };

  // Run Flow A Exploration simulation
  const startExplorationFlow = () => {
    if (session.isActive) return;

    setActivePresetFlow('exploration');
    setFlowIndex(0);
    
    // Initialize session state
    onUpdateSession({
      isActive: true,
      type: 'exploration',
      currentNodeId: null,
      progress: 0,
      pagesVisited: 0,
      interactionsExecuted: 0,
      findingsCount: isBugInjected ? 2 : 0,
      currentActionText: 'Bootstrapping exploration orchestrator engine...'
    });
  };

  // Run Flow B prioritized test plans execution simulation
  const startTestRunFlow = () => {
    if (session.isActive) return;

    setActivePresetFlow('test');
    setFlowIndex(0);

    onUpdateSession({
      isActive: true,
      type: 'test_run',
      currentNodeId: null,
      progress: 0,
      pagesVisited: 0,
      interactionsExecuted: 0,
      findingsCount: isBugInjected ? 2 : 0,
      currentActionText: 'Generating prioritized plan based on low confidence & mutating criteria...'
    });
  };

  // Simulation step iterations
  useEffect(() => {
    if (!session.isActive || activePresetFlow === 'none') return;

    const interval = setTimeout(() => {
      if (activePresetFlow === 'exploration') {
        // Steps of exploration simulation
        if (flowIndex >= flowStepsExploration.length) {
          // Flow Finished
          onUpdateSession({
            ...session,
            isActive: false,
            currentActionText: '✓ Session Completed! Knowledge graph successfully consolidated.',
            currentNodeId: null,
          });
          setActivePresetFlow('none');
          return;
        }

        const step = flowStepsExploration[flowIndex];
        
        // Update nodes collection scores
        const nextNodes = activeNodesList.map(node => {
          // If the step updates confidence for this specific node
          const targetConf = step.confidenceAdjustment[node.id];
          if (targetConf) {
            return {
              ...node,
              confidence: targetConf,
              status: 'confirmed' as const
            };
          }
          return node;
        });

        onUpdateNodesAndScores(nextNodes, session.findingsCount);
        
        onUpdateSession({
          ...session,
          currentNodeId: step.currentNodeId,
          progress: Math.round(((flowIndex + 1) / flowStepsExploration.length) * 100),
          pagesVisited: step.pagesVisited,
          interactionsExecuted: step.interactionsExecuted,
          currentActionText: `${step.actionText}`
        });

        setFlowIndex(flowIndex + 1);

      } else if (activePresetFlow === 'test') {
        // Steps of Prioritized testing simulation
        if (flowIndex >= flowStepsTestRun.length) {
          // Finish test run
          onUpdateSession({
            ...session,
            isActive: false,
            currentActionText: '✓ Prioritized test plan executed fully. Check Findings Review Log for active results.',
            currentNodeId: null,
          });
          setActivePresetFlow('none');
          return;
        }

        const step = flowStepsTestRun[flowIndex];

        // Process test step result
        const targetNodeId = step.currentNodeId;
        const nextNodes = activeNodesList.map(node => {
          if (node.id === targetNodeId) {
            return {
              ...node,
              status: isBugInjected && (node.id === 'int_cart_qty_decrement' || node.id === 'int_checkout_pay_now') 
                ? ('deviation' as const) 
                : ('confirmed' as const),
              confidence: isBugInjected && (node.id === 'int_cart_qty_decrement' || node.id === 'int_checkout_pay_now')
                ? 0.45 
                : Math.min(node.confidence + 0.05, 1.0)
            };
          }
          return node;
        });

        const updatedFindings = isBugInjected 
          ? (flowIndex + 1) // incrementally discover seeded issues
          : session.findingsCount;

        onUpdateNodesAndScores(nextNodes, updatedFindings);

        onUpdateSession({
          ...session,
          currentNodeId: targetNodeId,
          progress: Math.round(((flowIndex + 1) / flowStepsTestRun.length) * 100),
          pagesVisited: step.pagesVisited,
          interactionsExecuted: step.interactionsExecuted,
          findingsCount: updatedFindings,
          currentActionText: `${step.actionText}`
        });

        setFlowIndex(flowIndex + 1);
      }

    }, simulationSpeed);

    return () => clearTimeout(interval);

  }, [session.isActive, activePresetFlow, flowIndex, simulationSpeed, isBugInjected]);

  const cancelActiveJob = () => {
    onUpdateSession({
      isActive: false,
      type: 'idle',
      currentNodeId: null,
      progress: 0,
      pagesVisited: 0,
      interactionsExecuted: 0,
      findingsCount: isBugInjected ? 2 : 0,
      currentActionText: 'Orchestrator simulation stopped manually.'
    });
    setActivePresetFlow('none');
    setFlowIndex(0);
  };

  // Reset core confidence settings to defaults
  const resetEntireGraphState = () => {
    cancelActiveJob();
    const defaultNodes = activeNodesList.map(node => ({
      ...node,
      status: 'confirmed' as const,
      confidence: node.id === 'int_checkout_promo_input' ? 0.77 : node.id === 'int_details_size_select' ? 0.85 : 0.95
    }));
    onUpdateNodesAndScores(defaultNodes, isBugInjected ? 2 : 0);
  };

  // Formatting seconds Helper
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* 1. Setup Parameters & Target Area */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-slate-800 font-bold text-sm tracking-tight flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <Settings className="w-4 h-4 text-indigo-500" />
          Target Definition & Budget Config
        </h4>
        
        {/* URL Target & Auth details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Host URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="e.g. https://target-app.com"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">API / UI Auth Credentials</label>
              <button 
                onClick={() => setIsCredentialVisible(!isCredentialVisible)}
                className="text-[9px] text-indigo-600 hover:underline"
              >
                {isCredentialVisible ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={isCredentialVisible ? 'text' : 'password'}
              aria-label="Target Authentication credentials"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Budget Config */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Max Crawl Pages</span>
              <span className="font-mono bg-indigo-50 text-indigo-600 px-1.5 rounded">{budget.maxPages} pgs</span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              value={budget.maxPages}
              onChange={(e) => setBudget(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Timeout Budget</span>
              <span className="font-mono bg-indigo-50 text-indigo-600 px-1.5 rounded">{budget.timeLimitMinutes} min</span>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              value={budget.timeLimitMinutes}
              onChange={(e) => setBudget(prev => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) }))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition cursor-pointer select-none" onClick={toggleMutationAvoidance}>
            <div className="leading-tight pr-2">
              <p className="text-[10px] font-bold text-slate-700">Avoid Mutative UI Actions</p>
              <p className="text-[8px] text-slate-400 text-left">FR-4 Destructive Block</p>
            </div>
            <button aria-label="Toggle mutation protection">
              {budget.avoidMutations ? (
                <ToggleRight className="w-8 h-8 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Run Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel A: Guided Explorer */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>Guided Exploration Flow A</span>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1.5 leading-relaxed">
              Accepts target URL and explores routes autonomously to construct a structured 2-layer schema in memory.
            </p>
          </div>

          <button
            onClick={startExplorationFlow}
            disabled={session.isActive}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              session.isActive
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Launch Active Exploration
          </button>
        </div>

        {/* Panel B: Prioritized Schema Validation */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Prioritized Scheme Verification Flow B</span>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1.5 leading-relaxed">
              Parses current graph memory, targets flaky nodes (&lt; 0.90) and mutative interactions, and records contradictions.
            </p>
          </div>

          <button
            onClick={startTestRunFlow}
            disabled={session.isActive}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              session.isActive
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Validate Schema Match
          </button>
        </div>

        {/* Dynamic Live Status & Action HUD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-slate-200 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block font-mono">
                {session.isActive ? '⚡ Active Job Running' : '● System Standby'}
              </span>
              {session.isActive && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">{formatTime(elapsedSeconds)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-2 space-y-1">
              <p className="text-[11px] font-bold text-white leading-tight truncate">
                {session.isActive ? `Operation Mode: ${session.type === 'exploration' ? 'Guided Discovery' : 'Test Validation'}` : 'Click Live Simulation Flow above'}
              </p>
              <p className="text-[10px] font-mono text-emerald-400 font-medium leading-relaxed italic h-8 overflow-hidden line-clamp-2">
                &gt; {session.currentActionText}
              </p>
            </div>
          </div>

          {session.isActive ? (
            <button
              onClick={cancelActiveJob}
              className="w-full py-1.5 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Abort Simulation
            </button>
          ) : (
            <button
              onClick={resetEntireGraphState}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700/50 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Graph Model
            </button>
          )}
        </div>
      </div>

      {/* 3. Live Contradiction Seeding Injection Unit (FR-12, FR-15) */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-3 items-start">
          <div className="bg-rose-500 text-white p-2 rounded-xl mt-0.5">
            <Bug className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-rose-900 font-bold text-sm tracking-tight flex items-center gap-1.5">
              Knowledge Gap Contradiction Injector
            </h4>
            <p className="text-xs text-rose-700 mt-1 max-w-xl">
              Seed live conceptual contradictions into eStore Swift target environment. Enabling triggers dynamic validation errors and expectation desyncs on checkout elements. Watch how Intellion identifies and surfaces these live discrepancies instantly.
            </p>
          </div>
        </div>

        <button
          onClick={() => onTriggerBugInjection(!isBugInjected)}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
            isBugInjected
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200'
              : 'bg-white hover:bg-slate-50 text-rose-700 border border-rose-200 shadow-sm'
          }`}
        >
          {isBugInjected ? (
            <>
              <Check className="w-4 h-4" />
              <span>Contradictions Active!</span>
            </>
          ) : (
            <>
              <Bug className="w-4 h-4 text-rose-600" />
              <span>Simulate Schema Contradictions</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
