// AdminPanel.jsx — Admin credentials updated: 123456789123456789123456789 / 123456789123456789123456789
import React, { useState, useEffect, useCallback } from "react";
import {
  Shield, User, CreditCard, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Trash2, Plus, RefreshCw, Eye, Camera, Key, Settings, Image as ImageIcon,
  Users, Activity, TrendingUp, Star
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
      setLoginError("Invalid credentials. Access denied.");
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

  const adminEmail = user?.email || "asatillo@admin.com";
  const hdrs = { "x-user-email": adminEmail };

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
  }, [adminEmail]);

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
        throw new Error(j.error || 'Failed to send notification');
      }
      await loadData();
      setShowNotifModal(false);
      setNotifForm({ title: '', message: '', pinned: false, type: 'info' });
      setNotifImage(null);
      alert('Notification sent');
    } catch (e) {
      console.error('Send notif failed', e);
      alert('Failed to send notification: ' + (e.message || 'Unknown'));
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
        throw new Error(j.error || 'Action failed');
      }
      await loadData();
    } catch (e) { alert("Action failed: " + (e.message || 'Error')); }
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
        throw new Error(j.error || 'Failed to remove premium');
      }
      alert('Premium olib tashlandi');
      await loadData();
    } catch (e) {
      console.error('Remove premium failed', e);
      alert('Premium olib tashlash muvaffaqiyatsiz: ' + (e.message || 'Xato'));
    }
  };

  if (!isVerified) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#f4f6f9",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif"
      }}>
        {/* Animated background orbs */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", top:"-200px", left:"-200px", animation:"orbAdminFloat 18s ease-in-out infinite" }} />
          <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)", bottom:"-150px", right:"-150px", animation:"orbAdminFloat 14s ease-in-out infinite reverse" }} />
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"orbAdminFloat 20s ease-in-out infinite 5s" }} />
        </div>
        <style>{`
          @keyframes orbAdminFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-35px) scale(1.05)} 66%{transform:translate(-20px,25px) scale(0.97)} }
          @keyframes adminCardIn { from{opacity:0;transform:translateY(32px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
          @keyframes shieldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 16px rgba(99,102,241,0)} }
          @keyframes adminSpin { to{transform:rotate(360deg)} }
          .admin-input:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 4px rgba(99,102,241,0.1) !important; background: #121a2e !important; color: #fff !important; }
          .admin-unlock-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 20px 50px rgba(99,102,241,0.2) !important; }
          .admin-back-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.12) !important; }
        `}</style>
        <div style={{
          width: "100%", maxWidth: 440, padding: "48px 44px",
          background: "#0d1527",
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          animation: "adminCardIn 0.6s cubic-bezier(0.16,1,0.3,1) both",
          position: "relative",
          zIndex: 10
        }}>
          {/* Top glow line */}
          <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(139,92,246,0.4), transparent)", borderRadius:"50%" }} />
          
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              width: 80, height: 80,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
              animation: "shieldPulse 3s ease-in-out infinite"
            }}>
              <Shield size={36} color="#fff" />
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>Admin Access</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 10, fontSize: 15, fontWeight: 500 }}>Enter your secure credentials</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", paddingLeft:4 }}>Login / Email</label>
              <input
                className="admin-input"
                type="text" required value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                style={{
                  width: "100%", padding: "15px 18px",
                  background: "#121a2e",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16, color: "#fff",
                  outline: "none", fontFamily: "inherit", fontSize: 15,
                  transition: "all 0.2s ease"
                }}
                placeholder="123456789123456789123456789"
              />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", paddingLeft:4 }}>Password</label>
              <input
                className="admin-input"
                type="password" required value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                style={{
                  width: "100%", padding: "15px 18px",
                  background: "#121a2e",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16, color: "#fff",
                  outline: "none", fontFamily: "inherit", fontSize: 15,
                  transition: "all 0.2s ease"
                }}
                placeholder="••••••••••••••••"
              />
            </div>
            
            {loginError && (
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                background:"rgba(255,59,48,0.08)", border:"1px solid rgba(255,59,48,0.18)",
                color:"#d32f2f", fontSize:13, fontWeight:600,
                padding:"12px 16px", borderRadius:12
              }}>
                <span style={{fontSize:16}}>⚠️</span> {loginError}
              </div>
            )}
            
            <button
              className="admin-unlock-btn"
              type="submit"
              style={{
                marginTop: 8,
                padding: "17px 24px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 16,
                color: "#fff", fontWeight: 800, cursor: "pointer",
                fontFamily: "inherit", fontSize: 16,
                boxShadow: "0 12px 35px rgba(99,102,241,0.20)",
                transition: "all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
                letterSpacing: "-0.2px"
              }}
            >
              🔓 Unlock Admin Panel
            </button>
            <button
              className="admin-back-btn"
              type="button" onClick={onBack}
              style={{
                padding: "14px 24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, color: "rgba(255,255,255,0.6)",
                cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight:600,
                transition: "all 0.2s ease"
              }}
            >
              ← Go Back
            </button>
          </form>
          
          {/* Bottom security badge */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:28 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#30d158", boxShadow:"0 0 8px rgba(48,209,88,0.3)" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:600, letterSpacing:"0.5px" }}>SECURED CONNECTION</span>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "payments",  label: "Payments",  icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "users",     label: "Students",  icon: Users },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(circle at top left, rgba(55,138,221,0.05), transparent 22%), radial-gradient(circle at bottom right, rgba(29,158,117,0.04), transparent 18%), var(--bg-primary)",
      zIndex: 1000,
      display: "flex",
      color: "var(--text-primary)",
      overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
        borderRight: "1px solid var(--border)",
        padding: 28, display: "flex", flexDirection: "column", flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.01)"
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: "var(--text-primary)" }}>Admin Panel</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>{adminEmail}</p>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {TABS.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)} style={{
              padding: "14px 16px", borderRadius: 14,
              background: tab === m.id ? "rgba(99,102,241,0.12)" : "transparent",
              border: "1px solid transparent",
              color: tab === m.id ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: 700, textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              fontFamily: "inherit", fontSize: 14,
              transition: "all 0.2s ease",
              boxShadow: tab === m.id ? "0 10px 20px rgba(99,102,241,0.05)" : "none"
            }}>
              <m.icon size={18} /> {m.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={loadData} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", fontFamily: "inherit", fontSize: 14, transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button onClick={onBack} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.15)", color: "#ff3b30", fontWeight: 700, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", fontFamily: "inherit", fontSize: 14, transition: "transform 0.2s ease" }}>
            <LogOut size={18} /> Exit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "var(--text-muted)" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {tab === "dashboard" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {[
                    { label: "Kirgan o'quvchilar (Total Students)", value: stats.totalUsers || users.length, icon: Users },
                    { label: "Bugun faol bo'lganlar (Active Today)", value: stats.recentUsers, icon: Activity },
                    { label: "Pending Payments", value: payments.filter(p => p.status === "pending").length, icon: CreditCard },
                    { label: "Notifications", value: notifs.length, icon: Bell },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                      <div>
                        <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 10, letterSpacing: "0.06em" }}>{s.label}</p>
                        <p style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
                      </div>
                      <s.icon size={26} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Recent Pending Payments</h3>
                {payments.filter(p => p.status === "pending").slice(0, 5).map(p => (
                  <div key={p._id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "18px 22px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{p.email}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.amount?.toLocaleString()} UZS</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#ff9f0a", fontWeight: 700, background: "rgba(255,159,10,0.1)", padding: "3px 10px", borderRadius: 99 }}>PENDING</span>
                    <button onClick={() => { if (p.receiptFileUrl) { const url = p.receiptFileUrl; setPreviewImage((url.startsWith('http')||url.startsWith('data:')) ? url : `${BACKEND_URL}${url}`); } }} style={{ padding: 8, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-primary)" }}>
                      <Eye size={16} />
                    </button>
                    <button onClick={() => { const reason = window.prompt('Rad etish sababi (ixtiyoriy):'); if (reason !== null) handleAction(p._id, 'reject', reason); }} style={{ padding: 8, background: "rgba(255,59,48,0.9)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <XCircle size={16} />
                    </button>
                    <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 8, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                      <CheckCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "payments" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>All Payments</h2>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                        {["Student", "Amount", "Status", "Actions"].map(h => (
                          <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No payments found</td></tr>
                      ) : payments.map(p => (
                        <tr key={p._id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s ease" }}>
                          <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontSize: 14 }}>{p.email}</td>
                          <td style={{ padding: "14px 16px", color: "var(--text-primary)", fontSize: 14 }}>{p.amount?.toLocaleString()}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ color: p.status === "pending" ? "#ff9f0a" : "#30d158", fontSize: 13, fontWeight: 700 }}>
                              {(p.status || "").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
                            <button onClick={() => { if (p.receiptFileUrl) { const url = p.receiptFileUrl; setPreviewImage((url.startsWith('http')||url.startsWith('data:')) ? url : `${BACKEND_URL}${url}`); } }} style={{ padding: 8, background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-primary)" }}>
                              <Eye size={16} />
                            </button>
                            {p.status === "pending" && (
                              <>
                                <button onClick={() => { const reason = window.prompt('Rad etish sababi (ixtiyoriy):'); if (reason !== null) handleAction(p._id, 'reject', reason); }} style={{ padding: 8, background: "rgba(255,59,48,0.9)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                                  <XCircle size={16} />
                                </button>
                                <button onClick={() => handleAction(p._id, "approve")} style={{ padding: 8, background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: 8, cursor: "pointer" }}>
                                  <CheckCircle size={16} />
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

            {tab === "notifications" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>Announcements</h2>
                  <button onClick={() => setShowNotifModal(true)} style={{ padding: "12px 24px", borderRadius: 12, background: "var(--text-primary)", border: "none", color: "var(--bg-primary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <Plus size={18} /> Send Notification
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                  {notifs.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", gridColumn: "1 / -1" }}>No notifications created yet.</p>
                  ) : notifs.map(n => (
                    <div key={n._id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 22, display: "flex", flexDirection: "column", gap: 14, boxShadow: "var(--shadow-md)" }}>
                      {n.image && (
                        <img src={n.image} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 16 }} />
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1D9E75", marginBottom: 4, textTransform: "uppercase" }}>{n.type}</div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0, marginBottom: 8 }}>{n.title}</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                      </div>
                      {n.pinned && <div style={{ fontSize: 11, fontWeight: 700, color: "#EF9F27" }}>📌 PINNED</div>}
                      <button onClick={() => handleAction(n._id, "delete", null, "notification")} style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.3)", fontWeight: 700, cursor: "pointer" }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "users" && (
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28, color: "var(--text-primary)" }}>Student Directory</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
                  {users.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No students found.</p>
                  ) : users.map(u => (
                    <div key={u.email} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, display: "flex", gap: 14, alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username || "Student"}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        {u.isPremium ? (
                          <button onClick={() => handleRemovePremium(u.email)} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,59,48,0.9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                            Remove Premium
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No premium</span>
                        )}
                        {u.isPremium && <Star size={18} color="#FFD700" fill="#FFD700" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img src={previewImage} alt="Receipt" style={{ maxWidth: "90%", maxHeight: "90vh", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {showNotifModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.68)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', maxWidth: 680, background: 'var(--bg-primary)', borderRadius: 22, padding: 24, border: '1px solid var(--border-med)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ margin: 0, marginBottom: 12, color: 'var(--text-primary)' }}>Send Notification</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <input placeholder="Title" value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <textarea placeholder="Message" value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: 120, marginTop: 8 }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={notifForm.pinned} onChange={e => setNotifForm(f => ({ ...f, pinned: e.target.checked }))} /> <span style={{ color: 'var(--text-muted)' }}>Pinned</span>
                  </label>
                  <select value={notifForm.type} onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="info">Info</option>
                    <option value="update">Update</option>
                    <option value="feature">Feature</option>
                    <option value="tip">Tip</option>
                    <option value="streak">Streak</option>
                  </select>
                </div>
              </div>
              <div style={{ width: 220 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Image (optional)</div>
                <input type="file" accept="image/*" onChange={e => handleImageSelect(e.target.files && e.target.files[0])} />
                {notifImage && (
                  <div style={{ marginTop: 8 }}>
                    <img src={URL.createObjectURL(notifImage)} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={handleSendNotification} style={{ flex: 1, padding: 10, borderRadius: 8, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontWeight: 700 }}>Send</button>
                  <button onClick={() => setShowNotifModal(false)} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}