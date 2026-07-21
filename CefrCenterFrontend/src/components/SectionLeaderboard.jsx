// SectionLeaderboard.jsx — Top 3 podium (local scores when backend offline)
import React, { useState, useEffect } from "react";
import BACKEND_URL from "../config/api.js";

const RANK_CFG = {
  1: { emoji: "🥇", color: "#FFD700", glow: "rgba(255,215,0,0.35)", podiumH: 110, order: 2 },
  2: { emoji: "🥈", color: "#C0C0C0", glow: "rgba(192,192,192,0.25)", podiumH: 80,  order: 1 },
  3: { emoji: "🥉", color: "#CD7F32", glow: "rgba(205,127,50,0.25)", podiumH: 60,  order: 3 },
};

const SECTION_META = {
  listening: { icon: "🎧", color: "#1D9E75", label: "Listening"  },
  reading:   { icon: "📖", color: "#378ADD", label: "Reading"    },
  writing:   { icon: "✍️", color: "#7F77DD", label: "Writing"    },
  speaking:  { icon: "🎤", color: "#D4537E", label: "Speaking"   },
};

// Demo data shown when backend is offline
const DEMO_DATA = {
  listening: [
    { username: "Asilbek",  sectionScore: 72, level: "B2", photoURL: "" },
    { username: "Malika",   sectionScore: 68, level: "B1", photoURL: "" },
    { username: "Jasur",    sectionScore: 61, level: "B1", photoURL: "" },
  ],
  reading: [
    { username: "Nodira",   sectionScore: 70, level: "B2", photoURL: "" },
    { username: "Akbar",    sectionScore: 65, level: "B1", photoURL: "" },
    { username: "Dilnoza",  sectionScore: 58, level: "A2", photoURL: "" },
  ],
  writing: [
    { username: "Kamola",   sectionScore: 69, level: "B2", photoURL: "" },
    { username: "Otabek",   sectionScore: 63, level: "B1", photoURL: "" },
    { username: "Shahlo",   sectionScore: 57, level: "B1", photoURL: "" },
  ],
  speaking: [
    { username: "Farrukh",  sectionScore: 71, level: "B2", photoURL: "" },
    { username: "Munira",   sectionScore: 66, level: "B1", photoURL: "" },
    { username: "Sanjar",   sectionScore: 59, level: "A2", photoURL: "" },
  ],
};

function Avatar({ user, size = 44, color }) {
  const initials = (user.username || "?").slice(0, 2).toUpperCase();
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL} alt={user.username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: `2.5px solid ${color}`, boxShadow: `0 0 14px ${color}55` }}
        onError={e => { e.target.style.display = "none"; }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
      border: `2.5px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 900, color,
      boxShadow: `0 0 14px ${color}44`, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function PodiumBar({ user, rank, meta, isMe, animated }) {
  const cfg = RANK_CFG[rank];
  const score = user?.sectionScore ?? 0;
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      order: cfg.order, gap: 6,
      transform: animated ? "translateY(0)" : "translateY(24px)",
      opacity: animated ? 1 : 0,
      transition: `all 0.55s cubic-bezier(.2,.8,.2,1) ${(rank - 1) * 0.12}s`,
    }}>
      {/* Rank emoji */}
      <div style={{ fontSize: rank === 1 ? 26 : 20, filter: `drop-shadow(0 2px 8px ${cfg.glow})` }}>
        {cfg.emoji}
      </div>

      {/* Avatar */}
      <div style={{ position: "relative" }}>
        <Avatar user={user} size={rank === 1 ? 54 : 42} color={cfg.color} />
        {isMe && (
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            background: meta.color, borderRadius: "50%",
            width: 14, height: 14, fontSize: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #0a1020", fontWeight: 900,
          }}>★</div>
        )}
      </div>

      {/* Username */}
      <div style={{
        fontSize: 10, fontWeight: 700,
        color: isMe ? meta.color : "#c8d4f0",
        maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", textAlign: "center",
      }}>{user.username || "User"}</div>

      {/* Podium block */}
      <div style={{
        width: "100%", height: cfg.podiumH,
        background: `linear-gradient(180deg, ${cfg.color}25 0%, ${cfg.color}08 100%)`,
        border: `1px solid ${cfg.color}44`, borderBottom: "none",
        borderRadius: "12px 12px 0 0",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 1,
        position: "relative",
        boxShadow: `0 0 20px ${cfg.glow}`,
      }}>
        <div style={{
          position: "absolute", top: -10,
          background: cfg.color, color: "#000",
          fontSize: 9, fontWeight: 900, padding: "1px 8px", borderRadius: 6,
        }}>#{rank}</div>
        <div style={{ fontSize: rank === 1 ? 18 : 14, fontWeight: 900, color: "#fff" }}>
          {score}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          pts
        </div>
      </div>
    </div>
  );
}

export default function SectionLeaderboard({ section = "listening", currentUser }) {
  const [top3, setTop3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [myRank, setMyRank] = useState(null);
  const [offline, setOffline] = useState(false);
  const meta = SECTION_META[section] || SECTION_META.listening;

  useEffect(() => { fetchRankings(); }, [section, currentUser?.email]);
  useEffect(() => {
    if (!loading && top3.length > 0) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [loading, top3]);

  const fetchRankings = async () => {
    setLoading(true); setAnimated(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const url = `${BACKEND_URL}/api/leaderboard/section?section=${section}&email=${encodeURIComponent(currentUser?.email || "")}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const users = (data.top3 || []).slice(0, 3);
      setTop3(users);
      setMyRank(data.myRank ?? null);
      setOffline(false);
    } catch {
      // Use demo data as placeholder
      setTop3(DEMO_DATA[section] || []);
      setMyRank(null);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${meta.color}33`, borderTopColor: meta.color, animation: "spin .7s linear infinite", margin: "0 auto 8px" }} />
        <div style={{ fontSize: 11, color: "#4a5568" }}>Loading rankings...</div>
      </div>
    );
  }

  if (top3.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#4a5568", fontSize: 12 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
        <div style={{ fontWeight: 700, color: "#8b9bbf", marginBottom: 4 }}>No rankings yet</div>
        <div>Be the first to complete a {meta.label} test!</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 12px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "0 2px" }}>
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#f0f4ff" }}>{meta.label} Top 3</div>
          {offline && <div style={{ fontSize: 9, color: "#4a5568" }}>📴 Demo data (offline)</div>}
        </div>
        {myRank && (
          <div style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}33`, borderRadius: 8, padding: "3px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 8, color: meta.color, fontWeight: 700 }}>YOUR RANK</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: meta.color }}>#{myRank}</div>
          </div>
        )}
      </div>

      {/* Podium */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, justifyContent: "center", minHeight: 200 }}>
        {[1, 2, 3].map(rank => {
          const user = top3[rank - 1];
          if (!user) return (
            <div key={rank} style={{ flex: 1, order: RANK_CFG[rank].order }}>
              <div style={{
                height: RANK_CFG[rank].podiumH, background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.05)", borderBottom: "none",
                borderRadius: "10px 10px 0 0", display: "flex", alignItems: "center",
                justifyContent: "center", color: "#2d3a4f", fontSize: 16,
              }}>
                {RANK_CFG[rank].emoji}
              </div>
            </div>
          );
          return (
            <PodiumBar
              key={rank} user={user} rank={rank} meta={meta}
              isMe={currentUser?.email && user.email === currentUser.email}
              animated={animated}
            />
          );
        })}
      </div>

      {/* Base line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${meta.color}33, transparent)`, borderRadius: 2, marginTop: 0 }} />

      {offline && (
        <div style={{ marginTop: 10, fontSize: 9, color: "#4a5568", textAlign: "center" }}>
          Connect to internet to see real rankings
        </div>
      )}
    </div>
  );
}
