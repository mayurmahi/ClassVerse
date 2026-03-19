// import { useEffect, useState } from "react";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";

// const Assignments = ({ classroomId }) => {
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [deadline, setDeadline] = useState("");
//   const [file, setFile] = useState(null);
//   const [selectedId, setSelectedId] = useState(null);
//   const [submissions, setSubmissions] = useState({});
//   const [mySubmissions, setMySubmissions] = useState({});
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [viewSubmissionsId, setViewSubmissionsId] = useState(null);

//   useEffect(() => {
//     fetchAssignments();
//   }, [classroomId]);

//   const fetchAssignments = async () => {
//     try {
//       const res = await api.get("/assignments/" + classroomId);
//       setAssignments(res.data.assignments);

//       // If student — check submission status for each assignment
//       if (user.role === "Student") {
//         res.data.assignments.forEach((a) => {
//           checkMySubmission(a._id);
//         });
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Check if student already submitted
//   const checkMySubmission = async (assignmentId) => {
//     try {
//       const res = await api.get("/assignments/mystatus/" + assignmentId);
//       setMySubmissions((prev) => ({
//         ...prev,
//         [assignmentId]: res.data.submission,
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);
//     try {
//       await api.post("/assignments/create", {
//         classroomId,
//         title,
//         description,
//         deadline,
//       });
//       setSuccess("Assignment created successfully");
//       setTitle("");
//       setDescription("");
//       setDeadline("");
//       fetchAssignments();
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (assignmentId) => {
//     setError("");
//     setSuccess("");

//     if (!file) {
//       setError("Please select a file to submit");
//       return;
//     }

//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("assignmentId", assignmentId);

//       await api.post("/assignments/submit", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setSuccess("Assignment submitted successfully");
//       setFile(null);
//       setSelectedId(null);
//       checkMySubmission(assignmentId);
//     } catch (err) {
//       setError(err.response?.data?.message || "Submission failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteSubmission = async (submissionId, assignmentId) => {
//     try {
//       await api.delete("/assignments/submission/" + submissionId);
//       setSuccess("Submission deleted — you can resubmit now");
//       setMySubmissions((prev) => ({ ...prev, [assignmentId]: null }));
//     } catch (err) {
//       setError(err.response?.data?.message || "Delete failed");
//     }
//   };

//   const fetchSubmissions = async (assignmentId) => {
//     try {
//       const res = await api.get("/assignments/submissions/" + assignmentId);
//       setSubmissions((prev) => ({
//         ...prev,
//         [assignmentId]: res.data.submissions,
//       }));
//       setViewSubmissionsId(assignmentId);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const isDeadlinePassed = (deadline) => {
//     return new Date() > new Date(deadline);
//   };

//   return (
//     <div>
//       {/* Create Assignment — Teacher only */}
//       {user.role === "Teacher" && (
//         <form onSubmit={handleCreate} className="mb-4 p-4 border rounded">
//           <h3 className="font-bold mb-2">Create Assignment</h3>
//           {error && <p className="text-red-500 text-sm">{error}</p>}
//           {success && <p className="text-green-500 text-sm">{success}</p>}
//           <input
//             type="text"
//             placeholder="Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="border px-3 py-2 rounded w-full mb-2"
//             required
//           />
//           <textarea
//             placeholder="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="border px-3 py-2 rounded w-full mb-2"
//             required
//           />
//           <input
//             type="datetime-local"
//             value={deadline}
//             onChange={(e) => setDeadline(e.target.value)}
//             className="border px-3 py-2 rounded w-full mb-2"
//             required
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-700 text-white px-4 py-2 rounded"
//           >
//             {loading ? "Creating..." : "Create Assignment"}
//           </button>
//         </form>
//       )}

//       {/* Global messages for student */}
//       {user.role === "Student" && error && (
//         <p className="text-red-500 text-sm mb-2">{error}</p>
//       )}
//       {user.role === "Student" && success && (
//         <p className="text-green-500 text-sm mb-2">{success}</p>
//       )}

//       {/* Assignments List */}
//       {assignments.length === 0 ? (
//         <p className="text-gray-500">No assignments yet</p>
//       ) : (
//         <ul className="space-y-3">
//           {assignments.map((a) => (
//             <li key={a._id} className="border rounded p-4">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="font-bold">{a.title}</p>
//                   <p className="text-gray-600 text-sm">{a.description}</p>
//                   <p className="text-gray-400 text-xs mt-1">
//                     Deadline: {new Date(a.deadline).toLocaleString()}
//                   </p>
//                 </div>
//                 {isDeadlinePassed(a.deadline) ? (
//                   <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
//                     Deadline Passed
//                   </span>
//                 ) : (
//                   <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
//                     Open
//                   </span>
//                 )}
//               </div>

//               {/* Student submission section */}
//               {user.role === "Student" && (
//                 <div className="mt-3">
//                   {mySubmissions[a._id] ? (
//                     // Already submitted
//                     <div className="flex items-center gap-3">
//                       <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
//                         Submitted
//                       </span>
                      
//                         <a href={"http://localhost:5000/uploads/" + mySubmissions[a._id].filePathOrText}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="text-blue-600 text-sm underline"
//                       >
//                         View my submission
//                       </a>
//                       {!isDeadlinePassed(a.deadline) && (
//                         <button
//                           onClick={() => handleDeleteSubmission(mySubmissions[a._id]._id, a._id)}
//                           className="text-red-500 text-sm underline"
//                         >
//                           Delete and resubmit
//                         </button>
//                       )}
//                     </div>
//                   ) : !isDeadlinePassed(a.deadline) ? (
//                     // Not submitted and deadline not passed
//                     <div>
//                       {selectedId === a._id ? (
//                         <div>
//                           <input
//                             type="file"
//                             accept=".pdf,.doc,.docx,.ppt,.pptx"
//                             onChange={(e) => setFile(e.target.files[0])}
//                             className="mb-2"
//                           />
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleSubmit(a._id)}
//                               disabled={loading}
//                               className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
//                             >
//                               {loading ? "Submitting..." : "Submit"}
//                             </button>
//                             <button
//                               onClick={() => setSelectedId(null)}
//                               className="border px-3 py-1 rounded text-sm"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => setSelectedId(a._id)}
//                           className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
//                         >
//                           Submit Assignment
//                         </button>
//                       )}
//                     </div>
//                   ) : (
//                     <span className="text-red-500 text-sm">
//                       Not submitted — deadline passed
//                     </span>
//                   )}
//                 </div>
//               )}

//               {/* Teacher — view submissions button */}
//               {user.role === "Teacher" && (
//                 <div className="mt-3">
//                   <button
//                     onClick={() => fetchSubmissions(a._id)}
//                     className="text-blue-600 text-sm underline"
//                   >
//                     View Submissions
//                   </button>

//                   {/* Submissions list */}
//                   {viewSubmissionsId === a._id && submissions[a._id] && (
//                     <div className="mt-2 border rounded p-3 bg-gray-50">
//                       <h4 className="font-bold text-sm mb-2">
//                         Submissions ({submissions[a._id].length})
//                       </h4>
//                       {submissions[a._id].length === 0 ? (
//                         <p className="text-gray-500 text-sm">No submissions yet</p>
//                       ) : (
//                         <ul className="space-y-2">
//                           {submissions[a._id].map((s) => (
//                             <li key={s._id} className="flex justify-between items-center text-sm">
//                               <div>
//                                 <p className="font-medium">{s.studentId.name}</p>
//                                 <p className="text-gray-400 text-xs">{s.studentId.email}</p>
//                                 <p className="text-gray-400 text-xs">
//                                   Submitted: {new Date(s.submittedAt).toLocaleString()}
//                                 </p>
//                               </div>
//                                <a href={"http://localhost:5000/uploads/" + s.filePathOrText}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="text-blue-600 underline"
//                               >
//                                 View File
//                               </a>
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Assignments;





import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Assignments = ({ classroomId }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [mySubmissions, setMySubmissions] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewSubmissionsId, setViewSubmissionsId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/" + classroomId);
      setAssignments(res.data.assignments);
      if (user.role === "Student") {
        res.data.assignments.forEach((a) => checkMySubmission(a._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkMySubmission = async (assignmentId) => {
    try {
      const res = await api.get("/assignments/mystatus/" + assignmentId);
      setMySubmissions((prev) => ({ ...prev, [assignmentId]: res.data.submission }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.post("/assignments/create", { classroomId, title, description, deadline });
      setSuccess("Assignment created successfully");
      setTitle(""); setDescription(""); setDeadline("");
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId) => {
    setError(""); setSuccess("");
    if (!file) { setError("Please select a file to submit"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      await api.post("/assignments/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Assignment submitted successfully");
      setFile(null); setSelectedId(null);
      checkMySubmission(assignmentId);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId, assignmentId) => {
    try {
      await api.delete("/assignments/submission/" + submissionId);
      setSuccess("Submission deleted — you can resubmit now");
      setMySubmissions((prev) => ({ ...prev, [assignmentId]: null }));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await api.get("/assignments/submissions/" + assignmentId);
      setSubmissions((prev) => ({ ...prev, [assignmentId]: res.data.submissions }));
      setViewSubmissionsId(assignmentId);
    } catch (err) {
      console.error(err);
    }
  };

  const isDeadlinePassed = (deadline) => new Date() > new Date(deadline);

  // ── Shared alert components ──────────────────────
  const AlertError = ({ msg }) => (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </div>
  );

  const AlertSuccess = ({ msg }) => (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {msg}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ════════════ TEACHER: Create Form ════════════ */}
      {user.role === "Teacher" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-5 py-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <h3 className="text-white font-semibold text-sm">Create New Assignment</h3>
          </div>
          <form onSubmit={handleCreate} className="px-5 py-5 space-y-4">
            {error && <AlertError msg={error} />}
            {success && <AlertSuccess msg={success} />}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                placeholder="e.g. Chapter 4 – Linked Lists"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                placeholder="Write instructions for students…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Create Assignment
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Student global alerts */}
      {user.role === "Student" && error   && <AlertError msg={error} />}
      {user.role === "Student" && success && <AlertSuccess msg={success} />}

      {/* ════════════ ASSIGNMENTS LIST ════════════ */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#2E75B6] opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No assignments yet</p>
          <p className="text-gray-400 text-xs mt-1">
            {user.role === "Teacher" ? "Create the first assignment above" : "Your teacher hasn't posted any assignments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const passed = isDeadlinePassed(a.deadline);
            return (
              <div key={a._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

                {/* ── Card Header ── */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${passed ? "bg-red-50" : "bg-emerald-50"}`}>
                        <svg className={`w-5 h-5 ${passed ? "text-red-400" : "text-emerald-500"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                          <path d="M9 12h6M9 16h4"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{a.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{a.description}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span className={`text-xs font-medium ${passed ? "text-red-400" : "text-gray-400"}`}>
                            Due: {new Date(a.deadline).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status pill */}
                    {passed ? (
                      <span className="flex-shrink-0 flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Closed
                      </span>
                    ) : (
                      <span className="flex-shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Open
                      </span>
                    )}
                  </div>
                </div>

                {/* ── STUDENT: Submission Section ── */}
                {user.role === "Student" && (
                  <div className="border-t border-gray-50 px-5 py-3.5 bg-gray-50/60">
                    {mySubmissions[a._id] ? (
                      /* Already submitted */
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 bg-blue-50 text-[#1F4E79] border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Submitted
                        </span>
                        <a
                          href={"http://localhost:5000/uploads/" + mySubmissions[a._id].filePathOrText}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View my submission
                        </a>
                        {!passed && (
                          <button
                            onClick={() => handleDeleteSubmission(mySubmissions[a._id]._id, a._id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            </svg>
                            Delete & resubmit
                          </button>
                        )}
                      </div>
                    ) : !passed ? (
                      /* Not submitted, deadline open */
                      <div>
                        {selectedId === a._id ? (
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-[#2E75B6] transition-colors duration-200 bg-white">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer file:transition-colors"
                              />
                              {file && <p className="text-xs text-[#2E75B6] mt-1.5 font-medium">✓ {file.name}</p>}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmit(a._id)}
                                disabled={loading}
                                className="flex items-center gap-1.5 bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                              >
                                {loading ? (
                                  <>
                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                    </svg>
                                    Submitting…
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    Submit
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setSelectedId(null)}
                                className="border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedId(a._id)}
                            className="flex items-center gap-1.5 bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Submit Assignment
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Not submitted — deadline passed
                      </span>
                    )}
                  </div>
                )}

                {/* ── TEACHER: View Submissions ── */}
                {user.role === "Teacher" && (
                  <div className="border-t border-gray-50 px-5 py-3.5 bg-gray-50/60">
                    <button
                      onClick={() =>
                        viewSubmissionsId === a._id
                          ? setViewSubmissionsId(null)
                          : fetchSubmissions(a._id)
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] transition-colors duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {viewSubmissionsId === a._id ? "Hide Submissions" : "View Submissions"}
                      {submissions[a._id] && (
                        <span className="bg-[#1F4E79] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                          {submissions[a._id].length}
                        </span>
                      )}
                    </button>

                    {viewSubmissionsId === a._id && submissions[a._id] && (
                      <div className="mt-3 bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">Submissions</p>
                          <span className="text-xs text-gray-400 font-medium">{submissions[a._id].length} total</span>
                        </div>

                        {submissions[a._id].length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <p className="text-gray-400 text-sm">No submissions yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {submissions[a._id].map((s) => (
                              <div key={s._id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors duration-150">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1F4E79] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                    {s.studentId.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{s.studentId.name}</p>
                                    <p className="text-xs text-gray-400">{s.studentId.email}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {new Date(s.submittedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={"http://localhost:5000/uploads/" + s.filePathOrText}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-white hover:bg-[#1F4E79] border border-[#1F4E79]/30 hover:border-[#1F4E79] px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                  View File
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;