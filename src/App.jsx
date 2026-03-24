import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://2k22cse013-oncoscan-api.hf.space";

const CANCERS = [
  { id:"brain",    label:"Brain",    emoji:"🧠", scan:"MRI Scan",     color:"#7C6FF7", bg:"#7C6FF718", desc:"Detects Glioma, Meningioma & Pituitary tumours" },
  { id:"kidney",   label:"Kidney",   emoji:"🫘", scan:"CT Scan",      color:"#4BB8A9", bg:"#4BB8A918", desc:"Detects kidney tumours vs normal tissue" },
  { id:"breast",   label:"Breast",   emoji:"🎗️", scan:"Biopsy Slide", color:"#E879A0", bg:"#E879A018", desc:"Classifies benign vs malignant tissue" },
  { id:"oral",     label:"Oral",     emoji:"👄", scan:"Biopsy Slide", color:"#F59E0B", bg:"#F59E0B18", desc:"Detects Squamous Cell Carcinoma" },
  { id:"blood",    label:"Blood",    emoji:"🩸", scan:"Blood Smear",  color:"#EF4444", bg:"#EF444418", desc:"Identifies ALL leukemia stages" },
  { id:"cervical", label:"Cervical", emoji:"🔬", scan:"Pap Smear",    color:"#8B5CF6", bg:"#8B5CF618", desc:"Classifies cervical cell types" },
];

const ADVICE = {
  glioma:      { risk:"High",       next:"Urgent neurosurgery consult within 48hrs", diet:"Anti-inflammatory: berries, leafy greens, omega-3. Avoid processed foods.", tests:["MRI with contrast (full brain)","Biopsy & histopathology","PET scan","Blood CBC panel"], precautions:["Avoid direct sunlight on head","No strenuous activity","Monitor for seizures","Keep BP controlled"], followup:"48 hours" },
  meningioma:  { risk:"Medium",     next:"Neurology consultation within 1 week", diet:"Mediterranean diet — olive oil, fish, vegetables. Reduce saturated fats.", tests:["Contrast-enhanced MRI","CT scan skull base","Visual field test","Neuropsychological assessment"], precautions:["Regular headache monitoring","Avoid contact sports","Track vision changes","Monitor hormone levels"], followup:"1 week" },
  pituitary:   { risk:"Medium",     next:"Endocrinology + neurosurgery consult", diet:"Balanced diet. Monitor sodium. Avoid alcohol.", tests:["Full hormone panel","Visual field perimetry","MRI pituitary protocol","Urine cortisol test"], precautions:["Monitor vision changes","Check hormone levels monthly","Avoid extreme temperatures","Watch fatigue/weight"], followup:"1 week" },
  tumor:       { risk:"High",       next:"Urology oncology consult within 1 week", diet:"Hydrate well (2L+ daily). Reduce red meat. Increase fruits & vegetables.", tests:["CT urography","Renal biopsy","Urine cytology","Comprehensive metabolic panel"], precautions:["Avoid NSAIDs","Monitor blood pressure","No contrast dye without kidney check","Avoid dehydration"], followup:"1 week" },
  normal:      { risk:"Low",        next:"Annual screening recommended", diet:"Maintain healthy diet. Stay hydrated. Limit alcohol.", tests:["Annual CT follow-up","Blood pressure monitoring","Urine routine test"], precautions:["Maintain healthy weight","Stay hydrated","Regular exercise","Avoid smoking"], followup:"12 months" },
  benign:      { risk:"Low",        next:"6-month follow-up mammogram", diet:"Low-fat diet, leafy greens, limit alcohol to <1 drink/day.", tests:["Follow-up imaging in 6 months","Breast self-exam monthly","Mammogram annually"], precautions:["Monthly self-examination","Wear supportive bra","Avoid hormone therapy without consult","Maintain healthy BMI"], followup:"6 months" },
  malignant:   { risk:"High",       next:"Urgent oncology referral within 24-48hrs", diet:"Protein-rich diet, anti-inflammatory foods. Avoid processed sugars.", tests:["Core needle biopsy","Hormone receptor test (ER/PR/HER2)","Chest X-ray","Bone scan","Sentinel lymph node biopsy"], precautions:["Avoid self-medication","Do not delay treatment","Psychological support recommended","Monitor wound sites"], followup:"48 hours" },
  oral_scc:    { risk:"High",       next:"ENT / Oral oncologist within 1 week", diet:"Soft foods, avoid spicy/acidic foods, no alcohol, no tobacco.", tests:["Tissue biopsy & histopathology","PET-CT scan","Neck node ultrasound","Blood CBC & LFT"], precautions:["Stop smoking immediately","Avoid alcohol completely","Strict oral hygiene","Soft diet only"], followup:"1 week" },
  all_benign:  { risk:"Low",        next:"Annual blood panel follow-up", diet:"Iron-rich foods, leafy greens, citrus. Stay hydrated.", tests:["Complete blood count annually","Peripheral blood smear","Iron studies"], precautions:["Avoid infections","Regular hand hygiene","Vaccinations up to date","Report unusual fatigue"], followup:"12 months" },
  all_early:   { risk:"Medium",     next:"Haematology consult within 2 weeks", diet:"Nutritious balanced diet. Iron and folate rich foods.", tests:["Bone marrow biopsy","Immunophenotyping","Chromosomal analysis","CSF examination"], precautions:["Avoid infections strictly","No live vaccines","Report fever immediately","Avoid crowded places"], followup:"2 weeks" },
  all_pre:     { risk:"High",       next:"Paediatric haematology consult urgently", diet:"High nutrition diet. Avoid raw foods due to infection risk.", tests:["Bone marrow aspiration","Flow cytometry","BCR-ABL gene test","LP for CNS involvement"], precautions:["Strict infection control","Avoid contact sports","Monitor for bruising/bleeding","Immediate fever protocol"], followup:"1 week" },
  all_pro:     { risk:"High",       next:"Immediate haematology-oncology referral", diet:"High calorie nutritious diet. Avoid raw/undercooked foods.", tests:["Urgent bone marrow biopsy","Cytogenetics","MRD testing","Full organ function panel"], precautions:["Hospitalisation may be required","Strict isolation protocol","No self-medication","Emergency contacts ready"], followup:"24-48 hours" },
  cervix_dyk:  { risk:"Medium",     next:"Gynaecology consult within 2 weeks", diet:"Folate-rich foods, Vitamin C, avoid smoking.", tests:["Colposcopy","Cervical biopsy","HPV DNA test","Pap smear repeat in 3 months"], precautions:["No sexual activity until reviewed","Avoid tampons","HPV vaccination if not done","Regular Pap smears"], followup:"2 weeks" },
  cervix_koc:  { risk:"Medium",     next:"HPV treatment and gynaecology follow-up", diet:"Vitamin C and E rich foods. Avoid smoking and alcohol.", tests:["HPV genotyping","Colposcopy","Pap smear in 6 months","STI screening"], precautions:["Safe sexual practices","HPV vaccination","No smoking","Routine Pap smears"], followup:"6 months" },
  cervix_mep:  { risk:"Medium",     next:"Gynaecology follow-up in 3-6 months", diet:"Balanced diet with folate and iron. Avoid smoking.", tests:["Repeat Pap smear in 3 months","Colposcopy if persistent","HPV test"], precautions:["Regular monitoring","Avoid smoking","Safe practices","Annual screening"], followup:"3 months" },
  cervix_pab:  { risk:"Low-Medium", next:"Routine gynaecology follow-up", diet:"Balanced diet. Calcium and Vitamin D.", tests:["Hormonal profile","Repeat smear in 6 months","Pelvic ultrasound if symptomatic"], precautions:["Regular Pap smears","Report abnormal bleeding","Routine gynaecology care"], followup:"6 months" },
  cervix_sfi:  { risk:"Low",        next:"Routine annual Pap smear", diet:"Healthy balanced diet. Folic acid supplementation.", tests:["Annual Pap smear","HPV screening every 3 years"], precautions:["Annual screening","HPV vaccination","Healthy lifestyle"], followup:"12 months" },
};

const RISK_COLOR = { High:"#EF4444", Medium:"#F59E0B", Low:"#22C55E", "Low-Medium":"#F59E0B" };
const FREE_LIMIT = 5;

const getUsers    = () => JSON.parse(localStorage.getItem("onco_users") || "{}");
const saveUsers   = u  => localStorage.setItem("onco_users", JSON.stringify(u));
const getSession  = () => JSON.parse(localStorage.getItem("onco_session") || "null");
const saveSession = s  => localStorage.setItem("onco_session", JSON.stringify(s));
const clearSession= () => localStorage.removeItem("onco_session");
const getScanCount= e  => parseInt(localStorage.getItem(`scans_${e}`) || "0");
const incScanCount= e  => localStorage.setItem(`scans_${e}`, getScanCount(e) + 1);

// ── Shared UI
const Spinner = () => <span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}} />;

function Btn({ children, onClick, color="#7C6FF7", disabled, full, outline, small, style:sx={} }) {
  return <button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":disabled?"rgba(255,255,255,0.06)":`linear-gradient(135deg,${color},${color}BB)`,border:outline?`1.5px solid ${color}`:"none",borderRadius:small?8:12,padding:small?"8px 16px":"13px 26px",fontSize:small?13:14,fontWeight:600,color:disabled?"rgba(255,255,255,0.3)":outline?color:"#fff",cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",transition:"all 0.18s",boxShadow:(!disabled&&!outline)?`0 4px 18px ${color}30`:"none",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit",...sx}}>{children}</button>;
}

function Input({ label, type="text", value, onChange, placeholder }) {
  return <div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:13,fontWeight:500,color:"rgba(238,240,248,0.6)",marginBottom:5}}>{label}</label>}<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 14px",fontSize:14,color:"#EEF0F8",outline:"none",fontFamily:"inherit"}} /></div>;
}

function Card({children,style:sx={}}) {
  return <div style={{background:"#0E1220",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:22,...sx}}>{children}</div>;
}

function SectionTag({children}) {
  return <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"rgba(238,240,248,0.35)",marginBottom:10}}>{children}</div>;
}

// ── PDF Generator
function generatePDF(result, session) {
  const { cancer, prediction, confidence_pct, all_probs, inference_ms, model_accuracy, class_label, imageURL } = result;
  const adv = ADVICE[prediction] || ADVICE.normal;
  const rc  = RISK_COLOR[adv.risk] || "#F59E0B";
  const date = new Date().toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"});
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OncoScan Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:0}
.wrap{max-width:780px;margin:0 auto;padding:36px}
.hdr{background:linear-gradient(135deg,${cancer.color},${cancer.color}99);color:#fff;padding:28px 32px;border-radius:14px;margin-bottom:24px}
.logo{font-size:20px;font-weight:800;margin-bottom:4px}.sub{font-size:13px;opacity:.8;margin-bottom:16px}
.pred{font-size:32px;font-weight:800;margin-bottom:4px}.lbl{font-size:14px;opacity:.85;margin-bottom:12px}
.badges{display:flex;gap:8px;flex-wrap:wrap}.badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:3px 12px;font-size:12px;font-weight:700}
.sec{margin-bottom:20px}.sec-ttl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${cancer.color};margin-bottom:10px;border-bottom:2px solid ${cancer.color}25;padding-bottom:5px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.box{background:#f8f9ff;border:1px solid #e8eaf6;border-radius:8px;padding:14px}.box-val{font-size:20px;font-weight:800;color:${cancer.color}}.box-lbl{font-size:11px;color:#888;margin-top:2px}
.adv{background:#f8f9ff;border-left:4px solid ${cancer.color};border-radius:6px;padding:14px;margin-bottom:12px}.adv-ttl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${cancer.color};margin-bottom:6px}.adv-txt{font-size:13px;color:#444;line-height:1.6}
.li{display:flex;gap:8px;margin-bottom:6px;font-size:13px;color:#444}
.pr{display:flex;align-items:center;gap:10px;margin-bottom:7px}.pr-lbl{min-width:140px;font-size:12px;color:#444;font-family:monospace}.pr-trk{flex:1;height:5px;background:#eee;border-radius:999px;overflow:hidden}.pr-fill{height:100%;border-radius:999px}.pr-pct{font-size:11px;color:#888;min-width:40px;text-align:right}
.disc{background:#fff9ed;border:1px solid #f59e0b50;border-radius:8px;padding:12px 14px;font-size:11px;color:#92400e;line-height:1.6;margin-top:20px}
.ftr{text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999}
</style></head><body><div class="wrap">
<div class="hdr"><div class="logo">🔬 OncoScan</div><div class="sub">AI Cancer Detection Report · ${date}<br>Patient: ${session.name} · ${session.email}</div>
<div class="pred">${prediction.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div><div class="lbl">${class_label||prediction}</div>
<div class="badges"><span class="badge">${confidence_pct} Confidence</span><span class="badge">${cancer.label} Cancer</span><span class="badge" style="background:${rc}40;border-color:${rc}60">${adv.risk} Risk</span></div></div>
<div class="sec"><div class="sec-ttl">Analysis Summary</div><div class="grid2">
<div class="box"><div class="box-val">${confidence_pct}</div><div class="box-lbl">Confidence</div></div>
<div class="box"><div class="box-val" style="color:${rc}">${adv.risk}</div><div class="box-lbl">Risk Level</div></div>
<div class="box"><div class="box-val">${inference_ms}ms</div><div class="box-lbl">Inference Time</div></div>
<div class="box"><div class="box-val" style="color:#22C55E">${model_accuracy?(model_accuracy*100).toFixed(1)+"%":"97%+"}</div><div class="box-lbl">Model Accuracy</div></div></div></div>
<div class="sec"><div class="sec-ttl">Probability Distribution</div>
${Object.entries(all_probs).sort(([,a],[,b])=>b-a).map(([cls,p])=>`<div class="pr"><div class="pr-lbl">${cls.replace(/_/g," ")}</div><div class="pr-trk"><div class="pr-fill" style="width:${p*100}%;background:${cls===prediction?cancer.color:"#ccc"}"></div></div><div class="pr-pct">${(p*100).toFixed(1)}%</div></div>`).join("")}
</div>
<div class="sec"><div class="sec-ttl">Clinical Guidance</div>
<div class="adv"><div class="adv-ttl">⚡ Next Step</div><div class="adv-txt">${adv.next}<br><small style="color:#888;margin-top:6px;display:block">Follow-up: <strong style="color:${rc}">${adv.followup}</strong></small></div></div>
<div class="adv"><div class="adv-ttl">🥗 Diet Advice</div><div class="adv-txt">${adv.diet}</div></div></div>
<div class="sec"><div class="sec-ttl">Recommended Tests</div>${adv.tests.map(t=>`<div class="li"><span style="color:${cancer.color}">→</span>${t}</div>`).join("")}</div>
<div class="sec"><div class="sec-ttl">Precautions</div>${adv.precautions.map(p=>`<div class="li"><span style="color:#F59E0B">•</span>${p}</div>`).join("")}</div>
<div class="disc">⚠️ <strong>Medical Disclaimer:</strong> This AI analysis is for screening assistance only. Always consult a qualified healthcare professional for diagnosis and treatment.</div>
<div class="ftr">OncoScan · AI Cancer Detection · Built by Ashvant Narayan & Y.S. Dhivesh · ${date}</div>
</div></body></html>`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html],{type:"text/html"}));
  a.download = `OncoScan_${cancer.label}_${date.replace(/ /g,"_")}.html`;
  a.click();
}

// ── Landing
function Landing({onLogin}) {
  const features=[{i:"🧠",t:"6 Cancer Types",d:"Brain, Kidney, Breast, Oral, Blood & Cervical powered by EfficientNet-B4"},{i:"⚡",t:"Instant Results",d:"AI analysis in under 200ms with confidence scores and heatmap visualization"},{i:"📄",t:"Clinical Reports",d:"Downloadable reports with diagnosis, risk level, dietary advice and next steps"},{i:"🔒",t:"Secure & Private",d:"Scans are never stored — processed in real-time and immediately discarded"},{i:"🎯",t:"97-100% Accuracy",d:"Models trained on 130,000+ images achieve world-class accuracy"},{i:"💊",t:"Clinical Guidance",d:"Personalized precautions, dietary advice and follow-up timelines"}];
  return (
    <div style={{background:"#080B14",minHeight:"100vh"}}>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 40px",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:0,zIndex:100,background:"rgba(8,11,20,0.88)",backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🔬</div><span style={{fontSize:19,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.5px",color:"#EEF0F8"}}>OncoScan</span></div>
        <div style={{display:"flex",gap:10}}><Btn outline color="#7C6FF7" small onClick={()=>onLogin("login")}>Sign In</Btn><Btn color="#7C6FF7" small onClick={()=>onLogin("signup")}>Get Started Free</Btn></div>
      </nav>

      {/* Hero */}
      <div style={{textAlign:"center",padding:"90px 24px 70px",background:"radial-gradient(ellipse 80% 50% at 50% -5%,rgba(124,111,247,0.14),transparent)"}}>
        <div style={{display:"inline-block",background:"rgba(124,111,247,0.1)",border:"1px solid rgba(124,111,247,0.25)",borderRadius:999,padding:"5px 16px",fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:"#A89FF7",textTransform:"uppercase",marginBottom:26}}>AI-Powered Early Detection</div>
        <h1 style={{fontSize:"clamp(40px,7vw,76px)",fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1.05,letterSpacing:"-3px",marginBottom:22,background:"linear-gradient(135deg,#fff 40%,#A89FF7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Detect Cancer Early.<br/>Save Lives.</h1>
        <p style={{fontSize:18,color:"rgba(238,240,248,0.6)",maxWidth:500,margin:"0 auto 44px",lineHeight:1.65}}>Upload a medical scan and get instant AI-powered cancer detection across 6 cancer types with clinical-grade accuracy.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn color="#7C6FF7" onClick={()=>onLogin("signup")}>Start Free Analysis →</Btn>
          <Btn outline color="rgba(255,255,255,0.25)" onClick={()=>onLogin("login")}>Sign In</Btn>
        </div>
        <p style={{marginTop:18,fontSize:12,color:"rgba(238,240,248,0.3)"}}>5 free scans/month · No credit card required</p>
      </div>

      {/* Stats */}
      <div style={{display:"flex",justifyContent:"center",gap:40,padding:"36px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",background:"rgba(14,18,32,0.5)"}}>
        {[["130K+","Training Images"],["97–100%","Model Accuracy"],["6","Cancer Types"],["<200ms","Analysis Time"]].map(([v,l])=>(
          <div key={l} style={{textAlign:"center"}}>
            <div style={{fontSize:30,fontWeight:800,fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{v}</div>
            <div style={{fontSize:12,color:"rgba(238,240,248,0.35)",marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Cancer types */}
      <div style={{maxWidth:1000,margin:"0 auto",padding:"70px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}><SectionTag>Supported Cancer Types</SectionTag><h2 style={{fontSize:32,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",color:"#EEF0F8"}}>6 Types Detected</h2></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:14}}>
          {CANCERS.map(c=>(
            <div key={c.id} style={{background:c.bg,border:`1px solid ${c.color}30`,borderRadius:14,padding:"18px 14px",textAlign:"center"}}>
              <div style={{fontSize:30,marginBottom:8}}>{c.emoji}</div>
              <div style={{fontWeight:700,fontSize:14,color:c.color,marginBottom:4}}>{c.label}</div>
              <div style={{fontSize:11,color:"rgba(238,240,248,0.35)",lineHeight:1.4}}>{c.scan}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{background:"#0E1220",borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:1000,margin:"0 auto",padding:"70px 24px"}}>
          <div style={{textAlign:"center",marginBottom:40}}><h2 style={{fontSize:32,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",color:"#EEF0F8"}}>Why OncoScan?</h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {features.map(f=>(
              <div key={f.t} style={{background:"#151A2C",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:22}}>
                <div style={{fontSize:26,marginBottom:10}}>{f.i}</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:"#EEF0F8"}}>{f.t}</div>
                <div style={{fontSize:13,color:"rgba(238,240,248,0.55)",lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{maxWidth:860,margin:"0 auto",padding:"70px 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}><h2 style={{fontSize:32,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",color:"#EEF0F8"}}>Simple Pricing</h2><p style={{color:"rgba(238,240,248,0.5)",marginTop:10}}>Start free, upgrade when you need more</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:18}}>
          <Card>
            <div style={{fontSize:12,fontWeight:600,color:"rgba(238,240,248,0.35)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Free</div>
            <div style={{fontSize:40,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:3}}>₹0</div>
            <div style={{fontSize:12,color:"rgba(238,240,248,0.35)",marginBottom:20}}>Forever free</div>
            {["5 scans per month","All 6 cancer types","Basic result view","Confidence score"].map(f=><div key={f} style={{display:"flex",gap:9,alignItems:"center",marginBottom:9,fontSize:13,color:"rgba(238,240,248,0.6)"}}><span style={{color:"#22C55E"}}>✓</span>{f}</div>)}
            <div style={{marginTop:20}}><Btn outline color="#7C6FF7" full onClick={()=>onLogin("signup")}>Get Started Free</Btn></div>
          </Card>
          <div style={{background:"linear-gradient(135deg,rgba(124,111,247,0.1),rgba(75,184,169,0.06))",border:"1.5px solid rgba(124,111,247,0.35)",borderRadius:18,padding:22,position:"relative"}}>
            <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",borderRadius:999,padding:"3px 14px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",color:"#fff"}}>MOST POPULAR</div>
            <div style={{fontSize:12,fontWeight:600,color:"#A89FF7",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Premium</div>
            <div style={{fontSize:40,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:3}}>₹499<span style={{fontSize:15,color:"rgba(238,240,248,0.35)"}}>/mo</span></div>
            <div style={{fontSize:12,color:"rgba(238,240,248,0.35)",marginBottom:20}}>Everything you need</div>
            {["Unlimited scans","Full PDF report download","Heatmap visualization","Diet & precaution advice","Priority support","All future cancer types"].map(f=><div key={f} style={{display:"flex",gap:9,alignItems:"center",marginBottom:9,fontSize:13,color:"rgba(238,240,248,0.6)"}}><span style={{color:"#7C6FF7"}}>✓</span>{f}</div>)}
            <div style={{marginTop:20}}><Btn color="#7C6FF7" full onClick={()=>onLogin("signup")}>Upgrade to Premium</Btn></div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{background:"#0E1220",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:860,margin:"0 auto",padding:"70px 24px",textAlign:"center"}}>
          <SectionTag>The Team</SectionTag>
          <h2 style={{fontSize:32,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",color:"#EEF0F8",marginBottom:44}}>Built by Passionate Engineers</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:28}}>
            {[
              {name:"Ashvant Narayan",role:"Founder & AI Developer",emoji:"👨‍💻",desc:"Designed and built the entire OncoScan AI pipeline — dataset curation, model training, backend API and deployment. Passionate about applying deep learning to save lives through early cancer detection.",color:"#7C6FF7"},
              {name:"Y.S. Dhivesh",role:"Co-Founder & Data Scientist",emoji:"📊",desc:"Led data analysis, model evaluation and statistical validation across all 6 cancer models. Specialises in medical imaging pipelines and ensuring clinical-grade accuracy standards.",color:"#4BB8A9"},
            ].map(p=>(
              <div key={p.name} style={{background:"#151A2C",border:`1px solid ${p.color}20`,borderRadius:18,padding:28,textAlign:"center"}}>
                <div style={{width:76,height:76,borderRadius:"50%",background:`linear-gradient(135deg,${p.color}35,${p.color}15)`,border:`2px solid ${p.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 14px"}}>{p.emoji}</div>
                <div style={{fontWeight:800,fontSize:19,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:3}}>{p.name}</div>
                <div style={{fontSize:12,color:p.color,fontWeight:600,marginBottom:14}}>{p.role}</div>
                <div style={{fontSize:13,color:"rgba(238,240,248,0.55)",lineHeight:1.7}}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"28px 24px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10}}><div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🔬</div><span style={{fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8"}}>OncoScan</span></div>
        <p style={{fontSize:11,color:"rgba(238,240,248,0.3)"}}>AI-powered cancer detection · For screening assistance only · Always consult a qualified healthcare professional</p>
        <p style={{fontSize:11,color:"rgba(238,240,248,0.2)",marginTop:6}}>© 2026 OncoScan · Built with EfficientNet-B4 · Powered by Hugging Face</p>
      </div>
    </div>
  );
}

// ── Auth
function AuthPage({mode,onSuccess,onSwitch}) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const submit=()=>{setError("");setLoading(true);setTimeout(()=>{const users=getUsers();if(mode==="signup"){if(!name||!email||!password){setError("All fields required");setLoading(false);return;}if(password.length<6){setError("Password must be 6+ characters");setLoading(false);return;}if(users[email]){setError("Account exists. Sign in instead.");setLoading(false);return;}users[email]={name,password,premium:false};saveUsers(users);const s={email,name,premium:false};saveSession(s);onSuccess(s);}else{if(!email||!password){setError("Email and password required");setLoading(false);return;}const u=users[email];if(!u||u.password!==password){setError("Invalid email or password");setLoading(false);return;}const s={email,name:u.name,premium:u.premium};saveSession(s);onSuccess(s);}setLoading(false);},600);};
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(124,111,247,0.1),#080B14)"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px"}}>🔬</div>
          <h1 style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8"}}>{mode==="signup"?"Create Account":"Welcome Back"}</h1>
          <p style={{fontSize:13,color:"rgba(238,240,248,0.5)",marginTop:5}}>{mode==="signup"?"Start detecting cancer with AI":"Sign in to your OncoScan account"}</p>
        </div>
        <Card>
          {mode==="signup"&&<Input label="Full Name" value={name} onChange={setName} placeholder="Your name" />}
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error&&<div style={{marginBottom:14,padding:"10px 13px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",fontSize:13,color:"#FCA5A5"}}>{error}</div>}
          <Btn full color="#7C6FF7" onClick={submit} disabled={loading}>{loading?<Spinner/>:mode==="signup"?"Create Account":"Sign In"}</Btn>
          <div style={{textAlign:"center",marginTop:18,fontSize:13,color:"rgba(238,240,248,0.5)"}}>
            {mode==="signup"?"Already have an account? ":"Don't have an account? "}
            <span style={{color:"#7C6FF7",cursor:"pointer",fontWeight:600}} onClick={onSwitch}>{mode==="signup"?"Sign In":"Sign Up Free"}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Scan Page
function ScanPage({session,onResult,onUpgrade}) {
  const [selected,setSelected]=useState(null); const [imageFile,setImageFile]=useState(null); const [imageURL,setImageURL]=useState(null); const [dragging,setDragging]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState(null);
  const inputRef=useRef();
  const scanCount=getScanCount(session.email); const atLimit=!session.premium&&scanCount>=FREE_LIMIT; const cancer=CANCERS.find(c=>c.id===selected);
  const handleFile=useCallback(f=>{if(!f?.type.startsWith("image/"))return;setImageFile(f);setImageURL(URL.createObjectURL(f));setError(null);},[]);
  const analyse=async()=>{if(!selected||!imageFile)return;if(atLimit){onUpgrade();return;}setLoading(true);setError(null);try{const form=new FormData();form.append("file",imageFile);const res=await fetch(`${API_BASE}/predict/${selected}`,{method:"POST",body:form});if(!res.ok)throw new Error(`Server error ${res.status}`);const data=await res.json();incScanCount(session.email);onResult({...data,cancer,imageURL});}catch(e){setError(e.message||"Analysis failed. Try again.");}finally{setLoading(false);}};
  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"36px 24px"}}>
      <h1 style={{fontSize:28,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:6}}>New Analysis</h1>
      <p style={{color:"rgba(238,240,248,0.5)",marginBottom:28,fontSize:14}}>Select cancer type, upload your scan, get instant AI analysis.</p>
      {!session.premium&&<div style={{marginBottom:20,padding:"11px 14px",background:"rgba(124,111,247,0.07)",border:"1px solid rgba(124,111,247,0.18)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13}}><span style={{color:"rgba(238,240,248,0.6)"}}>Free scans: <strong style={{color:"#A89FF7"}}>{scanCount}/{FREE_LIMIT}</strong></span><Btn small color="#7C6FF7" onClick={onUpgrade}>Upgrade →</Btn></div>}
      <SectionTag>Step 1 — Select Cancer Type</SectionTag>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:10,marginBottom:24}}>
        {CANCERS.map(c=><div key={c.id} onClick={()=>{setSelected(c.id);setError(null);}} style={{border:`2px solid ${selected===c.id?c.color:"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"12px 8px",textAlign:"center",cursor:"pointer",transition:"all 0.16s",background:selected===c.id?c.bg:"rgba(255,255,255,0.02)",transform:selected===c.id?"translateY(-2px)":"none",boxShadow:selected===c.id?`0 5px 18px ${c.color}22`:"none"}}><div style={{fontSize:24,marginBottom:5}}>{c.emoji}</div><div style={{fontSize:11,fontWeight:700,color:selected===c.id?c.color:"rgba(238,240,248,0.6)"}}>{c.label}</div><div style={{fontSize:10,color:"rgba(238,240,248,0.3)",marginTop:2}}>{c.scan}</div></div>)}
      </div>
      <SectionTag>Step 2 — Upload Scan</SectionTag>
      <div onClick={()=>inputRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}} style={{border:`2px dashed ${dragging?"#7C6FF7":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:dragging?"rgba(124,111,247,0.05)":"rgba(255,255,255,0.01)",marginBottom:18,transition:"all 0.18s"}}>
        <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
        {imageURL?<img src={imageURL} alt="scan" style={{maxHeight:200,objectFit:"contain",borderRadius:10,margin:"0 auto"}} />:<><div style={{fontSize:34,marginBottom:8}}>📁</div><div style={{fontWeight:600,fontSize:14,marginBottom:5,color:"#EEF0F8"}}>Drop your scan here or click to browse</div><div style={{fontSize:12,color:"rgba(238,240,248,0.35)"}}>{cancer?`Expected: ${cancer.scan}`:"Select a cancer type first"} · JPG, PNG</div></>}
      </div>
      {error&&<div style={{marginBottom:14,padding:"10px 14px",borderRadius:9,background:"rgba(239,68,68,0.09)",border:"1px solid rgba(239,68,68,0.28)",fontSize:13,color:"#FCA5A5"}}>⚠️ {error}</div>}
      <Btn full color={cancer?.color||"#7C6FF7"} disabled={!selected||!imageFile||loading||atLimit} onClick={analyse}>{loading?<><Spinner/>Analysing...</>:atLimit?"Upgrade to Continue →":`Analyse ${cancer?.label||""} Scan`}</Btn>
    </div>
  );
}

// ── Results Page
function ResultsPage({result,session,onNewScan,onDownload}) {
  const {cancer,prediction,confidence,confidence_pct,all_probs,heatmap_b64,inference_ms,model_accuracy,imageURL,class_label}=result;
  const adv=ADVICE[prediction]||ADVICE.normal; const rc=RISK_COLOR[adv.risk]||"#F59E0B";
  return (
    <div style={{maxWidth:880,margin:"0 auto",padding:"36px 24px"}} className="fadeUp">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:3}}>Analysis Results</h1><p style={{color:"rgba(238,240,248,0.5)",fontSize:13}}>AI-powered cancer detection report</p></div>
        <div style={{display:"flex",gap:8}}>{session.premium&&<Btn small color="#4BB8A9" onClick={onDownload}>📄 Download PDF</Btn>}<Btn small outline color="rgba(255,255,255,0.2)" onClick={onNewScan}>New Scan</Btn></div>
      </div>

      {/* Main result */}
      <div style={{background:`linear-gradient(135deg,${cancer.color}12,${cancer.color}04)`,border:`1.5px solid ${cancer.color}35`,borderRadius:18,padding:22,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
          <span style={{fontSize:34}}>{cancer.emoji}</span>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:20,fontFamily:"'Syne',sans-serif",color:"#EEF0F8"}}>{prediction.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div><div style={{fontSize:12,color:"rgba(238,240,248,0.5)",marginTop:2}}>{class_label||prediction}</div></div>
          <div style={{display:"flex",gap:8}}><span style={{background:`${rc}18`,border:`1px solid ${rc}45`,borderRadius:999,padding:"4px 12px",fontSize:12,fontWeight:700,color:rc}}>{adv.risk} Risk</span><span style={{background:`${cancer.color}18`,border:`1px solid ${cancer.color}45`,borderRadius:999,padding:"4px 12px",fontSize:12,fontWeight:700,color:cancer.color}}>{confidence_pct}</span></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
          {[["Original Scan",imageURL],["AI Heatmap",`data:image/png;base64,${heatmap_b64}`]].map(([l,s])=>(
            <div key={l} style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)"}}><img src={s} alt={l} style={{height:190,width:"100%",objectFit:"cover"}} /><div style={{padding:"7px 11px",fontSize:10,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"rgba(238,240,248,0.35)",background:"rgba(0,0,0,0.25)"}}>{l}</div></div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{fontWeight:600,color:"#EEF0F8"}}>Confidence</span><span style={{color:cancer.color,fontWeight:700}}>{confidence_pct}</span></div>
        <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:999,overflow:"hidden",marginBottom:18}}><div style={{height:"100%",width:`${confidence*100}%`,background:`linear-gradient(90deg,${cancer.color},${cancer.color}AA)`,borderRadius:999,transition:"width 0.8s ease"}} /></div>
        <SectionTag>All Probabilities</SectionTag>
        {Object.entries(all_probs).sort(([,a],[,b])=>b-a).map(([cls,prob])=>(
          <div key={cls} style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,fontSize:12}}>
            <span style={{minWidth:130,fontFamily:"monospace",color:"rgba(238,240,248,0.6)"}}>{cls.replace(/_/g," ")}</span>
            <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:999}}><div style={{height:"100%",width:`${prob*100}%`,background:cls===prediction?cancer.color:"rgba(255,255,255,0.14)",borderRadius:999,transition:"width 0.6s ease"}} /></div>
            <span style={{fontSize:11,color:"rgba(238,240,248,0.35)",minWidth:38,textAlign:"right"}}>{(prob*100).toFixed(1)}%</span>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16}}>
          {[[confidence_pct,"Confidence",cancer.color],[`${inference_ms}ms`,"Inference"],[model_accuracy?`${(model_accuracy*100).toFixed(1)}%`:"97%+","Accuracy","#22C55E"]].map(([v,l,c])=>(
            <div key={l} style={{background:"rgba(0,0,0,0.2)",borderRadius:9,padding:"11px 12px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:c||"#EEF0F8"}}>{v}</div><div style={{fontSize:10,color:"rgba(238,240,248,0.3)",marginTop:2}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Clinical advice */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginBottom:16}}>
        <Card style={{borderLeft:`3px solid ${rc}`}}><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:rc,marginBottom:10}}>⚡ Next Step</div><p style={{fontSize:13,color:"rgba(238,240,248,0.65)",lineHeight:1.6,marginBottom:8}}>{adv.next}</p><div style={{fontSize:11,color:"rgba(238,240,248,0.35)"}}>Follow-up: <strong style={{color:rc}}>{adv.followup}</strong></div></Card>
        <Card><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#22C55E",marginBottom:10}}>🥗 Diet Advice</div><p style={{fontSize:13,color:"rgba(238,240,248,0.65)",lineHeight:1.65}}>{adv.diet}</p></Card>
        <Card><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#4BB8A9",marginBottom:10}}>🔬 Recommended Tests</div>{adv.tests.map(t=><div key={t} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:7,fontSize:12,color:"rgba(238,240,248,0.6)"}}><span style={{color:"#4BB8A9",marginTop:1}}>→</span>{t}</div>)}</Card>
        <Card><div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#F59E0B",marginBottom:10}}>⚠️ Precautions</div>{adv.precautions.map(p=><div key={p} style={{display:"flex",gap:7,alignItems:"flex-start",marginBottom:7,fontSize:12,color:"rgba(238,240,248,0.6)"}}><span style={{color:"#F59E0B",marginTop:1}}>•</span>{p}</div>)}</Card>
      </div>

      <div style={{padding:"12px 16px",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.18)",borderRadius:10,fontSize:12,color:"rgba(245,158,11,0.75)",lineHeight:1.6}}>⚠️ <strong>Medical Disclaimer:</strong> This AI analysis is for screening assistance only. Always consult a qualified healthcare professional for diagnosis and treatment.</div>

      {!session.premium&&<div style={{marginTop:14,padding:"14px 18px",background:"rgba(124,111,247,0.07)",border:"1px solid rgba(124,111,247,0.2)",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}><div><div style={{fontWeight:700,fontSize:14,color:"#EEF0F8",marginBottom:2}}>Download Full PDF Report</div><div style={{fontSize:12,color:"rgba(238,240,248,0.5)"}}>Upgrade to Premium for downloadable reports & unlimited scans</div></div><Btn small color="#7C6FF7">Upgrade ₹499/mo</Btn></div>}
    </div>
  );
}

// ── Upgrade Modal
function UpgradeModal({onClose,onUpgrade}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}} onClick={onClose}>
      <div style={{background:"#0E1220",border:"1px solid rgba(255,255,255,0.1)",borderRadius:22,padding:34,maxWidth:420,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:22}}><div style={{fontSize:38,marginBottom:10}}>⭐</div><h2 style={{fontSize:22,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:6}}>Upgrade to Premium</h2><p style={{color:"rgba(238,240,248,0.5)",fontSize:13}}>You've used all your free scans this month</p></div>
        {["Unlimited scans every month","Full PDF report download","All future cancer types","Priority support"].map(f=><div key={f} style={{display:"flex",gap:9,alignItems:"center",marginBottom:10,fontSize:13,color:"rgba(238,240,248,0.65)"}}><span style={{color:"#7C6FF7",fontSize:15}}>✓</span>{f}</div>)}
        <div style={{marginTop:22,display:"flex",flexDirection:"column",gap:9}}>
          <Btn full color="#7C6FF7" onClick={onUpgrade}>Upgrade for ₹499/month</Btn>
          <Btn full outline color="rgba(255,255,255,0.15)" onClick={onClose}>Maybe later</Btn>
        </div>
      </div>
    </div>
  );
}

// ── App Nav
function AppNav({session,page,setPage,onLogout}) {
  return (
    <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 28px",borderBottom:"1px solid rgba(255,255,255,0.07)",position:"sticky",top:0,zIndex:100,background:"rgba(8,11,20,0.9)",backdropFilter:"blur(16px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}} onClick={()=>setPage("scan")}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🔬</div><span style={{fontWeight:800,fontFamily:"'Syne',sans-serif",fontSize:17,color:"#EEF0F8"}}>OncoScan</span></div>
        <div style={{display:"flex",gap:3}}>{[["scan","Scan"],["history","History"]].map(([p,l])=><button key={p} onClick={()=>setPage(p)} style={{background:page===p?"rgba(124,111,247,0.1)":"transparent",border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:600,color:page===p?"#A89FF7":"rgba(238,240,248,0.5)",cursor:"pointer",transition:"all 0.15s"}}>{l}</button>)}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {session.premium&&<span style={{background:"linear-gradient(135deg,#7C6FF7,#4BB8A9)",borderRadius:999,padding:"2px 10px",fontSize:10,fontWeight:700,color:"#fff"}}>PREMIUM</span>}
        <span style={{fontSize:12,color:"rgba(238,240,248,0.5)"}}>{session.name}</span>
        <button onClick={onLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"5px 11px",fontSize:11,color:"rgba(238,240,248,0.4)",cursor:"pointer"}}>Sign Out</button>
      </div>
    </nav>
  );
}

// ── Main
export default function App() {
  const [view,setView]=useState("landing"); const [authMode,setAuthMode]=useState("login"); const [session,setSession]=useState(null); const [page,setPage]=useState("scan"); const [result,setResult]=useState(null); const [showUpgrade,setShowUpgrade]=useState(false); const [history,setHistory]=useState([]);
  useEffect(()=>{const s=getSession();if(s){setSession(s);setView("app");}},[]);
  const handleLogin=m=>{setAuthMode(m);setView("auth");};
  const handleAuthSuccess=s=>{setSession(s);setView("app");setPage("scan");};
  const handleLogout=()=>{clearSession();setSession(null);setView("landing");setResult(null);};
  const handleResult=r=>{setResult(r);setHistory(h=>[r,...h.slice(0,19)]);setPage("result");};
  const handleDownload=()=>{if(result&&session)generatePDF(result,session);};
  const handleUpgrade=()=>setShowUpgrade(true);
  const handleConfirmUpgrade=()=>{const users=getUsers();if(users[session.email]){users[session.email].premium=true;saveUsers(users);}const ns={...session,premium:true};setSession(ns);saveSession(ns);setShowUpgrade(false);alert("✅ Premium activated! Unlimited scans and PDF downloads enabled.");};
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{background:#080B14;color:#EEF0F8;font-family:'Plus Jakarta Sans',sans-serif}img{display:block;max-width:100%}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}.fadeUp{animation:fadeUp 0.45s ease forwards}`}</style>
      {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)} onUpgrade={handleConfirmUpgrade} />}
      {view==="landing"&&<Landing onLogin={handleLogin} />}
      {view==="auth"&&<AuthPage mode={authMode} onSuccess={handleAuthSuccess} onSwitch={()=>setAuthMode(m=>m==="login"?"signup":"login")} />}
      {view==="app"&&session&&(
        <div style={{minHeight:"100vh",background:"#080B14"}}>
          <AppNav session={session} page={page} setPage={setPage} onLogout={handleLogout} />
          {page==="scan"&&<ScanPage session={session} onResult={handleResult} onUpgrade={handleUpgrade} />}
          {page==="result"&&result&&<ResultsPage result={result} session={session} onNewScan={()=>setPage("scan")} onDownload={handleDownload} />}
          {page==="history"&&(
            <div style={{maxWidth:760,margin:"0 auto",padding:"36px 24px"}}>
              <h1 style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#EEF0F8",marginBottom:22}}>Scan History</h1>
              {history.length===0?<Card><p style={{color:"rgba(238,240,248,0.4)",textAlign:"center",padding:28}}>No scans yet. Start your first analysis!</p></Card>:history.map((r,i)=>(
                <div key={i} onClick={()=>{setResult(r);setPage("result");}} style={{background:"#0E1220",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:16,marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.15s"}}>
                  <span style={{fontSize:26}}>{r.cancer.emoji}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:"#EEF0F8"}}>{r.prediction.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div><div style={{fontSize:11,color:"rgba(238,240,248,0.35)",marginTop:2}}>{r.cancer.label} · {r.confidence_pct}</div></div>
                  <span style={{fontSize:11,color:"rgba(238,240,248,0.3)"}}>View →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
