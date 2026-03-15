import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import neuLogo from "../assets/neu-library-logo.png";

const REASONS = [
  { key:"Reading", icon:"📖", color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
  { key:"Research", icon:"🔬", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  { key:"Use of Computer", icon:"💻", color:"#0891b2", bg:"#ecfeff", border:"#a5f3fc" },
  { key:"Studying", icon:"📝", color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
  { key:"Borrowing/Returning Books", icon:"📚", color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  { key:"Other", icon:"🔖", color:"#db2777", bg:"#fdf2f8", border:"#fbcfe8" },
];

const SAMPLE_BOOKS = [
  { id:1, title:"Introduction to Computing", author:"Peter Norton", cover:"📘", genre:"Technology", available: true },
  { id:2, title:"Fundamentals of Nursing", author:"Carol Taylor", cover:"📗", genre:"Nursing", available: true },
  { id:3, title:"Business Communication", author:"Mary Ellen Guffey", cover:"📙", genre:"Business", available: false },
  { id:4, title:"Engineering Mathematics", author:"K.A. Stroud", cover:"📕", genre:"Engineering", available: true },
  { id:5, title:"Principles of Accounting", author:"Weygandt & Kimmel", cover:"📒", genre:"Accountancy", available: true },
  { id:6, title:"Criminal Law & Jurisprudence", author:"Luis Reyes", cover:"📔", genre:"Criminology", available: false },
];

export default function CheckInPage() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [showBookPanel, setShowBookPanel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setShowBookPanel(reason === "Borrowing/Returning Books");
    if (reason !== "Borrowing/Returning Books") setSelectedBooks([]);
  }, [reason]);

  const toggleBook = (book) => {
    if (!book.available) return;
    setSelectedBooks(prev =>
      prev.find(b => b.id === book.id)
        ? prev.filter(b => b.id !== book.id)
        : [...prev, book]
    );
  };

  const handleCheckIn = async () => {
    if (!reason) { setError("Please select a reason for your visit."); return; }
    if (reason === "Borrowing/Returning Books" && selectedBooks.length === 0) {
      setError("Please select at least one book to borrow."); return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "logs"), {
        uid: currentUser.uid, userEmail: currentUser.email,
        fullName: currentUser.displayName || "",
        college_office: userProfile?.college_office || "",
        userType: userProfile?.userType || "user",
        reason,
        booksBorrowed: selectedBooks.map(b => b.title),
        timestamp: serverTimestamp(),
      });
      navigate("/welcome");
    } catch { setError("Check-in failed. Please try again."); }
    setLoading(false);
  };

  const filteredBooks = SAMPLE_BOOKS.filter(b =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.genre.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const timeStr = time.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const dateStr = time.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const initial = currentUser?.displayName?.charAt(0) || "U";

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoBox}><img src={neuLogo} alt="NEU Logo" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:14 }} /></div>
          <p style={s.sideTitle}>NEU Library</p>
          <p style={s.sideSub}>Visitor Log System</p>
        </div>

        <div style={s.navSection}>
          <p style={s.navLabel}>NAVIGATION</p>
          <div style={s.navItem}>
            <span>📋</span>
            <span>Check-in</span>
            <div style={s.navActive} />
          </div>
        </div>

        <div style={s.sideBottom}>
          <div style={s.profileCard}>
            <div style={s.avatar}>{initial}</div>
            <div style={s.profileInfo}>
              <p style={s.profileName}>{currentUser?.displayName?.split(" ")[0]}</p>
              <p style={s.profileRole}>{userProfile?.userType || "user"}</p>
            </div>
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
            <h2 style={s.pageTitle}>Library Check-in</h2>
            <p style={s.pageDate}>{dateStr}</p>
          </div>
          <div style={s.liveClock}>
            <div style={s.clockDot} />
            <span style={s.clockStr}>{timeStr}</span>
          </div>
        </div>

        {/* Welcome banner */}
        <div style={s.banner}>
          <div style={s.bannerLeft}>
            <p style={s.bannerHi}>Good {time.getHours() < 12 ? "Morning" : time.getHours() < 17 ? "Afternoon" : "Evening"},</p>
            <h3 style={s.bannerName}>{currentUser?.displayName}</h3>
            <div style={s.tagRow}>
              <span style={s.tag}>🏫 {userProfile?.college_office?.split("(")[0]?.trim()}</span>
              <span style={s.tag}>👤 {userProfile?.userType}</span>
            </div>
          </div>
          <div style={s.bannerRight}>
            <span style={{ fontSize:80, opacity:0.12 }}>📚</span>
          </div>
        </div>

        {/* Reason selection */}
        <div style={s.section}>
          <div style={s.sectionTop}>
            <h3 style={s.sectionTitle}>Purpose of Visit</h3>
            <p style={s.sectionSub}>What brings you to the library today?</p>
          </div>

          <div style={s.grid}>
            {REASONS.map(r => (
              <button key={r.key}
                style={{
                  ...s.card,
                  ...(reason === r.key ? { ...s.cardActive, background: r.bg, borderColor: r.color, boxShadow: `0 4px 20px ${r.color}22` } : {}),
                }}
                onClick={() => { setReason(r.key); setError(""); }}
                onMouseEnter={e => { if (reason !== r.key) { e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}}
                onMouseLeave={e => { if (reason !== r.key) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}}
              >
                {reason === r.key && <div style={{ ...s.cardCheck, background: r.color }}>✓</div>}
                <div style={{ ...s.cardIconWrap, background: reason === r.key ? r.bg : "#f8fafc", border: `1px solid ${reason === r.key ? r.border : "#e2e8f0"}` }}>
                  <span style={{ fontSize:26 }}>{r.icon}</span>
                </div>
                <p style={{ ...s.cardLabel, color: reason === r.key ? r.color : "#1a1a2e" }}>{r.key}</p>
              </button>
            ))}
          </div>

          {/* Book Borrowing Panel */}
          {showBookPanel && (
            <div style={s.bookPanel}>
              <div style={s.bookPanelHeader}>
                <div>
                  <h4 style={s.bookPanelTitle}>📚 Select Books to Borrow</h4>
                  <p style={s.bookPanelSub}>Choose from available books below</p>
                </div>
                {selectedBooks.length > 0 && (
                  <div style={s.selectedCount}>
                    {selectedBooks.length} book{selectedBooks.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* Search */}
              <div style={s.bookSearchWrap}>
                <span style={s.bookSearchIcon}>🔍</span>
                <input
                  style={s.bookSearchInput}
                  placeholder="Search by title, author, or genre..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                />
              </div>

              {/* Book Grid */}
              <div style={s.bookGrid}>
                {filteredBooks.map(book => {
                  const isSelected = selectedBooks.find(b => b.id === book.id);
                  return (
                    <div
                      key={book.id}
                      style={{
                        ...s.bookCard,
                        ...(isSelected ? s.bookCardSelected : {}),
                        ...(!book.available ? s.bookCardUnavailable : {}),
                        cursor: book.available ? "pointer" : "not-allowed",
                      }}
                      onClick={() => toggleBook(book)}
                    >
                      {isSelected && <div style={s.bookCheck}>✓</div>}
                      {!book.available && <div style={s.bookUnavailBadge}>Unavailable</div>}
                      <span style={s.bookCover}>{book.cover}</span>
                      <div style={s.bookInfo}>
                        <p style={s.bookTitle}>{book.title}</p>
                        <p style={s.bookAuthor}>{book.author}</p>
                        <span style={{ ...s.bookGenre, opacity: book.available ? 1 : 0.5 }}>{book.genre}</span>
                      </div>
                      <div style={{ ...s.bookStatus, color: book.available ? "#059669" : "#dc2626", background: book.available ? "#dcfce7" : "#fef2f2", border: `1px solid ${book.available ? "#bbf7d0" : "#fecaca"}` }}>
                        {book.available ? "✅ Available" : "❌ Checked Out"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Books Summary */}
              {selectedBooks.length > 0 && (
                <div style={s.selectedSummary}>
                  <p style={s.selectedSummaryTitle}>📋 Books to Borrow:</p>
                  {selectedBooks.map(b => (
                    <div key={b.id} style={s.selectedBookRow}>
                      <span>{b.cover} {b.title}</span>
                      <button style={s.removeBookBtn} onClick={() => toggleBook(b)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={s.error}>⚠️ {error}</div>
          )}

          <button
            style={{ ...s.checkinBtn, opacity: loading ? 0.75 : 1 }}
            onClick={handleCheckIn}
            disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(26,58,92,0.3)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(26,58,92,0.2)"; }}
          >
            {loading ? "Recording visit..." : "✅  Check-in to Library"}
          </button>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
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
  sideTop: { textAlign:"center", paddingBottom:24, borderBottom:"1px solid #f1f5f9", marginBottom:24 },
  logoBox: {
    width:54, height:54, borderRadius:14,
    overflow:"hidden",
    margin:"0 auto 10px",
    boxShadow:"0 4px 14px rgba(26,58,92,0.25)",
  },
  sideTitle: { fontSize:15, fontWeight:700, color:"#1a1a2e", margin:0 },
  sideSub: { fontSize:11, color:"#94a3b8", margin:0 },
  navSection: { flex:1 },
  navLabel: { fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"1.5px", marginBottom:8, paddingLeft:12 },
  navItem: {
    display:"flex", alignItems:"center", gap:10,
    padding:"10px 12px", borderRadius:10,
    background:"#eff6ff", color:"#1a3a5c",
    fontSize:13, fontWeight:600, position:"relative",
  },
  navActive: {
    position:"absolute", right:0, top:"50%", transform:"translateY(-50%)",
    width:3, height:20, background:"#1a3a5c", borderRadius:"99px 0 0 99px",
  },
  sideBottom: { borderTop:"1px solid #f1f5f9", paddingTop:16 },
  profileCard: {
    display:"flex", alignItems:"center", gap:10,
    padding:"10px 12px", background:"#f8fafc",
    borderRadius:12, marginBottom:10,
    border:"1px solid #e2e8f0",
  },
  avatar: {
    width:36, height:36, borderRadius:"50%",
    background:"linear-gradient(135deg, #1a3a5c, #2563eb)",
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", fontWeight:700, fontSize:15, flexShrink:0,
  },
  profileInfo: {},
  profileName: { fontSize:13, fontWeight:700, color:"#1a1a2e", margin:0 },
  profileRole: { fontSize:11, color:"#94a3b8", margin:0, textTransform:"capitalize" },
  logoutBtn: {
    width:"100%", padding:"9px",
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:10, cursor:"pointer",
    color:"#dc2626", fontSize:13, fontWeight:600,
  },
  main: { flex:1, padding:"32px 36px", overflowY:"auto" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 },
  pageTitle: { fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:700, color:"#1a1a2e", margin:0 },
  pageDate: { fontSize:13, color:"#94a3b8", margin:0 },
  liveClock: {
    display:"flex", alignItems:"center", gap:8,
    background:"#fff", border:"1px solid #e2e8f0",
    borderRadius:12, padding:"10px 18px",
    boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
  },
  clockDot: { width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" },
  clockStr: { fontSize:18, fontWeight:700, color:"#1a1a2e", fontVariantNumeric:"tabular-nums" },
  banner: {
    background:"linear-gradient(135deg, #1a3a5c 0%, #1e40af 100%)",
    borderRadius:20, padding:"28px 32px",
    display:"flex", justifyContent:"space-between", alignItems:"center",
    marginBottom:28, overflow:"hidden", position:"relative",
  },
  bannerLeft: {},
  bannerHi: { color:"rgba(255,255,255,0.7)", fontSize:13, margin:"0 0 4px" },
  bannerName: { fontFamily:"'Cormorant Garamond', serif", color:"#fff", fontSize:28, fontWeight:700, margin:"0 0 12px" },
  tagRow: { display:"flex", gap:8, flexWrap:"wrap" },
  tag: {
    background:"rgba(255,255,255,0.15)",
    borderRadius:99, padding:"4px 12px",
    fontSize:12, color:"#fff",
  },
  bannerRight: { position:"absolute", right:24, top:"50%", transform:"translateY(-50%)" },
  section: {
    background:"#fff", borderRadius:20, padding:"28px",
    border:"1px solid #e2e8f0",
    boxShadow:"0 4px 20px rgba(0,0,0,0.04)",
  },
  sectionTop: { marginBottom:20 },
  sectionTitle: { fontSize:17, fontWeight:700, color:"#1a1a2e", margin:"0 0 4px" },
  sectionSub: { fontSize:13, color:"#94a3b8", margin:0 },
  grid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:20 },
  card: {
    background:"#fafbff", border:"2px solid #e2e8f0",
    borderRadius:16, padding:"18px 12px",
    cursor:"pointer", display:"flex", flexDirection:"column",
    alignItems:"center", gap:10,
    transition:"all 0.2s", position:"relative",
    boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
  },
  cardActive: {},
  cardCheck: {
    position:"absolute", top:8, right:8,
    width:20, height:20, borderRadius:"50%",
    color:"#fff", fontSize:10, fontWeight:700,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  cardIconWrap: {
    width:52, height:52, borderRadius:14,
    display:"flex", alignItems:"center", justifyContent:"center",
    transition:"all 0.2s",
  },
  cardLabel: { fontSize:12, fontWeight:700, margin:0, textAlign:"center", transition:"color 0.2s" },
  error: {
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:10, padding:"12px 16px",
    color:"#dc2626", fontSize:13, marginBottom:16,
  },
  checkinBtn: {
    width:"100%", padding:"16px",
    background:"#1a3a5c", border:"none",
    borderRadius:12, color:"#fff",
    fontSize:15, fontWeight:700, cursor:"pointer",
    boxShadow:"0 4px 15px rgba(26,58,92,0.2)",
    transition:"all 0.25s",
  },

  // Book panel styles
  bookPanel: {
    background:"#fffbeb", border:"1.5px solid #fde68a",
    borderRadius:16, padding:"20px",
    marginBottom:20, animation:"fadeIn 0.3s ease forwards",
  },
  bookPanelHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 },
  bookPanelTitle: { fontSize:15, fontWeight:700, color:"#92400e", margin:"0 0 2px" },
  bookPanelSub: { fontSize:12, color:"#b45309", margin:0 },
  selectedCount: {
    background:"#d97706", color:"#fff",
    borderRadius:99, padding:"4px 12px",
    fontSize:12, fontWeight:700,
  },
  bookSearchWrap: { position:"relative", marginBottom:14 },
  bookSearchIcon: { position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14 },
  bookSearchInput: {
    width:"100%", padding:"10px 14px 10px 36px",
    background:"#fff", border:"1.5px solid #fde68a",
    borderRadius:10, fontSize:13, color:"#1a1a2e",
    outline:"none", boxSizing:"border-box",
  },
  bookGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:14 },
  bookCard: {
    background:"#fff", border:"1.5px solid #e2e8f0",
    borderRadius:12, padding:"14px 12px",
    display:"flex", flexDirection:"column", alignItems:"center",
    gap:8, transition:"all 0.2s", position:"relative",
    boxShadow:"0 2px 6px rgba(0,0,0,0.04)",
  },
  bookCardSelected: {
    border:"1.5px solid #d97706",
    background:"#fffbeb",
    boxShadow:"0 4px 14px rgba(217,119,6,0.15)",
    transform:"translateY(-2px)",
  },
  bookCardUnavailable: { opacity:0.6 },
  bookCheck: {
    position:"absolute", top:8, right:8,
    width:20, height:20, borderRadius:"50%",
    background:"#d97706", color:"#fff",
    fontSize:10, fontWeight:700,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  bookUnavailBadge: {
    position:"absolute", top:6, left:6,
    background:"#fef2f2", color:"#dc2626",
    border:"1px solid #fecaca",
    borderRadius:6, padding:"2px 6px",
    fontSize:9, fontWeight:700,
  },
  bookCover: { fontSize:32 },
  bookInfo: { textAlign:"center", flex:1 },
  bookTitle: { fontSize:11, fontWeight:700, color:"#1a1a2e", margin:"0 0 2px", lineHeight:1.3 },
  bookAuthor: { fontSize:10, color:"#94a3b8", margin:"0 0 4px" },
  bookGenre: {
    background:"#f1f5f9", color:"#64748b",
    borderRadius:99, padding:"2px 8px",
    fontSize:9, fontWeight:600, display:"inline-block",
  },
  bookStatus: {
    borderRadius:99, padding:"3px 8px",
    fontSize:10, fontWeight:700,
    width:"100%", textAlign:"center",
  },
  selectedSummary: {
    background:"#fff", border:"1px solid #fde68a",
    borderRadius:10, padding:"12px 14px",
    marginTop:4,
  },
  selectedSummaryTitle: { fontSize:12, fontWeight:700, color:"#92400e", margin:"0 0 8px" },
  selectedBookRow: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    fontSize:12, color:"#1a1a2e", padding:"4px 0",
    borderBottom:"1px solid #fef3c7",
  },
  removeBookBtn: {
    background:"none", border:"none", cursor:"pointer",
    color:"#dc2626", fontSize:12, fontWeight:700,
    padding:"0 4px",
  },
};
