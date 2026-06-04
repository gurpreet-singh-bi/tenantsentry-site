/**
 * TenantSentry F-CHAT Widget
 * --------------------------
 * Drop-in floating chat widget for the TenantSentry.ai marketing site.
 * - Answers common commercial lease questions (client-side KB, v1)
 * - Logs every query to the backend for gap analysis
 * - Upsells to lease upload on KB gaps
 *
 * Usage: <script src="/chat.js" data-api="https://your-backend.com"></script>
 * If data-api is omitted, defaults to same origin (useful for local dev).
 */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  const scriptEl = document.currentScript || document.querySelector('script[src*="chat.js"]');
  const API_BASE = (scriptEl && scriptEl.dataset.api) || '';
  const UPLOAD_URL = 'https://tenantsentry.com.au/#upload'; // PLG funnel CTA

  // ── Session ID (anonymous, per browser session) ───────────────────────────
  function getSessionId() {
    let sid = sessionStorage.getItem('ts_chat_session');
    if (!sid) {
      sid = 'cs-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('ts_chat_session', sid);
    }
    return sid;
  }

  // ── Client-side KB (v1) ───────────────────────────────────────────────────
  // Each entry: { keywords, clauseType, jurisdiction (optional), articleId, response }
  // Response is markdown-lite (line breaks with \n, **bold** supported).
  const KB = [
    {
      keywords: ['rent increase', 'rent review', 'backdated', 'backdating', 'notice period', 'notice of rent'],
      clauseType: 'rent_review',
      articleId: 'rent-increase-notice',
      response: `**Rent increases must follow strict notice rules.**

In VIC, NSW and QLD the landlord must give you written notice before increasing rent — usually 30 days for retail leases. A backdated increase (effective before the notice was given) is **not enforceable**.

🔴 **Red flags in your lease:**
- No minimum notice period specified
- Rent review date not clearly defined
- Clause allows "immediate" adjustment

**What you can do:** If you've received a backdated increase, write to your landlord noting the breach and request a corrected invoice dated from the proper notice date.

👉 Want to check if your lease's rent review clause is compliant?`
    },
    {
      keywords: ['ratchet', 'ratchet clause', 'rent can never go down', 'minimum rent'],
      clauseType: 'rent_review',
      articleId: 'ratchet-clause',
      response: `**A ratchet clause prevents rent from falling below its current level — even if market rent drops.**

This is common in commercial leases but is **prohibited in retail leases** in VIC and NSW when rent is reviewed to market. Under the Retail Leases Act, a market review must be genuine — the landlord can't use a ratchet to lock in a floor.

🔴 **Red flags:**
- "Rent shall not decrease" language in a market review clause
- Combined CPI + ratchet in a retail lease

**What you can do:** If you're in VIC or NSW on a retail lease, a ratchet attached to a market review is likely unenforceable. Get the clause audited before your next review date.

👉 Upload your lease to check for ratchet clauses:`
    },
    {
      keywords: ['cpi', 'consumer price index', 'cpi review', 'inflation', 'cpi calculation', 'wrong cpi'],
      clauseType: 'rent_review',
      articleId: 'cpi-review',
      response: `**CPI rent reviews must use the correct ABS index group for your state.**

The most common landlord error: applying the wrong CPI index (e.g. national CPI instead of the state-specific All Groups index, or using the wrong base quarter).

Check your lease specifies:
- Which ABS index series (e.g. "All Groups CPI, Sydney")
- Which quarter is the base (typically the quarter before lease start)
- Review frequency (usually annual)

🔴 **Common errors:**
- Using national CPI instead of state index
- Wrong base date → compounds into significant overcharge over time
- Applying CPI to outgoings as well as base rent (usually not permitted)

👉 Our audit engine checks your lease's CPI formula against the correct ABS data:`
    },
    {
      keywords: ['outgoings', 'outgoing', 'body corporate', 'council rates', 'insurance', 'management fee', 'sinking fund', 'water rates'],
      clauseType: 'outgoings',
      articleId: 'outgoings-allowable',
      response: `**Landlords can only pass on outgoings that are explicitly permitted in your lease.**

In retail leases (VIC, NSW, QLD), certain outgoings are **prohibited** regardless of what the lease says:
- Capital works and improvements
- Depreciation of the building
- Costs to attract or retain other tenants
- Land tax (in most retail lease jurisdictions)

Your lease must include an **estimated outgoings schedule** at signing, and the landlord must reconcile actuals vs estimates each year.

🔴 **Common overcharges:**
- Management fees above a reasonable percentage
- Sinking fund contributions (capital in nature)
- Costs shared across tenancies without a clear formula

👉 Upload your lease and most recent outgoings invoice to audit what you're actually owed:`
    },
    {
      keywords: ['land tax', 'land tax passed', 'land tax in lease'],
      clauseType: 'land_tax',
      articleId: 'land-tax-prohibited',
      response: `**Land tax cannot be passed to retail tenants in VIC or NSW — full stop.**

Under the Retail Leases Act 2003 (VIC) s.46 and Retail Leases Act 1994 (NSW) s.41, a landlord **cannot** recover land tax from a retail tenant. Any lease clause purporting to do so is void.

In QLD, land tax recovery is allowed but must be clearly specified in the lease and the outgoings schedule.

🔴 **What to look for:**
- Line item "Land Tax" on your outgoings invoice (VIC/NSW → automatic overcharge)
- Lease clause referencing "statutory charges" — check if land tax is buried in this definition

**Recoverable amount:** If you've been charged land tax in VIC or NSW, you can recover overpaid amounts. Limitation period is typically 6 years.

👉 Check your lease and invoices for land tax charges:`
    },
    {
      keywords: ['make good', 'make-good', 'reinstatement', 'original condition', 'strip out', 'fit out removal'],
      clauseType: 'make_good',
      articleId: 'make-good-obligations',
      response: `**Make good obligations must be specific — vague "original condition" clauses are often unenforceable.**

Your lease should clearly state what make good means: does it mean stripping your fit-out, restoring walls and floors, or returning to the condition at lease commencement (with fair wear and tear)?

In VIC, if the make good clause is ambiguous, the Retail Leases Act gives VSBC jurisdiction to resolve disputes. Courts have repeatedly found that "original condition" does not mean "brand new."

🔴 **Red flags:**
- No definition of "original condition" in the lease
- Make good obligation extends to landlord's original fit-out (not just tenant's additions)
- No fair wear and tear carve-out

**Before you hand back:** Get a condition report from lease commencement. If you don't have one, photos from moving in can substitute.

👉 Get your make good clause audited before lease end:`
    },
    {
      keywords: ['holding over', 'hold over', 'month to month', 'lease expired', 'lease ending', 'after lease expires'],
      clauseType: 'holding_over',
      articleId: 'holding-over-rights',
      response: `**Holding over = staying in the premises after your lease expires without signing a new lease.**

What happens depends on your lease and jurisdiction:

**VIC/NSW Retail:** If you hold over with the landlord's consent (explicit or implied by accepting rent), you typically become a month-to-month tenant on the same terms. Either party can end this with 1 month's notice.

**Risk:** The landlord has more leverage in holding over — they can increase rent or refuse to renew. You also lose the protection of a fixed term.

🔴 **Watch out for:**
- Holding over provisions that allow the landlord to charge a higher rent multiplier (e.g. 1.5× monthly rent)
- No maximum holding over period specified

**Best practice:** Decide at least 6 months before expiry whether you want to exercise your option or negotiate a new term.

👉 Check your lease's holding over and option clauses:`
    },
    {
      keywords: ['option', 'option to renew', 'exercise option', 'renew lease', 'renewal', 'missed option'],
      clauseType: 'options',
      articleId: 'option-to-renew',
      response: `**Options to renew must be exercised within a strict window — missing it means losing the right entirely.**

Your lease will specify a "window" — typically between 6 and 3 months before the lease expires. If you miss this window, the landlord is not obliged to renew, even if you've been a good tenant.

**How to exercise correctly:**
1. Give written notice within the window (check if registered post is required)
2. Keep the letter — proof of date is critical
3. Ensure you're not in breach of the lease at the time

🔴 **Common mistakes:**
- Verbal notice only (not valid)
- Notice sent outside the window
- Lease in breach at time of notice (landlord can refuse)

In VIC, VSBC can intervene if a landlord unreasonably refuses renewal after a valid exercise — but only if you exercised correctly.

👉 Set a reminder for your option window and check your notice requirements:`
    },
    {
      keywords: ['dispute', 'vsbc', 'ncat', 'qcat', 'tribunal', 'mediation', 'complaint'],
      clauseType: 'other',
      articleId: 'dispute-resolution',
      response: `**Most retail lease disputes must go through the state tribunal before court.**

- **VIC:** Victorian Small Business Commission (VSBC) — free mediation, then VCAT
- **NSW:** NSW Fair Trading mediation, then NCAT
- **QLD:** Office of the Small Business Commissioner, then QCAT

Costs are low and the process is designed for non-lawyers. Most disputes resolve at mediation without going to tribunal.

**What you'll need:**
- A copy of your lease
- Invoices and correspondence
- Evidence of the alleged breach (photos, emails, etc.)

**Tip:** A formal letter to the landlord citing the specific Act section often resolves disputes before tribunal. Landlords prefer not to appear before VSBC/NCAT.

👉 Our audit report includes the specific legislative citations for each flag — ready to attach to a dispute letter:`
    },
  ];

  // ── KB Matching ───────────────────────────────────────────────────────────
  function matchKB(query) {
    const q = query.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const entry of KB) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw)) score += kw.split(' ').length; // longer phrase = higher weight
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }
    return bestScore > 0 ? best : null;
  }

  // Infer jurisdiction from query text
  function inferJurisdiction(query) {
    const q = query.toLowerCase();
    if (q.includes('victoria') || q.includes('vic') || q.includes('melbourne')) return 'VIC';
    if (q.includes('nsw') || q.includes('new south wales') || q.includes('sydney')) return 'NSW';
    if (q.includes('queensland') || q.includes('qld') || q.includes('brisbane')) return 'QLD';
    return null;
  }

  // ── Backend logging ───────────────────────────────────────────────────────
  async function logQuery(query, match) {
    try {
      await fetch(`${API_BASE}/api/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getSessionId(),
          raw_query: query,
          jurisdiction: inferJurisdiction(query) || '',
          clause_type: match ? match.clauseType : 'other',
          matched_kb_article_id: match ? match.articleId : '',
        }),
      });
    } catch (_) {
      // Non-fatal — never break chat on logging failure
    }
  }

  // ── Render markdown-lite ──────────────────────────────────────────────────
  function renderMessage(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/🔴/g, '<span style="color:#dc2626">🔴</span>')
      .replace(/👉/g, '<span>👉</span>')
      .replace(/\n/g, '<br>');
  }

  // ── Widget HTML / CSS ─────────────────────────────────────────────────────
  const STYLES = `
    #ts-chat-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #16A34A; color: white;
      border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(22,163,74,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; transition: transform 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }
    #ts-chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(22,163,74,0.5); }
    #ts-chat-bubble .ts-bubble-badge {
      position: absolute; top: -4px; right: -4px;
      background: #dc2626; color: white; font-size: 11px;
      border-radius: 10px; padding: 1px 6px; font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    #ts-chat-panel {
      position: fixed; bottom: 92px; right: 24px; z-index: 9998;
      width: 360px; max-height: 540px;
      background: white; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.14);
      display: flex; flex-direction: column;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    #ts-chat-panel.ts-hidden { opacity: 0; pointer-events: none; transform: translateY(12px); }
    .ts-chat-header {
      background: #16A34A; color: white;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    .ts-chat-header-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .ts-chat-header-info { flex: 1; }
    .ts-chat-header-name { font-weight: 700; font-size: 0.95rem; }
    .ts-chat-header-status { font-size: 0.75rem; opacity: 0.85; }
    .ts-chat-close {
      background: none; border: none; color: white; cursor: pointer;
      font-size: 20px; padding: 4px; line-height: 1; opacity: 0.8;
    }
    .ts-chat-close:hover { opacity: 1; }
    .ts-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      background: #f9fafb;
    }
    .ts-msg {
      max-width: 88%; padding: 10px 13px; border-radius: 12px;
      font-size: 0.875rem; line-height: 1.55;
    }
    .ts-msg-bot {
      background: white; border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px; align-self: flex-start;
      color: #111827;
    }
    .ts-msg-user {
      background: #16A34A; color: white;
      border-bottom-right-radius: 4px; align-self: flex-end;
    }
    .ts-msg-cta {
      margin-top: 10px; padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    }
    .ts-cta-btn {
      display: inline-block; margin-top: 6px;
      background: #16A34A; color: white;
      padding: 8px 14px; border-radius: 8px;
      font-size: 0.8rem; font-weight: 600; text-decoration: none;
      transition: background 0.15s;
    }
    .ts-cta-btn:hover { background: #0F6B31; color: white; text-decoration: none; }
    .ts-typing { display: flex; gap: 4px; align-items: center; padding: 10px 13px; }
    .ts-typing span {
      width: 7px; height: 7px; background: #9ca3af; border-radius: 50%;
      animation: ts-bounce 1.2s infinite;
    }
    .ts-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ts-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ts-bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    .ts-chat-input-row {
      display: flex; gap: 8px; padding: 12px 14px;
      border-top: 1px solid #e5e7eb; background: white;
    }
    .ts-chat-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 8px;
      padding: 9px 12px; font-size: 0.875rem; outline: none;
      font-family: inherit; resize: none;
      transition: border-color 0.15s;
    }
    .ts-chat-input:focus { border-color: #16A34A; }
    .ts-chat-send {
      background: #16A34A; color: white; border: none; border-radius: 8px;
      padding: 9px 14px; cursor: pointer; font-size: 16px;
      transition: background 0.15s;
      display: flex; align-items: center;
    }
    .ts-chat-send:hover { background: #0F6B31; }
    .ts-chat-send:disabled { background: #d1d5db; cursor: default; }
    .ts-disclaimer {
      text-align: center; font-size: 0.7rem; color: #9ca3af;
      padding: 0 14px 10px; background: white;
    }
    @media (max-width: 400px) {
      #ts-chat-panel { width: calc(100vw - 24px); right: 12px; }
    }
  `;

  // ── Widget state ──────────────────────────────────────────────────────────
  let isOpen = false;

  // ── DOM construction ──────────────────────────────────────────────────────
  function buildWidget() {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // Bubble button
    const bubble = document.createElement('button');
    bubble.id = 'ts-chat-bubble';
    bubble.setAttribute('aria-label', 'Chat with TenantSentry');
    bubble.innerHTML = '💬<span class="ts-bubble-badge">Ask</span>';
    document.body.appendChild(bubble);

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'ts-chat-panel';
    panel.className = 'ts-hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'TenantSentry lease assistant');
    panel.innerHTML = `
      <div class="ts-chat-header">
        <div class="ts-chat-header-avatar">🏢</div>
        <div class="ts-chat-header-info">
          <div class="ts-chat-header-name">TenantSentry Assistant</div>
          <div class="ts-chat-header-status">Commercial lease rights · Australia</div>
        </div>
        <button class="ts-chat-close" id="ts-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="ts-chat-messages" id="ts-chat-messages"></div>
      <div class="ts-chat-input-row">
        <textarea class="ts-chat-input" id="ts-chat-input"
          placeholder="Ask about rent increases, outgoings, make good…"
          rows="1" aria-label="Your question"></textarea>
        <button class="ts-chat-send" id="ts-chat-send" aria-label="Send">➤</button>
      </div>
      <div class="ts-disclaimer">General information only · Not legal advice</div>
    `;
    document.body.appendChild(panel);

    // Welcome message
    addBotMessage(
      `Hi there 👋 I can answer general questions about <strong>commercial lease rights in VIC, NSW, and QLD</strong> — rent increases, outgoings, make good, options, and more.<br><br>What's on your mind?`,
      null
    );

    // Event listeners
    bubble.addEventListener('click', togglePanel);
    document.getElementById('ts-chat-close').addEventListener('click', closePanel);
    document.getElementById('ts-chat-send').addEventListener('click', handleSend);
    const input = document.getElementById('ts-chat-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    document.getElementById('ts-chat-panel').classList.remove('ts-hidden');
    setTimeout(() => document.getElementById('ts-chat-input').focus(), 100);
  }

  function closePanel() {
    isOpen = false;
    document.getElementById('ts-chat-panel').classList.add('ts-hidden');
  }

  // ── Message rendering ─────────────────────────────────────────────────────
  function addBotMessage(html, ctaHref) {
    const msgs = document.getElementById('ts-chat-messages');
    const div = document.createElement('div');
    div.className = 'ts-msg ts-msg-bot';
    div.innerHTML = html;
    if (ctaHref) {
      const cta = document.createElement('div');
      cta.className = 'ts-msg-cta';
      cta.innerHTML = `<a href="${ctaHref}" class="ts-cta-btn" target="_blank">Upload my lease →</a>`;
      div.appendChild(cta);
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
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

  // ── Send handler ──────────────────────────────────────────────────────────
  async function handleSend() {
    const input = document.getElementById('ts-chat-input');
    const sendBtn = document.getElementById('ts-chat-send');
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    addUserMessage(query);
    const typingEl = showTyping();

    // Simulate thinking delay (realistic UX)
    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

    const match = matchKB(query);
    await logQuery(query, match); // fire-and-forget

    typingEl.remove();

    if (match) {
      addBotMessage(renderMessage(match.response), UPLOAD_URL);
    } else {
      addBotMessage(
        `That's a good question — we're still building our KB answer for that specific topic.<br><br>` +
        `For a <strong>personalised answer based on your actual lease</strong>, upload it and our AI audit will flag any issues specific to your situation.`,
        UPLOAD_URL
      );
    }

    sendBtn.disabled = false;
    input.focus();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
