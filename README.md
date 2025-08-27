🌐 Fusingword — Chrome Extension

Fusingword is your on-the-go word enhancer. Whether you're reading an article, coding, researching, or just surfing the web — simply highlight any word and get:

✨ 2–3 concise meanings

🔁 Alternative words (synonyms)

No more getting stuck while reading. Smoothly fuse words into your understanding.

📸 Preview

<img width="1366" height="592" alt="FW1" src="https://github.com/user-attachments/assets/5044423b-603d-4710-91df-fb4cec72884d" />


⚡ Features

✅ Select a word on any page → floating FW button pops up
✅ Right-click context menu → "Fusingword: Look up 'word'"
✅ Keyboard shortcut (Alt+W by default, customizable)
✅ Clean popup search for any word
✅ Options page: toggle light/dark theme + mini-button visibility
✅ No API key required (powered by Datamuse + Free Dictionary API)

🔧 Installation

Download the latest release
 or clone the repo:

git clone https://github.com/code-bhandari/Fusingword.git


Open Chrome and go to chrome://extensions

Enable Developer mode (top-right corner)

Click Load unpacked and select the Fusingword folder

Done ✅

🛠 Usage

Select a word → FW panel instantly shows synonyms & meanings

Right-click a word → Context menu lookup

Shortcut (Alt+W) → Opens panel for your selection

Click extension icon → Popup for quick search

Customize shortcuts at chrome://extensions/shortcuts

🌍 Tech Stack

Manifest V3 (latest Chrome extension standard)

Vanilla JS, HTML, CSS

Datamuse API → synonyms & related words

Free Dictionary API → meanings/definitions

📂 Project Structure
Fusingword/
│── manifest.json
│── service_worker.js     # Background logic
│── content.js            # Injected panel logic
│── tooltip.css           # Styling for popup/panel
│── popup.html / .js / .css
│── options.html / .js / .css
│── icons/                # Extension icons
│── README.md

📸 Screenshots (add later)

🌟 FW floating bubble

📖 Meanings & synonyms panel

⚡ Popup search UI

🧑‍💻 Contributing

Pull requests are welcome! If you’d like to add:

Antonyms support

Pronunciation audio

Multi-language dictionary

…feel free to fork and send a PR.
