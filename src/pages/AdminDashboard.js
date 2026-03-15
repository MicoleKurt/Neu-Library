import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import neuLogo from "../assets/neu-library-logo.png";

const TABS = [
  { key:"dashboard", icon:"📊", label:"Dashboard" },
  { key:"visitors", icon:"👥", label:"Visitor Logs" },
  { key:"search", icon:"🔍", label:"Search User" },
  { key:"manage", icon:"🔒", label:"Manage Users" },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [filter, setFilter] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getDateRange = () => {
    const now = new Date();
    switch (filter) {
      case "today": return [startOfDay(now), endOfDay(now)];
      case "week": return [startOfWeek(now), endOfWeek(now)];
      case "month": return [startOfMonth(now), endOfMonth(now)];
      case "custom":
        if (customStart && customEnd) return [startOfDay(new Date(customStart)), endOfDay(new Date(customEnd))];
        return [startOfDay(now), endOfDay(now)];
      default: return [startOfDay(now), endOfDay(now)];
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    const [start, end] = getDateRange();
    try {
      const q = query(collection(db, "logs"),
        where("timestamp", ">=", Timestamp.fromDate(start)),
        where("timestamp", "<=", Timestamp.fromDate(end)),
        orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setLogs([]); }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchLogs(); fetchUsers(); }, [filter, customStart, customEnd]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    const found = users.find(u => u.email === searchEmail.trim());
    setSearchResult(found || "not_found");
    if (found) {
      const q = query(collection(db, "logs"), where("uid", "==", found.uid), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setUserLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  const toggleBlock = async (uid, current) => {
    await updateDoc(doc(db, "users", uid), { isBlocked: !current });
    fetchUsers();
  };

  const totalVisitors = logs.length;
  const byCollege = logs.reduce((a, l) => { a[l.college_office] = (a[l.college_office] || 0) + 1; return a; }, {});
  const byReason = logs.reduce((a, l) => { a[l.reason] = (a[l.reason] || 0) + 1; return a; }, {});
  const topCollege = Object.entries(byCollege).sort((a,b) => b[1]-a[1])[0];
  const topReason = Object.entries(byReason).sort((a,b) => b[1]-a[1])[0];

  const STAT_CARDS = [
    { icon:"👥", label:"Total Visitors", value: totalVisitors, sub:"This period", color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
    { icon:"🏫", label:"Top College", value: topCollege ? topCollege[0].split("(")[0].trim().split(" ").slice(0,3).join(" ") : "N/A", sub: topCollege ? `${topCollege[1]} visits` : "No data", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
    { icon:"📌", label:"Top Reason", value: topReason ? topReason[0] : "N/A", sub: topReason ? `${topReason[1]} times` : "No data", color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
    { icon:"🗓️", label:"Period", value: filter.toUpperCase(), sub:"Active filter", color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  ];

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoBox}><img src={neuLogo} alt="NEU Logo" style={{ width:"100%", height:"100%", objectFit:"contain", borderRadius:14 }} /></div>
          <p style={s.sideTitle}>NEU Library</p>
          <p style={s.sideSub}>Admin Panel</p>
        </div>

        <nav style={s.nav}>
          <p style={s.navLabel}>MENU</p>
          {TABS.map(t => (
            <button key={t.key}
              style={{ ...s.navBtn, ...(activeTab === t.key ? s.navBtnActive : {}) }}
              onClick={() => setActiveTab(t.key)}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {activeTab === t.key && <div style={s.navIndicator} />}
            </button>
          ))}
        </nav>

        <div style={s.sideBottom}>
          <div style={s.adminBadge}>
            <span>👑</span>
            <span style={{ fontSize:12, fontWeight:600, color:"#1a3a5c" }}>Administrator</span>
          </div>
          <button style={s.logoutBtn} onClick={async () => { await logout(); navigate("/"); }}>
            ⏻ Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h2 style={s.pageTitle}>{TABS.find(t=>t.key===activeTab)?.icon} {TABS.find(t=>t.key===activeTab)?.label}</h2>
            <p style={s.pageSub}>New Era University Library Management</p>
          </div>
          <div style={s.topRight}>
            <div style={s.clockBox}>
              <div style={s.clockDot} />
              <span style={s.clockStr}>{time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>
            </div>
            <div style={s.filterGroup}>
              {["today","week","month","custom"].map(f => (
                <button key={f}
                  style={{ ...s.filterBtn, ...(filter===f ? s.filterBtnActive : {}) }}
                  onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            {filter==="custom" && (
              <div style={{ display:"flex", gap:6 }}>
                <input type="date" style={s.dateInput} value={customStart} onChange={e=>setCustomStart(e.target.value)} />
                <input type="date" style={s.dateInput} value={customEnd} onChange={e=>setCustomEnd(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <>
            <div style={s.statsGrid}>
              {STAT_CARDS.map((c,i) => (
                <div key={i} style={{ ...s.statCard, background:c.bg, border:`1px solid ${c.border}` }}>
                  <div style={{ ...s.statIcon, background:"#fff", boxShadow:`0 2px 8px ${c.color}22` }}>
                    <span style={{ fontSize:22 }}>{c.icon}</span>
                  </div>
                  <p style={{ ...s.statValue, color:c.color }}>{c.value}</p>
                  <p style={s.statLabel}>{c.label}</p>
                  <p style={s.statSub}>{c.sub}</p>
                </div>
              ))}
            </div>

            <div style={s.chartCard}>
              <h3 style={s.chartTitle}>📊 College / Office Breakdown</h3>
              {Object.entries(byCollege).length === 0 ? (
                <div style={s.emptyState}>No data for this period.</div>
              ) : (
                Object.entries(byCollege).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([col, count]) => {
                  const pct = Math.round((count/totalVisitors)*100);
                  return (
                    <div key={col} style={s.barRow}>
                      <span style={s.barLabel}>{col.split("(")[0].trim()}</span>
                      <div style={s.barTrack}>
                        <div style={{ ...s.barFill, width:pct+"%" }} />
                      </div>
                      <span style={s.barCount}>{count}</span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* VISITORS */}
        {activeTab==="visitors" && (
          <div style={s.tableCard}>
            <div style={s.tableHead}>
              <h3 style={s.chartTitle}>Visitor Logs</h3>
              <span style={s.countBadge}>{logs.length} entries</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead><tr>{["Name","Email","College/Office","Reason","Date & Time"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id} style={s.tr}>
                      <td style={s.td}><span style={s.tdBold}>{l.fullName||"—"}</span></td>
                      <td style={s.td}>{l.userEmail}</td>
                      <td style={s.td}>{l.college_office}</td>
                      <td style={s.td}><span style={s.reasonTag}>{l.reason}</span></td>
                      <td style={s.td}>{l.timestamp?.toDate().toLocaleString()||"—"}</td>
                    </tr>
                  ))}
                  {logs.length===0 && <tr><td colSpan={5} style={{...s.td,textAlign:"center",padding:32,color:"#94a3b8"}}>No logs found for this period.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab==="search" && (
          <div style={s.tableCard}>
            <h3 style={s.chartTitle}>Search by Email</h3>
            <p style={{ fontSize:13, color:"#94a3b8", margin:"0 0 20px" }}>Find a user and view their complete visit history.</p>
            <div style={s.searchRow}>
              <div style={s.searchInputWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input style={s.searchInput} placeholder="student@neu.edu.ph"
                  value={searchEmail} onChange={e=>setSearchEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSearch()} />
              </div>
              <button style={s.searchBtn} onClick={handleSearch}>Search</button>
            </div>
            {searchResult==="not_found" && <div style={s.notFound}>⚠️ No user found with that email address.</div>}
            {searchResult && searchResult!=="not_found" && (
              <div style={s.userResultCard}>
                <div style={s.userResultTop}>
                  <div style={s.userAvatar}>{searchResult.fullName?.charAt(0)||"U"}</div>
                  <div style={{ flex:1 }}>
                    <p style={s.userName}>{searchResult.fullName}</p>
                    <p style={s.userEmail}>{searchResult.email}</p>
                    <p style={s.userDept}>{searchResult.college_office} · {searchResult.userType}</p>
                  </div>
                  <span style={{ ...s.statusTag, ...(searchResult.isBlocked ? s.statusBlocked : s.statusActive) }}>
                    {searchResult.isBlocked ? "🔴 Blocked" : "🟢 Active"}
                  </span>
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:"#64748b", margin:"20px 0 12px" }}>
                  Visit History — {userLogs.length} total visits
                </p>
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Reason</th><th style={s.th}>Date & Time</th></tr></thead>
                  <tbody>
                    {userLogs.map(l=>(
                      <tr key={l.id} style={s.tr}>
                        <td style={s.td}><span style={s.reasonTag}>{l.reason}</span></td>
                        <td style={s.td}>{l.timestamp?.toDate().toLocaleString()||"—"}</td>
                      </tr>
                    ))}
                    {userLogs.length===0&&<tr><td colSpan={2} style={{...s.td,textAlign:"center",color:"#94a3b8"}}>No visits yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MANAGE */}
        {activeTab==="manage" && (
          <div style={s.tableCard}>
            <div style={s.tableHead}>
              <h3 style={s.chartTitle}>Manage Users</h3>
              <span style={s.countBadge}>{users.filter(u=>u.role!=="admin").length} users</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead><tr>{["Name","Email","Type","College/Office","Status","Action"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.filter(u=>u.role!=="admin").map(u=>(
                    <tr key={u.id} style={s.tr}>
                      <td style={s.td}><span style={s.tdBold}>{u.fullName||"—"}</span></td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>{u.userType||"—"}</td>
                      <td style={s.td}>{u.college_office||"—"}</td>
                      <td style={s.td}>
                        <span style={{...s.statusTag,...(u.isBlocked?s.statusBlocked:s.statusActive)}}>
                          {u.isBlocked?"Blocked":"Active"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <button
                          style={{ ...s.actionBtn, ...(u.isBlocked ? s.unblockBtn : s.blockBtn) }}
                          onClick={()=>toggleBlock(u.uid, u.isBlocked)}>
                          {u.isBlocked?"Unblock":"Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        select option { background: #fff; color: #1a1a2e; }
      `}</style>
    </div>
  );
}

const s = {
  layout: { display:"flex", minHeight:"100vh", background:"#f8f5f0", fontFamily:"'Plus Jakarta Sans', sans-serif" },
  sidebar: {
    width:240, background:"#fff",
    borderRight:"1px solid #e2e8f0",
    display:"flex", flexDirection:"column",
    padding:"28px 18px",
    boxShadow:"2px 0 12px rgba(0,0,0,0.04)",
  },
  sideTop: { textAlign:"center", paddingBottom:24, borderBottom:"1px solid #f1f5f9", marginBottom:16 },
  logoBox: {
    width:54, height:54, borderRadius:14,
    overflow:"hidden",
    margin:"0 auto 10px",
    boxShadow:"0 4px 14px rgba(26,58,92,0.25)",
  },
  sideTitle: { fontSize:15, fontWeight:700, color:"#1a1a2e", margin:0 },
  sideSub: { fontSize:11, color:"#94a3b8", margin:0 },
  nav: { flex:1 },
  navLabel: { fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"1.5px", margin:"0 0 8px", paddingLeft:12 },
  navBtn: {
    display:"flex", alignItems:"center", gap:10, width:"100%",
    padding:"10px 12px", borderRadius:10, border:"none",
    background:"transparent", cursor:"pointer",
    fontSize:13, fontWeight:500, color:"#64748b",
    transition:"all 0.2s", textAlign:"left", position:"relative",
    marginBottom:2,
  },
  navBtnActive: { background:"#eff6ff", color:"#1a3a5c", fontWeight:700 },
  navIndicator: {
    position:"absolute", right:0, top:"50%", transform:"translateY(-50%)",
    width:3, height:20, background:"#1a3a5c", borderRadius:"99px 0 0 99px",
  },
  sideBottom: { borderTop:"1px solid #f1f5f9", paddingTop:16 },
  adminBadge: {
    display:"flex", alignItems:"center", gap:8, justifyContent:"center",
    background:"#fffbeb", border:"1px solid #fde68a",
    borderRadius:10, padding:"8px 12px", marginBottom:10,
    fontSize:12, fontWeight:600, color:"#92400e",
  },
  logoutBtn: {
    width:"100%", padding:"9px",
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:10, cursor:"pointer",
    color:"#dc2626", fontSize:13, fontWeight:600,
  },
  main: { flex:1, padding:"32px 36px", overflowY:"auto" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, gap:16, flexWrap:"wrap" },
  pageTitle: { fontFamily:"'Cormorant Garamond', serif", fontSize:30, fontWeight:700, color:"#1a1a2e", margin:0 },
  pageSub: { fontSize:13, color:"#94a3b8", margin:0 },
  topRight: { display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  clockBox: {
    display:"flex", alignItems:"center", gap:8,
    background:"#fff", border:"1px solid #e2e8f0",
    borderRadius:10, padding:"8px 14px",
  },
  clockDot: { width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" },
  clockStr: { fontSize:15, fontWeight:700, color:"#1a1a2e" },
  filterGroup: { display:"flex", background:"#f1f5f9", borderRadius:10, padding:3 },
  filterBtn: {
    padding:"7px 14px", borderRadius:8, border:"none",
    background:"transparent", cursor:"pointer",
    fontSize:12, fontWeight:600, color:"#64748b", transition:"all 0.15s",
  },
  filterBtnActive: { background:"#fff", color:"#1a3a5c", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" },
  dateInput: {
    background:"#fff", border:"1px solid #e2e8f0",
    borderRadius:8, padding:"7px 10px", fontSize:12, color:"#1a1a2e",
  },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 },
  statCard: {
    borderRadius:16, padding:"20px",
    display:"flex", flexDirection:"column", gap:4,
    animation:"fadeIn 0.4s ease forwards",
  },
  statIcon: {
    width:46, height:46, borderRadius:12,
    display:"flex", alignItems:"center", justifyContent:"center",
    marginBottom:8,
  },
  statValue: { fontSize:22, fontWeight:800, margin:0 },
  statLabel: { fontSize:13, fontWeight:600, color:"#1a1a2e", margin:0 },
  statSub: { fontSize:11, color:"#94a3b8", margin:0 },
  chartCard: {
    background:"#fff", borderRadius:20, padding:"24px",
    border:"1px solid #e2e8f0",
    boxShadow:"0 4px 20px rgba(0,0,0,0.04)",
  },
  chartTitle: { fontSize:15, fontWeight:700, color:"#1a1a2e", margin:"0 0 20px" },
  emptyState: { textAlign:"center", color:"#94a3b8", fontSize:14, padding:"32px 0" },
  barRow: { display:"flex", alignItems:"center", gap:12, marginBottom:10 },
  barLabel: { fontSize:12, color:"#64748b", width:180, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  barTrack: { flex:1, height:8, background:"#f1f5f9", borderRadius:99, overflow:"hidden" },
  barFill: { height:"100%", background:"linear-gradient(90deg, #1a3a5c, #2563eb)", borderRadius:99, transition:"width 0.5s ease" },
  barCount: { fontSize:13, fontWeight:700, color:"#1a1a2e", width:28, textAlign:"right" },
  tableCard: {
    background:"#fff", borderRadius:20, padding:"24px",
    border:"1px solid #e2e8f0",
    boxShadow:"0 4px 20px rgba(0,0,0,0.04)",
  },
  tableHead: { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  countBadge: {
    background:"#eff6ff", color:"#2563eb",
    border:"1px solid #bfdbfe",
    borderRadius:99, padding:"3px 10px",
    fontSize:12, fontWeight:700,
  },
  table: { width:"100%", borderCollapse:"collapse" },
  th: {
    padding:"10px 14px", fontSize:11, fontWeight:700,
    color:"#94a3b8", textAlign:"left", letterSpacing:"0.5px",
    borderBottom:"1px solid #f1f5f9", background:"#fafbff",
  },
  tr: { borderBottom:"1px solid #f8fafc", transition:"background 0.15s" },
  td: { padding:"12px 14px", fontSize:13, color:"#475569" },
  tdBold: { fontWeight:600, color:"#1a1a2e" },
  reasonTag: {
    background:"#eff6ff", color:"#2563eb",
    borderRadius:99, padding:"3px 10px",
    fontSize:11, fontWeight:700,
    border:"1px solid #bfdbfe",
  },
  searchRow: { display:"flex", gap:10, marginBottom:20 },
  searchInputWrap: { flex:1, position:"relative" },
  searchIcon: { position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14 },
  searchInput: {
    width:"100%", padding:"12px 16px 12px 40px",
    background:"#fafbff", border:"2px solid #e2e8f0",
    borderRadius:12, fontSize:14, color:"#1a1a2e",
    outline:"none", boxSizing:"border-box",
  },
  searchBtn: {
    background:"#1a3a5c", border:"none",
    borderRadius:12, padding:"12px 24px",
    cursor:"pointer", color:"#fff", fontWeight:600, fontSize:14,
    boxShadow:"0 4px 12px rgba(26,58,92,0.2)",
  },
  notFound: {
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:12, padding:"14px 16px", color:"#dc2626", fontSize:14,
  },
  userResultCard: {
    border:"1px solid #e2e8f0", borderRadius:16,
    padding:20, background:"#fafbff",
  },
  userResultTop: { display:"flex", alignItems:"center", gap:14 },
  userAvatar: {
    width:48, height:48, borderRadius:"50%",
    background:"linear-gradient(135deg, #1a3a5c, #2563eb)",
    color:"#fff", fontWeight:700, fontSize:20,
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  userName: { fontSize:16, fontWeight:700, color:"#1a1a2e", margin:0 },
  userEmail: { fontSize:13, color:"#64748b", margin:0 },
  userDept: { fontSize:12, color:"#94a3b8", margin:0 },
  statusTag: { borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:700, flexShrink:0 },
  statusActive: { background:"#dcfce7", color:"#15803d", border:"1px solid #bbf7d0" },
  statusBlocked: { background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" },
  actionBtn: { borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:700, border:"none", transition:"all 0.2s" },
  blockBtn: { background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca" },
  unblockBtn: { background:"#dcfce7", color:"#15803d", border:"1px solid #bbf7d0" },
};
