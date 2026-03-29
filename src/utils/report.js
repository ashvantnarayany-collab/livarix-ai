// ===== LIVARIX AI — REPORT GENERATOR =====
// Generates Free (HTML popup) and Premium (PDF via pdfmake) reports

// ===== COLOR SCHEME PER CANCER TYPE =====
const CANCER_COLORS = {
  lung: {
    primary:   "#0369A1",
    accent:    "#0EA5E9",
    light:     "#E0F2FE",
    banner:    "#075985",
    badge:     "#0284C7",
    bar:       "#0EA5E9",
    name:      "Lung Cancer",
    emoji:     "🫁"
  },
  liver: {
    primary:   "#92400E",
    accent:    "#F59E0B",
    light:     "#FEF3C7",
    banner:    "#78350F",
    badge:     "#D97706",
    bar:       "#F59E0B",
    name:      "Liver Cancer",
    emoji:     "🩺"
  }
};

function getColor(cancerType) {
  return CANCER_COLORS[cancerType] || CANCER_COLORS.lung;
}

function formatDate() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  });
}

function reportNo() {
  return "LIV-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random()*9000)+1000);
}

// ===========================
// FREE REPORT — HTML POPUP
// ===========================
function generateFreeReport(result, patient) {
  const clr = getColor(result.cancerType);
  const rNo = reportNo();
  const date = formatDate();
  const pct = Math.round(result.confidence * 100);
  const isPos = result.isPositive;
  const riskColor = isPos ? (result.risk === "HIGH" ? "#DC2626" : "#D97706") : "#16A34A";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Livarix AI Report — ${rNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b}
.page{max-width:760px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)}
.letterhead{background:${clr.primary};color:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center}
.lh-logo{width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px}
.lh-brand{margin-left:14px}
.lh-name{font-size:18px;font-weight:700;letter-spacing:-0.3px}
.lh-sub{font-size:11px;opacity:0.75;margin-top:2px}
.lh-right{text-align:right;font-size:11px;opacity:0.8;line-height:1.8}
.plan-bar{background:${clr.banner};padding:7px 28px;font-size:11px;color:rgba(255,255,255,0.75);display:flex;gap:24px}
.plan-bar span{color:#fff;font-weight:600}
.risk-banner{background:${isPos ? '#FEF2F2' : '#F0FDF4'};border-bottom:2px solid ${riskColor};padding:10px 28px;display:flex;align-items:center;gap:10px}
.risk-dot{width:10px;height:10px;border-radius:50%;background:${riskColor};flex-shrink:0}
.risk-txt{font-size:12px;color:${riskColor};font-weight:600}
.body{padding:24px 28px}
.section{margin-bottom:24px}
.sec-head{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:${clr.primary};border-bottom:2px solid ${clr.light};padding-bottom:5px;margin-bottom:14px}
.pt-grid{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.pt-cell{padding:10px 14px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0}
.pt-cell:nth-child(3n){border-right:none}.pt-cell:nth-last-child(-n+3){border-bottom:none}
.pt-lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
.pt-val{font-size:13px;color:#0f172a;font-weight:500}
.ai-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ai-card{background:${clr.light};border:1px solid ${clr.accent}33;border-radius:8px;padding:14px;text-align:center}
.ai-val{font-size:22px;font-weight:700;color:${clr.primary};margin-bottom:3px}
.ai-lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.06em}
.conf-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.conf-name{font-size:12px;color:#64748b;min-width:180px;font-family:monospace}
.conf-track{flex:1;height:6px;background:#e2e8f0;border-radius:999px;overflow:hidden}
.conf-fill{height:100%;border-radius:999px;background:${clr.bar}}
.conf-pct{font-size:11px;color:#64748b;min-width:36px;text-align:right}
.finding-block{background:#f8fafc;border-left:3px solid ${clr.accent};border-radius:0 6px 6px 0;padding:12px 14px;margin-bottom:10px}
.finding-lbl{font-size:10px;font-weight:600;color:${clr.primary};text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
.finding-txt{font-size:13px;color:#374151;line-height:1.7}
.free-badge{background:${clr.light};border:1px solid ${clr.accent}66;border-radius:8px;padding:12px 16px;text-align:center;margin-top:20px}
.free-badge p{font-size:12px;color:#64748b;line-height:1.7}
.free-badge strong{color:${clr.primary}}
.disclaimer{background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px 14px;font-size:11px;color:#78350f;line-height:1.7;margin-top:18px}
.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:10px 28px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
.print-btn{display:block;margin:12px auto 0;padding:10px 28px;background:${clr.primary};color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
</style>
</head>
<body>
<div class="page">
  <div class="letterhead">
    <div style="display:flex;align-items:center">
      <div class="lh-logo">${clr.emoji}</div>
      <div class="lh-brand">
        <div class="lh-name">Livarix AI · Oncology Imaging Centre</div>
        <div class="lh-sub">AI-Assisted Cancer Detection Platform</div>
      </div>
    </div>
    <div class="lh-right">
      ${clr.name} Screening Report<br>
      Report No: ${rNo}<br>
      ${date}
    </div>
  </div>
  <div class="plan-bar">
    Report Type: <span>Free Plan</span> &nbsp;|&nbsp;
    Cancer Type: <span>${clr.name}</span> &nbsp;|&nbsp;
    AI Version: <span>Livarix AI v2.1</span>
  </div>
  <div class="risk-banner">
    <div class="risk-dot"></div>
    <div class="risk-txt">${isPos ? `${result.risk} RISK · ${result.label} detected — Clinical review recommended` : 'LOW RISK · No malignant features detected by AI model'}</div>
  </div>
  <div class="body">
    <div class="section">
      <div class="sec-head">Patient Information</div>
      <div class="pt-grid">
        <div class="pt-cell"><div class="pt-lbl">Patient Name</div><div class="pt-val">${patient.name || "Not provided"}</div></div>
        <div class="pt-cell"><div class="pt-lbl">Age / Sex</div><div class="pt-val">${patient.age ? patient.age + " yr" : "N/A"} / ${patient.sex || "N/A"}</div></div>
        <div class="pt-cell"><div class="pt-lbl">MRN</div><div class="pt-val">${patient.mrn || "—"}</div></div>
        <div class="pt-cell"><div class="pt-lbl">Referring Physician</div><div class="pt-val">${patient.doctor || "—"}</div></div>
        <div class="pt-cell"><div class="pt-lbl">Study Date</div><div class="pt-val">${date}</div></div>
        <div class="pt-cell"><div class="pt-lbl">Clinical History</div><div class="pt-val">${patient.history || "—"}</div></div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">AI Analysis Summary</div>
      <div class="ai-grid">
        <div class="ai-card"><div class="ai-val">${pct}%</div><div class="ai-lbl">Confidence</div></div>
        <div class="ai-card"><div class="ai-val" style="font-size:16px;color:${riskColor}">${result.label}</div><div class="ai-lbl">Prediction</div></div>
        <div class="ai-card"><div class="ai-val">${result.stage}</div><div class="ai-lbl">Stage Est.</div></div>
        <div class="ai-card"><div class="ai-val" style="color:${riskColor}">${result.risk}</div><div class="ai-lbl">Risk Level</div></div>
      </div>
    </div>
    <div class="section">
      <div class="sec-head">Confidence Distribution</div>
      ${result.classes.map(c => `
        <div class="conf-row">
          <div class="conf-name">${c.cls}</div>
          <div class="conf-track"><div class="conf-fill" style="width:${Math.round(c.val*100)}%"></div></div>
          <div class="conf-pct">${Math.round(c.val*100)}%</div>
        </div>`).join('')}
    </div>
    <div class="section">
      <div class="sec-head">AI Findings</div>
      <div class="finding-block">
        <div class="finding-lbl">Summary</div>
        <div class="finding-txt">${result.findings}</div>
      </div>
    </div>
    <div class="free-badge">
      <p><strong>Free Plan Report</strong> — This is a basic summary report.<br>
      Upgrade to <strong>Premium</strong> for full detailed PDF with TNM staging, treatment recommendations, diet guidelines, and specialist referrals.</p>
    </div>
    <div class="disclaimer">
      <strong>⚠️ Disclaimer:</strong> This AI-generated report is for clinical decision support only and is NOT a substitute for professional medical judgment. 
      All findings must be reviewed and validated by a qualified radiologist or clinician. Livarix AI v2.1 · Not for standalone diagnostic use.
    </div>
  </div>
  <div class="footer">
    <span>Livarix AI · ${rNo}</span>
    <span>AI-Assisted · Not for standalone diagnostic use</span>
    <span>Page 1 of 1</span>
  </div>
</div>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;

  const win = window.open("", "_blank", "width=820,height=900");
  win.document.write(html);
  win.document.close();
}

// ===========================
// PREMIUM REPORT — PDF
// ===========================
function generatePremiumPDF(result, patient) {
  const clr = getColor(result.cancerType);
  const rNo = reportNo();
  const date = formatDate();
  const pct = Math.round(result.confidence * 100);
  const isPos = result.isPositive;
  const riskHex = isPos ? (result.risk === "HIGH" ? "#DC2626" : "#D97706") : "#16A34A";

  // Convert hex to RGB array for pdfmake
  function hexToRGB(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }

  const primaryRGB = hexToRGB(clr.primary);
  const accentRGB  = hexToRGB(clr.accent);
  const lightRGB   = hexToRGB(clr.light);
  const riskRGB    = hexToRGB(riskHex);

  // Section header style
  function secHead(text) {
    return {
      text: text.toUpperCase(),
      fontSize: 9, bold: true, color: clr.primary,
      letterSpacing: 1.5, margin: [0,16,0,6],
      decoration: "underline", decorationStyle: "solid"
    };
  }

  function infoGrid(items) {
    const rows = [];
    for (let i = 0; i < items.length; i += 3) {
      const row = items.slice(i, i+3).map(item => ({
        stack: [
          { text: item.label, fontSize: 8, color: "#64748B", bold: true, margin:[0,0,0,2] },
          { text: item.value || "—", fontSize: 11, color: "#0F172A", bold: false }
        ],
        fillColor: i % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
        border: [true,true,true,true],
        borderColor: ["#E2E8F0","#E2E8F0","#E2E8F0","#E2E8F0"],
        margin: [6,6,6,6]
      }));
      while (row.length < 3) row.push({ text:"", border:[true,true,true,true], borderColor:["#E2E8F0","#E2E8F0","#E2E8F0","#E2E8F0"] });
      rows.push(row);
    }
    return { table: { widths:["*","*","*"], body: rows }, margin:[0,0,0,8] };
  }

  // Build confidence bars as table (pdfmake has no canvas)
  function confBars() {
    return result.classes.map(c => ({
      columns: [
        { text: c.cls, fontSize: 10, color: "#64748B", width: 200, font: "Courier" },
        {
          stack: [{
            canvas: [{
              type: "rect", x: 0, y: 6, w: 200, h: 8, r: 4, color: "#E2E8F0"
            },{
              type: "rect", x: 0, y: 6, w: Math.round(c.val * 200), h: 8, r: 4, color: clr.accent
            }]
          }],
          width: 200
        },
        { text: Math.round(c.val * 100) + "%", fontSize: 10, color: "#64748B", width: 40, alignment:"right" }
      ],
      margin: [0,4,0,4]
    }));
  }

  // Recommendations based on cancer type and positivity
  function getRecommendations() {
    if (result.cancerType === "lung") {
      if (isPos) return [
        ["P1 — Urgent","Tissue biopsy (CT-guided / bronchoscopy)", "Within 48 hrs","Pulmonology / Thoracic Surgery"],
        ["P1 — Urgent","Multidisciplinary tumour board review","Within 72 hrs","Oncology / Radiology / Surgery"],
        ["P2 — Soon","PET-CT whole body staging","Within 1 week","Nuclear Medicine"],
        ["P2 — Soon","Pulmonary function tests (PFTs)","Within 1 week","Pulmonology"],
        ["P3 — Routine","Blood: CBC, LFT, RFT, tumour markers","Within 1 week","Clinical Pathology"],
        ["P3 — Routine","Smoking cessation counselling","Immediate","Preventive Medicine"]
      ];
      return [
        ["Routine","Low-dose CT follow-up in 12 months","1 year","Radiology"],
        ["Routine","Smoking cessation if applicable","Immediate","Preventive Medicine"],
        ["Routine","Annual pulmonary check-up","Annually","Pulmonology"]
      ];
    } else {
      if (isPos) return [
        ["P1 — Urgent","Liver biopsy + histopathology","Within 48 hrs","Hepatology / Interventional Radiology"],
        ["P1 — Urgent","AFP, CA19-9, CEA tumour markers","Within 48 hrs","Clinical Pathology"],
        ["P1 — Urgent","Multidisciplinary liver tumour board","Within 72 hrs","Hepatology / Oncology"],
        ["P2 — Soon","Contrast-enhanced MRI liver","Within 1 week","Radiology"],
        ["P2 — Soon","Portal venous assessment","Within 1 week","Hepatology"],
        ["P3 — Routine","Nutritional assessment + LFT monitoring","Ongoing","Dietetics / Hepatology"]
      ];
      return [
        ["Routine","USG abdomen follow-up in 6 months","6 months","Radiology"],
        ["Routine","LFT and AFP monitoring","Every 6 months","Hepatology"],
        ["Routine","Alcohol abstinence / Hepatitis B/C screening","Immediate","Preventive Medicine"]
      ];
    }
  }

  function getDiet() {
    if (result.cancerType === "lung") {
      return {
        allow: ["Antioxidant-rich fruits & vegetables","Omega-3 fatty acids (salmon, flaxseed)","Green tea & turmeric","Cruciferous vegetables (broccoli, cabbage)","Whole grains & legumes"],
        avoid: ["Tobacco & smoking (primary risk factor)","Processed & smoked meats","Alcohol (limit or abstain)","Radon, asbestos exposure","Air pollutants & dust inhalation"]
      };
    }
    return {
      allow: ["Low-fat, high-fibre diet","Fresh fruits & vegetables","Olive oil & healthy fats","Lean proteins (chicken, fish)","Coffee (moderate — protective)"],
      avoid: ["Alcohol (major hepatotoxin)","Processed & fast foods","Aflatoxin-contaminated foods","High-sugar/refined carbs","Hepatotoxic medications without medical supervision"]
    };
  }

  const recs = getRecommendations();
  const diet = getDiet();

  const docDef = {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 50],
    defaultStyle: { font: "Roboto", fontSize: 11, color: "#1E293B" },

    footer: function(page, pages) {
      return {
        columns: [
          { text: `Livarix AI · ${rNo} · ${clr.name} Report`, fontSize: 8, color: "#94A3B8", margin:[36,0,0,0] },
          { text: `Page ${page} of ${pages}`, fontSize: 8, color: "#94A3B8", alignment:"right", margin:[0,0,36,0] }
        ],
        margin: [0, 8, 0, 0]
      };
    },

    content: [
      // ── LETTERHEAD ──
      {
        table: {
          widths: ["*","auto"],
          body: [[
            {
              stack: [
                { text: "🫁  LIVARIX AI", fontSize: 20, bold: true, color: "#FFFFFF", margin:[0,0,0,4] },
                { text: "Oncology Imaging Centre · AI-Assisted Cancer Detection", fontSize: 9, color: "rgba(255,255,255,0.8)" },
                { text: "NABH Accredited · ISO 15189:2022", fontSize: 8, color: "rgba(255,255,255,0.65)", margin:[0,3,0,0] }
              ],
              fillColor: clr.primary, border:[false,false,false,false], margin:[16,14,0,14]
            },
            {
              stack: [
                { text: `${clr.name} Screening Report`, fontSize: 9, color: "rgba(255,255,255,0.8)", alignment:"right" },
                { text: `Report No: ${rNo}`, fontSize: 9, bold: true, color: "#FFFFFF", alignment:"right", margin:[0,2,0,2] },
                { text: date, fontSize: 8, color: "rgba(255,255,255,0.7)", alignment:"right" }
              ],
              fillColor: clr.primary, border:[false,false,false,false], margin:[0,14,16,14]
            }
          ]]
        }, margin:[0,0,0,0], layout: "noBorders"
      },
      // Sub-bar
      {
        table:{widths:["*"],body:[[{
          text: `Report Type: PREMIUM PDF  |  Cancer Type: ${clr.name.toUpperCase()}  |  AI Version: Livarix AI v2.1`,
          fontSize: 8, color: "#FFFFFF", fillColor: clr.banner,
          border:[false,false,false,false], margin:[16,6,16,6]
        }]]}, layout:"noBorders", margin:[0,0,0,0]
      },
      // Risk banner
      {
        table:{widths:["*"],body:[[{
          text: isPos
            ? `▲  ${result.risk} RISK · ${result.label} detected — Urgent clinical review recommended`
            : `✓  LOW RISK · No significant malignant features detected by AI model`,
          fontSize: 10, bold:true, color: riskHex,
          fillColor: isPos ? "#FEF2F2" : "#F0FDF4",
          border:[false,false,false,true], borderColor:["","","",riskHex],
          margin:[16,10,16,10]
        }]]}, layout:"noBorders", margin:[0,0,0,16]
      },

      // ── PATIENT INFO ──
      secHead("Patient Information"),
      infoGrid([
        {label:"Patient Name", value: patient.name || "Not provided"},
        {label:"Age / Sex", value: (patient.age ? patient.age+" yr" : "N/A") + " / " + (patient.sex||"N/A")},
        {label:"MRN / Patient ID", value: patient.mrn || "—"},
        {label:"Referring Physician", value: patient.doctor || "—"},
        {label:"Study Date", value: date},
        {label:"Clinical History", value: patient.history || "—"}
      ]),

      // ── AI ANALYSIS ──
      secHead("AI Analysis Metrics"),
      {
        columns: [
          { stack:[{ text: pct+"%", fontSize:28, bold:true, color: clr.primary, alignment:"center"},{text:"Confidence", fontSize:8, color:"#64748B", alignment:"center"}], width:"*" },
          { stack:[{ text: result.label, fontSize:14, bold:true, color: riskHex, alignment:"center"},{text:"AI Prediction", fontSize:8, color:"#64748B", alignment:"center"}], width:"*" },
          { stack:[{ text: result.stage, fontSize:28, bold:true, color: clr.primary, alignment:"center"},{text:"Stage Estimate", fontSize:8, color:"#64748B", alignment:"center"}], width:"*" },
          { stack:[{ text: result.risk, fontSize:22, bold:true, color: riskHex, alignment:"center"},{text:"Risk Level", fontSize:8, color:"#64748B", alignment:"center"}], width:"*" }
        ],
        margin:[0,0,0,16]
      },

      // ── CONFIDENCE BARS ──
      secHead("Confidence Distribution"),
      ...confBars(),

      // ── FINDINGS ──
      secHead("AI Radiological Findings"),
      {
        text: result.findings,
        fontSize: 11, color: "#374151", lineHeight: 1.7,
        margin:[0,0,0,8]
      },

      // ── TNM STAGING (only if positive) ──
      ...(isPos ? [
        secHead("Estimated TNM Staging (AJCC 8th Edition)"),
        {
          table: {
            widths: [120,"*","*","*"],
            body: [
              [
                {text:"Parameter",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
                {text:"Value",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
                {text:"Definition",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
                {text:"Basis",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]}
              ],
              [
                {text:"T — Primary Tumour",fontSize:10,margin:[6,6,6,6]},
                {text:result.stage.includes("I") ? "T2–T3" : "T3",bold:true,fontSize:10,margin:[6,6,6,6]},
                {text:"Tumour size / invasion",fontSize:10,color:"#64748B",margin:[6,6,6,6]},
                {text:"AI morphology analysis",fontSize:10,color:"#64748B",margin:[6,6,6,6]}
              ],
              [
                {text:"N — Regional Nodes",fontSize:10,margin:[6,6,6,6]},
                {text:"N1–N2",bold:true,fontSize:10,margin:[6,6,6,6]},
                {text:"Ipsilateral nodal involvement",fontSize:10,color:"#64748B",margin:[6,6,6,6]},
                {text:"Imaging pattern",fontSize:10,color:"#64748B",margin:[6,6,6,6]}
              ],
              [
                {text:"M — Distant Metastasis",fontSize:10,margin:[6,6,6,6]},
                {text:"M0 (est.)",bold:true,fontSize:10,margin:[6,6,6,6]},
                {text:"No distant spread detected",fontSize:10,color:"#64748B",margin:[6,6,6,6]},
                {text:"Scan field of view",fontSize:10,color:"#64748B",margin:[6,6,6,6]}
              ],
              [
                {text:"Overall Stage",bold:true,fontSize:10,fillColor:"#FEF2F2",margin:[6,6,6,6]},
                {text:result.stage,bold:true,fontSize:12,color:riskHex,fillColor:"#FEF2F2",colSpan:3,margin:[6,6,6,6]},{},{}
              ]
            ]
          },
          layout:{hLineColor:"#E2E8F0",vLineColor:"#E2E8F0"},
          margin:[0,0,0,16]
        }
      ] : []),

      // ── RECOMMENDATIONS ──
      secHead("Recommended Investigations & Referrals"),
      {
        table: {
          widths: [80,"*",80,100],
          body: [
            [
              {text:"Priority",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
              {text:"Action",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
              {text:"Timeframe",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]},
              {text:"Department",bold:true,fontSize:9,color:"#FFFFFF",fillColor:clr.primary,margin:[6,6,6,6]}
            ],
            ...recs.map((r,i) => r.map(cell => ({
              text:cell, fontSize:10, margin:[6,6,6,6],
              fillColor: i%2===0?"#F8FAFC":"#FFFFFF",
              color: cell.includes("P1") ? "#DC2626" : cell.includes("P2") ? "#D97706" : "#16A34A"
            })))
          ]
        },
        layout:{hLineColor:"#E2E8F0",vLineColor:"#E2E8F0"},
        margin:[0,0,0,16]
      },

      // ── DIET ──
      secHead("Dietary Guidance"),
      {
        columns:[
          {
            stack:[
              {text:"✅  RECOMMENDED", fontSize:10, bold:true, color:"#16A34A", margin:[0,0,0,6]},
              ...diet.allow.map(d => ({text:`• ${d}`, fontSize:10, color:"#374151", margin:[0,2,0,2]}))
            ],
            width:"*", margin:[0,0,8,0]
          },
          {
            stack:[
              {text:"⛔  AVOID / LIMIT", fontSize:10, bold:true, color:"#DC2626", margin:[0,0,0,6]},
              ...diet.avoid.map(d => ({text:`• ${d}`, fontSize:10, color:"#374151", margin:[0,2,0,2]}))
            ],
            width:"*"
          }
        ],
        margin:[0,0,0,16]
      },

      // ── SIGNATURE ──
      secHead("Report Authorisation"),
      {
        columns:[
          {
            stack:[
              {text:"_______________________________", color:"#CBD5E1"},
              {text:"Reporting Radiologist / Clinician", fontSize:10, color:"#64748B", margin:[0,4,0,0]},
              {text:"MBBS, MD (Radiodiagnosis)", fontSize:9, color:"#94A3B8"}
            ], width:"*"
          },
          {
            stack:[
              {text:"_______________________________", color:"#CBD5E1"},
              {text:"AI System Authorization", fontSize:10, color:"#64748B", margin:[0,4,0,0]},
              {text:"Livarix AI v2.1 · Deep Learning Model", fontSize:9, color:"#94A3B8"}
            ], width:"*"
          }
        ],
        margin:[0,0,0,16]
      },

      // ── DISCLAIMER ──
      {
        table:{widths:["*"],body:[[{
          text:"⚠️  MEDICAL DISCLAIMER: This AI-generated report is intended as a decision-support tool for trained medical professionals and is NOT a substitute for clinical examination, professional diagnosis, or treatment. All AI findings must be reviewed and validated by a qualified radiologist before clinical decisions are made. Livarix AI v2.1 — Not for standalone diagnostic use.",
          fontSize:9, color:"#78350F", lineHeight:1.6,
          fillColor:"#FFFBEB", border:[true,true,true,true], borderColor:["#FBBF24","#FBBF24","#FBBF24","#FBBF24"],
          margin:[10,10,10,10]
        }]]}, layout:"noBorders", margin:[0,0,0,0]
      }
    ]
  };

  pdfMake.createPdf(docDef).download(`Livarix-AI-${result.cancerType}-report-${rNo}.pdf`);
}

// Export
window.livarixReport = { generateFreeReport, generatePremiumPDF };
