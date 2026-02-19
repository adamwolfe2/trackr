// ============================================
// Trackr Lens — Popup Script
// ============================================

const DEFAULT_API_URL = "https://trytrackr.com";

// --- DOM Elements ---
const stateLoading = document.getElementById("state-loading");
const stateDisconnected = document.getElementById("state-disconnected");
const stateConnected = document.getElementById("state-connected");
const apiKeyInput = document.getElementById("api-key-input");
const connectBtn = document.getElementById("connect-btn");
const toggleKeyBtn = document.getElementById("toggle-key-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const workspaceNameEl = document.getElementById("workspace-name");
const pageUrlEl = document.getElementById("page-url");
const pageTitleEl = document.getElementById("page-title");
const addQueueBtn = document.getElementById("add-queue-btn");
const stackCheckLoading = document.getElementById("stack-check-loading");
const stackIn = document.getElementById("stack-in");
const stackOut = document.getElementById("stack-out");
const stackToolName = document.getElementById("stack-tool-name");
const stackToolStatus = document.getElementById("stack-tool-status");
const stackToolCost = document.getElementById("stack-tool-cost");
const researchBtn = document.getElementById("research-btn");
const addToTrackrWrapper = document.getElementById("add-to-trackr-wrapper");
const aiScoreNumber = document.getElementById("ai-score-number");
const aiScoreLabel = document.getElementById("ai-score-label");
const stackCountEl = document.getElementById("stack-count");
const toastEl = document.getElementById("toast");
const historyListEl = document.getElementById("history-list");

let currentTab = null;

// --- Helpers ---

function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(keys, resolve);
  });
}

function setStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, resolve);
  });
}

function removeStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(keys, resolve);
  });
}

function getLocalStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function setLocalStorage(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function showToast(message, type = "success") {
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type} toast-visible`;
  setTimeout(() => {
    toastEl.className = "toast hidden";
  }, 2500);
}

async function apiCall(method, endpoint, body = null) {
  const { apiKey, apiUrl } = await getStorage(["apiKey", "apiUrl"]);
  const base = apiUrl || DEFAULT_API_URL;

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${base}${endpoint}`, opts);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

function formatCost(cost) {
  if (cost === null || cost === undefined) return "$0";
  return `$${Number(cost).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// --- History Management ---

async function getHistory() {
  const { recentlyChecked } = await getLocalStorage(["recentlyChecked"]);
  return recentlyChecked || [];
}

async function addToHistory(domain, result) {
  const history = await getHistory();

  // Remove existing entry for this domain
  const filtered = history.filter((h) => h.domain !== domain);

  // Add new entry at the top
  filtered.unshift({
    domain,
    known: result.inStack || false,
    toolName: result.tool?.name || null,
    score: result.tool?.score || null,
    timestamp: Date.now(),
  });

  // Keep only last 10
  const trimmed = filtered.slice(0, 10);
  await setLocalStorage({ recentlyChecked: trimmed });
  return trimmed;
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historyListEl.innerHTML = '<div class="history-empty">No recent checks</div>';
    return;
  }

  historyListEl.innerHTML = history
    .map(
      (item) => `
    <div class="history-item ${item.known ? "known" : "unknown"}" data-domain="${item.domain}">
      <span class="history-dot ${item.known ? "known" : ""}"></span>
      <div class="history-info">
        <div class="history-domain">${item.domain}</div>
        <div class="history-meta">
          <span class="history-result">${item.known ? (item.toolName || "In stack") : "Not found"}</span>
          <span>${timeAgo(item.timestamp)}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Add click handlers to re-check
  historyListEl.querySelectorAll(".history-item").forEach((el) => {
    el.addEventListener("click", () => {
      const domain = el.getAttribute("data-domain");
      if (domain) {
        checkStack(domain);
      }
    });
  });
}

// --- State Management ---

async function initialize() {
  const { apiKey } = await getStorage(["apiKey"]);

  // Hide loading, show appropriate state
  stateLoading.classList.add("hidden");

  if (apiKey) {
    showConnectedState();
  } else {
    showDisconnectedState();
  }
}

function showDisconnectedState() {
  stateDisconnected.classList.remove("hidden");
  stateConnected.classList.add("hidden");
  stateLoading.classList.add("hidden");
  apiKeyInput.value = "";
  // Focus after a tick to ensure element is visible
  setTimeout(() => apiKeyInput.focus(), 50);
}

async function showConnectedState() {
  stateDisconnected.classList.add("hidden");
  stateConnected.classList.remove("hidden");
  stateLoading.classList.add("hidden");

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (tab) {
    const domain = getDomainFromUrl(tab.url);
    pageUrlEl.textContent = domain || tab.url;
    pageTitleEl.textContent = tab.title || "";

    // Disable add button for non-http pages
    if (!tab.url.startsWith("http")) {
      addQueueBtn.disabled = true;
      addQueueBtn.textContent = "NOT A WEBPAGE";
    }
  }

  // Load history
  const history = await getHistory();
  renderHistory(history);

  // Fetch workspace context and check stack in parallel
  loadContext();
  if (tab && tab.url && tab.url.startsWith("http")) {
    checkStack(getDomainFromUrl(tab.url));
  } else {
    stackCheckLoading.classList.add("hidden");
    stackOut.classList.remove("hidden");
    addToTrackrWrapper.classList.remove("hidden");
  }
}

async function loadContext() {
  try {
    const data = await apiCall("GET", "/api/extension/context");
    workspaceNameEl.textContent = data.workspaceName || "Your Workspace";
    aiScoreNumber.textContent = data.aiScore != null ? `${data.aiScore}/100` : "\u2014";
    aiScoreLabel.textContent = data.aiLabel || "";
    stackCountEl.textContent = data.stackCount != null ? `${data.stackCount}` : "\u2014";
  } catch {
    workspaceNameEl.textContent = "Unable to connect";
    aiScoreNumber.textContent = "\u2014";
    aiScoreLabel.textContent = "Connection error";
    stackCountEl.textContent = "\u2014";
  }
}

async function checkStack(domain) {
  stackCheckLoading.classList.remove("hidden");
  stackIn.classList.add("hidden");
  stackOut.classList.add("hidden");
  addToTrackrWrapper.classList.add("hidden");

  if (!domain) {
    stackCheckLoading.classList.add("hidden");
    stackOut.classList.remove("hidden");
    addToTrackrWrapper.classList.remove("hidden");
    return;
  }

  try {
    const data = await apiCall("GET", `/api/extension/check?domain=${encodeURIComponent(domain)}`);
    stackCheckLoading.classList.add("hidden");

    // Save to history
    const history = await addToHistory(domain, data);
    renderHistory(history);

    if (data.inStack && data.tool) {
      stackToolName.textContent = data.tool.name;
      stackToolStatus.textContent = data.tool.status || "Active";
      stackToolCost.textContent = formatCost(data.tool.monthlyCost);
      stackIn.classList.remove("hidden");

      // Show score if available
      if (data.tool.score) {
        const existingScoreRow = stackIn.querySelector(".tool-score-row");
        if (existingScoreRow) existingScoreRow.remove();

        const scoreRow = document.createElement("div");
        scoreRow.className = "tool-score-row";
        scoreRow.innerHTML = `
          <span class="tool-score-label">Score</span>
          <span class="tool-score-value">${Number(data.tool.score).toFixed(1)}/10</span>
        `;
        stackIn.querySelector(".stack-card-details").appendChild(scoreRow);
      }
    } else {
      stackOut.classList.remove("hidden");
      addToTrackrWrapper.classList.remove("hidden");
    }
  } catch {
    stackCheckLoading.classList.add("hidden");
    stackOut.classList.remove("hidden");
    addToTrackrWrapper.classList.remove("hidden");

    // Still save to history as unknown
    const history = await addToHistory(domain, { inStack: false });
    renderHistory(history);
  }
}

// --- Event Handlers ---

connectBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();

  if (!key) {
    showToast("Please enter an API key", "error");
    apiKeyInput.focus();
    return;
  }

  if (!key.startsWith("trk_")) {
    showToast("API key should start with trk_", "error");
    apiKeyInput.focus();
    return;
  }

  connectBtn.disabled = true;
  connectBtn.textContent = "CONNECTING...";

  try {
    await setStorage({ apiKey: key });

    // Verify the key works by fetching context
    const data = await apiCall("GET", "/api/extension/context");

    showToast("Connected to " + (data.workspaceName || "Trackr"));
    showConnectedState();
  } catch {
    await removeStorage(["apiKey"]);
    showToast("Invalid API key or connection error", "error");
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "CONNECT";
  }
});

apiKeyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    connectBtn.click();
  }
});

// Toggle password visibility
toggleKeyBtn.addEventListener("click", () => {
  const isPassword = apiKeyInput.type === "password";
  apiKeyInput.type = isPassword ? "text" : "password";
  toggleKeyBtn.title = isPassword ? "Hide key" : "Show key";
});

disconnectBtn.addEventListener("click", async () => {
  await removeStorage(["apiKey"]);
  showToast("Disconnected");
  showDisconnectedState();
});

addQueueBtn.addEventListener("click", async () => {
  if (!currentTab) return;

  addQueueBtn.disabled = true;
  addQueueBtn.textContent = "ADDING...";

  try {
    await apiCall("POST", "/api/extension/research", {
      url: currentTab.url,
      title: currentTab.title || "",
    });
    addQueueBtn.textContent = "ADDED";
    addQueueBtn.classList.add("btn-success");
    showToast("Added to research queue");
    setTimeout(() => {
      addQueueBtn.textContent = "ADD TO QUEUE";
      addQueueBtn.classList.remove("btn-success");
      addQueueBtn.disabled = false;
    }, 2500);
  } catch {
    showToast("Failed to add to queue", "error");
    addQueueBtn.textContent = "ADD TO QUEUE";
    addQueueBtn.disabled = false;
  }
});

researchBtn.addEventListener("click", async () => {
  if (!currentTab) return;

  researchBtn.disabled = true;
  researchBtn.textContent = "ADDING...";

  try {
    await apiCall("POST", "/api/extension/research", {
      url: currentTab.url,
      title: currentTab.title || "",
    });
    showToast("Added to research queue");
    researchBtn.textContent = "ADDED";
    setTimeout(() => {
      researchBtn.textContent = "RESEARCH THIS TOOL";
      researchBtn.disabled = false;
    }, 2500);
  } catch {
    showToast("Failed to add to queue", "error");
    researchBtn.textContent = "RESEARCH THIS TOOL";
    researchBtn.disabled = false;
  }
});

// --- Init ---
initialize();
