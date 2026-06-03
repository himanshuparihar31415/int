import React, { useState, useMemo } from 'react';
import { WorkOpFlow, WorkOpStep } from '../types';
import { Play, ClipboardList, HelpCircle, User, Cpu, Database, Plus, CheckCircle, XCircle, RefreshCw, Layers, ShieldCheck, Check } from 'lucide-react';

interface WorkspaceViewProps {
  workflows: WorkOpFlow[];
  onPlayWorkflow: (flowId: string) => void;
  activeWorkflowId: string | null;
  activeStepIdx: number | null;
  onAddCustomStep: (flowId: string, newStep: WorkOpStep) => void;
}

export default function WorkspaceView({
  workflows,
  onPlayWorkflow,
  activeWorkflowId,
  activeStepIdx,
  onAddCustomStep
}: WorkspaceViewProps) {
  
  const [selectedFlowId, setSelectedFlowId] = useState<string>(workflows[0]?.id || '');
  
  // Custom Step Builder Fields
  const [stepName, setStepName] = useState<string>('');
  const [stepActor, setStepActor] = useState<'User' | 'System API' | 'Background Worker'>('User');
  const [stepDesc, setStepDesc] = useState<string>('');
  const [assignedSelector, setAssignedSelector] = useState<string>('');
  const [isSuccessMsg, setIsSuccessMsg] = useState<boolean>(false);

  const selectedFlow = useMemo(() => {
    return workflows.find(w => w.id === selectedFlowId);
  }, [workflows, selectedFlowId]);

  const handleCreateStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepName || !selectedFlowId) return;

    const newStep: WorkOpStep = {
      id: `custom_step_${Date.now()}`,
      name: stepName,
      actor: stepActor,
      description: stepDesc || `Execute operations sync validation on target`,
      status: 'idle',
      assignedNode: assignedSelector
    };

    onAddCustomStep(selectedFlowId, newStep);
    
    // Clear fields
    setStepName('');
    setStepDesc('');
    setAssignedSelector('');
    setIsSuccessMsg(true);
    setTimeout(() => setIsSuccessMsg(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Left Sidebar: Workflow template chooser (Col Span 4) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-slate-800 font-extrabold text-[12px] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Domain Operations Directory
            </h4>
            <p className="text-[10px] text-slate-400 leading-tight">Switch between configured business &amp; systems flowcharts</p>
          </div>

          <div className="space-y-2">
            {workflows.map((flow) => {
              const isSelected = flow.id === selectedFlowId;
              const hasCritical = flow.overallStatus === 'critical';
              const isFlowRunning = activeWorkflowId === flow.id;

              return (
                <button
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold' 
                      : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700 font-semibold'
                  }`}
                >
                  <div className="space-y-0.5 leading-tight">
                    <span className="text-[9px] font-mono text-slate-400 block tracking-tight uppercase">
                      {flow.category}
                    </span>
                    <span className="block truncate max-w-[190px]">
                      {flow.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFlowRunning && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block"></span>
                    )}
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      flow.overallStatus === 'healthy' 
                        ? 'bg-emerald-500' 
                        : flow.overallStatus === 'critical' 
                        ? 'bg-rose-500 animate-pulse' 
                        : 'bg-slate-300'
                    }`}></span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Customized Step Creator form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-slate-800 font-extrabold text-[12px] uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" />
              Append Custom Step
            </h4>
            <p className="text-[10px] text-slate-400 leading-tight">Construct customized checkpoints and map them to DOM selectors</p>
          </div>

          <form onSubmit={handleCreateStep} className="space-y-3.5 text-xs">
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Step Description / Title</label>
              <input 
                type="text" 
                placeholder="e.g. Submit Hubspot webhook webhook sync"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Responsible Agent / Actor</label>
              <select 
                value={stepActor}
                onChange={(e) => setStepActor(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="User">User Simulation (Click/Input)</option>
                <option value="System API">System API Verification</option>
                <option value="Background Worker">Background Worker (Queue/Database)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Expected detail effect</label>
              <input 
                type="text" 
                placeholder="e.g., Expect status Code 201 response"
                value={stepDesc}
                onChange={(e) => setStepDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Element Selector (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. button#btn-trigger-sync"
                value={assignedSelector}
                onChange={(e) => setAssignedSelector(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono placeholder:font-sans focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {isSuccessMsg && (
              <p className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1.5 font-semibold">
                <Check className="w-3.5 h-3.5" />
                Step added into flowchart successfully!
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition"
            >
              Add Step to Flowchart
            </button>

          </form>

        </div>

      </div>

      {/* 2. Right Side: Interactive Flow Simulation Board (Col Span 8) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        
        {selectedFlow ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            
            {/* Simulation Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1.5 max-w-xl">
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {selectedFlow.category} Operations Template
                </span>
                <h3 className="text-slate-800 font-extrabold text-sm md:text-base tracking-tight">{selectedFlow.name}</h3>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">{selectedFlow.description}</p>
              </div>

              {/* Play Simulation Button */}
              <button 
                onClick={() => onPlayWorkflow(selectedFlow.id)}
                disabled={activeWorkflowId !== null}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition text-white shadow-xs ${
                  activeWorkflowId === selectedFlow.id 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                }`}
              >
                {activeWorkflowId === selectedFlow.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Sync...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Verification Simulation</span>
                  </>
                )}
              </button>
            </div>

            {/* Steps simulation sequence log */}
            <div className="py-4 space-y-3.5 flex-1 max-h-[360px] overflow-y-auto pr-1">
              {selectedFlow.steps.map((step, idx) => {
                
                const isRunning = activeWorkflowId === selectedFlow.id && activeStepIdx === idx;
                const isPassed = step.status === 'passed' || (activeWorkflowId === selectedFlow.id && activeStepIdx !== null && idx < activeStepIdx);
                const isFailed = step.status === 'failed';
                const isIdle = !isRunning && !isPassed && !isFailed;

                // Actor icons mapping
                let actorIcon = <User className="w-4 h-4" />;
                if (step.actor === 'System API') actorIcon = <Cpu className="w-4 h-4" />;
                if (step.actor === 'Background Worker') actorIcon = <Database className="w-4 h-4" />;

                // Step status styling
                let borderClass = "border-slate-100 bg-white hover:border-slate-200";
                let statusBadge = null;

                if (isRunning) {
                  borderClass = "border-cyan-300 bg-cyan-50/20 shadow-xs ring-1 ring-cyan-100 scale-[1.015] duration-300";
                  statusBadge = (
                    <span className="px-2 py-0.5 text-[8px] font-extrabold bg-cyan-500 text-white rounded animate-pulse">
                      RUNNING_PROBE
                    </span>
                  );
                } else if (isPassed) {
                  borderClass = "border-emerald-100 bg-emerald-50/15";
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3 text-emerald-500 fill-white" />
                      PASSED
                    </span>
                  );
                } else if (isFailed) {
                  borderClass = "border-rose-100 bg-rose-50/15";
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[9px] text-rose-650 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded">
                      <XCircle className="w-3 h-3 text-rose-500 fill-white" />
                      UNSTABLE FLAKY DEVIATION
                    </span>
                  );
                }

                return (
                  <div 
                    key={step.id} 
                    className={`flex gap-3 px-4 py-3.5 rounded-xl border text-xs leading-normal transition-all duration-200 ${borderClass}`}
                  >
                    {/* Left actor icon */}
                    <div className={`p-2 rounded-lg ${
                      isRunning 
                        ? 'bg-cyan-500 text-white' 
                        : isPassed 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isFailed 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-slate-100 text-slate-500'
                    } shrink-0 h-fit self-center`}>
                      {actorIcon}
                    </div>

                    {/* Central Content */}
                    <div className="space-y-1 flex-1 leading-snug">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-800 font-sans block">{step.name}</span>
                        {statusBadge}
                      </div>
                      
                      <p className="text-slate-500 font-medium text-[11px]">{step.description}</p>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] font-mono font-medium text-slate-400 pt-1">
                        <span>Actor: {step.actor}</span>
                        {step.assignedNode && (
                          <span className="text-indigo-600 block bg-slate-50 px-1 rounded border border-slate-100 truncate max-w-[280px]">
                            DOM Target: {step.assignedNode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom status overview summary */}
            <div className="pt-4 border-t border-slate-100 text-[10.5px] text-slate-400 flex flex-wrap justify-between items-center gap-2">
              <span className="font-medium flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                This flowchart verifies all security policies and session context constraints during execution.
              </span>
              <span className="font-mono text-[9.5px]">
                Last Executed run: {selectedFlow.lastExecuted}
              </span>
            </div>

          </div>
        ) : (
          <div className="py-24 text-center text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold">No active flowchart selected</p>
            <p className="text-[11px] mt-1 max-w-[280px] mx-auto text-slate-400">
              Please choose a system or business operation flowchart from the left-hand menu to configure steps or run simulation validations.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
