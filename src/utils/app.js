// ===== LIVARIX AI — MAIN APP LOGIC =====

// ── Auth ──
const DEMO_USER = "123";
const DEMO_PASS = "123";

let currentUser = null;
let isPremium = false;
let currentCancerType = null;
let currentResult = null;
let scanHistory = [];

function doLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  const err  = document.getElementById("loginError");

  if (!user || !pass) { err.textContent = "Please enter User ID and Password."; return; }

  if (user === DEMO_USER && pass === DEMO_PASS) {
    currentUser = user;
    isPremium = false; // Start on Free; user can toggle
    err.textContent = "";
    showScreen("dashboardScreen");
    updatePlanUI();
  } else {
    err.textContent = "Invalid credentials. Try User ID: 123, Password: 123";
  }
}

// Allow Enter key on login
document.getElementById("loginPass").addEventListener("keydown", e => {
  if (e.key === "Enter") doLogin();
});
document.getElementById("loginUser").addEventListener("keydown", e => {
  if (e.key === "Enter") doLogin();
});

function doLogout() {
  currentUser = null;
  currentResult = null;
  currentCancerType = null;
  showScreen("loginScreen");
  clearSelection();
  document.getElementById("resultSection").style.display = "none";
  document.getElementById("uploadSection").style.display = "none";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function togglePlan() {
  isPremium = !isPremium;
  updatePlanUI();
}

function updatePlanUI() {
  const ind = document.getElementById("planIndicator");
  const btn = document.getElementById("upgradeBtn");
  const premNote = document.getElementById("premiumNote");
  if (isPremium) {
    ind.textContent = "⭐ Premium";
    ind.className = "plan-indicator premium";
    btn.textContent = "✓ Premium Active";
    btn.style.background = "rgba(245,158,11,0.2)";
    btn.style.color = "#FCD34D";
    btn.style.border = "1px solid rgba(245,158,11,0.4)";
    if (premNote) premNote.style.display = "block";
  } else {
    ind.textContent = "Free Plan";
    ind.className = "plan-indicator";
    btn.textContent = "Upgrade to Premium";
    btn.style.background = "";
    btn.style.color = "";
    btn.style.border = "";
    if (premNote) premNote.style.display = "none";
  }
}

// ── Tab navigation ──
function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
  event.currentTarget.classList.add("active");
}

// ── Cancer type selection ──
function selectCancer(type) {
  currentCancerType = type;
  document.querySelectorAll(".scan-card").forEach(c => c.classList.remove("selected"));
  document.getElementById("card" + type.charAt(0).toUpperCase() + type.slice(1)).classList.add("selected");

  const sec = document.getElementById("uploadSection");
  sec.style.display = "block";
  document.getElementById("uploadTitle").textContent =
    type === "lung" ? "🫁 Lung Cancer Scan Upload" : "🩺 Liver Cancer Scan Upload";

  // Reset
  document.getElementById("previewSection").style.display = "none";
  document.getElementById("fileInput").value = "";
  document.getElementById("resultSection").style.display = "none";
  sec.scrollIntoView({behavior:"smooth", block:"start"});
}

function clearSelection() {
  currentCancerType = null;
  document.querySelectorAll(".scan-card").forEach(c => c.classList.remove("selected"));
  document.getElementById("uploadSection").style.display = "none";
  document.getElementById("resultSection").style.display = "none";
  document.getElementById("previewSection").style.display = "none";
  document.getElementById("fileInput").value = "";
}

// ── File handling ──
function handleDrop(event) {
  event.preventDefault();
  document.getElementById("dropZone").classList.remove("drag-over");
  const file = event.dataTransfer.files[0];
  if (file) loadPreview(file);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) loadPreview(file);
}

function loadPreview(file) {
  const allowed = ["image/png","image/jpeg","image/jpg","image/gif","image/webp"];
  // For DICOM (.dcm), we'll accept but just show placeholder
  if (!allowed.includes(file.type) && !file.name.endsWith(".dcm")) {
    alert("Please upload a PNG, JPG, or DICOM (.dcm) image file.");
    return;
  }

  const preview = document.getElementById("previewSection");
  const img = document.getElementById("previewImg");

  if (file.name.endsWith(".dcm")) {
    // DICOM placeholder
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23111827'/%3E%3Ctext x='150' y='140' text-anchor='middle' fill='%230EA5E9' font-size='48'%3E🩻%3C/text%3E%3Ctext x='150' y='180' text-anchor='middle' fill='%239CA3AF' font-size='14'%3EDICOM File%3C/text%3E%3Ctext x='150' y='200' text-anchor='middle' fill='%236B7280' font-size='12'%3E${escapeXML(file.name)}%3C/text%3E%3C/svg%3E`;
  } else {
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.readAsDataURL(file);
  }

  preview.style.display = "block";
  preview._file = file;
  document.getElementById("resultSection").style.display = "none";
}

function escapeXML(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Analyze ──
async function analyzeScan() {
  const preview = document.getElementById("previewSection");
  const file = preview._file;
  if (!file) { alert("Please select an image file first."); return; }
  if (!currentCancerType) { alert("Please select a cancer type."); return; }

  showLoading("Analyzing scan with Livarix AI...");

  try {
    // Try real API first, fall back to simulation
    let result;
    try {
      result = await window.livarixAPI.analyzeWithGradio(currentCancerType, file);
    } catch(e) {
      result = await window.livarixAPI.analyzeWithAPI(currentCancerType, file);
    }

    currentResult = result;
    displayResult(result);
    addToHistory(result, file.name);
  } catch (err) {
    console.error("Analysis error:", err);
    // Final fallback: simulation
    const result = window.livarixAPI.simulateResult(currentCancerType, file.name);
    currentResult = result;
    displayResult(result);
    addToHistory(result, file.name);
  } finally {
    hideLoading();
  }
}

function displayResult(result) {
  const sec = document.getElementById("resultSection");
  sec.style.display = "block";
  sec.scrollIntoView({behavior:"smooth", block:"start"});

  const pct = Math.round(result.confidence * 100);
  const isPos = result.isPositive;
  const riskColor = isPos ? (result.risk === "HIGH" ? "#DC2626" : "#D97706") : "#16A34A";

  // Card classes
  const card = document.getElementById("resultCard");
  card.className = "result-card " + result.cancerType + "-result";

  // Header
  const header = document.getElementById("resultHeader");
  header.className = "result-header " + (isPos ? "danger-header" : result.cancerType + "-header");

  const badge = document.getElementById("resultBadge");
  badge.textContent = isPos ? (result.risk + " RISK") : "CLEAR";
  badge.className = "result-badge " + (isPos ? (result.risk === "HIGH" ? "badge-danger" : "badge-warn") : "badge-safe");

  document.getElementById("resultTypeLabel").textContent =
    (result.cancerType === "lung" ? "🫁 Lung" : "🩺 Liver") + " Cancer Analysis";

  // Metrics
  document.getElementById("resConfidence").textContent = pct + "%";
  document.getElementById("resConfidence").style.color = riskColor;
  document.getElementById("resPrediction").textContent = result.label;
  document.getElementById("resPrediction").style.color = riskColor;
  document.getElementById("resStage").textContent = result.stage;
  document.getElementById("resRisk").textContent = result.risk;
  document.getElementById("resRisk").style.color = riskColor;

  // Confidence bars
  const barClr = result.cancerType === "lung" ? "#0EA5E9" : "#F59E0B";
  const confBars = document.getElementById("confBars");
  confBars.innerHTML = result.classes.map(c => `
    <div class="conf-row">
      <div class="conf-name">${c.cls}</div>
      <div class="conf-track"><div class="conf-fill" style="width:${Math.round(c.val*100)}%;background:${barClr}"></div></div>
      <div class="conf-pct">${Math.round(c.val*100)}%</div>
    </div>`).join("");

  // Findings
  const findings = document.getElementById("resultFindings");
  findings.innerHTML = `<h4>AI Findings</h4><p>${result.findings.replace(/\n/g,"<br>")}</p>`;

  // Premium note
  const premNote = document.getElementById("premiumNote");
  if (premNote) premNote.style.display = isPremium ? "block" : "none";
}

// ── Report generation ──
function generateReport(type) {
  if (!currentResult) { alert("No analysis result available."); return; }

  const patient = {
    name:    document.getElementById("patientName").value || "Patient",
    age:     document.getElementById("patientAge").value,
    sex:     document.getElementById("patientSex").value,
    mrn:     document.getElementById("patientMRN").value,
    doctor:  document.getElementById("refDoctor").value,
    history: document.getElementById("clinicalHistory").value
  };

  if (type === "free") {
    window.livarixReport.generateFreeReport(currentResult, patient);
  } else {
    if (!isPremium) {
      // In testing mode, still allow premium
      const go = confirm("You are on Free Plan. Switch to Premium to unlock full PDF report?\n\nFor testing purposes, this will temporarily enable Premium.");
      if (go) { isPremium = true; updatePlanUI(); }
      else return;
    }
    showLoading("Generating Premium PDF Report...");
    setTimeout(() => {
      try {
        window.livarixReport.generatePremiumPDF(currentResult, patient);
      } catch(e) {
        console.error("PDF error:", e);
        alert("PDF generation failed. Ensure pdfmake is loaded. Check console for details.");
      } finally {
        hideLoading();
      }
    }, 500);
  }
}

// ── History ──
function addToHistory(result, filename) {
  const entry = {
    id: Date.now(),
    cancerType: result.cancerType,
    label: result.label,
    confidence: result.confidence,
    risk: result.risk,
    filename,
    time: new Date().toLocaleTimeString("en-IN"),
    patient: document.getElementById("patientName").value || "Unknown Patient"
  };
  scanHistory.unshift(entry);
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  if (scanHistory.length === 0) {
    list.innerHTML = '<div class="history-empty">No scans yet. Upload a scan to get started.</div>';
    return;
  }
  const riskColor = r => r === "HIGH" ? "#DC2626" : r === "MODERATE" ? "#D97706" : "#16A34A";
  list.innerHTML = scanHistory.map(e => `
    <div class="history-item ${e.cancerType}-item">
      <div class="hist-type-icon">${e.cancerType === "lung" ? "🫁" : "🩺"}</div>
      <div class="hist-info">
        <div class="hist-patient">${e.patient}</div>
        <div class="hist-meta">${e.cancerType === "lung" ? "Lung" : "Liver"} Cancer · ${e.label} · ${Math.round(e.confidence*100)}% confidence · ${e.filename}</div>
      </div>
      <span class="hist-badge" style="background:${riskColor(e.risk)}22;color:${riskColor(e.risk)};border:1px solid ${riskColor(e.risk)}44">${e.risk} RISK</span>
      <div class="hist-time">${e.time}</div>
    </div>`).join("");
}

// ── Loading ──
function showLoading(text) {
  document.getElementById("loadingText").textContent = text || "Processing...";
  document.getElementById("loadingOverlay").style.display = "flex";
}
function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
});
