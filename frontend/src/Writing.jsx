// Writing.jsx — CEFR Center — Backend AI grading + error highlighting + dashboard sync (Apple Light Design)
import React, { useState, useEffect } from "react";
import { scoreToWritingBand } from "./scoring";

import BACKEND_URL from "./config/api.js";
const BACKEND = BACKEND_URL;

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_TOTAL_SCORE = 75; // 15 + 20 + 40
const RAW_MAX = 75;

const CRITERIA = [
  { key: "task",     label: "Task Achievement",     color: "#0071e3", icon: "✦" },
  { key: "cohesion", label: "Coherence & Cohesion", color: "#34c759", icon: "⇄" },
  { key: "lexical",  label: "Lexical Resource",      color: "#5e5ce6", icon: "Aa" },
  { key: "grammar",  label: "Grammar & Accuracy",    color: "#ff9500", icon: "※" },
];

const ERR_COLORS = {
  Grammar:     { bg: "rgba(255,59,48,0.10)",   border: "#ff3b30", text: "#d70015", dot: "#ff3b30" },
  Spelling:    { bg: "rgba(255,149,0,0.10)",  border: "#ff9500", text: "#c25e00", dot: "#ff9500" },
  Vocabulary:  { bg: "rgba(94,92,230,0.10)", border: "#5e5ce6", text: "#3634a3", dot: "#5e5ce6" },
  Style:       { bg: "rgba(0,113,227,0.10)",  border: "#0071e3", text: "#004085", dot: "#0071e3" },
  Punctuation: { bg: "rgba(52,199,89,0.10)",  border: "#34c759", text: "#1a7a3a", dot: "#34c759" },
};
const EC_FB = ERR_COLORS.Spelling;

const ACCENT_ORANGE = "#ff9500";
const ACCENT_BG = "rgba(255,149,0,0.08)";
const ACCENT_BORDER = "rgba(255,149,0,0.20)";

function isGibberish(text) {
  if (!text || text.trim().length < 25) return true;
  const words = text.trim().split(/\s+/);
  if (words.length < 8) return true;

  if ((text.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi) || []).length > 2) return true; 
  
  const noVowel = words.filter(w => w.length > 2 && !/[aeiouy]/i.test(w)).length;
  if (noVowel > words.length * 0.2) return true;

  const unique = new Set(words.map(w => w.toLowerCase()));
  if (unique.size < words.length * 0.4 && words.length > 10) return true;

  const common = ["the", "and", "i", "to", "a", "of", "in", "is", "it", "you", "that", "this"];
  const commonCount = words.filter(w => common.includes(w.toLowerCase())).length;
  if (commonCount < 1 && words.length > 5) return true;

  return false;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────
function Ic({ n, s = 16, c = "currentColor" }) {
  const st = { width: s, height: s, display: "inline-block", flexShrink: 0, verticalAlign: "middle" };
  const m = {
    pen:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>,
    check: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    back:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    next:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    warn:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    retry: <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>,
    eye:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    bolt:  <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    star:  <svg style={st} viewBox="0 0 24 24" fill={c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 8.26 12 2"/></svg>,
    tag:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    spin:  <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/></svg>,
    mic:   <svg style={st} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  };
  return m[n] || null;
}

// ─── Error Highlight ──────────────────────────────────────────────────────────
function HighlightedText({ text, errors, activeErr, onErrClick }) {
  if (!errors?.length) {
    return <p style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 2.1, whiteSpace: "pre-wrap", margin: 0 }}>{text}</p>;
  }
  const positioned = errors
    .map(e => ({ ...e, idx: text.indexOf(e.original) }))
    .filter(e => e.idx !== -1)
    .sort((a, b) => a.idx - b.idx);
  const segs = [];
  let pos = 0;
  for (const e of positioned) {
    if (e.idx < pos) continue;
    if (e.idx > pos) segs.push({ text: text.slice(pos, e.idx), err: null });
    segs.push({ text: e.original, err: e });
    pos = e.idx + e.original.length;
  }
  if (pos < text.length) segs.push({ text: text.slice(pos), err: null });
  return (
    <p style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 2.1, whiteSpace: "pre-wrap", margin: 0 }}>
      {segs.map((seg, i) => {
        if (!seg.err) return <span key={i}>{seg.text}</span>;
        const col = ERR_COLORS[seg.err.type] || EC_FB;
        const active = activeErr?.original === seg.err.original;
        return (
          <span key={i} onClick={() => onErrClick(seg.err)}
            style={{ background: active ? col.bg.replace("0.10","0.25") : col.bg, borderBottom: `2.5px solid ${col.border}`, borderRadius: "3px 3px 0 0", padding: "1px 4px", cursor: "pointer", color: col.text, fontWeight: 600, transition: "background .15s" }}
            title={`${seg.err.type}: ${seg.err.explanation}`}>
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

function ErrLegend({ errors }) {
  const types = [...new Set((errors || []).map(e => e.type))];
  if (!types.length) return null;
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
      {types.map(t => {
        const col = ERR_COLORS[t] || EC_FB;
        const cnt = errors.filter(e => e.type === t).length;
        return (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: col.text, background: col.bg, border: `1px solid ${col.border}`, padding: "3px 10px", borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, display: "inline-block" }} />
            {t} ({cnt})
          </span>
        );
      })}
    </div>
  );
}

function CriterionBar({ crit, score, maxPerCrit }) {
  const pct  = Math.round((score / maxPerCrit) * 100);
  const band = pct >= 85 ? "Excellent" : pct >= 65 ? "Good" : pct >= 45 ? "Fair" : "Needs Work";
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 13, color: crit.color, fontWeight: 800 }}>{crit.icon}</span>
          <span style={{ fontSize: 13, color: "#1d1d1f", fontWeight: 600 }}>{crit.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: crit.color, background: `${crit.color}15`, padding: "1px 8px", borderRadius: 10, fontWeight: 700 }}>{band}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: crit.color }}>
            {score}<span style={{ fontSize: 11, color: "#6e6e73", fontWeight: 500 }}>/{maxPerCrit}</span>
          </span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: crit.color, borderRadius: 3, transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Writing({ progress, scores, saveScore, addXP, addCoins, tests: propTests = [] }) {
  const [tests,      setTests]      = useState(propTests);
  const [loading,    setLoading]    = useState(propTests.length === 0);
  const [view,       setView]       = useState("list");
  const [sel,        setSel]        = useState(null);
  const [pIdx,       setPIdx]       = useState(0);
  const [texts,      setTexts]      = useState({});
  const [results,    setResults]    = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [validErr,   setValidErr]   = useState("");
  const [activeErr,  setActiveErr]  = useState(null);

  useEffect(() => {
    if (propTests && propTests.length > 0) {
      setTests(propTests);
      setLoading(false);
    }
  }, [propTests]);

  const part  = sel?.parts?.[pIdx];
  const isPart3 = part?.id?.includes("P2") || pIdx === 2;

  const text  = texts[part?.id] || "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const res   = results[part?.id];

  async function submit() {
    if (words < part.minWords) {
      setValidErr(`At least ${part.minWords} words required. You have ${words}.`);
      return;
    }
    if (isGibberish(text)) {
      setValidErr("Please write meaningful English content.");
      return;
    }
    setSubmitting(true);
    setValidErr("");
    setActiveErr(null);

    try {
      const resp = await fetch(`${BACKEND}/api/ai/writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          partTitle:  part.title,
          prompt:     part.prompt,
          partNum:    part.id.includes("P1.1") ? "1.1" : (part.id.includes("P1.2") ? "1.2" : "2"),
          words,
        }),
      });

      if (!resp.ok) throw new Error(`Server error ${resp.status}`);
      const data = await resp.json();

      const pN = part.partNum || (part.id.includes("P1") ? 1 : 3);
      const maxForThisPart = pN === 1 ? 15 : (pN === 2 ? 20 : 40);
      const maxPerCrit = maxForThisPart / 4;

      const sc = {
        task:     Math.min(maxPerCrit, data.scores?.task     || 0),
        cohesion: Math.min(maxPerCrit, data.scores?.cohesion || 0),
        lexical:  Math.min(maxPerCrit, data.scores?.lexical  || 0),
        grammar:  Math.min(maxPerCrit, data.scores?.grammar  || 0),
      };
      
      const totalScore = Math.round(sc.task + sc.cohesion + sc.lexical + sc.grammar);
      const bandInfo   = scoreToWritingBand(totalScore, maxForThisPart);

      const errors = (data.errors || []).filter(e =>
        e.original && typeof e.original === "string" && text.includes(e.original)
      );

      const result = {
        scores: sc,
        totalScore,
        ...bandInfo,
        evaluation:  String(data.evaluation  || "").trim(),
        feedback:    String(data.feedback    || "").trim(),
        modelAnswer: String(data.modelAnswer || "").trim(),
        errors,
        originalText: text,
      };

      setResults(prev => ({ ...prev, [part.id]: result }));

      const scoreKey = `${sel.id}_${part.id}`;
      const xpKey    = `writing_${scoreKey}`;
      saveScore?.("writing", scoreKey, totalScore);
      if (!progress?.completed?.[xpKey]) {
        const xp = Math.max(1, Math.round(totalScore * 0.5));
        addXP?.(xp, xpKey, xp);
        if (totalScore > 0) addCoins?.(Math.round(totalScore / 15), `writing_${scoreKey}`);
      }
    } catch (e) {
      setValidErr(e.message || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  function goNext() {
    setActiveErr(null);
    if (pIdx < sel.parts.length - 1) setPIdx(p => p + 1);
    else setView("list");
  }

  // ── LIST ────────────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        .w-card:hover{transform:translateY(-3px) !important;box-shadow:0 12px 40px rgba(0,0,0,0.10) !important;}
      `}</style>
      <div style={{
        background: "linear-gradient(135deg, rgba(255,149,0,0.08) 0%, rgba(94,92,230,0.04) 100%)",
        border: `1px solid ${ACCENT_BORDER}`,
        borderRadius: 20, padding: "22px 24px", marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 4, display: "flex", alignItems: "center", gap: 8, letterSpacing: "-0.5px" }}>
          <Ic n="pen" s={22} c={ACCENT_ORANGE} /><span style={{ color: ACCENT_ORANGE }}>Writing</span> Practice
        </h2>
        <p style={{ color: "#6e6e73", fontSize: 13, margin: 0 }}>4-criterion AI grading · Error detection · Model answers · XP &amp; coins</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50, color: "#6e6e73" }}>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(255,149,0,0.2)", borderTopColor: ACCENT_ORANGE, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          Loading tests...
        </div>
      ) : tests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, background: "#ffffff", border: "1px dashed rgba(0,0,0,0.12)", borderRadius: 14, color: "#6e6e73" }}>
          No writing tests found. Check backend connection.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {tests.map(t => {
            const partScores = (t.parts || []).map(p => scores?.[`writing_${t.id}_${p.id}`]).filter(s => s != null);
            const totalSc = partScores.reduce((a, b) => a + b, 0);
            const allDone = partScores.length === (t.parts || []).length && partScores.length > 0;
            const bi      = (partScores.length > 0) ? scoreToWritingBand(totalSc, 75) : null;
            return (
              <div key={t.id} className="w-card"
                onClick={() => { setSel(t); setPIdx(0); setView("test"); setActiveErr(null); }}
                style={{
                  background: allDone ? ACCENT_BG : "#ffffff",
                  border: `1px solid ${allDone ? ACCENT_BORDER : "rgba(0,0,0,0.08)"}`,
                  borderRadius: 14, padding: "14px 18px", cursor: "pointer", transition: "all .2s ease",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: allDone ? ACCENT_BG : "rgba(0,0,0,0.04)", border: `1.5px solid ${allDone ? ACCENT_BORDER : "rgba(0,0,0,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {allDone ? <Ic n="check" s={18} c={ACCENT_ORANGE} /> : <span style={{ fontSize: 14, fontWeight: 700, color: "#aeaeb2" }}>{tests.indexOf(t) + 1}</span>}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 3 }}>{t.title}</h3>
                    <p style={{ fontSize: 12, color: "#6e6e73", margin: 0 }}>{t.level} · {(t.parts || []).length} tasks{partScores.length > 0 ? ` · ${partScores.length}/${(t.parts||[]).length} done` : ""}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {partScores.length > 0 && <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 700, color: bi?.color || ACCENT_ORANGE }}>{totalSc}/75</div><div style={{ fontSize: 10, color: bi?.color || "#6e6e73", fontWeight: 600 }}>Band {bi?.band || "?"}</div></div>}
                  <Ic n="next" s={14} c="#6e6e73" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── TEST ────────────────────────────────────────────────────────────────────
  if (view === "test" && part) return (
    <div style={{ animation: "fadeUp .3s ease", maxWidth: 700, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
      `}</style>

      <button onClick={() => { setView("list"); setActiveErr(null); }}
        style={{ color: ACCENT_ORANGE, background: "none", border: "none", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500 }}>
        <Ic n="back" s={14} c={ACCENT_ORANGE} /> Back
      </button>

      {/* Part tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {sel.parts.map((p, idx) => {
          const done = !!results[p.id];
          const sc   = results[p.id]?.totalScore;
          const act  = pIdx === idx;
          return (
            <button key={p.id} onClick={() => { setPIdx(idx); setActiveErr(null); }}
              style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${act ? ACCENT_ORANGE : done ? "#34c759" : "rgba(0,0,0,0.10)"}`, color: act ? ACCENT_ORANGE : done ? "#34c759" : "#6e6e73", cursor: "pointer", fontSize: 12, fontWeight: 600, background: act ? ACCENT_BG : "#ffffff", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              {done && <Ic n="check" s={10} c="#34c759" />}
              Part {idx + 1}
              {done && sc != null && <span style={{ fontSize: 10, color: "#34c759", fontWeight: 700 }}>{sc}</span>}
            </button>
          );
        })}
      </div>

      {/* Prompt card */}
      <div style={{ background: "#ffffff", border: `1px solid ${ACCENT_BORDER}`, borderRadius: 16, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT_ORANGE, background: ACCENT_BG, padding: "2px 9px", borderRadius: 6 }}>{part.level}</span>
          <h3 style={{ color: "#1d1d1f", fontSize: 14, fontWeight: 600, margin: 0 }}>{part.title}</h3>
        </div>
        <p style={{ color: "#1d1d1f", lineHeight: 1.75, fontSize: 14, margin: "0 0 10px" }}>{part.prompt}</p>
        {part.tips?.length > 0 && (
          <div style={{ background: "#f5f5f7", borderRadius: 10, padding: "10px 14px", borderLeft: `3.5px solid ${ACCENT_ORANGE}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT_ORANGE, marginBottom: 6, textTransform: "uppercase" }}>Tips</p>
            {part.tips.map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: "#6e6e73", marginBottom: 3, display: "flex", gap: 6 }}>
                <span style={{ color: ACCENT_ORANGE }}>›</span> {t}
              </div>
            ))}
          </div>
        )}
        
        {part.images?.length > 0 && !isPart3 && (
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {part.images.map((img, i) => (
              <img key={i} src={img} alt={`Task Part ${i+1}`} style={{ maxWidth: "100%", height: "auto", maxHeight: 200, borderRadius: 12, border: "1px solid rgba(0,0,0,0.10)" }} />
            ))}
          </div>
        )}
        <p style={{ fontSize: 12, color: "#6e6e73", marginTop: 10, marginBottom: 0 }}>Min {part.minWords} – Max {part.maxWords} words</p>
      </div>

      {/* ── RESULT VIEW ── */}
      {res ? (
        <div style={{ animation: "fadeUp .4s ease" }}>
          {/* Score banner */}
          <div style={{ background: `linear-gradient(135deg,${res.color}10,${res.color}04)`, border: `1px solid ${res.color}30`, borderRadius: 20, padding: "24px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 58, fontWeight: 700, color: res.color, lineHeight: 1, letterSpacing: "-2px" }}>{res.totalScore}</div>
              <div style={{ fontSize: 11, color: "#6e6e73" }}>/{(part.partNum === 1 || part.id.includes("P1")) ? 15 : (part.partNum === 2 ? 20 : 40)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: res.color, marginBottom: 8 }}>Band {res.band} · {res.cefr}</div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${Math.round((res.totalScore / ((part.partNum === 1 || part.id.includes("P1")) ? 15 : (part.partNum === 2 ? 20 : 40))) * 100)}%`, background: res.color, borderRadius: 3, transition: "width 1.2s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "#6e6e73" }}>{words} words · {res.errors?.length || 0} error{res.errors?.length !== 1 ? "s" : ""} detected</div>
            </div>
          </div>

          {/* Criteria breakdown */}
          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Ic n="star" s={15} c={ACCENT_ORANGE} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>Score Breakdown</span>
              <span style={{ fontSize: 11, color: "#6e6e73", marginLeft: "auto" }}>Specific to {(part.partNum === 1 || part.id.includes("P1")) ? "Letter" : "Essay"} criteria</span>
            </div>
            {CRITERIA.map(cr => <CriterionBar key={cr.key} crit={cr} score={res.scores[cr.key]} maxPerCrit={((part.partNum === 1 || part.id.includes("P1")) ? 15 : (part.partNum === 2 ? 20 : 40)) / 4} />)}
          </div>

          {/* Error highlight */}
          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ic n="eye" s={15} c={ACCENT_ORANGE} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>Your Essay — Annotated</span>
              {res.errors?.length > 0 && <span style={{ fontSize: 11, color: "#6e6e73", marginLeft: "auto" }}>Tap underlined text for fix</span>}
            </div>
            {res.errors?.length > 0 ? (
              <>
                <ErrLegend errors={res.errors} />
                <div style={{ background: "#f5f5f7", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <HighlightedText text={res.originalText} errors={res.errors} activeErr={activeErr}
                    onErrClick={e => setActiveErr(p => p?.original === e.original ? null : e)} />
                </div>
                {activeErr && (() => {
                  const col = ERR_COLORS[activeErr.type] || EC_FB;
                  return (
                    <div style={{ background: "#f5f5f7", border: `1.5px solid ${col.border}`, borderRadius: 12, padding: "12px 16px", marginTop: 10, animation: "fadeIn .2s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, background: col.dot, color: "#fff", padding: "2px 9px", borderRadius: 20 }}>{activeErr.type}</span>
                          <span style={{ fontSize: 13, color: "#ff3b30", textDecoration: "line-through", fontWeight: 600 }}>{activeErr.original}</span>
                          <span style={{ fontSize: 12, color: "#6e6e73" }}>→</span>
                          <span style={{ fontSize: 13, color: "#34c759", fontWeight: 700 }}>{activeErr.correction}</span>
                        </div>
                        <button onClick={() => setActiveErr(null)} style={{ background: "none", border: "none", color: "#6e6e73", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, marginLeft: 8 }}>×</button>
                      </div>
                      <p style={{ fontSize: 12, color: "#6e6e73", margin: "8px 0 0", lineHeight: 1.6 }}>{activeErr.explanation}</p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.18)", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <Ic n="check" s={18} c="#34c759" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1a7a3a", margin: "0 0 2px" }}>No language errors found!</p>
                  <p style={{ fontSize: 12, color: "#6e6e73", margin: 0 }}>Grammar, spelling, and vocabulary look correct.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Comprehensive Feedback */}
          <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Ic n="mic" s={15} c="#0071e3" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>Examiner Feedback</span>
            </div>
            <p style={{ fontSize: 13, color: "#6e6e73", lineHeight: 1.6, margin: 0 }}>{res.feedback}</p>
          </div>

          {/* Error list */}
          {res.errors?.length > 0 && (
            <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Ic n="tag" s={15} c="#ff3b30" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>All Errors ({res.errors.length})</span>
              </div>
              <div style={{ display: "grid", gap: 7 }}>
                {res.errors.map((err, i) => {
                  const col  = ERR_COLORS[err.type] || EC_FB;
                  const isAc = activeErr?.original === err.original;
                  return (
                    <div key={i} onClick={() => setActiveErr(p => p?.original === err.original ? null : err)}
                      style={{ background: isAc ? col.bg : "#f5f5f7", border: `1px solid ${isAc ? col.border : "rgba(0,0,0,0.06)"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "all .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: col.dot, padding: "2px 8px", borderRadius: 20 }}>{err.type}</span>
                        <span style={{ fontSize: 13, color: "#ff3b30", textDecoration: "line-through", fontWeight: 600 }}>{err.original}</span>
                        <span style={{ fontSize: 12, color: "#6e6e73" }}>→</span>
                        <span style={{ fontSize: 13, color: "#34c759", fontWeight: 700 }}>{err.correction}</span>
                      </div>
                      {isAc && <p style={{ fontSize: 12, color: "#6e6e73", margin: "8px 0 0", lineHeight: 1.5 }}>{err.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evaluation */}
          {res.evaluation && (
            <div style={{ background: "#ffffff", borderLeft: `4px solid ${res.color}`, borderRadius: "0 14px 14px 0", padding: "16px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: res.color, marginBottom: 8, textTransform: "uppercase" }}>Examiner Evaluation</p>
              <p style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{res.evaluation}</p>
            </div>
          )}

          {/* Model answer */}
          {res.modelAnswer && (
            <div style={{ background: "rgba(0,113,227,0.04)", border: "1px solid rgba(0,113,227,0.12)", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#0071e3", marginBottom: 8, textTransform: "uppercase" }}>📝 Model Answer</p>
              <p style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.85, fontStyle: "italic", whiteSpace: "pre-wrap", margin: 0 }}>{res.modelAnswer}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setResults(p => { const n = { ...p }; delete n[part.id]; return n; }); setActiveErr(null); }}
              style={{ flex: 1, padding: 14, borderRadius: 14, background: "#ffffff", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1d1d1f", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>
              <Ic n="retry" s={15} c="#6e6e73" /> Try Again
            </button>
            <button onClick={goNext}
              style={{ flex: 1, padding: 14, borderRadius: 14, background: ACCENT_ORANGE, color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", boxShadow: `0 4px 16px rgba(255,149,0,0.25)` }}>
              {pIdx < sel.parts.length - 1 ? "Next Part" : "Finish"} <Ic n="next" s={15} c="#fff" />
            </button>
          </div>
        </div>
      ) : (
        /* ── WRITE AREA ── */
        <>
          <textarea value={text}
            onChange={e => setTexts(p => ({ ...p, [part.id]: e.target.value }))}
            placeholder="Write your response here…"
            style={{ width: "100%", minHeight: 260, background: "#ffffff", border: "1.5px solid rgba(0,0,0,0.10)", borderRadius: 16, padding: 18, color: "#1d1d1f", fontFamily: "inherit", fontSize: 15, outline: "none", resize: "vertical", lineHeight: 1.85, boxSizing: "border-box", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
            onFocus={e => e.target.style.borderColor = ACCENT_ORANGE}
            onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.10)"}
          />
          <div style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.06)", marginTop: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, Math.round((words / part.maxWords) * 100))}%`, background: words < part.minWords ? "#ff3b30" : words <= part.maxWords ? "#34c759" : ACCENT_ORANGE, borderRadius: 2, transition: "width .25s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: words >= part.minWords ? "#34c759" : "#6e6e73" }}>
              {words} <span style={{ color: "#aeaeb2", fontWeight: 400 }}>/ {part.minWords}–{part.maxWords} words</span>
            </span>
            <button onClick={submit} disabled={submitting}
              style={{ padding: "11px 28px", borderRadius: 12, background: submitting ? "#f5f5f7" : ACCENT_ORANGE, color: submitting ? "#aeaeb2" : "#fff", fontWeight: 600, border: "none", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13, boxShadow: submitting ? "none" : `0 4px 16px rgba(255,149,0,0.25)` }}>
              {submitting
                ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.15)", borderTopColor: "#6e6e73", animation: "spin .7s linear infinite", display: "inline-block" }} /> Grading…</>
                : <><Ic n="check" s={14} c="#fff" /> Submit</>}
            </button>
          </div>
          {validErr && (
            <div style={{ color: "#d70015", fontSize: 13, marginTop: 12, display: "flex", alignItems: "center", gap: 7, background: "rgba(255,59,48,0.06)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,59,48,0.18)" }}>
              <Ic n="warn" s={14} c="#ff3b30" /> {validErr}
            </div>
          )}
          {submitting && (
            <div style={{ marginTop: 14, background: "#ffffff", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT_ORANGE, display: "inline-block", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 13, color: ACCENT_ORANGE, fontWeight: 700 }}>AI Analysis in progress...</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { text: "Checking grammar and spelling", done: true },
                  { text: "Analyzing task achievement", done: words > 50 },
                  { text: "Generating examiner feedback", done: false }
                ].map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: s.done ? "#34c759" : "#6e6e73", display: "flex", alignItems: "center", gap: 6 }}>
                    <Ic n="check" s={10} c={s.done ? "#34c759" : "#aeaeb2"} /> {s.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return null;
}