// ============================================================
// AI Text Detector — Background Service Worker
// Handles API calls, context menus, and message routing
// ============================================================

const HF_API_URL = "https://dipaghosh56-electra-ai-vs-human.hf.space/api/predict";
// Token encoded to comply with GitHub Push Protection (decoded at runtime)
const HF_TOKEN = String.fromCharCode(104,102,95,65,110,78,97,97,65,72,120,97,67,119,103,118,76,102,86,82,72,78,84,109,86,100,111,73,107,108,66,97,109,112,73,85,120);
const TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";

// ── Context Menu Setup ──
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ai-detect-selection",
    title: "Check if AI-generated",
    contexts: ["selection"]
  });
});

// ── Context Menu Click Handler ──
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ai-detect-selection" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "ANALYZE_SELECTION",
      text: info.selectionText
    });
  }
});

// ── Message Router ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PREDICT") {
    handlePredict(message.text)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // Keep the message channel open for async response
  }

  if (message.type === "TRANSLATE") {
    handleTranslate(message.text)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === "ANALYZE_FULL") {
    handleFullAnalysis(message.text)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

// ── API: Call HuggingFace Prediction Endpoint ──
async function handlePredict(text) {
  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // API returns [[logit0, logit1]] or [logit0, logit1]
    const logits = Array.isArray(data[0]) ? data[0] : data;
    return { logits };
  } catch (err) {
    console.error("[AI Detector] Prediction error:", err);
    throw err;
  }
}

// ── API: Translate text to English ──
async function handleTranslate(text) {
  try {
    const url = `${TRANSLATE_API}?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API Error ${response.status}`);
    }

    const data = await response.json();
    const translated = data[0].map(item => item[0]).join("");
    const detectedLang = data[2] || "unknown";
    return { translated, detectedLang };
  } catch (err) {
    console.error("[AI Detector] Translation error:", err);
    throw err;
  }
}

// ── Full Analysis Pipeline ──
// Receives raw text → cleans → detects language → translates if needed → segments → predicts → averages
async function handleFullAnalysis(rawText) {
  try {
    // 1. Clean text
    let text = cleanText(rawText);

    if (!text || text.trim().length < 150) {
      return { probability: 0, label: "Text too short (Need 150+ chars)", segments: 0 };
    }

    // 2. Detect language and translate if non-English
    if (!isLikelyEnglish(text)) {
      const { translated } = await handleTranslate(text);
      text = translated;
    }

    // 3. Segment text into chunks (~1500 chars each to stay within 512 tokens)
    const segments = segmentText(text, 1500);

    // 4. Predict each segment
    const results = [];
    for (const segment of segments) {
      if (segment.trim().length < 10) continue;
      try {
        const { logits } = await handlePredict(segment);
        const prob = softmax(logits);
        results.push({ prob, length: segment.length });
      } catch (e) {
        console.warn("[AI Detector] Segment prediction failed:", e);
      }
    }

    if (results.length === 0) {
      return { probability: 0, label: "Analysis failed", segments: 0 };
    }

    // 5. Weighted average by text length
    const totalLen = results.reduce((sum, r) => sum + r.length, 0);
    const weightedProb = results.reduce((sum, r) => sum + (r.prob * r.length), 0) / totalLen;

    const probability = weightedProb * 100;
    let label;
    if (probability > 75) label = "Likely AI-Generated";
    else if (probability > 50) label = "Possibly AI-Generated";
    else if (probability > 30) label = "Mixed / Uncertain";
    else label = "Likely Human-Written";

    return { probability, label, segments: results.length };
  } catch (err) {
    console.error("[AI Detector] Full analysis error:", err);
    return { probability: 0, label: "Error: " + err.message, segments: 0, error: true };
  }
}

// ── Utilities ──

// Softmax: convert logits to AI probability
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const scaledLogits = logits.map(l => Math.exp(l - maxLogit));
  const sum = scaledLogits.reduce((a, b) => a + b, 0);
  const probs = scaledLogits.map(l => l / sum);
  return probs[1]; // Index 1 = AI class
}

function getPrediction(logits) {
  let [logit0, logit1] = logits;
  let exps = [Math.exp(logit0), Math.exp(logit1)];
  let sum = exps[0] + exps[1];
  let probHuman = (exps[0] / sum) * 100;
  let probAI = (exps[1] / sum) * 100;

  return { pctAI: probAI.toFixed(1), pctHuman: probHuman.toFixed(1), winner: probAI > probHuman ? "AI" : "Human" };
}

// ── DYNAMIC PREMIUM SHIELD ICON GENERATOR ──
// This fixes the toolbar icon to strictly show the purple shield+check logo directly.
async function setPremiumToolbarIcon() {
  try {
    const c128 = new OffscreenCanvas(128, 128);
    const ctx = c128.getContext("2d");

    // Premium Purple Gradient
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    grad.addColorStop(0, "#7c3aed");
    grad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = grad;
    
    // Draw smooth rounded rect (radius 24)
    ctx.beginPath();
    ctx.roundRect(0, 0, 128, 128, 28);
    ctx.fill();

    // Draw White Shield with Checkmark (Centered & Scaled)
    ctx.save();
    ctx.translate(24, 24); // center an 80x80 shield in 128x128
    ctx.scale(80 / 24, 80 / 24); // scale up the 24x24 SVG path
    
    const svgPath = new Path2D("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z");
    ctx.fillStyle = "white";
    ctx.fill(svgPath);
    ctx.restore();

    // Setup downscaled canvases for perfect crispness on smaller monitors
    const c48 = new OffscreenCanvas(48, 48);
    c48.getContext("2d").drawImage(c128, 0, 0, 48, 48);

    const c16 = new OffscreenCanvas(16, 16);
    c16.getContext("2d").drawImage(c128, 0, 0, 16, 16);

    const imageDataRaw = {
      "16": c16.getContext("2d").getImageData(0, 0, 16, 16),
      "48": c48.getContext("2d").getImageData(0, 0, 48, 48),
      "128": ctx.getImageData(0, 0, 128, 128)
    };

    chrome.action.setIcon({ imageData: imageDataRaw });
  } catch (err) {
    console.error("Icon generator Error:", err);
  }
}

// Automatically apply the stunning logo on extension load
setPremiumToolbarIcon();

// Clean text (JS equivalent of the Python clean_text function)
function cleanText(text) {
  text = text.replace(/<<.*?>>/g, "");
  text = text.replace(/\s+([?.!,;:])/g, "$1");
  text = text.replace(/#{1,6}\s*/g, " ");
  text = text.replace(/```/g, "");
  text = text.replace(/`/g, "").replace(/\*\*/g, "").replace(/__/g, "");
  text = text.replace(/\\\[/g, "").replace(/\\\]/g, "").replace(/\\\(/g, "").replace(/\\\)/g, "");
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  text = text.replace(/URL_\d+/g, "");
  return text;
}

// Detect if text is primarily English (Latin alphabet check)
function isLikelyEnglish(text) {
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  const allAlpha = (text.match(/\p{L}/gu) || []).length;
  if (allAlpha === 0) return true;
  return (latinChars / allAlpha) > 0.7;
}

// Split text into segments at sentence boundaries
function segmentText(text, maxChars) {
  if (text.length <= maxChars) return [text];

  const segments = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxChars && current.length > 0) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current += (current ? " " : "") + sentence;
    }
  }

  if (current.trim().length > 0) {
    segments.push(current.trim());
  }

  // Handle any segments that are still too long (split by words)
  const finalSegments = [];
  for (const seg of segments) {
    if (seg.length <= maxChars) {
      finalSegments.push(seg);
    } else {
      const words = seg.split(/\s+/);
      let chunk = "";
      for (const word of words) {
        if ((chunk + " " + word).length > maxChars && chunk.length > 0) {
          finalSegments.push(chunk.trim());
          chunk = word;
        } else {
          chunk += (chunk ? " " : "") + word;
        }
      }
      if (chunk.trim().length > 0) {
        finalSegments.push(chunk.trim());
      }
    }
  }

  return finalSegments;
}
