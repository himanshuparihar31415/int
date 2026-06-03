import React, { useState, useMemo } from 'react';
import { Observation, AppNode } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  FileCode, 
  Check, 
  RefreshCw, 
  Zap, 
  Bug, 
  Eye, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Cpu, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { successComparisonMetrics } from '../mockData';

interface EvaluationViewProps {
  observations: Observation[];
  onAddMockBugs: () => void;
  onClearMockBugs: () => void;
  hasBugsSeeded: boolean;
  nodes?: AppNode[];
}

export default function EvaluationView({
  observations,
  onAddMockBugs,
  onClearMockBugs,
  hasBugsSeeded,
  nodes = []
}: EvaluationViewProps) {
  
  const [subTab, setSubTab] = useState<'tracker' | 'ask'>('ask');
  const [selectedLanguage, setSelectedLanguage] = useState<'playwright' | 'cypress' | 'puppeteer'>('playwright');
  const [copied, setCopied] = useState<boolean>(false);

  // Historical previous sessions tracker states
  const [selectedSessionId, setSelectedSessionId] = useState<string>('SES-LIVE');
  const [customSessionInput, setCustomSessionInput] = useState<string>('');
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<string | null>(null);
  const [sessionQAAnswers, setSessionQAAnswers] = useState<Record<string, { question: string; answer: string; isLoading: boolean; loadingLog: string }>>({});

  // Ask Question State
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [isLoadingQA, setIsLoadingQA] = useState<boolean>(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [loadingLogIndex, setLoadingLogIndex] = useState<number>(0);

  // Rotating status logs for the loading state to keep it highly technical and engaging
  const loadingLogs = [
    "Spinning up Intellion schema-network analyser...",
    "Re-aggregating current domain traces & conceptual deviations...",
    "Contextualizing element selectors in model verified schema...",
    "Querying Gemini-3.5-Flash model...",
    "Finalizing knowledge alignment predictions & feedback..."
  ];

  // Filters
  const deviations = useMemo(() => {
    return observations.filter(o => o.outcome === 'deviation');
  }, [observations]);

  // Historical previous sessions data ledger
  const historicalSessions = useMemo(() => {
    return [
      {
        id: 'SES-LIVE',
        label: 'Live Dynamic Run',
        status: hasBugsSeeded ? 'unaligned' : 'coherent',
        date: 'Active Session',
        description: 'Dynamic schema verification session analyzing active workspace anomalies.',
        knowledgeConflict: hasBugsSeeded 
          ? 'An active functional desync exists where cart limits and purchase checkout trigger flows contradict verified system assertions (e.g. cart decrement below zero, payment crash).' 
          : 'All verified frontend actions correspond perfectly to target logic constraints. Coherent schema.',
        findings: deviations,
        graphNodes: [
          { id: 'page_cart', label: 'Shopping Cart', type: 'page', status: hasBugsSeeded ? 'deviation' : 'confirmed', x: 80, y: 55 },
          { id: 'int_qty', label: 'Decr Button', type: 'interaction', status: hasBugsSeeded ? 'deviation' : 'confirmed', x: 200, y: 55 },
          { id: 'int_pay', label: 'Pay Click', type: 'interaction', status: hasBugsSeeded ? 'deviation' : 'confirmed', x: 320, y: 55 }
        ],
        graphEdges: [
          { from: 'page_cart', to: 'int_qty' },
          { from: 'int_qty', to: 'int_pay' }
        ],
        suggestedQuestions: [
          'What causes the active cart decrement deviation and how can it be mitigated?',
          'Suggest a Playwright repair wrapper for the active checkout whiteout trigger.'
        ]
      },
      {
        id: 'SES-9214',
        label: 'SES-9214: Stripe Gate',
        status: 'unaligned',
        date: '2026-06-02 14:18',
        description: 'Past automated verification run targeting Stripe gateways & promo expiration schemas.',
        knowledgeConflict: 'Stripe transaction handler parses payload items even if the Promo coupon expiration throws expired token codes. Bypasses core purchase security locks.',
        findings: [
          {
            id: 'bug_promo_expired',
            detail: 'Promo coupon validation bypasses negative boundary safeguards.',
            timestamp: '2026-06-02 14:18',
            expected: 'Trigger red message alert block "Code Expired", lock checkout pay button click actions',
            observed: 'Successfully processed item totals at -$10.00 base credit ledger values',
            selector: 'input#checkout-promo-token'
          },
          {
            id: 'bug_stripe_crash',
            detail: 'Payment submit crashes UI tree in standard billing sandbox.',
            timestamp: '2026-06-02 14:18',
            expected: 'Display standard graceful checkout processing alert error modal',
            observed: 'Window stripe handler returns undefined fields, causing screen layout whiteout',
            selector: 'button#checkout-payment-details-submit'
          }
        ],
        graphNodes: [
          { id: 'page_chk', label: 'Secure Checkout', type: 'page', status: 'confirmed', x: 80, y: 55 },
          { id: 'int_prm', label: 'Promo Token Input', type: 'interaction', status: 'deviation', x: 200, y: 35 },
          { id: 'int_pay', label: 'Stripe Pay Now', type: 'interaction', status: 'deviation', x: 320, y: 85 }
        ],
        graphEdges: [
          { from: 'page_chk', to: 'int_prm' },
          { from: 'page_chk', to: 'int_pay' }
        ],
        suggestedQuestions: [
          'Why does the Secure Checkout view bypass stripe error validation codes?',
          'Draft a Cypress script to explicitly test the promo token timeout exceptions.'
        ]
      },
      {
        id: 'SES-3312',
        label: 'SES-3312: Sizing picker',
        status: 'unaligned',
        date: '2026-05-31 09:44',
        description: 'Historical check on detail catalog layouts reviewing reactive size options dynamic rules.',
        knowledgeConflict: 'Variant sizingpicker select element allows item dispatch of depleted sizes instead of blocking client basket additions, causing inventory mismatch error codes.',
        findings: [
          {
            id: 'bug_size_underflow',
            detail: 'Depleted size variables selectable inside dropdown fields.',
            timestamp: '2026-05-31 09:44',
            expected: 'Renders Size 12 with grey lock "TEMP SOLD OUT", option selectable disabled',
            observed: 'Option was clickable, dispatch added invalid items with API Variant Stock Out Errors',
            selector: 'select.details-size-picker-select'
          }
        ],
        graphNodes: [
          { id: 'page_det', label: 'Item Detail Layout', type: 'page', status: 'confirmed', x: 90, y: 55 },
          { id: 'int_siz', label: 'Sizing Picker Select', type: 'interaction', status: 'deviation', x: 240, y: 55 }
        ],
        graphEdges: [
          { from: 'page_det', to: 'int_siz' }
        ],
        suggestedQuestions: [
          'How to sync model state rules for item variant sold-out configurations?',
          'Explain the standard deviation on catalog sizes picker render bounds.'
        ]
      },
      {
        id: 'SES-7852',
        label: 'SES-7852: Ledger sync',
        status: 'unaligned',
        date: '2026-05-28 16:30',
        description: 'Network-authoratative check sync sweep verifying warehouse webhook event relays.',
        knowledgeConflict: 'UI cart removals update local client badge counts accurately but fail to secure a connection response from the stock ledger API, causing system desynchronization.',
        findings: [
          {
            id: 'bug_warehouse_webhook',
            detail: 'Cart subtraction is missing webhook event retry guarantees.',
            timestamp: '2026-05-28 16:30',
            expected: 'Trigger secondary retry queue if warehouse ledger drops /api/inventory connections',
            observed: 'UI subtracted item view, but backend returned timeout error. Queue dropped event silently.',
            selector: 'button.cart-qty-spinner-decrease'
          }
        ],
        graphNodes: [
          { id: 'page_crt', label: 'Shopping Cart', type: 'page', status: 'confirmed', x: 90, y: 55 },
          { id: 'int_dec', label: 'Qty Decr Button', type: 'interaction', status: 'deviation', x: 240, y: 55 }
        ],
        graphEdges: [
          { from: 'page_crt', to: 'int_dec' }
        ],
        suggestedQuestions: [
          'How can we build automated webhook event retry locks in the checkout lifecycle?',
          'Analyze the warehouse queue payload drop metrics during cart reductions.'
        ]
      }
    ];
  }, [hasBugsSeeded, deviations]);

  // Handle previous session QA ask flow
  const handleSessionQA = async (sessionId: string, questionText: string) => {
    if (!questionText.trim()) return;

    setSessionQAAnswers(prev => ({
      ...prev,
      [sessionId]: {
        question: questionText,
        answer: '',
        isLoading: true,
        loadingLog: 'Verifying trace context with active ledger schemas...'
      }
    }));

    const sessionData = historicalSessions.find(s => s.id === sessionId);

    const logs = [
      "Accessing Snapshots for " + sessionId + "...",
      "Querying Gemini-3.5-Flash assistant model...",
      "Parsing knowledge desynchronization solutions..."
    ];
    let currentLogIdx = 0;
    const interval = setInterval(() => {
      currentLogIdx = (currentLogIdx + 1) % logs.length;
      setSessionQAAnswers(prev => {
        if (!prev[sessionId]) return prev;
        return {
          ...prev,
          [sessionId]: {
            ...prev[sessionId],
            loadingLog: logs[currentLogIdx]
            }
          };
        });
      }, 1000);

      try {
        const response = await fetch('/api/ask-intellion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: `[SESSION CONTEXT: ${sessionId}] ${questionText}. Context overview: ${sessionData?.description}. Knowledge Conflict: ${sessionData?.knowledgeConflict}. Findings list: ${JSON.stringify(sessionData?.findings)}`,
            observations: sessionData?.findings || [],
            nodesContext: sessionData?.graphNodes.map(g => ({ id: g.id, label: g.label, type: g.type, notes: g.label }))
          })
        });

        if (!response.ok) throw new Error("Server returned API error code: " + response.status);
        const data = await response.json();
        
        setSessionQAAnswers(prev => ({
          ...prev,
          [sessionId]: {
            question: questionText,
            answer: data.answer || "No response received from model helper.",
            isLoading: false,
            loadingLog: ""
          }
        }));
      } catch (err: any) {
        setSessionQAAnswers(prev => ({
          ...prev,
          [sessionId]: {
            question: questionText,
            answer: "Failed to connect to Intellion Core Assistant. Error: " + (err.message || "Network timeout"),
            isLoading: false,
            loadingLog: ""
          }
        }));
      } finally {
        clearInterval(interval);
      }
    };

  // Code exporter templates based on verified selectors
  const exportedScriptCode = useMemo(() => {
    const targetSel = deviations[0]?.selector || 'button#btn-add-to-cart-primary';

    if (selectedLanguage === 'playwright') {
      return `import { test, expect } from '@playwright/test';

test('verify eStore Swift critical checkout flows', async ({ page }) => {
  // Step 1: Navigating through model verified path
  await page.goto('https://estore-swift-staging.dev/');
  
  // Step 2: Target interaction with verified selector
  const itemButton = page.locator('${targetSel}');
  await expect(itemButton).toBeVisible();
  await itemButton.click();
  
  // Step 3: Run mutation verification
  const cartBadge = page.locator('.navbar-cart-badge-index');
  await expect(cartBadge).toHaveText('1');
});`;
    } else if (selectedLanguage === 'cypress') {
      return `describe('Intellion Verified Flow Domain Assertion', () => {
  it('Verifies critical actions on target elements', () => {
    cy.visit('https://estore-swift-staging.dev/');
    
    // Assert and click verified target element
    cy.get('${targetSel}')
      .should('be.visible')
      .click();
      
    // Assert state update expectation
    cy.get('.navbar-cart-badge-index')
      .should('contain', '1');
  });
});`;
    } else {
      return `const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://estore-swift-staging.dev/');
  
  // WaitFor verified element
  await page.waitForSelector('${targetSel}');
  await page.click('${targetSel}');
  
  // Check state expectation
  await browser.close();
})();`;
    }
  }, [selectedLanguage, deviations]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(exportedScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Ask Question Handler
  const handleAskQuestionSubmit = async (customText?: string) => {
    const questionToAsk = customText || userQuestion;
    if (!questionToAsk.trim()) return;

    setIsLoadingQA(true);
    setQaError(null);
    setAiAnswer('');
    
    // Rotate logs effect
    setLoadingLogIndex(0);
    const intervals = setInterval(() => {
      setLoadingLogIndex(prev => (prev + 1) % loadingLogs.length);
    }, 1200);

    try {
      const response = await fetch('/api/ask-intellion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionToAsk,
          observations: observations,
          nodesContext: nodes
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      setAiAnswer(data.answer || "No response received.");
      if (!customText) {
        setUserQuestion(''); // clear input only for manual entry
      }
    } catch (err: any) {
      console.error(err);
      setQaError(err.message || "Failed to contact Intellion core assistant.");
    } finally {
      clearInterval(intervals);
      setIsLoadingQA(false);
    }
  };

  const quickPrompts = [
    {
      title: "Analyze Schema Inconsistencies",
      text: "List and summarize all active domain schema inconsistencies, highlighting their expected vs observed outcomes.",
      icon: <Bug className="w-3.5 h-3.5 text-rose-500" />
    },
    {
      title: "Resolve Quantity Contradiction",
      text: "How do I fix the cart quantity decrement standard contradiction so it never slips into negative value exceptions?",
      icon: <SlidersIcon className="w-3.5 h-3.5 text-indigo-500" />
    },
    {
      title: "Confidence Metrics Review",
      text: "Compare confidence status scores for nodes in our active graph and explain what cause them to decay below 80%.",
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />
    },
    {
      title: "Pipeline Selector Specs",
      text: "Generate Playwright code standard assertions to verify checkout pay now selectors and avoid Address White Screen triggers.",
      icon: <FileCode className="w-3.5 h-3.5 text-emerald-500" />
    }
  ];

  const currentSession = useMemo(() => {
    return historicalSessions.find(s => s.id === selectedSessionId) || historicalSessions[0];
  }, [historicalSessions, selectedSessionId]);

  return (
    <div className="space-y-6">
      
      {/* 2. Sub Category Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs border">
        <button
          onClick={() => setSubTab('tracker')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            subTab === 'tracker'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Zap className={`w-4 h-4 ${subTab === 'tracker' ? 'text-amber-400' : ''}`} />
          <span>Diagnostics &amp; Anomalies</span>
        </button>

        <button
          onClick={() => setSubTab('ask')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
            subTab === 'ask'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${subTab === 'ask' ? 'text-amber-200 fill-indigo-500/10' : ''}`} />
          <span>Ask Intellion Core Assistant</span>
        </button>
      </div>

      {subTab === 'tracker' ? (
        <>
          {/* 1. Performance Diagnostics Comparison section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-slate-800 font-extrabold text-[13px] tracking-tight flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                  Comparative Intelligence Diagnostics (Intellion vs General Crawlers)
                </h3>
                <p className="text-[10px] text-slate-400 leading-tight">Key metrics proving the target-driven efficiency increase</p>
              </div>
              
              <div className="p-1 px-2.5 bg-indigo-50 border border-indigo-100/50 rounded-lg text-indigo-700 font-bold text-[10px] uppercase font-sans">
                Success Metrics Match Status
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1.5">
              
              {/* Comparison metric 1 */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/40">
                <h4 className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">Executable Step Count Optimization</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Blind Crawler steps:</span>
                    <span className="font-mono text-slate-700 font-bold">{successComparisonMetrics.blindCrawlerExecutes}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-bold text-indigo-700">Intellion target steps:</span>
                    <span className="font-mono text-indigo-700 font-black">{successComparisonMetrics.intellionExecutes}</span>
                  </div>
                  <div className="h-1.5 bg-indigo-100 rounded-full w-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${(successComparisonMetrics.intellionExecutes / successComparisonMetrics.blindCrawlerExecutes) * 100}%` }}></div>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 pt-1 leading-tight font-medium">
                  ✨ <strong>40% speed reduction:</strong> Graph paths prevent circular redirects and recursive form spam on mutating states.
                </p>
              </div>

              {/* Comparison metric 2 */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/40">
                <h4 className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">Interactive Defect Discovery Ratio</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Dumb Crawler Findings:</span>
                    <span className="font-mono text-slate-700 font-bold">{successComparisonMetrics.blindCrawlerFindings}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{ width: '33%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-bold text-emerald-700">Intellion Map Findings:</span>
                    <span className="font-mono text-emerald-700 font-black">{successComparisonMetrics.intellionFindings}</span>
                  </div>
                  <div className="h-1.5 bg-emerald-100 rounded-full w-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 pt-1 leading-tight font-medium">
                  💡 <strong>Accurate coverage:</strong> Autonomous target evaluation captures deep checkout errors.
                </p>
              </div>

              {/* Comparison metric 3 */}
              <div className="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/40">
                <h4 className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">Confidence &amp; Route Stability</h4>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 border border-indigo-50 bg-white rounded-lg leading-tight">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">System Coverage</span>
                    <span className="font-mono text-indigo-700 font-extrabold text-[14px]">
                      {successComparisonMetrics.coverageGrowthPercent}%
                    </span>
                    <span className="text-[8px] text-emerald-500 block">Baseline was {successComparisonMetrics.baselineCoveragePercent}%</span>
                  </div>

                  <div className="p-2 border border-teal-50 bg-white rounded-lg leading-tight">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase block">Reid Stability</span>
                    <span className="font-mono text-teal-700 font-extrabold text-[14px]">
                      {successComparisonMetrics.reidentifiedStability}%
                    </span>
                    <span className="text-[8px] text-slate-400 block">Element tracking</span>
                  </div>
                </div>
                <p className="text-[9.5px] text-slate-400 pt-1 leading-tight font-medium">
                  🎯 <strong>96% node stability:</strong> Accurately tracks selectors across layout dynamic changes.
                </p>
              </div>

            </div>

          </div>

          {/* 2. Isolated Deviations / Seeded Anomaly list */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Anomaly list (Col Span 7) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-slate-800 font-extrabold text-[13px] tracking-tight flex items-center gap-1.5">
                    <Bug className="w-4 h-4 text-rose-500" />
                    Active Domain Contradiction Tracker
                  </h3>
                  <p className="text-[10px] text-slate-400">Comparison of expected behaviors vs actual observed state flags across historic runs</p>
                </div>

                <div className="flex items-center gap-2">
                  {hasBugsSeeded ? (
                    <button 
                      onClick={onClearMockBugs}
                      className="px-2.5 py-1.5 text-[9px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      Clear Mapped Departures
                    </button>
                  ) : (
                    <button 
                      onClick={onAddMockBugs}
                      className="px-2.5 py-1.5 text-[9px] font-extrabold bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                    >
                      Simulate Knowledge Gaps
                    </button>
                  )}
                </div>
              </div>

              {/* Previous Session Selection Tabs */}
              <div className="space-y-1">
                <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block">Session Logs History Trace</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {historicalSessions.map((histSess) => {
                    const isSelected = selectedSessionId === histSess.id;
                    return (
                      <button
                        key={histSess.id}
                        onClick={() => {
                          setSelectedSessionId(histSess.id);
                          setSelectedNodeDetail(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${histSess.id === 'SES-LIVE' ? 'bg-indigo-500' : 'bg-rose-500'} ${isSelected && 'animate-pulse bg-white'}`} />
                        <span>{histSess.label}</span>
                        {histSess.findings.length > 0 && (
                          <span className="text-[9px] font-mono opacity-80">({histSess.findings.length})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Section Content: Knowledge Conflict and Mini-Graph */}
              <div className="space-y-3.5 pt-1">
                
                {/* 1. Knowledge Conflict Description */}
                <div className="bg-rose-50/25 border border-rose-100 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Domain Knowledge Conflict Summary</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-sans">
                    {currentSession.knowledgeConflict}
                  </p>
                </div>

                {/* 2. Interactive SVG Subset Graph */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    <span>Interactive Local Session Graph Trace</span>
                    <span className="text-[8.5px] lowercase italic bg-slate-100 font-normal px-1.5 py-0.5 rounded text-slate-500">
                      click nodes to inspect
                    </span>
                  </div>
                  
                  <div className="border border-slate-200/70 bg-slate-50/40 rounded-xl p-3 flex flex-col items-center">
                    <svg viewBox="0 0 400 120" className="w-full max-w-sm h-[120px] font-sans">
                      <defs>
                        <marker id="mini-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
                        </marker>
                        <pattern id="mini-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#f1f5f9" strokeWidth="0.7" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mini-grid)" />

                      {/* Render edges with pulsing tracers */}
                      {currentSession.graphEdges.map((edge, eidx) => {
                        const fromNode = currentSession.graphNodes.find(n => n.id === edge.from);
                        const toNode = currentSession.graphNodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;
                        return (
                          <g key={eidx}>
                            <line 
                              x1={fromNode.x} 
                              y1={fromNode.y} 
                              x2={toNode.x} 
                              y2={toNode.y} 
                              stroke="#cbd5e1" 
                              strokeWidth="1.5" 
                              strokeDasharray="4 3"
                              markerEnd="url(#mini-arrow)" 
                            />
                            <circle r="2.5" fill="#f43f5e">
                              <animateMotion 
                                path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`} 
                                dur="2.2s" 
                                repeatCount="indefinite" 
                              />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Render Nodes */}
                      {currentSession.graphNodes.map((node) => {
                        const isDeviationNode = node.status === 'deviation';
                        const isNodeSelected = selectedNodeDetail === node.id;
                        return (
                          <g 
                            key={node.id} 
                            onClick={() => {
                              setSelectedNodeDetail(isNodeSelected ? null : node.id);
                            }}
                            className="cursor-pointer group node-element"
                          >
                            {isDeviationNode && (
                              <circle cx={node.x} cy={node.y} r="20" fill="#f43f5e" className="animate-ping opacity-15" />
                            )}
                            <circle 
                              cx={node.x} 
                              cy={node.y} 
                              r="13" 
                              fill={isDeviationNode ? '#f43f5e' : '#f1f5f9'} 
                              stroke={isNodeSelected ? '#4f46e5' : (isDeviationNode ? '#f43f5e' : '#cbd5e1')} 
                              strokeWidth={isNodeSelected ? '3.5' : '1.5'} 
                              className="transition-all duration-150 scale-100 group-hover:scale-110" 
                            />
                            
                            <text 
                              x={node.x} 
                              y={node.y + 3.5} 
                              textAnchor="middle" 
                              className={`text-[8.5px] font-extrabold select-none ${isDeviationNode ? 'fill-white' : 'fill-slate-600'}`}
                            >
                              {node.type === 'page' ? 'P' : 'I'}
                            </text>
                            
                            <text 
                              x={node.x} 
                              y={node.y + 22} 
                              textAnchor="middle" 
                              className={`text-[9px] font-extrabold tracking-tight ${isNodeSelected ? 'fill-indigo-600' : 'fill-slate-700'}`}
                            >
                              {node.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Node Mini Inspector details inline banner */}
                    {selectedNodeDetail && (
                      (() => {
                        const activeNode = currentSession.graphNodes.find(n => n.id === selectedNodeDetail);
                        if (!activeNode) return null;
                        return (
                          <div className="mt-3 text-[10px] bg-slate-900 border border-slate-800 text-white p-3 rounded-lg w-full max-w-sm space-y-1.5 shadow-sm animate-in fade-in-50 duration-150 font-sans">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-1 font-bold">
                              <span className="text-indigo-400 font-mono">[{activeNode.id}]</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] ${activeNode.status === 'deviation' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {activeNode.status === 'deviation' ? 'CONTRADICTION' : 'STABLE BASELINE'}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-tight">Label: <strong>{activeNode.label}</strong></p>
                            <p className="text-[9.5px] text-slate-400 leading-normal">
                              {activeNode.status === 'deviation' 
                                ? "⚠️ Verification identified structural and logical mismatches on this node interaction schema." 
                                : "✓ Telemetry trace confirmed standard expected state response matches perfectly."}
                            </p>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* 3. Exact Findings list for selected session */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    <span>Exact Findings ({currentSession.findings.length})</span>
                    <span>Snapshot State</span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {currentSession.findings.length === 0 ? (
                      <div className="p-10 text-center bg-emerald-50/10 border border-dashed border-emerald-100/50 rounded-xl space-y-1">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                        <h4 className="text-[11px] font-bold text-slate-800">Domain Coherence Secure</h4>
                        <p className="text-[9.5px] text-slate-400">No telemetry deviations logged in selected session context.</p>
                      </div>
                    ) : (
                      currentSession.findings.map((f, fidx) => (
                        <div 
                          key={f.id || fidx} 
                          className="border border-rose-100 rounded-xl p-3 bg-rose-50/15 space-y-2 text-xs text-secondary leading-normal"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1 py-0.5 text-white bg-rose-500 rounded text-[8.5px] font-bold">CONTRADICTION</span>
                              <strong className="text-rose-950 font-extrabold leading-snug">{f.detail}</strong>
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 bg-white border border-slate-100 px-1 rounded whitespace-nowrap shrink-0 self-center">
                              {f.timestamp}
                            </span>
                          </div>

                          {f.selector && (
                            <div className="text-[9.5px] font-mono bg-white p-1.5 rounded border border-rose-100/40 text-slate-500 flex justify-between items-center gap-2">
                              <span className="truncate">Selector: {f.selector}</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(f.selector || '');
                                }}
                                className="text-[8.5px] text-indigo-600 hover:underline font-extrabold shrink-0 cursor-pointer"
                              >
                                Copy Selector
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <div className="p-2 rounded-lg bg-green-50/30 border border-green-100/40 leading-snug">
                              <span className="text-[7.5px] font-extrabold text-green-700 block uppercase tracking-wider">Expected Schema Specification:</span>
                              <p className="text-slate-600 font-medium">{f.expected || 'Target stable action output'}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-rose-50 bg-opacity-65 border border-rose-100/60 leading-snug">
                              <span className="text-[7.5px] font-extrabold text-rose-700 block uppercase tracking-wider">Observed Telemetry Mismatch:</span>
                              <p className="text-slate-700 font-medium">{f.observed || 'Element behavior deviation'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Actionable Q&A Follow-up Session Assistant */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span className="text-[11px] font-extrabold text-slate-800 tracking-tight">
                      Follow Up with Intellion Assistant on {currentSession.id}
                    </span>
                  </div>

                  {/* Inline loading or answers logs */}
                  {sessionQAAnswers[currentSession.id]?.isLoading ? (
                    <div className="p-4 bg-white rounded-lg border border-slate-200/50 flex flex-col items-center justify-center space-y-2 text-center h-[120px]">
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                      <p className="text-[10px] font-bold text-slate-750 animate-pulse">
                        {sessionQAAnswers[currentSession.id]?.loadingLog || "Interpreting historical snapshots..."}
                      </p>
                    </div>
                  ) : sessionQAAnswers[currentSession.id]?.answer ? (
                    <div className="p-4 bg-white rounded-xl border border-indigo-150 space-y-2.5 max-h-[220px] overflow-y-auto">
                      <div className="text-[9.5px] text-slate-400 flex justify-between items-center bg-indigo-50/50 p-1.5 px-2.5 rounded-lg font-mono">
                        <span className="font-extrabold text-indigo-950">Q: "{sessionQAAnswers[currentSession.id]?.question}"</span>
                        <button 
                          onClick={() => {
                            setSessionQAAnswers(prev => {
                              const cleaned = { ...prev };
                              delete cleaned[currentSession.id];
                              return cleaned;
                            });
                          }}
                          className="text-[8.5px] text-rose-500 hover:text-rose-700 hover:underline font-extrabold cursor-pointer"
                        >
                          Reset Q&A
                        </button>
                      </div>
                      <div className="border-l-2 border-indigo-500 pl-2 text-xs text-slate-700">
                        <FormattedAnswer text={sessionQAAnswers[currentSession.id].answer} />
                      </div>
                    </div>
                  ) : null}

                  {/* Preset quick session target follow-up questions */}
                  <div className="flex flex-wrap gap-1.5">
                    {currentSession.suggestedQuestions.map((q, qidx) => (
                      <button
                        key={qidx}
                        onClick={() => handleSessionQA(currentSession.id, q)}
                        disabled={sessionQAAnswers[currentSession.id]?.isLoading}
                        className="text-[10px] text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50/25 border border-slate-200 hover:border-indigo-100 rounded-lg py-1 px-2.5 transition text-left cursor-pointer font-medium disabled:opacity-40"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>

                  {/* Ask custom session input */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={`Draft customized followup for ${currentSession.id}...`}
                      value={customSessionInput}
                      onChange={(e) => setCustomSessionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customSessionInput.trim()) {
                          handleSessionQA(currentSession.id, customSessionInput);
                          setCustomSessionInput('');
                        }
                      }}
                      disabled={sessionQAAnswers[currentSession.id]?.isLoading}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 font-medium"
                    />
                    <button
                      onClick={() => {
                        if (customSessionInput.trim()) {
                          handleSessionQA(currentSession.id, customSessionInput);
                          setCustomSessionInput('');
                        }
                      }}
                      disabled={sessionQAAnswers[currentSession.id]?.isLoading || !customSessionInput.trim()}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-450 text-white font-extrabold text-[10px] rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Ask AI
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Action Script exporter panel (Col Span 5) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              
              <div className="space-y-1.5">
                <h3 className="text-slate-800 font-extrabold text-[13px] tracking-tight flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  Knowledge Assertion Exporter
                </h3>
                <p className="text-[10px] text-slate-400">Export verified elements selectors directly into your local CI pipeline</p>
              </div>

              <div className="space-y-3 flex-1 text-xs pt-1.5">
                
                <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  {(['playwright', 'cypress', 'puppeteer'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition capitalize cursor-pointer ${
                        selectedLanguage === lang 
                          ? 'bg-white text-slate-800 shadow-xs' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <pre className="bg-slate-900 border border-slate-950 text-emerald-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-[250px] leading-relaxed">
                    {exportedScriptCode}
                  </pre>

                  <button 
                    onClick={handleCopyCode}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
                    title="Copy Script to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-[9.5px] text-slate-400 italic">
                  * Intellion exports code structured with standard UI identifiers, matching verified element anchors mapped on your training graphs.
                </p>

              </div>

            </div>

          </div>
        </>
      ) : (
        /* Ask Intellion AI Core Chat Assistant View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h3 className="text-slate-900 font-extrabold text-[14px] tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                Intellion Verification Core AI
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                AI Agent trained on your system graph-nodes ({nodes.length}) and active telemetry ({observations.length} logs)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Model Reference: <strong>gemini-3.5-flash</strong></span>
            </div>
          </div>

          {/* Quick recommendations grid */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Quick Telemetry Queries
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUserQuestion(prompt.text);
                    handleAskQuestionSubmit(prompt.text);
                  }}
                  disabled={isLoadingQA}
                  className="group block text-left p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:bg-indigo-50/35 hover:border-indigo-100 transition cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {prompt.icon}
                    <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-indigo-950">{prompt.title}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 group-hover:text-slate-600 leading-snug truncate whitespace-normal">
                    "{prompt.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Input & submission container */}
          <div className="space-y-3">
            <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ask Intellion anything (e.g. 'How does cart total decrement fail?', 'Is checkout route stable?')"
                rows={3}
                disabled={isLoadingQA}
                className="w-full p-3.5 pb-12 bg-white text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-hidden border-0"
              />
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2.5">
                {userQuestion.trim().length > 0 && (
                  <span className="text-[9px] text-slate-400 font-mono">
                    {userQuestion.length} chars
                  </span>
                )}
                <button
                  onClick={() => handleAskQuestionSubmit()}
                  disabled={isLoadingQA || !userQuestion.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isLoadingQA ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 text-indigo-100" />
                  )}
                  <span>{isLoadingQA ? "Analyzing" : "Ask Core"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Answer display console */}
          <div className="mt-4 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Intellion Telemetry Report
              </span>
              <span className="font-mono text-[10px]">VERIFIED OUTPUT</span>
            </div>

            <div className="p-5 min-h-[160px] bg-slate-50/20">
              {isLoadingQA ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3.5 text-center">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-50 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-800 animate-pulse">{loadingLogs[loadingLogIndex]}</p>
                    <p className="text-[10px] text-slate-400">Comparing observations vectors with active checkout handlers...</p>
                  </div>
                </div>
              ) : qaError ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-extrabold text-rose-950">Query Execution Failure</h5>
                    <p className="text-[11px] text-rose-700 font-medium">{qaError}</p>
                    <p className="text-[10px] text-slate-400 pt-1 leading-normal">
                      Confirm your backend server is loaded successfully. If using simulated actions, make sure your workspace port 3000 is running correctly.
                    </p>
                  </div>
                </div>
              ) : aiAnswer ? (
                <div className="animate-fade-in space-y-2">
                  <FormattedAnswer text={aiAnswer} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 text-slate-300" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-xs text-slate-600">Intellion AI Is Idle</p>
                    <p className="text-[10px] text-slate-400 max-w-[340px] mx-auto mt-0.5 leading-relaxed">
                      Select one of the telemetry prompt keys above or enter your custom training questions. I'll analyze current active anomalies instantly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Inline custom Markdown Renderer designed for pristine UI and fast execution
function FormattedAnswer({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2.5 text-slate-700 text-xs leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5"></div>;
        }

        // Check for Markdown Headings
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-extrabold text-[12.5px] text-slate-900 mt-4 border-b border-slate-100 pb-1">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-black text-[13px] text-indigo-950 mt-5 border-b border-indigo-50 pb-1">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-black text-[14px] text-indigo-950 mt-6">
              {line.slice(2)}
            </h2>
          );
        }

        // Bullet list item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const cleanLine = trimmed.replace(/^[\*\-]\s+/, '');
          return (
            <div key={idx} className="flex gap-2.5 pl-3 text-slate-700 font-medium">
              <span className="text-indigo-500 select-none">•</span>
              <div className="flex-1">{parseInlineMarkdown(cleanLine)}</div>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const cleanLine = numMatch[2];
          return (
            <div key={idx} className="flex gap-2 px-3 text-slate-700 font-medium whitespace-normal">
              <span className="text-indigo-600 font-mono text-[10px] font-extrabold">{num}.</span>
              <div className="flex-1">{parseInlineMarkdown(cleanLine)}</div>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <p key={idx} className="font-medium text-slate-600 leading-relaxed whitespace-normal">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

// Inline bold and ticks formatter
function parseInlineMarkdown(text: string) {
  // Highlight bold items `**item**`
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-extrabold text-slate-900">
          {part}
        </strong>
      );
    }

    // Highlight backticks code style \`code\`
    const subparts = part.split(/`([^`]+)`/g);
    return subparts.map((subpart, subindex) => {
      if (subindex % 2 === 1) {
        return (
          <code 
            key={subindex} 
            className="font-mono text-[9.5px] font-semibold bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200 mx-0.5"
          >
            {subpart}
          </code>
        );
      }
      return subpart;
    });
  });
}

// SlidersIcon to support cleanly
function SlidersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
