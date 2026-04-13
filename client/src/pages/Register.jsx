import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

const RoleCard = ({ value, label, icon, description, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={() => onClick(value)}
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
      selected
        ? "border-[#1F4E79] bg-[#1F4E79]/5 shadow-[0_0_0_3px_rgba(31,78,121,0.1)]"
        : "border-[#dce8f0] bg-white hover:border-[#2E75B6]"
    }`}
  >
    <span className={`text-2xl transition-all duration-300 ${selected ? "grayscale-0" : "grayscale opacity-50"}`}>
      {icon}
    </span>
    <span className={`text-sm font-bold tracking-wide transition-colors duration-300 ${selected ? "text-[#1F4E79]" : "text-[#5a7a96]"}`}>
      {label}
    </span>
    <span className={`text-[11px] text-center leading-snug transition-colors duration-300 ${selected ? "text-[#2E75B6]" : "text-[#a0b4c4]"}`}>
      {description}
    </span>
  </motion.button>
);

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
  const [collegeName, setCollegeName] = useState("");
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") calcStrength(value);
  };

  const calcStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setStrength(score);
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register({ ...form, collegeName });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white border-2 rounded-xl px-4 py-3.5 text-[#1a2a3a] text-sm outline-none transition-all duration-300 placeholder-[#a0b4c4] shadow-sm ${
      focused === field ? "border-[#1F4E79]" : "border-[#dce8f0]"
    }`;

  const steps = [
    { icon: "🏫", title: "Join Your Institution", desc: "Register with your college email" },
    { icon: "🎓", title: "Pick Your Role", desc: "Teacher or Student dashboard" },
    { icon: "📚", title: "Access Everything", desc: "Materials, assignments, AI chat" },
    { icon: "🚀", title: "Start Learning", desc: "Connect and grow with SkillSeekho" },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-gradient-to-br from-[#1F4E79] via-[#1a4470] to-[#0f2d4a] overflow-hidden">

        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        <motion.div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-40 left-10 w-56 h-56 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice">
          <motion.circle cx="350" cy="380" r="220" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            animate={{ r: [220, 240, 220] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
          <motion.circle cx="350" cy="380" r="160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            animate={{ r: [160, 175, 160] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

          <g transform="translate(170, 140)">
            <motion.rect x="30" y="20" width="300" height="220" rx="18"
              fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
              animate={{ y: [20, 12, 20] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
            <rect x="55" y="55" width="250" height="28" rx="8" fill="rgba(255,255,255,0.15)" />
            <text x="75" y="74" fill="rgba(255,255,255,0.5)" fontSize="10">Full name</text>
            <rect x="55" y="95" width="250" height="28" rx="8" fill="rgba(255,255,255,0.15)" />
            <text x="75" y="114" fill="rgba(255,255,255,0.5)" fontSize="10">Email address</text>
            <rect x="55" y="135" width="250" height="28" rx="8" fill="rgba(255,255,255,0.15)" />
            <text x="75" y="154" fill="rgba(255,255,255,0.5)" fontSize="10">Password</text>
            <rect x="55" y="177" width="115" height="40" rx="10" fill="rgba(46,117,182,0.4)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
            <text x="112" y="202" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Student</text>
            <rect x="185" y="177" width="120" height="40" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text x="245" y="202" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">Teacher</text>
            <motion.rect x="55" y="232" width="250" height="36" rx="10" fill="rgba(255,255,255,0.9)"
              animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} />
            <text x="180" y="255" textAnchor="middle" fill="#1F4E79" fontSize="12" fontWeight="bold">Create Account</text>
          </g>

          <motion.g animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <rect x="460" y="200" width="150" height="44" rx="22" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text x="535" y="220" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Welcome!</text>
            <text x="535" y="236" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Account Ready</text>
          </motion.g>

          <motion.g animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
            <rect x="60" y="430" width="140" height="44" rx="22" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />
            <text x="130" y="450" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">Free to join</text>
            <text x="130" y="466" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">No credit card</text>
          </motion.g>
        </svg>

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          <motion.div className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">SkillSeekho</span>
          </motion.div>

          <div className="mt-auto mb-16">
            <motion.p className="text-blue-200 text-sm font-semibold tracking-widest uppercase mb-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Get Started Free
            </motion.p>
            <motion.h2 className="text-white text-5xl font-black leading-tight mb-3"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              Your Learning<br />
              <span className="text-blue-300">Journey Starts</span><br />
              Here.
            </motion.h2>
            <motion.p className="text-white/40 text-base leading-relaxed max-w-sm mb-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Join thousands of students and teachers already using SkillSeekho.
            </motion.p>

            <motion.div className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {steps.map((s, i) => (
                <motion.div key={s.title}
                  className="flex items-start gap-3 bg-white/[0.07] border border-white/[0.1] rounded-2xl px-4 py-3.5 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.12)", y: -2 }}>
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{s.title}</p>
                    <p className="text-white/40 text-[11px] mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:flex-none lg:w-[520px] flex items-center justify-center bg-[#f8fafc] px-8 py-10 relative overflow-y-auto">

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #1F4E79 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        <motion.div className="w-full max-w-sm relative z-10 py-4"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}>

          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#1F4E79] flex items-center justify-center">
              <span className="text-white font-black">C</span>
            </div>
            <span className="text-[#1F4E79] font-black text-xl">SkillSeekho</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-[#0f2d4a] text-3xl font-black tracking-tight mb-1">Create account</h1>
            <p className="text-[#5a7a96] text-sm">Fill in your details to join SkillSeekho for free</p>
          </motion.div>

          <motion.div className="h-px bg-gradient-to-r from-[#1F4E79] via-[#2E75B6] to-transparent my-6"
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }} />

          <form onSubmit={handleSubmit} className="space-y-4">

            <motion.div {...fadeLeft(0.3)}>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#5a7a96] mb-1.5">Full Name</label>
              <input name="name" placeholder="Rahul Verma" onChange={handleChange}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                required className={inputClass("name")} />
            </motion.div>

            <motion.div {...fadeLeft(0.36)}>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#5a7a96] mb-1.5">Email Address</label>
              <input name="email" type="email" placeholder="you@college.edu" onChange={handleChange}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                required className={inputClass("email")} />
              <p className="text-[11px] text-[#a0b4c4] mt-1">Use your institutional email to auto-join your college</p>
            </motion.div>

            <motion.div {...fadeLeft(0.42)}>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#5a7a96] mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                  onChange={handleChange} onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  required className={inputClass("password") + " pr-12"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a0b4c4] hover:text-[#1F4E79] transition-colors" tabIndex={-1}>
                  {showPassword ? (
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
              </div>
              <AnimatePresence>
                {form.password.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-1">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= i ? strengthColor[strength] : "bg-[#dce8f0]"}`} />
                      ))}
                    </div>
                    <p className={`text-[11px] font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-yellow-600" : "text-emerald-600"}`}>
                      {strengthLabel[strength]} password
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div {...fadeLeft(0.48)}>
              <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#5a7a96] mb-2">I am a…</label>
              <div className="flex gap-3">
                <RoleCard value="Student" label="Student" icon="🎓" description="Access courses & assignments"
                  selected={form.role === "Student"} onClick={(v) => setForm({ ...form, role: v })} />
                <RoleCard value="Teacher" label="Teacher" icon="🏫" description="Create & manage classes"
                  selected={form.role === "Teacher"} onClick={(v) => setForm({ ...form, role: v })} />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="relative w-full py-4 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ background: "linear-gradient(135deg, #1F4E79 0%, #2E75B6 60%, #3b8fd4 100%)" }}>
              <motion.div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-120%", "220%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </span>
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#dce8f0]" />
              <span className="text-xs text-[#a0b4c4] tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-[#dce8f0]" />
            </div>

            <motion.p className="text-center text-sm text-[#5a7a96]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
              Already have an account?{" "}
              <Link to="/" className="text-[#1F4E79] font-bold hover:text-[#2E75B6] transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </motion.p>
          </form>

          <motion.p className="text-center text-xs text-[#a0b4c4] mt-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            By registering, you agree to our Terms & Privacy Policy 🔒
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;