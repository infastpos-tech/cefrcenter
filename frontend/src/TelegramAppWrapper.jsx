import React, { useEffect, useState } from "react";
import { useTelegram } from "./useTelegram";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { Award, Zap, BookOpen, Headphones, Edit3, Mic, User, LogIn, ExternalLink, ShieldCheck } from "lucide-react";

export default function TelegramAppWrapper({ children }) {
  const { user: tgUser, isTelegram } = useTelegram();
  const [syncedUser, setSyncedUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setFirebaseUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (tgUser?.id && !syncedUser && !syncing) {
      setSyncing(true);
      fetch("http://localhost:5000/api/telegram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramId: tgUser.id,
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          photoUrl: tgUser.photo_url
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSyncedUser(data.user);
          }
        })
        .catch((err) => console.warn("Telegram sync error:", err))
        .finally(() => setSyncing(false));
    }
  }, [tgUser, syncedUser, syncing]);

  const handleGoogleLogin = async () => {
    try {
      if (provider) {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      alert("Google login error: " + e.message);
    }
  };

  if (!isTelegram) {
    return <>{children}</>;
  }

  const currentUser = firebaseUser || syncedUser || tgUser;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0b1120 0%, #0f172a 100%)",
      color: "#f8fafc",
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: "80px",
      boxSizing: "border-box"
    }}>
      {/* ── Telegram Mini App Floating Banner ── */}
      <div style={{
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 16,
            color: "#fff",
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.4)"
          }}>
            {currentUser?.photo_url ? (
              <img src={currentUser.photo_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            ) : (
              (tgUser?.first_name?.[0] || "C").toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              {tgUser?.first_name || "CEFR Learner"}
              <ShieldCheck size={14} color="#38bdf8" />
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              @{tgUser?.username || "cefr_user"} • Level: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{syncedUser?.level || "B2"}</span>
            </div>
          </div>
        </div>

        {!firebaseUser ? (
          <button
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              color: "#60a5fa",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <LogIn size={13} />
            Google Login
          </button>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            color: "#4ade80",
            padding: "4px 10px",
            borderRadius: 16,
            fontSize: 11,
            fontWeight: 600
          }}>
            <Zap size={12} fill="#4ade80" /> Connected
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: "8px 0" }}>
        {children}
      </div>
    </div>
  );
}
