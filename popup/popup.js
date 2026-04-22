// ============================================================
// AI Text Detector — Popup Script (v2 with PDF Upload)
// Handles text input + PDF upload analysis
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ── DOM Refs ──
  const textInput = document.getElementById("text-input");
  const analyzeBtn = document.getElementById("analyze-btn");
  const charCount = document.getElementById("char-count");
  const wordCount = document.getElementById("word-count");
  const resultSection = document.getElementById("result-section");
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const loaderText = document.getElementById("loader-text");
  const errorText = document.getElementById("error-text");
  const generateReportBtn = document.getElementById("generate-report-btn");

  let lastReportData = null;

  // Gauge elements
  const gaugeFill = document.getElementById("popup-gauge-fill");
  const gaugePercent = document.getElementById("popup-percent");
  const verdict = document.getElementById("popup-verdict");
  const segments = document.getElementById("popup-segments");
  const barAi = document.getElementById("popup-bar-ai");
  const barHuman = document.getElementById("popup-bar-human");
  const barAiVal = document.getElementById("popup-bar-ai-val");
  const barHumanVal = document.getElementById("popup-bar-human-val");

  // Tab elements
  const tabText = document.getElementById("tab-text");
  const tabPdf = document.getElementById("tab-pdf");
  const tabIndicator = document.getElementById("tab-indicator");
  const contentText = document.getElementById("content-text");
  const contentPdf = document.getElementById("content-pdf");

  // PDF elements
  const pdfUploadZone = document.getElementById("pdf-upload-zone");
  const pdfFileInput = document.getElementById("pdf-file-input");
  const pdfBrowseBtn = document.getElementById("pdf-browse-btn");
  const pdfFileInfo = document.getElementById("pdf-file-info");
  const pdfFileName = document.getElementById("pdf-file-name");
  const pdfFileSize = document.getElementById("pdf-file-size");
  const pdfRemoveBtn = document.getElementById("pdf-remove-btn");
  const pdfTextPreview = document.getElementById("pdf-text-preview");
  const pdfExtractedText = document.getElementById("pdf-extracted-text");
  const pdfCharCount = document.getElementById("pdf-char-count");

  const CIRCUMFERENCE = 2 * Math.PI * 52; // ~326.7

  let currentTab = "text";
  let extractedPdfText = "";

  // ══════════════════════════════════════════
  //  TAB SWITCHING
  // ══════════════════════════════════════════
  function switchTab(tab) {
    currentTab = tab;

    // Update tab buttons
    tabText.classList.toggle("active", tab === "text");
    tabPdf.classList.toggle("active", tab === "pdf");

    // Move indicator
    tabIndicator.classList.toggle("tab-pdf", tab === "pdf");

    // Show/hide content
    contentText.classList.toggle("active", tab === "text");
    contentPdf.classList.toggle("active", tab === "pdf");

    // Update analyze button text
    if (tab === "pdf" && extractedPdfText) {
      analyzeBtn.querySelector("span").textContent = "Analyze PDF Text";
    } else if (tab === "pdf") {
      analyzeBtn.querySelector("span").textContent = "Upload PDF First";
    } else {
      analyzeBtn.querySelector("span").textContent = "Analyze Text";
    }

    // Hide previous results
    resultSection.style.display = "none";
    errorState.style.display = "none";
  }

  tabText.addEventListener("click", () => switchTab("text"));
  tabPdf.addEventListener("click", () => switchTab("pdf"));

  // ══════════════════════════════════════════
  //  TEXT COUNTER
  // ══════════════════════════════════════════
  textInput.addEventListener("input", () => {
    const text = textInput.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    charCount.textContent = `${chars.toLocaleString()} characters`;
    wordCount.textContent = `${words.toLocaleString()} words`;
  });

  // ══════════════════════════════════════════
  //  PDF UPLOAD — DRAG & DROP + BROWSE
  // ══════════════════════════════════════════
  pdfBrowseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    pdfFileInput.click();
  });

  pdfUploadZone.addEventListener("click", () => {
    pdfFileInput.click();
  });

  pdfFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfFile(e.target.files[0]);
    }
  });

  // Drag & Drop
  pdfUploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfUploadZone.classList.add("drag-over");
  });

  pdfUploadZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfUploadZone.classList.remove("drag-over");
  });

  pdfUploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfUploadZone.classList.remove("drag-over");

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handlePdfFile(file);
    } else {
      showError("Please upload a valid PDF file.");
    }
  });

  // Remove file
  pdfRemoveBtn.addEventListener("click", () => {
    resetPdfState();
  });

  function resetPdfState() {
    extractedPdfText = "";
    pdfFileInput.value = "";
    pdfUploadZone.style.display = "";
    pdfFileInfo.style.display = "none";
    pdfTextPreview.style.display = "none";
    analyzeBtn.querySelector("span").textContent = "Upload PDF First";
    resultSection.style.display = "none";
    errorState.style.display = "none";
  }

  // ══════════════════════════════════════════
  //  PDF TEXT EXTRACTION
  // ══════════════════════════════════════════
  async function handlePdfFile(file) {
    // Validate
    if (file.size > 25 * 1024 * 1024) {
      showError("File too large. Maximum size is 25MB.");
      return;
    }

    // Show file info
    pdfFileName.textContent = file.name;
    pdfFileSize.textContent = formatFileSize(file.size);
    pdfUploadZone.style.display = "none";
    pdfFileInfo.style.display = "flex";

    // Show loading
    showLoading("Extracting text from PDF...");
    analyzeBtn.disabled = true;

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Check if pdf.js is available
      if (typeof pdfjsLib !== "undefined") {
        extractedPdfText = await extractWithPdfJs(arrayBuffer);
      } else {
        // Fallback: basic binary text extraction
        extractedPdfText = extractTextFallback(arrayBuffer);
      }

      if (!extractedPdfText || extractedPdfText.trim().length < 50) {
        loadingState.style.display = "none";
        showError("Could not extract enough text from this PDF. The file may be scanned/image-based.");
        analyzeBtn.disabled = false;
        return;
      }

      // Show preview
      loadingState.style.display = "none";
      pdfTextPreview.style.display = "block";
      pdfExtractedText.textContent = extractedPdfText.substring(0, 500) + (extractedPdfText.length > 500 ? "..." : "");
      pdfCharCount.textContent = `${extractedPdfText.length.toLocaleString()} chars`;

      analyzeBtn.querySelector("span").textContent = "Analyze PDF Text";
      analyzeBtn.disabled = false;

    } catch (err) {
      console.error("[AI Detector] PDF extraction error:", err);
      loadingState.style.display = "none";
      showError("Failed to read PDF: " + err.message);
      analyzeBtn.disabled = false;
    }
  }

  // Extract text using pdf.js (primary method)
  async function extractWithPdfJs(arrayBuffer) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("lib/pdf.worker.min.js");

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  }

  // Fallback: basic binary text extraction (when pdf.js is not available)
  function extractTextFallback(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const binaryString = Array.from(bytes).map(b => String.fromCharCode(b)).join("");

    // Find text between BT (Begin Text) and ET (End Text) operators
    const textBlocks = [];
    const btEtRegex = /BT\s([\s\S]*?)ET/g;
    let match;

    while ((match = btEtRegex.exec(binaryString)) !== null) {
      const block = match[1];

      // Extract text from Tj operator (show text)
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textBlocks.push(tjMatch[1]);
      }

      // Extract text from TJ operator (show text with individual glyph positioning)
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrMatch;
      while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
        const innerRegex = /\(([^)]*)\)/g;
        let innerMatch;
        let lineText = "";
        while ((innerMatch = innerRegex.exec(tjArrMatch[1])) !== null) {
          lineText += innerMatch[1];
        }
        if (lineText) textBlocks.push(lineText);
      }
    }

    // Clean up extracted text
    let text = textBlocks.join(" ");
    // Remove PDF escape sequences
    text = text.replace(/\\n/g, "\n").replace(/\\r/g, "").replace(/\\t/g, " ");
    text = text.replace(/\\\(/g, "(").replace(/\\\)/g, ")");
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  // ══════════════════════════════════════════
  //  ANALYZE BUTTON
  // ══════════════════════════════════════════
  analyzeBtn.addEventListener("click", async () => {
    let text = "";

    if (currentTab === "text") {
      text = textInput.value.trim();
    } else if (currentTab === "pdf") {
      text = extractedPdfText.trim();
    }

    if (!text) {
      if (currentTab === "pdf") {
        showError("Please upload a PDF file first.");
      } else {
        showError("Please enter some text to analyze.");
      }
      return;
    }

    if (text.length < 20) {
      showError("Text is too short. Please enter at least 20 characters for meaningful analysis.");
      return;
    }

    await analyzeText(text);
  });

  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", () => {
      if (lastReportData) {
        downloadAndOpenReport(lastReportData);
      }
    });
  }

  // Keyboard shortcut: Ctrl+Enter
  textInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      analyzeBtn.click();
    }
  });

  // ══════════════════════════════════════════
  //  ANALYSIS PIPELINE
  // ══════════════════════════════════════════
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

      showResult(response, text);
    } catch (err) {
      console.error("[AI Detector Popup] Error:", err);
      showError("Failed to connect to the analysis service. Please try again.");
    } finally {
      analyzeBtn.disabled = false;
    }
  }

  // ══════════════════════════════════════════
  //  DISPLAY FUNCTIONS
  // ══════════════════════════════════════════
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

  function showResult(data, text) {
    loadingState.style.display = "none";
    errorState.style.display = "none";
    resultSection.style.display = "block";

    lastReportData = {
      probability: data.probability,
      segments: data.segments,
      source: currentTab === "pdf" ? "Uploaded PDF (" + pdfFileName.textContent + ")" : "Manual Input",
      analyzedText: text,
      timestamp: Date.now()
    };

    const prob = Math.round(data.probability * 100) / 100;
    const offset = CIRCUMFERENCE - (prob / 100) * CIRCUMFERENCE;

    let color;
    if (prob > 75) color = "#ef4444";
    else if (prob > 50) color = "#f59e0b";
    else if (prob > 30) color = "#eab308";
    else color = "#22c55e";

    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = color;
    gaugePercent.textContent = prob.toFixed(1);
    gaugePercent.style.color = color;

    const ICONS = {
      ai: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align:-0.15em; margin-right:4px;"><path d="M12,2a2,2 0 0,1 2,2c0,0.74 -0.4,1.39 -1,1.73V7h1a3,3 0 0,1 3,3v2h2a1,1 0 0,1 1,1v4a1,1 0 0,1 -1,1h-2v2a3,3 0 0,1 -3,3H8a3,3 0 0,1 -3,-3v-2H3a1,1 0 0,1 -1,-1v-4a1,1 0 0,1 1,-1h2v-2a3,3 0 0,1 3,-3h1V5.73C7.4,5.39 7,4.74 7,4a2,2 0 0,1 2,-2h3Z"/></svg>`,
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

    segments.textContent = `Analyzed ${data.segments} segment${data.segments !== 1 ? "s" : ""} of text`;

    barAi.style.width = `${prob}%`;
    barHuman.style.width = `${100 - prob}%`;
    barAiVal.textContent = `${prob.toFixed(1)}%`;
    barAiVal.style.color = color;
    barHumanVal.textContent = `${(100 - prob).toFixed(1)}%`;
    barHumanVal.style.color = "#22c55e";
  }

  // ══════════════════════════════════════════
  //  API STATUS CHECK
  // ══════════════════════════════════════════
  checkAPIStatus();

  async function checkAPIStatus() {
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");
    const statusEl = document.getElementById("connection-status");

    try {
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
