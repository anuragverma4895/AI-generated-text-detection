// ============================================================
// AI Text Detector — Popup Script
// Handles manual text input analysis from the extension popup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const textInput = document.getElementById("text-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const charCount = document.getElementById("char-count");
  const wordCount = document.getElementById("word-count");
  const resultSection = document.getElementById("result-section");
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const loaderText = document.getElementById("loader-text");
  const errorText = document.getElementById("error-text");

  // Gauge elements
  const gaugeFill = document.getElementById("popup-gauge-fill");
  const gaugePercent = document.getElementById("popup-percent");
  const verdict = document.getElementById("popup-verdict");
  const segments = document.getElementById("popup-segments");
  const barAi = document.getElementById("popup-bar-ai");
  const barHuman = document.getElementById("popup-bar-human");
  const barAiVal = document.getElementById("popup-bar-ai-val");
  const barHumanVal = document.getElementById("popup-bar-human-val");

  const CIRCUMFERENCE = 2 * Math.PI * 52; // ~326.7

  // ── Text Counter ──
  textInput.addEventListener("input", () => {
    const text = textInput.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCount.textContent = `${chars.toLocaleString()} characters`;
    wordCount.textContent = `${words.toLocaleString()} words`;
  });

  // ── Analyze Button ──
  analyzeBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (!text) {
      showError("Please enter some text to analyze.");
      return;
    }

    if (text.length < 20) {
      showError("Text is too short. Please enter at least 20 characters for meaningful analysis.");
      return;
    }

    await analyzeText(text);
  });

  // ── Keyboard shortcut: Ctrl+Enter ──
  textInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      analyzeBtn.click();
    }
  });

  // ── Analysis Pipeline ──
  async function analyzeText(text) {
    showLoading("Analyzing text...");
    analyzeBtn.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ANALYZE_FULL",
        text: text
      });

      if (response.error) {
        showError(response.label || response.error || "Analysis failed.");
        return;
      }

      showResult(response);
    } catch (err) {
      console.error("[AI Detector Popup] Error:", err);
      showError("Failed to connect to the analysis service. Please try again.");
    } finally {
      analyzeBtn.disabled = false;
    }
  }

  // ── Display Functions ──
  function showLoading(msg) {
    resultSection.style.display = "none";
    errorState.style.display = "none";
    loadingState.style.display = "flex";
    loaderText.textContent = msg;
  }

  function showError(msg) {
    loadingState.style.display = "none";
    resultSection.style.display = "none";
    errorState.style.display = "flex";
    errorText.textContent = msg;
  }

  function showResult(data) {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    resultSection.style.display = "block";

    const prob = Math.round(data.probability * 100) / 100;
    const offset = CIRCUMFERENCE - (prob / 100) * CIRCUMFERENCE;

    // Color based on probability
    let color;
    if (prob > 75) color = "#ef4444";
    else if (prob > 50) color = "#f59e0b";
    else if (prob > 30) color = "#eab308";
    else color = "#22c55e";

    // Animate gauge
    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = color;
    gaugePercent.textContent = prob.toFixed(1);
    gaugePercent.style.color = color;

    // Verdict
    const ICONS = {
      ai: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.15em; margin-right:4px;"><path d="M12,2a2,2 0 0,1 2,2c0,0.74 -0.4,1.39 -1,1.73V7h1a3,3 0 0,1 3,3v2h2a1,1 0 0,1 1,1v4a1,1 0 0,1 -1,1h-2v2a3,3 0 0,1 -3,3H8a3,3 0 0,1 -3,-3v-2H3a1,1 0 0,1 -1,-1v-4a1,1 0 0,1 1,-1h2v-2a3,3 0 0,1 3,-3h1V5.73C7.4,5.39 7,4.74 7,4a2,2 0 0,1 2,-2h3M15,13.5a1.5,1.5 0 0,0 -1.5,1.5a1.5,1.5 0 0,0 1.5,1.5a1.5,1.5 0 0,0 1.5,-1.5a1.5,1.5 0 0,0 -1.5,-1.5M9,13.5a1.5,1.5 0 0,0 -1.5,1.5a1.5,1.5 0 0,0 1.5,1.5a1.5,1.5 0 0,0 1.5,-1.5a1.5,1.5 0 0,0 -1.5,-1.5Z"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.15em; margin-right:4px;"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
      mixed: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.15em; margin-right:4px;"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`,
      human: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.15em; margin-right:4px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
    };
    
    let verdictText;
    if (prob > 75) verdictText = ICONS.ai + " Likely AI-Generated";
    else if (prob > 50) verdictText = ICONS.warning + " Possibly AI-Generated";
    else if (prob > 30) verdictText = ICONS.mixed + " Mixed / Uncertain";
    else verdictText = ICONS.human + " Likely Human-Written";

    verdict.innerHTML = verdictText;
    verdict.style.color = color;

    // Segments info
    segments.textContent = `Analyzed ${data.segments} segment${data.segments !== 1 ? "s" : ""} of text`;

    // Breakdown bars
    barAi.style.width = `${prob}%`;
    barHuman.style.width = `${100 - prob}%`;
    barAiVal.textContent = `${prob.toFixed(1)}%`;
    barAiVal.style.color = color;
    barHumanVal.textContent = `${(100 - prob).toFixed(1)}%`;
    barHumanVal.style.color = "#22c55e";
  }

  // ── Check API Status on Load ──
  checkAPIStatus();

  async function checkAPIStatus() {
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");
    const statusEl = document.getElementById("connection-status");

    try {
      // Quick test — send a minimal request
      const response = await chrome.runtime.sendMessage({
        type: "PREDICT",
        text: "test"
      });

      if (response.error) {
        statusDot.style.background = "#f59e0b";
        statusText.textContent = "Degraded";
        statusEl.style.background = "rgba(245, 158, 11, 0.1)";
        statusEl.style.borderColor = "rgba(245, 158, 11, 0.2)";
      }
    } catch {
      statusDot.style.background = "#ef4444";
      statusText.textContent = "Offline";
      statusEl.style.background = "rgba(239, 68, 68, 0.1)";
      statusEl.style.borderColor = "rgba(239, 68, 68, 0.2)";
    }
  }
});
