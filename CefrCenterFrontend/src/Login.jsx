import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, provider } from "./firebase";
import {
  Mail, Lock, User, ArrowRight, Zap, Loader2,
  Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft
} from "lucide-react";
import { useProgress } from "./useProgress";
import "./Login.css";
import BACKEND_URL from "./config/api.js";

export default function Login() {
  const navigate = useNavigate();
  const { updateUsername, setInitialLevel } = useProgress();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [username, setUsername]       = useState("");
  const [level, setLevel]             = useState("A1");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [checkLoad, setCheckLoad]     = useState(false);
  const [userStatus, setUserStatus]   = useState(null);

  useEffect(() => {
    if (isLoginMode) { setUserStatus(null); setError(""); return; }
    if (username.length < 3) { setUserStatus(null); return; }
    const t = setTimeout(async () => {
      setCheckLoad(true);
      try {
        const r = await fetch(`${BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
        setUserStatus(await r.json());
      } catch { setUserStatus({ available: true }); }
      finally { setCheckLoad(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [username, isLoginMode]);

  const errMsg = (code) => ({
    "auth/invalid-credential":   "Incorrect email or password.",
    "auth/wrong-password":       "The password you entered is incorrect.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/user-not-found":       "No account found with this email.",
    "auth/user-disabled":        "This account has been disabled.",
  }[code] || "Authentication failed. Please try again.");

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      // Admin shortcut
      const adminEmails = ["asatillo@admin.com", "xolmirzayevanargiza57@gmail.com"];
      if (adminEmails.includes(email.trim().toLowerCase()) && password.trim() === "a1s2a3t4i5l6l7o8") {
        try { await signInWithEmailAndPassword(auth, email, password); }
        catch (ae) {
          if (["auth/user-not-found","auth/invalid-credential"].includes(ae.code)) {
            const c = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(c.user, { displayName: "Admin" });
          } else { setError(errMsg(ae.code)); setLoading(false); return; }
        }
        navigate("/dashboard", { replace: true }); setLoading(false); return;
      }

      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      } else {
        if (!username) { setError("Please enter a username."); setLoading(false); return; }
        if (userStatus && !userStatus.available) { setError("Username is taken."); setLoading(false); return; }
        const c = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(c.user, { displayName: username });
        setInitialLevel(level, username);
        updateUsername(username);
        navigate("/dashboard");
      }
    } catch (err) { setError(errMsg(err.code)); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.code === "auth/popup-closed-by-user" ? "Google sign-in was cancelled." :
        err.code === "auth/network-request-failed" ? "Network error. Check your connection." :
        "Google sign-in failed. Please try again."
      );
    } finally { setLoading(false); }
  };

  const switchMode = (mode) => {
    setIsLoginMode(mode); setError("");
    setEmail(""); setPassword(""); setUsername(""); setUserStatus(null);
  };

  return (
    <div className="lp-page">
      {/* Animated background orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      {/* Back button */}
      <button className="lp-back" onClick={() => navigate("/about")}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* Card */}
      <div className="lp-card">
        {/* Logo */}
        <div className="lp-logo">
          <div className="lp-logo-icon"><Zap size={20} fill="#fff" color="#fff" /></div>
          <span>CEFR<b>Center</b></span>
        </div>

        {/* Tabs */}
        <div className="lp-tabs">
          <button className={`lp-tab${isLoginMode ? " active" : ""}`} onClick={() => switchMode(true)}>Sign In</button>
          <button className={`lp-tab${!isLoginMode ? " active" : ""}`} onClick={() => switchMode(false)}>Sign Up</button>
        </div>

        {/* Header */}
        <div className="lp-head">
          <h2>{isLoginMode ? "Welcome back 👋" : "Create account"}</h2>
          <p>{isLoginMode ? "Sign in to continue your learning" : "Join thousands of CEFR learners"}</p>
        </div>

        {/* Google */}
        <button className="lp-google" onClick={handleGoogle} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width={18} height={18} />
          Continue with Google
        </button>

        <div className="lp-divider"><span>or</span></div>

        {/* Form */}
        <form onSubmit={handleAuth} className="lp-form">
          {!isLoginMode && (
            <>
              {/* Username */}
              <div className="lp-field">
                <label>Username</label>
                <div className={`lp-inp${userStatus?.available === false ? " err" : userStatus?.available ? " ok" : ""}`}>
                  <User size={16} className="lp-ico" />
                  <input
                    type="text" placeholder="e.g. john_doe"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,15))}
                    autoComplete="off"
                  />
                  <span className="lp-status">
                    {checkLoad && <Loader2 size={14} className="lp-spin" />}
                    {!checkLoad && userStatus?.available && <CheckCircle2 size={14} className="ok-ic" />}
                    {!checkLoad && userStatus?.available === false && <AlertCircle size={14} className="err-ic" />}
                  </span>
                </div>
                {userStatus?.available === false && (
                  <div className="lp-suggest">
                    <span>Taken · Try:</span>
                    {userStatus.suggestions?.map(s => (
                      <button key={s} type="button" onClick={() => setUsername(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Level */}
              <div className="lp-field">
                <label>Your CEFR Level</label>
                <div className="lp-inp">
                  <select value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="A1">A1 — Beginner</option>
                    <option value="A2">A2 — Elementary</option>
                    <option value="B1">B1 — Intermediate</option>
                    <option value="B2">B2 — Upper Intermediate</option>
                    <option value="C1">C1 — Advanced</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="lp-field">
            <label>Email</label>
            <div className="lp-inp">
              <Mail size={16} className="lp-ico" />
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          {/* Password */}
          <div className="lp-field">
            <label>Password</label>
            <div className="lp-inp">
              <Lock size={16} className="lp-ico" />
              <input
                type={showPwd ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
                autoComplete={isLoginMode ? "current-password" : "new-password"}
              />
              <button type="button" className="lp-eye" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="lp-err-box">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="lp-submit" disabled={loading}>
            {loading
              ? <Loader2 size={20} className="lp-spin" />
              : <>{isLoginMode ? "Sign In" : "Create Account"} <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p className="lp-switch">
          {isLoginMode ? "New here?" : "Already have an account?"}
          <button onClick={() => switchMode(!isLoginMode)}>
            {isLoginMode ? " Create a free account" : " Sign in"}
          </button>
        </p>

        {/* ── SUPPORT SECTION ── */}
        <div className="lp-support">
          <div className="lp-support-label">
            <span className="lp-support-dot" />
            Support
          </div>
          <div className="lp-support-phone">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            +998 95 533 15 28
          </div>
          <a href="tel:+998955331528" className="lp-call-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Call Admin
          </a>
        </div>
      </div>
    </div>
  );
}