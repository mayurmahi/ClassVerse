// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate, Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// // ── Reusable animation variants ─────────────────────
// const fadeUp = (delay = 0) => ({
//   initial: { opacity: 0, y: 24 },
//   animate: { opacity: 1, y: 0 },
//   transition: { delay, duration: 0.55, ease: "easeOut" },
// });

// const fadeLeft = (delay = 0) => ({
//   initial: { opacity: 0, x: -24 },
//   animate: { opacity: 1, x: 0 },
//   transition: { delay, duration: 0.55, ease: "easeOut" },
// });

// // ── InputField component ─────────────────────────────
// const InputField = ({ label, name, type = "text", placeholder, onChange, onFocus, onBlur, focused, rightSlot }) => (
//   <motion.div {...fadeLeft(name === "email" ? 0.35 : 0.45)}>
//     <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
//       {label}
//     </label>
//     <div className="relative group">
//       <input
//         name={name}
//         type={type}
//         placeholder={placeholder}
//         onChange={onChange}
//         onFocus={onFocus}
//         onBlur={onBlur}
//         required
//         className={`
//           w-full bg-white/[0.05] border rounded-xl pl-11 py-3.5 text-white text-sm
//           placeholder-white/20 outline-none transition-all duration-300
//           ${rightSlot ? "pr-12" : "pr-4"}
//           ${focused
//             ? "border-violet-500/60 bg-violet-500/[0.07] shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
//             : "border-white/[0.09] hover:border-white/20"
//           }
//         `}
//       />
//       {/* Left icon slot — provided via children of wrapper */}
//       {rightSlot}
//     </div>
//   </motion.div>
// );

// // ── Main component ───────────────────────────────────
// const Login = () => {
//   const [form, setForm]                 = useState({ email: "", password: "" });
//   const [focused, setFocused]           = useState("");
//   const [loading, setLoading]           = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError]               = useState("");

//   const { login } = useAuth();
//   const navigate  = useNavigate();

//   const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       await login(form);
//       const token = localStorage.getItem("token");
//       const role  = JSON.parse(atob(token.split(".")[1])).role;
//       if (role === "Admin")        navigate("/admin");
//       else if (role === "Teacher") navigate("/teacher");
//       else                         navigate("/student");
//     } catch {
//       setError("Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex bg-[#07070f] overflow-hidden relative">

//       {/* ── Animated background orbs ── */}
//       <motion.div
//         className="pointer-events-none absolute -top-52 -left-52 w-[680px] h-[680px] rounded-full bg-violet-600/20 blur-[130px]"
//         animate={{ scale: [1, 1.14, 1], opacity: [0.18, 0.28, 0.18] }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="pointer-events-none absolute -bottom-44 -right-44 w-[560px] h-[560px] rounded-full bg-cyan-500/15 blur-[130px]"
//         animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
//         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />
//       <motion.div
//         className="pointer-events-none absolute top-1/2 left-1/3 w-[320px] h-[320px] rounded-full bg-indigo-600/10 blur-[100px]"
//         animate={{ scale: [1, 1.18, 1] }}
//         transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//       />

//       {/* ── Subtle dot-grid ── */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.04]"
//         style={{
//           backgroundImage:
//             "radial-gradient(circle, white 1px, transparent 1px)",
//           backgroundSize: "40px 40px",
//         }}
//       />

//       {/* ════════════ LEFT PANEL ════════════ */}
//       <motion.div
//         className="hidden lg:flex flex-1 flex-col justify-center px-20 relative z-10"
//         initial={{ opacity: 0, x: -40 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//       >
//         {/* Live badge */}
//         <motion.div
//           className="flex items-center gap-3 w-fit mb-14 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm"
//           {...fadeUp(0.2)}
//         >
//           <motion.span
//             className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_#7c3aed]"
//             animate={{ boxShadow: ["0 0 6px #7c3aed", "0 0 22px #7c3aed", "0 0 6px #7c3aed"] }}
//             transition={{ duration: 2, repeat: Infinity }}
//           />
//           <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/45">
//             EduPortal Platform
//           </span>
//         </motion.div>

//         {/* Headline */}
//         <motion.h1
//           className="text-[64px] xl:text-7xl font-black text-white leading-[1.06] tracking-tight mb-5"
//           {...fadeUp(0.3)}
//         >
//           Learn<br />
//           <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
//             without limits.
//           </span>
//         </motion.h1>

//         <motion.p
//           className="text-white/35 text-[17px] leading-relaxed max-w-[360px] mb-16"
//           {...fadeUp(0.45)}
//         >
//           A unified platform for students, teachers & admins — all in one powerful dashboard.
//         </motion.p>

//         {/* Stats */}
//         <motion.div className="flex gap-14" {...fadeUp(0.55)}>
//           {[
//             { num: "12K+", label: "Students"     },
//             { num: "340+", label: "Teachers"     },
//             { num: "98%",  label: "Satisfaction" },
//           ].map(({ num, label }, i) => (
//             <motion.div
//               key={label}
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
//             >
//               <p className="text-3xl font-black text-white">{num}</p>
//               <p className="text-xs text-white/30 mt-1 tracking-widest uppercase">{label}</p>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Floating activity card */}
//         <motion.div
//           className="absolute bottom-16 left-20 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.09] backdrop-blur-md"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.9, duration: 0.6 }}
//           whileHover={{ y: -3, scale: 1.02 }}
//         >
//           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
//             A
//           </div>
//           <div>
//             <p className="text-white text-sm font-semibold">Arjun just submitted</p>
//             <p className="text-white/35 text-xs mt-0.5">Physics Assignment · 2m ago</p>
//           </div>
//           <motion.span
//             className="w-2 h-2 rounded-full bg-emerald-400 ml-1 flex-shrink-0"
//             animate={{ opacity: [1, 0.3, 1] }}
//             transition={{ duration: 1.6, repeat: Infinity }}
//           />
//         </motion.div>
//       </motion.div>

//       {/* Vertical divider */}
//       <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent my-10 relative z-10 flex-shrink-0" />

//       {/* ════════════ RIGHT PANEL ════════════ */}
//       <div className="flex-1 lg:flex-none lg:w-[500px] flex items-center justify-center px-6 py-12 lg:px-14 relative z-10">
//         <motion.div
//           className="w-full max-w-md"
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
//         >
//           {/* Glass card */}
//           <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

//             {/* Inner glow top-left */}
//             <div className="pointer-events-none absolute -top-20 -left-20 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl" />

//             {/* Header */}
//             <motion.div {...fadeUp(0.25)}>
//               <p className="text-violet-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
//                 Welcome back
//               </p>
//               <h2 className="text-white text-[28px] font-black tracking-tight mb-1.5">
//                 Sign in
//               </h2>
//               <p className="text-white/30 text-sm leading-relaxed mb-8">
//                 Enter your credentials to access your dashboard.
//               </p>
//             </motion.div>

//             <form onSubmit={handleSubmit} className="space-y-5">

//               {/* ── Email ── */}
//               <motion.div {...fadeLeft(0.35)}>
//                 <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
//                   Email address
//                 </label>
//                 <div className="relative">
//                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
//                     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                       <polyline points="22,6 12,13 2,6"/>
//                     </svg>
//                   </span>
//                   <input
//                     name="email"
//                     type="email"
//                     placeholder="you@example.com"
//                     onChange={handleChange}
//                     onFocus={() => setFocused("email")}
//                     onBlur={() => setFocused("")}
//                     required
//                     className={`w-full bg-white/[0.05] border rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-300
//                       ${focused === "email"
//                         ? "border-violet-500/60 bg-violet-500/[0.07] shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
//                         : "border-white/[0.09] hover:border-white/20"}`}
//                   />
//                 </div>
//               </motion.div>

//               {/* ── Password ── */}
//               <motion.div {...fadeLeft(0.45)}>
//                 <label className="block text-[11px] font-semibold tracking-[0.16em] uppercase text-white/35 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
//                     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                       <rect x="3" y="11" width="18" height="11" rx="2"/>
//                       <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
//                     </svg>
//                   </span>
//                   <input
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="••••••••"
//                     onChange={handleChange}
//                     onFocus={() => setFocused("password")}
//                     onBlur={() => setFocused("")}
//                     required
//                     className={`w-full bg-white/[0.05] border rounded-xl pl-11 pr-12 py-3.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-300
//                       ${focused === "password"
//                         ? "border-violet-500/60 bg-violet-500/[0.07] shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
//                         : "border-white/[0.09] hover:border-white/20"}`}
//                   />
//                   <motion.button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     whileTap={{ scale: 0.85 }}
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors duration-200"
//                     tabIndex={-1}
//                   >
//                     {showPassword ? (
//                       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
//                         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
//                         <line x1="1" y1="1" x2="23" y2="23"/>
//                       </svg>
//                     ) : (
//                       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//                         <circle cx="12" cy="12" r="3"/>
//                       </svg>
//                     )}
//                   </motion.button>
//                 </div>
//                 <div className="flex justify-end mt-2">
//                   <a href="#" className="text-xs text-white/25 hover:text-violet-400 transition-colors duration-200">
//                     Forgot password?
//                   </a>
//                 </div>
//               </motion.div>

//               {/* ── Error toast ── */}
//               <AnimatePresence>
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -8, height: 0 }}
//                     animate={{ opacity: 1, y: 0, height: "auto" }}
//                     exit={{ opacity: 0, y: -8, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
//                   >
//                     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
//                       <circle cx="12" cy="12" r="10"/>
//                       <line x1="12" y1="8" x2="12" y2="12"/>
//                       <line x1="12" y1="16" x2="12.01" y2="16"/>
//                     </svg>
//                     {error}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* ── Submit button ── */}
//               <motion.div {...fadeUp(0.55)}>
//                 <motion.button
//                   type="submit"
//                   disabled={loading}
//                   whileHover={!loading ? { scale: 1.025, y: -2 } : {}}
//                   whileTap={!loading ? { scale: 0.97 } : {}}
//                   className="relative w-full py-4 mt-1 rounded-xl font-bold text-sm tracking-wide text-white overflow-hidden
//                     bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600
//                     shadow-[0_4px_24px_rgba(124,58,237,0.45)]
//                     hover:shadow-[0_8px_36px_rgba(124,58,237,0.55)]
//                     disabled:opacity-60 disabled:cursor-not-allowed
//                     transition-shadow duration-300"
//                 >
//                   {/* Shimmer sweep */}
//                   <motion.div
//                     className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
//                     animate={{ x: ["-100%", "220%"] }}
//                     transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
//                   />
//                   <span className="relative flex items-center justify-center gap-2">
//                     {loading ? (
//                       <>
//                         <motion.div
//                           className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
//                           animate={{ rotate: 360 }}
//                           transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
//                         />
//                         Signing in…
//                       </>
//                     ) : (
//                       <>
//                         Sign In
//                         <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                           <line x1="5" y1="12" x2="19" y2="12"/>
//                           <polyline points="12 5 19 12 12 19"/>
//                         </svg>
//                       </>
//                     )}
//                   </span>
//                 </motion.button>
//               </motion.div>

//               {/* Divider */}
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-px bg-white/[0.07]" />
//                 <span className="text-[11px] text-white/20 tracking-widest uppercase">or</span>
//                 <div className="flex-1 h-px bg-white/[0.07]" />
//               </div>

//               {/* Register link */}
//               <motion.p
//                 className="text-center text-sm text-white/30"
//                 {...fadeUp(0.7)}
//               >
//                 Don't have an account?{" "}
//                 <Link
//                   to="/register"
//                   className="text-violet-400 font-semibold hover:text-violet-300 underline underline-offset-2 decoration-violet-500/30 transition-colors duration-200"
//                 >
//                   Create one
//                 </Link>
//               </motion.p>
//             </form>
//           </div>

//           {/* Footer note */}
//           <motion.p
//             className="text-center text-xs text-white/15 mt-5"
//             {...fadeUp(0.9)}
//           >
//             Protected by end-to-end encryption 🔒
//           </motion.p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;



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
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { delay, duration: 0.55, ease: "easeOut" },
});

const Login = () => {
  const [form, setForm]                 = useState({ email: "", password: "" });
  const [focused, setFocused]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      const token = localStorage.getItem("token");
      const role  = JSON.parse(atob(token.split(".")[1])).role;
      if (role === "Admin")        navigate("/admin");
      else if (role === "Teacher") navigate("/teacher");
      else                         navigate("/student");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#07070f] overflow-hidden relative">

      {/* ── Animated background orbs — ClassVerse blue theme ── */}
      <motion.div
        className="pointer-events-none absolute -top-52 -left-52 w-[680px] h-[680px] rounded-full bg-[#1F4E79]/30 blur-[130px]"
        animate={{ scale: [1, 1.14, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-44 -right-44 w-[560px] h-[560px] rounded-full bg-[#2E75B6]/20 blur-[130px]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/3 w-[320px] h-[320px] rounded-full bg-blue-400/10 blur-[100px]"
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
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
        {/* ClassVerse Logo */}
        <motion.div className="mb-14" {...fadeUp(0.15)}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1F4E79] to-[#2E75B6] flex items-center justify-center shadow-lg shadow-[#1F4E79]/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-2xl font-black tracking-tight leading-none">
                Class<span className="text-[#2E75B6]">Verse</span>
              </p>
              <p className="text-white/30 text-[11px] tracking-widest uppercase mt-0.5">e-Learning Platform</p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm">
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ boxShadow: ["0 0 4px #34d399", "0 0 16px #34d399", "0 0 4px #34d399"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/45 text-[11px] font-semibold tracking-widest uppercase">Live Platform</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-[58px] xl:text-7xl font-black text-white leading-[1.06] tracking-tight mb-5"
          {...fadeUp(0.3)}
        >
          Learn.<br />
          Teach.<br />
          <span className="bg-gradient-to-r from-[#2E75B6] via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Grow together.
          </span>
        </motion.h1>

        <motion.p
          className="text-white/35 text-[17px] leading-relaxed max-w-[380px] mb-16"
          {...fadeUp(0.45)}
        >
          ClassVerse brings students, teachers & admins into one powerful, unified learning experience.
        </motion.p>

        {/* Stats */}
        <motion.div className="flex gap-14" {...fadeUp(0.55)}>
          {[
            { num: "12K+", label: "Students"     },
            { num: "340+", label: "Teachers"     },
            { num: "98%",  label: "Satisfaction" },
          ].map(({ num, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
            >
              <p className="text-3xl font-black text-white">{num}</p>
              <p className="text-xs text-white/30 mt-1 tracking-widest uppercase">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating activity card */}
        <motion.div
          className="absolute bottom-16 left-20 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.09] backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{ y: -3, scale: 1.02 }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1F4E79] to-[#2E75B6] flex items-center justify-center text-sm font-black text-white flex-shrink-0">
            A
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Arjun just submitted</p>
            <p className="text-white/35 text-xs mt-0.5">Physics Assignment · 2m ago</p>
          </div>
          <motion.span
            className="w-2 h-2 rounded-full bg-emerald-400 ml-1 flex-shrink-0"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
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
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1F4E79] to-[#2E75B6] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-white text-xl font-black tracking-tight">
              Class<span className="text-[#2E75B6]">Verse</span>
            </span>
          </div>

          {/* Glass card */}
          <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

            {/* Inner glows */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-48 h-48 rounded-full bg-[#1F4E79]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-[#2E75B6]/15 blur-2xl" />

            {/* Header */}
            <motion.div {...fadeUp(0.25)}>
              <p className="text-[#2E75B6] text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
                Welcome back
              </p>
              <h2 className="text-white text-[28px] font-black tracking-tight mb-1.5">
                Sign in to ClassVerse
              </h2>
              <p className="text-white/30 text-sm leading-relaxed mb-8">
                Enter your credentials to access your dashboard.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Email ── */}
              <motion.div {...fadeLeft(0.35)}>
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
                    className={`w-full bg-white/[0.05] border rounded-xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-300
                      ${focused === "email"
                        ? "border-[#2E75B6]/70 bg-[#1F4E79]/10 shadow-[0_0_0_3px_rgba(46,117,182,0.18)]"
                        : "border-white/[0.09] hover:border-white/20"}`}
                  />
                </div>
              </motion.div>

              {/* ── Password ── */}
              <motion.div {...fadeLeft(0.45)}>
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
                    placeholder="••••••••"
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    required
                    className={`w-full bg-white/[0.05] border rounded-xl pl-11 pr-12 py-3.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-300
                      ${focused === "password"
                        ? "border-[#2E75B6]/70 bg-[#1F4E79]/10 shadow-[0_0_0_3px_rgba(46,117,182,0.18)]"
                        : "border-white/[0.09] hover:border-white/20"}`}
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
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-xs text-white/25 hover:text-[#2E75B6] transition-colors duration-200">
                    Forgot password?
                  </a>
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

              {/* ── Submit button ── */}
              <motion.div {...fadeUp(0.55)}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.025, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="relative w-full py-4 mt-1 rounded-xl font-bold text-sm tracking-wide text-white overflow-hidden
                    bg-gradient-to-r from-[#1F4E79] via-[#2E75B6] to-blue-400
                    shadow-[0_4px_24px_rgba(31,78,121,0.55)]
                    hover:shadow-[0_8px_36px_rgba(31,78,121,0.7)]
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
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In to ClassVerse
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

              {/* Register link */}
              <motion.p className="text-center text-sm text-white/30" {...fadeUp(0.7)}>
                New to ClassVerse?{" "}
                <Link
                  to="/register"
                  className="text-[#2E75B6] font-semibold hover:text-blue-300 underline underline-offset-2 decoration-[#2E75B6]/30 transition-colors duration-200"
                >
                  Create an account
                </Link>
              </motion.p>
            </form>
          </div>

          {/* Footer */}
          <motion.p className="text-center text-xs text-white/15 mt-5" {...fadeUp(0.9)}>
            © 2025 ClassVerse · Secure e-Learning Platform 🔒
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;