// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";

// const TeacherDashboard = () => {
//   const [classrooms, setClassrooms] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [name, setName] = useState("");
//   const [subject, setSubject] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // Fetch teacher classrooms on load
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

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await api.post("/classroom/create", { name, subject });
//       setName("");
//       setSubject("");
//       setShowModal(false);
//       fetchClassrooms();
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-[#1F4E79]">
//           Teacher Dashboard
//         </h1>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-[#1F4E79] text-white px-4 py-2 rounded hover:bg-[#2E75B6]"
//         >
//           + Create Classroom
//         </button>
//       </div>

//       {/* Classroom Cards */}
//       {classrooms.length === 0 ? (
//         <p className="text-gray-500">No classrooms yet. Create one!</p>
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
//               <div className="mt-3 flex justify-between items-center">
//                 <span className="bg-blue-100 text-[#1F4E79] text-xs 
//                                  font-bold px-2 py-1 rounded">
//                   Code: {c.joinCode}
//                 </span>
//                 <span className="text-gray-400 text-xs">
//                   {c.members.length} student(s)
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Create Classroom Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex 
//                         items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
//             <h2 className="text-xl font-bold text-[#1F4E79] mb-4">
//               Create New Classroom
//             </h2>
//             {error && (
//               <p className="text-red-500 text-sm mb-3">{error}</p>
//             )}
//             <form onSubmit={handleCreate} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Classroom Name
//                 </label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   className="mt-1 w-full border rounded px-3 py-2 
//                              focus:outline-none focus:ring-2 
//                              focus:ring-[#2E75B6]"
//                   placeholder="e.g. Web Development"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   value={subject}
//                   onChange={(e) => setSubject(e.target.value)}
//                   required
//                   className="mt-1 w-full border rounded px-3 py-2 
//                              focus:outline-none focus:ring-2 
//                              focus:ring-[#2E75B6]"
//                   placeholder="e.g. Computer Science"
//                 />
//               </div>
//               <div className="flex justify-end gap-3 mt-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 border rounded text-gray-600 
//                              hover:bg-gray-100"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-4 py-2 bg-[#1F4E79] text-white rounded 
//                              hover:bg-[#2E75B6]"
//                 >
//                   {loading ? "Creating..." : "Create"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeacherDashboard;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TeacherDashboard = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/classroom/create", { name, subject });
      setName("");
      setSubject("");
      setShowModal(false);
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── Top Header ── */}
      <div className="bg-[#1F4E79] px-8 py-5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">Teacher Dashboard</h1>
              <p className="text-blue-200 text-xs">ClassVerse · Manage Your Classrooms</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-[#1F4E79] hover:bg-blue-50 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Classroom
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Section label ── */}
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

        {/* ── Empty state ── */}
        {classrooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#2E75B6] opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p className="text-gray-500 font-semibold text-sm">No classrooms yet</p>
            <p className="text-gray-400 text-xs mt-1 mb-5">Create your first classroom to get started!</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create Classroom
            </button>
          </div>
        ) : (
          /* ── Classroom Cards Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {classrooms.map((c, i) => (
              <div
                key={c._id}
                onClick={() => navigate(`/classroom/${c._id}`)}
                className={`bg-white rounded-2xl shadow-sm ${cardAccents[i % cardAccents.length]} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group`}
              >
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-black text-lg`}>
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#2E75B6] transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[#1F4E79] mb-1 group-hover:text-[#2E75B6] transition-colors duration-200 leading-tight">
                    {c.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{c.subject}</p>
                </div>

                {/* Card footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#2E75B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/>
                    </svg>
                    <span className="text-[#1F4E79] text-xs font-bold tracking-wider">{c.joinCode}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {c.members.length} student{c.members.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Classroom Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="bg-[#1F4E79] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <h2 className="text-white font-bold text-lg">Create New Classroom</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl mb-4 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Classroom Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Web Development Batch A"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Computer Science"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-300"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Creating…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;