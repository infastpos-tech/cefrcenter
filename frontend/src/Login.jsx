import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";
import {
  Mail, Lock, User, ArrowRight, Zap, Loader2,
  Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft,
  Sparkles, Shield, BookOpen, Headphones, PenTool, Mic,
  GraduationCap, Star, Globe, Rocket, Trophy, ChevronRight
} from "lucide-react";
import { useProgress } from "./useProgress";
import "./Login.css";
import BACKEND_URL from "./config/api.js";

/* ── Floating particles ─────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    size: `${2 + Math.random() * 4}px`,
    color: i % 3 === 0
      ? "rgba(99,102,241,0.6)"
      : i % 3 === 1
      ? "rgba(139,92,246,0.5)"
      : "rgba(16,185,129,0.4)",
  }));
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="lp-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            bottom: -20,
          }}
        />
      ))}
    </>
  );
}

/* ── Feature badges (ro'yxatdan o'tish sahifasida) ── */
const FEATURES = [
  { icon: <BookOpen size={12} />, label: "Reading" },
  { icon: <Headphones size={12} />, label: "Listening" },
  { icon: <Mic size={12} />, label: "Speaking" },
  { icon: <PenTool size={12} />, label: "Writing" },
  { icon: <Sparkles size={12} />, label: "AI Feedback" },
  { icon: <Trophy size={12} />, label: "Mock Tests" },
];

/* ── CEFR level data ─────────────────────────────────── */
const LEVEL_INFO = {
  A1: { emoji: "🌱", label: "Boshlang'ich",  color: "#10b981" },
  A2: { emoji: "🌿", label: "Elementar",     color: "#14b8a6" },
  B1: { emoji: "🔥", label: "O'rta",         color: "#3b82f6" },
  B2: { emoji: "⚡", label: "Yuqori o'rta",  color: "#8b5cf6" },
  C1: { emoji: "🚀", label: "Ilg'or",        color: "#f59e0b" },
};

/* ─────────────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { updateUsername, setInitialLevel } = useProgress();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [username, setUsername]       = useState("");
  const [phone, setPhone]             = useState("");
  const [level, setLevel]             = useState("B1");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [checkLoad, setCheckLoad]     = useState(false);
  const [userStatus, setUserStatus]   = useState(null);
  const [success, setSuccess]         = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* Username availability check */
  useEffect(() => {
    if (isLoginMode) { setUserStatus(null); setError(""); return; }
    if (username.length < 3) { setUserStatus(null); return; }
    const t = setTimeout(async () => {
      setCheckLoad(true);
      try {
        const r = await fetch(
          `${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`
        );
        setUserStatus(await r.json());
      } catch { setUserStatus({ available: true }); }
      finally { setCheckLoad(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [username, isLoginMode]);

  const errMsg = (code) => ({
    "auth/invalid-credential":   "Email yoki parol noto'g'ri.",
    "auth/wrong-password":       "Kiritilgan parol noto'g'ri.",
    "auth/invalid-email":        "Iltimos, to'g'ri email kiriting.",
    "auth/weak-password":        "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
    "auth/email-already-in-use": "Bu email allaqachon ro'yxatdan o'tgan.",
    "auth/user-not-found":       "Bu email bilan hisob topilmadi.",
    "auth/user-disabled":        "Bu hisob o'chirilgan.",
  }[code] || "Autentifikatsiya xatoligi. Qaytadan urinib ko'ring.");

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const adminEmails = [
        "123456789123456789123456789",
        "123456789123456789123456789@admin.com",
        "asatillo@admin.com",
        "xolmirzayevanargiza57@gmail.com"
      ];
      const validAdminPasswords = ["123456789123456789123456789", "a1s2a3t4i5l6l7o8"];
      if (adminEmails.includes(trimmedEmail) && validAdminPasswords.includes(trimmedPassword)) {
        const firebaseEmail = trimmedEmail.includes("@") ? trimmedEmail : `${trimmedEmail}@admin.com`;
        try { await signInWithEmailAndPassword(auth, firebaseEmail, trimmedPassword); }
        catch (ae) {
          if (["auth/user-not-found", "auth/invalid-credential"].includes(ae.code)) {
            const c = await createUserWithEmailAndPassword(auth, firebaseEmail, trimmedPassword);
            await updateProfile(c.user, { displayName: "Admin" });
          } else { setError(errMsg(ae.code)); setLoading(false); return; }
        }
        navigate("/admin", { replace: true });
        setLoading(false); return;
      }

      if (isLoginMode) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        // Instant MongoDB sync + admin notification
        fetch(`${BACKEND_URL}/api/user/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cred.user.email,
            name: cred.user.displayName || email.split('@')[0],
          })
        }).catch(() => {});

        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        if (!username) { setError("Iltimos, foydalanuvchi nomini kiriting."); setLoading(false); return; }
        if (userStatus && !userStatus.available) { setError("Bu nom band. Boshqa nom tanlang."); setLoading(false); return; }
        const c = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(c.user, { displayName: username });
        setInitialLevel(level, username);
        updateUsername(username);

        // Instant MongoDB registration sync + admin notification + SMS
        fetch(`${BACKEND_URL}/api/user/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: c.user.email,
            username: username,
            name: username,
            phone: phone.trim(),
            level: level
          })
        }).catch(() => {});

        setSuccess(true);
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) { setError(errMsg(err.code)); }
    finally { setLoading(false); }
  };


  const switchMode = (mode) => {
    setIsLoginMode(mode); setError("");
    setEmail(""); setPassword(""); setUsername(""); setUserStatus(null);
  };

  return (
    <div className="lp-page">
      <Particles />

      {/* Orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      {/* Back button */}
      <button className="lp-back" onClick={() => navigate("/")}>
        <ArrowLeft size={15} strokeWidth={2.5} />
        Orqaga
      </button>

      {/* Card */}
      <div className="lp-card">

        {/* Success overlay */}
        {success && (
          <div className="lp-success-overlay">
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(16,185,129,0.5)",
              animation: "popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
            }}>
              <CheckCircle2 size={36} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                {isLoginMode ? "Xush kelibsiz! 🎉" : "Hisob yaratildi! 🚀"}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                Dashboard ga o'tilmoqda...
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981",
                  animation: `dotBounce 1s ease-in-out ${i*0.2}s infinite`,
                }} />
              ))}
            </div>
            <style>{`
              @keyframes dotBounce {
                0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1.2); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* ── LOGO ── */}
        <div>
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <Zap size={24} fill="#fff" color="#fff" />
            </div>
            <span>CEFR<b>Center</b></span>
          </div>
        </div>

        {/* ── BADGE ── */}
        <div className="lp-badge">
          <GraduationCap size={11} />
          {isLoginMode ? "Ingliz tilini professional darajada o'rganing" : "10,000+ o'quvchiga qo'shiling"}
        </div>

        {/* ── TABS ── */}
        <div className="lp-tabs">
          <button
            className={`lp-tab${isLoginMode ? " active" : ""}`}
            onClick={() => switchMode(true)}
          >
            <Shield size={15} strokeWidth={2.5} />
            Kirish
          </button>
          <button
            className={`lp-tab${!isLoginMode ? " active" : ""}`}
            onClick={() => switchMode(false)}
          >
            <Rocket size={15} strokeWidth={2.5} />
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* ── HEADING ── */}
        <div className="lp-head">
          {isLoginMode ? (
            <>
              <h2>Xush kelibsiz 👋</h2>
              <p>O'rganishni davom ettiring — har kun yangi yutug'ingiz kutmoqda</p>
            </>
          ) : (
            <>
              <h2>Hisob yarating ✨</h2>
              <p>Bir oy ichida CEFR sertifikatiga tayyorlanib oling</p>
            </>
          )}
        </div>

        {/* ── REGISTER FEATURES ── */}
        {!isLoginMode && (
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="lp-feature-pill"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {f.icon}
                {f.label}
              </div>
            ))}
          </div>
        )}

        {/* ── FORM ── */}
        <form onSubmit={handleAuth} className="lp-form">

          {/* ─ USERNAME (only register) ─ */}
          {!isLoginMode && (
            <div className="lp-field">
              <label>
                <User size={11} />
                Foydalanuvchi nomi
              </label>
              <div className={`lp-inp${userStatus?.available === false ? " err" : userStatus?.available ? " ok" : ""}`}>
                <User size={17} className="lp-ico" />
                <input
                  type="text"
                  placeholder="masalan: ali_karimov"
                  value={username}
                  onChange={e =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))
                  }
                  autoComplete="off"
                />
                <span className="lp-status">
                  {checkLoad && <Loader2 size={15} className="lp-spin" color="#6366f1" />}
                  {!checkLoad && userStatus?.available && <CheckCircle2 size={15} className="ok-ic" />}
                  {!checkLoad && userStatus?.available === false && <AlertCircle size={15} className="err-ic" />}
                </span>
              </div>
              {userStatus?.available === false && (
                <div className="lp-suggest">
                  <span>Band ·</span>
                  {userStatus.suggestions?.map(s => (
                    <button key={s} type="button" onClick={() => setUsername(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─ PHONE NUMBER (only register) ─ */}
          {!isLoginMode && (
            <div className="lp-field">
              <label>
                <Zap size={11} />
                Telefon raqamingiz (+998)
              </label>
              <div className="lp-inp">
                <span style={{ fontSize: 13, color: "#94a3b8", paddingLeft: 14, fontWeight: 700 }}>+998</span>
                <input
                  type="tel"
                  placeholder="90 123 45 67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          {/* ─ LEVEL SELECT (only register) ─ */}
          {!isLoginMode && (
            <div className="lp-field">
              <label>
                <Star size={11} />
                CEFR darajangizni tanlang
              </label>
              <div className="lp-levels">
                {Object.entries(LEVEL_INFO).map(([code, info]) => (
                  <button
                    key={code}
                    type="button"
                    className={`lp-level-btn${level === code ? " selected" : ""}`}
                    onClick={() => setLevel(code)}
                    style={level === code ? { borderColor: info.color, color: "#fff" } : {}}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{info.emoji}</span>
                    <span>{code}</span>
                    <span className="lp-level-badge">{info.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─ EMAIL / LOGIN ─ */}
          <div className="lp-field">
            <label>
              <Mail size={11} />
              Login yoki Email
            </label>
            <div className="lp-inp">
              <Mail size={17} className="lp-ico" />
              <input
                type="text"
                placeholder="123456789123456789123456789 yoki siz@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* ─ PASSWORD ─ */}
          <div className="lp-field">
            <label>
              <Lock size={11} />
              Parol
            </label>
            <div className="lp-inp">
              <Lock size={17} className="lp-ico" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={isLoginMode ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="lp-eye"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* ─ ERROR ─ */}
          {error && (
            <div className="lp-err-box">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* ─ SUBMIT ─ */}
          <button type="submit" className="lp-submit" disabled={loading}>
            {loading
              ? <Loader2 size={22} className="lp-spin" />
              : (
                <>
                  {isLoginMode ? "Kirish" : "Hisob yaratish"}
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )
            }
          </button>
        </form>

        {/* ── SWITCH MODE ── */}
        <p className="lp-switch">
          {isLoginMode ? "Yangi foydalanuvchimisiz?" : "Hisobingiz bormi?"}
          <button onClick={() => switchMode(!isLoginMode)}>
            {isLoginMode ? "Bepul hisob yarating →" : "Kirish →"}
          </button>
        </p>

        {/* ── SUPPORT ── */}
        <div className="lp-support">
          <div className="lp-support-label">
            <span className="lp-support-dot" />
            Qo'llab-quvvatlash • 24/7
          </div>
          <div className="lp-support-phone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            +998 95 533 15 28
          </div>
          <a href="tel:+998955331528" className="lp-call-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Admin bilan bog'lanish
          </a>
        </div>

      </div>
    </div>
  );
}