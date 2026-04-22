// ============================================================
// AI Text Detector — Report Generator
// Creates beautiful HTML reports for AI detection results
// ============================================================

function generateReportHTML(data) {
  const {
    probability,
    segments,
    source,
    analyzedText,
    pageUrl,
    timestamp
  } = data;

  const prob = Math.round(probability * 100) / 100;
  const humanProb = (100 - prob).toFixed(1);
  const aiProb = prob.toFixed(1);

  let verdictText, verdictColor, verdictBg, verdictIcon;
  if (prob > 75) {
    verdictText = "Likely AI-Generated";
    verdictColor = "#ef4444";
    verdictBg = "rgba(239,68,68,0.08)";
    verdictIcon = "🤖";
  } else if (prob > 50) {
    verdictText = "Possibly AI-Generated";
    verdictColor = "#f59e0b";
    verdictBg = "rgba(245,158,11,0.08)";
    verdictIcon = "⚠️";
  } else if (prob > 30) {
    verdictText = "Mixed / Uncertain";
    verdictColor = "#eab308";
    verdictBg = "rgba(234,179,8,0.08)";
    verdictIcon = "❓";
  } else {
    verdictText = "Likely Human-Written";
    verdictColor = "#22c55e";
    verdictBg = "rgba(34,197,94,0.08)";
    verdictIcon = "✅";
  }

  const date = new Date(timestamp || Date.now());
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  // Truncate text preview for report
  const textPreview = (analyzedText || "").substring(0, 800);
  const textLength = (analyzedText || "").length;

  // SVG gauge for report
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (prob / 100) * circumference;

  return `<div class="ai-report-wrapper" style="font-family: 'Segoe UI', -apple-system, sans-serif; background: #050810; color: #e2e8f0; width: 800px; padding: 0;">
  <style>
    .report-page {
      width: 800px;
      margin: 0;
      padding: 40px 32px;
      box-sizing: border-box;
      background: #050810;
    }

    /* Header */
    .report-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px;
      background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08));
      border: 1px solid rgba(124,58,237,0.15);
      border-radius: 20px;
      margin-bottom: 28px;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    }

    .brand-logo svg { fill: white; }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    .header-meta {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }

    .header-meta .date { font-weight: 600; color: #94a3b8; }

    /* Verdict Card */
    .verdict-card {
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 32px;
      background: ${verdictBg};
      border: 1px solid ${verdictColor}22;
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .gauge-wrapper {
      position: relative;
      width: 160px;
      height: 160px;
      flex-shrink: 0;
    }

    .gauge-svg-report {
      width: 160px;
      height: 160px;
      transform: rotate(-90deg);
    }

    .gauge-bg-r {
      fill: none;
      stroke: rgba(255,255,255,0.05);
      stroke-width: 10;
    }

    .gauge-fill-r {
      fill: none;
      stroke: ${verdictColor};
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: ${circumference.toFixed(1)};
      stroke-dashoffset: ${offset.toFixed(1)};
      filter: drop-shadow(0 0 8px ${verdictColor});
    }

    .gauge-center-r {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .gauge-number {
      font-size: 36px;
      font-weight: 900;
      color: ${verdictColor};
      letter-spacing: -2px;
      line-height: 1;
    }

    .gauge-unit {
      font-size: 14px;
      font-weight: 600;
      color: ${verdictColor};
      opacity: 0.6;
    }

    .gauge-label-sm {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
    }

    .verdict-info { flex: 1; }

    .verdict-icon {
      font-size: 36px;
      margin-bottom: 8px;
    }

    .verdict-text {
      font-size: 24px;
      font-weight: 800;
      color: ${verdictColor};
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .verdict-desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      padding: 20px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      text-align: center;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Breakdown */
    .breakdown-section {
      padding: 24px;
      background: rgba(255,255,255,0.015);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bar-row-r {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .bar-row-r:last-child { margin-bottom: 0; }

    .bar-label-r {
      font-size: 13px;
      font-weight: 600;
      width: 120px;
      flex-shrink: 0;
    }

    .bar-track-r {
      flex: 1;
      height: 10px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      overflow: hidden;
    }

    .bar-fill-ai {
      height: 100%;
      border-radius: 10px;
      background: linear-gradient(90deg, #ef4444, #f97316);
      box-shadow: inset 0 0 10px rgba(239,68,68,0.3);
      width: ${aiProb}%;
    }

    .bar-fill-human {
      height: 100%;
      border-radius: 10px;
      background: linear-gradient(90deg, #22c55e, #10b981);
      box-shadow: inset 0 0 10px rgba(34,197,94,0.3);
      width: ${humanProb}%;
    }

    .bar-value-r {
      font-size: 14px;
      font-weight: 700;
      width: 55px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* Text Preview */
    .text-preview-section {
      padding: 24px;
      background: rgba(255,255,255,0.015);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .text-preview-body {
      padding: 16px;
      background: rgba(0,0,0,0.3);
      border-radius: 12px;
      font-size: 12.5px;
      color: #94a3b8;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,0.03);
    }

    /* Footer */
    .report-footer {
      text-align: center;
      padding: 20px;
      color: #1e293b;
      font-size: 11px;
      border-top: 1px solid rgba(255,255,255,0.03);
      margin-top: 20px;
    }

    .report-footer a {
      color: #7c3aed;
      text-decoration: none;
    }

    .disclaimer {
      padding: 16px 20px;
      background: rgba(245,158,11,0.04);
      border: 1px solid rgba(245,158,11,0.1);
      border-radius: 14px;
      margin-bottom: 24px;
      font-size: 11.5px;
      color: #92803a;
      line-height: 1.6;
    }

    .disclaimer strong { color: #f59e0b; }

    @media print {
      body { background: white; color: #1a1a1a; }
      .verdict-card { border: 2px solid ${verdictColor}; }
      .breakdown-section, .text-preview-section, .stat-card {
        border: 1px solid #ddd;
        background: #f9f9f9;
      }
      .text-preview-body { background: #f1f1f1; color: #333; }
      .report-footer { color: #999; }
    }
  </style>
</head>
<body>
  <div class="report-page">

    <!-- Header -->
    <div class="report-header">
      <div class="header-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" width="26" height="26">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
          </svg>
        </div>
        <div>
          <div class="brand-title">AI Detection Report</div>
          <div class="brand-subtitle">ELECTRA-Powered Analysis</div>
        </div>
      </div>
      <div class="header-meta">
        <div class="date">${formattedDate}</div>
        <div>${formattedTime}</div>
      </div>
    </div>

    <!-- Verdict -->
    <div class="verdict-card">
      <div class="gauge-wrapper">
        <svg viewBox="0 0 160 160" class="gauge-svg-report">
          <circle class="gauge-bg-r" cx="80" cy="80" r="70"/>
          <circle class="gauge-fill-r" cx="80" cy="80" r="70"/>
        </svg>
        <div class="gauge-center-r">
          <div class="gauge-number">${aiProb}</div>
          <div class="gauge-unit">%</div>
          <div class="gauge-label-sm">AI Probability</div>
        </div>
      </div>
      <div class="verdict-info">
        <div class="verdict-icon">${verdictIcon}</div>
        <div class="verdict-text">${verdictText}</div>
        <div class="verdict-desc">
          Our ELECTRA-based deep learning model analyzed the provided text
          across ${segments || 1} segment${(segments || 1) !== 1 ? 's' : ''} and determined
          a <strong>${aiProb}%</strong> probability that this content was generated by an AI system.
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" style="color:${verdictColor}">${aiProb}%</div>
        <div class="stat-label">AI Probability</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#22c55e">${humanProb}%</div>
        <div class="stat-label">Human Probability</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:#a78bfa">${segments || 1}</div>
        <div class="stat-label">Segments Analyzed</div>
      </div>
    </div>

    <!-- Breakdown -->
    <div class="breakdown-section">
      <div class="section-title">📊 Confidence Breakdown</div>
      <div class="bar-row-r">
        <span class="bar-label-r" style="color:#ef4444">🤖 AI-Generated</span>
        <div class="bar-track-r"><div class="bar-fill-ai"></div></div>
        <span class="bar-value-r" style="color:#ef4444">${aiProb}%</span>
      </div>
      <div class="bar-row-r">
        <span class="bar-label-r" style="color:#22c55e">👤 Human-Written</span>
        <div class="bar-track-r"><div class="bar-fill-human"></div></div>
        <span class="bar-value-r" style="color:#22c55e">${humanProb}%</span>
      </div>
    </div>

    <!-- Analysis Details -->
    <div class="breakdown-section">
      <div class="section-title">📋 Analysis Details</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:10px 0;color:#64748b;width:140px;">Source</td>
          <td style="padding:10px 0;font-weight:600;">${source || 'Manual Input'}</td>
        </tr>
        ${pageUrl ? `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:10px 0;color:#64748b;">Page URL</td>
          <td style="padding:10px 0;font-weight:500;word-break:break-all;">${pageUrl}</td>
        </tr>` : ''}
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:10px 0;color:#64748b;">Text Length</td>
          <td style="padding:10px 0;font-weight:600;">${textLength.toLocaleString()} characters</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:10px 0;color:#64748b;">Model Used</td>
          <td style="padding:10px 0;font-weight:600;">ELECTRA (google/electra-base-discriminator)</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;">Analysis Date</td>
          <td style="padding:10px 0;font-weight:600;">${formattedDate} at ${formattedTime}</td>
        </tr>
      </table>
    </div>

    <!-- Text Preview -->
    <div class="text-preview-section">
      <div class="section-title">📝 Analyzed Text Preview</div>
      <div class="text-preview-body">${escapeHtml(textPreview)}${textLength > 800 ? '\n\n... [truncated — ' + (textLength - 800).toLocaleString() + ' more characters]' : ''}</div>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>⚠️ Disclaimer:</strong> This report is generated by an automated AI detection tool using the ELECTRA
      deep learning model. Results are probabilistic estimates and should not be considered definitive proof.
      False positives and false negatives are possible. Use this report as a reference, not as conclusive evidence.
    </div>

    <!-- Footer -->
    <div class="report-footer">
      <p>Generated by <strong>AI Text Detector</strong> Chrome Extension v1.0.0</p>
      <p style="margin-top:4px;">Powered by ELECTRA Model • ${formattedDate}</p>
    </div>

  </div>
</div>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function downloadAndOpenReport(reportData) {
  // If html2pdf is not loaded, show error
  if (typeof html2pdf === 'undefined') {
    alert("Please download 'html2pdf.bundle.min.js' by double-clicking 'download-pdfjs.bat' to enable direct PDF downloads!");
    return;
  }

  // Create temporary container for the report
  const container = document.createElement('div');
  container.innerHTML = generateReportHTML(reportData);
  document.body.appendChild(container);

  // We need to briefly show the container so html2canvas can render it properly
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; // fixed width for PDF

  const element = container.firstElementChild;
  const filename = `AI-Detection-Report-${new Date().toISOString().slice(0, 10)}.pdf`;

  const opt = {
    margin: [0.2, 0.2, 0.2, 0.2], // 0.2 inch margin
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#050810' },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate and download PDF
  html2pdf().set(opt).from(element).save().then(() => {
    document.body.removeChild(container);
  });
}
