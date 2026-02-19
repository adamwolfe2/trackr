// ============================================
// Trackr Lens — Background Service Worker
// ============================================

const DEFAULT_API_URL = "https://trytrackr.com";

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
