// Reading.jsx — all 5 part types
import React, { useState, useCallback } from "react";
import { scoreToWritingBand } from "./scoring";
import SectionLeaderboard from "./components/SectionLeaderboard.jsx";

const GROQ = import.meta.env.VITE_GROQ_API_KEY || "";
const MAX = 75;

async function ai(prompt) {
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ}` },
      body: JSON.stringify({ model: "llama3-70b-8192", messages: [{ role: "user", content: prompt }], max_tokens: 400, temperature: 0.3 }),
    });
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "";
  } catch { return ""; }
}

function I({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const m = {
    book: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    x: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    back: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
    next: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>,
    star: <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    trash: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
    down: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>,
  };
  return m[n] || null;
}

const CLR = "#378ADD";
function norm(s) { return (s || "").toLowerCase().trim().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }

function scoreLocal(part, ans) {
  let c = 0;
  const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
  items.forEach((item, i) => {
    const ua = ans[i] ?? "";
    const ptype = part.type;
    if (ptype === "gap_fill" || ptype === "sentence_completion") {
      const s = typeof ua === "string" ? ua : "";
      if (norm(s) === norm(item.answer) || (item.alt || []).map(norm).includes(norm(s))) c++;
    } else if (ptype === "matching_text" || ptype === "heading_match") {
      if (String(ua).trim().toUpperCase() === String(item.answer).trim().toUpperCase()) c++;
    } else if (ptype === "true_false") {
      if (norm(String(ua)) === norm(String(item.answer)) && ua !== "") c++;
    } else {
      // mcq_reading, short_answer, summary, multiple_choice, matching_headings
      if (typeof item.answer === "number") {
        if (Number(ua) === item.answer && ua !== "") c++;
      } else if (typeof item.answer === "string" && !isNaN(Number(item.answer))) {
        if (Number(ua) === Number(item.answer) && ua !== "") c++;
      } else {
        if (norm(String(ua)) === norm(String(item.answer)) && ua !== "") c++;
      }
    }
  });
  return { correct: c, total: items.length };
}

export default function Reading({ progress, scores, saveScore, addXP, clearSectionScores, tests = [] }) {
  const [view, setView] = useState("list");
  const [sel, setSel] = useState(null);
  const [pIdx, setPIdx] = useState(0);
  const [allAns, setAllAns] = useState({});
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const openTest = (t) => { setSel(t); setPIdx(0); setAllAns({}); setResult(null); setView("test"); };
  const setAns = useCallback((pid, idx, v) => { setAllAns(p => ({ ...p, [pid]: { ...(p[pid] || {}), [idx]: v } })); }, []);
  const getAns = useCallback((pid, idx) => allAns[pid]?.[idx] ?? "", [allAns]);

  const submit = async () => {
    setChecking(true);
    const test = sel;
    let totalC = 0, totalI = 0;
    const pResults = [];
    for (const part of test.parts) {
      const ans = allAns[part.id] || {};
      const { correct, total } = scoreLocal(part, ans);
      totalC += correct; totalI += total;
      const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
      const qR = items.map((item, i) => {
        const ua = ans[i] ?? "";
        let ok = false, correctAns = item.answer || "", userAns = ua;
        const ptype = part.type;
        const qNum = item.qNum || item.num || (i + 1);
        const qText = item.question || item.q || item.label || (part.summaryText ? `Gap (${qNum})` : `Q${qNum}`);

        let opts = item.options;
        if (!opts && Array.isArray(part.options)) {
          const rawOpt = part.options[i];
          if (typeof rawOpt === "string") {
            opts = rawOpt.split(/\s+(?=[A-D]\))/).map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(rawOpt)) {
            opts = rawOpt;
          }
        }

        if (ptype === "gap_fill" || ptype === "sentence_completion") {
          ok = norm(ua) === norm(item.answer) || (item.alt || []).map(norm).includes(norm(ua));
          correctAns = item.answer || "";
          userAns = ua || "—";
        } else if (ptype === "matching_text") {
          ok = String(ua).toUpperCase() === String(item.answer).toUpperCase();
          correctAns = `${item.answer} (${part.options?.find(o => o.key === item.answer)?.name || item.answer})`;
          userAns = ua ? `${ua} (${part.options?.find(o => o.key === ua)?.name || ua})` : "—";
        } else if (ptype === "heading_match") {
          ok = String(ua).toUpperCase() === String(item.answer).toUpperCase();
          correctAns = part.headings?.find(h => h.key === item.answer)?.label || item.answer;
          userAns = ua ? part.headings?.find(h => h.key === ua)?.label || ua : "—";
        } else if (ptype === "true_false") {
          ok = norm(String(ua)) === norm(String(item.answer)) && ua !== "";
          correctAns = String(item.answer).toUpperCase();
          userAns = ua ? String(ua).toUpperCase() : "—";
        } else {
          // mcq_reading, short_answer, summary, multiple_choice, matching_headings
          if (typeof item.answer === "number" || (typeof item.answer === "string" && !isNaN(Number(item.answer)))) {
            const numAns = Number(item.answer);
            ok = Number(ua) === numAns && ua !== "";
            correctAns = opts?.[numAns] || item.answer;
            userAns = ua !== "" ? (opts?.[Number(ua)] || ua) : "—";
          } else {
            ok = norm(String(ua)) === norm(String(item.answer)) && ua !== "";
            correctAns = item.answer;
            userAns = ua || "—";
          }
        }
        return { q: `Q${qNum}: ${qText}`, userAnswer: userAns || "—", correctAnswer: correctAns, isCorrect: ok };
      });
      pResults.push({ partId: part.id, title: part.title, correct, total, qResults: qR });
    }
    const overall = totalI > 0 ? Math.round((totalC / totalI) * MAX) : 0;
    const info = scoreToWritingBand(overall, MAX);
    let feedback = "Good effort! Review the incorrect answers to improve.";
    try {
      const resp = await ai(`CEFR Reading examiner. Student scored ${overall}/${MAX} (${totalC}/${totalI} correct). Give 2 sentences of constructive advice.`);
      if (resp) feedback = resp;
    } catch { }
    setResult({ pResults, overall, totalC, totalI, info, feedback });
    saveScore("reading", `${test.id}_overall`, overall);
    if (!progress.completed?.[`reading_${test.id}`]) addXP(overall, `reading_${test.id}`);
    setChecking(false);
    setView("results");
  };

  // ── LIST ─────────────────────────────────────────────────────────────────────
  if (view === "list") {
    const doneCount = tests.filter(t => scores?.[`reading_${t.id}_overall`] != null).length;
    const bestScore = Math.max(0, ...tests.map(t => scores?.[`reading_${t.id}_overall`] ?? 0));
    return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .r-card:hover{transform:translateY(-2px) !important;box-shadow:0 8px 32px rgba(0,0,0,0.3) !important;}
      `}</style>

      {/* Hero Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(55,138,221,0.12) 0%, rgba(127,119,221,0.06) 100%)",
        border: "1px solid rgba(55,138,221,0.2)",
        borderRadius: 20, padding: "22px 24px", marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle, rgba(55,138,221,0.15) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#f0f4ff", margin: 0 }}>
                <span style={{ color: CLR }}>Reading</span> Practice
              </h2>
              <p style={{ color: "#4a5568", fontSize: 12, margin: 0 }}>CEFR-style · 5 parts · Gap fill, Matching, MCQ</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {bestScore > 0 && (
              <div style={{ background:`rgba(55,138,221,0.1)`, border:`1px solid ${CLR}44`, borderRadius:12, padding:"8px 14px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:CLR, fontWeight:700, textTransform:"uppercase" }}>Best</div>
                <div style={{ fontSize:20, fontWeight:900, color:CLR }}>{bestScore}<span style={{fontSize:11,opacity:0.6}}>/75</span></div>
              </div>
            )}
            <button onClick={() => clearSectionScores("reading_")} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4a5568", background:"transparent", border:"0.5px solid rgba(255,255,255,0.08)", padding:"5px 10px", borderRadius:7, cursor:"pointer", fontFamily:"inherit" }}>
              <I n="trash" s={12} c="#4a5568" /> Clear
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
          {[{icon:"📖",val:tests.length,label:"Tests"},{icon:"❓",val:tests.reduce((s,t)=>s+t.totalQuestions,0),label:"Questions"},{icon:"✅",val:doneCount,label:"Done",color:doneCount>0?CLR:undefined}].map(({icon,val,label,color})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:7,border:"1px solid rgba(255,255,255,0.06)"}}>
              <span style={{fontSize:14}}>{icon}</span>
              <span style={{fontSize:14,fontWeight:800,color:color||"#f0f4ff"}}>{val}</span>
              <span style={{fontSize:11,color:"#4a5568"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16, alignItems:"start" }}>
        {/* Leaderboard */}
        <div style={{ background:"linear-gradient(180deg,rgba(255,215,0,0.04),rgba(255,255,255,0.01))", border:"1px solid rgba(255,215,0,0.12)", borderRadius:16, padding:"16px 12px", position:"sticky", top:0 }}>
          <SectionLeaderboard section="reading" currentUser={progress?.user} />
        </div>

        {/* Tests */}
        <div style={{ display:"grid", gap:10 }}>
          {tests.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"#4a5568", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:14 }}>
              <div style={{fontSize:32,marginBottom:10}}>📭</div>
              <div style={{fontSize:14,fontWeight:700,color:"#8b9bbf",marginBottom:4}}>No tests available</div>
              <div style={{fontSize:12}}>Backend may be offline.</div>
            </div>
          ) : tests.map((t, idx) => {
            const saved = scores?.[`reading_${t.id}_overall`];
            const info  = saved != null ? scoreToWritingBand(saved, MAX) : null;
            const done  = saved != null;
            const pct   = done ? Math.round((saved / MAX) * 100) : 0;
            return (
              <div key={t.id} className="r-card" onClick={() => openTest(t)}
                style={{
                  background: done ? "linear-gradient(135deg,rgba(55,138,221,0.06),rgba(55,138,221,0.02))" : "rgba(255,255,255,0.02)",
                  border:`1px solid ${done ? CLR+"33" : "rgba(255,255,255,0.06)"}`,
                  borderRadius:14, padding:"14px 16px", cursor:"pointer",
                  transition:"all .2s ease", position:"relative", overflow:"hidden",
                  animation:`slideUp .4s ease ${idx*0.05}s both`,
                }}>
                {done && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${info?.color||CLR},transparent)`}} />}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                    <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background:done?`rgba(55,138,221,0.2)`:"rgba(255,255,255,0.04)", border:`2px solid ${done?CLR+"55":"rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {done ? <span style={{fontSize:16}}>✅</span> : <span style={{fontSize:14,fontWeight:900,color:"#8b9bbf"}}>{idx+1}</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#f0f4ff", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:10, background:`${CLR}20`, color:CLR, padding:"1px 7px", borderRadius:6, fontWeight:700 }}>{t.level}</span>
                        <span style={{ fontSize:10, color:"#4a5568" }}>📝 {t.totalQuestions}Q</span>
                        <span style={{ fontSize:10, color:"#4a5568" }}>⏱️ {t.duration}min</span>
                        <span style={{ fontSize:10, color:"#4a5568" }}>📚 {t.parts?.length||5} parts</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink:0, textAlign:"right" }}>
                    {info ? (
                      <><div style={{fontSize:15,fontWeight:900,color:info.color}}>{saved}<span style={{fontSize:10,opacity:0.6}}>/75</span></div>
                      <div style={{fontSize:9,color:info.color,fontWeight:700,background:`${info.color}18`,padding:"1px 6px",borderRadius:4}}>Band {info.band} · {info.cefr}</div></>
                    ) : <div style={{fontSize:11,color:"#4a5568"}}>Start →</div>}
                  </div>
                </div>
                {done && (
                  <div style={{ marginTop:10, height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:info?.color||CLR, borderRadius:2, transition:"width 1s ease" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );}

  // ── TEST VIEW ────────────────────────────────────────────────────────────────
  if (view === "test" && sel) {
    const part = sel.parts[pIdx];
    const isLast = pIdx === sel.parts.length - 1;
    const partAns = allAns[part.id] || {};
    const items = part.gaps || part.questions || part.paragraphs || part.sentences || [];
    const answered = items.filter((_, i) => partAns[i] != null && partAns[i] !== "").length;

    return (
      <div style={{ animation: "fadeUp .3s ease", maxWidth: 780, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
          <button onClick={() => setView("list")} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
            <I n="back" s={13} c="#8b9bbf" /> Tests
          </button>
          <div style={{ height: 14, width: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{sel.title}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {sel.parts.map((p, i) => {
              const hasAns = Object.keys(allAns[p.id] || {}).length > 0;
              return (
                <button key={i} onClick={() => setPIdx(i)}
                  style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${pIdx === i ? CLR : "rgba(255,255,255,0.1)"}`, background: pIdx === i ? `${CLR}22` : "transparent", color: pIdx === i ? CLR : hasAns ? "#5dcaa5" : "#8b9bbf", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  {hasAns && pIdx !== i ? <I n="check" s={9} c="#5dcaa5" /> : null}P{p.partNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part header */}
        <div style={{ background: `${CLR}0d`, border: `1px solid ${CLR}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}22`, padding: "2px 8px", borderRadius: 5 }}>PART {part.partNum}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{part.title}</span>
            <span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: "auto" }}>Q {part.questionRange}</span>
          </div>
        </div>

        {/* Instruction */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.6 }}>{part.instruction}</p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${items.length > 0 ? (answered / items.length) * 100 : 0}%`, background: CLR, borderRadius: 2, transition: "width .3s" }} />
          </div>
          <span style={{ fontSize: 11, color: "#8b9bbf", whiteSpace: "nowrap" }}>{answered}/{items.length}</span>
        </div>

        {/* ── GAP FILL ── */}
        {part.type === "gap_fill" && (
          <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: "#c8d4f0", lineHeight: 2.2 }}>
              {part.passage.split(/\(([0-9]+)\)___/g).map((seg, i) => {
                if (i % 2 === 0) return <span key={i}>{seg}</span>;
                const gapNum = parseInt(seg);
                const gapIdx = gapNum - 1;
                return (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "0 2px", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}20`, padding: "1px 5px", borderRadius: 4 }}>{gapNum}</span>
                    <input value={getAns(part.id, gapIdx)} onChange={e => setAns(part.id, gapIdx, e.target.value)}
                      placeholder="..."
                      style={{ width: 110, background: "rgba(55,138,221,0.07)", border: "none", borderBottom: `2px solid ${getAns(part.id, gapIdx) ? CLR : CLR + "55"}`, borderRadius: "4px 4px 0 0", padding: "2px 8px", color: "#f0f4ff", fontSize: 13, fontFamily: "inherit", outline: "none", textAlign: "center" }} />
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MATCHING TEXT ── */}
        {part.type === "matching_text" && (
          <div>
            <div style={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Options</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 8 }}>
                {part.options.map(o => (
                  <div key={o.key} style={{ padding: "8px 10px", borderRadius: 7, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{o.key}</span>
                      <div><p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{o.name}</p><p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{o.text}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {part.questions.map((q, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 7px", borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{q.num}</span>
                <p style={{ flex: 1, fontSize: 13, color: "#c8d4f0", lineHeight: 1.6, minWidth: 200 }}>{q.q}</p>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <select value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                    style={{ background: "#0d1624", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getAns(part.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 120, appearance: "none" }}>
                    <option value="">Select</option>
                    {part.options.map(o => <option key={o.key} value={o.key}>{o.key} — {o.name}</option>)}
                  </select>
                  <I n="down" s={10} c="#8b9bbf" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HEADING MATCH ── */}
        {part.type === "heading_match" && (
          <div>
            <div style={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 8, textTransform: "uppercase" }}>List of Headings</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
                {part.headings.map(h => <div key={h.key} style={{ fontSize: 13, color: "#c8d4f0", padding: "3px 0" }}>{h.label}</div>)}
              </div>
            </div>
            {part.paragraphs.map((para, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>Q{para.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{para.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "#8b9bbf", lineHeight: 1.65, marginBottom: 12 }}>{para.text.slice(0, 180)}...</p>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <select value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                    style={{ background: "#0d1624", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.15)"}`, borderRadius: 9, padding: "8px 32px 8px 14px", color: getAns(part.id, i) ? "#f0f4ff" : "#8b9bbf", fontSize: 13, fontFamily: "inherit", cursor: "pointer", minWidth: 200, appearance: "none" }}>
                    <option value="">Select heading...</option>
                    {part.headings.map(h => <option key={h.key} value={h.key}>{h.label}</option>)}
                  </select>
                  <I n="down" s={10} c="#8b9bbf" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MCQ READING ── */}
        {part.type === "mcq_reading" && (
          <div>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 360, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
              {part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
            </div>
            {part.questions.map((q, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{q.num}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5 }}>{q.q}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((opt, j) => {
                    const sel = getAns(part.id, i) !== "" && Number(getAns(part.id, i)) === j;
                    return (
                      <div key={j} onClick={() => setAns(part.id, i, j)}
                        style={{ padding: "9px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, border: sel ? `2px solid ${CLR}` : "1px solid rgba(255,255,255,0.07)", background: sel ? `${CLR}15` : "rgba(255,255,255,0.01)", color: sel ? "#f0f4ff" : "#8b9bbf", transition: "all .12s", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: sel ? CLR : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: sel ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                          {String.fromCharCode(65 + j)}
                        </div>
                        {opt}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SENTENCE COMPLETION ── */}
        {part.type === "sentence_completion" && (
          <div>
            <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 340, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
              {part.passage && part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
            </div>
            {part.sentences.map((s, i) => (
              <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{s.num || s.qNum || (i + 1)}</span>
                  <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.6, flex: 1 }}>{(s.text || s.question || "").replace("___", "________")}</p>
                </div>
                <input value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                  placeholder="Type your answer (max 3 words from the passage)..."
                  style={{ width: "100%", background: "#0f1a2e", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .2s" }} />
              </div>
            ))}
          </div>
        )}

        {/* ── MCQ / SHORT ANSWER / SUMMARY / MULTIPLE CHOICE ── */}
        {(part.type === "short_answer" || part.type === "summary" || part.type === "multiple_choice") && (
          <div>
            {(part.passageTitle || part.passage) && (
              <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 360, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
                {part.passageTitle && <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f0f4ff", marginBottom: 8 }}>{part.passageTitle}</h4>}
                {part.passage && part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
              </div>
            )}

            {part.summaryText && (
              <div style={{ background: "#0d1829", border: "1px solid rgba(55,138,221,0.2)", borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 13, color: "#e2e8f0", lineHeight: 1.8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: CLR, marginBottom: 6, textTransform: "uppercase" }}>Summary</p>
                <div>{part.summaryText}</div>
              </div>
            )}

            {items.map((q, i) => {
              const qNum = q.qNum || q.num || (i + 1);
              const qText = q.question || q.q || (part.summaryText ? `Gap (${qNum})` : "");
              let opts = q.options;
              if (!opts && Array.isArray(part.options)) {
                const rawOpt = part.options[i];
                if (typeof rawOpt === "string") {
                  opts = rawOpt.split(/\s+(?=[A-D]\))/).map(s => s.trim()).filter(Boolean);
                } else if (Array.isArray(rawOpt)) {
                  opts = rawOpt;
                }
              }

              return (
                <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{qNum}</span>
                    {qText && <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5 }}>{qText}</p>}
                  </div>

                  {opts && opts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {opts.map((opt, j) => {
                        const isSel = getAns(part.id, i) !== "" && Number(getAns(part.id, i)) === j;
                        return (
                          <div key={j} onClick={() => setAns(part.id, i, j)}
                            style={{ padding: "9px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, border: isSel ? `2px solid ${CLR}` : "1px solid rgba(255,255,255,0.07)", background: isSel ? `${CLR}15` : "rgba(255,255,255,0.01)", color: isSel ? "#f0f4ff" : "#8b9bbf", transition: "all .12s", display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: isSel ? CLR : "rgba(255,255,255,0.06)", color: isSel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: isSel ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                              {String.fromCharCode(65 + j)}
                            </div>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <input value={getAns(part.id, i)} onChange={e => setAns(part.id, i, e.target.value)}
                      placeholder="Type your answer..."
                      style={{ width: "100%", background: "#0f1a2e", border: `1.5px solid ${getAns(part.id, i) ? CLR : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TRUE / FALSE / NOT GIVEN ── */}
        {part.type === "true_false" && (
          <div>
            {part.passage && (
              <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, maxHeight: 360, overflowY: "auto", fontSize: 13, color: "#c8d4f0", lineHeight: 1.85 }}>
                {part.passageTitle && <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f0f4ff", marginBottom: 8 }}>{part.passageTitle}</h4>}
                {part.passage.split("\n\n").map((p, i) => <p key={i} style={{ marginBottom: 10 }}>{p}</p>)}
              </div>
            )}

            {items.map((q, i) => {
              const qNum = q.qNum || q.num || (i + 1);
              const qText = q.question || q.q || "";
              const currentVal = String(getAns(part.id, i)).toUpperCase();

              return (
                <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{qNum}</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5 }}>{qText}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => {
                      const isSel = currentVal === opt;
                      return (
                        <button key={opt} onClick={() => setAns(part.id, i, opt)}
                          style={{
                            flex: 1, minWidth: 90, padding: "8px 12px", borderRadius: 8,
                            border: isSel ? `2px solid ${CLR}` : "1px solid rgba(255,255,255,0.1)",
                            background: isSel ? `${CLR}22` : "rgba(255,255,255,0.02)",
                            color: isSel ? "#f0f4ff" : "#8b9bbf",
                            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            transition: "all .12s ease"
                          }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MATCHING HEADINGS ── */}
        {part.type === "matching_headings" && (
          <div>
            {part.sections && (
              <div style={{ background: "#0d1829", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Sections</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {part.sections.map((sec, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: CLR, marginBottom: 4 }}>{sec.heading}</p>
                      <p style={{ fontSize: 12, color: "#c8d4f0", lineHeight: 1.6 }}>{sec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.map((q, i) => {
              const qNum = q.qNum || q.num || (i + 1);
              const qText = q.question || q.q || "";
              const opts = q.options || [];

              return (
                <div key={i} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{qNum}</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff", lineHeight: 1.5 }}>{qText}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {opts.map((opt, j) => {
                      const isSel = getAns(part.id, i) !== "" && Number(getAns(part.id, i)) === j;
                      return (
                        <div key={j} onClick={() => setAns(part.id, i, j)}
                          style={{ padding: "9px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13, border: isSel ? `2px solid ${CLR}` : "1px solid rgba(255,255,255,0.07)", background: isSel ? `${CLR}15` : "rgba(255,255,255,0.01)", color: isSel ? "#f0f4ff" : "#8b9bbf", transition: "all .12s", display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: isSel ? CLR : "rgba(255,255,255,0.06)", color: isSel ? "#fff" : "#8b9bbf", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", border: isSel ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                            {String.fromCharCode(65 + j)}
                          </div>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => setPIdx(p => Math.max(0, p - 1))} disabled={pIdx === 0}
            style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: pIdx === 0 ? "#4a5568" : "#8b9bbf", fontSize: 13, cursor: pIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            <I n="back" s={13} c={pIdx === 0 ? "#4a5568" : "#8b9bbf"} /> Prev
          </button>
          {!isLast ? (
            <button onClick={() => setPIdx(p => p + 1)}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: CLR, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Next Part <I n="next" s={13} c="#fff" />
            </button>
          ) : (
            <button onClick={submit} disabled={checking}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: checking ? "#1e293b" : "#1D9E75", color: checking ? "#4a5568" : "#fff", fontSize: 13, fontWeight: 700, cursor: checking ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {checking ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} /> Grading...</> : "Submit Test"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (view === "results" && result) {
    const { pResults, overall, totalC, totalI, info, feedback } = result;
    return (
      <div style={{ animation: "fadeUp .4s ease", maxWidth: 720, margin: "0 auto" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {/* Score */}
        <div style={{ background: "linear-gradient(135deg,#0f1f35,#182d45)", border: `1px solid ${info.color}44`, borderRadius: 16, padding: "24px 20px", marginBottom: 14, textAlign: "center" }}>
          <h2 style={{ fontSize: 14, color: "#8b9bbf", marginBottom: 12 }}>{sel.title}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 48, fontWeight: 800, color: info.color, lineHeight: 1 }}>{overall}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>out of {MAX}</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: info.color, lineHeight: 1 }}>{info.band}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>Band</div></div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.1)", paddingLeft: 20 }}><div style={{ fontSize: 36, fontWeight: 800, color: info.color, lineHeight: 1 }}>{info.cefr}</div><div style={{ fontSize: 11, color: "#8b9bbf" }}>CEFR</div></div>
          </div>
          <div style={{ fontSize: 12, color: "#8b9bbf", marginBottom: 10 }}>{totalC}/{totalI} correct</div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(overall / MAX) * 100}%`, background: info.color, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
        </div>

        {feedback && <div style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}><I n="star" s={13} c="#fbbf24" /><span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>AI Feedback</span></div>
          <p style={{ fontSize: 13, color: "#c8d4f0", lineHeight: 1.7 }}>{feedback}</p>
        </div>}

        <p style={{ fontSize: 11, fontWeight: 700, color: "#8b9bbf", marginBottom: 10, textTransform: "uppercase" }}>Part Breakdown</p>
        {pResults.map((r, ri) => {
          const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
          return (
            <div key={ri} style={{ background: "#18243a", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: "13px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: CLR, background: `${CLR}18`, padding: "2px 7px", borderRadius: 4 }}>P{ri + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{r.title}</span>
                </div>
                <div><span style={{ fontSize: 14, fontWeight: 800, color: pct >= 60 ? "#1D9E75" : "#e11d48" }}>{r.correct}/{r.total}</span><span style={{ fontSize: 11, color: "#8b9bbf", marginLeft: 5 }}>({pct}%)</span></div>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.07)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 60 ? "#1D9E75" : "#e11d48", borderRadius: 2 }} />
              </div>
              {r.qResults.map((qr, qi) => (
                <div key={qi} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: qi < r.qResults.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{qr.isCorrect ? <I n="check" s={12} c="#1D9E75" /> : <I n="x" s={12} c="#e11d48" />}</span>
                  <div style={{ flex: 1, fontSize: 11 }}>
                    <span style={{ color: "#8b9bbf" }}>{qr.q?.slice(0, 55)}{qr.q?.length > 55 ? "..." : ""}</span>
                    {!qr.isCorrect && <span style={{ color: "#f87171" }}> → You: <em>{qr.userAnswer}</em> · Correct: <strong style={{ color: "#5dcaa5" }}>{qr.correctAnswer}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openTest(sel)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#8b9bbf", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
          <button onClick={() => setView("list")} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: CLR, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <I n="back" s={13} c="#fff" /> Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return null;
}