const API_THESAURUS = "https://api.datamuse.com/words";
const API_DICT = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const wordInput = document.getElementById("word");
const searchBtn = document.getElementById("search");
const meaningsEl = document.getElementById("meanings");
const synEl = document.getElementById("synonyms");

searchBtn.addEventListener("click", () => doSearch());
wordInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

async function doSearch() {
  const word = wordInput.value.trim();
  if (!word) return;
  meaningsEl.innerHTML = `<li class="muted">Loading meanings…</li>`;
  synEl.innerHTML = `<button class="muted">Loading…</button>`;

  const [synonyms, meanings] = await Promise.all([
    fetchSynonyms(word),
    fetchMeanings(word)
  ]);

  renderMeanings(meanings);
  renderSynonyms(synonyms);
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

function renderMeanings(list) {
  meaningsEl.innerHTML = "";
  if (!list.length) {
    meaningsEl.innerHTML = `<li class="muted">No meanings found.</li>`;
    return;
  }
  for (const m of list) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${m.partOfSpeech || ""}</strong> ${escapeHtml(m.definition)}`;
    meaningsEl.appendChild(li);
  }
}

function renderSynonyms(list) {
  synEl.innerHTML = "";
  if (!list.length) {
    const b = document.createElement("button");
    b.className = "muted";
    b.textContent = "No alternatives";
    synEl.appendChild(b);
    return;
  }
  for (const w of list) {
    const btn = document.createElement("button");
    btn.textContent = w;
    btn.addEventListener("click", () => {
      wordInput.value = w;
      doSearch();
    });
    synEl.appendChild(btn);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));
}