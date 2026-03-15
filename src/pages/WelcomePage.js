import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [progress, setProgress] = useState(0);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ["#2563eb","#059669","#d97706","#db2777","#7c3aed","#0891b2"][Math.floor(Math.random()*6)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 2.5,
      duration: Math.random() * 2 + 2.5,
      rotate: Math.random() * 360,
    }));
    setConfetti(pieces);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); navigate("/checkin"); return 100; }
        return p + 1.4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={s.page}>
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} style={{
          position:"fixed", top:0, left: c.x + "%",
          width: c.size, height: c.size,
          background: c.color,
          borderRadius: c.id % 3 === 0 ? "50%" : c.id % 3 === 1 ? "2px" : "0",
          animation: `fall ${c.duration}s linear ${c.delay}s forwards`,
          zIndex: 50, transform: `rotate(${c.rotate}deg)`,
        }} />
      ))}

      <div style={s.card}>
        {/* Top accent */}
        <div style={s.topAccent} />

        {/* Success icon */}
        <div style={s.successWrap}>
          <div style={s.outerRing} />
          <div style={s.innerRing} />
          <div style={s.successCircle}>
            <span style={s.checkmark}>✓</span>
          </div>
        </div>

        <h1 style={s.title}>Welcome to NEU Library!</h1>
        <p style={s.sub}>Your visit has been successfully recorded. Enjoy your time and happy learning!</p>

        {/* User pill */}
        <div style={s.userPill}>
          <div style={s.pillAvatar}>{currentUser?.displayName?.charAt(0)}</div>
          <span style={s.pillName}>{currentUser?.displayName}</span>
          <span style={s.pillBadge}>✅ Checked In</span>
        </div>

        {/* Time stamp */}
        <div style={s.timeStamp}>
          <span style={s.timeIcon}>🕐</span>
          <span style={s.timeText}>{new Date().toLocaleString("en-US", { weekday:"long", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" })}</span>
        </div>

        {/* Progress */}
        <div style={s.progressWrap}>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: progress + "%" }} />
          </div>
          <p style={s.progressLabel}>Redirecting back to check-in...</p>
        </div>

        <button style={s.backBtn} onClick={() => navigate("/checkin")}>
          ← Return to Check-in Now
        </button>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(540deg); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ringOut {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight:"100vh", background:"#f8f5f0",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'Plus Jakarta Sans', sans-serif", padding:24,
    position:"relative", overflow:"hidden",
  },
  card: {
    background:"#fff", borderRadius:24,
    padding:"0 0 36px",
    maxWidth:460, width:"100%", textAlign:"center",
    boxShadow:"0 20px 60px rgba(26,58,92,0.12)",
    border:"1px solid #e2e8f0",
    animation:"fadeUp 0.6s ease forwards",
    overflow:"hidden", position:"relative",
  },
  topAccent: {
    height:6, width:"100%",
    background:"linear-gradient(90deg, #1a3a5c, #2563eb, #059669)",
  },
  successWrap: {
    position:"relative", width:100, height:100,
    margin:"32px auto 24px",
  },
  outerRing: {
    position:"absolute", inset:-8, borderRadius:"50%",
    border:"2px solid #bbf7d0",
    animation:"ringOut 2.5s ease infinite",
    top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    width:80, height:80,
  },
  innerRing: {
    position:"absolute", inset:0, borderRadius:"50%",
    border:"3px solid #86efac",
    top:"50%", left:"50%", transform:"translate(-50%,-50%)",
    width:90, height:90,
    animation:"ringOut 2.5s ease infinite 0.5s",
  },
  successCircle: {
    width:80, height:80, borderRadius:"50%",
    background:"linear-gradient(135deg, #059669, #10b981)",
    display:"flex", alignItems:"center", justifyContent:"center",
    margin:"10px auto 0",
    boxShadow:"0 8px 24px rgba(5,150,105,0.3)",
    animation:"popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
  },
  checkmark: { fontSize:36, color:"#fff", fontWeight:700 },
  title: {
    fontFamily:"'Cormorant Garamond', serif",
    fontSize:32, fontWeight:700, color:"#1a1a2e",
    margin:"0 0 10px", padding:"0 32px",
  },
  sub: { fontSize:14, color:"#64748b", lineHeight:1.7, margin:"0 0 24px", padding:"0 32px" },
  userPill: {
    display:"inline-flex", alignItems:"center", gap:10,
    background:"#eff6ff", border:"1px solid #bfdbfe",
    borderRadius:12, padding:"10px 16px",
    marginBottom:12,
  },
  pillAvatar: {
    width:30, height:30, borderRadius:"50%",
    background:"linear-gradient(135deg, #1a3a5c, #2563eb)",
    color:"#fff", fontWeight:700, fontSize:14,
    display:"flex", alignItems:"center", justifyContent:"center",
    flexShrink:0,
  },
  pillName: { fontSize:14, fontWeight:600, color:"#1a3a5c" },
  pillBadge: {
    background:"#dcfce7", color:"#15803d",
    borderRadius:99, padding:"2px 10px",
    fontSize:11, fontWeight:700,
    border:"1px solid #bbf7d0",
  },
  timeStamp: {
    display:"inline-flex", alignItems:"center", gap:8,
    background:"#f8fafc", border:"1px solid #e2e8f0",
    borderRadius:10, padding:"8px 14px",
    fontSize:12, color:"#64748b", marginBottom:28,
  },
  timeIcon: { fontSize:14 },
  timeText: { fontWeight:500 },
  progressWrap: { padding:"0 32px", marginBottom:20 },
  progressTrack: {
    height:6, background:"#e2e8f0",
    borderRadius:99, overflow:"hidden", marginBottom:8,
  },
  progressBar: {
    height:"100%", borderRadius:99,
    background:"linear-gradient(90deg, #1a3a5c, #2563eb)",
    transition:"width 0.08s linear",
  },
  progressLabel: { fontSize:12, color:"#94a3b8", margin:0 },
  backBtn: {
    background:"none", border:"none",
    color:"#2563eb", fontSize:14, fontWeight:600,
    cursor:"pointer", textDecoration:"underline",
  },
};
