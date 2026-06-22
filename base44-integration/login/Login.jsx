import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, Globe } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { ROLE_HOME } from "@/lib/useRole";
import useT from "@/lib/useT";
import { useAppSettings } from "@/lib/AppSettingsContext";

/* ─── Animated canvas background ─── */
function CircuitCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.pulse += 0.025;
        const pulse = (Math.sin(node.pulse) + 1) / 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(96,165,250,${0.08 + pulse * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${0.4 + pulse * 0.4})`;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186,230,253,${p.alpha * 0.5})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${(1 - dist / 90) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}

/* ─── Main Login Page ─── */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const T = useT();
  const { lang, toggleLang } = useAppSettings();
  const isAr = lang === "ar";

  const getNextUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/";
  };

  const handleEmailBlur = async () => {
    setEmailFocused(false);
    if (!email) return;
    const normalised = email.toLowerCase().trim();
    try {
      const invites = await base44.entities.PendingInvite.filter({ email: normalised, used: false });
      setPendingInvite(invites && invites.length > 0 ? invites[0] : null);
    } catch {
      setPendingInvite(null);
    }
  };

  const handleLoginSuccess = async () => {
    if (pendingInvite) {
      try {
        await base44.entities.PendingInvite.update(pendingInvite.id, { used: true });
        await base44.auth.updateMe({ role: pendingInvite.nossco_role });
        window.location.href = ROLE_HOME[pendingInvite.nossco_role] || "/";
        return;
      } catch {}
    }
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.role === "user") {
        window.location.href = "/waiting-activation";
        return;
      }
    } catch {}
    window.location.href = getNextUrl();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
    } catch (err) {
      setError(err.message || T("Invalid email or password"));
      setLoading(false);
      return;
    }
    try {
      await handleLoginSuccess();
    } catch {
      window.location.href = getNextUrl();
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", window.location.href);
  };

  const inputStyle = (focused) => ({
    background: focused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)"}`,
    boxShadow: focused ? "0 0 0 3px rgba(96,165,250,0.1)" : "none",
    color: "white",
    outline: "none",
    transition: "all 0.2s",
    direction: "ltr", // inputs always LTR for email/password
  });

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen flex overflow-hidden"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#050d1a" }}
    >
      {/* ── LEFT PANEL (shown first on LTR, second on RTL via flex-row-reverse) ── */}
      <div
        className={`hidden lg:flex flex-col w-[52%] relative overflow-hidden ${isAr ? "order-2" : "order-1"}`}
        style={{ background: "linear-gradient(135deg, #050d1a 0%, #0a1628 35%, #0d2040 65%, #071220 100%)" }}
      >
        {/* Radial glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #1e40af 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        <CircuitCanvas />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <img src="https://nosscogroup.com/assets/nossco_logo.png" alt="NOSSCO"
              className="h-10 w-auto drop-shadow-lg"
              onError={e => { e.target.style.display = "none"; }} />
            <div>
              <p className="text-white font-bold text-xl tracking-widest uppercase">NOSSCO</p>
              <p className="text-xs tracking-widest uppercase" style={{ color: "#60a5fa", letterSpacing: "0.18em" }}>
                {T("Operations Portal")}
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-7 py-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" style={{ boxShadow: "0 0 8px #60a5fa", animation: "pulse 2s infinite" }} />
              {T("Saudi National Outsourcing Company — Jeddah")}
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
              {T("login_headline_1")}{" "}
              <span style={{ color: "#60a5fa" }}>{T("login_headline_2")}</span>
              <br />{T("login_headline_3")}
            </h1>

            {/* Subtext */}
            <p className="text-base leading-relaxed max-w-md" style={{ color: "#7ba3cc" }}>
              {T("login_partner_desc")}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-1">
              {[
                { value: "99.98%", label: T("Platform uptime") },
                { value: "128+",   label: T("Tickets resolved today") },
                { value: "4h",     label: T("Avg. response time") },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs" style={{ color: "#4a7fa8" }}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Mini stats card */}
            <div className="self-start mt-1 px-5 py-4 rounded-2xl flex items-center gap-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(96,165,250,0.15)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #4ade80" }} />
                <span className="text-sm font-semibold text-white">{T("128+ Tickets resolved")}</span>
              </div>
              <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.12)" }} />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" style={{ boxShadow: "0 0 8px #60a5fa" }} />
                <span className="text-sm font-semibold text-white">{T("4h response")}</span>
              </div>
            </div>
          </div>

          {/* Vision 2030 footer */}
          <div className="flex items-center gap-4 mt-auto pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <img src="https://nosscogroup.com/assets/saudi-vision.png" alt="Vision 2030"
              className="h-10 w-auto opacity-60"
              onError={e => { e.target.style.display = "none"; }} />
            <p className="text-xs" style={{ color: "#2d5a7a" }}>{T("Aligned with Vision 2030")}</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className={`flex flex-1 items-center justify-center p-6 lg:p-10 relative ${isAr ? "order-1" : "order-2"}`}
        style={{ background: "linear-gradient(160deg, #07111f 0%, #0a1628 50%, #060f1c 100%)" }}
      >
        {/* Language toggle — ENG / AR */}
        <div
          className="absolute top-5 flex items-center gap-0.5 p-1 rounded-full"
          style={{
            [isAr ? "left" : "right"]: "1.25rem",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Globe className="w-3.5 h-3.5 mx-1.5 flex-shrink-0" style={{ color: "#93c5fd" }} />
          <button
            type="button"
            onClick={() => lang !== "en" && toggleLang()}
            className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !isAr ? "rgba(96,165,250,0.25)" : "transparent",
              color: !isAr ? "#ffffff" : "#64748b",
            }}
          >
            ENG
          </button>
          <button
            type="button"
            onClick={() => lang !== "ar" && toggleLang()}
            className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              background: isAr ? "rgba(96,165,250,0.25)" : "transparent",
              color: isAr ? "#ffffff" : "#64748b",
            }}
          >
            AR
          </button>
        </div>

        {/* Glassmorphic card */}
        <div
          className="w-full max-w-[420px] rounded-3xl p-8 xl:p-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(96,165,250,0.06) inset",
          }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <img src="https://nosscogroup.com/assets/nossco_logo.png" alt="NOSSCO"
              className="h-8 w-auto"
              onError={e => { e.target.style.display = "none"; }} />
            <span className="text-white font-bold text-base tracking-widest uppercase">NOSSCO</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white">{T("Welcome back")}</h2>
            <p className="mt-1.5 text-sm" style={{ color: "#4a7fa8" }}>
              {T("Sign in to your NOSSCO portal account")}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] mb-6"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          >
            <GoogleIcon className="w-4 h-4" />
            {T("Continue with Google")}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "#2d5a7a" }}>{T("or sign in with email")}</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm flex items-start gap-2"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              <span className="mt-0.5">⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: "#3d6a8a" }}>
                {T("Email address")}
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#2d5a7a", [isAr ? "right" : "left"]: "0.875rem" }}
                />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={handleEmailBlur}
                  required
                  className={`w-full h-12 rounded-xl text-sm ${isAr ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                  style={inputStyle(emailFocused)}
                />
              </div>
              {pendingInvite && (
                <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: "#34d399" }}>
                  <span>✓</span> {T("login_invite_found")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-widest" style={{ color: "#3d6a8a" }}>
                  {T("Password")}
                </label>
                <Link to="/forgot-password" className="text-xs hover:underline transition-colors" style={{ color: "#60a5fa" }}>
                  {T("Forgot password?")}
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#2d5a7a", [isAr ? "right" : "left"]: "0.875rem" }}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  required
                  className={`w-full h-12 rounded-xl text-sm ${isAr ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                  style={inputStyle(passFocused)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)",
                color: "white",
                boxShadow: "0 4px 24px rgba(37,99,235,0.4), 0 0 0 1px rgba(96,165,250,0.2) inset",
              }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {T("Signing in...")}</>
              ) : (
                <><span>{T("Sign In")}</span><ArrowIcon className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm mt-6" style={{ color: "#2d5a7a" }}>
            {T("Don't have an account?")}{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: "#60a5fa" }}>
              {T("Request access")}
            </Link>
          </p>

          {/* Copyright */}
          <p className="text-center text-xs mt-6 pt-5" style={{ color: "#1a3a52", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {T("login_copyright")}
          </p>
        </div>
      </div>
    </div>
  );
}