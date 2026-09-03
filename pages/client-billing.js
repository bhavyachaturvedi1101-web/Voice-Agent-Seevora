// ============================================================
//  Billing & Wallet Page (Role-Based: Client vs Admin)
// ============================================================

import { renderSidebar } from '../components/sidebar.js';
import { renderTopbar } from '../components/topbar.js';

// Mock Client Data for Agency Admin View
const MOCK_CLIENTS = [
  {
    id: 'c-001',
    name: 'Acme Corp',
    initials: 'AC',
    color: '#0284c7',
    bg: '#e0f2fe',
    status: 'active',
    agents: 2,
    calls: 1245,
    minutes: 4150.5,
    rateMultiplier: 1.5,
    revenue: 12451.50,
    cost: 8301.00
  },
  {
    id: 'c-002',
    name: 'TechFlow Inc.',
    initials: 'TF',
    color: '#0ea5e9',
    bg: '#e0f9ff',
    status: 'active',
    agents: 4,
    calls: 3890,
    minutes: 12100.25,
    rateMultiplier: 1.8,
    revenue: 43560.90,
    cost: 24200.50
  },
  {
    id: 'c-003',
    name: 'Greenfield Real Estate',
    initials: 'GR',
    color: '#16a34a',
    bg: '#dcfce7',
    status: 'active',
    agents: 1,
    calls: 850,
    minutes: 2550.0,
    rateMultiplier: 2.0,
    revenue: 8500.00,
    cost: 4250.00
  },
  {
    id: 'c-004',
    name: 'Apex Fitness',
    initials: 'AF',
    color: '#ea580c',
    bg: '#ffedd5',
    status: 'inactive',
    agents: 1,
    calls: 120,
    minutes: 340.0,
    rateMultiplier: 1.5,
    revenue: 1020.00,
    cost: 680.00
  }
];

export async function renderClientBilling(session, navigate) {
  const user = session?.user || session;
  const isClient = (user?.role || '').toLowerCase() === 'client';

  return isClient ? renderClientSelfBilling(user) : renderAgencyBilling(user);
}

// ────────────────────────────────────────────────────────────
//  CLIENT SELF-SERVE BILLING & WALLET VIEW
// ────────────────────────────────────────────────────────────
function renderClientSelfBilling(user) {
  const walletBalance = user?.walletBalance !== undefined ? user.walletBalance : 500;
  const businessName = user?.businessName || 'Your Business';
  
  // Stored transactions or initial demo invoices
  const transactions = JSON.parse(localStorage.getItem('seevora_wallet_tx') || 'null') || [
    { 
      id: 'INV-2026-0841', 
      date: new Date(Date.now() - 86400000 * 3).toLocaleDateString(), 
      desc: 'Calling Wallet Recharge (UPI/GPay)', 
      subtotal: 500.00,
      gst: 90.00,
      amount: 590.00, 
      status: 'Paid', 
      type: 'credit',
      mode: 'UPI (GPay)',
      sac: '998413'
    },
    { 
      id: 'INV-2026-0802', 
      date: new Date(Date.now() - 86400000 * 12).toLocaleDateString(), 
      desc: 'Welcome Account Activation Credit', 
      subtotal: 500.00,
      gst: 0.00,
      amount: 500.00, 
      status: 'Complimentary', 
      type: 'credit',
      mode: 'Promotional',
      sac: '998413'
    }
  ];

  // Simulated per-call usage ledger
  const callLedger = JSON.parse(localStorage.getItem('seevora_call_ledger') || 'null') || [
    { id: 'cd-104', date: 'Today, 2:15 PM', lead: '+91 98112 34567', type: 'Outbound Pitch', duration: '2m 14s', rate: '₹1.50/min', cost: 3.35, balanceAfter: walletBalance },
    { id: 'cd-103', date: 'Today, 11:30 AM', lead: '+91 98201 98765', type: 'Outbound Pitch', duration: '1m 40s', rate: '₹1.50/min', cost: 2.50, balanceAfter: walletBalance + 3.35 },
    { id: 'cd-102', date: 'Yesterday, 4:50 PM', lead: '+91 99345 67890', type: 'Inbound Receptionist', duration: '1m 12s', rate: '₹1.50/min', cost: 1.80, balanceAfter: walletBalance + 5.85 },
    { id: 'cd-101', date: 'Yesterday, 10:05 AM', lead: '+91 98450 12345', type: 'Outbound Pitch', duration: '0m 48s', rate: '₹1.50/min', cost: 1.20, balanceAfter: walletBalance + 7.65 }
  ];

  const totalDeducted = callLedger.reduce((acc, c) => acc + c.cost, 0);

  return `
    <div class="dashboard-shell page-enter">
      ${renderSidebar('client-billing', user)}
      
      <main class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <h1 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0;">Billing & Calling Wallet</h1>
            <p style="font-size: 0.85rem; color: #64748b; margin: 4px 0 0 0;">${businessName} • Wallet balance, auto-recharge, real-time call ledger & tax invoices</p>
          </div>
          <div class="topbar-right">
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px 4px 4px; border-radius: 12px; border: 1px solid #f1f5f9;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #e0f9ff; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">${user?.initials || 'U'}</div>
              <span style="font-size: 0.85rem; font-weight: 600; color: #0f172a;">${user?.name || 'Client'}</span>
            </div>
          </div>
        </header>

        <div class="page-container" style="padding-top: 24px; max-width: 1400px; width: 100%;">

          <!-- Wallet Overview Cards (Executive SaaS Polish) -->
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 28px;">
            
            <!-- Balance Card -->
            <div style="background: #ffffff; border-radius: 20px; padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 145px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Calling Balance</div>
                  <div style="font-size: 2.3rem; font-weight: 800; color: #0f172a; line-height: 1.1; margin: 8px 0;" id="display-wallet-balance">₹${walletBalance}</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 12px; background: #f0f9ff; color: #0284c7; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px; font-size: 0.8rem; color: #64748b;">
                <span>~${Math.round(walletBalance / 1.5)} minutes available</span>
                <span style="font-weight: 700; color: #0284c7;">Rate: ₹1.50/min</span>
              </div>
            </div>

            <!-- Current Plan Card -->
            <div style="background: #ffffff; border-radius: 20px; padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 145px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Active Plan</div>
                  <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 8px 0;">Self-Serve Starter</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 12px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px; font-size: 0.8rem;">
                <span style="color: #64748b;">Pay-as-you-go • Zero platform fee</span>
                <button id="btn-view-plans" style="background:none; border:none; color:#0ea5e9; font-weight:700; cursor:pointer; font-size:0.8rem; padding:0;">Compare Plans →</button>
              </div>
            </div>

            <!-- Cycle Usage Card -->
            <div style="background: #ffffff; border-radius: 20px; padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 145px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Month-to-Date Usage</div>
                  <div style="font-size: 2.3rem; font-weight: 800; color: #0f172a; line-height: 1.1; margin: 8px 0;">₹${totalDeducted.toFixed(2)}</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 12px; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
              </div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 10px;">
                ${callLedger.length} AI calls billed in current period
              </div>
            </div>

            <!-- Auto-Recharge Alert Card -->
            <div style="background: #ffffff; border-radius: 20px; padding: 24px 26px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 145px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Balance Protection</div>
                  <div style="font-size: 1.45rem; font-weight: 800; color: #0f172a; margin: 8px 0;">Alert: &lt; ₹150</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 12px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px; font-size: 0.8rem; color: #64748b;">
                <span>WhatsApp notification active</span>
                <span style="color:#10b981; font-weight:700;">Protected</span>
              </div>
            </div>

          </div>

          <!-- Instant Recharge & Payment Gateway Section -->
          <div class="panel" style="padding: 28px 30px; border-radius: 20px; margin-bottom: 28px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; flex-wrap: wrap; gap: 14px;">
              <div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">Recharge Calling Wallet</h2>
                <p style="font-size: 0.85rem; color: #64748b; margin: 0;">Add funds instantly via UPI (GPay/PhonePe), Net Banking, or Corporate Cards. Official 18% GST Invoice generated immediately.</p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #64748b; background: #f8fafc; padding: 6px 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>256-Bit SSL Encrypted Gateway</span>
              </div>
            </div>

            <!-- Amount Options -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px;">
              <button class="btn-topup-option" data-amount="500" style="padding: 16px 14px; border: 2px solid #e2e8f0; background: #fff; border-radius: 14px; font-size: 1.15rem; font-weight: 800; color: #0f172a; cursor: pointer; text-align: center; transition: all 0.2s;">
                ₹500
                <div style="font-size: 0.72rem; font-weight: 500; color: #64748b; margin-top: 4px;">~333 Call Mins</div>
              </button>
              <button class="btn-topup-option" data-amount="1000" style="padding: 16px 14px; border: 2px solid #0ea5e9; background: #f0f9ff; border-radius: 14px; font-size: 1.15rem; font-weight: 800; color: #0284c7; cursor: pointer; text-align: center; transition: all 0.2s;">
                ₹1,000
                <div style="font-size: 0.72rem; font-weight: 500; color: #0284c7; margin-top: 4px;">~666 Call Mins</div>
              </button>
              <button class="btn-topup-option" data-amount="2500" style="padding: 16px 14px; border: 2px solid #e2e8f0; background: #fff; border-radius: 14px; font-size: 1.15rem; font-weight: 800; color: #0f172a; cursor: pointer; text-align: center; transition: all 0.2s;">
                ₹2,500
                <div style="font-size: 0.72rem; font-weight: 500; color: #64748b; margin-top: 4px;">~1,666 Call Mins</div>
              </button>
              <button class="btn-topup-option" data-amount="5000" style="padding: 16px 14px; border: 2px solid #e2e8f0; background: #fff; border-radius: 14px; font-size: 1.15rem; font-weight: 800; color: #0f172a; cursor: pointer; text-align: center; transition: all 0.2s;">
                ₹5,000
                <div style="font-size: 0.72rem; font-weight: 500; color: #64748b; margin-top: 4px;">~3,333 Call Mins</div>
              </button>
              <button class="btn-topup-option" data-amount="10000" style="padding: 16px 14px; border: 2px solid #e2e8f0; background: #fff; border-radius: 14px; font-size: 1.15rem; font-weight: 800; color: #0f172a; cursor: pointer; text-align: center; transition: all 0.2s;">
                ₹10,000
                <div style="font-size: 0.72rem; font-weight: 500; color: #64748b; margin-top: 4px;">~6,666 Call Mins</div>
              </button>
            </div>

            <!-- Custom Amount & Checkout Trigger -->
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 18px 20px; border-radius: 14px; border: 1px solid #e2e8f0;">
              <div style="flex: 1; min-width: 260px;">
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Or Enter Custom Amount (₹)</label>
                <input type="number" id="custom-topup-input" placeholder="e.g. 1500" value="1000" min="100" step="100" style="width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 1rem; font-weight: 700; color: #0f172a; outline: none; background: #fff;" />
              </div>
              <div style="padding-top: 20px;">
                <button class="btn btn-primary" id="btn-open-payment-modal" style="background: #0ea5e9; border: none; padding: 13px 28px; font-weight: 700; font-size: 0.95rem; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(14,165,233,0.3);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <span>Proceed to Payment</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Tabbed Statements & Tax Invoices Section -->
          <div class="panel" style="padding: 26px 30px; border-radius: 20px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 28px;">
            
            <!-- Tab Navigation Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; gap: 8px;">
                <button class="billing-tab-btn active" id="tab-btn-invoices" data-tab="invoices" style="padding: 8px 18px; border-radius: 8px; font-size: 0.88rem; font-weight: 700; border: none; background: #0ea5e9; color: #ffffff; cursor: pointer;">
                  GST Tax Invoices & Receipts
                </button>
                <button class="billing-tab-btn" id="tab-btn-ledger" data-tab="ledger" style="padding: 8px 18px; border-radius: 8px; font-size: 0.88rem; font-weight: 700; border: 1px solid #e2e8f0; background: #ffffff; color: #64748b; cursor: pointer;">
                  Per-Call Usage Ledger (${callLedger.length})
                </button>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-export-client-tx" style="border: 1px solid #cbd5e1; background: #fff; padding: 7px 16px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export Statement (.CSV)</span>
              </button>
            </div>

            <!-- TAB 1: TAX INVOICES TABLE -->
            <div id="billing-view-invoices">
              <div style="overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">
                      <th style="padding: 12px 16px;">Invoice No</th>
                      <th style="padding: 12px 16px;">Date</th>
                      <th style="padding: 12px 16px;">Description</th>
                      <th style="padding: 12px 16px;">Base Amount</th>
                      <th style="padding: 12px 16px;">GST (18%)</th>
                      <th style="padding: 12px 16px;">Total Paid</th>
                      <th style="padding: 12px 16px;">Payment Mode</th>
                      <th style="padding: 12px 16px;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="client-tx-tbody">
                    ${transactions.map(t => `
                      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 0.88rem;">
                        <td style="padding: 14px 16px; font-family: monospace; font-weight: 700; color: #0ea5e9;">${t.id}</td>
                        <td style="padding: 14px 16px; color: #64748b;">${t.date}</td>
                        <td style="padding: 14px 16px; font-weight: 600; color: #0f172a;">${t.desc}</td>
                        <td style="padding: 14px 16px; color: #0f172a;">₹${Number(t.subtotal || t.amount).toFixed(2)}</td>
                        <td style="padding: 14px 16px; color: #64748b;">₹${Number(t.gst || 0).toFixed(2)}</td>
                        <td style="padding: 14px 16px; font-weight: 800; color: #10b981;">₹${Number(t.amount).toFixed(2)}</td>
                        <td style="padding: 14px 16px; color: #475569;">${t.mode || 'Online'}</td>
                        <td style="padding: 14px 16px;">
                          <button class="btn-view-invoice" data-id="${t.id}" data-date="${t.date}" data-amount="${t.amount}" data-subtotal="${t.subtotal || t.amount}" data-gst="${t.gst || 0}" data-desc="${t.desc}" style="background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">
                            View Tax Invoice
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 2: PER-CALL USAGE LEDGER TABLE -->
            <div id="billing-view-ledger" style="display: none;">
              <div style="overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">
                      <th style="padding: 12px 16px;">Call ID</th>
                      <th style="padding: 12px 16px;">Timestamp</th>
                      <th style="padding: 12px 16px;">Lead / Phone Number</th>
                      <th style="padding: 12px 16px;">Call Type</th>
                      <th style="padding: 12px 16px;">Duration</th>
                      <th style="padding: 12px 16px;">Rate Applied</th>
                      <th style="padding: 12px 16px;">Deducted Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${callLedger.map(c => `
                      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 0.88rem;">
                        <td style="padding: 14px 16px; font-family: monospace; font-weight: 600; color: #64748b;">${c.id}</td>
                        <td style="padding: 14px 16px; color: #64748b;">${c.date}</td>
                        <td style="padding: 14px 16px; font-weight: 700; color: #0f172a;">${c.lead}</td>
                        <td style="padding: 14px 16px; color: #0284c7; font-weight: 600;">${c.type}</td>
                        <td style="padding: 14px 16px; color: #0f172a;">${c.duration}</td>
                        <td style="padding: 14px 16px; color: #64748b;">${c.rate}</td>
                        <td style="padding: 14px 16px; font-weight: 800; color: #ef4444;">-₹${c.cost.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- GST Business Information Notice -->
          <div style="background: #f8fafc; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem;">GST Invoicing Details:</div>
              <div style="font-size: 0.82rem; color: #64748b; margin-top: 2px;">All digital services provided by Seevora Technologies Pvt Ltd under SAC 998413 (Telecommunications & AI Speech Processing).</div>
            </div>
            <div style="font-size: 0.8rem; color: #475569;">
              Client GSTIN: <strong style="color: #0f172a;">27AAAAA0000A1Z5 (Unregistered / B2B Claim Eligible)</strong>
            </div>
          </div>

        </div>
      </main>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!--  PAYMENT GATEWAY MODAL (Razorpay / Stripe / UPI Simulation)               -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div id="payment-gateway-modal" class="modal-overlay hidden" style="z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(6px); position: fixed; inset: 0;">
      <div style="max-width: 480px; width: 92%; border-radius: 20px; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid #e2e8f0;">
        
        <!-- Modal Header -->
        <div style="background: #0f172a; color: #fff; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 800; font-size: 1.1rem;">Secure Checkout</div>
            <div style="font-size: 0.78rem; color: #94a3b8;">Seevora Voice AI Telephony Credits</div>
          </div>
          <button id="btn-close-payment-modal" style="background: rgba(255,255,255,0.1); border: none; width: 32px; height: 32px; border-radius: 50%; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- Order Breakdown -->
        <div style="padding: 24px;">
          <div style="background: #f8fafc; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.88rem; color: #475569;">
              <span>Wallet Credits:</span>
              <span style="font-weight: 700; color: #0f172a;" id="modal-subtotal">₹1,000.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.88rem; color: #475569;">
              <span>GST @ 18% (SAC 998413):</span>
              <span style="font-weight: 700; color: #0f172a;" id="modal-gst">₹180.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 1.05rem; font-weight: 800; color: #0f172a;">
              <span>Total Payable:</span>
              <span style="color: #0284c7;" id="modal-total">₹1,180.00</span>
            </div>
          </div>

          <!-- Payment Methods Selector -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Select Payment Method</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <button class="pay-method-btn active" data-method="upi" style="padding: 12px; border-radius: 10px; border: 2px solid #0ea5e9; background: #f0f9ff; color: #0284c7; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-align: center;">
                ⚡ UPI / QR Code
              </button>
              <button class="pay-method-btn" data-method="card" style="padding: 12px; border-radius: 10px; border: 2px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-align: center;">
                💳 Card / Net Banking
              </button>
            </div>
          </div>

          <!-- UPI View -->
          <div id="pay-view-upi" style="text-align: center; padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="width: 140px; height: 140px; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; margin: 0 auto 10px auto; display: flex; align-items: center; justify-content: center; position: relative;">
              <!-- Simulated QR Code -->
              <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="7" y1="7" x2="7.01" y2="7"></line><line x1="17" y1="7" x2="17.01" y2="7"></line><line x1="7" y1="17" x2="7.01" y2="17"></line><line x1="17" y1="17" x2="17.01" y2="17"></line></svg>
            </div>
            <div style="font-size: 0.78rem; color: #64748b;">Scan with GPay, PhonePe, Paytm, or BHIM</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-top: 4px;">UPI ID: seevora.pay@icici</div>
          </div>

          <!-- Card View -->
          <div id="pay-view-card" style="display: none; margin-bottom: 20px;">
            <input type="text" placeholder="Card Number (4111 2222 3333 4444)" style="width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; margin-bottom: 8px;" />
            <div style="display: flex; gap: 8px;">
              <input type="text" placeholder="MM/YY" style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem;" />
              <input type="text" placeholder="CVV" style="width: 100px; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem;" />
            </div>
          </div>

          <button id="btn-confirm-payment" style="width: 100%; padding: 14px; background: #16a34a; color: #fff; font-weight: 800; font-size: 1rem; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(22,163,74,0.3);">
            <span>Pay & Add Credits</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!--  OFFICIAL GST TAX INVOICE MODAL                                          -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div id="invoice-detail-modal" class="modal-overlay hidden" style="z-index: 10000; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(6px); position: fixed; inset: 0;">
      <div style="max-width: 650px; width: 92%; max-height: 90vh; overflow-y: auto; border-radius: 20px; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); padding: 32px; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- Invoice Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #0ea5e9; letter-spacing: -0.02em;">SEEVORA</div>
            <div style="font-size: 0.78rem; color: #64748b; line-height: 1.5; margin-top: 4px;">
              Seevora Technologies Pvt Ltd<br>
              Tech Zone 4, Cyber City, Bangalore - 560001<br>
              GSTIN: <strong>29AAECS9841B1Z2</strong> • PAN: AAECS9841B
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">TAX INVOICE</div>
            <div style="font-size: 0.85rem; font-family: monospace; font-weight: 700; color: #0ea5e9; margin: 4px 0;" id="inv-num">INV-2026-0841</div>
            <div style="font-size: 0.78rem; color: #64748b;" id="inv-date">Date: 03/09/2026</div>
          </div>
        </div>

        <!-- Billed To & Place of Supply -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 0.83rem;">
          <div>
            <div style="font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 0.72rem; margin-bottom: 4px;">Billed To:</div>
            <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem;">${businessName}</div>
            <div style="color: #475569; margin-top: 2px;">Attn: ${user?.name || 'Authorized Signatory'}</div>
            <div style="color: #64748b; margin-top: 2px;">GSTIN: Unregistered / B2B</div>
          </div>
          <div>
            <div style="font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 0.72rem; margin-bottom: 4px;">Invoice Details:</div>
            <div style="color: #475569;">Place of Supply: India</div>
            <div style="color: #475569;">Payment Status: <strong style="color: #10b981;">Paid</strong></div>
            <div style="color: #475569;">Mode: <span id="inv-mode">UPI / Online</span></div>
          </div>
        </div>

        <!-- Line Item Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.85rem;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; font-size: 0.75rem; color: #475569; text-transform: uppercase;">
              <th style="padding: 10px 12px;">#</th>
              <th style="padding: 10px 12px;">Service Description</th>
              <th style="padding: 10px 12px;">SAC</th>
              <th style="padding: 10px 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px;">1</td>
              <td style="padding: 12px;">
                <div style="font-weight: 700; color: #0f172a;" id="inv-desc">AI Voice Agent Telephony Credits</div>
                <div style="font-size: 0.75rem; color: #64748b;">Autonomous outbound & inbound calling minutes allowance</div>
              </td>
              <td style="padding: 12px; font-family: monospace; color: #64748b;">998413</td>
              <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;" id="inv-subtotal">₹1,000.00</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals & Tax Computation -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
          <div style="width: 260px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
              <span>Taxable Value:</span>
              <span style="font-weight: 700; color: #0f172a;" id="inv-taxable">₹1,000.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
              <span>CGST (9%):</span>
              <span style="font-weight: 700; color: #0f172a;" id="inv-cgst">₹90.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #475569;">
              <span>SGST (9%):</span>
              <span style="font-weight: 700; color: #0f172a;" id="inv-sgst">₹90.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #0f172a; font-size: 1.05rem; font-weight: 900; color: #0f172a;">
              <span>Total Paid:</span>
              <span style="color: #0284c7;" id="inv-grandtotal">₹1,180.00</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <div style="font-size: 0.75rem; color: #94a3b8;">Digitally generated on Seevora AI Voice Cloud. Valid without physical signature.</div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" style="padding: 9px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; font-weight: 700; font-size: 0.85rem; color: #0f172a; cursor: pointer;">
              Print / Save PDF
            </button>
            <button id="btn-close-invoice-modal" style="padding: 9px 18px; border-radius: 8px; border: none; background: #0f172a; font-weight: 700; font-size: 0.85rem; color: #fff; cursor: pointer;">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────
//  AGENCY ADMIN BILLING VIEW (Existing Agency Tool)
// ────────────────────────────────────────────────────────────
function renderAgencyBilling(user) {
  const summary = getClientSummary(MOCK_CLIENTS);
  const totalMargin = summary.totalRevenue - summary.totalCost;

  return `
    <div class="dashboard-shell page-enter">
      ${renderSidebar('client-billing', user)}
      
      <main class="main-content">
        <header class="topbar">
          <div class="topbar-left">
            <h1>Client Billing & Invoicing (Agency Admin)</h1>
            <p>Track client usage, apply markups, and manage profit margins</p>
          </div>
          <div class="topbar-right">
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px 4px 4px; border-radius: 9999px; border: 1px solid #f1f5f9;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: #e0f9ff; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600;">${user?.initials || 'AD'}</div>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${user?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        <div class="page-container" style="padding-top: 24px;">
          <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Active Clients</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">${summary.activeClients} / ${MOCK_CLIENTS.length}</div>
                <div><span style="background: #f1f5f9; color: #475569; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Organizations</span></div>
              </div>
            </div>

            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Billed Revenue</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1; margin: 8px 0;">₹${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div><span style="background: #e0f9ff; color: #0284c7; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Client Billed</span></div>
              </div>
            </div>

            <div style="background: #fff; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); min-height: 140px;">
              <div style="position: absolute; right: 16px; bottom: 16px; color: #0f172a; opacity: 0.07;">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              </div>
              <div style="position: relative; z-index: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; text-transform: uppercase;">Total Margin</div>
                <div style="font-size: 2.2rem; font-weight: 800; color: #059669; line-height: 1; margin: 8px 0;">+₹${totalMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div><span style="background: #dcfce7; color: #15803d; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 8px;">Net Profit</span></div>
              </div>
            </div>

          </div>

          <div class="panel" style="background:#fff; border-radius:20px; padding:24px; border:1px solid #f1f5f9;">
            <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h2 class="panel-title" style="font-size:1.1rem; font-weight:700;">Client Breakdown</h2>
              <button class="btn btn-primary btn-sm" id="btn-export-clients" style="background:#0ea5e9; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer;">
                Export CSV
              </button>
            </div>
            
            <div style="overflow-x:auto;">
              ${renderClientTable(MOCK_CLIENTS)}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  `;
}

function getClientSummary(clients) {
  return clients.reduce((acc, c) => {
    acc.totalRevenue += c.revenue;
    acc.totalCost += c.cost;
    acc.totalCalls += c.calls;
    acc.activeClients += c.status === 'active' ? 1 : 0;
    return acc;
  }, { totalRevenue: 0, totalCost: 0, totalCalls: 0, activeClients: 0 });
}

function renderClientTable(clients) {
  if (!clients.length) return `<div class="empty-state"><h3>No clients found</h3></div>`;

  return `
    <table class="data-table" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid #f1f5f9; text-align:left; font-size:0.75rem; color:#64748b;">
          <th style="padding:12px 16px;">Client</th>
          <th style="padding:12px 16px;">Status</th>
          <th style="padding:12px 16px;">Active Agents</th>
          <th style="padding:12px 16px;">Total Calls</th>
          <th style="padding:12px 16px;">Duration (min)</th>
          <th style="padding:12px 16px;">Platform Cost</th>
          <th style="padding:12px 16px;">Client Billed</th>
          <th style="padding:12px 16px;">Margin</th>
        </tr>
      </thead>
      <tbody>
        ${clients.map(c => {
          const margin = c.revenue - c.cost;
          const marginPercent = ((margin / c.revenue) * 100).toFixed(1);
          return `
            <tr style="border-bottom:1px solid #f8fafc; font-size:0.85rem;">
              <td style="padding:12px 16px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="width:28px; height:28px; border-radius:50%; background:${c.bg}; color:${c.color}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.75rem;">${c.initials}</div>
                  <span style="font-weight:600; color:#0f172a;">${c.name}</span>
                </div>
              </td>
              <td style="padding:12px 16px;"><span style="background:${c.status === 'active' ? '#dcfce7' : '#fee2e2'}; color:${c.status === 'active' ? '#15803d' : '#991b1b'}; padding:2px 8px; border-radius:4px; font-size:0.72rem; font-weight:700;">${c.status.toUpperCase()}</span></td>
              <td style="padding:12px 16px;">${c.agents}</td>
              <td style="padding:12px 16px;">${c.calls.toLocaleString()}</td>
              <td style="padding:12px 16px;">${c.minutes.toLocaleString()}</td>
              <td style="padding:12px 16px; color:#64748b;">₹${c.cost.toFixed(2)}</td>
              <td style="padding:12px 16px; font-weight:600; color:#0f172a;">₹${c.revenue.toFixed(2)}</td>
              <td style="padding:12px 16px; font-weight:700; color:#10b981;">+₹${margin.toFixed(2)} (${marginPercent}%)</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

export async function initClientBilling(session, navigate) {
  const user = session?.user || session;
  const isClient = (user?.role || '').toLowerCase() === 'client';

  // Client-specific recharge logic
  if (isClient) {
    let selectedAmount = 1000;

    // Preset Amount Buttons
    document.querySelectorAll('.btn-topup-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-topup-option').forEach(b => {
          b.style.borderColor = '#e2e8f0';
          b.style.background = '#fff';
          b.style.color = '#0f172a';
          const subText = b.querySelector('div');
          if (subText) subText.style.color = '#64748b';
        });
        btn.style.borderColor = '#0ea5e9';
        btn.style.background = '#f0f9ff';
        btn.style.color = '#0284c7';
        const activeSub = btn.querySelector('div');
        if (activeSub) activeSub.style.color = '#0284c7';

        selectedAmount = parseInt(btn.dataset.amount, 10);
        const input = document.getElementById('custom-topup-input');
        if (input) input.value = selectedAmount;
      });
    });

    const customInput = document.getElementById('custom-topup-input');
    customInput?.addEventListener('input', () => {
      const val = parseInt(customInput.value, 10);
      if (!isNaN(val)) selectedAmount = val;
    });

    // Payment Gateway Modal controls
    const payModal = document.getElementById('payment-gateway-modal');
    const openPayBtn = document.getElementById('btn-open-payment-modal');
    const closePayBtn = document.getElementById('btn-close-payment-modal');
    const confirmPayBtn = document.getElementById('btn-confirm-payment');

    openPayBtn?.addEventListener('click', () => {
      const amount = customInput?.value ? parseInt(customInput.value, 10) : selectedAmount;
      if (isNaN(amount) || amount <= 0) {
        import('../components/toast.js').then(({ showToast }) => {
          showToast({ type: 'warning', title: 'Invalid Amount', message: 'Please enter a valid recharge amount (min ₹100).' });
        });
        return;
      }
      selectedAmount = amount;
      const gst = amount * 0.18;
      const total = amount + gst;

      document.getElementById('modal-subtotal').textContent = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      document.getElementById('modal-gst').textContent = `₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      document.getElementById('modal-total').textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      payModal?.classList.remove('hidden');
    });

    closePayBtn?.addEventListener('click', () => payModal?.classList.add('hidden'));

    // Payment method switcher in modal
    document.querySelectorAll('.pay-method-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        document.querySelectorAll('.pay-method-btn').forEach(b => {
          b.style.borderColor = '#e2e8f0';
          b.style.background = '#fff';
          b.style.color = '#475569';
        });
        btn.style.borderColor = '#0ea5e9';
        btn.style.background = '#f0f9ff';
        btn.style.color = '#0284c7';

        document.getElementById('pay-view-upi').style.display = method === 'upi' ? 'block' : 'none';
        document.getElementById('pay-view-card').style.display = method === 'card' ? 'block' : 'none';
      });
    });

    // Execute payment & generate real GST Tax Invoice
    confirmPayBtn?.addEventListener('click', () => {
      const currentBalance = user.walletBalance !== undefined ? user.walletBalance : 500;
      const newBalance = currentBalance + selectedAmount;
      user.walletBalance = newBalance;

      // Update session
      const rawSession = localStorage.getItem('seevora_session');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        parsed.walletBalance = newBalance;
        if (parsed.user) parsed.user.walletBalance = newBalance;
        localStorage.setItem('seevora_session', JSON.stringify(parsed));
      }

      // Generate Invoice
      const invId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const subtotal = selectedAmount;
      const gst = subtotal * 0.18;
      const grandTotal = subtotal + gst;
      const dateStr = new Date().toLocaleDateString('en-GB');

      const txHistory = JSON.parse(localStorage.getItem('seevora_wallet_tx') || 'null') || [];
      const newInvoice = {
        id: invId,
        date: dateStr,
        desc: `Calling Wallet Recharge (UPI/Online)`,
        subtotal: subtotal,
        gst: gst,
        amount: grandTotal,
        status: 'Paid',
        type: 'credit',
        mode: 'UPI Instant',
        sac: '998413'
      };
      txHistory.unshift(newInvoice);
      localStorage.setItem('seevora_wallet_tx', JSON.stringify(txHistory));

      // Update UI balance
      const balanceEl = document.getElementById('display-wallet-balance');
      if (balanceEl) balanceEl.textContent = `₹${newBalance}`;

      // Close payment modal
      payModal?.classList.add('hidden');

      // Update table
      const tbody = document.getElementById('client-tx-tbody');
      if (tbody) {
        tbody.innerHTML = txHistory.map(t => `
          <tr style="border-bottom: 1px solid #f1f5f9; font-size: 0.88rem;">
            <td style="padding: 14px 16px; font-family: monospace; font-weight: 700; color: #0ea5e9;">${t.id}</td>
            <td style="padding: 14px 16px; color: #64748b;">${t.date}</td>
            <td style="padding: 14px 16px; font-weight: 600; color: #0f172a;">${t.desc}</td>
            <td style="padding: 14px 16px; color: #0f172a;">₹${Number(t.subtotal || t.amount).toFixed(2)}</td>
            <td style="padding: 14px 16px; color: #64748b;">₹${Number(t.gst || 0).toFixed(2)}</td>
            <td style="padding: 14px 16px; font-weight: 800; color: #10b981;">₹${Number(t.amount).toFixed(2)}</td>
            <td style="padding: 14px 16px; color: #475569;">${t.mode || 'Online'}</td>
            <td style="padding: 14px 16px;">
              <button class="btn-view-invoice" data-id="${t.id}" data-date="${t.date}" data-amount="${t.amount}" data-subtotal="${t.subtotal || t.amount}" data-gst="${t.gst || 0}" data-desc="${t.desc}" style="background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">
                View Tax Invoice
              </button>
            </td>
          </tr>
        `).join('');
        bindInvoiceBtns();
      }

      import('../components/toast.js').then(({ showToast }) => {
        showToast({
          type: 'success',
          title: 'Recharge Successful! 🎉',
          message: `₹${selectedAmount} credited. Official GST invoice generated.`
        });
      });

      // Automatically pop open the generated tax invoice for immediate review
      showInvoiceModal(newInvoice);
    });

    // Tab Switching (GST Invoices vs Per-Call Usage Ledger)
    document.querySelectorAll('.billing-tab-btn').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const tab = tabBtn.dataset.tab;
        document.querySelectorAll('.billing-tab-btn').forEach(b => {
          b.style.background = '#ffffff';
          b.style.color = '#64748b';
          b.style.border = '1px solid #e2e8f0';
        });
        tabBtn.style.background = '#0ea5e9';
        tabBtn.style.color = '#ffffff';
        tabBtn.style.border = 'none';

        document.getElementById('billing-view-invoices').style.display = tab === 'invoices' ? 'block' : 'none';
        document.getElementById('billing-view-ledger').style.display = tab === 'ledger' ? 'block' : 'none';
      });
    });

    // Invoice View Modal handlers
    const invModal = document.getElementById('invoice-detail-modal');
    document.getElementById('btn-close-invoice-modal')?.addEventListener('click', () => {
      invModal?.classList.add('hidden');
    });

    function showInvoiceModal(inv) {
      document.getElementById('inv-num').textContent = inv.id;
      document.getElementById('inv-date').textContent = `Date: ${inv.date}`;
      document.getElementById('inv-mode').textContent = inv.mode || 'Online Banking';
      document.getElementById('inv-desc').textContent = inv.desc || 'AI Voice Agent Telephony Credits';
      
      const subtotal = Number(inv.subtotal || inv.amount);
      const gst = Number(inv.gst || 0);
      const grandTotal = Number(inv.amount);

      document.getElementById('inv-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
      document.getElementById('inv-taxable').textContent = `₹${subtotal.toFixed(2)}`;
      document.getElementById('inv-cgst').textContent = `₹${(gst / 2).toFixed(2)}`;
      document.getElementById('inv-sgst').textContent = `₹${(gst / 2).toFixed(2)}`;
      document.getElementById('inv-grandtotal').textContent = `₹${grandTotal.toFixed(2)}`;

      invModal?.classList.remove('hidden');
    }

    function bindInvoiceBtns() {
      document.querySelectorAll('.btn-view-invoice').forEach(btn => {
        btn.addEventListener('click', () => {
          const inv = {
            id: btn.dataset.id,
            date: btn.dataset.date,
            amount: parseFloat(btn.dataset.amount),
            subtotal: parseFloat(btn.dataset.subtotal),
            gst: parseFloat(btn.dataset.gst),
            desc: btn.dataset.desc,
            mode: 'UPI / Online'
          };
          showInvoiceModal(inv);
        });
      });
    }

    bindInvoiceBtns();

    // Compare Plans button
    document.getElementById('btn-view-plans')?.addEventListener('click', () => {
      navigate('pricing');
    });

    // Export Statement CSV
    document.getElementById('btn-export-client-tx')?.addEventListener('click', () => {
      const txHistory = JSON.parse(localStorage.getItem('seevora_wallet_tx') || 'null') || [];
      const rows = [
        ['Invoice ID', 'Date', 'Description', 'Subtotal (INR)', 'GST 18% (INR)', 'Total Paid (INR)', 'Mode', 'SAC Code'],
        ...txHistory.map(t => [
          t.id,
          t.date,
          t.desc,
          (t.subtotal || t.amount).toFixed(2),
          (t.gst || 0).toFixed(2),
          t.amount.toFixed(2),
          t.mode || 'Online',
          '998413'
        ])
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seevora_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    return;
  }

  // Admin export
  document.getElementById('btn-export-clients')?.addEventListener('click', () => {
    exportClientsCSV(MOCK_CLIENTS);
  });
}

function exportClientsCSV(clients) {
  const rows = [
    ['Client ID', 'Name', 'Status', 'Active Agents', 'Total Calls', 'Total Minutes', 'Platform Cost', 'Billed Revenue', 'Margin'],
    ...clients.map(c => [
      c.id,
      c.name,
      c.status,
      c.agents,
      c.calls,
      c.minutes.toFixed(2),
      c.cost.toFixed(2),
      c.revenue.toFixed(2),
      (c.revenue - c.cost).toFixed(2)
    ])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seevora_client_billing_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
