// ============================================
// Trackr Lens — Content Script
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

    // Skip Trackr's own domain
    if (hostname.includes("trytrackr.com")) return false;

    // Skip common non-SaaS sites
    const skipDomains = [
      "google.com", "youtube.com", "facebook.com", "twitter.com", "x.com",
      "reddit.com", "wikipedia.org", "amazon.com", "ebay.com", "netflix.com",
      "instagram.com", "tiktok.com", "linkedin.com", "github.com",
    ];
    if (skipDomains.some((d) => hostname.includes(d))) return false;

    // Check URL patterns
    if (url.includes("/pricing")) return true;
    if (url.includes("/features")) return true;
    if (url.includes("/integrations")) return true;
    if (url.includes("/enterprise")) return true;

    // Check meta tags
    const metaContent = getMetaContent();
    const saasKeywords = [
      "saas", "software", "platform", "tool", "automation",
      "crm", "erp", "analytics", "dashboard", "workflow",
      "collaboration", "productivity", "cloud", "api",
      "subscription", "free trial", "sign up free",
    ];

    return saasKeywords.some((kw) => metaContent.includes(kw));
  }

  function getMetaContent() {
    const metas = document.querySelectorAll(
      'meta[name="description"], meta[name="keywords"], meta[property="og:description"], meta[property="og:title"]'
    );
    let content = "";
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

    // Try the first part of the title
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

  // --- Widget ---

  function createWidget(toolName) {
    const widget = document.createElement("div");
    widget.id = WIDGET_ID;
    widget.innerHTML = `
      <div class="trackr-lens-bar" id="trackr-lens-bar">
        <div class="trackr-lens-header" id="trackr-lens-header">
          <span class="trackr-lens-logo">T</span>
          <span class="trackr-lens-title">Trackr Lens</span>
          <button class="trackr-lens-toggle" id="trackr-lens-toggle" title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
            </svg>
          </button>
        </div>
        <div class="trackr-lens-body" id="trackr-lens-body">
          <div class="trackr-lens-tool">${escapeHtml(toolName)}</div>
          <div class="trackr-lens-stack-status" id="trackr-lens-stack-status">Checking stack...</div>
          <button class="trackr-lens-btn" id="trackr-lens-add-btn">Add to Queue</button>
        </div>
      </div>
      <div class="trackr-lens-collapsed hidden" id="trackr-lens-collapsed">
        <span class="trackr-lens-logo">T</span>
      </div>
    `;

    document.body.appendChild(widget);

    // --- Widget Events ---
    const bar = document.getElementById("trackr-lens-bar");
    const collapsed = document.getElementById("trackr-lens-collapsed");
    const toggleBtn = document.getElementById("trackr-lens-toggle");
    const addBtn = document.getElementById("trackr-lens-add-btn");
    const stackStatus = document.getElementById("trackr-lens-stack-status");

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      bar.classList.add("hidden");
      collapsed.classList.remove("hidden");
    });

    collapsed.addEventListener("click", () => {
      collapsed.classList.add("hidden");
      bar.classList.remove("hidden");
    });

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
          (response) => {
            resolve(response || { success: false });
          }
        );
      });

      if (result.success) {
        addBtn.textContent = "Added";
        addBtn.classList.add("trackr-lens-btn-success");
        setTimeout(() => {
          addBtn.textContent = "Add to Queue";
          addBtn.classList.remove("trackr-lens-btn-success");
          addBtn.disabled = false;
        }, 2000);
      } else {
        addBtn.textContent = "Failed";
        setTimeout(() => {
          addBtn.textContent = "Add to Queue";
          addBtn.disabled = false;
        }, 2000);
      }
    });

    // Check stack status
    checkStackStatus(stackStatus);
  }

  async function checkStackStatus(statusEl) {
    const domain = getDomain();
    const data = await apiCall("GET", `/api/extension/check?domain=${encodeURIComponent(domain)}`);

    if (!data) {
      statusEl.textContent = "";
      statusEl.style.display = "none";
      return;
    }

    if (data.inStack && data.tool) {
      statusEl.textContent = `In your stack \u2022 ${data.tool.status || "Active"}`;
      statusEl.classList.add("trackr-lens-in-stack");
    } else {
      statusEl.textContent = "Not in your stack";
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Init ---

  async function init() {
    // Only run if connected
    const { apiKey } = await getConfig();
    if (!apiKey) return;

    // Only run on SaaS-looking pages
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
