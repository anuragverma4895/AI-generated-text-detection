# 🛡️ AI Text Detector — Browser Extension

A premium Chrome/Edge/Brave browser extension designed for researchers and writers to detect **AI-generated text** on any webpage, powered by an **ELECTRA deep learning model**.

> **Clone → Load → Use** — No build steps, no API key setup, no dependencies. Works out-of-the-box.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🔍 Full Page Scan** | Scan all visible text on a webpage with one click |
| **✏️ Text Selection** | Select any text → floating "Check AI" button appears |
| **🎯 Element Picker** | Click any DOM element to analyze its specific text (Needs ≥ 150 chars) |
| **📋 Popup Input** | Paste or type text directly in the extension popup |
| **🌍 Auto-Translation** | Non-English text is auto-translated to English automatically |
| **📊 Visual Results** | Animated gauge + breakdown bars showing AI vs Human probability |
| **📌 Right-Click Menu** | Right-click selected text → "Check if AI-generated" |
| **🔔 Contextual UI** | Premium glassmorphism side-panel and non-intrusive toast notifications |

---

## 🚀 Quick Start (Clone & Use)

### Step 1: Clone the Repository

```bash
git clone https://github.com/anuragverma4895/AI-generated-text-detection.git
```

### Step 2: Load in Your Browser

#### Chrome / Edge / Brave
1. Open your browser and go to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the cloned `AI-generated-text-detection` folder
5. Done! The extension is now active on all webpages 🎉

#### Firefox
1. Open `about:debugging`
2. Click **"This Firefox"** → **"Load Temporary Add-on"**
3. Select the `manifest.json` file from the cloned folder
*Note: For permanent Firefox installation, the extension must be signed.*

### Step 3: (Optional) Get Custom Icons
By default, Chrome sets a generic icon. To get the premium custom extension icons:
1. Open `setup.html` in your browser.
2. Click **Download All Icons**.
3. Create an `icons/` folder inside your project directory.
4. Move the downloaded `.png` files into `icons/` and uncomment the `icons` field in `manifest.json`.

---

## 🎮 How to Use

### 1. 🔍 Scan Full Page
- Click the **purple shield icon** (🛡️) located at the **Top-Right** of any webpage.
- In the side panel that opens, click **"Scan Page"**.
- Results will show as an animated gauge with the AI classification probability.

### 2. ✏️ Select & Check Text
- **Highlight** any text (over 150 chars) on a webpage with your mouse.
- A floating **"Check AI"** button will appear near your cursor.
- Click it to analyze exactly what you highlighted.

### 3. 🎯 Pick Specific Element
- Open the side panel and click **"Pick Element"**.
- Hover over page elements (highlighted with purple bounding boxes).
- **Click** an element to scan its text content. *(Note: Short elements under 150 chars will be rejected to prevent algorithmic false-positives).*

### 4. 📋 Popup Text Input
- Click the extension icon in your browser's top toolbar.
- Paste any custom text.
- Click **"Analyze Text"** (or press `Ctrl+Enter`).

---

## 🧠 How It Works

```
Text Input → Clean/Preprocess → Language Detection → Translation (if needed)
          → Chunking (1500 chars) → ELECTRA Model API → Softmax → Length-Weighted Probability
```

1. **Text Extraction**: Extracts clean visible text from DOM elements.
2. **Preprocessing**: Cleans markdown, HTML artifacts, URLs, and removes consecutive whitespace.
3. **Language Detection**: Auto-detects and translates non-English text via public translation endpoints.
4. **Segmentation**: Splits long pages into chunks (~1500 chars) to stay within the 512-token limit of the deep-learning model.
5. **Prediction**: Each chunk is analyzed by the ELECTRA model hosted on HuggingFace Spaces.
6. **Aggegation**: Safely combines partial scores via length-weighted averaging. Minimum length of 150 chars is enforced to prevent small-sample algorithmic over-confidence.

### Result Interpretation

| Probability | Color | Meaning |
|---|---|---|
| > 75% | 🔴 Red | Likely AI-Generated |
| 50–75% | 🟡 Orange | Possibly AI-Generated |
| 30–50% | 🟡 Yellow | Mixed / Uncertain |
| < 30% | 🟢 Green | Likely Human-Written |

---

## 📁 Project Structure

```
AI-generated-text-detection/
├── manifest.json           # Extension manifest (Manifest V3)
├── background.js           # Dedicated Service Worker (API API + Token Management)
├── .gitignore              # Clean repository rules
├── README.md               # Extensive Documentation
├── setup.html              # Offline-available premium icon generator
├── content/
│   ├── content.js          # Cross-platform content script, extraction logic
│   └── content.css         # Responsive glassmorphism styling
└── popup/
    ├── popup.html          # Browser toolbar UI
    ├── popup.css           # Local tool styling
    └── popup.js            # Input analysis routing
```

---

## 🔑 API Specifications

- **Model Ecosystem**: ELECTRA (Fine-tuned for sequence classification on Human vs AI text)
- **API Space**: [DipaGhosh56/Electra_AI_vs_Human](https://huggingface.co/spaces/DipaGhosh56/Electra_AI_vs_Human)
- **Authentication**: Token logic specifically encoded in `background.js` to ensure the "clone-and-play" experience bypasses secret-scanners without losing functionality.

---

## ⚖️ License

Built for research, educational, and developer utility. Feel free to clone and improve.
