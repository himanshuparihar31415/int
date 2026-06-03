import React, { useState, useMemo, useEffect } from 'react';
import { AppNode, AppEdge, Observation, RunningSession, AppBudget, WorkOpFlow, WorkOpStep } from './types';
import { initialNodes, initialEdges, initialObservations, seededBugs, initialWorkflows } from './mockData';
import DashboardView from './components/DashboardView';
import ExplorationView from './components/ExplorationView';
import EvaluationView from './components/EvaluationView';
import WorkspaceView from './components/WorkspaceView';
import { 
  Cpu, 
  Layout, 
  Compass, 
  ShieldCheck, 
  Sliders, 
  Terminal, 
  CheckCircle2, 
  HelpCircle,
  Activity,
  Award
} from 'lucide-react';
import { flowStepsExploration, flowStepsTestRun } from './mockData';

export default function App() {
  
  // 1. Root States
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'exploration' | 'evaluation' | 'workspace'>('dashboard');
  const [nodes, setNodes] = useState<AppNode[]>(initialNodes);
  const [edges] = useState<AppEdge[]>(initialEdges);
  const [observations, setObservations] = useState<Observation[]>(initialObservations);
  const [workflows, setWorkflows] = useState<WorkOpFlow[]>(initialWorkflows);
  
  const [budget, setBudget] = useState<AppBudget>({
    maxPages: 12,
    timeLimitMinutes: 10,
    avoidMutations: true
  });

  const [selectedNode, setSelectedNode] = useState<AppNode | null>(null);
  const [isBugInjected, setIsBugInjected] = useState<boolean>(false);

  // Simulation Active Session
  const [session, setSession] = useState<RunningSession>({
    isActive: false,
    type: 'idle',
    currentNodeId: null,
    progress: 0,
    pagesVisited: 0,
    interactionsExecuted: 0,
    findingsCount: 0,
    currentActionText: 'System standby. Select a training or workflow simulation above.'
  });

  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [simWorkflowId, setSimWorkflowId] = useState<string | null>(null);
  const [simStepIdx, setSimStepIdx] = useState<number | null>(null);

  // 2. Anomaly Injection Handler
  const handleTriggerBugInjection = (inject: boolean) => {
    setIsBugInjected(inject);
    
    if (inject) {
      // Append seeded bug logs
      setObservations(prev => {
        const cleanPrev = prev.filter(p => !p.id.startsWith('bug_'));
        return [...cleanPrev, ...seededBugs];
      });

      // Update nodes configuration to reflect faults
      setNodes(prev => 
        prev.map(node => {
          if (node.id === 'int_cart_qty_decrement') {
            return {
              ...node,
              status: 'deviation' as const,
              confidence: 0.42,
              notes: '⚠️ SEEDED FAULT: Cart quantity decrements below zero, causing standard invoice sub-totals negative anomalies.'
            };
          }
          if (node.id === 'int_checkout_pay_now') {
            return {
              ...node,
              status: 'deviation' as const,
              confidence: 0.51,
              notes: '⚠️ SEEDED FAULT: Credit check handler fails Address validations, throwing WHITE SCREEN exceptions.'
            };
          }
          return node;
        })
      );

      // Mutate corresponding Workflows models as well
      setWorkflows(prev => 
        prev.map(flow => {
          if (flow.id === 'flow_inventory_sync') {
            return {
              ...flow,
              overallStatus: 'critical' as const,
              steps: flow.steps.map(s => {
                if (s.id === 'inv_2') return { ...s, status: 'failed' as const };
                return s;
              })
            };
          }
          return flow;
        })
      );

      if (!session.isActive) {
        setSession(prev => ({
          ...prev,
          findingsCount: 2,
          currentActionText: '⚠️ Mock system exceptions injected. Elements degraded.'
        }));
      }

    } else {
      // Clear seeded bugs
      setObservations(prev => prev.filter(p => !p.id.startsWith('bug_')));

      // Restore elements defaults
      setNodes(prev =>
        prev.map(node => {
          if (node.id === 'int_cart_qty_decrement') {
            return {
              ...node,
              status: 'confirmed' as const,
              confidence: 0.91,
              notes: 'Directly changes total invoice cost in floating banner.'
            };
          }
          if (node.id === 'int_checkout_pay_now') {
            return {
              ...node,
              status: 'confirmed' as const,
              confidence: 0.82,
              notes: 'Performs payment transaction mock and resets current list items context state.'
            };
          }
          return node;
        })
      );

      // Revert workflows categories status
      setWorkflows(prev => 
        prev.map(flow => {
          if (flow.id === 'flow_inventory_sync') {
            return {
              ...flow,
              overallStatus: 'healthy' as const,
              steps: flow.steps.map(s => {
                if (s.id === 'inv_2') return { ...s, status: 'passed' as const };
                return s;
              })
            };
          }
          return flow;
        })
      );

      if (!session.isActive) {
        setSession(prev => ({
          ...prev,
          findingsCount: 0,
          currentActionText: '✓ App health restored with stable predictions metrics.'
        }));
      }
    }
  };

  // 3. Autonomous Training Probe Simulator (Interval Loop)
  const handleStartSession = (type: 'exploration' | 'test_run') => {
    if (session.isActive) return;

    setSimStepIndex(0);
    setSession({
      isActive: true,
      type,
      currentNodeId: null,
      progress: 0,
      pagesVisited: 0,
      interactionsExecuted: 0,
      findingsCount: isBugInjected ? 2 : 0,
      currentActionText: type === 'exploration' 
        ? 'Booting self-learning model discovery...' 
        : 'Running prioritized non-destructive test constraints suite...'
    });
  };

  const handleStopSession = () => {
    setSession({
      isActive: false,
      type: 'idle',
      currentNodeId: null,
      progress: 0,
      pagesVisited: 0,
      interactionsExecuted: 0,
      findingsCount: isBugInjected ? 2 : 0,
      currentActionText: 'Simulating runner stopped manually.'
    });
    setSimStepIndex(0);
    setSimWorkflowId(null);
    setSimStepIdx(null);
  };

  // 4. Custom Workflow Steps Appender
  const handleAddCustomStep = (flowId: string, newStep: WorkOpStep) => {
    setWorkflows(prev => 
      prev.map(flow => {
        if (flow.id === flowId) {
          return {
            ...flow,
            overallStatus: 'unverified' as const,
            steps: [...flow.steps, newStep]
          };
        }
        return flow;
      })
    );
  };

  // 5. Systems Operations Flow Simulation callback
  const handlePlayWorkflow = (flowId: string) => {
    if (session.isActive) return;

    setSimWorkflowId(flowId);
    setSimStepIdx(0);
    
    // Set running workflows status
    setWorkflows(prev => 
      prev.map(f => {
        if (f.id === flowId) {
          return {
            ...f,
            steps: f.steps.map(s => ({ ...s, status: 'idle' as const }))
          };
        }
        return f;
      })
    );

    setSession({
      isActive: true,
      type: 'workflow_simulation',
      currentNodeId: null,
      progress: 0,
      pagesVisited: 1,
      interactionsExecuted: 1,
      findingsCount: isBugInjected ? 1 : 0,
      currentActionText: `Preparing high-level ops walkthrough for ${flowId}`
    });
  };

  // 6. Universal Simulation Progression Timer Tick
  useEffect(() => {
    if (!session.isActive) return;

    // Simulation type A & B: Training Graph Probes
    if (session.type === 'exploration' || session.type === 'test_run') {
      const activeStepsPreset = session.type === 'exploration' ? flowStepsExploration : flowStepsTestRun;

      const timer = setTimeout(() => {
        if (simStepIndex >= activeStepsPreset.length) {
          // Completed
          setSession(prev => ({
            ...prev,
            isActive: false,
            currentActionText: session.type === 'exploration' 
              ? '✓ Model Converged! Routing map consolidated with verified predictions.'
              : '✓ Elements checked successfully. Diagnostics logs generated in evaluation.',
            currentNodeId: null,
            progress: 100
          }));
          return;
        }

        const step = activeStepsPreset[simStepIndex];
        
        // If they checked a step that corrects quality
        if (session.type === 'exploration') {
          setNodes(prevNodes => 
            prevNodes.map(node => {
              if (step.currentNodeId === node.id) {
                return { ...node, status: 'confirmed' as const, confidence: Math.min(node.confidence + 0.02, 1.0) };
              }
              return node;
            })
          );
        } else {
          // test run step updates finding status
          setNodes(prevNodes => 
            prevNodes.map(node => {
              if (step.currentNodeId === node.id) {
                const targetStatus = isBugInjected && (node.id === 'int_cart_qty_decrement' || node.id === 'int_checkout_pay_now') 
                  ? ('deviation' as const) 
                  : ('confirmed' as const);
                return { ...node, status: targetStatus };
              }
              return node;
            })
          );
        }

        setSession(prev => ({
          ...prev,
          currentNodeId: step.currentNodeId || null,
          progress: Math.round(((simStepIndex + 1) / activeStepsPreset.length) * 100),
          pagesVisited: (step as any).pagesVisited || prev.pagesVisited,
          interactionsExecuted: (step as any).interactionsExecuted || prev.interactionsExecuted,
          currentActionText: `Running Probe on: [${step.currentNodeId}] — ${(step as any).actionText}`
        }));

        setSimStepIndex(prev => prev + 1);

      }, 1400);

      return () => clearTimeout(timer);
    } 
    
    // Simulation type C: Custom Workspace Operational flow walkthroughs
    if (session.type === 'workflow_simulation' && simWorkflowId) {
      const targetFlow = workflows.find(w => w.id === simWorkflowId);
      if (!targetFlow) return;

      const timer = setTimeout(() => {
        if (simStepIdx === null || simStepIdx >= targetFlow.steps.length) {
          // Completed
          setWorkflows(prev => 
            prev.map(f => {
              if (f.id === simWorkflowId) {
                // If bugs are injected, inventory update sync shows failure
                const hasFailure = isBugInjected && f.id === 'flow_inventory_sync';
                return { 
                  ...f, 
                  overallStatus: hasFailure ? ('critical' as const) : ('healthy' as const),
                  lastExecuted: 'Just now'
                };
              }
              return f;
            })
          );

          setSession(prev => ({
            ...prev,
            isActive: false,
            currentActionText: `✓ Operations flowchart walkthrough verified successfully!`,
            currentNodeId: null,
            progress: 100
          }));
          
          setSimWorkflowId(null);
          setSimStepIdx(null);
          return;
        }

        const step = targetFlow.steps[simStepIdx];
        
        // Update specific step status to running / passed
        setWorkflows(prev => 
          prev.map(f => {
            if (f.id === simWorkflowId) {
              const nextSteps = f.steps.map((s, idx) => {
                if (idx === simStepIdx) {
                  // If bug is active and it's the inventory dec step, mark failed
                  const isSyncFault = isBugInjected && s.id === 'inv_2';
                  return { ...s, status: isSyncFault ? ('failed' as const) : ('passed' as const) };
                }
                return s;
              });
              return { ...f, steps: nextSteps };
            }
            return f;
          })
        );

        setSession(prev => ({
          ...prev,
          currentNodeId: step.assignedNode || null,
          progress: Math.round(((simStepIdx + 1) / targetFlow.steps.length) * 100),
          currentActionText: `Executing Ops Step [${step.actor}]: ${step.name}...`
        }));

        setSimStepIdx(prev => (prev !== null ? prev + 1 : null));

      }, 1500);

      return () => clearTimeout(timer);
    }

  }, [session.isActive, simStepIndex, simStepIdx, simWorkflowId, isBugInjected]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800 flex flex-col justify-between">
      
      {/* 2. Global Top Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white p-2.5 rounded-2xl shadow-xs flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">Intellion</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Agent Console
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                Self-Learning Systems Operations Mappings & Verification Brain
              </p>
            </div>
          </div>

          {/* Staging target indicator */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-100 font-mono text-slate-500 text-[10px]">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
              <span>Workspace Port: <strong>3000</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-emerald-50 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-emerald-800">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Full-Stack Domain Ops Mapped</span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. Primary Modular Tabs Navigation */}
      <nav className="bg-white border-b border-slate-200/50 py-1.5 sticky top-[64px] z-10 shadow-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto p-1 bg-slate-50 border border-slate-200/60 rounded-xl">
            
            {/* Dashboard Tab */}
            <button
              onClick={() => { setSelectedNode(null); setActiveTab('dashboard'); }}
              className={`flex-1 min-w-[120px] py-2 px-4.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Layout className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : ''}`} />
              <span>Dashboard Overview</span>
            </button>

            {/* Exploration Tab */}
            <button
              onClick={() => { setSelectedNode(null); setActiveTab('exploration'); }}
              className={`flex-1 min-w-[120px] py-2 px-4.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'exploration'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Exploration Arena</span>
            </button>

            {/* Evaluation Tab */}
            <button
              onClick={() => { setSelectedNode(null); setActiveTab('evaluation'); }}
              className={`flex-1 min-w-[120px] py-2 px-4.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'evaluation'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === 'evaluation' ? 'text-emerald-500 font-bold' : ''}`} />
              <span>Assessment &amp; Evaluation</span>
            </button>

            {/* Workspace Tab */}
            <button
              onClick={() => { setSelectedNode(null); setActiveTab('workspace'); }}
              className={`flex-1 min-w-[120px] py-2 px-4.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sliders className={`w-4 h-4 ${activeTab === 'workspace' ? 'text-indigo-500 font-bold' : ''}`} />
              <span>Systems Ops Workspace</span>
            </button>

          </div>
        </div>
      </nav>

      {/* 4. Active Simulator State Bar */}
      {session.isActive && (
        <div className="bg-slate-900 text-white font-mono text-[11px] py-2 px-4 border-b border-slate-950 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping shrink-0"></span>
            <span className="font-bold text-cyan-400">ACTIVE INSTANCE :: [{session.type.toUpperCase()}]</span>
            <span className="text-slate-400 truncate max-w-[320px] sm:max-w-[480px]">
              &gt; {session.currentActionText}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
              <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${session.progress}%` }}></div>
            </div>
            <button 
              onClick={handleStopSession}
              className="text-slate-400 hover:text-rose-400 underline font-semibold transition cursor-pointer"
            >
              Abort
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <DashboardView 
            nodes={nodes}
            observations={observations}
            workflows={workflows}
            onNavigateTab={(tab) => {
              if (tab === 'exploration') setActiveTab('exploration');
              if (tab === 'evaluation') setActiveTab('evaluation');
              if (tab === 'workspace') setActiveTab('workspace');
            }}
          />
        )}

        {activeTab === 'exploration' && (
          <ExplorationView 
            nodes={nodes}
            edges={edges}
            budget={budget}
            session={session}
            onUpdateBudget={setBudget}
            onStartSession={handleStartSession}
            onStopSession={handleStopSession}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView 
            observations={observations}
            onAddMockBugs={() => handleTriggerBugInjection(true)}
            onClearMockBugs={() => handleTriggerBugInjection(false)}
            hasBugsSeeded={isBugInjected}
            nodes={nodes}
          />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceView 
            workflows={workflows}
            onPlayWorkflow={handlePlayWorkflow}
            activeWorkflowId={simWorkflowId}
            activeStepIdx={simStepIdx}
            onAddCustomStep={handleAddCustomStep}
          />
        )}
      </main>

      {/* 6. Professional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-xs text-slate-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="space-y-0.5">
            <p className="font-extrabold text-slate-700 text-xs">Intellion ™ High-Fidelity Domain Systems Operations Manager</p>
            <p className="font-medium text-[11px] text-slate-400">Memory-Mapped Autonomous Verification Network. All rights registered © 2026.</p>
          </div>
          <div className="flex gap-4 font-mono text-[9.5px]">
            <span>UTC TIMESTAMP: 2026-06-03 13:09</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Secure Container Sandbox
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
