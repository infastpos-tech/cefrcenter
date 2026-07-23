import React from "react";
import { Sparkles, ArrowRight, Star, BookOpen, Layers, Clock3, Shield, Mic, CheckCircle, Zap, TrendingUp, Globe2, Award } from "lucide-react";

const LEVELS = [
  { code: "A1", label: "Beginner", color: "#7C3AED" },
  { code: "A2", label: "Elementary", color: "#2563EB" },
  { code: "B1", label: "Intermediate", color: "#0EA5E9" },
  { code: "B2", label: "Upper-Int", color: "#14B8A6" },
  { code: "C1", label: "Advanced", color: "#8B5CF6" },
  { code: "C2", label: "Mastery", color: "#A855F7" },
];

const LESSONS = [
  { title: "Listening Focus", icon: <Zap size={18} />, tag: "Audio", color: "#C7D2FE" },
  { title: "Reading Sprint", icon: <BookOpen size={18} />, tag: "Text", color: "#BFDBFE" },
  { title: "Grammar Booster", icon: <Layers size={18} />, tag: "Practice", color: "#D1FAE5" },
];

function Screen({ title, subtitle, children, style = {} }) {
  return (
    <div style={{
      borderRadius: 32,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
      padding: 22,
      marginBottom: 22,
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      ...style,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>{subtitle}</p>
          <h3 style={{ margin: "8px 0 0", fontSize: 22, lineHeight: 1.2, color: "#FFFFFF", fontWeight: 800 }}>{title}</h3>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 18, background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center" }}>
          <Sparkles size={20} color="#E0E7FF" />
        </div>
      </div>
      {children}
    </div>
  );
}

export default function MobileMockup() {
  return (
    <div style={{ minHeight: "100vh", padding: 32, display: "flex", justifyContent: "center", alignItems: "flex-start", background: "radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 25%), radial-gradient(circle at bottom right, rgba(59,130,246,0.12), transparent 18%), #050816" }}>
      <div style={{ width: 360, maxWidth: "100%", position: "relative" }}>
        <div style={{
          borderRadius: 52,
          padding: 16,
          background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          boxShadow: "0 45px 90px rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.12)"
        }}>
          <div style={{
            borderRadius: 38,
            background: "linear-gradient(180deg, rgba(14,165,233,0.95), rgba(79,70,229,0.95))",
            padding: 22,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            color: "#fff"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.85, letterSpacing: "0.18em" }}>CEFR HUB</p>
                <h1 style={{ margin: "10px 0 0", fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.03em" }}>Study English like a pro.</h1>
              </div>
              <div style={{ width: 54, height: 54, borderRadius: 20, background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center" }}>
                <Star size={24} color="#F8FAFC" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Daily XP", value: "420", accent: "#F59E0B" },
                { label: "Streak", value: "9 days", accent: "#34D399" },
              ].map((card) => (
                <div key={card.label} style={{ borderRadius: 22, background: "rgba(255,255,255,0.12)", padding: 14, border: "1px solid rgba(255,255,255,0.18)" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.78)", textTransform: "uppercase", letterSpacing: "0.16em" }}>{card.label}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 800, color: card.accent }}>{card.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 24, padding: 18, border: "1px solid rgba(255,255,255,0.16)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Next milestone</p>
                  <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700 }}>Reach B2 in 12 days</p>
                </div>
                <ArrowRight size={18} color="#fff" />
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.16)" }}>
                <div style={{ width: "58%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #A78BFA, #38BDF8)" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <Screen title="Choose your path" subtitle="CEFR Levels">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
                {LEVELS.map((level) => (
                  <div key={level.code} style={{ borderRadius: 24, padding: 14, background: "rgba(255,255,255,0.08)", border: `1px solid ${level.color}33`, color: "#F8FAFC" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{level.label}</p>
                        <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 800 }}>{level.code}</p>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: 12, background: level.color, display: "grid", placeItems: "center" }}>
                        <Star size={16} color="#fff" />
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
                      <div style={{ width: `${50 + Math.round(Math.random() * 40)}%`, height: "100%", borderRadius: 999, background: level.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Screen>

            <Screen title="Today’s lessons" subtitle="Premium courses">
              <div style={{ display: "grid", gap: 14 }}>
                {LESSONS.map((lesson) => (
                  <div key={lesson.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 16, background: lesson.color, display: "grid", placeItems: "center" }}>
                      {lesson.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>{lesson.title}</p>
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{lesson.tag}</p>
                    </div>
                    <span style={{ color: "#A5B4FC", fontSize: 12, fontWeight: 700 }}>Start</span>
                  </div>
                ))}
              </div>
            </Screen>

            <Screen title="Progress tracker" subtitle="Learning pulse">
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>XP collected</p>
                    <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 800, color: "#fff" }}>3,420</p>
                  </div>
                  <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(255,255,255,0.08)", display: "grid", placeItems: "center" }}>
                    <TrendingUp size={28} color="#A5B4FC" />
                  </div>
                </div>
                <div style={{ padding: 18, borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
                  <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", marginBottom: 12 }}>
                    <div style={{ width: "74%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #818CF8, #22D3EE)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
                    <span>A1</span>
                    <span>Current</span>
                    <span>C2</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  {[{ name: "Fluency", value: 82 }, { name: "Grammar", value: 75 }, { name: "Words", value: 91 }].map((item) => (
                    <div key={item.name} style={{ borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", padding: 14, textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>{item.name}</p>
                      <p style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>{item.value}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </Screen>

            <div style={{ display: "grid", gap: 22 }}>
              <Screen title="Daily streak" subtitle="Keep momentum">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>7 days in a row</p>
                    <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 800, color: "#fff" }}>+120 XP</p>
                  </div>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #38BDF8, #A78BFA)", display: "grid", placeItems: "center", boxShadow: "0 20px 35px rgba(56,189,248,0.22)" }}>
                    <Clock3 size={28} color="#fff" />
                  </div>
                </div>
              </Screen>

              <Screen title="Vocabulary & grammar" subtitle="Smart practice">
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ borderRadius: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Word bank</p>
                      <span style={{ fontSize: 12, color: "#A5B4FC", fontWeight: 700 }}>View all</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
                      {['Eloquent', 'Vibrant', 'Mastery'].map((word) => (
                        <div key={word} style={{ minWidth: 90, padding: "10px 12px", borderRadius: 18, background: "rgba(255,255,255,0.14)", color: "#fff", fontSize: 13, fontWeight: 700 }}>{word}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ flex: 1, borderRadius: 24, padding: 18, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Grammar lesson</p>
                      <p style={{ margin: "10px 0 0", fontSize: 16, fontWeight: 700, color: "#fff" }}>Conditionals</p>
                    </div>
                    <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center" }}>
                      <Shield size={28} color="#C7D2FE" />
                    </div>
                  </div>
                </div>
              </Screen>
            </div>

            <Screen title="Quiz time" subtitle="Test your skills">
              <div style={{ display: "grid", gap: 14 }}>
                {['Choose the right answer', 'Tap the best sentence', 'Pick the phrase'].map((text) => (
                  <button key={text} style={{
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    padding: "16px 18px",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer"
                  }}>
                    <span>{text}</span>
                    <CheckCircle size={20} color="#A5B4FC" />
                  </button>
                ))}
              </div>
            </Screen>

            <Screen title="Speaking practice" subtitle="Fluency mode">
              <div style={{ padding: 20, borderRadius: 28, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", textAlign: "center" }}>
                <div style={{ margin: "0 auto 18px", width: 108, height: 108, borderRadius: 32, background: "linear-gradient(180deg, rgba(167,139,250,0.24), rgba(56,189,248,0.18))", display: "grid", placeItems: "center", boxShadow: "0 24px 50px rgba(56,189,248,0.18)" }}>
                  <div style={{ width: 58, height: 58, borderRadius: 24, background: "#0F172A", display: "grid", placeItems: "center" }}>
                    <Mic size={28} color="#A5B4FC" />
                  </div>
                  <div style={{ position: "absolute", inset: "auto auto 12px 12px", width: 24, height: 24, borderRadius: 999, background: "#7C3AED", opacity: 0.85 }} />
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>Record your answer</p>
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Practice pronunciation and rhythm with AI feedback.</p>
              </div>
            </Screen>

            <Screen title="Profile" subtitle="Your achievements">
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: 24, background: "rgba(255,255,255,0.08)", padding: 16, border: "1px solid rgba(255,255,255,0.16)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center" }}>
                    <Globe2 size={26} color="#C7D2FE" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>Lina</p>
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.72)" }}>CEFR Level B1</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  {[
                    { label: "Badges", value: 12 },
                    { label: "XP", value: "3.4k" },
                    { label: "Hours", value: 48 },
                  ].map((item) => (
                    <div key={item.label} style={{ borderRadius: 22, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: 14, textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>{item.label}</p>
                      <p style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ borderRadius: 22, padding: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Recent achievement</p>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(56,189,248,0.16)", display: "grid", placeItems: "center" }}>
                      <Award size={20} color="#38BDF8" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>Grammar Master</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Completed 5 lessons in a row</p>
                    </div>
                  </div>
                </div>
              </div>
            </Screen>
          </div>
        </div>
      </div>
    </div>
  );
}
