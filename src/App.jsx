import { useState, useCallback, useRef } from "react";

const API_BASE = "https://2k22cse013-oncoscan-api.hf.space";

const ORGANS = [
  { id: "brain",    label: "Brain",    emoji: "🧠", scan: "MRI Scan",     color: "#7C6FF7" },
  { id: "kidney",   label: "Kidney",   emoji: "🫘", scan: "CT Scan",      color: "#4BB8A9" },
  { id: "breast",   label: "Breast",   emoji: "🎗️", scan: "Biopsy Slide", color: "#E879A0" },
  { id: "oral",     label: "Oral",     emoji: "👄", scan: "Biopsy Slide", color: "#F59E0B" },
  { id: "blood",    label: "Blood",    emoji: "🩸", scan: "Blood Smear",  color: "#EF4444" },
  { id: "cervical", label: "Cervical", emoji: "🔬", scan: "Pap Smear",    color: "#8B5CF6" },
];

export default function LivarixAI() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [imageFile, setImageFile]         = useState(null);
  const [imageURL, setImageURL]           = useState(null);
  const [dragging, setDragging]           = useState(false);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const inputRef = useRef();

  const organ = ORGANS.find(o => o.id === selectedOrgan);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImageURL(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onAnalyse = async () => {
    if (!selectedOrgan || !imageFile) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.append("file", imageFile);
      const res  = await fetch(`${API_BASE}/predict/${selectedOrgan}`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F0F1A 0%, #1A1030 50%, #0A1628 100%)", fontFamily: "'DM Sans', -apple-system, sans-serif", color: "#F0EEF8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .organ-card:hover { transform: translateY(-3px) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 40px", borderBottom:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100, background:"rgba(15,15,26,0.85)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:22, fontWeight:800, letterSpacing:"-0.5px" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, #7C6FF7, #4BB8A9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔬</div>
          <span>Livarix <span style={{ color:"#7C6FF7" }}>AI</span></span>
        </div>
        <div style={{ fontSize:12, color:"rgba(240,238,248,0.4)", background:"rgba(124,111,247,0.1)", border:"1px solid rgba(124,111,247,0.2)", borderRadius:999, padding:"5px 14px" }}>
          6 Cancer Types · AI-Powered
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"72px 20px 52px" }}>
        <div style={{ display:"inline-block", background:"rgba(124,111,247,0.12)", border:"1px solid rgba(124,111,247,0.25)", borderRadius:999, padding:"6px 18px", fontSize:12, fontWeight:600, letterSpacing:"0.08em", color:"#A89FF7", textTransform:"uppercase", marginBottom:22 }}>
          Early Detection Saves Lives
        </div>
        <h1 style={{ fontSize:"clamp(34px,5.5vw,60px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-2px", marginBottom:18, background:"linear-gradient(135deg, #fff 30%, #A89FF7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          AI Cancer Detection<br />Powered by Livarix
        </h1>
        <p style={{ fontSize:17, color:"rgba(240,238,248,0.55)", maxWidth:480, margin:"0 auto", lineHeight:1.65 }}>
          Upload a medical scan and get an instant AI analysis across 6 cancer types — with visual heatmap overlay and confidence score.
        </p>
      </div>

      {/* Main */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"0 20px 80px" }}>

        {/* Step 1 */}
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(240,238,248,0.35)", marginBottom:14 }}>
          Step 1 — Select cancer type
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(125px, 1fr))", gap:10, marginBottom:28 }}>
          {ORGANS.map(o => (
            <div key={o.id}
              className="organ-card"
              onClick={() => { setSelectedOrgan(o.id); setResult(null); setError(null); }}
              style={{ border: selectedOrgan === o.id ? `2px solid ${o.color}` : "2px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 10px", textAlign:"center", cursor:"pointer", transition:"all 0.2s ease", background: selectedOrgan === o.id ? `${o.color}18` : "rgba(255,255,255,0.02)", transform: selectedOrgan === o.id ? "translateY(-2px)" : "none", boxShadow: selectedOrgan === o.id ? `0 8px 24px ${o.color}28` : "none" }}>
              <span style={{ fontSize:26, marginBottom:7, display:"block" }}>{o.emoji}</span>
              <span style={{ fontSize:13, fontWeight:600, color: selectedOrgan === o.id ? o.color : "rgba(240,238,248,0.65)" }}>{o.label}</span>
              <span style={{ fontSize:10, color:"rgba(240,238,248,0.3)", marginTop:3, display:"block" }}>{o.scan}</span>
            </div>
          ))}
        </div>

        {/* Step 2 */}
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(240,238,248,0.35)", marginBottom:14 }}>
          Step 2 — Upload scan
        </p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{ border:`2px dashed ${dragging ? "#7C6FF7" : "rgba(255,255,255,0.1)"}`, borderRadius:18, padding:"44px 24px", textAlign:"center", cursor:"pointer", transition:"all 0.2s ease", background: dragging ? "rgba(124,111,247,0.07)" : "rgba(255,255,255,0.02)", marginBottom:20 }}>
          <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFile(e.target.files[0])} />
          {imageURL ? (
            <img src={imageURL} alt="scan" style={{ maxHeight:220, objectFit:"contain", borderRadius:10, margin:"0 auto", display:"block" }} />
          ) : (
            <>
              <span style={{ fontSize:38, marginBottom:10, display:"block" }}>📂</span>
              <p style={{ fontSize:15, fontWeight:600, marginBottom:5 }}>Drop your scan here or click to browse</p>
              <p style={{ fontSize:12, color:"rgba(240,238,248,0.35)" }}>
                {organ ? `Expected: ${organ.scan}` : "Select a cancer type first"} · JPG, PNG
              </p>
            </>
          )}
        </div>

        {/* Analyse button */}
        <button
          disabled={!selectedOrgan || !imageFile || loading}
          onClick={onAnalyse}
          style={{ background: (!selectedOrgan || !imageFile || loading) ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${organ?.color || "#7C6FF7"}, ${organ?.color || "#7C6FF7"}BB)`, border:"none", borderRadius:12, padding:"14px 32px", fontSize:15, fontWeight:700, color: (!selectedOrgan || !imageFile || loading) ? "rgba(255,255,255,0.25)" : "#fff", cursor: (!selectedOrgan || !imageFile || loading) ? "not-allowed" : "pointer", width:"100%", transition:"all 0.2s ease", boxShadow: (!selectedOrgan || !imageFile || loading) ? "none" : `0 4px 24px ${organ?.color || "#7C6FF7"}35` }}>
          {loading
            ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                <span style={{ display:"inline-block", width:18, height:18, border:"2px solid rgba(255,255,255,0.25)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                Analysing with Livarix AI...
              </span>
            : `Analyse ${organ ? organ.label : ""} Scan`}
        </button>

        {/* Error */}
        {error && (
          <div style={{ marginTop:14, padding:"12px 16px", borderRadius:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", fontSize:13, color:"#FCA5A5" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="fade-up" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden", marginTop:22 }}>

            {/* Result header */}
            <div style={{ background:`linear-gradient(135deg, ${organ.color}20, ${organ.color}06)`, borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"20px 24px", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:30 }}>{organ.emoji}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:19 }}>
                  {result.prediction.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div style={{ fontSize:12, color:"rgba(240,238,248,0.45)", marginTop:3 }}>{result.class_label}</div>
              </div>
              <div style={{ marginLeft:"auto" }}>
                <span style={{ background:`${organ.color}22`, border:`1px solid ${organ.color}45`, borderRadius:999, padding:"5px 15px", fontSize:13, fontWeight:700, color:organ.color }}>
                  {result.confidence_pct}
                </span>
              </div>
            </div>

            <div style={{ padding:"24px" }}>
              {/* Image pair */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
                {[
                  { src: imageURL, label: "Original Scan" },
                  { src: `data:image/png;base64,${result.heatmap_b64}`, label: "AI Heatmap Overlay" }
                ].map(({ src, label }) => (
                  <div key={label} style={{ borderRadius:12, overflow:"hidden", background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <img src={src} alt={label} style={{ width:"100%", height:180, objectFit:"cover", display:"block" }} />
                    <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.07em", color:"rgba(240,238,248,0.35)", textTransform:"uppercase", padding:"7px 12px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
                  <span style={{ fontWeight:600 }}>Confidence</span>
                  <span style={{ color:organ.color, fontWeight:700 }}>{result.confidence_pct}</span>
                </div>
                <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${result.confidence * 100}%`, background:`linear-gradient(90deg, ${organ.color}, ${organ.color}99)`, borderRadius:999, transition:"width 0.9s ease" }} />
                </div>
              </div>

              {/* All probabilities */}
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(240,238,248,0.3)", marginBottom:12 }}>All probabilities</p>
              {Object.entries(result.all_probs).sort(([,a],[,b]) => b - a).map(([cls, prob]) => (
                <div key={cls} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ minWidth:130, color:"rgba(240,238,248,0.6)", fontFamily:"monospace", fontSize:12 }}>{cls.replace(/_/g," ")}</span>
                  <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.05)", borderRadius:999 }}>
                    <div style={{ height:"100%", width:`${prob*100}%`, borderRadius:999, background: cls === result.prediction ? organ.color : "rgba(255,255,255,0.18)", transition:"width 0.7s ease" }} />
                  </div>
                  <span style={{ color:"rgba(240,238,248,0.4)", fontSize:12, minWidth:42, textAlign:"right" }}>{(prob*100).toFixed(1)}%</span>
                </div>
              ))}

              {/* Stats */}
              <div style={{ display:"flex", gap:12, marginTop:20, flexWrap:"wrap" }}>
                {[
                  { val: result.confidence_pct, lbl: "Confidence", col: organ.color },
                  { val: `${result.inference_ms}ms`, lbl: "Inference time", col: "#fff" },
                  { val: result.model_accuracy ? `${(result.model_accuracy*100).toFixed(1)}%` : "97%+", lbl: "Model accuracy", col: "#4BB8A9" },
                ].map(({ val, lbl, col }) => (
                  <div key={lbl} style={{ flex:1, minWidth:90, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 14px" }}>
                    <div style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.5px", color:col }}>{val}</div>
                    <div style={{ fontSize:11, color:"rgba(240,238,248,0.35)", marginTop:2 }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ marginTop:20, background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:12, padding:"12px 16px", fontSize:12, color:"rgba(245,158,11,0.75)", lineHeight:1.6 }}>
                ⚠️ <strong>Medical Disclaimer:</strong> Livarix AI is for screening assistance only and does not constitute a medical diagnosis. Always consult a qualified healthcare professional for medical advice.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", padding:"24px", borderTop:"1px solid rgba(255,255,255,0.05)", fontSize:12, color:"rgba(240,238,248,0.25)" }}>
        Livarix AI · 6 Cancer Types · Powered by EfficientNet-B4
      </div>
    </div>
  );
}
