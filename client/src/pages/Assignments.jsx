import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Shared Alert Components ──────────────────────────────────────────────────
const AlertError = ({ msg }) => (
  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm">
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    {msg}
  </div>
);

const AlertSuccess = ({ msg }) => (
  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {msg}
  </div>
);

// ── Grade Badge ───────────────────────────────────────────────────────────────
const GradeBadge = ({ grade }) => {
  if (!grade && grade !== 0) return <span className="text-xs text-gray-400 italic">Not graded</span>;
  const color =
    grade >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    grade >= 70 ? "bg-blue-50 text-[#1F4E79] border-blue-200" :
    grade >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {grade}/100
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Assignments = ({ classroomId }) => {
  const { user } = useAuth();

  // Teacher form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const attachRef = useRef(null);

  // Assignment list
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Student submission state (per assignment)
  const [submitFile, setSubmitFile] = useState({});       // { assignmentId: File }
  const [submitNote, setSubmitNote] = useState({});        // { assignmentId: string }
  const [expandSubmit, setExpandSubmit] = useState({});    // which card shows upload panel
  const [mySubmissions, setMySubmissions] = useState({});  // { assignmentId: submission }

  // Teacher view-submissions state
  const [viewSubmissionsId, setViewSubmissionsId] = useState(null);
  const [submissions, setSubmissions] = useState({});      // { assignmentId: [submission] }

  // Teacher grading
  const [gradingId, setGradingId] = useState(null);       // submissionId being graded
  const [gradeValue, setGradeValue] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Assignment details expand
  const [expandedId, setExpandedId] = useState(null);

  // Teacher: edit assignment
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editMarks, setEditMarks] = useState(100);

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/" + classroomId);
      setAssignments(res.data.assignments);
      if (user.role === "Student") {
        res.data.assignments.forEach((a) => fetchMySubmission(a._id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMySubmission = async (assignmentId) => {
    try {
      const res = await api.get("/assignments/mystatus/" + assignmentId);
      setMySubmissions((prev) => ({ ...prev, [assignmentId]: res.data.submission }));
    } catch (err) {
      console.error(err);
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

  // ── Teacher: Create ────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const formData = new FormData();
      formData.append("classroomId", classroomId);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("deadline", deadline);
      formData.append("totalMarks", totalMarks);
      if (attachmentFile) formData.append("attachment", attachmentFile);

      await api.post("/assignments/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Assignment created successfully!");
      setTitle(""); setDescription(""); setDeadline(""); setTotalMarks(100);
      setAttachmentFile(null);
      if (attachRef.current) attachRef.current.value = "";
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Teacher: Edit ──────────────────────────────────────────────────────────
  const startEdit = (a) => {
    setEditingId(a._id);
    setEditTitle(a.title);
    setEditDesc(a.description);
    setEditDeadline(a.deadline?.slice(0, 16));
    setEditMarks(a.totalMarks || 100);
  };

  const handleEdit = async (assignmentId) => {
    setLoading(true);
    try {
      await api.put("/assignments/" + assignmentId, {
        title: editTitle,
        description: editDesc,
        deadline: editDeadline,
        totalMarks: editMarks,
      });
      setSuccess("Assignment updated!");
      setEditingId(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Teacher: Delete ────────────────────────────────────────────────────────
  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Delete this assignment? This cannot be undone.")) return;
    try {
      await api.delete("/assignments/" + assignmentId);
      setSuccess("Assignment deleted.");
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // ── Teacher: Grade ─────────────────────────────────────────────────────────
  const handleGrade = async (submissionId, assignmentId) => {
    if (!gradeValue && gradeValue !== 0) { setError("Enter a grade"); return; }
    try {
      await api.put("/assignments/submission/grade/" + submissionId, {
        grade: Number(gradeValue),
        feedback: gradeFeedback,
      });
      setSuccess("Grade saved!");
      setGradingId(null); setGradeValue(""); setGradeFeedback("");
      fetchSubmissions(assignmentId);
    } catch (err) {
      setError(err.response?.data?.message || "Grading failed");
    }
  };

  // ── Student: Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (assignmentId) => {
    setError(""); setSuccess("");
    const f = submitFile[assignmentId];
    if (!f) { setError("Please select a file to submit"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("assignmentId", assignmentId);
      if (submitNote[assignmentId]) formData.append("note", submitNote[assignmentId]);
      await api.post("/assignments/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Assignment submitted successfully!");
      setSubmitFile((prev) => ({ ...prev, [assignmentId]: null }));
      setSubmitNote((prev) => ({ ...prev, [assignmentId]: "" }));
      setExpandSubmit((prev) => ({ ...prev, [assignmentId]: false }));
      fetchMySubmission(assignmentId);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Student: Delete Submission ─────────────────────────────────────────────
  const handleDeleteSubmission = async (submissionId, assignmentId) => {
    try {
      await api.delete("/assignments/submission/" + submissionId);
      setSuccess("Submission deleted — you can resubmit now.");
      setMySubmissions((prev) => ({ ...prev, [assignmentId]: null }));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isDeadlinePassed = (deadline) => new Date() > new Date(deadline);

  const timeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const submittedCount = (aId) => (submissions[aId] || []).length;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ══════════════ TEACHER: Create Form ══════════════ */}
      {user.role === "Teacher" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-5 py-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <h3 className="text-white font-semibold text-sm">Create New Assignment</h3>
          </div>
          <form onSubmit={handleCreate} className="px-5 py-5 space-y-4">
            {error && <AlertError msg={error} />}
            {success && <AlertSuccess msg={success} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
                <input type="text" placeholder="e.g. Chapter 4 – Linked Lists" value={title}
                  onChange={(e) => setTitle(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all placeholder-gray-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Instructions *</label>
                <textarea placeholder="Write detailed instructions for students…" value={description}
                  onChange={(e) => setDescription(e.target.value)} required rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all placeholder-gray-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deadline *</label>
                <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Marks</label>
                <input type="number" min="1" max="1000" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Attachment (optional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-[#2E75B6] transition-colors bg-gray-50/30">
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.png,.jpg"
                    onChange={(e) => setAttachmentFile(e.target.files[0])} ref={attachRef}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer file:transition-colors"
                  />
                  {attachmentFile && <p className="text-xs text-[#2E75B6] mt-1.5 font-medium">✓ {attachmentFile.name}</p>}
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, ZIP, images — attach reference material for students</p>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Creating…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Create Assignment</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Student global alerts */}
      {user.role === "Student" && error   && <AlertError msg={error} />}
      {user.role === "Student" && success && <AlertSuccess msg={success} />}
      {user.role === "Teacher" && !loading && (
        <div className="space-y-1">
          {/* alerts shown inside form already */}
        </div>
      )}

      {/* ══════════════ ASSIGNMENTS LIST ══════════════ */}
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
            const remaining = timeLeft(a.deadline);
            const mySub = mySubmissions[a._id];
            const isExpanded = expandedId === a._id;
            const isEditing = editingId === a._id;

            return (
              <div key={a._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">

                {/* ── Card Header ── */}
                <div className="px-5 py-4">
                  {isEditing ? (
                    /* Edit mode */
                    <div className="space-y-3">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent"
                        placeholder="Title"
                      />
                      <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent resize-none"
                        placeholder="Instructions"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 font-medium mb-1 block">Deadline</label>
                          <input type="datetime-local" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-medium mb-1 block">Total Marks</label>
                          <input type="number" value={editMarks} onChange={(e) => setEditMarks(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(a._id)} disabled={loading}
                          className="flex items-center gap-1.5 bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {loading ? "Saving…" : "Save Changes"}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${passed ? "bg-red-50" : "bg-emerald-50"}`}>
                          <svg className={`w-5 h-5 ${passed ? "text-red-400" : "text-emerald-500"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                            <rect x="9" y="3" width="6" height="4" rx="1"/>
                            <path d="M9 12h6M9 16h4"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-800 text-sm">{a.title}</p>
                            {a.totalMarks && (
                              <span className="text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">
                                {a.totalMarks} marks
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{a.description}</p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <span className={`text-xs font-medium ${passed ? "text-red-400" : "text-gray-400"}`}>
                                Due: {fmtDate(a.deadline)}
                              </span>
                            </div>
                            {remaining && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                parseInt(remaining) <= 1 && remaining.includes('h')
                                  ? "bg-red-50 text-red-500 border border-red-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}>
                                ⏱ {remaining}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: status + teacher actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {passed ? (
                          <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Closed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Open
                          </span>
                        )}

                        {user.role === "Teacher" && (
                          <div className="flex gap-1.5">
                            <button onClick={() => startEdit(a)}
                              className="flex items-center gap-1 text-xs text-[#2E75B6] hover:text-[#1F4E79] font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(a._id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Teacher attachment file */}
                  {!isEditing && a.attachmentPath && (
                    <div className="mt-3 ml-13">
                      <a
                        href={"http://localhost:5000/uploads/" + a.attachmentPath}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        View attached resource
                      </a>
                    </div>
                  )}
                </div>

                {/* ══════════════ STUDENT: Submission Area ══════════════ */}
                {user.role === "Student" && !isEditing && (
                  <div className="border-t border-gray-100 px-5 py-3.5 bg-gray-50/60">
                    {mySub ? (
                      /* Already submitted */
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1.5 bg-blue-50 text-[#1F4E79] border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Submitted · {fmtDate(mySub.submittedAt)}
                          </span>
                          {mySub.grade !== undefined && mySub.grade !== null && (
                            <GradeBadge grade={mySub.grade} />
                          )}
                          <a
                            href={"http://localhost:5000/uploads/" + mySub.filePathOrText}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            View my submission
                          </a>
                          {!passed && (
                            <button onClick={() => handleDeleteSubmission(mySub._id, a._id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              </svg>
                              Delete & resubmit
                            </button>
                          )}
                        </div>
                        {/* Teacher feedback */}
                        {mySub.feedback && (
                          <div className="bg-white border border-amber-100 rounded-xl px-4 py-3 mt-2">
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Teacher Feedback</p>
                            <p className="text-sm text-gray-600">{mySub.feedback}</p>
                          </div>
                        )}
                        {mySub.grade === null || mySub.grade === undefined ? (
                          <p className="text-xs text-gray-400 italic">Awaiting grade from teacher</p>
                        ) : null}
                      </div>
                    ) : !passed ? (
                      /* Not submitted, open */
                      <div>
                        {expandSubmit[a._id] ? (
                          <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-[#2E75B6] transition-colors bg-white">
                              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt,.png,.jpg"
                                onChange={(e) => setSubmitFile((prev) => ({ ...prev, [a._id]: e.target.files[0] }))}
                                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer file:transition-colors"
                              />
                              {submitFile[a._id] && <p className="text-xs text-[#2E75B6] mt-1.5 font-medium">✓ {submitFile[a._id].name}</p>}
                            </div>
                            <textarea
                              placeholder="Optional note to teacher…"
                              value={submitNote[a._id] || ""}
                              onChange={(e) => setSubmitNote((prev) => ({ ...prev, [a._id]: e.target.value }))}
                              rows={2}
                              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all resize-none placeholder-gray-300"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleSubmit(a._id)} disabled={loading}
                                className="flex items-center gap-1.5 bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                              >
                                {loading ? (
                                  <><svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Submitting…</>
                                ) : (
                                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Submit</>
                                )}
                              </button>
                              <button onClick={() => setExpandSubmit((prev) => ({ ...prev, [a._id]: false }))}
                                className="border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setExpandSubmit((prev) => ({ ...prev, [a._id]: true }))}
                            className="flex items-center gap-1.5 bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
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

                {/* ══════════════ TEACHER: Submissions Panel ══════════════ */}
                {user.role === "Teacher" && !isEditing && (
                  <div className="border-t border-gray-100 bg-gray-50/60">
                    <div className="px-5 py-3.5 flex items-center justify-between">
                      <button
                        onClick={() =>
                          viewSubmissionsId === a._id
                            ? setViewSubmissionsId(null)
                            : fetchSubmissions(a._id)
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {viewSubmissionsId === a._id ? "Hide Submissions" : "View Submissions"}
                        {submissions[a._id] && (
                          <span className="bg-[#1F4E79] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                            {submittedCount(a._id)}
                          </span>
                        )}
                      </button>
                    </div>

                    {viewSubmissionsId === a._id && submissions[a._id] && (
                      <div className="mx-5 mb-4 bg-white border border-gray-100 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <p className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">Student Submissions</p>
                          <span className="text-xs text-gray-400 font-medium">{submittedCount(a._id)} total</span>
                        </div>

                        {submissions[a._id].length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <p className="text-gray-400 text-sm">No submissions yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {submissions[a._id].map((s) => (
                              <div key={s._id} className="px-4 py-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#1F4E79] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                      {s.studentId?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-800">{s.studentId?.name}</p>
                                      <p className="text-xs text-gray-400">{s.studentId?.email}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        Submitted: {fmtDate(s.submittedAt)}
                                      </p>
                                      {s.note && (
                                        <p className="text-xs text-gray-500 mt-1 italic bg-gray-50 rounded-lg px-2 py-1">
                                          "{s.note}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {s.grade !== undefined && s.grade !== null ? (
                                      <GradeBadge grade={s.grade} />
                                    ) : (
                                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                        Ungraded
                                      </span>
                                    )}
                                    <a
                                      href={"http://localhost:5000/uploads/" + s.filePathOrText}
                                      target="_blank" rel="noreferrer"
                                      className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-white hover:bg-[#1F4E79] border border-[#1F4E79]/30 hover:border-[#1F4E79] px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                      </svg>
                                      View
                                    </a>
                                    <button
                                      onClick={() => {
                                        setGradingId(gradingId === s._id ? null : s._id);
                                        setGradeValue(s.grade ?? "");
                                        setGradeFeedback(s.feedback || "");
                                      }}
                                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                      </svg>
                                      Grade
                                    </button>
                                  </div>
                                </div>

                                {/* Grading panel */}
                                {gradingId === s._id && (
                                  <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Grade Submission</p>
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 w-28">
                                        <label className="text-xs text-purple-600 font-medium mb-1 block">
                                          Score (/{a.totalMarks || 100})
                                        </label>
                                        <input type="number" min="0" max={a.totalMarks || 100}
                                          value={gradeValue} onChange={(e) => setGradeValue(e.target.value)}
                                          placeholder="0"
                                          className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="text-xs text-purple-600 font-medium mb-1 block">Feedback (optional)</label>
                                        <textarea value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)}
                                          rows={2} placeholder="Write feedback for the student…"
                                          className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none placeholder-purple-300"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleGrade(s._id, a._id)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                      >
                                        Save Grade
                                      </button>
                                      <button onClick={() => setGradingId(null)}
                                        className="border border-purple-200 text-purple-600 hover:bg-purple-100 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Show existing feedback */}
                                {s.feedback && gradingId !== s._id && (
                                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    <p className="text-xs font-semibold text-amber-600">Feedback: <span className="font-normal text-gray-600">{s.feedback}</span></p>
                                  </div>
                                )}
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