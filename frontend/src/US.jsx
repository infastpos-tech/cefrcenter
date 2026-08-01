// US.jsx — Onboarding: username, qayerdan, daraja — 4 qadam
import React, { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  ChevronRight,
  Shield,
  User,
  AlertCircle,
  Loader2,
  Users,
  Search,
  Globe,
  Send,
  BookOpen,
  Star
} from "lucide-react";

import BACKEND_URL from "./config/api.js";
const BOT_TOKEN = "8968436498:AAEMGT-rJ2tRR1-2bWDFi1OTqkgQ_Dhpm3o";
const CHAT_ID = "7747756904";

const InstagramIcon = ({ size, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const HEAR_ABOUT_OPTIONS = [
  { id: "telegram",   label: "Telegram",                icon: <Send size={20} />,          color: "#3b82f6" },
  { id: "instagram",  label: "Instagram",               icon: <InstagramIcon size={20} />, color: "#e1306c" },
  { id: "google",     label: "Google / Qidiruv",        icon: <Search size={20} />,        color: "#4ade80" },
  { id: "friend",     label: "Do'st / Tavsiya",         icon: <Users size={20} />,         color: "#f59e0b" },
  { id: "other",      label: "Boshqa",                  icon: <Globe size={20} />,         color: "#a855f7" }
];

const CEFR_LEVELS = [
  { value: "A1", label: "A1", desc: "Boshlang'ich", color: "#378ADD", emoji: "🌱" },
  { value: "A2", label: "A2", desc: "Elementar",    color: "#1D9E75", emoji: "🌿" },
  { value: "B1", label: "B1", desc: "O'rta",        color: "#EF9F27", emoji: "📚" },
  { value: "B2", label: "B2", desc: "Yuqori o'rta", color: "#D85A30", emoji: "🚀" },
  { value: "C1", label: "C1", desc: "Ilg'or",       color: "#7F77DD", emoji: "⭐" },
];

export default function US({ onSelect }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [hearAbout, setHearAbout] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [otherText, setOtherText] = useState("");

  const totalSteps = 4;

  const handleFinish = async () => {
    if (!username || !isAvailable || !hearAbout || !selectedLevel || isFinishing) return;
    setIsFinishing(true);

    const finalVia = hearAbout === "Boshqa" ? (otherText || "Boshqa") : hearAbout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const text = `🎉 *Yangi Ro'yxat — CEFR Center*\n\n` +
                   `👤 *Foydalanuvchi:* ${username}\n` +
                   `📊 *Daraja:* ${selectedLevel}\n` +
                   `🔍 *Qayerdan topdi:* ${finalVia}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
        signal: controller.signal
      });
    } catch (e) {
      console.warn("Telegram bildirishnoma xatosi (bloklamas):", e.message);
    } finally {
      clearTimeout(timeoutId);
    }

    if (typeof onSelect === "function") {
      onSelect(username, finalVia, selectedLevel);
    } else {
      console.warn("US: onSelect topilmadi", { username, finalVia, selectedLevel });
    }
  };

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckLoading(true);
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`, { signal: controller.signal });
        clearTimeout(tid);
        const data = await resp.json();
        setIsAvailable(data.available);
        setSuggestions(data.suggestions || []);
      } catch (e) {
        console.warn("Username tekshiruvi offline, ruxsat berildi:", e.message);
        setIsAvailable(true);
        setSuggestions([]);
      } finally {
        setIsCheckLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif",
      color: "var(--text-primary)",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .onboarding-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .suggestion-chip {
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 99px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
          transition: all 0.2s;
        }
        .suggestion-chip:hover { background: var(--bg-primary); }
        .level-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .level-card:hover { transform: translateY(-3px); }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: 32,
        padding: 40,
        position: "relative",
        zIndex: 10,
        animation: "fadeIn 0.6s ease-out",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)"
      }}>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} style={{
              width: s === step ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: s < step ? "#4ade80" : s === step ? "var(--text-primary)" : "var(--border)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Zap size={40} color="var(--text-primary)" fill="var(--text-primary)" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>CEFR Center'ga xush kelibsiz</h1>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.6 }}>
              Ingliz tilini zamonaviy va samarali o'rganish platformasi. Keling, profilingizni sozlaylik.
            </p>
            <button onClick={() => setStep(2)} style={{ width: "100%", height: 56, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 18, fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              Boshlash <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Username ── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Qadam 1 / 3</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Hisobingiz nomini yozing</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Liderbordda ko'rinadigan noyob nom tanlang.</p>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Masalan: ali_karimov"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))}
                style={{
                  width: "100%",
                  height: 56,
                  background: "var(--bg-primary)",
                  border: `2px solid ${isAvailable === true ? "#4ade80" : isAvailable === false ? "#f87171" : "var(--border)"}`,
                  borderRadius: 16,
                  padding: "0 52px 0 20px",
                  color: "var(--text-primary)",
                  fontSize: 16,
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              <div style={{ position: "absolute", right: 16, top: 18 }}>
                {isCheckLoading ? <Loader2 size={20} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} /> :
                  isAvailable === true ? <CheckCircle2 size={20} color="#4ade80" /> :
                  isAvailable === false ? <AlertCircle size={20} color="#f87171" /> :
                  <User size={20} color="var(--text-muted)" />}
              </div>
            </div>

            <div style={{ marginTop: 12, minHeight: 20 }}>
              {isCheckLoading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Tekshirilmoqda...</p>}
              {!isCheckLoading && isAvailable === true && <p style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>✅ Bu nom mavjud!</p>}
              {!isCheckLoading && isAvailable === false && <p style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>❌ Bu nom band!</p>}
              {username.length > 0 && username.length < 3 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Kamida 3 ta belgi kiriting.</p>}
            </div>

            {isAvailable === false && suggestions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Bularni sinab ko'ring:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map(s => (
                    <div key={s} className="suggestion-chip" onClick={() => setUsername(s)}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!isAvailable}
              onClick={() => setStep(3)}
              style={{
                width: "100%",
                height: 56,
                marginTop: 32,
                background: isAvailable ? "var(--text-primary)" : "var(--border)",
                opacity: isAvailable ? 1 : 0.5,
                color: isAvailable ? "var(--bg-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 16,
                fontWeight: 800,
                cursor: isAvailable ? "pointer" : "not-allowed",
                fontSize: 16,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
              Keyingi qadam <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 3: Level Selection ── */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Qadam 2 / 3</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Darajangizni tanlang</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Hozirgi ingliz tili darajangiz qaysi? Testlar shunga ko'ra tartiblanadi.</p>
            </div>

            {/* Levels: C1 at top, A1 at bottom — higher is harder, lower is easier */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...CEFR_LEVELS].reverse().map(lvl => {
                const isSelected = selectedLevel === lvl.value;
                return (
                  <div
                    key={lvl.value}
                    className="level-card"
                    onClick={() => setSelectedLevel(lvl.value)}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 16,
                      background: isSelected ? `${lvl.color}18` : "var(--bg-primary)",
                      border: `2px solid ${isSelected ? lvl.color : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      boxShadow: isSelected ? `0 4px 20px ${lvl.color}30` : "none",
                    }}>
                    {/* Emoji badge */}
                    <div style={{
                      width: 46, height: 46,
                      borderRadius: 13,
                      background: isSelected ? `${lvl.color}25` : "var(--bg-secondary)",
                      border: `1px solid ${isSelected ? lvl.color : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0
                    }}>
                      {lvl.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: isSelected ? lvl.color : "var(--text-primary)" }}>{lvl.label}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          background: isSelected ? `${lvl.color}20` : "var(--bg-secondary)",
                          color: isSelected ? lvl.color : "var(--text-muted)",
                          padding: "2px 10px", borderRadius: 99,
                          border: `1px solid ${isSelected ? lvl.color + "50" : "var(--border)"}`
                        }}>{lvl.desc}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={22} color={lvl.color} style={{ flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>

            <button
              disabled={!selectedLevel}
              onClick={() => setStep(4)}
              style={{
                width: "100%",
                height: 56,
                marginTop: 28,
                background: selectedLevel ? "var(--text-primary)" : "var(--border)",
                opacity: selectedLevel ? 1 : 0.5,
                color: selectedLevel ? "var(--bg-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 16,
                fontWeight: 800,
                cursor: selectedLevel ? "pointer" : "not-allowed",
                fontSize: 16,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
              Keyingi qadam <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 4: How did you hear about us? ── */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Qadam 3 / 3</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>Qayerdan topdingiz?</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>CEFR Center haqida qayerdan bildingiz?</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {HEAR_ABOUT_OPTIONS.map(opt => {
                const isSelected = hearAbout === opt.label;
                const isHovered = hoveredOption === opt.id;
                return (
                  <div
                    key={opt.id}
                    className="onboarding-btn"
                    onClick={() => { setHearAbout(opt.label); if (opt.label !== "Boshqa") setOtherText(""); }}
                    onMouseEnter={() => setHoveredOption(opt.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 14,
                      background: isSelected ? `${opt.color}15` : "var(--bg-primary)",
                      border: `1px solid ${isSelected ? opt.color : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                      transform: isHovered || isSelected ? 'scale(1.02) translateY(-2px)' : 'none',
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}>
                    <div style={{ color: isSelected ? opt.color : "var(--text-muted)", transition: "color 0.3s ease" }}>{opt.icon}</div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? opt.color : "var(--text-primary)", transition: "color 0.3s ease" }}>{opt.label}</span>
                    {isSelected && <CheckCircle2 size={18} color={opt.color} style={{ marginLeft: "auto" }} />}
                  </div>
                );
              })}
            </div>

            {hearAbout === "Boshqa" && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Qayerdan topginingizni yozing..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  style={{
                    width: "100%",
                    height: 50,
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "0 20px",
                    color: "var(--text-primary)",
                    fontSize: 15,
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            )}

            <button
              disabled={!hearAbout || isFinishing}
              onClick={handleFinish}
              style={{
                width: "100%",
                height: 60,
                marginTop: 32,
                background: (hearAbout && !isFinishing) ? "var(--text-primary)" : "var(--border)",
                opacity: (hearAbout && !isFinishing) ? 1 : 0.5,
                color: (hearAbout && !isFinishing) ? "var(--bg-primary)" : "var(--text-muted)",
                border: "none",
                borderRadius: 16,
                fontWeight: 800,
                cursor: (hearAbout && !isFinishing) ? "pointer" : "not-allowed",
                fontSize: 16,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10
              }}>
              {isFinishing
                ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Kuting...</>
                : <><Shield size={20} /> Boshlash</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}