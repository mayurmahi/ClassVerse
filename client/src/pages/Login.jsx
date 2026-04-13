import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Typewriter hook
const useTypewriter = (words, speed = 120, pause = 2000) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < word.length) {
          setText(word.slice(0, text.length + 1));
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setDeleting(false);
          setWordIndex((i) => i + 1);
        }
      }
    }, deleting ? 60 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, speed, pause]);

  return text;
};

// Floating orb
const Orb = ({ cx, cy, r, color, delay = 0 }) => (
  <motion.circle
    cx={cx} cy={cy} r={r} fill={color}
    animate={{ cy: [cy, cy - 18, cy], r: [r, r * 1.08, r] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const typed = useTypewriter(["Learning.", "Growing.", "Teaching.", "Achieving.", "Connecting."]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      const user = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
      if (user.role === "SuperAdmin") navigate("/superadmin");
      else if (user.role === "Admin") navigate("/admin");
      else if (user.role === "Teacher") navigate("/teacher");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (field) =>
    `w-full border-b-2 bg-transparent pt-5 pb-2 px-0 text-[#1a2a3a] text-sm outline-none transition-all duration-300 placeholder-transparent peer ${
      focused === field ? "border-[#1F4E79]" : "border-[#c8d8e8]"
    }`;

  const features = [
    { icon: "📚", title: "Smart Classrooms", desc: "Organize, share, and manage learning resources" },
    { icon: "🤖", title: "AI Summarization", desc: "Instant summaries of any uploaded material" },
    { icon: "💬", title: "Live Chat", desc: "Real-time communication inside every classroom" },
    { icon: "📝", title: "Assignments", desc: "Create, submit, and evaluate with deadlines" },
  ];

  return (
    <div className="min-h-screen flex font-sans overflow-hidden" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── LEFT — Illustrated Panel ─────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-[#1F4E79] via-[#1a4470] to-[#0f2d4a] overflow-hidden">

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* SVG illustration */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="g1" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#2E75B6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1F4E79" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="g2" cx="70%" cy="70%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1F4E79" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="700" height="800" fill="url(#g1)" />
          <rect width="700" height="800" fill="url(#g2)" />

          {/* Floating orbs */}
          <Orb cx={120} cy={180} r={80} color="rgba(96,165,250,0.12)" delay={0} />
          <Orb cx={560} cy={320} r={100} color="rgba(255,255,255,0.06)" delay={1.5} />
          <Orb cx={300} cy={600} r={140} color="rgba(46,117,182,0.15)" delay={0.8} />
          <Orb cx={600} cy={680} r={60} color="rgba(96,165,250,0.1)" delay={2} />

          {/* Decorative rings */}
          <motion.circle cx="350" cy="400" r="200" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            animate={{ r: [200, 220, 200] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
          <motion.circle cx="350" cy="400" r="150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ r: [150, 165, 150] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

          {/* Central illustration — classroom */}
          <g transform="translate(175, 180)">
            {/* Screen / board */}
            <motion.rect x="50" y="30" width="250" height="160" rx="12"
              fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
              animate={{ y: [30, 24, 30] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
            {/* Screen content lines */}
            <motion.rect x="70" y="55" width="140" height="6" rx="3" fill="rgba(255,255,255,0.5)"
              animate={{ width: [140, 120, 140] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <rect x="70" y="70" width="100" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="70" y="82" width="120" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="70" y="94" width="80" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
            {/* AI badge */}
            <motion.rect x="230" y="55" width="52" height="22" rx="11"
              fill="rgba(96,165,250,0.4)" stroke="rgba(96,165,250,0.6)" strokeWidth="1"
              animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <text x="256" y="70" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">AI ✦</text>

            {/* Students */}
            {[0, 1, 2, 3].map((i) => (
              <motion.g key={i} transform={`translate(${40 + i * 60}, 230)`}
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}>
                <circle cx="20" cy="0" r="16" fill={["rgba(255,255,255,0.15)", "rgba(96,165,250,0.2)", "rgba(255,255,255,0.12)", "rgba(46,117,182,0.25)"][i]} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="20" cy="-5" r="6" fill="rgba(255,255,255,0.4)" />
                <path d="M8 10 Q20 18 32 10" fill="rgba(255,255,255,0.25)" />
              </motion.g>
            ))}

            {/* Floating chat bubbles */}
            <motion.g animate={{ y: [0, -8, 0], opacity: [0.8, 1, 0.8] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <rect x="260" y="230" width="80" height="28" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <text x="300" y="248" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="9">Good morning!</text>
            </motion.g>

            <motion.g animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              <rect x="-40" y="200" width="70" height="24" rx="12" fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />
              <text x="-5" y="215" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="8">Any questions?</text>
            </motion.g>
          </g>

          {/* Stats chips */}
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <rect x="50" y="640" width="130" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="115" y="657" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Students</text>
            <text x="115" y="675" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">12,400+</text>
          </motion.g>
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
            <rect x="210" y="640" width="130" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="275" y="657" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Classrooms</text>
            <text x="275" y="675" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">3,200+</text>
          </motion.g>
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}>
            <rect x="370" y="640" width="130" height="44" rx="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="435" y="657" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Satisfaction</text>
            <text x="435" y="675" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">98%</text>
          </motion.g>
        </svg>

        {/* Text content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Logo */}
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">SkillSeekho</span>
          </motion.div>

          {/* Headline */}
          <div className="mt-auto mb-20">
            <motion.p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              The Future of Learning
            </motion.p>
            <motion.h2 className="text-white text-5xl font-black leading-tight mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              Where Every<br />Classroom
            </motion.h2>
            <motion.div className="text-5xl font-black leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <span className="text-blue-300">{typed}</span>
              <motion.span className="inline-block w-0.5 h-10 bg-blue-300 ml-1 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
            </motion.div>

            {/* Features */}
            <motion.div className="grid grid-cols-2 gap-3 mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              {features.map((f, i) => (
                <motion.div key={f.title}
                  className="flex items-start gap-3 bg-white/[0.07] border border-white/[0.1] rounded-2xl px-4 py-3.5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.12)", y: -2 }}>
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{f.title}</p>
                    <p className="text-white/40 text-[11px] mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Login Form ────────────────────────────────── */}
      <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center bg-[#f8fafc] px-8 py-12 relative">

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #1F4E79 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        <motion.div className="w-full max-w-sm relative z-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#1F4E79] flex items-center justify-center">
              <span className="text-white font-black">S</span>
            </div>
            <span className="text-[#1F4E79] font-black text-xl">SkillSeekho</span>
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-[#0f2d4a] text-3xl font-black tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-[#5a7a96] text-sm">
              Sign in to access your SkillSeekho dashboard
            </p>
          </motion.div>

          {/* Divider line */}
          <motion.div className="h-px bg-gradient-to-r from-[#1F4E79] via-[#2E75B6] to-transparent my-8"
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }} />

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email field */}
            <motion.div className="relative" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                required
                className="w-full bg-white border-2 rounded-xl px-4 py-3.5 text-[#1a2a3a] text-sm outline-none transition-all duration-300 placeholder-[#a0b4c4] shadow-sm"
                style={{ borderColor: focused === "email" ? "#1F4E79" : "#dce8f0" }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#1F4E79] rounded-full"
                animate={{ width: focused === "email" ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Password field */}
            <motion.div className="relative" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="Password"
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required
                className="w-full bg-white border-2 rounded-xl px-4 py-3.5 pr-12 text-[#1a2a3a] text-sm outline-none transition-all duration-300 placeholder-[#a0b4c4] shadow-sm"
                style={{ borderColor: focused === "password" ? "#1F4E79" : "#dce8f0" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0b4c4] hover:text-[#1F4E79] transition-colors"
                tabIndex={-1}
              >
                {showPw ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-[#1F4E79] rounded-full"
                animate={{ width: focused === "password" ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative w-full py-4 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1F4E79 0%, #2E75B6 60%, #3b8fd4 100%)" }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-120%", "220%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#dce8f0]" />
              <span className="text-xs text-[#a0b4c4] tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-[#dce8f0]" />
            </div>

            {/* Register link */}
            <motion.p className="text-center text-sm text-[#5a7a96]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              New to SkillSeekho?{" "}
              <Link to="/register"
                className="text-[#1F4E79] font-bold hover:text-[#2E75B6] transition-colors underline underline-offset-2">
                Create account
              </Link>
            </motion.p>
          </form>

          {/* Footer */}
          <motion.p className="text-center text-xs text-[#a0b4c4] mt-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            © 2025 SkillSeekho · Secure E-Learning Platform
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;