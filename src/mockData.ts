import { AppNode, AppEdge, Observation } from './types';

// The pre-structured 2-layer autonomous map for "eStore Swift Staging App"
export const initialNodes: AppNode[] = [
  // Page Layer Nodes
  {
    id: 'page_home',
    type: 'page',
    label: 'Home Dashboard (Landing)',
    route: '/',
    confidence: 0.98,
    source: 'exploration',
    lastSeen: '2026-06-03 12:45',
    createdAt: '2026-06-01 09:00',
    status: 'confirmed',
    notes: 'The entry point of eStore Swift. Stable navigation, header components present.',
    x: 160,
    y: 200
  },
  {
    id: 'page_products',
    type: 'page',
    label: 'Products Listing Directory',
    route: '/products',
    confidence: 0.95,
    source: 'exploration',
    lastSeen: '2026-06-03 12:42',
    createdAt: '2026-06-01 09:12',
    status: 'confirmed',
    notes: 'Renders catalog containing filters and sort controls.',
    x: 360,
    y: 200
  },
  {
    id: 'page_product_details',
    type: 'page',
    label: 'Product Detail Layout [ID: 101]',
    route: '/product/101',
    confidence: 0.92,
    source: 'exploration',
    lastSeen: '2026-06-03 12:35',
    createdAt: '2026-06-01 09:30',
    status: 'confirmed',
    notes: 'Renders dynamic size guides and ratings modules.',
    x: 560,
    y: 200
  },
  {
    id: 'page_cart',
    type: 'page',
    label: 'Shopping Cart Drawer',
    route: '/cart',
    confidence: 0.94,
    source: 'exploration',
    lastSeen: '2026-06-03 12:30',
    createdAt: '2026-06-01 09:44',
    status: 'confirmed',
    notes: 'Interactive items review board with total calculation summaries.',
    x: 440,
    y: 420
  },
  {
    id: 'page_checkout',
    type: 'page',
    label: 'Multi-step Secure Checkout',
    route: '/checkout',
    confidence: 0.88,
    source: 'exploration',
    lastSeen: '2026-06-03 11:15',
    createdAt: '2026-06-01 10:10',
    status: 'confirmed',
    notes: 'Collects user addresses and handles Stripe sandbox integrations.',
    x: 680,
    y: 420
  },
  {
    id: 'page_order_dashboard',
    type: 'page',
    label: 'Success / Orders Dashboard',
    route: '/dashboard',
    confidence: 0.91,
    source: 'exploration',
    lastSeen: '2026-06-03 10:44',
    createdAt: '2026-06-01 10:45',
    status: 'confirmed',
    notes: 'User dashboard showing invoice tracking numbers.',
    x: 880,
    y: 310
  },

  // Interactions attached to Page: Home
  {
    id: 'int_home_search',
    type: 'interaction',
    label: 'Search Field (Text Input)',
    route: '/',
    selector: 'input[name="search-catalog"]',
    elementType: 'input',
    expectedEffect: 'Render dynamic suggestions popup matching term',
    confidence: 0.97,
    source: 'exploration',
    lastSeen: '2026-06-03 12:45',
    createdAt: '2026-06-01 09:05',
    status: 'confirmed',
    notes: 'Entering letters triggers debounced XHR to /api/suggest.',
    x: 80,
    y: 110
  },
  {
    id: 'int_home_nav_products',
    type: 'interaction',
    label: 'Shop Now Button Link',
    route: '/',
    selector: 'a.nav-shop-now-hero',
    elementType: 'link',
    expectedEffect: 'Navigate client routing to /products',
    confidence: 0.99,
    source: 'exploration',
    lastSeen: '2026-06-03 12:44',
    createdAt: '2026-06-01 09:06',
    status: 'confirmed',
    notes: 'Instant transition, no full document reload occurring.',
    x: 240,
    y: 110
  },

  // Interactions attached to Page: Products Directory
  {
    id: 'int_products_filter_price',
    type: 'interaction',
    label: 'Price Slider Control',
    route: '/products',
    selector: 'div.slider-range-price-handle-left',
    elementType: 'slider',
    expectedEffect: 'DOM filters items based on price boundary slider',
    confidence: 0.94,
    source: 'exploration',
    lastSeen: '2026-06-03 12:41',
    createdAt: '2026-06-01 09:15',
    status: 'confirmed',
    notes: 'Coordinates update on screen without full network database search.',
    x: 280,
    y: 110
  },
  {
    id: 'int_products_click_item_101',
    type: 'interaction',
    label: 'View Swift Boots Item Link',
    route: '/products',
    selector: 'div.item-card-wrapper[data-id="101"] a',
    elementType: 'link',
    expectedEffect: 'Navigate client routing to /product/101',
    confidence: 0.96,
    source: 'exploration',
    lastSeen: '2026-06-03 12:39',
    createdAt: '2026-06-01 09:20',
    status: 'confirmed',
    notes: 'Loads metadata associated with inventory index 101.',
    x: 360,
    y: 290
  },

  // Interactions attached to Page: Product Details
  {
    id: 'int_details_add_to_cart',
    type: 'interaction',
    label: 'Add to Cart Basket Button',
    route: '/product/101',
    selector: 'button#btn-add-to-cart-primary',
    elementType: 'button',
    expectedEffect: 'Increment cart counter in navbar; dispatch /api/cart post',
    confidence: 0.92,
    source: 'exploration',
    lastSeen: '2026-06-03 12:35',
    createdAt: '2026-06-01 09:35',
    isMutating: true,
    status: 'confirmed',
    notes: 'Mutates items in cart DB. Dispatched payload {itemId: 101, qty: 1}.',
    x: 560,
    y: 70
  },
  {
    id: 'int_details_size_select',
    type: 'interaction',
    label: 'Size Menu Select',
    route: '/product/101',
    selector: 'select.details-size-picker-select',
    elementType: 'select',
    expectedEffect: 'Updates selected size value state context',
    confidence: 0.85,
    source: 'exploration',
    lastSeen: '2026-06-03 12:33',
    createdAt: '2026-06-01 09:37',
    status: 'confirmed',
    notes: 'Low confidence originally due to inconsistent UI layout rendering when sizes are depleted.',
    x: 650,
    y: 120
  },

  // Interactions attached to Page: Cart Drawer
  {
    id: 'int_cart_qty_decrement',
    type: 'interaction',
    label: 'Decrease Quantity Step Btn',
    route: '/cart',
    selector: 'button.cart-qty-spinner-decrease',
    elementType: 'button',
    expectedEffect: 'Reduce count of active item. If counter is 1, open delete prompt',
    confidence: 0.91,
    source: 'exploration',
    lastSeen: '2026-06-03 12:28',
    createdAt: '2026-06-01 09:50',
    isMutating: true,
    status: 'confirmed',
    notes: 'Directly changes total invoice cost in floating banner.',
    x: 340,
    y: 490
  },
  {
    id: 'int_cart_checkout_proceed',
    type: 'interaction',
    label: 'Proceed with Order Button',
    route: '/cart',
    selector: 'button#cart-drawer-checkout-footer-btn',
    elementType: 'button',
    expectedEffect: 'Navigate client routing to secure /checkout form panel',
    confidence: 0.95,
    source: 'exploration',
    lastSeen: '2026-06-03 12:24',
    createdAt: '2026-06-01 09:52',
    status: 'confirmed',
    notes: 'Triggers navigation lock check to check if session tokens are active.',
    x: 550,
    y: 495
  },

  // Interactions attached to Page: Checkout Form
  {
    id: 'int_checkout_promo_input',
    type: 'interaction',
    label: 'Discount Voucher Code Field',
    route: '/checkout',
    selector: 'input#checkout-coupon-code-field',
    elementType: 'input',
    expectedEffect: 'Subtract discounts from client order receipt mock state',
    confidence: 0.77,
    source: 'exploration',
    lastSeen: '2026-06-03 11:15',
    createdAt: '2026-06-01 10:15',
    status: 'confirmed',
    notes: 'Voucher validation has flaky mock response depending on random server load values.',
    x: 770,
    y: 490
  },
  {
    id: 'int_checkout_pay_now',
    type: 'interaction',
    label: 'Submit Credit Payment Button',
    route: '/checkout',
    selector: 'button#checkout-payment-details-submit',
    elementType: 'button',
    expectedEffect: 'Run sandbox card transaction billing and redirect to /dashboard',
    confidence: 0.82,
    source: 'exploration',
    lastSeen: '2026-06-03 10:59',
    createdAt: '2026-06-01 10:20',
    isMutating: true,
    status: 'confirmed',
    notes: 'Performs payment transaction mock and resets current list items context state.',
    x: 780,
    y: 310
  }
];

export const initialEdges: AppEdge[] = [
  // Page to Page navigations/connections (Structural transitions)
  { id: 'edge_home_products', fromNode: 'page_home', toNode: 'page_products', type: 'navigates_to', confidence: 0.99 },
  { id: 'edge_products_detail', fromNode: 'page_products', toNode: 'page_product_details', type: 'navigates_to', confidence: 0.97 },
  { id: 'edge_detail_cart', fromNode: 'page_product_details', toNode: 'page_cart', type: 'navigates_to', confidence: 0.95 },
  { id: 'edge_cart_checkout', fromNode: 'page_cart', toNode: 'page_checkout', type: 'navigates_to', confidence: 0.96 },
  { id: 'edge_checkout_dashboard', fromNode: 'page_checkout', toNode: 'page_order_dashboard', type: 'navigates_to', confidence: 0.92 },

  // Page contains Interaction nodes
  { id: 'edge_home_search_contain', fromNode: 'page_home', toNode: 'int_home_search', type: 'contains', confidence: 1.0 },
  { id: 'edge_home_nav_products_contain', fromNode: 'page_home', toNode: 'int_home_nav_products', type: 'contains', confidence: 1.0 },
  { id: 'edge_products_filter', fromNode: 'page_products', toNode: 'int_products_filter_price', type: 'contains', confidence: 1.0 },
  { id: 'edge_products_click_item', fromNode: 'page_products', toNode: 'int_products_click_item_101', type: 'contains', confidence: 1.0 },
  { id: 'edge_details_add_contain', fromNode: 'page_product_details', toNode: 'int_details_add_to_cart', type: 'contains', confidence: 1.0 },
  { id: 'edge_details_size_contain', fromNode: 'page_product_details', toNode: 'int_details_size_select', type: 'contains', confidence: 1.0 },
  { id: 'edge_cart_qty_contain', fromNode: 'page_cart', toNode: 'int_cart_qty_decrement', type: 'contains', confidence: 1.0 },
  { id: 'edge_cart_checkout_contain', fromNode: 'page_cart', toNode: 'int_cart_checkout_proceed', type: 'contains', confidence: 1.0 },
  { id: 'edge_checkout_promo_contain', fromNode: 'page_checkout', toNode: 'int_checkout_promo_input', type: 'contains', confidence: 1.0 },
  { id: 'edge_checkout_pay_contain', fromNode: 'page_checkout', toNode: 'int_checkout_pay_now', type: 'contains', confidence: 1.0 },

  // Interactions triggering navigation redirects (triggers)
  { id: 'edge_trig_home_products', fromNode: 'int_home_nav_products', toNode: 'page_products', type: 'triggers', confidence: 0.99 },
  { id: 'edge_trig_click_item', fromNode: 'int_products_click_item_101', toNode: 'page_product_details', type: 'triggers', confidence: 0.96 },
  { id: 'edge_trig_cart_checkout', fromNode: 'int_cart_checkout_proceed', toNode: 'page_checkout', type: 'triggers', confidence: 0.95 },
  { id: 'edge_trig_pay_dashboard', fromNode: 'int_checkout_pay_now', toNode: 'page_order_dashboard', type: 'triggers', confidence: 0.92 }
];

export const initialObservations: Observation[] = [
  {
    id: 'obs_1',
    nodeId: 'int_home_search',
    sessionName: 'Session_30_GuidedEx',
    outcome: 'confirmed',
    detail: 'Search input renders suggestion list dropdown containing 4 matches within 120ms.',
    timestamp: '2026-06-03 12:45',
    selector: 'input[name="search-catalog"]'
  },
  {
    id: 'obs_2',
    nodeId: 'int_products_filter_price',
    sessionName: 'Session_30_GuidedEx',
    outcome: 'confirmed',
    detail: 'Dragging left slider handles updates products list filter instantly without network request delays.',
    timestamp: '2026-06-03 12:41',
    selector: 'div.slider-range-price-handle-left'
  },
  {
    id: 'obs_3',
    nodeId: 'int_details_add_to_cart',
    sessionName: 'Session_29_TestRun',
    outcome: 'confirmed',
    detail: 'Dispatched post metadata cart payload {itemId: 101, qty: 1}, badge index value successfully bumped to 1.',
    timestamp: '2026-06-03 12:35',
    selector: 'button#btn-add-to-cart-primary'
  },
  {
    id: 'obs_4',
    nodeId: 'int_checkout_promo_input',
    sessionName: 'Session_28_Regression',
    outcome: 'inconclusive',
    detail: 'Voucher validation promo fields responded with code 408 Gateway Timeout occasionally. Expectation failed to verify due to unstable mockup sandbox network layers.',
    timestamp: '2026-06-03 11:15',
    expected: 'Apply promo code and recalculate orders summary tax fields',
    observed: 'HTTP 408 Gateway Timeout Exception on POST /api/promo/validate',
    selector: 'input#checkout-coupon-code-field'
  }
];

// Presets for the 3 visual walkthrough flows (FR-12, FR-15)
export const flowStepsExploration = [
  {
    currentNodeId: 'page_home',
    actionText: 'Visiting baseline URL, discovering index and structure...',
    pagesVisited: 1,
    interactionsExecuted: 0,
    confidenceAdjustment: {},
    nodesDiscovered: ['page_home', 'int_home_search', 'int_home_nav_products']
  },
  {
    currentNodeId: 'int_home_search',
    actionText: 'Inspecting search parameters, triggering keystroke listeners...',
    pagesVisited: 1,
    interactionsExecuted: 1,
    confidenceAdjustment: { 'int_home_search': 0.98 },
    nodesDiscovered: []
  },
  {
    currentNodeId: 'int_home_nav_products',
    actionText: 'Executing client link action "Shop Now" -> Navigating to /products subdirectory...',
    pagesVisited: 2,
    interactionsExecuted: 2,
    confidenceAdjustment: {},
    nodesDiscovered: ['page_products', 'int_products_filter_price', 'int_products_click_item_101']
  },
  {
    currentNodeId: 'page_products',
    actionText: 'Retrieving DOM elements for Products, listing filters mapping...',
    pagesVisited: 2,
    interactionsExecuted: 2,
    confidenceAdjustment: { 'page_products': 0.97 },
    nodesDiscovered: []
  },
  {
    currentNodeId: 'int_products_click_item_101',
    actionText: 'Dispatched click on catalog item "101" -> Navigating layout product template...',
    pagesVisited: 3,
    interactionsExecuted: 3,
    confidenceAdjustment: {},
    nodesDiscovered: ['page_product_details', 'int_details_add_to_cart', 'int_details_size_select']
  }
];

export const flowStepsTestRun = [
  {
    currentNodeId: 'int_checkout_promo_input',
    actionText: 'Prioritized Test: Low-confidence Promo Input node (0.77 confidence)...',
    pagesVisited: 1,
    interactionsExecuted: 1,
    outcome: 'inconclusive',
    findingsAdded: 1,
    targetStatus: { 'int_checkout_promo_input': 'testing' }
  },
  {
    currentNodeId: 'int_checkout_pay_now',
    actionText: 'Prioritized Test: Pay Now Mutating Button. Expected: billing transaction success...',
    pagesVisited: 1,
    interactionsExecuted: 2,
    outcome: 'confirmed',
    findingsAdded: 1,
    targetStatus: { 'int_checkout_promo_input': 'confirmed', 'int_checkout_pay_now': 'testing' }
  },
  {
    currentNodeId: 'int_cart_qty_decrement',
    actionText: 'Prioritized Test: Qty decrementer. Mutating interaction checking boundaries lower limit...',
    pagesVisited: 2,
    interactionsExecuted: 3,
    outcome: 'deviation',
    findingsAdded: 2,
    targetStatus: { 'int_checkout_pay_now': 'confirmed', 'int_cart_qty_decrement': 'testing' }
  }
];

// Seeded active bug findings for the visual toggle (Control Panel can inject mock bugs in real time)
export const seededBugs: Observation[] = [
  {
    id: 'bug_cart_negative_overflow',
    nodeId: 'int_cart_qty_decrement',
    sessionName: 'Intellion_Live_Run',
    outcome: 'deviation',
    detail: 'Cart quantity stepper decrements below 0 items, mutating basket arrays and causing client crash.',
    timestamp: 'Just now',
    expected: 'Render minimum limit value 1, trigger item deletion alert prompt if clicked at value 1',
    observed: 'Stepped value into -1 items, cart drawer renders Total Order Cost: -$29.99',
    selector: 'button.cart-qty-spinner-decrease'
  },
  {
    id: 'bug_payment_validation_crash',
    nodeId: 'int_checkout_pay_now',
    sessionName: 'Intellion_Live_Run',
    outcome: 'deviation',
    detail: 'STREET ADDRESS verification fails payload parsing. POST to /api/checkout/verify returned code 500 Server Error.',
    timestamp: 'Just now',
    expected: 'Redirect client path to order dashboard summary page',
    observed: 'Whiteout screen error. Error: Uncaught TypeError: Cannot read properties of undefined (reading "shippingAddress")',
    selector: 'button#checkout-payment-details-submit'
  }
];

// Comparative Metrics: Intellion vs Baseline Crawler (PRD §10 Success Metrics)
export const successComparisonMetrics = {
  blindCrawlerExecutes: 54,
  intellionExecutes: 32, // target-driven: 40% reduction!
  blindCrawlerFindings: 1, // missed hidden flows
  intellionFindings: 3, // mapped & detected deviations
  coverageGrowthPercent: 91,
  baselineCoveragePercent: 42,
  reidentifiedStability: 96 // 96% unchanged nodes correctly recognized across DOM refactors
};

import { WorkOpFlow } from './types';

export const initialWorkflows: WorkOpFlow[] = [
  {
    id: 'flow_crm_onboard',
    name: 'Unified Account Creation & CRM sync',
    category: 'CRM Onboarding',
    description: 'Autonomous walkthrough checking customer profile creation inputs, session validation cookies, and Hubspot webhook synchronization.',
    overallStatus: 'healthy',
    lastExecuted: '2026-06-03 10:14',
    steps: [
      { id: 'crm_1', name: 'Trigger Sign Up modal', actor: 'User', description: 'Simulate user clicking global navigation signup link', status: 'passed', assignedNode: 'int_home_nav_products' },
      { id: 'crm_2', name: 'Retrieve Email suggestion field', actor: 'Background Worker', description: 'Provide system-aligned dev email structure', status: 'passed' },
      { id: 'crm_3', name: 'Verify CRM post webhook feedback', actor: 'System API', description: 'Monitor back-end outgoing payload trigger and confirm code 201', status: 'passed' }
    ]
  },
  {
    id: 'flow_billing_checkout',
    name: 'Cart checkout & Stripe webhook verification',
    category: 'Billing',
    description: 'Critical checkout sequence verifying item subtraction, sandbox credit card auth checks, and invoice PDF compilation steps.',
    overallStatus: 'unverified',
    lastExecuted: 'Never',
    steps: [
      { id: 'bill_1', name: 'Simulate Cart addition step', actor: 'User', description: 'Push product id item 101 to active shopping bag', status: 'idle', assignedNode: 'int_details_add_to_cart' },
      { id: 'bill_2', name: 'Input promo discount', actor: 'User', description: 'Apply 20% mock checkout code validation', status: 'idle', assignedNode: 'int_checkout_promo_input' },
      { id: 'bill_3', name: 'Trigger Stripe transaction token', actor: 'System API', description: 'Secure credit card sandbox payload response verification', status: 'idle', assignedNode: 'int_checkout_pay_now' }
    ]
  },
  {
    id: 'flow_inventory_sync',
    name: 'Stock allocation ledger check',
    category: 'Inventory Update',
    description: 'Ensure checkout subtraction registers in active database stocks ledger index triggers.',
    overallStatus: 'critical',
    lastExecuted: '2026-06-03 11:21',
    steps: [
      { id: 'inv_1', name: 'Select sizes catalog limits', actor: 'User', description: 'Validate depleting size picker drop variables', status: 'passed', assignedNode: 'int_details_size_select' },
      { id: 'inv_2', name: 'Validate checkout total decrement', actor: 'Background Worker', description: 'Ensure current count inventory ledger shrinks by 1 product unit', status: 'failed' }
    ]
  }
];

