const themeEl = document.getElementById("theme");
const miniBtnEl = document.getElementById("miniBtn");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("save");

async function restore() {
  const { fwOptions = { theme: "dark", miniBtn: true } } = await chrome.storage.sync.get("fwOptions");
  themeEl.value = fwOptions.theme || "dark";
  miniBtnEl.checked = fwOptions.miniBtn !== false;
}
restore();

saveBtn.addEventListener("click", async () => {
  const fwOptions = { theme: themeEl.value, miniBtn: miniBtnEl.checked };
  await chrome.storage.sync.set({ fwOptions });
  statusEl.textContent = "Saved!";
  setTimeout(() => (statusEl.textContent = ""), 1200);
});