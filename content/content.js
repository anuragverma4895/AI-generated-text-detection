// ============================================================
// AI Text Detector — Content Script (v2)
// Draggable panel, page scanning, text selection,
// element picking, premium UI
// ============================================================

(function () {
  "use strict";

  if (document.getElementById("ai-detector-root")) return;

  // ── Icons ──
  const ICONS = {
    shield: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
    scan: `<svg viewBox="0 0 24 24"><path d="M3 5v4h2V5h4V3H5C3.9 3 3 3.9 3 5zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`,
    cursor: `<svg viewBox="0 0 24 24"><path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76l-4.76 4.76c-.2.2-.51.2-.71 0l-1.41-1.41c-.2-.2-.2-.51 0-.71l4.76-4.76L3.5 12.31c-.5-.23-.71-.83-.47-1.33.1-.21.28-.39.47-.47l17-7c.42-.18.9.02 1.08.44.07.17.07.35 0 .52l-7 17c-.1.24-.28.42-.47.5z"/></svg>`
  };

  // ── Root ──
  const root = document.createElement("div");
  root.id = "ai-detector-root";
  document.body.appendChild(root);

  // ── Toggle FAB (bottom-right) ──
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "ai-detector-toggle";
  toggleBtn.innerHTML = `${ICONS.shield}<span class="toggle-badge" style="display:none"></span>`;
  toggleBtn.title = "AI Text Detector";
  root.appendChild(toggleBtn);

  // ── Toast ──
  const toast = document.createElement("div");
  toast.id = "ai-detector-toast";
  toast.innerHTML = `
    <div class="toast-icon" style="background:rgba(124,58,237,0.15)">🛡️</div>
    <div class="toast-content">
      <div class="toast-title">AI Detector Active</div>
      <div class="toast-subtitle">Click shield to scan</div>
    </div>`;
  root.appendChild(toast);

  // ── Selection Floating Button ──
  const selBtn = document.createElement("button");
  selBtn.id = "ai-detector-sel-btn";
  selBtn.innerHTML = `${ICONS.scan} Check AI`;
  root.appendChild(selBtn);

  // ── Side Panel ──
  const panel = document.createElement("div");
  panel.id = "ai-detector-panel";
  panel.innerHTML = `
    <div class="ai-panel-header" id="ai-panel-drag-handle">
      <div class="header-left">
        <div class="drag-dots"><span></span><span></span><span></span></div>
        <div class="header-icon">${ICONS.shield}</div>
        <h2>AI Detector</h2>
      </div>
      <button class="close-btn" id="ai-panel-close">✕</button>
    </div>
    <div class="ai-panel-body">
      <div class="ai-action-group">
        <button class="ai-btn primary" id="ai-scan-page">
          <span>${ICONS.scan}</span><span>Scan Page</span>
        </button>
        <button class="ai-btn" id="ai-pick-element">
          <span>${ICONS.cursor}</span><span>Pick Element</span>
        </button>
      </div>

      <div class="ai-selection-info" id="ai-selection-info">
        <strong>📌 Selected:</strong> <span id="ai-selection-preview"></span>
      </div>

      <div class="ai-result-card" id="ai-result-card">
        <div class="ai-result-label">Detection Result</div>
        <div class="ai-gauge-container">
          <div class="ai-gauge-ring">
            <svg viewBox="0 0 130 130">
              <circle class="gauge-bg" cx="65" cy="65" r="60"/>
              <circle class="gauge-fill" id="ai-gauge-fill" cx="65" cy="65" r="60"/>
            </svg>
            <div class="ai-gauge-value">
              <span class="percentage" id="ai-percentage">—</span>
              <span class="unit">%</span>
            </div>
          </div>
          <div class="ai-gauge-label" id="ai-gauge-label">Ready to scan</div>
        </div>

        <div class="ai-status" id="ai-status"></div>

        <div class="ai-breakdown" id="ai-breakdown" style="display:none">
          <div class="ai-breakdown-title">📊 Confidence Breakdown</div>
          <div class="ai-bar-group">
            <div class="ai-bar-item">
              <span class="bar-label">🤖 AI</span>
              <div class="ai-bar-track"><div class="ai-bar-fill ai-fill" id="ai-bar-ai"></div></div>
              <span class="bar-value" id="ai-bar-ai-val">0%</span>
            </div>
            <div class="ai-bar-item">
              <span class="bar-label">✍️ Human</span>
              <div class="ai-bar-track"><div class="ai-bar-fill human-fill" id="ai-bar-human"></div></div>
              <span class="bar-value" id="ai-bar-human-val">0%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-divider"></div>
      <div class="ai-segment-info" id="ai-segment-info"></div>
    </div>`;
  root.appendChild(panel);

  // ── State ──
  let isPanelOpen = false;
  let isPickingElement = false;
  let highlightOverlay = null;
  let currentlySelected = null;

  // ── DOM Refs ──
  const $ = (sel) => panel.querySelector(sel);
  const els = {
    closeBtn: $("#ai-panel-close"),
    scanBtn: $("#ai-scan-page"),
    pickBtn: $("#ai-pick-element"),
    percentage: $("#ai-percentage"),
    gaugeFill: $("#ai-gauge-fill"),
    gaugeLabel: $("#ai-gauge-label"),
    status: $("#ai-status"),
    breakdown: $("#ai-breakdown"),
    barAi: $("#ai-bar-ai"),
    barHuman: $("#ai-bar-human"),
    barAiVal: $("#ai-bar-ai-val"),
    barHumanVal: $("#ai-bar-human-val"),
    selectionInfo: $("#ai-selection-info"),
    selectionPreview: $("#ai-selection-preview"),
    segmentInfo: $("#ai-segment-info"),
    resultCard: $("#ai-result-card"),
    dragHandle: panel.querySelector("#ai-panel-drag-handle")
  };

  // ════════════════════════════════════════════
  //  DRAG LOGIC — panel is fully draggable
  // ════════════════════════════════════════════
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  els.dragHandle.addEventListener("mousedown", (e) => {
    if (e.target.closest(".close-btn")) return;
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    panel.style.transition = "none";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;

    // Clamp inside viewport
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    newX = Math.max(0, Math.min(newX, window.innerWidth - w));
    newY = Math.max(0, Math.min(newY, window.innerHeight - h));

    panel.style.left = newX + "px";
    panel.style.top = newY + "px";
    panel.style.right = "auto";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      panel.style.transition = "";
      document.body.style.userSelect = "";
    }
  });

  // ── Panel Toggle ──
  function openPanel() {
    isPanelOpen = true;
    panel.classList.add("open");
    toggleBtn.style.display = "none";
  }

  function closePanel() {
    isPanelOpen = false;
    panel.classList.remove("open");
    toggleBtn.style.display = "flex";
    stopPicking();
    // Reset position for next open
    panel.style.left = "";
    panel.style.right = "20px";
    panel.style.top = "85px";
  }

  toggleBtn.addEventListener("click", openPanel);
  els.closeBtn.addEventListener("click", closePanel);

  // ── Gauge Circumference for r=60 ──
  const CIRCUMFERENCE = 2 * Math.PI * 60; // ~377

  function updateGauge(prob) {
    const pct = Math.round(prob * 100) / 100;
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

    let color;
    if (pct > 75) color = "#ef4444";
    else if (pct > 50) color = "#f59e0b";
    else if (pct > 30) color = "#eab308";
    else color = "#22c55e";

    els.gaugeFill.style.strokeDashoffset = offset;
    els.gaugeFill.style.stroke = color;
    els.percentage.textContent = pct.toFixed(1);
    els.percentage.style.color = color;

    els.breakdown.style.display = "block";
    els.barAi.style.width = pct + "%";
    els.barHuman.style.width = (100 - pct) + "%";
    els.barAiVal.textContent = pct.toFixed(1) + "%";
    els.barAiVal.style.color = color;
    els.barHumanVal.textContent = (100 - pct).toFixed(1) + "%";
    els.barHumanVal.style.color = "#22c55e";

    let label;
    if (pct > 75) label = "🤖 Likely AI-Generated";
    else if (pct > 50) label = "⚠️ Possibly AI-Generated";
    else if (pct > 30) label = "🤔 Mixed / Uncertain";
    else label = "✍️ Likely Human-Written";
    els.gaugeLabel.textContent = label;
    els.gaugeLabel.style.color = color;

    els.resultCard.classList.add("has-result");

    const badge = toggleBtn.querySelector(".toggle-badge");
    badge.style.display = "block";
    badge.style.background = color;
  }

  function resetGauge() {
    els.gaugeFill.style.strokeDashoffset = CIRCUMFERENCE;
    els.gaugeFill.style.stroke = "rgba(255,255,255,0.06)";
    els.percentage.textContent = "—";
    els.percentage.style.color = "#64748b";
    els.gaugeLabel.textContent = "Ready to scan";
    els.gaugeLabel.style.color = "#64748b";
    els.breakdown.style.display = "none";
    els.segmentInfo.textContent = "";
    els.resultCard.classList.remove("has-result");
    toggleBtn.querySelector(".toggle-badge").style.display = "none";
  }

  function setStatus(text, isScanning) {
    els.status.textContent = text;
    els.status.className = "ai-status" + (isScanning ? " scanning" : "");
  }

  function setLoading(loading) {
    els.scanBtn.disabled = loading;
    els.pickBtn.disabled = loading;
    if (loading) {
      els.scanBtn.innerHTML = `<span class="ai-spinner"></span><span>Scanning…</span>`;
    } else {
      els.scanBtn.innerHTML = `<span>${ICONS.scan}</span><span>Scan Page</span>`;
    }
  }

  // ── Text Extraction ──
  function extractPageText() {
    const selectors = "p, article, main, section, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre";
    const elements = document.querySelectorAll(selectors);
    const seen = new Set();
    const texts = [];

    for (const el of elements) {
      if (el.closest("#ai-detector-root")) continue;
      if (el.offsetHeight === 0 && el.offsetWidth === 0) continue;
      const text = getDirectText(el).trim();
      if (text.length > 20 && !seen.has(text)) {
        seen.add(text);
        texts.push(text);
      }
    }
    return texts.join("\n\n");
  }

  function getDirectText(element) {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    }
    return text;
  }

  // ── Analysis ──
  async function analyzeText(text, source) {
    if (!text || text.trim().length < 150) {
      setStatus("Text too short (Need 150+ chars for accuracy)", false);
      return;
    }

    setLoading(true);
    resetGauge();
    setStatus("Analyzing " + source + "…", true);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ANALYZE_FULL",
        text: text
      });

      if (response.error) {
        setStatus("Error: " + (response.label || response.error), false);
        return;
      }

      updateGauge(response.probability);
      els.segmentInfo.textContent = "📝 Analyzed " + response.segments + " segment" + (response.segments !== 1 ? "s" : "");
      setStatus("", false);
      showToast(response.probability, source);
    } catch (err) {
      setStatus("Error: " + err.message, false);
    } finally {
      setLoading(false);
    }
  }

  // ── Scan Page ──
  els.scanBtn.addEventListener("click", () => {
    analyzeText(extractPageText(), "full page");
  });

  // ── Element Picker ──
  function startPicking() {
    isPickingElement = true;
    els.pickBtn.classList.add("active");
    els.pickBtn.innerHTML = `<span>✕</span><span>Cancel</span>`;
    document.body.style.cursor = "crosshair";

    highlightOverlay = document.createElement("div");
    highlightOverlay.className = "ai-highlight-overlay";
    document.body.appendChild(highlightOverlay);

    document.addEventListener("mousemove", onPickMove, true);
    document.addEventListener("click", onPickClick, true);
    document.addEventListener("keydown", onPickEsc, true);
  }

  function stopPicking() {
    isPickingElement = false;
    els.pickBtn.classList.remove("active");
    els.pickBtn.innerHTML = `<span>${ICONS.cursor}</span><span>Pick Element</span>`;
    document.body.style.cursor = "";

    if (highlightOverlay) { highlightOverlay.remove(); highlightOverlay = null; }
    if (currentlySelected) { currentlySelected.classList.remove("ai-selected-element"); currentlySelected = null; }

    document.removeEventListener("mousemove", onPickMove, true);
    document.removeEventListener("click", onPickClick, true);
    document.removeEventListener("keydown", onPickEsc, true);
  }

  function onPickMove(e) {
    if (!isPickingElement || !highlightOverlay) return;
    const t = e.target;
    if (t.closest("#ai-detector-root")) return;
    const r = t.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      left: (r.left + window.scrollX) + "px",
      top: (r.top + window.scrollY) + "px",
      width: r.width + "px",
      height: r.height + "px"
    });
  }

  function onPickClick(e) {
    if (!isPickingElement) return;
    if (e.target.closest("#ai-detector-root")) return;
    e.preventDefault();
    e.stopPropagation();

    if (currentlySelected) currentlySelected.classList.remove("ai-selected-element");
    currentlySelected = e.target;
    e.target.classList.add("ai-selected-element");

    const text = (e.target.innerText || e.target.textContent || "").trim();
    els.selectionInfo.classList.add("visible");
    els.selectionPreview.textContent = text.substring(0, 100) + (text.length > 100 ? "…" : "");

    stopPicking();
    analyzeText(text, "selected element");
  }

  function onPickEsc(e) { if (e.key === "Escape") stopPicking(); }

  els.pickBtn.addEventListener("click", () => {
    isPickingElement ? stopPicking() : startPicking();
  });

  // ── Text Selection Handler ──
  let selTimeout = null;
  document.addEventListener("mouseup", (e) => {
    if (e.target.closest("#ai-detector-root")) return;
    clearTimeout(selTimeout);
    selTimeout = setTimeout(() => {
      const sel = window.getSelection();
      const text = (sel.toString() || "").trim();
      if (text.length > 20) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        selBtn.style.display = "flex";
        selBtn.style.left = (rect.left + window.scrollX) + "px";
        selBtn.style.top = (rect.bottom + window.scrollY + 8) + "px";
        selBtn.onclick = (ev) => {
          ev.stopPropagation();
          selBtn.style.display = "none";
          openPanel();
          els.selectionInfo.classList.add("visible");
          els.selectionPreview.textContent = text.substring(0, 100) + (text.length > 100 ? "…" : "");
          analyzeText(text, "selected text");
        };
      } else {
        selBtn.style.display = "none";
      }
    }, 300);
  });

  document.addEventListener("mousedown", (e) => {
    if (e.target !== selBtn && !selBtn.contains(e.target)) selBtn.style.display = "none";
  });

  // ── Toast ──
  let toastTimer = null;
  function showToast(probability, source) {
    clearTimeout(toastTimer);
    const p = probability.toFixed(1);
    let icon, title, bg;
    if (probability > 75) { icon = "🤖"; title = p + "% AI-Generated"; bg = "rgba(239,68,68,0.12)"; }
    else if (probability > 50) { icon = "⚠️"; title = p + "% Possibly AI"; bg = "rgba(245,158,11,0.12)"; }
    else if (probability > 30) { icon = "🤔"; title = p + "% Uncertain"; bg = "rgba(234,179,8,0.12)"; }
    else { icon = "✅"; title = p + "% Human"; bg = "rgba(34,197,94,0.12)"; }

    toast.querySelector(".toast-icon").textContent = icon;
    toast.querySelector(".toast-icon").style.background = bg;
    toast.querySelector(".toast-title").textContent = title;
    toast.querySelector(".toast-subtitle").textContent = source;
    toast.classList.add("visible");
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 4500);
  }

  // ── Messages from background (context menu) ──
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "ANALYZE_SELECTION") {
      openPanel();
      els.selectionInfo.classList.add("visible");
      els.selectionPreview.textContent = msg.text.substring(0, 100) + (msg.text.length > 100 ? "…" : "");
      analyzeText(msg.text, "selected text");
    }
  });

  // ── Initial toast ──
  setTimeout(() => {
    if ((document.body.innerText || "").trim().length > 200) {
      toast.querySelector(".toast-icon").textContent = "🛡️";
      toast.querySelector(".toast-icon").style.background = "rgba(124,58,237,0.12)";
      toast.querySelector(".toast-title").textContent = "AI Detector Active";
      toast.querySelector(".toast-subtitle").textContent = "Click the shield to scan";
      toast.classList.add("visible");
      setTimeout(() => toast.classList.remove("visible"), 3000);
    }
  }, 1800);

})();
