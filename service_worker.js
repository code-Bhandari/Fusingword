// Fusingword background service worker (MV3)
const API_THESAURUS = "https://api.datamuse.com/words";
const API_DICT = "https://api.dictionaryapi.dev/api/v2/entries/en/";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fusingword-lookup",
    title: "Fusingword: Look up \"%s\"",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fusingword-lookup" && tab && info.selectionText) {
    await openPanelWithWord(tab.id, info.selectionText.trim());
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "fusingword_lookup_selection") {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab) return;
    const [{result} = {}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => (window.getSelection ? String(window.getSelection()) : "").trim()
    });
    if (result) await openPanelWithWord(tab.id, result);
  }
});

async function openPanelWithWord(tabId, word) {
  await ensureContentInjected(tabId);
  chrome.tabs.sendMessage(tabId, {type: "FW_LOOKUP", word});
}

async function ensureContentInjected(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: {tabId},
      files: ["content.js"]
    });
    await chrome.scripting.insertCSS({
      target: {tabId},
      files: ["tooltip.css"]
    });
  } catch (e) {
    // Ignore if already injected
  }
}

// Fetch utilities exposed to content via runtime.onMessage
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "FW_FETCH") {
    (async () => {
      const data = await fetchWordData(msg.word);
      sendResponse({data});
    })();
    return true; // Keep the message channel open for async response
  }
});

async function fetchWordData(raw) {
  const word = String(raw || "").trim().split(/\s+/)[0].toLowerCase();
  if (!word) return {word, synonyms: [], meanings: []};

  const [synonyms, meanings] = await Promise.all([
    fetchSynonyms(word),
    fetchMeanings(word)
  ]);
  return {word, synonyms, meanings};
}

async function fetchSynonyms(word) {
  try {
    const res = await fetch(`${API_THESAURUS}?ml=${encodeURIComponent(word)}&max=12`);
    const json = await res.json();
    return json.map(x => x.word).filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchMeanings(word) {
  try {
    const res = await fetch(`${API_DICT}${encodeURIComponent(word)}`);
    const json = await res.json();
    // Extract up to 3 concise definitions
    const defs = [];
    for (const entry of json) {
      if (!entry?.meanings) continue;
      for (const m of entry.meanings) {
        for (const d of (m.definitions || [])) {
          if (d.definition) defs.push({ partOfSpeech: m.partOfSpeech, definition: d.definition });
          if (defs.length >= 3) break;
        }
        if (defs.length >= 3) break;
      }
      if (defs.length >= 3) break;
    }
    return defs;
  } catch {
    return [];
  }
}