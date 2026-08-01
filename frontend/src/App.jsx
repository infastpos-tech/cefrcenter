// App.jsx — CEFR Center
import React, { useEffect, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import About      from "./About";
import Us         from "./US";
import Dashboard  from "./Dashboard";
import Login      from "./Login";
import LevelSelect from "./LevelSelect";
import AdminPanel  from "./AdminPanel";
import MobileMockup from "./MobileMockup";

import { useProgress }    from "./useProgress";
import { auth }           from "./firebase";
import TelegramAppWrapper from "./TelegramAppWrapper";


// ── Splash / Loading screen ───────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{
      minHeight:      "100vh",
      background:     "linear-gradient(135deg, #0b1120 0%, #1e1b4b 50%, #0f172a 100%)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            24,
      position:       "relative",
      overflow:       "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        top: "10%", left: "20%", animation: "pulse 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        bottom: "20%", right: "15%", animation: "pulse 4s ease-in-out infinite reverse",
      }} />

      {/* Logo */}
      <div style={{
        width: 80, height: 80,
        borderRadius: 24,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)",
        animation: "logoFloat 2s ease-in-out infinite",
        fontSize: 32, fontWeight: 900, color: "#fff",
        letterSpacing: -1,
      }}>
        C
      </div>

      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 28, fontWeight: 800,
          background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -0.5, marginBottom: 6,
        }}>
          CEFR<span style={{ fontWeight: 400 }}>Center</span>
        </div>
        <div style={{ color: "#64748b", fontSize: 13, letterSpacing: 0.5 }}>
          Yuklanmoqda...
        </div>
      </div>

      {/* Spinner dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#6366f1",
            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Root — auth + onboarding logic ───────────────────────────────────────────
const ADMIN_EMAILS = ["asatillo@admin.com", "xolmirzayevanargiza57@gmail.com"];

function Root() {
  const { progress, setInitialLevel, updateUsername, isLoaded } = useProgress();
  const [authReady, setAuthReady]     = useState(false);
  const [user, setUser]               = useState(null);
  const [usStepDone, setUsStepDone]   = useState(false);
  const [passedUsername, setPassedUsername] = useState("");
  const [splashDone, setSplashDone]   = useState(false);
  const navigate                      = useNavigate();

  // If user is logged in, sync from cloud
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Minimal splash delay — 1.2 soniya kutilsin
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Checking Auth — splash va auth tayyor bo'lguncha loader
  if (!authReady || !isLoaded || !splashDone) return <Loader />;

  // Not logged in → About page
  if (!user) return <About />;

  // ── Admin foydalanuvchi ──
  // Onboarding o'tmagan bo'lsa ham avval onboarding, keyin admin
  if (ADMIN_EMAILS.includes(user?.email)) {
    if (!progress.onboarded) {
      if (!usStepDone) {
        return (
          <Us
            onSelect={(username) => {
              updateUsername(username);
              setPassedUsername(username);
              setUsStepDone(true);
            }}
          />
        );
      } else {
        return (
          <LevelSelect
            onSelect={(levelCode) => {
              setInitialLevel(levelCode, passedUsername || progress.username);
              navigate("/admin", { replace: true });
            }}
          />
        );
      }
    }
    return <Navigate to="/admin" replace />;
  }

  // ── Oddiy foydalanuvchi ── Onboarding
  if (!progress.onboarded) {
    if (!usStepDone) {
      return (
        <Us
          onSelect={(username, hearAbout) => {
            updateUsername(username);
            setPassedUsername(username);
            setUsStepDone(true);
          }}
        />
      );
    } else {
      return (
        <LevelSelect 
          onSelect={(levelCode) => {
            setInitialLevel(levelCode, passedUsername || progress.username);
            navigate("/dashboard", { replace: true });
          }}
        />
      );
    }
  }

  // All set → Dashboard
  return <Navigate to="/dashboard" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <HashRouter>
      <TelegramAppWrapper>
        <Routes>
          <Route path="/"            element={<Root />} />
          <Route path="/login"       element={<LoginWrapper />} />
          <Route path="/admin"       element={<AdminWrapper />} />
          <Route path="/us"          element={<Us />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/mockup"      element={<MobileMockup />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </TelegramAppWrapper>
    </HashRouter>
  );
}

function AdminWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  // Admin bo'lmasa dashboard ga qaytarish
  if (!ADMIN_EMAILS.includes(user?.email)) return <Navigate to="/dashboard" replace />;

  return <AdminPanel user={user} onBack={() => navigate("/dashboard")} />;
}

function LoginWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;
  if (user) {
    // Admin bo'lsa /admin ga, oddiy user dashboard ga
    if (ADMIN_EMAILS.includes(user?.email)) return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}