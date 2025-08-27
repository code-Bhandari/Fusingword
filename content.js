// Injected into pages to show a floating panel for Fusingword
(() => {
  if (window.__fusingwordInjected) return;
  window.__fusingwordInjected = true;

  const PANEL_ID = "fusingword-panel";
  const BUTTON_ID = "fusingword-mini-btn";

  let panel, btn;

  function createMiniButton() {
    if (document.getElementById(BUTTON_ID)) return;
    btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.textContent = "FW";
    btn.title = "Fusingword";
    btn.addEventListener("click", () => {
      const selection = String(window.getSelection?.() || "").trim();
      const word = selection || prompt("Fusingword — Enter a word to look up:");
      if (word) lookup(word);
    });
    document.documentElement.appendChild(btn);
  }

  function ensurePanel() {
    panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="fw-header">
        <div class="fw-title">Fusingword</div>
        <div class="fw-actions">
          <input id="fw-input" type="text" placeholder="Type a word…" />
          <button id="fw-go" title="Search">Search</button>
          <button id="fw-pin" title="Pin/unpin">Pin</button>
          <button id="fw-close" title="Close">×</button>
        </div>
      </div>
      <div class="fw-body">
        <div class="fw-section">
          <div class="fw-section-title">Meanings</div>
          <ul id="fw-meanings" class="fw-list"></ul>
        </div>
        <div class="fw-section">
          <div class="fw-section-title">Alternatives</div>
          <div id="fw-synonyms" class="fw-chips"></div>
        </div>
      </div>
      <div class="fw-footer">
        <span>Tip: select a word and press <kbd>Alt</kbd>+<kbd>W</kbd></span>
      </div>
    `;
    document.documentElement.appendChild(panel);

    panel.querySelector("#fw-close").addEventListener("click", () => {
      panel.classList.remove("fw-show");
    });
    panel.querySelector("#fw-go").addEventListener("click", () => {
      const v = panel.querySelector("#fw-input").value.trim();
      if (v) lookup(v);
    });
    panel.querySelector("#fw-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = e.currentTarget.value.trim();
        if (v) lookup(v);
      }
    });
    panel.querySelector("#fw-pin").addEventListener("click", () => {
      panel.classList.toggle("fw-pinned");
    });

    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    panel.querySelector(".fw-header").addEventListener("mousedown", (e) => {
      if (panel.classList.contains("fw-pinned")) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      document.body.classList.add("fw-dragging");
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = Math.max(8, startLeft + dx) + "px";
      panel.style.top = Math.max(8, startTop + dy) + "px";
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
      document.body.classList.remove("fw-dragging");
    });

    return panel;
  }

  async function lookup(word) {
    ensurePanel();
    panel.classList.add("fw-show");
    panel.querySelector("#fw-input").value = word;

    // Loading states
    const meaningsEl = panel.querySelector("#fw-meanings");
    const synEl = panel.querySelector("#fw-synonyms");
    meaningsEl.innerHTML = `<li class="fw-muted">Loading meanings…</li>`;
    synEl.innerHTML = `<span class="fw-chip fw-muted">Loading…</span>`;

    try {
      const {data} = await chrome.runtime.sendMessage({type: "FW_FETCH", word});
      render(data);
    } catch (e) {
      meaningsEl.innerHTML = `<li class="fw-error">Error. Try again.</li>`;
      synEl.innerHTML = `<span class="fw-chip fw-error">Error</span>`;
    }
  }

  function render(data) {
    const meaningsEl = panel.querySelector("#fw-meanings");
    const synEl = panel.querySelector("#fw-synonyms");

    // Meanings
    meaningsEl.innerHTML = "";
    if (!data.meanings?.length) {
      meaningsEl.innerHTML = `<li class="fw-muted">No meanings found.</li>`;
    } else {
      for (const m of data.meanings) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="fw-pos">${m.partOfSpeech || ""}</span> ${escapeHtml(m.definition)}`;
        meaningsEl.appendChild(li);
      }
    }

    // Synonyms
    synEl.innerHTML = "";
    if (!data.synonyms?.length) {
      const span = document.createElement("span");
      span.className = "fw-chip fw-muted";
      span.textContent = "No alternatives";
      synEl.appendChild(span);
    } else {
      data.synonyms.forEach((w) => {
        const chip = document.createElement("button");
        chip.className = "fw-chip";
        chip.textContent = w;
        chip.addEventListener("click", () => lookup(w));
        synEl.appendChild(chip);
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[ch]));
  }

  // Auto-show mini button when user selects a single word
  document.addEventListener("selectionchange", () => {
    if (!btn) createMiniButton();
    const sel = String(window.getSelection?.() || "").trim();
    if (/\s/.test(sel) || sel.length === 0) {
      btn.style.display = "none";
      return;
    }
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    btn.style.display = "block";
    btn.style.left = (window.scrollX + rect.right + 6) + "px";
    btn.style.top = (window.scrollY + rect.top - 2) + "px";
  });

  // Message from background to open with a specific word
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "FW_LOOKUP" && msg.word) {
      lookup(msg.word);
    }
  });
})();