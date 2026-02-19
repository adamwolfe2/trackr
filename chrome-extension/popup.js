// ============================================
// Trackr Lens — Popup Script
// ============================================

const DEFAULT_API_URL = "https://trytrackr.com";

// --- DOM Elements ---
const stateDisconnected = document.getElementById("state-disconnected");
const stateConnected = document.getElementById("state-connected");
const apiKeyInput = document.getElementById("api-key-input");
const connectBtn = document.getElementById("connect-btn");
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
const aiScoreNumber = document.getElementById("ai-score-number");
const aiScoreLabel = document.getElementById("ai-score-label");
const stackCountEl = document.getElementById("stack-count");
const toastEl = document.getElementById("toast");

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

// --- State Management ---

async function initialize() {
  const { apiKey } = await getStorage(["apiKey"]);

  if (apiKey) {
    showConnectedState();
  } else {
    showDisconnectedState();
  }
}

function showDisconnectedState() {
  stateDisconnected.classList.remove("hidden");
  stateConnected.classList.add("hidden");
  apiKeyInput.value = "";
  apiKeyInput.focus();
}

async function showConnectedState() {
  stateDisconnected.classList.add("hidden");
  stateConnected.classList.remove("hidden");

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (tab) {
    pageUrlEl.textContent = getDomainFromUrl(tab.url) || tab.url;
    pageTitleEl.textContent = tab.title || "";
  }

  // Fetch workspace context
  loadContext();

  // Check if current page tool is in stack
  if (tab && tab.url) {
    checkStack(getDomainFromUrl(tab.url));
  }
}

async function loadContext() {
  try {
    const data = await apiCall("GET", "/api/extension/context");
    workspaceNameEl.textContent = data.workspaceName || "Your Workspace";
    aiScoreNumber.textContent = data.aiScore != null ? `${data.aiScore}/100` : "—";
    aiScoreLabel.textContent = data.aiLabel || "";
    stackCountEl.textContent = data.stackCount != null ? `${data.stackCount} tools` : "— tools";
  } catch (err) {
    workspaceNameEl.textContent = "Unable to load";
    aiScoreNumber.textContent = "—";
    aiScoreLabel.textContent = "Connection error";
    stackCountEl.textContent = "— tools";
  }
}

async function checkStack(domain) {
  stackCheckLoading.classList.remove("hidden");
  stackIn.classList.add("hidden");
  stackOut.classList.add("hidden");

  if (!domain) {
    stackCheckLoading.classList.add("hidden");
    stackOut.classList.remove("hidden");
    return;
  }

  try {
    const data = await apiCall("GET", `/api/extension/check?domain=${encodeURIComponent(domain)}`);
    stackCheckLoading.classList.add("hidden");

    if (data.inStack && data.tool) {
      stackToolName.textContent = data.tool.name;
      stackToolStatus.textContent = data.tool.status || "Active";
      stackToolCost.textContent = formatCost(data.tool.monthlyCost);
      stackIn.classList.remove("hidden");
    } else {
      stackOut.classList.remove("hidden");
    }
  } catch (err) {
    stackCheckLoading.classList.add("hidden");
    stackOut.classList.remove("hidden");
  }
}

// --- Event Handlers ---

connectBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showToast("Please enter an API key", "error");
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
  } catch (err) {
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
    showToast("Added to research queue");
  } catch (err) {
    showToast("Failed to add to queue", "error");
  } finally {
    addQueueBtn.disabled = false;
    addQueueBtn.textContent = "ADD TO QUEUE";
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
  } catch (err) {
    showToast("Failed to add to queue", "error");
  } finally {
    researchBtn.disabled = false;
    researchBtn.textContent = "RESEARCH THIS TOOL";
  }
});

// --- Init ---
initialize();
