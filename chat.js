/**
 * TenantSentry F-CHAT Widget
 * --------------------------
 * Drop-in floating chat widget for the TenantSentry.ai marketing site.
 * Handles both product questions (what is TenantSentry?) and lease law
 * questions (rights, outgoings, make good, etc.).
 * Logs every query to the backend for gap analysis.
 *
 * Usage: <script src="/chat.js" data-api="https://your-backend.com"></script>
 */

(function () {
  'use strict';

  const scriptEl = document.currentScript || document.querySelector('script[src*="chat.js"]');
  const API_BASE = (scriptEl && scriptEl.dataset.api) || '';
  const UPLOAD_URL = 'https://tenantsentry.com.au/#upload';

  function getSessionId() {
    let sid = sessionStorage.getItem('ts_chat_session');
    if (!sid) {
      sid = 'cs-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('ts_chat_session', sid);
    }
    return sid;
  }

  // ── Product KB ────────────────────────────────────────────────────────────
  const PRODUCT_KB = [
    {
      keywords: ['what is tenantsentry', 'what does tenantsentry do', 'what can you do', 'what can tenantsentry do', 'how does it work', 'tell me about tenantsentry', 'what do you do', 'who are you'],
      articleId: 'product-overview',
      type: 'product',
      cta: { label: 'See how it works →', href: 'https://tenantsentry.com.au/#how-it-works' },
      response: '**TenantSentry is an AI-powered lease audit tool for Australian commercial tenants.**\n\nYou upload your lease PDF and we analyse it against state retail lease legislation — in minutes, not weeks.\n\nHere\'s what we find:\n- 🔴 Unlawful clauses (e.g. land tax passed to VIC/NSW retail tenants)\n- 💰 Overcharged outgoings and incorrect CPI calculations\n- ⚠️ Missing tenant protections your lease should include\n- 📅 Critical dates — option windows, rent reviews, lease expiry\n\nYou get a plain-English report showing exactly what\'s wrong, how much you may be owed, and the legislation that backs it up.'
    },
    {
      keywords: ['how much', 'price', 'pricing', 'cost', 'fee', 'how much does it cost', 'how much is it', 'subscription', 'per month'],
      articleId: 'product-pricing',
      type: 'product',
      cta: { label: 'See pricing →', href: 'https://tenantsentry.com.au/#pricing' },
      response: '**TenantSentry pricing is straightforward — pay per audit, no lock-in.**\n\n- **Single audit:** $199 — full lease analysis, PDF report, legislative citations\n- **Audit + 12-month monitoring:** $399 — includes ongoing alerts for rent reviews, option deadlines, outgoings reconciliations\n- **Month 13+ monitoring:** $49/month to keep the alerts running\n\nMost tenants recover far more than the audit fee in their first year — the average overcharge we find is over $8,000.'
    },
    {
      keywords: ['how long', 'how fast', 'turnaround', 'minutes', 'hours', 'when will i get', 'quick'],
      articleId: 'product-turnaround',
      type: 'product',
      cta: { label: 'Upload your lease →', href: UPLOAD_URL },
      response: '**Most audits complete in under 5 minutes.**\n\nOur AI reads and analyses your lease the moment you upload it:\n1. OCR + clause extraction (~1 min)\n2. AI analysis against legislation (~2–3 min)\n3. Human expert spot-check before release (~same day)\n\nYou get an email when your report is ready.'
    },
    {
      keywords: ['legal advice', 'is this legal advice', 'lawyer', 'solicitor', 'replace a lawyer', 'not legal advice'],
      articleId: 'product-legal-disclaimer',
      type: 'product',
      cta: { label: 'Learn more →', href: 'https://tenantsentry.com.au/why-tenantsentry' },
      response: '**TenantSentry is not a law firm and does not provide legal advice.**\n\nWhat we do provide:\n- Factual identification of clause types and legislative references\n- Plain-English explanation of what each clause means\n- Draft dispute letters (framed as templates for your review)\n\nThink of us as a highly specialised lease auditor. For legal proceedings, you\'ll still want a solicitor. But most overcharges are resolved with a well-cited letter — and that\'s what our report gives you.'
    },
    {
      keywords: ['which states', 'what states', 'where available', 'jurisdiction supported', 'does it work in', 'available in'],
      articleId: 'product-jurisdictions',
      type: 'product',
      cta: { label: 'Check your state →', href: UPLOAD_URL },
      response: '**Full support for VIC, NSW, and QLD — the three largest retail lease markets.**\n\n- **VIC** — Retail Leases Act 2003, VSBC dispute resolution\n- **NSW** — Retail Leases Act 1994, NSW Fair Trading / NCAT\n- **QLD** — Retail Shop Leases Act 1994, QCAT\n\nWA and SA are on our roadmap for Phase 2.'
    },
    {
      keywords: ['safe', 'secure', 'privacy', 'data', 'confidential', 'who can see', 'security', 'store my lease', 'my data'],
      articleId: 'product-security',
      type: 'product',
      cta: { label: 'Read our privacy policy →', href: 'https://tenantsentry.com.au/about' },
      response: '**Your lease data is handled with strict confidentiality.**\n\n- All data stored on **Sydney-based servers** compliant with Australian Privacy Principles\n- Your lease is never shared with third parties or used to train AI models\n- Only you and our internal audit team can access your report\n- Encrypted in transit (TLS) and at rest\n\nIf you want your data deleted after your audit, just ask — actioned within 48 hours.'
    },
    {
      keywords: ['who is it for', 'who uses', 'am i eligible', 'retail tenant', 'commercial tenant', 'small business', 'franchise', 'cafe', 'restaurant', 'shop'],
      articleId: 'product-who-for',
      type: 'product',
      cta: { label: 'Upload your lease →', href: UPLOAD_URL },
      response: '**TenantSentry is built for Australian commercial and retail tenants** — especially small businesses who can\'t justify $500/hr solicitor rates for every lease question.\n\nOur typical users:\n- Retailers, cafés, restaurants, gyms on retail leases\n- Medical and allied health practices\n- Franchise operators reviewing landlord invoices\n- Office tenants checking outgoings reconciliations\n\nIf you pay rent on commercial premises in Australia and have a lease document, TenantSentry can audit it.'
    },
    {
      keywords: ['monitoring', 'alerts', 'reminder', 'critical date', 'option reminder', 'rent review alert', '12 month', 'ongoing'],
      articleId: 'product-monitoring',
      type: 'product',
      cta: { label: 'See monitoring features →', href: 'https://tenantsentry.com.au/#features' },
      response: '**The $399 plan includes 12 months of critical date monitoring.**\n\nAfter your audit, we track your lease calendar and alert you before:\n- 📅 Option to renew window (90, 60, 30 days before)\n- 💰 Rent review dates (so you\'re prepared with CPI data)\n- 📋 Outgoings reconciliation due dates\n- ⚠️ Lease expiry (so you\'re never caught in holding over)\n\nAlerts come by email, and you can view your full lease calendar in your dashboard.'
    },
  ];

  // ── Lease law KB ──────────────────────────────────────────────────────────
  const LEASE_CTA = { label: 'Upload my lease →', href: UPLOAD_URL };
  const KB = [
    {
      keywords: ['rent increase', 'rent review', 'backdated', 'backdating', 'notice period', 'notice of rent'],
      clauseType: 'rent_review', articleId: 'rent-increase-notice', type: 'lease', cta: LEASE_CTA,
      response: '**Rent increases must follow strict notice rules.**\n\nIn VIC, NSW and QLD the landlord must give written notice before increasing rent — usually 30 days for retail leases. A backdated increase is **not enforceable**.\n\n🔴 **Red flags:**\n- No minimum notice period specified\n- Rent review date not clearly defined\n- Clause allows "immediate" adjustment\n\n**What you can do:** Write to your landlord noting the breach and request a corrected invoice from the proper notice date.\n\n👉 Want to check if your rent review clause is compliant?'
    },
    {
      keywords: ['ratchet', 'ratchet clause', 'rent can never go down', 'minimum rent'],
      clauseType: 'rent_review', articleId: 'ratchet-clause', type: 'lease', cta: LEASE_CTA,
      response: '**A ratchet clause prevents rent from falling below its current level — even if market rent drops.**\n\nThis is **prohibited in retail leases** in VIC and NSW when rent is reviewed to market. Under the Retail Leases Act, a market review must be genuine.\n\n🔴 **Red flags:**\n- "Rent shall not decrease" language in a market review clause\n- Combined CPI + ratchet in a retail lease\n\n👉 Upload your lease to check for ratchet clauses:'
    },
    {
      keywords: ['cpi', 'consumer price index', 'cpi review', 'inflation', 'cpi calculation', 'wrong cpi'],
      clauseType: 'rent_review', articleId: 'cpi-review', type: 'lease', cta: LEASE_CTA,
      response: '**CPI rent reviews must use the correct ABS index group for your state.**\n\nThe most common landlord error: applying the wrong index (e.g. national CPI instead of state All Groups).\n\n🔴 **Common errors:**\n- Using national CPI instead of state index\n- Wrong base date → compounds into significant overcharge over time\n- Applying CPI to outgoings as well as base rent (usually not permitted)\n\n👉 Our audit engine checks your lease\'s CPI formula against the correct ABS data:'
    },
    {
      keywords: ['outgoings', 'outgoing', 'body corporate', 'council rates', 'insurance', 'management fee', 'sinking fund', 'water rates'],
      clauseType: 'outgoings', articleId: 'outgoings-allowable', type: 'lease', cta: LEASE_CTA,
      response: '**Landlords can only pass on outgoings explicitly permitted in your lease.**\n\nIn retail leases (VIC, NSW, QLD) these are **prohibited** regardless of what the lease says:\n- Capital works and improvements\n- Depreciation of the building\n- Costs to attract or retain other tenants\n- Land tax (most retail lease jurisdictions)\n\n🔴 **Common overcharges:**\n- Management fees above a reasonable percentage\n- Sinking fund contributions (capital in nature)\n- Costs shared without a clear formula\n\n👉 Upload your lease and latest outgoings invoice to audit what you\'re actually owed:'
    },
    {
      keywords: ['land tax', 'land tax passed', 'land tax in lease'],
      clauseType: 'land_tax', articleId: 'land-tax-prohibited', type: 'lease', cta: LEASE_CTA,
      response: '**Land tax cannot be passed to retail tenants in VIC or NSW — full stop.**\n\nUnder the Retail Leases Act 2003 (VIC) s.46 and Retail Leases Act 1994 (NSW) s.41, any lease clause purporting to do so is void.\n\nIn QLD, land tax recovery is allowed but must be clearly specified in the lease.\n\n🔴 **What to look for:**\n- Line item "Land Tax" on your outgoings invoice (VIC/NSW → automatic overcharge)\n- "Statutory charges" definition — check if land tax is buried in it\n\n**Recoverable amount:** If charged in VIC or NSW, you can recover overpaid amounts (6-year limitation).\n\n👉 Check your lease and invoices for land tax charges:'
    },
    {
      keywords: ['make good', 'make-good', 'reinstatement', 'original condition', 'strip out', 'fit out removal'],
      clauseType: 'make_good', articleId: 'make-good-obligations', type: 'lease', cta: LEASE_CTA,
      response: '**Make good obligations must be specific — vague "original condition" clauses are often unenforceable.**\n\nYour lease should clearly state: strip your fit-out, restore walls/floors, or return to commencement condition (with fair wear and tear)?\n\n🔴 **Red flags:**\n- No definition of "original condition"\n- Make good extends to landlord\'s original fit-out\n- No fair wear and tear carve-out\n\n**Before handback:** A condition report from lease start is your best protection.\n\n👉 Get your make good clause audited before lease end:'
    },
    {
      keywords: ['holding over', 'hold over', 'month to month', 'lease expired', 'lease ending', 'after lease expires'],
      clauseType: 'holding_over', articleId: 'holding-over-rights', type: 'lease', cta: LEASE_CTA,
      response: '**Holding over = staying in the premises after your lease expires without a new lease.**\n\nIn VIC/NSW retail, if you hold over with landlord consent you typically become month-to-month on the same terms. Either party can end with 1 month\'s notice.\n\n🔴 **Watch out for:**\n- Higher rent multiplier during holding over (e.g. 1.5\xD7 monthly rent)\n- No maximum holding over period specified\n\n**Best practice:** Decide at least 6 months before expiry whether to exercise your option or negotiate a new term.\n\n👉 Check your lease\'s holding over and option clauses:'
    },
    {
      keywords: ['option', 'option to renew', 'exercise option', 'renew lease', 'renewal', 'missed option'],
      clauseType: 'options', articleId: 'option-to-renew', type: 'lease', cta: LEASE_CTA,
      response: '**Options to renew must be exercised within a strict window — missing it means losing the right entirely.**\n\nYour lease specifies a window, typically 6–3 months before expiry. Miss it, and the landlord is not obliged to renew.\n\n**How to exercise correctly:**\n1. Written notice within the window (check if registered post is required)\n2. Keep the letter — proof of date is critical\n3. Ensure you\'re not in breach of the lease\n\n🔴 **Common mistakes:**\n- Verbal notice only (not valid)\n- Notice sent outside the window\n- Lease in breach at time of notice\n\n👉 Check your option window and notice requirements:'
    },
    {
      keywords: ['dispute', 'vsbc', 'ncat', 'qcat', 'tribunal', 'mediation', 'complaint'],
      clauseType: 'other', articleId: 'dispute-resolution', type: 'lease', cta: LEASE_CTA,
      response: '**Most retail lease disputes must go through the state tribunal before court.**\n\n- **VIC:** VSBC — free mediation, then VCAT\n- **NSW:** NSW Fair Trading mediation, then NCAT\n- **QLD:** Office of the Small Business Commissioner, then QCAT\n\nCosts are low and the process is designed for non-lawyers. Most disputes resolve at mediation.\n\n**Tip:** A formal letter citing the specific Act section often resolves disputes before tribunal.\n\n👉 Our report includes legislative citations ready to attach to a dispute letter:'
    },
  ];

  // ── KB Matching ───────────────────────────────────────────────────────────
  function matchKB(query) {
    const q = query.toLowerCase();
    let best = null, bestScore = 0;
    for (const entry of [...PRODUCT_KB, ...KB]) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw)) score += kw.split(' ').length;
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }
    return bestScore > 0 ? best : null;
  }

  function inferJurisdiction(query) {
    const q = query.toLowerCase();
    if (q.includes('victoria') || q.includes('vic') || q.includes('melbourne')) return 'VIC';
    if (q.includes('nsw') || q.includes('new south wales') || q.includes('sydney')) return 'NSW';
    if (q.includes('queensland') || q.includes('qld') || q.includes('brisbane')) return 'QLD';
    return null;
  }

  async function logQuery(query, match) {
    try {
      await fetch(API_BASE + '/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getSessionId(),
          raw_query: query,
          jurisdiction: inferJurisdiction(query) || '',
          clause_type: match ? (match.clauseType || 'other') : 'other',
          matched_kb_article_id: match ? match.articleId : '',
        }),
      });
    } catch (_) {}
  }

  function renderMessage(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const STYLES = `
    #ts-chat-bubble {
      position:fixed;bottom:24px;right:24px;z-index:9999;
      width:56px;height:56px;border-radius:50%;
      background:#16A34A;color:white;border:none;cursor:pointer;
      box-shadow:0 4px 16px rgba(22,163,74,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:24px;transition:transform 0.2s,box-shadow 0.2s;
    }
    #ts-chat-bubble:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(22,163,74,0.5);}
    #ts-chat-bubble .ts-bubble-badge{
      position:absolute;top:-4px;right:-4px;
      background:#dc2626;color:white;font-size:11px;
      border-radius:10px;padding:1px 6px;font-weight:700;
      font-family:'Plus Jakarta Sans',sans-serif;
    }
    #ts-chat-panel{
      position:fixed;bottom:92px;right:24px;z-index:9998;
      width:360px;max-height:540px;
      background:white;border-radius:16px;
      box-shadow:0 8px 40px rgba(0,0,0,0.14);
      display:flex;flex-direction:column;
      font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
      overflow:hidden;transition:opacity 0.2s,transform 0.2s;
    }
    #ts-chat-panel.ts-hidden{opacity:0;pointer-events:none;transform:translateY(12px);}
    .ts-chat-header{
      background:#16A34A;color:white;
      padding:14px 16px;display:flex;align-items:center;gap:10px;
    }
    .ts-chat-header-avatar{
      width:36px;height:36px;border-radius:50%;
      background:rgba(255,255,255,0.2);
      display:flex;align-items:center;justify-content:center;font-size:18px;
    }
    .ts-chat-header-info{flex:1;}
    .ts-chat-header-name{font-weight:700;font-size:0.95rem;}
    .ts-chat-header-status{font-size:0.75rem;opacity:0.85;}
    .ts-chat-close{background:none;border:none;color:white;cursor:pointer;font-size:20px;padding:4px;line-height:1;opacity:0.8;}
    .ts-chat-close:hover{opacity:1;}
    .ts-chat-messages{
      flex:1;overflow-y:auto;padding:16px;
      display:flex;flex-direction:column;gap:12px;background:#f9fafb;
    }
    .ts-msg{max-width:88%;padding:10px 13px;border-radius:12px;font-size:0.875rem;line-height:1.55;}
    .ts-msg-bot{background:white;border:1px solid #e5e7eb;border-bottom-left-radius:4px;align-self:flex-start;color:#111827;}
    .ts-msg-user{background:#16A34A;color:white;border-bottom-right-radius:4px;align-self:flex-end;}
    .ts-msg-cta{margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb;}
    .ts-cta-btn{
      display:inline-block;margin-top:6px;background:#16A34A;color:white;
      padding:8px 14px;border-radius:8px;font-size:0.8rem;font-weight:600;
      text-decoration:none;transition:background 0.15s;
    }
    .ts-cta-btn:hover{background:#0F6B31;color:white;text-decoration:none;}
    .ts-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 2px;}
    .ts-chip{
      background:white;border:1px solid #16A34A;color:#16A34A;
      border-radius:20px;padding:6px 12px;font-size:0.78rem;
      font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;
      cursor:pointer;transition:background 0.15s,color 0.15s;white-space:nowrap;
    }
    .ts-chip:hover{background:#16A34A;color:white;}
    .ts-typing{display:flex;gap:4px;align-items:center;padding:10px 13px;}
    .ts-typing span{width:7px;height:7px;background:#9ca3af;border-radius:50%;animation:ts-bounce 1.2s infinite;}
    .ts-typing span:nth-child(2){animation-delay:0.2s;}
    .ts-typing span:nth-child(3){animation-delay:0.4s;}
    @keyframes ts-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}
    .ts-chat-input-row{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e5e7eb;background:white;}
    .ts-chat-input{
      flex:1;border:1px solid #d1d5db;border-radius:8px;
      padding:9px 12px;font-size:0.875rem;outline:none;
      font-family:inherit;resize:none;transition:border-color 0.15s;
    }
    .ts-chat-input:focus{border-color:#16A34A;}
    .ts-chat-send{
      background:#16A34A;color:white;border:none;border-radius:8px;
      padding:9px 14px;cursor:pointer;font-size:16px;
      transition:background 0.15s;display:flex;align-items:center;
    }
    .ts-chat-send:hover{background:#0F6B31;}
    .ts-chat-send:disabled{background:#d1d5db;cursor:default;}
    .ts-disclaimer{text-align:center;font-size:0.7rem;color:#9ca3af;padding:0 14px 10px;background:white;}
    @media(max-width:400px){#ts-chat-panel{width:calc(100vw - 24px);right:12px;}}
  `;

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen = false;

  // ── Build widget ──────────────────────────────────────────────────────────
  function buildWidget() {
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    const bubble = document.createElement('button');
    bubble.id = 'ts-chat-bubble';
    bubble.setAttribute('aria-label', 'Chat with TenantSentry');
    bubble.innerHTML = '💬<span class="ts-bubble-badge">Ask</span>';
    document.body.appendChild(bubble);

    const panel = document.createElement('div');
    panel.id = 'ts-chat-panel';
    panel.className = 'ts-hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'TenantSentry assistant');
    panel.innerHTML =
      '<div class="ts-chat-header">' +
        '<div class="ts-chat-header-avatar">🏢</div>' +
        '<div class="ts-chat-header-info">' +
          '<div class="ts-chat-header-name">TenantSentry Assistant</div>' +
          '<div class="ts-chat-header-status">Product questions & lease rights</div>' +
        '</div>' +
        '<button class="ts-chat-close" id="ts-chat-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="ts-chat-messages" id="ts-chat-messages"></div>' +
      '<div class="ts-chat-input-row">' +
        '<textarea class="ts-chat-input" id="ts-chat-input" placeholder="Ask about TenantSentry or your lease rights…" rows="1" aria-label="Your question"></textarea>' +
        '<button class="ts-chat-send" id="ts-chat-send" aria-label="Send">➤</button>' +
      '</div>' +
      '<div class="ts-disclaimer">General information only · Not legal advice</div>';
    document.body.appendChild(panel);

    addBotMessage(
      'Hi there 👋 I\'m the TenantSentry assistant. I can help with two things:<br><br>' +
      '<strong>About TenantSentry</strong> — how it works, pricing, what we find<br>' +
      '<strong>Lease questions</strong> — rent increases, outgoings, make good, options and more (VIC, NSW, QLD)<br><br>' +
      'What are you here for?',
      null
    );
    addChips(['What can TenantSentry do?', 'I have a lease question', 'How much does it cost?']);

    bubble.addEventListener('click', togglePanel);
    document.getElementById('ts-chat-close').addEventListener('click', closePanel);
    document.getElementById('ts-chat-send').addEventListener('click', handleSend);

    const input = document.getElementById('ts-chat-input');
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', function() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  function togglePanel() { isOpen ? closePanel() : openPanel(); }

  function openPanel() {
    isOpen = true;
    document.getElementById('ts-chat-panel').classList.remove('ts-hidden');
    setTimeout(function() { document.getElementById('ts-chat-input').focus(); }, 100);
  }

  function closePanel() {
    isOpen = false;
    document.getElementById('ts-chat-panel').classList.add('ts-hidden');
  }

  function addBotMessage(html, cta) {
    const msgs = document.getElementById('ts-chat-messages');
    const div = document.createElement('div');
    div.className = 'ts-msg ts-msg-bot';
    div.innerHTML = html;
    if (cta) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'ts-msg-cta';
      ctaDiv.innerHTML = '<a href="' + cta.href + '" class="ts-cta-btn" target="_blank">' + cta.label + '</a>';
      div.appendChild(ctaDiv);
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function addChips(chips) {
    const msgs = document.getElementById('ts-chat-messages');
    const row = document.createElement('div');
    row.className = 'ts-chips';
    row.id = 'ts-chips';
    chips.forEach(function(label) {
      const btn = document.createElement('button');
      btn.className = 'ts-chip';
      btn.textContent = label;
      btn.addEventListener('click', function() {
        row.remove();
        document.getElementById('ts-chat-input').value = label;
        handleSend();
      });
      row.appendChild(btn);
    });
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    const msgs = document.getElementById('ts-chat-messages');
    const div = document.createElement('div');
    div.className = 'ts-msg ts-msg-user';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('ts-chat-messages');
    const div = document.createElement('div');
    div.className = 'ts-msg ts-msg-bot ts-typing';
    div.id = 'ts-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function handleSend() {
    const input = document.getElementById('ts-chat-input');
    const sendBtn = document.getElementById('ts-chat-send');
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    const chips = document.getElementById('ts-chips');
    if (chips) chips.remove();

    addUserMessage(query);
    const typingEl = showTyping();

    await new Promise(function(r) { setTimeout(r, 700 + Math.random() * 600); });

    const match = matchKB(query);
    logQuery(query, match);

    typingEl.remove();

    if (match) {
      addBotMessage(renderMessage(match.response), match.cta);
    } else {
      addBotMessage(
        "That's a good question — we're still building our answer for that specific topic.<br><br>" +
        "For a <strong>personalised answer based on your actual lease</strong>, upload it and our AI audit will flag any issues specific to your situation.",
        { label: 'Upload my lease →', href: UPLOAD_URL }
      );
    }

    sendBtn.disabled = false;
    input.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
