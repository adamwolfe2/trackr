// ============================================
// Trackr Lens — Content Script
// Shadow DOM encapsulated widget
// ============================================

(function () {
  "use strict";

  const DEFAULT_API_URL = "https://trytrackr.com";
  const WIDGET_ID = "trackr-lens-widget";

  // Prevent double-injection
  if (document.getElementById(WIDGET_ID)) return;

  // --- SaaS Detection ---

  function detectSaaS() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();

    // Skip non-http pages
    if (!url.startsWith("http")) return false;

    // Skip Trackr's own domain
    if (hostname.includes("trytrackr.com")) return false;

    // Skip common non-SaaS sites
    const skipDomains = [
      "google.com", "google.", "youtube.com", "facebook.com",
      "twitter.com", "x.com", "reddit.com", "wikipedia.org",
      "amazon.com", "ebay.com", "netflix.com", "instagram.com",
      "tiktok.com", "linkedin.com", "github.com", "stackoverflow.com",
      "medium.com", "substack.com", "localhost",
      "chrome.", "about:", "extensions",
    ];
    if (skipDomains.some((d) => hostname.includes(d))) return false;

    // URL patterns that strongly signal SaaS
    const saasUrlPatterns = [
      "/pricing", "/features", "/integrations", "/enterprise",
      "/product", "/solutions", "/platform", "/demo",
      "/request-demo", "/free-trial", "/signup", "/sign-up",
    ];
    if (saasUrlPatterns.some((p) => url.includes(p))) return true;

    // Check meta tags
    const metaContent = getMetaContent();
    const saasKeywords = [
      "saas", "software as a service", "platform", "automation",
      "crm", "erp", "analytics", "dashboard", "workflow",
      "collaboration", "productivity", "cloud", "api",
      "subscription", "free trial", "sign up free",
      "project management", "ai-powered", "ai powered",
      "no-code", "low-code", "devops", "data platform",
    ];

    const matchCount = saasKeywords.filter((kw) => metaContent.includes(kw)).length;
    return matchCount >= 2; // Require at least 2 keyword matches
  }

  function getMetaContent() {
    const metas = document.querySelectorAll(
      'meta[name="description"], meta[name="keywords"], meta[property="og:description"], meta[property="og:title"], meta[name="application-name"]'
    );
    let content = " " + document.title.toLowerCase();
    metas.forEach((m) => {
      content += " " + (m.getAttribute("content") || "");
    });
    return content.toLowerCase();
  }

  function guessToolName() {
    // Try og:site_name first
    const siteName = document.querySelector('meta[property="og:site_name"]');
    if (siteName && siteName.getAttribute("content")) {
      return siteName.getAttribute("content").trim();
    }

    // Try application-name
    const appName = document.querySelector('meta[name="application-name"]');
    if (appName && appName.getAttribute("content")) {
      return appName.getAttribute("content").trim();
    }

    // Try the last part of the title (usually the brand)
    const title = document.title || "";
    const parts = title.split(/[|\-\u2013\u2014]/);
    if (parts.length > 1) {
      const last = parts[parts.length - 1].trim();
      if (last.length > 1 && last.length < 40) return last;
    }
    if (parts[0].trim().length > 1 && parts[0].trim().length < 40) {
      return parts[0].trim();
    }

    // Fallback to hostname
    return window.location.hostname.replace(/^www\./, "").split(".")[0];
  }

  function getDomain() {
    return window.location.hostname.replace(/^www\./, "");
  }

  // --- API Helpers ---

  async function getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["apiKey", "apiUrl"], resolve);
    });
  }

  async function apiCall(method, endpoint, body = null) {
    const { apiKey, apiUrl } = await getConfig();
    if (!apiKey) return null;

    const base = apiUrl || DEFAULT_API_URL;
    const opts = {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${base}${endpoint}`, opts);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  // --- Widget Styles (injected into Shadow DOM) ---

  const WIDGET_STYLES = `
    :host {
      all: initial;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: "Geist Mono", "SF Mono", "Fira Code", "Cascadia Code", monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #000000;
      -webkit-font-smoothing: antialiased;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .hidden { display: none !important; }

    /* ---- Animations ---- */

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ---- Expanded Bar ---- */

    .bar {
      width: 250px;
      background: #F3F3EF;
      border: 2px solid #000000;
      box-shadow: 4px 4px 0 #000000;
      overflow: hidden;
      animation: slideUp 0.25s ease-out;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 2px solid #000000;
      cursor: default;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      flex: 1;
    }

    .minimize-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: transparent;
      border: 1.5px solid #000000;
      color: #000000;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }

    .minimize-btn:hover {
      background: #000000;
      color: #F3F3EF;
    }

    /* ---- Body ---- */

    .body {
      padding: 12px;
    }

    .tool-name {
      font-family: "Newsreader", "Georgia", serif;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tool-domain {
      font-size: 10px;
      color: #999999;
      margin-bottom: 8px;
    }

    .stack-status {
      font-size: 11px;
      color: #666666;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .stack-status.in-stack {
      color: #000000;
      font-weight: 600;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: #D0D0CC;
      flex-shrink: 0;
    }

    .status-dot.active {
      background: #000000;
    }

    .status-dot.loading {
      animation: pulse 1.2s ease-in-out infinite;
    }

    .cost-line {
      font-size: 10px;
      color: #999999;
      margin-bottom: 10px;
    }

    .cost-line strong {
      color: #000000;
      font-weight: 600;
    }

    .action-btn {
      display: block;
      width: 100%;
      padding: 8px 12px;
      background: #000000;
      color: #F3F3EF;
      border: 2px solid #000000;
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: box-shadow 0.15s, transform 0.15s;
      text-align: center;
    }

    .action-btn:hover:not(:disabled) {
      box-shadow: 2px 2px 0 #000000;
      transform: translate(-1px, -1px);
    }

    .action-btn:active:not(:disabled) {
      box-shadow: none;
      transform: translate(0, 0);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-btn.success {
      background: #F3F3EF;
      color: #000000;
    }

    .action-btn.secondary {
      background: #F3F3EF;
      color: #000000;
      margin-top: 6px;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: #000000;
      color: #F3F3EF;
    }

    /* ---- Collapsed Pill ---- */

    .pill {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #000000;
      border: 2px solid #000000;
      color: #F3F3EF;
      cursor: pointer;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
      margin-left: auto;
      transition: box-shadow 0.15s, transform 0.15s;
      animation: fadeIn 0.2s ease-out;
    }

    .pill:hover {
      box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
      transform: translate(-1px, -1px);
    }

    /* ---- Toast ---- */

    .toast {
      position: absolute;
      bottom: calc(100% + 8px);
      right: 0;
      width: 250px;
      padding: 8px 12px;
      background: #F3F3EF;
      border: 2px solid #000000;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      animation: slideUp 0.2s ease-out;
      pointer-events: none;
    }

    .toast.error {
      color: #C0392B;
      border-color: #C0392B;
    }
  `;

  // --- Logo SVG ---

  const LOGO_SVG_DARK = '<svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M8 28L14 4H18L12 28H8Z" fill="#000"/><path d="M14 28L20 4H24L18 28H14Z" fill="#000"/><path d="M20 28L26 4H30L24 28H20Z" fill="#000"/></svg>';
  const LOGO_SVG_LIGHT = '<svg width="14" height="14" viewBox="0 0 32 32" fill="none"><path d="M8 28L14 4H18L12 28H8Z" fill="#F3F3EF"/><path d="M14 28L20 4H24L18 28H14Z" fill="#F3F3EF"/><path d="M20 28L26 4H30L24 28H20Z" fill="#F3F3EF"/></svg>';

  const MINIMIZE_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>';

  // --- Widget ---

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function createWidget(toolName) {
    const host = document.createElement("div");
    host.id = WIDGET_ID;
    const shadow = host.attachShadow({ mode: "closed" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = WIDGET_STYLES;
    shadow.appendChild(style);

    // Build DOM
    const domain = getDomain();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="bar" id="bar">
        <div class="header">
          <span class="logo">${LOGO_SVG_DARK}</span>
          <span class="title">Trackr Lens</span>
          <button class="minimize-btn" id="minimize-btn" title="Minimize">${MINIMIZE_SVG}</button>
        </div>
        <div class="body">
          <div class="tool-name">${escapeHtml(toolName)}</div>
          <div class="tool-domain">${escapeHtml(domain)}</div>
          <div class="stack-status" id="stack-status">
            <span class="status-dot loading"></span>
            <span>Checking stack...</span>
          </div>
          <div class="cost-line hidden" id="cost-line"></div>
          <button class="action-btn" id="add-btn">Add to Queue</button>
        </div>
      </div>
      <div class="pill hidden" id="pill" title="Trackr Lens">${LOGO_SVG_LIGHT}</div>
    `;
    shadow.appendChild(wrapper);

    document.body.appendChild(host);

    // --- Element references ---
    const bar = shadow.getElementById("bar");
    const pill = shadow.getElementById("pill");
    const minimizeBtn = shadow.getElementById("minimize-btn");
    const addBtn = shadow.getElementById("add-btn");
    const stackStatus = shadow.getElementById("stack-status");
    const costLine = shadow.getElementById("cost-line");

    // --- Toast helper ---
    let toastTimer = null;
    function showToast(message, isError = false) {
      // Remove existing toast
      const existing = shadow.querySelector(".toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.className = `toast${isError ? " error" : ""}`;
      toast.textContent = message;
      wrapper.appendChild(toast);

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.remove(), 2500);
    }

    // --- Minimize / Expand ---
    minimizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      bar.classList.add("hidden");
      pill.classList.remove("hidden");
    });

    pill.addEventListener("click", () => {
      pill.classList.add("hidden");
      bar.classList.remove("hidden");
    });

    // --- Add to Queue ---
    addBtn.addEventListener("click", async () => {
      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: "trackr-add-to-queue",
            url: window.location.href,
            title: document.title || "",
          },
          (response) => resolve(response || { success: false })
        );
      });

      if (result.success) {
        addBtn.textContent = "Added";
        addBtn.classList.add("success");
        showToast("Added to research queue");
        setTimeout(() => {
          addBtn.textContent = "Add to Queue";
          addBtn.classList.remove("success");
          addBtn.disabled = false;
        }, 2500);
      } else {
        showToast("Failed to add", true);
        setTimeout(() => {
          addBtn.textContent = "Add to Queue";
          addBtn.disabled = false;
        }, 2000);
      }
    });

    // --- Check Stack Status ---
    checkStackStatus(shadow, stackStatus, costLine, addBtn);
  }

  async function checkStackStatus(shadow, statusEl, costEl, addBtn) {
    const domain = getDomain();
    const data = await apiCall("GET", `/api/extension/check?domain=${encodeURIComponent(domain)}`);

    if (!data) {
      statusEl.innerHTML = `
        <span class="status-dot"></span>
        <span>Not in your stack</span>
      `;
      return;
    }

    if (data.inStack && data.tool) {
      statusEl.innerHTML = `
        <span class="status-dot active"></span>
        <span>In your stack · ${escapeHtml(data.tool.status || "Active")}</span>
      `;
      statusEl.classList.add("in-stack");

      if (data.tool.monthlyCost && parseFloat(data.tool.monthlyCost) > 0) {
        const cost = parseFloat(data.tool.monthlyCost);
        costEl.innerHTML = `<strong>$${cost.toLocaleString("en-US", { minimumFractionDigits: 0 })}</strong>/mo`;
        costEl.classList.remove("hidden");
      }

      // Change button to "View in Trackr" since it's already tracked
      addBtn.textContent = "View in Trackr";
      addBtn.classList.add("secondary");
      addBtn.onclick = () => {
        window.open(`${DEFAULT_API_URL}/stack`, "_blank");
      };
    } else {
      statusEl.innerHTML = `
        <span class="status-dot"></span>
        <span>Not in your stack</span>
      `;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Init ---

  async function init() {
    const { apiKey } = await getConfig();
    if (!apiKey) return;

    if (!detectSaaS()) return;

    const toolName = guessToolName();
    createWidget(toolName);
  }

  // Run after a small delay to not interfere with page load
  if (document.readyState === "complete") {
    setTimeout(init, 800);
  } else {
    window.addEventListener("load", () => setTimeout(init, 800));
  }
})();
