export interface AppNode {
  id: string;
  type: 'page' | 'interaction';
  label: string;
  route: string;
  selector?: string;
  elementType?: string;
  expectedEffect?: string;
  confidence: number; // 0.0 - 1.0
  source: 'exploration';
  lastSeen: string;
  createdAt: string;
  isMutating?: boolean;
  status: 'confirmed' | 'deviation' | 'unvisited' | 'testing';
  notes?: string;
  x?: number;
  y?: number;
}

export interface AppEdge {
  id: string;
  fromNode: string;
  toNode: string;
  type: 'navigates_to' | 'contains' | 'triggers';
  confidence: number;
}

export interface Observation {
  id: string;
  nodeId: string;
  sessionName: string;
  outcome: 'confirmed' | 'deviation' | 'inconclusive';
  detail: string;
  timestamp: string;
  expected?: string;
  observed?: string;
  selector?: string;
}

export interface AppBudget {
  maxPages: number;
  timeLimitMinutes: number;
  avoidMutations: boolean;
}

export interface RunningSession {
  isActive: boolean;
  type: 'exploration' | 'test_run' | 'idle' | 'workflow_simulation';
  currentNodeId: string | null;
  progress: number; // percentage
  pagesVisited: number;
  interactionsExecuted: number;
  findingsCount: number;
  currentActionText: string;
}

export interface WorkOpStep {
  id: string;
  name: string;
  actor: 'User' | 'System API' | 'Background Worker';
  description: string;
  status: 'passed' | 'failed' | 'idle' | 'running';
  assignedNode?: string; 
}

export interface WorkOpFlow {
  id: string;
  name: string;
  category: 'Billing' | 'CRM Onboarding' | 'Inventory Update' | 'Compliance Audit';
  description: string;
  steps: WorkOpStep[];
  overallStatus: 'healthy' | 'critical' | 'unverified';
  lastExecuted: string;
}

