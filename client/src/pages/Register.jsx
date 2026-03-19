import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── animation helpers ────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: "easeOut" },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { delay, duration: 0.5, ease: "easeOut" },
});

// ── Role card ────────────────────────────────────────
const RoleCard = ({ value, label, icon, description, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={() => onClick(value)}
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border transition-all duration-300 cursor-pointer
      ${selected
        ? "border-violet-500/70 bg-violet-500/10 shadow-[0_0_0_3px_rgba(124,58,237,0.15)]"
        : "border-white/[0.09] bg-white/[0.03] hover:border-white/20"
      }`}
  >
    <span className={`text-2xl transition-all duration-300 ${selected ? "grayscale-0" : "grayscale opacity-50"}`}>
      {icon}
    </span>
    <span className={`text-sm font-bold tracking-wide transition-colors duration-300 ${selected ? "text-violet-300" : "text-white/50"}`}>
      {label}
    </span>
    <span className={`text-[11px] text-center leading-snug transition-colors duration-300 ${selected ? "text-white/40" : "text-white/20"}`}>
      {description}
    </span>
  </motion.button>
);

// ── Main component ───────────────────────────────────
const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [focused, setFocused]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [strength, setStrength]         = useState(0);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") calcStrength(value);
  };

  const calcStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    setStrength(score);
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-amber-400",
    "bg-yellow-300",
    "bg-emerald-400",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white/[0.05] border rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-300
    ${focused === field
      ? "border-violet-500/60 bg-violet-500/[0.07] shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
      : "border-white/[0.09] hover:border-white/20"
    }`;

  return (
    <div className="min-h-screen flex bg-[#07070f] overflow-hidden relative">

      {/* ── Animated background orbs ── */}
      <motion.div
        className="pointer-events-none absolute -top-52 -right-52 w-[680px] h-[680px] rounded-full bg-cyan-600/20 blur-[130px]"
        animate={{ scale: [1, 1.14, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-44 -left-44 w-[560px] h-[560px] rounded-full bg-violet-600/15 blur-[130px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 right-1/3 w-[280px] h-[280px] rounded-full bg-indigo-500/10 blur-[90px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* ── Dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ════════════ LEFT PANEL ════════════ */}
      <motion.div
        className="hidden lg:flex flex-1 flex-col justify-center px-20 relative z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Badge */}
        <motion.div
          className="flex items-center gap-3 w-fit mb-14 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm"
          {...fadeUp(0.2)}
        >
          <motion.span
            className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
            animate={{ boxShadow: ["0 0 6px #22d3ee", "0 0 22px #22d3ee", "0 0 6px #22d3ee"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/45">
            Join ClassVerse
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[62px] xl:text-7xl font-black text-white leading-[1.06] tracking-tight mb-5"
          {...fadeUp(0.3)}
        >
          Start your<br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            journey today.
          </span>
        </motion.h1>

        <motion.p
          className="text-white/35 text-[17px] leading-relaxed max-w-[360px] mb-16"
          {...fadeUp(0.45)}
        >
          Create your free account and unlock access to courses, assignments, and your personal dashboard.
        </motion.p>

        {/* Feature list */}
        <motion.div className="flex flex-col gap-4" {...fadeUp(0.55)}>
          {[
            { icon: "🎓", text: "Access hundreds of courses instantly" },
            { icon: "📊", text: "Track your progress in real-time"     },
            { icon: "🔒", text: "Secure & private — always"            },
          ].map(({ icon, text }, i) => (
            <motion.div
              key={text}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-base flex-shrink-0">
                {icon}
              </div>
              <span className="text-white/50 text-sm">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating testimonial card */}
        <motion.div
          className="absolute bottom-16 left-20 max-w-xs px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.09] backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
          whileHover={{ y: -3, scale: 1.02 }}
        >
          <p className="text-white/60 text-xs leading-relaxed italic mb-3">
            "ClassVerse completely changed how I study. The dashboard is incredible!"
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-black text-white">
              P
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold">Priya Sharma</p>
              <p className="text-white/30 text-[10px]">Student · 2nd Year</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400 text-xs">★</span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent my-10 relative z-10 flex-shrink-0" />

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex-1 lg:flex-none lg:w-[500px] flex items-center justify-center px-6 py-12 lg:px-14 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
        >
          {/* Glass card */}
          <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

            {/* Inner glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-cyan-600/10 blur-3xl" />

            {/* Header */}
            <motion.div {...fadeUp(0.25)}>
              <p className="text-cyan-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
                Create account
              </p>
              <h2 className="text-white text-[28px] font-black tracking-tight mb-1.5">
                Register
              </h2>
              <p className="text-white/30 text-sm leading-relaxed mb-8">
                Fill in your details to get started for free.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Name ── */}
              <motion.div {...fadeLeft(0.3)}>
                <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    name="name"
                    placeholder="Rahul Verma"
                    onChange={handleChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused("")}
                    required
                    className={inputClass("name")}
                  />
                </div>
              </motion.div>

              {/* ── Email ── */}
              <motion.div {...fadeLeft(0.38)}>
                <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    required
                    className={inputClass("email")}
                  />
                </div>
              </motion.div>

              {/* ── Password ── */}
              <motion.div {...fadeLeft(0.46)}>
                <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                    className={`${inputClass("password")} pr-12`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileTap={{ scale: 0.85 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </motion.button>
                </div>

                {/* Password strength bar */}
                <AnimatePresence>
                  {form.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2.5 space-y-1.5"
                    >
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-400 ${
                              strength >= i ? strengthColor[strength] : "bg-white/10"
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                      <p className={`text-[11px] font-medium transition-all duration-300 ${
                        strength <= 1 ? "text-red-400" :
                        strength === 2 ? "text-amber-400" :
                        strength === 3 ? "text-yellow-300" : "text-emerald-400"
                      }`}>
                        {strengthLabel[strength]} password
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Role selector ── */}
              <motion.div {...fadeLeft(0.54)}>
                <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-3">
                  I am a…
                </label>
                <div className="flex gap-3">
                  <RoleCard
                    value="Student"
                    label="Student"
                    icon="🎓"
                    description="Access courses & assignments"
                    selected={form.role === "Student"}
                    onClick={(v) => setForm({ ...form, role: v })}
                  />
                  <RoleCard
                    value="Teacher"
                    label="Teacher"
                    icon="🏫"
                    description="Create & manage classes"
                    selected={form.role === "Teacher"}
                    onClick={(v) => setForm({ ...form, role: v })}
                  />
                </div>
              </motion.div>

              {/* ── Error toast ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ── */}
              <motion.div {...fadeUp(0.6)}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.025, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="relative w-full py-4 mt-1 rounded-xl font-bold text-sm tracking-wide text-white overflow-hidden
                    bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600
                    shadow-[0_4px_24px_rgba(6,182,212,0.38)]
                    hover:shadow-[0_8px_36px_rgba(6,182,212,0.52)]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-shadow duration-300"
                >
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "220%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-[11px] text-white/20 tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {/* Login link */}
              <motion.p className="text-center text-sm text-white/30" {...fadeUp(0.75)}>
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-cyan-400 font-semibold hover:text-cyan-300 underline underline-offset-2 decoration-cyan-500/30 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </motion.p>
            </form>
          </div>

          {/* Footer */}
          <motion.p className="text-center text-xs text-white/15 mt-5" {...fadeUp(0.9)}>
            By registering, you agree to our Terms & Privacy Policy 🔒
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;