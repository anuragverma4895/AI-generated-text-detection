# 🛡️ AI Text Detector — Browser Extension

A powerful Chrome/Edge/Brave browser extension that detects **AI-generated text** on any webpage using the **ELECTRA deep learning model** deployed on Hugging Face Spaces.

> **Clone → Load → Use** — No build steps, no API key setup, no dependencies. Works out of the box.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🔍 Full Page Scan** | Scan all visible text on a webpage with one click |
| **✏️ Text Selection** | Select any text → floating "Check AI" button appears |
| **🎯 Element Picker** | Click any DOM element to analyze its specific text |
| **📋 Popup Input** | Paste or type text directly in the extension popup |
| **🌍 Auto-Translation** | Non-English text is auto-translated before analysis |
| **📊 Visual Results** | Animated gauge + breakdown bars showing AI vs Human probability |
| **📌 Right-Click Menu** | Right-click selected text → "Check if AI-generated" |
| **🔔 Toast Notifications** | Non-intrusive toast alerts with scan results |

---

## 🚀 Quick Start (Clone & Use)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-generated-text-detection.git
```

### Step 2: (Optional) Generate Custom Icons

1. Open `generate-icons.html` in your browser
2. Click **"Download All Icons"**
3. Create an `icons/` folder in the project root
4. Move the downloaded `icon16.png`, `icon48.png`, `icon128.png` into `icons/`

> **Note:** The extension works perfectly without custom icons. Chrome will use a default icon.

### Step 3: Load in Your Browser

#### Chrome / Edge / Brave
1. Open your browser and go to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the cloned `AI-generated-text-detection` folder
5. Done! The extension icon appears in your toolbar 🎉

#### Firefox
1. Open `about:debugging`
2. Click **"This Firefox"** → **"Load Temporary Add-on"**
3. Select the `manifest.json` file from the cloned folder
4. The extension is loaded (temporary until Firefox restart)

> **Note**: For permanent Firefox installation, the extension needs to be signed through [addons.mozilla.org](https://addons.mozilla.org).

---

## 🎮 How to Use

### 1. 🔍 Scan Full Page
- Click the **purple shield icon** (🛡️) on the bottom-right of any webpage
- In the side panel, click **"Scan Page"**
- Wait for the analysis to complete
- Results show as an animated gauge with AI probability percentage

### 2. ✏️ Select & Check Text
- **Highlight** any text on a webpage with your mouse
- A floating **"Check AI"** button appears near your selection
- Click it to analyze just that text
- Or: **Right-click** → **"Check if AI-generated"**

### 3. 🎯 Pick Specific Element
- Open the side panel → click **"Pick Element"**
- Hover over page elements (they'll be highlighted with purple dashes)
- **Click** an element to scan its content
- Press **Escape** to cancel

### 4. 📋 Popup Text Input
- Click the extension icon in the browser toolbar
- Paste or type any text in the input box
- Click **"Analyze Text"** (or press **Ctrl+Enter**)
- View detailed results with AI vs Human breakdown

---

## 🧠 How It Works

```
Text Input → Clean/Preprocess → Language Detection → Translation (if needed)
          → Segment (≤512 tokens) → ELECTRA Model API → Softmax → Probability
```

1. **Text Extraction**: Extracts visible text from the DOM
2. **Preprocessing**: Cleans markdown, HTML artifacts, URLs, and extra whitespace
3. **Language Detection**: Checks if text is primarily English (Latin character ratio)
4. **Translation**: Auto-translates non-English text via Google Translate
5. **Segmentation**: Splits long text into ~1500 char chunks (staying under 512 tokens)
6. **Prediction**: Each segment is sent to the ELECTRA model on HuggingFace
7. **Aggregation**: Results are weighted-averaged by segment length
8. **Display**: Probability shown as animated gauge with color coding

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
├── background.js           # Service worker (API calls, message routing)
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── generate-icons.html     # Icon generator utility (optional)
├── content/
│   ├── content.js          # Content script (side panel, scanning, UI)
│   └── content.css         # Panel styling (glassmorphism dark theme)
├── popup/
│   ├── popup.html          # Extension popup structure
│   ├── popup.css           # Popup styling
│   └── popup.js            # Popup logic
└── icons/                  # (Optional) Generated icons
    ├── icon16.png           # 16×16 toolbar icon
    ├── icon48.png           # 48×48 extension page icon
    └── icon128.png          # 128×128 store icon
```

---

## 🔑 API Details

- **Model**: ELECTRA (fine-tuned for AI text detection)
- **Space**: [DipaGhosh56/Electra_AI_vs_Human](https://huggingface.co/spaces/DipaGhosh56/Electra_AI_vs_Human)
- **Endpoint**: `POST /api/predict`
- **Auth**: Bearer token (pre-configured in `background.js`)

---

## ⚙️ Browser Compatibility

| Browser | Version | Support |
|---|---|---|
| Google Chrome | 88+ | ✅ Full |
| Microsoft Edge | 88+ | ✅ Full |
| Brave | 1.20+ | ✅ Full |
| Opera | 74+ | ✅ Full |
| Vivaldi | 3.6+ | ✅ Full |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This extension is for educational and personal use. The AI model is hosted on Hugging Face Spaces.

---

Built with ❤️ using ELECTRA Model & Hugging Face Spaces
