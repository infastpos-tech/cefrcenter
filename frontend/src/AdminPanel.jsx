// AdminPanel.jsx — Apex Cyberpunk Control Command Center
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star, Search, Sparkles, Filter, Lock, Terminal,
  Cpu, Radio, Zap, Clock, ExternalLink, AlertTriangle, Layers
} from "lucide-react";
import BACKEND_URL from "./config/api";
import { io } from "socket.io-client";

export default function AdminPanel({ user, onBack }) {
  const [isVerified, setIsVerified] = useState(() => {
    const adminEmails = [
      "123456789123456789123456789",
      "123456789123456789123456789@admin.com",
      "asatillo@admin.com",
      "xolmirzayevanargiza57@gmail.com"
    ];
    return !!(user?.email && (adminEmails.includes(user.email) || user.isAdmin));
  });
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
  const [stats, setStats] = useState({ totalUsers: 0, recentUsers: 0, onlineUsers: 0, offlineUsers: 0, newToday: 0, dbStatus: "connected" });
  const [activity, setActivity] = useState({ listening: [], reading: [], writing: [], speaking: [], totalVisitors: 0 });
  const [activitySection, setActivitySection] = useState("listening");
  const [notifs, setNotifs] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', pinned: false, type: 'info' });
  const [notifImage, setNotifImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [userSort, setUserSort] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveToast, setLiveToast] = useState(null);

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
      const [pRes, uRes, sRes, nRes, aRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/payments/admin/list`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/payments/admin/users`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/stats?email=${adminEmail}`),
        fetch(`${BACKEND_URL}/api/notifications`, { headers: hdrs }),
        fetch(`${BACKEND_URL}/api/admin/activity`),
      ]);
      if (pRes.ok) setPayments(await pRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      if (nRes.ok) setNotifs(await nRes.json());
      if (aRes.ok) setActivity(await aRes.json());
    } catch (e) { console.error("Load failed", e); }
    finally { setLoading(false); }
  }, [adminEmail, hdrs]);

  useEffect(() => { if (isVerified) loadData(); }, [loadData, isVerified]);

  // Live Socket Listener for Real-time User Login / Registration Alerts
  useEffect(() => {
    if (!isVerified) return;
    try {
      const base = BACKEND_URL.startsWith('http') ? BACKEND_URL : undefined;
      const sock = io(base, { transports: ['websocket', 'polling'] });
      sock.on("admin_user_login", (data) => {
        setLiveToast({
          username: data.username,
          email: data.email,
          isNewUser: data.isNewUser,
          time: data.time || new Date().toLocaleTimeString(),
          phoneNumbers: data.phoneNumbers
        });
        loadData();
      });
      return () => { sock.disconnect(); };
    } catch(e) { console.warn("Admin socket init failed", e); }
  }, [isVerified, loadData]);

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
    { id: "activity", label: "Faoliyat Hisoboti", icon: Activity, count: activity.totalVisitors },
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
          background: rgba(15, 23, 42, 0.75);
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

        /* ── Mobile & Tablet Responsiveness ── */
        @media (max-width: 868px) {
          .cyber-admin-root {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .cyber-sidebar {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 14px 16px !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
          }
          .cyber-brand-wrap {
            margin-bottom: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .cyber-nav-list {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding-bottom: 6px !important;
            -webkit-overflow-scrolling: touch;
          }
          .cyber-nav-list::-webkit-scrollbar { display: none; }
          .cyber-tab-btn {
            margin-bottom: 0 !important;
            white-space: nowrap !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            flex-shrink: 0 !important;
          }
          .cyber-sidebar-footer {
            display: none !important;
          }
          .cyber-mobile-actions {
            display: flex !important;
            gap: 8px !important;
          }
          .cyber-admin-main {
            padding: 20px 16px !important;
            overflow-y: visible !important;
          }
          .cyber-header-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .cyber-header-wrap h2 {
            font-size: 22px !important;
          }
          .cyber-search-box {
            width: 100% !important;
          }
          .cyber-card-stat {
            padding: 18px 16px !important;
            border-radius: 18px !important;
          }
          .cyber-card-stat-val {
            font-size: 28px !important;
          }
          .cyber-pending-item {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .cyber-pending-btns {
            display: flex !important;
            width: 100% !important;
            justify-content: space-between !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .cyber-pending-btns button {
            flex: 1 !important;
            justify-content: center !important;
          }
          .cyber-lock-card {
            padding: 28px 20px !important;
            margin: 16px !important;
            border-radius: 22px !important;
          }
          .cyber-table-wrap {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
        }
      `}</style>

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="cyber-sidebar">
        {/* Brand header */}
        <div className="cyber-brand-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)", flexShrink: 0
            }}>
              <Zap size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                APEX MATRIX
              </h1>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#06b6d4", letterSpacing: "1px" }}>CONTROL CENTER</span>
            </div>
          </div>

          {/* Quick exit icon for mobile */}
          <div className="cyber-mobile-actions" style={{ display: "none" }}>
            <button onClick={loadData} style={{ padding: 8, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", cursor: "pointer" }}>
              <RefreshCw size={16} className={loading ? "spinSlow" : ""} />
            </button>
            <button onClick={onBack} style={{ padding: 8, borderRadius: 10, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer" }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tab items */}
        <nav className="cyber-nav-list" style={{ flex: 1 }}>
          {TABS.map(m => {
            const Icon = m.icon;
            const isActive = tab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`cyber-tab-btn ${isActive ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} color={isActive ? "#06b6d4" : "#64748b"} />
                  <span>{m.label}</span>
                </div>
                {m.badge && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#ef4444", padding: "2px 7px", borderRadius: 99, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)", marginLeft: 6 }}>
                    {m.badge}
                  </span>
                )}
                {m.count !== undefined && !m.badge && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#06b6d4" : "#475569", marginLeft: 6 }}>
                    {m.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer controls (Desktop) */}
        <div className="cyber-sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, marginTop: 20 }}>
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
      <main className="cyber-scroll cyber-admin-main" style={{ flex: 1, overflowY: "auto", padding: "32px 40px", position: "relative" }}>
        
        {/* Top bar with search & status */}
        <header className="cyber-header-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36, gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
              {tab === "dashboard" && "Dashboard & Tizim Statistikasi"}
              {tab === "activity" && "Faoliyat Hisoboti — Kim Nima Ishlagan"}
              {tab === "payments" && "Barcha To'lovlar Ro'yxati"}
              {tab === "notifications" && "E'lonlar va Bildirishnomalar"}
              {tab === "users" && "O'quvchilar Boshqaruv Bazasi"}
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0 0", fontWeight: 500 }}>
              CEFR Center Real-vaqt Apex Boshqaruv Portali
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Live Search */}
            <div className="cyber-search-box" style={{ position: "relative", width: 260 }}>
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
                {/* 5 Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
                  {[
                    { label: "Jami Foydalanuvchilar", value: activity.totalVisitors || stats.totalUsers || users.length, icon: Users, color: "#6366f1", trend: "Saytga kirganlar" },
                    { label: "Bugun Faol Bo'lganlar", value: stats.recentUsers, icon: Activity, color: "#06b6d4", trend: "Real-vaqt monitoring" },
                    { label: "Listening Ishlagan", value: activity.listening?.length || 0, icon: Zap, color: "#10b981", trend: "Tinglab test topshirdi" },
                    { label: "Reading Ishlagan", value: activity.reading?.length || 0, icon: Layers, color: "#f59e0b", trend: "O'qib test topshirdi" },
                    { label: "Kutilayotgan To'lovlar", value: pendingPaymentsCount, icon: CreditCard, color: "#ec4899", alert: pendingPaymentsCount > 0 },
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
                        <div key={p._id} className="cyber-pending-item" style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <CreditCard size={20} color="#f59e0b" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{p.email}</div>
                              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{p.amount?.toLocaleString()} UZS · Plan: {p.planId || "Premium"}</div>
                            </div>
                          </div>

                          <div className="cyber-pending-btns" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

            {/* ── TAB 2: FAOLIYAT HISOBOTI ── */}
            {tab === "activity" && (() => {
              const sectionConfig = {
                listening: { label: "🎧 Listening", color: "#10b981", desc: "Listening testlarini topshirganlar" },
                reading:   { label: "📖 Reading",   color: "#6366f1", desc: "Reading testlarini topshirganlar" },
                writing:   { label: "✍️ Writing",   color: "#f59e0b", desc: "Writing topshirganlar" },
                speaking:  { label: "🎤 Speaking",  color: "#ec4899", desc: "Speaking testlarini topshirganlar" },
              };
              const sKeys = Object.keys(sectionConfig);
              const currentList = activity[activitySection] || [];
              const cfg = sectionConfig[activitySection];
              return (
                <div>
                  {/* Summary Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
                    <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 18, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>Jami Kirganlar</span>
                      <span style={{ fontSize: 34, fontWeight: 900, color: "#6366f1" }}>{activity.totalVisitors || 0}</span>
                      <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>↑ Barcha foydalanuvchilar</span>
                    </div>
                    {sKeys.map(k => (
                      <div key={k} style={{ background: "rgba(15,23,42,0.7)", border: `1px solid ${sectionConfig[k].color}25`, borderRadius: 18, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", outline: activitySection === k ? `2px solid ${sectionConfig[k].color}` : "none" }}
                        onClick={() => setActivitySection(k)}>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>{sectionConfig[k].label}</div>
                        <div style={{ fontSize: 34, fontWeight: 900, color: sectionConfig[k].color, marginTop: 4 }}>{(activity[k] || []).length}</div>
                        <div style={{ fontSize: 12, color: sectionConfig[k].color, fontWeight: 600, marginTop: 2, opacity: 0.8 }}>kishi topshirdi</div>
                      </div>
                    ))}
                  </div>

                  {/* Section Switcher */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    {sKeys.map(k => (
                      <button key={k} onClick={() => setActivitySection(k)} style={{
                        padding: "9px 18px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                        background: activitySection === k ? `${sectionConfig[k].color}22` : "rgba(15,23,42,0.6)",
                        border: `1px solid ${activitySection === k ? sectionConfig[k].color : "rgba(255,255,255,0.08)"}`,
                        color: activitySection === k ? sectionConfig[k].color : "#94a3b8"
                      }}>{sectionConfig[k].label}</button>
                    ))}
                  </div>

                  {/* Table */}
                  <div style={{ background: "rgba(15,23,42,0.65)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22, overflow: "hidden", backdropFilter: "blur(16px)" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{cfg.label} — Ro'yxat</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{cfg.desc} · {currentList.length} kishi</p>
                      </div>
                      <div style={{ padding: "6px 14px", background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: cfg.color }}>
                        {currentList.length} ta
                      </div>
                    </div>

                    {currentList.length === 0 ? (
                      <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748b" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                        <p style={{ margin: 0, fontWeight: 600 }}>Hali hech kim {sectionConfig[activitySection].label} testini topshirmagan</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              {["#", "Foydalanuvchi", "Email", "Daraja", "Ball", "Oxirgi faollik"].map((h, i) => (
                                <th key={i} style={{ padding: "14px 18px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentList.map((u, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "14px 18px", fontSize: 13, color: "#64748b", fontWeight: 700 }}>{idx + 1}</td>
                                <td style={{ padding: "14px 18px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <span style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>{(u.username || "?")[0].toUpperCase()}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{u.username || "Mehmon"}</span>
                                  </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: 13, color: "#94a3b8" }}>{u.email}</td>
                                <td style={{ padding: "14px 18px" }}>
                                  <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: `${cfg.color}18`, color: cfg.color }}>{u.level || "A1"}</span>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: 14, fontWeight: 800, color: "#fff" }}>{u.score || 0}</td>
                                <td style={{ padding: "14px 18px", fontSize: 12, color: "#64748b" }}>
                                  {u.lastActive ? new Date(u.lastActive).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── TAB 3: PAYMENTS ── */}
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
                <div className="cyber-table-wrap" style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", backdropFilter: "blur(16px)" }}>
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

            {/* ── TAB 4: USERS MANAGEMENT ── */}
            {tab === "users" && (() => {
              // Client-side filter on top of server-side search
              const filteredU = users.filter(u => {
                const q = searchQuery.toLowerCase();
                const matchSearch = !q ||
                  (u.email || "").toLowerCase().includes(q) ||
                  (u.name || "").toLowerCase().includes(q) ||
                  (u.username || "").toLowerCase().includes(q) ||
                  (u.phone || "").toLowerCase().includes(q);
                const matchFilter =
                  userFilter === "all" ? true :
                  userFilter === "online" ? u.isOnline :
                  userFilter === "offline" ? !u.isOnline :
                  userFilter === "premium" ? u.isPremium :
                  userFilter === "admin" ? u.isAdmin : true;
                return matchSearch && matchFilter;
              });

              const fmt = (dt) => dt
                ? new Date(dt).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "—";

              return (
                <div>
                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
                    {[
                      { label: "Jami", value: stats.totalUsers || users.length, color: "#6366f1" },
                      { label: "Online", value: stats.onlineUsers || users.filter(u=>u.isOnline).length, color: "#10b981" },
                      { label: "Offline", value: stats.offlineUsers || users.filter(u=>!u.isOnline).length, color: "#64748b" },
                      { label: "Bugun Yangi", value: stats.newToday || 0, color: "#f59e0b" },
                      { label: "Premium", value: users.filter(u=>u.isPremium).length, color: "#ec4899" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(15,23,42,0.7)", border: `1px solid ${s.color}20`, borderRadius: 16, padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{s.label}</div>
                        <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Filter buttons */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    {[
                      { key: "all", label: "Hammasi" },
                      { key: "online", label: "🟢 Online" },
                      { key: "offline", label: "⚪ Offline" },
                      { key: "premium", label: "⭐ Premium" },
                      { key: "admin", label: "🛡 Admin" },
                    ].map(f => (
                      <button key={f.key} onClick={() => setUserFilter(f.key)} style={{
                        padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                        background: userFilter === f.key ? "rgba(99,102,241,0.2)" : "rgba(15,23,42,0.7)",
                        border: `1px solid ${userFilter === f.key ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: userFilter === f.key ? "#fff" : "#64748b",
                      }}>{f.label}</button>
                    ))}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Saralash:</span>
                      <select value={userSort} onChange={e => setUserSort(e.target.value)} style={{ padding: "7px 12px", borderRadius: 10, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>
                        <option value="newest">Eng yangi</option>
                        <option value="oldest">Eng eski</option>
                        <option value="xp">XP bo'yicha</option>
                        <option value="name">Ism bo'yicha</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ background: "rgba(15,23,42,0.65)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(16px)" }}>
                    {/* Table header */}
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>{filteredU.length} ta foydalanuvchi</span>
                    </div>

                    {filteredU.length === 0 ? (
                      <div style={{ padding: "60px 24px", textAlign: "center", color: "#64748b" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>No users yet</div>
                        <div style={{ fontSize: 13 }}>Hali hech kim ro'yxatdan o'tmagan</div>
                      </div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                          <thead>
                            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              {["#", "Foydalanuvchi", "Email", "Telefon", "Status", "Ro'yxat sanasi", "Oxirgi kirish"].map((h, i) => (
                                <th key={i} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredU.map((u, idx) => (
                              <tr key={u._id || u.email}
                                onClick={() => setSelectedUser(u)}
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569", fontWeight: 700 }}>{idx + 1}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: u.isPremium ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 800, color: u.isPremium ? "#fff" : "#94a3b8" }}>
                                      {(u.displayName || u.name || u.username || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>{u.displayName || u.name || u.username || "—"}</div>
                                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                                        {u.isAdmin && <span style={{ color: "#6366f1", fontWeight: 700 }}>ADMIN · </span>}
                                        {u.isPremium && <span style={{ color: "#f59e0b", fontWeight: 700 }}>⭐ PREMIUM · </span>}
                                        {u.level || "A1"} · {u.xp || 0} XP
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{u.email}</td>
                                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{u.phone || "—"}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: u.isOnline ? "#10b981" : "#475569" }}>
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: u.isOnline ? "#10b981" : "#475569", display: "inline-block" }} />
                                    {u.isOnline ? "Online" : "Offline"}
                                  </span>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{fmt(u.registeredAt || u.createdAt)}</td>
                                <td style={{ padding: "12px 16px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>{fmt(u.lastLogin || u.lastUpdated)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* User Detail Modal */}
                  {selectedUser && (
                    <div onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
                      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#0f172a", borderRadius: 24, border: "1px solid rgba(255,255,255,0.12)", padding: 32, boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: selectedUser.isPremium ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: selectedUser.isPremium ? "#fff" : "#94a3b8" }}>
                              {(selectedUser.displayName || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{selectedUser.displayName || selectedUser.name || selectedUser.username || "—"}</div>
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: selectedUser.isOnline ? "#10b981" : "#475569", display: "inline-block" }} />
                                {selectedUser.isOnline ? "Online" : "Offline"}
                                {selectedUser.isPremium && <span style={{ color: "#f59e0b", fontWeight: 700 }}>· ⭐ PREMIUM</span>}
                                {selectedUser.isAdmin && <span style={{ color: "#6366f1", fontWeight: 700 }}>· ADMIN</span>}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setSelectedUser(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#94a3b8", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>✕</button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {[
                            { label: "Email", value: selectedUser.email },
                            { label: "Telefon", value: selectedUser.phone || "—" },
                            { label: "Daraja", value: selectedUser.level || "A1" },
                            { label: "XP", value: (selectedUser.xp || 0).toLocaleString() },
                            { label: "Ro'yxat sanasi", value: fmt(selectedUser.registeredAt || selectedUser.createdAt) },
                            { label: "Oxirgi kirish", value: fmt(selectedUser.lastLogin || selectedUser.lastUpdated) },
                            { label: "Premium", value: selectedUser.isPremium ? `Ha (${selectedUser.premiumPlan || "—"})` : "Yo'q" },
                            { label: "Premium tugashi", value: fmt(selectedUser.premiumExpire) },
                            { label: "Umumiy XP", value: (selectedUser.xp || 0).toLocaleString() },
                            { label: "Ketma-ket kunlar", value: `${selectedUser.consecutiveDays || 0} kun` },
                          ].map((item, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{item.label}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", wordBreak: "break-all" }}>{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {selectedUser.isPremium && (
                          <button
                            onClick={() => { setSelectedUser(null); handleRemovePremium(selectedUser.email); }}
                            style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
                          >Premium Maqomini Bekor Qilish</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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

      {/* Real-time Student Entry Toast Banner */}
      {liveToast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99999,
          background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
          border: "1px solid rgba(99, 102, 241, 0.6)",
          borderRadius: 20, padding: "18px 24px", color: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", gap: 16,
          animation: "fadeInSlide 0.4s ease-out", maxWidth: 420
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bell size={22} color="#34d399" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "1px" }}>
              {liveToast.isNewUser ? "✨ YANGI O'QUVCHI RO'YXATDAN O'TDI!" : "🔔 O'QUVCHI SAYTGA KIRDI!"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {liveToast.username} ({liveToast.email})
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              ⏰ Vaqt: {liveToast.time} · 📱 SMS: +998955331528 / +998936910311
            </div>
          </div>
          <button onClick={() => setLiveToast(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
        </div>
      )}
    </div>
  );
}