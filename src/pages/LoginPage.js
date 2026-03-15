import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import neuLogo from "../assets/neu-library-logo.png";
import scheduleImg from "../assets/neu-library-sched.jpg";

const ALLOWED_DOMAIN = "neu.edu.ph";
const NEU_LIBRARY_IMG = "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=862977945973327";
const SCHEDULE_IMG = scheduleImg;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSignIn = async () => {
    setError(""); setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user.email.endsWith("@" + ALLOWED_DOMAIN)) {
        await auth.signOut();
        setError("Only @" + ALLOWED_DOMAIN + " emails are allowed.");
        setLoading(false); return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid, email: user.email,
          fullName: user.displayName || "",
          role: "user", userType: "", college_office: "",
          isSetupComplete: false, isBlocked: false, createdAt: new Date(),
        });
        navigate("/onboarding");
      } else {
        const data = snap.data();
        if (data.isBlocked) {
          await auth.signOut();
          setError("Access Denied. Please contact the Library Admin.");
          setLoading(false); return;
        }
        if (!data.isSetupComplete) navigate("/onboarding");
        else if (data.role === "admin") navigate("/admin");
        else navigate("/checkin");
      }
    } catch { setError("Sign-in failed. Please try again."); }
    setLoading(false);
  };

  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const day = time.getDay();
const timeInMinutes = time.getHours() * 60 + time.getMinutes();
const open = 7 * 60;
const closeWeekday = 19 * 60;
const closeShort = 18 * 60;
let isOpen = false;
if (day === 0) isOpen = false;
else if (day === 4 || day === 6) isOpen = timeInMinutes >= open && timeInMinutes < closeShort;
else isOpen = timeInMinutes >= open && timeInMinutes < closeWeekday;
  return (
    <div style={s.page}>
      {/* LEFT — Hero Image Panel */}
      <div style={s.hero}>
        <img
          src={NEU_LIBRARY_IMG}
          alt="NEU Library"
          style={{ ...s.heroImg, opacity: imgLoaded ? 1 : 0 }}
          onLoad={() => setImgLoaded(true)}
          onError={e => e.target.style.display = "none"}
        />
        <div style={s.heroOverlay} />

        {/* Top badge */}
        <div style={{ ...s.heroBadge, ...(isOpen ? {} : { background:"rgba(255,0,0,0.18)", border:"1px solid rgba(255,100,100,0.35)" }) }}>
  <div style={{ ...s.badgeDot, ...(isOpen ? {} : { background:"#f87171", boxShadow:"0 0 8px #f87171" }) }} />
  <span>{isOpen ? "Library Open Today" : "Library Closed"}</span>
</div>
        {/* Live clock */}
        <div style={s.clock}>
          <p style={s.clockTime}>{timeStr}</p>
          <p style={s.clockDate}>{dateStr}</p>
        </div>

        {/* Bottom info cards */}
        <div style={s.heroBottom}>
          <div style={s.heroCard}>
            <span style={s.heroCardIcon}>📚</span>
            <div>
              <p style={s.heroCardNum}>50,000+</p>
              <p style={s.heroCardLabel}>Books & Journals</p>
            </div>
          </div>
          <div style={s.heroCard}>
            <span style={s.heroCardIcon}>🎓</span>
            <div>
              <p style={s.heroCardNum}>22</p>
              <p style={s.heroCardLabel}>Colleges & Offices</p>
            </div>
          </div>
          <button style={s.schedBtn} onClick={() => setShowSchedule(true)}>
            📅 View Schedule
          </button>
        </div>

        {/* Diagonal decorative stripe */}
        <div style={s.stripe} />
      </div>

      {/* RIGHT — Login Form */}
      <div style={s.formSide}>
        {/* Decorative circles */}
        <div style={s.circle1} />
        <div style={s.circle2} />

        <div style={s.formWrap}>
          {/* Logo */}
          <div style={s.logoRow}>
            <div style={s.logoBox}>
              <img src={neuLogo} alt="NEU Logo" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:14 }} />
            </div>
            <div>
              <p style={s.logoLabel}>NEW ERA UNIVERSITY</p>
              <p style={s.logoSub}>Library System</p>
            </div>
          </div>

          <h1 style={s.title}>Welcome Back</h1>
          <p style={s.subtitle}>Sign in with your institutional email to access the library visitor log system.</p>

          {/* Info pill */}
          <div style={s.infoPill}>
            <span style={s.infoIcon}>✉️</span>
            <span style={s.infoText}>Use your <strong>@neu.edu.ph</strong> Google account</span>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            style={{ ...s.googleBtn, ...(loading ? s.googleBtnLoading : {}) }}
            onClick={handleSignIn}
            disabled={loading}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 35px rgba(26,58,92,0.25)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(26,58,92,0.12)"; }}
          >
            {!loading && (
              <div style={s.gIcon}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              </div>
            )}
            <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            {!loading && <span style={s.btnChevron}>→</span>}
          </button>

          <p style={s.footer}>© 2026 New Era University Library · All rights reserved</p>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div style={s.modalBg} onClick={() => setShowSchedule(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHead}>
              <h3 style={s.modalTitle}>📅 Library Schedule</h3>
              <button style={s.modalClose} onClick={() => setShowSchedule(false)}>✕</button>
            </div>
            <img src={SCHEDULE_IMG} alt="Schedule" style={s.schedImg}
              onError={e => { e.target.alt = "Schedule image not available"; }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
      `}</style>
    </div>
  );
}

const s = {
  page: { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans', sans-serif", background:"#f8f5f0" },

  // Hero
  hero: { flex:1.1, position:"relative", overflow:"hidden", minHeight:"100vh" },
  heroImg: { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.8s ease" },
  heroOverlay: { position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(26,58,92,0.75) 0%, rgba(10,30,55,0.88) 100%)" },
  heroBadge: {
    position:"absolute", top:32, left:32,
    background:"rgba(255,255,255,0.15)", backdropFilter:"blur(12px)",
    border:"1px solid rgba(255,255,255,0.25)",
    borderRadius:"99px", padding:"8px 16px",
    display:"flex", alignItems:"center", gap:8,
    color:"#fff", fontSize:13, fontWeight:500, zIndex:2,
    animation:"slideIn 0.6s ease forwards",
  },
  badgeDot: { width:8, height:8, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 8px #4ade80", animation:"pulse 2s infinite" },
  clock: {
    position:"absolute", top:"50%", left:"50%",
    transform:"translate(-50%, -50%)",
    textAlign:"center", zIndex:2,
    animation:"fadeUp 0.8s ease 0.2s both",
  },
  clockTime: { fontFamily:"'Cormorant Garamond', serif", fontSize:72, fontWeight:600, color:"#fff", lineHeight:1, letterSpacing:"-2px" },
  clockDate: { fontSize:14, color:"rgba(255,255,255,0.7)", marginTop:8, letterSpacing:"0.5px" },
  heroBottom: {
    position:"absolute", bottom:0, left:0, right:0, zIndex:2,
    padding:"24px 32px",
    background:"linear-gradient(0deg, rgba(10,30,55,0.9) 0%, transparent 100%)",
    display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
    animation:"fadeUp 0.8s ease 0.4s both",
  },
  heroCard: {
    display:"flex", alignItems:"center", gap:10,
    background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
    border:"1px solid rgba(255,255,255,0.2)",
    borderRadius:12, padding:"10px 16px",
  },
  heroCardIcon: { fontSize:22 },
  heroCardNum: { color:"#fff", fontSize:18, fontWeight:700, margin:0 },
  heroCardLabel: { color:"rgba(255,255,255,0.65)", fontSize:11, margin:0 },
  schedBtn: {
    marginLeft:"auto",
    background:"rgba(255,255,255,0.9)", border:"none",
    borderRadius:10, padding:"10px 18px",
    fontSize:13, fontWeight:600, color:"#1a3a5c",
    cursor:"pointer", transition:"all 0.2s",
  },
  stripe: {
    position:"absolute", top:0, right:-1, width:40, height:"100%",
    background:"#f8f5f0", clipPath:"polygon(100% 0, 100% 100%, 0 100%)",
    zIndex:3,
  },

  // Form side
  formSide: {
    flex:1, display:"flex", alignItems:"center", justifyContent:"center",
    padding:"48px 40px", background:"#f8f5f0",
    position:"relative", overflow:"hidden",
  },
  circle1: {
    position:"absolute", width:300, height:300, borderRadius:"50%",
    background:"rgba(26,58,92,0.05)", top:-80, right:-80,
    animation:"float 8s ease infinite",
  },
  circle2: {
    position:"absolute", width:200, height:200, borderRadius:"50%",
    background:"rgba(26,58,92,0.04)", bottom:40, left:-60,
    animation:"float 10s ease infinite 2s",
  },
  formWrap: { width:"100%", maxWidth:420, position:"relative", zIndex:1, animation:"fadeUp 0.7s ease forwards" },

  // Logo
  logoRow: { display:"flex", alignItems:"center", gap:14, marginBottom:36 },
  logoBox: {
    width:52, height:52, borderRadius:14,
    overflow:"hidden",
    boxShadow:"0 4px 16px rgba(26,58,92,0.25)", flexShrink:0,
  },
  logoLabel: { fontSize:10, fontWeight:700, color:"#1a3a5c", letterSpacing:"1.5px", margin:0 },
  logoSub: { fontSize:14, fontWeight:600, color:"#64748b", margin:0 },

  title: { fontFamily:"'Cormorant Garamond', serif", fontSize:42, fontWeight:700, color:"#1a1a2e", margin:"0 0 10px", lineHeight:1.1 },
  subtitle: { fontSize:14, color:"#64748b", lineHeight:1.7, margin:"0 0 28px" },

  infoPill: {
    background:"#eef2ff", border:"1px solid #c7d2fe",
    borderRadius:10, padding:"11px 16px",
    display:"flex", alignItems:"center", gap:10,
    fontSize:13, color:"#3730a3", marginBottom:16,
  },
  infoIcon: { fontSize:16 },
  infoText: { color:"#4338ca" },

  errorBox: {
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:10, padding:"11px 16px",
    display:"flex", alignItems:"center", gap:10,
    color:"#dc2626", fontSize:13, marginBottom:16,
  },

  googleBtn: {
    width:"100%", padding:"14px 20px",
    background:"#1a3a5c",
    border:"none", borderRadius:12,
    color:"#fff", fontSize:15, fontWeight:600,
    cursor:"pointer", display:"flex", alignItems:"center", gap:12,
    transition:"all 0.25s", marginBottom:20,
    boxShadow:"0 4px 15px rgba(26,58,92,0.12)",
  },
  googleBtnLoading: { opacity:0.75 },
  gIcon: {
    width:32, height:32, borderRadius:8,
    background:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0,
  },
  btnChevron: { marginLeft:"auto", fontSize:18 },

  divRow: { display:"flex", alignItems:"center", gap:12, marginBottom:24 },
  divLine: { flex:1, height:1, background:"#e2e8f0" },
  divText: { fontSize:11, color:"#94a3b8", whiteSpace:"nowrap" },

  featureRow: { display:"flex", gap:8, marginBottom:32 },
  featureItem: {
    flex:1, display:"flex", flexDirection:"column", alignItems:"center",
    gap:6, padding:"14px 8px",
    background:"#fff", borderRadius:12,
    border:"1px solid #e2e8f0",
    fontSize:18,
    boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
  },
  featureText: { fontSize:11, fontWeight:600, color:"#475569", textAlign:"center" },

  footer: { fontSize:11, color:"#94a3b8", textAlign:"center" },

  // Modal
  modalBg: {
    position:"fixed", inset:0, zIndex:100,
    background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)",
    display:"flex", alignItems:"center", justifyContent:"center", padding:20,
  },
  modalBox: {
    background:"#fff", borderRadius:20,
    padding:24, maxWidth:520, width:"100%",
    boxShadow:"0 25px 60px rgba(0,0,0,0.2)",
  },
  modalHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  modalTitle: { fontSize:18, fontWeight:700, color:"#1a1a2e" },
  modalClose: {
    width:32, height:32, borderRadius:"50%",
    background:"#f1f5f9", border:"none",
    cursor:"pointer", fontSize:14, color:"#64748b",
  },
  schedImg: { width:"100%", borderRadius:12 },
};
