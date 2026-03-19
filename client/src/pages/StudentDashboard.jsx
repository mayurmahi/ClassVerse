// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";

// const StudentDashboard = () => {
//   const [classrooms, setClassrooms] = useState([]);
//   const [joinCode, setJoinCode] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchClassrooms();
//   }, []);

//   const fetchClassrooms = async () => {
//     try {
//       const res = await api.get("/classroom/my");
//       setClassrooms(res.data.classrooms);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleJoin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);
//     try {
//       await api.post("/classroom/join", { joinCode });
//       setSuccess("Joined successfully!");
//       setJoinCode("");
//       fetchClassrooms();
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <h1 className="text-2xl font-bold text-[#1F4E79] mb-6">
//         Student Dashboard
//       </h1>

//       {/* Join Classroom */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6 max-w-md">
//         <h2 className="text-lg font-semibold text-[#1F4E79] mb-3">
//           Join a Classroom
//         </h2>
//         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
//         {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
//         <form onSubmit={handleJoin} className="flex gap-2">
//           <input
//             type="text"
//             value={joinCode}
//             onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
//             placeholder="Enter join code"
//             required
//             className="flex-1 border rounded px-3 py-2 focus:outline-none 
//                        focus:ring-2 focus:ring-[#2E75B6]"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-[#1F4E79] text-white px-4 py-2 rounded 
//                        hover:bg-[#2E75B6]"
//           >
//             {loading ? "Joining..." : "Join"}
//           </button>
//         </form>
//       </div>

//       {/* Enrolled Classrooms */}
//       {classrooms.length === 0 ? (
//         <p className="text-gray-500">
//           No classrooms yet. Join one using a code!
//         </p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {classrooms.map((c) => (
//             <div
//               key={c._id}
//               onClick={() => navigate(`/classroom/${c._id}`)}
//               className="bg-white rounded-lg shadow p-4 cursor-pointer 
//                          hover:shadow-md transition"
//             >
//               <h2 className="text-lg font-bold text-[#1F4E79]">{c.name}</h2>
//               <p className="text-gray-500 text-sm">{c.subject}</p>
//               <p className="text-gray-400 text-xs mt-2">
//                 Teacher: {c.teacherId?.name}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;




import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const StudentDashboard = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get("/classroom/my");
      setClassrooms(res.data.classrooms);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/classroom/join", { joinCode });
      setSuccess("Joined successfully!");
      setJoinCode("");
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Distinct card accent colors cycling per classroom
  const cardAccents = [
    "border-t-4 border-[#1F4E79]",
    "border-t-4 border-[#2E75B6]",
    "border-t-4 border-indigo-500",
    "border-t-4 border-emerald-500",
    "border-t-4 border-amber-500",
    "border-t-4 border-rose-500",
  ];

  const avatarColors = [
    "bg-[#1F4E79]",
    "bg-[#2E75B6]",
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-amber-500",
    "bg-rose-500",
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top header */}
      <div className="bg-[#1F4E79] px-8 py-5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422A12.08 12.08 0 0 1 18.5 19a12.08 12.08 0 0 1-13 0 12.08 12.08 0 0 1 .34-8.422L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">Student Dashboard</h1>
              <p className="text-blue-200 text-xs">ClassVerse · Your Learning Hub</p>
            </div>
          </div>
          <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            🎓 Student
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Join classroom card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1F4E79]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-[#1F4E79]">Join a Classroom</h2>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-3 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl mb-3 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter classroom code (e.g. ABC123)"
              required
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Joining…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Join
                </>
              )}
            </button>
          </form>
        </div>

        {/* Classrooms section */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1F4E79]">My Classrooms</h2>
            {classrooms.length > 0 && (
              <span className="bg-blue-50 text-[#1F4E79] text-xs font-semibold px-2.5 py-1 rounded-full">
                {classrooms.length}
              </span>
            )}
          </div>
        </div>

        {classrooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#2E75B6] opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422A12.08 12.08 0 0 1 18.5 19a12.08 12.08 0 0 1-13 0 12.08 12.08 0 0 1 .34-8.422L12 14z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">No classrooms yet</p>
            <p className="text-gray-400 text-xs mt-1">Enter a join code above to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {classrooms.map((c, i) => (
              <div
                key={c._id}
                onClick={() => navigate(`/classroom/${c._id}`)}
                className={`bg-white rounded-2xl shadow-sm ${cardAccents[i % cardAccents.length]} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group`}
              >
                {/* Card top banner */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-base`}>
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#2E75B6] transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[#1F4E79] leading-tight mb-1 group-hover:text-[#2E75B6] transition-colors duration-200">
                    {c.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{c.subject}</p>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1F4E79] flex items-center justify-center text-white text-[9px] font-bold">
                    {c.teacherId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-gray-400 text-xs">{c.teacherId?.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;