// ============================================
// Trackr Lens — Background Service Worker
// ============================================

const DEFAULT_API_URL = "https://trytrackr.com";

// --- Local cache for known domains ---
// Maps domain -> { inStack: boolean, toolName?: string, checkedAt: number }
const domainCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Context Menu ---

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trackr-add-to-queue",
    title: "Add to Trackr Research Queue",
    contexts: ["page", "link"],
  });
});

// --- Context Menu Click Handler ---

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "trackr-add-to-queue") return;

  const url = info.linkUrl || info.pageUrl || (tab && tab.url);
  const title = tab ? tab.title : "";

  if (!url) return;

  try {
    const { apiKey, apiUrl } = await chrome.storage.sync.get(["apiKey", "apiUrl"]);

    if (!apiKey) {
      setBadge("!", "#C0392B");
      return;
    }

    const base = apiUrl || DEFAULT_API_URL;

    const res = await fetch(`${base}/api/extension/research`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, title }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    // Show success badge
    setBadge("+1", "#000000");

    // Clear badge after 3 seconds
    setTimeout(() => {
      clearBadge();
    }, 3000);
  } catch (err) {
    console.error("[Trackr Lens] Failed to add to queue:", err);
    setBadge("ERR", "#C0392B");
    setTimeout(() => {
      clearBadge();
    }, 3000);
  }
});

// --- Badge Helpers ---

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
}

// --- Tab URL change detection for badge ---

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _tab) => {
  // Only act on URL changes for the active tab
  if (!changeInfo.url) return;

  const url = changeInfo.url;
  if (!url.startsWith("http")) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }

  const domain = getDomainFromUrl(url);
  if (!domain) return;

  // Skip known non-SaaS domains
  const skipDomains = [
    "google.com", "google.", "youtube.com", "facebook.com",
    "twitter.com", "x.com", "reddit.com", "wikipedia.org",
    "amazon.com", "ebay.com", "netflix.com", "instagram.com",
    "tiktok.com", "linkedin.com", "github.com", "stackoverflow.com",
    "medium.com", "substack.com", "localhost",
  ];
  if (skipDomains.some((d) => domain.includes(d))) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }

  // Check cache first
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) {
    if (cached.inStack) {
      chrome.action.setBadgeText({ text: "IN", tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#000000", tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
    return;
  }

  // API check
  try {
    const { apiKey, apiUrl } = await chrome.storage.sync.get(["apiKey", "apiUrl"]);
    if (!apiKey) return;

    const base = apiUrl || DEFAULT_API_URL;
    const res = await fetch(
      `${base}/api/extension/check?domain=${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return;

    const data = await res.json();

    // Update cache
    domainCache.set(domain, {
      inStack: !!data.inStack,
      toolName: data.tool?.name || null,
      checkedAt: Date.now(),
    });

    if (data.inStack) {
      chrome.action.setBadgeText({ text: "IN", tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#000000", tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch {
    // Silently fail — don't disrupt browsing
  }
});

// When active tab changes, update badge
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || !tab.url.startsWith("http")) {
      chrome.action.setBadgeText({ text: "", tabId: activeInfo.tabId });
      return;
    }

    const domain = getDomainFromUrl(tab.url);
    const cached = domainCache.get(domain);
    if (cached && cached.inStack && Date.now() - cached.checkedAt < CACHE_TTL) {
      chrome.action.setBadgeText({ text: "IN", tabId: activeInfo.tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#000000", tabId: activeInfo.tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: activeInfo.tabId });
    }
  } catch {
    // Tab may not exist
  }
});

// --- Listen for messages from content script ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "trackr-add-to-queue") {
    handleAddToQueue(message.url, message.title)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleAddToQueue(url, title) {
  const { apiKey, apiUrl } = await chrome.storage.sync.get(["apiKey", "apiUrl"]);

  if (!apiKey) {
    return { success: false, error: "Not connected" };
  }

  const base = apiUrl || DEFAULT_API_URL;

  const res = await fetch(`${base}/api/extension/research`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, title }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  setBadge("+1", "#000000");
  setTimeout(() => clearBadge(), 3000);

  return { success: true };
}

// --- Helpers ---

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
