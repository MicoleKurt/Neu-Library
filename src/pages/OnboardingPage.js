import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const COLLEGES = [
  "College of Medicine","College of Nursing","College of Medical Technology",
  "College of Physical Therapy","College of Respiratory Therapy","College of Midwifery",
  "College of Engineering and Architecture",
  "College of Informatics and Computing Studies (CICS)",
  "College of Accountancy","College of Business Administration","College of Criminology",
  "College of Law","College of Arts and Sciences","College of Education",
  "College of Communication","College of Music","School of International Relations",
  "School of Graduate Studies","College of Evangelical Ministry","College of Agriculture",
  "Integrated School (Elementary, Junior High, and Senior High School)","Other",
];

const ROLES = [
  { key:"student", label:"Student", icon:"🎓", desc:"Undergraduate or Graduate" },
  { key:"faculty", label:"Faculty", icon:"👨‍🏫", desc:"Professor or Instructor" },
  { key:"employee", label:"Employee", icon:"💼", desc:"Staff or Personnel" },
];

export default function OnboardingPage() {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (!role) { setError("Please select your role."); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async () => {
    if (!college) { setError("Please select your College or Office."); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        userType: role, college_office: college, isSetupComplete: true,
      });
      await refreshProfile();
      navigate("/checkin");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.leftAccent} />

      <div style={s.card}>
        {/* Progress bar */}
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: step === 1 ? "50%" : "100%" }} />
        </div>

        {/* Header */}
        <div style={s.header}>
          <div style={s.logoRow}>
            <div style={s.logoBox}><img src="https://scontent.fmnl8-5.fna.fbcdn.net/v/t39.30808-6/587748546_122156030186743934_2851142283168601511_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=NfulO6jFktIQ7kNvwH8Z-Tl&_nc_oc=AdmOsABphm-dGPP7eb3nEMcpuw4GbVOo3bkCmm0F0HyzY4e1DygcLor3atUbebPY8DY&_nc_zt=23&_nc_ht=scontent.fmnl8-5.fna&_nc_gid=TEUAwd3lFSoJiZOkgn8lIw&_nc_ss=8&oh=00_AfxV_XKf2op2ktOmdNDcKCBFQPf7fcvLZ4IC2dgoWPPPnw&oe=69B1FE35" alt="NEU Logo" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:12 }} /></div>
            <div>
              <p style={s.logoLabel}>NEU LIBRARY</p>
              <p style={s.logoSub}>One-time Profile Setup</p>
            </div>
          </div>

          <div style={s.stepRow}>
            {[1, 2].map(n => (
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ ...s.stepNum, ...(step >= n ? s.stepNumActive : {}) }}>{step > n ? "✓" : n}</div>
                <span style={{ ...s.stepLabel, color: step >= n ? "#1a3a5c" : "#94a3b8" }}>
                  {n === 1 ? "Your Role" : "Your College"}
                </span>
                {n < 2 && <div style={{ ...s.stepLine, background: step >= 2 ? "#1a3a5c" : "#e2e8f0" }} />}
              </div>
            ))}
          </div>

          <h2 style={s.title}>{step === 1 ? "Who are you?" : "Where are you from?"}</h2>
          <p style={s.sub}>Hi {currentUser?.displayName?.split(" ")[0]} 👋 — {step === 1 ? "Select your role at NEU." : "Select your college or office."}</p>
        </div>

        <div style={s.body}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div style={s.roleGrid}>
                {ROLES.map(r => (
                  <button key={r.key}
                    style={{ ...s.roleCard, ...(role === r.key ? s.roleCardActive : {}) }}
                    onClick={() => { setRole(r.key); setError(""); }}
                    onMouseEnter={e => { if (role !== r.key) e.currentTarget.style.borderColor = "#93c5fd"; }}
                    onMouseLeave={e => { if (role !== r.key) e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >
                    {role === r.key && <div style={s.checkBadge}>✓</div>}
                    <span style={s.roleIcon}>{r.icon}</span>
                    <p style={s.roleLabel}>{r.label}</p>
                    <p style={s.roleDesc}>{r.desc}</p>
                  </button>
                ))}
              </div>
              {error && <div style={s.error}>{error}</div>}
              <button style={s.nextBtn} onClick={handleNext}>Continue →</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div style={s.selectWrap}>
                <span style={s.selectIcon}>🏫</span>
                <select style={s.select} value={college} onChange={e => { setCollege(e.target.value); setError(""); }}>
                  <option value="">Select your college or office...</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {college && (
                <div style={s.selectedPill}>
                  <span>✅</span>
                  <span style={{ fontWeight:600, color:"#1a3a5c" }}>{college}</span>
                </div>
              )}

              {error && <div style={s.error}>{error}</div>}

              <div style={s.btnRow}>
                <button style={s.backBtn} onClick={() => { setStep(1); setError(""); }}>← Back</button>
                <button style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Complete Setup ✓"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight:"100vh", background:"#f8f5f0",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Plus Jakarta Sans', sans-serif", padding:24, position:"relative",
  },
  leftAccent: {
    position:"fixed", left:0, top:0, bottom:0, width:6,
    background:"linear-gradient(180deg, #1a3a5c, #2563eb, #1a3a5c)",
  },
  card: {
    width:"100%", maxWidth:520, background:"#fff",
    borderRadius:24, overflow:"hidden",
    boxShadow:"0 20px 60px rgba(26,58,92,0.12)",
    border:"1px solid #e2e8f0",
    animation:"fadeUp 0.6s ease forwards",
  },
  progressBar: { height:4, background:"#e2e8f0" },
  progressFill: { height:"100%", background:"linear-gradient(90deg, #1a3a5c, #2563eb)", transition:"width 0.4s ease", borderRadius:"0 99px 99px 0" },
  header: { padding:"28px 32px 0", background:"#fafbff", borderBottom:"1px solid #f1f5f9" },
  logoRow: { display:"flex", alignItems:"center", gap:12, marginBottom:20 },
  logoBox: {
    width:44, height:44, borderRadius:12,
    overflow:"hidden",
    boxShadow:"0 3px 10px rgba(26,58,92,0.2)",
  },
  logoLabel: { fontSize:10, fontWeight:700, color:"#1a3a5c", letterSpacing:"1.5px", margin:0 },
  logoSub: { fontSize:13, color:"#64748b", margin:0 },
  stepRow: { display:"flex", alignItems:"center", gap:4, marginBottom:20 },
  stepNum: {
    width:26, height:26, borderRadius:"50%",
    background:"#e2e8f0", color:"#94a3b8",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:12, fontWeight:700, flexShrink:0, transition:"all 0.3s",
  },
  stepNumActive: { background:"#1a3a5c", color:"#fff" },
  stepLabel: { fontSize:12, fontWeight:600, transition:"color 0.3s" },
  stepLine: { width:40, height:2, transition:"background 0.3s", margin:"0 4px" },
  title: { fontFamily:"'Cormorant Garamond', serif", fontSize:30, fontWeight:700, color:"#1a1a2e", margin:"0 0 6px" },
  sub: { fontSize:13, color:"#64748b", margin:"0 0 24px", lineHeight:1.6 },
  body: { padding:"24px 32px 32px" },
  roleGrid: { display:"flex", gap:12, marginBottom:20 },
  roleCard: {
    flex:1, background:"#fafbff", border:"2px solid #e2e8f0",
    borderRadius:16, padding:"20px 12px",
    cursor:"pointer", display:"flex", flexDirection:"column",
    alignItems:"center", gap:6, transition:"all 0.2s",
    position:"relative",
  },
  roleCardActive: {
    border:"2px solid #1a3a5c", background:"#eff6ff",
    boxShadow:"0 4px 15px rgba(26,58,92,0.12)",
  },
  checkBadge: {
    position:"absolute", top:8, right:8,
    width:20, height:20, borderRadius:"50%",
    background:"#1a3a5c", color:"#fff",
    fontSize:10, fontWeight:700,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  roleIcon: { fontSize:28 },
  roleLabel: { fontSize:13, fontWeight:700, color:"#1a1a2e", margin:0 },
  roleDesc: { fontSize:11, color:"#94a3b8", margin:0, textAlign:"center" },
  selectWrap: { position:"relative", marginBottom:12 },
  selectIcon: { position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" },
  select: {
    width:"100%", padding:"13px 16px 13px 42px",
    background:"#fafbff", border:"2px solid #e2e8f0",
    borderRadius:12, fontSize:14, color:"#1a1a2e",
    appearance:"none", cursor:"pointer",
    outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  },
  selectedPill: {
    background:"#eff6ff", border:"1px solid #bfdbfe",
    borderRadius:10, padding:"10px 14px",
    display:"flex", alignItems:"center", gap:8,
    fontSize:13, color:"#1a3a5c", marginBottom:16,
  },
  error: {
    background:"#fef2f2", border:"1px solid #fecaca",
    borderRadius:10, padding:"10px 14px",
    color:"#dc2626", fontSize:13, marginBottom:16,
  },
  nextBtn: {
    width:"100%", padding:"14px",
    background:"#1a3a5c", border:"none",
    borderRadius:12, color:"#fff",
    fontSize:15, fontWeight:700, cursor:"pointer",
    boxShadow:"0 4px 15px rgba(26,58,92,0.2)",
    transition:"all 0.2s",
  },
  btnRow: { display:"flex", gap:10 },
  backBtn: {
    flex:1, padding:"14px",
    background:"#f1f5f9", border:"1px solid #e2e8f0",
    borderRadius:12, color:"#64748b",
    fontSize:14, fontWeight:600, cursor:"pointer",
  },
  submitBtn: {
    flex:2, padding:"14px",
    background:"#1a3a5c", border:"none",
    borderRadius:12, color:"#fff",
    fontSize:14, fontWeight:700, cursor:"pointer",
    boxShadow:"0 4px 15px rgba(26,58,92,0.2)",
  },
};
