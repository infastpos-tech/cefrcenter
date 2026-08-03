// AdminPanel.jsx — Apex Cyberpunk Control Command Center
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star, Search, Sparkles, Filter, Lock, Terminal,
  Cpu, Radio, Zap, Clock, ExternalLink, AlertTriangle, Layers
} from "lucide-react";
import BACKEND_URL from "./config/api";

export default function AdminPanel({ user, onBack }) {
  const [isVerified, setIsVerified] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const validCredentials = (
      (loginForm.email === "123456789123456789123456789" && loginForm.password === "123456789123456789123456789") ||
      (loginForm.email === "123456789123456789123456789@admin.com" && loginForm.password === "123456789123456789123456789") ||
      (loginForm.email === "asatillo@admin.com" && loginForm.password === "a1s2a3t4i5l6l7o8") ||
      (loginForm.email === "xolmirzayevanargiza57@gmail.com" && loginForm.password === "a1s2a3t4i5l6l7o8")
    );
    if (validCredentials) {
      setIsVerified(true);
      setLoginError("");
    } else {
      setLoginError("Kiritilgan login yoki parol noto'g'ri. Ruxsat berilmadi.");
    }
  };

  const [tab, setTab] = useState("dashboard");
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, dbStatus: "connected" });
  const [notifs, setNotifs] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', pinned: false, type: 'info' });
  const [notifImage, setNotifImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  const adminEmail = user?.email || "123456789123456789123456789";
  const hdrs = useMemo(() => ({ "x-user-email": adminEmail }), [adminEmail]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes, sRes, nRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/stats?email=${adminEmail}`),
        fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs }),
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (nRes.ok) setNotifs(await nRes.json());
    } catch (e) { console.error("Load failed", e); }
    finally { setLoading(false); }
  }, [adminEmail, hdrs]);

  useEffect(() => { if (isVerified) loadData(); }, [loadData, isVerified]);

  const handleImageSelect = (file) => {
    if (!file) { setNotifImage(null); return; }
    setNotifImage(file);
  };

  const handleSendNotification = async () => {
    try {
      const fd = new FormData();
      fd.append('title', notifForm.title);
      fd.append('message', notifForm.message);
      fd.append('pinned', notifForm.pinned ? '1' : '0');
      fd.append('type', notifForm.type || 'info');
      if (notifImage) fd.append('imageFile', notifImage, notifImage.name || 'image.jpg');

      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        method: 'POST',
        headers: hdrs,
        body: fd
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Xabarnoma yuborib bo\'lmadi');
      }
      await loadData();
      setShowNotifModal(false);
      setNotifForm({ title: '', message: '', pinned: false, type: 'info' });
      setNotifImage(null);
      alert('E\'lon muvaffaqiyatli tarqatildi!');
    } catch (e) {
      console.error('Send notif failed', e);
      alert('Xato: ' + (e.message || 'Noma\'lum xatolik'));
    }
  };

  const handleAction = async (id, action, reason, type = "payment") => {
    try {
      let endpoint;
      if (type === "notification") {
        endpoint = `/api/notifications/${id}`;
      } else {
        endpoint = action === "delete" ? `/api/payments/admin/${id}` : `/api/payments/admin/${id}/${action}`;
      }
      const opts = { method: action === "delete" ? "DELETE" : "POST", headers: { ...hdrs } };
      if (action === 'reject') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify({ reason });
      }
      const res = await fetch(`${BACKEND_URL}${endpoint}`, opts);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Amaliyot bajarilmadi');
      }
      await loadData();
    } catch (e) { alert("Amaliyot xatosi: " + (e.message || 'Error')); }
  };

  const handleRemovePremium = async (email) => {
    try {
      const reason = window.prompt('Premium olib tashlash sababi (ixtiyoriy):');
      if (reason === null) return;
      const res = await fetch(`${BACKEND_URL}/api/payments/admin/user/${encodeURIComponent(email)}/remove-premium`, {
        method: 'POST',
        headers: { ...hdrs, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Premium olib tashlab bo\'lmadi');
      }
      alert('Premium maqomi bekor qilindi');
      await loadData();
    } catch (e) {
      console.error('Remove premium failed', e);
      alert('Xato: ' + (e.message || 'Noma\'lum xatolik'));
    }
  };

  // Filtered queries
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.username || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = paymentFilter === "all" ? true : p.status === paymentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchQuery, paymentFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.username || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = userFilter === "all" ? true : userFilter === "premium" ? u.isPremium : !u.isPremium;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, userFilter]);

  const pendingPaymentsCount = useMemo(() => {
    return payments.filter(p => p.status === "pending").length;
  }, [payments]);

  // Lock Verification View (Cyber Security Gatekeeper)
  if (!isVerified) {
    return (
      <div className="cyber-lock-screen">
        <style>{`
          @keyframes cyberMeshFloat {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-25px) rotate(2deg) scale(1.03); }
            100% { transform: translateY(0px) rotate(0deg) scale(1); }
          }
          @keyframes cyberScanline {
            0% { top: -100%; }
            100% { top: 200%; }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.4; filter: blur(30px); }
            50% { opacity: 0.8; filter: blur(45px); }
          }
          @keyframes lockCardIn {
            from { opacity: 0; transform: translateY(40px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes borderGlowRun {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .cyber-lock-screen {
            position: fixed; inset: 0; z-index: 99999;
            background: #030712;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            overflow: hidden;
          }
          .cyber-bg-mesh {
            position: absolute; inset: 0; pointer-events: none;
            background-image:
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15), transparent 45%),
              radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.12), transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.08), transparent 60%);
            animation: cyberMeshFloat 16s ease-in-out infinite;
          }
          .cyber-grid-overlay {
            position: absolute; inset: 0; pointer-events: none;
            background-size: 40px 40px;
            background-image:
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          }
          .cyber-lock-card {
            width: 100%; max-width: 440px; padding: 44px 40px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            border-radius: 28px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 30px 100px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15);
            animation: lockCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
            position: relative; z-index: 10;
          }
          .cyber-lock-card::before {
            content: ''; position: absolute; inset: -1px; border-radius: 29px; padding: 1px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(6, 182, 212, 0.4), rgba(236, 72, 153, 0.5));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude;
            pointer-events: none;
          }
          .cyber-input-wrap {
            position: relative; margin-top: 6px;
          }
          .cyber-input {
            width: 100%; padding: 16px 20px 16px 48px;
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px; color: #fff;
            font-family: inherit; font-size: 15px; font-weight: 500;
            outline: none; transition: all 0.25s ease;
          }
          .cyber-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1);
            background: rgba(30, 41, 59, 0.95);
          }
          .cyber-btn-submit {
            width: 100%; padding: 18px; margin-top: 12px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%);
            background-size: 200% 200%;
            border: none; border-radius: 16px; color: #fff;
            font-weight: 800; font-size: 15px; letter-spacing: 0.5px;
            cursor: pointer; transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
            display: flex; align-items: center; justify-content: center; gap: 10px;
          }
          .cyber-btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(99, 102, 241, 0.6), 0 0 25px rgba(6, 182, 212, 0.5);
            background-position: 100% 0%;
          }
        `}</style>
        
        <div className="cyber-bg-mesh" />
        <div className="cyber-grid-overlay" />

        <div className="cyber-lock-card">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 84, height: 84, margin: "0 auto 20px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.3)",
              position: "relative"
            }}>
              <Shield size={40} color="#06b6d4" />
              <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px dashed rgba(6,182,212,0.4)", animation: "spin 12s linear infinite" }} />
            </div>
            
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: 99, marginBottom: 12 }}>
              <Zap size={12} color="#06b6d4" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", letterSpacing: "1px" }}>CYBER MATRIX GATEWAY v4.0</span>
            </div>
            
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
              Apex Control Center
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
              Tizimga kirish uchun maxfiy kalitni kiriting
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", paddingLeft: 4 }}>
                Admin Login
              </label>
              <div className="cyber-input-wrap">
                <User size={18} color="#6366f1" style={{ position: "absolute", left: 16, top: 17 }} />
                <input
                  className="cyber-input"
                  type="text" required value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="123456789123456789123456789"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", paddingLeft: 4 }}>
                Maxfiy Parol
              </label>
              <div className="cyber-input-wrap">
                <Lock size={18} color="#06b6d4" style={{ position: "absolute", left: 16, top: 17 }} />
                <input
                  className="cyber-input"
                  type="password" required value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171", fontSize: 13, fontWeight: 600,
                padding: "12px 16px", borderRadius: 14
              }}>
                <AlertTriangle size={16} color="#f87171" />
                {loginError}
              </div>
            )}

            <button type="submit" className="cyber-btn-submit">
              <Terminal size={18} />
              BOSHQUROVNI FAOLASHTIRISH →
            </button>

            <button
              type="button" onClick={onBack}
              style={{
                padding: "14px", marginTop: 4,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 14, color: "#94a3b8",
                cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                transition: "all 0.2s ease"
              }}
            >
              ← Tizimdan chiqish
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 12px #10b981" }} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "1px" }}>ENCRYPTED END-TO-END SYSTEM PROTOCOL</span>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: "Dashboard Hub", icon: Cpu, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null },
    { id: "payments", label: "To'lovlar Ro'yxati", icon: CreditCard, count: payments.length },
    { id: "notifications", label: "E'lonlar Portali", icon: Radio, count: notifs.length },
    { id: "users", label: "O'quvchilar Bazasi", icon: Users, count: users.length },
  ];

  return (
    <div className="cyber-admin-root">
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(99, 102, 241, 0.3); }
          50% { border-color: rgba(6, 182, 212, 0.6); }
        }
        @keyframes spinSlow {
          to { transform: rotate(360deg); }
        }
        .cyber-admin-root {
          position: fixed; inset: 0; z-index: 1000;
          background: #030712;
          color: #f8fafc;
          display: flex; overflow: hidden;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        }
        .cyber-admin-root::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.12), transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(6, 182, 212, 0.10), transparent 45%),
            radial-gradient(circle at 50% 10%, rgba(236, 72, 153, 0.06), transparent 50%);
        }
        /* Custom Scrollbar */
        .cyber-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .cyber-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .cyber-scroll::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 99px; }
        .cyber-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.6); }

        .cyber-sidebar {
          width: 280px; flex-shrink: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 28px 20px; display: flex; flexDirection: column;
          position: relative; z-index: 20;
        }
        .cyber-tab-btn {
          padding: 14px 18px; border-radius: 16px;
          background: transparent; border: 1px solid transparent;
          color: #94a3b8; font-weight: 700; font-size: 14px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: all 0.25s ease;
          font-family: inherit; margin-bottom: 6px; text-align: left;
        }
        .cyber-tab-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff; transform: translateX(4px);
        }
        .cyber-tab-btn.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #fff;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
        }
        .cyber-card-stat {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px; padding: 24px;
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cyber-card-stat:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(99, 102, 241, 0.15);
        }
        .cyber-table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          transition: background 0.2s ease;
        }
        .cyber-table-row:hover {
          background: rgba(99, 102, 241, 0.05);
        }
        .cyber-search-inp {
          width: 100%; padding: 12px 18px 12px 42px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px; color: #fff;
          font-family: inherit; font-size: 14px; outline: none;
          transition: all 0.2s ease;
        }
        .cyber-search-inp:focus {
          border-color: #6366f1;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
      `}</style>

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="cyber-sidebar">
        {/* Brand header */}
        <div style={{ marginBottom: 36, paddingLeft: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)"
            }}>
              <Zap size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                APEX MATRIX
              </h1>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", letterSpacing: "1px" }}>CONTROL CENTER</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "6px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
            <User size={12} color="#6366f1" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{adminEmail}</span>
          </div>
        </div>

        {/* Tab items */}
        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 12, paddingLeft: 6 }}>
            Boshqaruv Bo'limlari
          </div>
          {TABS.map(m => {
            const Icon = m.icon;
            const isActive = tab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`cyber-tab-btn ${isActive ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={18} color={isActive ? "#06b6d4" : "#64748b"} />
                  <span>{m.label}</span>
                </div>
                {m.badge && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#ef4444", padding: "2px 8px", borderRadius: 99, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}>
                    {m.badge}
                  </span>
                )}
                {m.count !== undefined && !m.badge && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#06b6d4" : "#475569" }}>
                    {m.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
          <button
            onClick={loadData}
            style={{
              padding: "12px 16px", borderRadius: 14,
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc", fontWeight: 700, cursor: "pointer",
              display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
              fontFamily: "inherit", fontSize: 13, transition: "all 0.2s ease"
            }}
          >
            <RefreshCw size={15} className={loading ? "spinSlow" : ""} />
            Ma'lumotlarni Yangilash
          </button>

          <button
            onClick={onBack}
            style={{
              padding: "12px 16px", borderRadius: 14,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171", fontWeight: 700, cursor: "pointer",
              display: "flex", gap: 10, alignItems: "center", justifyContent: "center",
              fontFamily: "inherit", fontSize: 13, transition: "all 0.2s ease"
            }}
          >
            <LogOut size={15} />
            Tizimdan Chiqish
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="cyber-scroll" style={{ flex: 1, overflowY: "auto", padding: "32px 40px", position: "relative" }}>
        
        {/* Top bar with search & status */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36, gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
              {tab === "dashboard" && "Dashboard & Tizim Statistikasi"}
              {tab === "payments" && "Barcha To'lovlar Ro'yxati"}
              {tab === "notifications" && "E'lonlar va Bildirishnomalar"}
              {tab === "users" && "O'quvchilar Boshqaruv Bazasi"}
            </h2>
            <p style={{ color: "#64748b", fontSize: 14, margin: "6px 0 0 0", fontWeight: 500 }}>
              CEFR Center Real-vaqt Apex Boshqaruv Portali
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Live Search */}
            <div style={{ position: "relative", width: 280 }}>
              <Search size={16} color="#64748b" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                className="cyber-search-inp"
                type="text"
                placeholder="Qidiruv (Email / Ism)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Live system clock pill */}
            <div style={{ padding: "10px 16px", background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={15} color="#06b6d4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        {/* Loading Spinner overlay */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "45vh", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#06b6d4", animation: "spinSlow 0.8s linear infinite" }} />
            <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600, letterSpacing: "1px" }}>YUKLANMOQDA...</span>
          </div>
        )}

        {!loading && (
          <div style={{ animation: "fadeInSlide 0.4s ease-out both" }}>

            {/* ── TAB 1: DASHBOARD ── */}
            {tab === "dashboard" && (
              <div>
                {/* 4 Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 36 }}>
                  {[
                    { label: "Jami O'quvchilar", value: stats.totalUsers || users.length, icon: Users, color: "#6366f1", trend: "+12.4% bu oy" },
                    { label: "Bugun Faol Bo'lganlar", value: stats.recentUsers, icon: Activity, color: "#06b6d4", trend: "Real-vaqt monitoring" },
                    { label: "Kutilayotgan To'lovlar", value: pendingPaymentsCount, icon: CreditCard, color: "#f59e0b", alert: pendingPaymentsCount > 0 },
                    { label: "Yuborilgan E'lonlar", value: notifs.length, icon: Radio, color: "#ec4899", trend: "Barchasi faol" },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="cyber-card-stat">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>{s.label}</span>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={20} color={s.color} />
                          </div>
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                          {s.value}
                        </div>
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: s.alert ? "#f59e0b" : "#10b981" }}>
                          {s.alert ? <AlertTriangle size={13} /> : <TrendingUp size={13} />}
                          <span>{s.trend || (s.alert ? "Tasdiqlash kutilmoqda!" : "Tizim barqaror")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Pending Stream */}
                <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28, backdropFilter: "blur(16px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#fff" }}>Kutilayotgan Premium To'lovlar Streami</h3>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Talabalardan tushgan to'lov cheklarini ko'rib chiqish va tasdiqlash</p>
                    </div>
                    <button onClick={() => setTab("payments")} style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#a5b4fc", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                      Barchasini ko'rish →
                    </button>
                  </div>

                  {payments.filter(p => p.status === "pending").length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                      <CheckCircle size={36} color="#10b981" style={{ marginBottom: 12, opacity: 0.8 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Kutilayotgan to'lovlar mavjud emas. Barcha to'lovlar ko'rib chiqilgan!</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {payments.filter(p => p.status === "pending").slice(0, 6).map(p => (
                        <div key={p._id} style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CreditCard size={20} color="#f59e0b" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{p.email}</div>
                              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{p.amount?.toLocaleString()} UZS · Plan: {p.planId || "Premium"}</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              onClick={() => {
                                if (p.receiptFileUrl) {
                                  const url = p.receiptFileUrl;
                                  setPreviewImage((url.startsWith('http')||url.startsWith('data:')) ? url : `${BACKEND_URL}${url}`);
                                } else {
                                  alert('Chek rasmi topilmadi');
                                }
                              }}
                              style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                            >
                              <Eye size={15} /> Chekni ko'rish
                            </button>

                            <button
                              onClick={() => {
                                const reason = window.prompt('Rad etish sababini kiriting (ixtiyoriy):');
                                if (reason !== null) handleAction(p._id, 'reject', reason);
                              }}
                              style={{ padding: "8px 14px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                            >
                              Rad etish
                            </button>

                            <button
                              onClick={() => handleAction(p._id, "approve")}
                              style={{ padding: "8px 18px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13, boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
                            >
                              ✓ Tasdiqlash
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 2: PAYMENTS ── */}
            {tab === "payments" && (
              <div>
                {/* Filter bar */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  {["all", "pending", "approved", "rejected"].map(st => (
                    <button
                      key={st}
                      onClick={() => setPaymentFilter(st)}
                      style={{
                        padding: "8px 16px", borderRadius: 12,
                        background: paymentFilter === st ? "rgba(99, 102, 241, 0.2)" : "rgba(15, 23, 42, 0.6)",
                        border: `1px solid ${paymentFilter === st ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                        color: paymentFilter === st ? "#fff" : "#94a3b8",
                        fontWeight: 700, cursor: "pointer", fontSize: 13, textTransform: "capitalize"
                      }}
                    >
                      {st === "all" ? "Barcha To'lovlar" : st === "pending" ? "Kutilayotgan" : st === "approved" ? "Tasdiqlangan" : "Rad Etilgan"}
                    </button>
                  ))}
                </div>

                {/* Payments Table */}
                <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", backdropFilter: "blur(16px)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                        <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Talaba Email / Ismi</th>
                        <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Summa (UZS)</th>
                        <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Holat</th>
                        <th style={{ padding: "16px 20px", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Harakatlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>To'lovlar topilmadi.</td></tr>
                      ) : filteredPayments.map(p => (
                        <tr key={p._id} className="cyber-table-row">
                          <td style={{ padding: "16px 20px", color: "#fff", fontWeight: 600, fontSize: 14 }}>
                            {p.email}
                            {p.username && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>@{p.username}</div>}
                          </td>
                          <td style={{ padding: "16px 20px", color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>
                            {p.amount?.toLocaleString()} UZS
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{
                              padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                              background: p.status === "approved" ? "rgba(16, 185, 129, 0.15)" : p.status === "rejected" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                              color: p.status === "approved" ? "#34d399" : p.status === "rejected" ? "#f87171" : "#fbbf24",
                              border: `1px solid ${p.status === "approved" ? "rgba(16,185,129,0.3)" : p.status === "rejected" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`
                            }}>
                              {(p.status || "PENDING").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px", display: "flex", gap: 8 }}>
                            <button
                              onClick={() => {
                                if (p.receiptFileUrl) {
                                  const url = p.receiptFileUrl;
                                  setPreviewImage((url.startsWith('http')||url.startsWith('data:')) ? url : `${BACKEND_URL}${url}`);
                                } else { alert('Chek mavjud emas'); }
                              }}
                              style={{ padding: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", cursor: "pointer" }}
                            >
                              <Eye size={16} />
                            </button>
                            {p.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    const reason = window.prompt('Rad etish sababi:');
                                    if (reason !== null) handleAction(p._id, 'reject', reason);
                                  }}
                                  style={{ padding: "6px 12px", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                                >
                                  Rad Etish
                                </button>
                                <button
                                  onClick={() => handleAction(p._id, "approve")}
                                  style={{ padding: "6px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 12 }}
                                >
                                  Tasdiqlash
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 3: NOTIFICATIONS ── */}
            {tab === "notifications" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#fff" }}>E'lonlar Boshqaruvi</h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>O'quvchilarga yuborilgan e'lon va bildirishnomalar</p>
                  </div>
                  <button
                    onClick={() => setShowNotifModal(true)}
                    style={{
                      padding: "12px 22px", borderRadius: 14,
                      background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                      border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 25px rgba(99,102,241,0.3)"
                    }}
                  >
                    <Plus size={18} /> Yangi E'lon Yuborish
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                  {notifs.length === 0 ? (
                    <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>Hali hech qanday e'lon yaratilmagan.</p>
                  ) : notifs.map(n => (
                    <div key={n._id} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", gap: 14 }}>
                      {n.image && (
                        <img src={n.image} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 14 }} />
                      )}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{n.type || "INFO"}</div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, marginBottom: 6 }}>{n.title}</h4>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                      </div>
                      {n.pinned && <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>📌 MUHIM E'LON (PINNED)</div>}
                      <button
                        onClick={() => handleAction(n._id, "delete", null, "notification")}
                        style={{ width: "100%", padding: 10, borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "auto" }}
                      >
                        <Trash2 size={15} /> O'chirish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 4: STUDENTS DIRECTORY ── */}
            {tab === "users" && (
              <div>
                {/* User filters */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  <button
                    onClick={() => setUserFilter("all")}
                    style={{
                      padding: "8px 16px", borderRadius: 12,
                      background: userFilter === "all" ? "rgba(99, 102, 241, 0.2)" : "rgba(15, 23, 42, 0.6)",
                      border: `1px solid ${userFilter === "all" ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                      color: userFilter === "all" ? "#fff" : "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13
                    }}
                  >
                    Barcha O'quvchilar ({users.length})
                  </button>
                  <button
                    onClick={() => setUserFilter("premium")}
                    style={{
                      padding: "8px 16px", borderRadius: 12,
                      background: userFilter === "premium" ? "rgba(16, 185, 129, 0.2)" : "rgba(15, 23, 42, 0.6)",
                      border: `1px solid ${userFilter === "premium" ? "rgba(16, 185, 129, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                      color: userFilter === "premium" ? "#34d399" : "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13
                    }}
                  >
                    ⭐ Premium O'quvchilar ({users.filter(u => u.isPremium).length})
                  </button>
                </div>

                {/* User Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                  {filteredUsers.length === 0 ? (
                    <p style={{ color: "#64748b", gridColumn: "1 / -1" }}>O'quvchilar topilmadi.</p>
                  ) : filteredUsers.map(u => (
                    <div key={u.email} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, backdropFilter: "blur(16px)" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: u.isPremium ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={22} color={u.isPremium ? "#fff" : "#94a3b8"} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {u.username || "O'quvchi"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                            {u.email}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                        {u.isPremium ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Star size={15} color="#f59e0b" fill="#f59e0b" />
                            <span style={{ fontSize: 12, fontWeight: 800, color: "#fbbf24" }}>PREMIUM</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>ODDIY HISOB</span>
                        )}

                        {u.isPremium && (
                          <button
                            onClick={() => handleRemovePremium(u.email)}
                            style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                          >
                            Olib tashlash
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── LIGHTBOX RECEIPT PREVIEW MODAL ── */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", padding: 20 }}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90vh" }}>
            <img src={previewImage} alt="Receipt" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 20, boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.2)" }} />
            <div style={{ position: "absolute", top: -16, right: -16, width: 36, height: 36, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, cursor: "pointer" }}>✕</div>
          </div>
        </div>
      )}

      {/* ── NEW ANNOUNCEMENT MODAL ── */}
      {showNotifModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '100%', maxWidth: 640, background: '#0f172a', borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 90px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#fff', fontSize: 22, fontWeight: 900 }}>Yangi E'lon Yaratish</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                placeholder="E'lon sarlavhasi..."
                value={notifForm.title}
                onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(30,41,59,0.7)', color: '#fff', fontSize: 15, outline: 'none' }}
              />

              <textarea
                placeholder="E'lon matnini kiriting..."
                value={notifForm.message}
                onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(30,41,59,0.7)', color: '#fff', fontSize: 14, outline: 'none', minHeight: 110, resize: 'vertical' }}
              />

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={notifForm.pinned} onChange={e => setNotifForm(f => ({ ...f, pinned: e.target.checked }))} />
                  📌 Muhim e'lon sifatida birkitish (Pinned)
                </label>

                <select
                  value={notifForm.type}
                  onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(30,41,59,0.9)', color: '#fff', fontWeight: 600 }}
                >
                  <option value="info">Info</option>
                  <option value="update">Update</option>
                  <option value="feature">Feature</option>
                  <option value="tip">Tip</option>
                  <option value="streak">Streak</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>Biriktiriladigan Rasm (Ixtiyoriy)</div>
                <input type="file" accept="image/*" onChange={e => handleImageSelect(e.target.files && e.target.files[0])} style={{ color: '#94a3b8' }} />
                {notifImage && (
                  <div style={{ marginTop: 12 }}>
                    <img src={URL.createObjectURL(notifImage)} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 14 }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button onClick={handleSendNotification} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>
                  E'lonni Tarqatish →
                </button>
                <button onClick={() => setShowNotifModal(false)} style={{ padding: '14px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 700 }}>
                  Bekor Qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}