import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudyMaterials = ({ classroomId }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // AI Summary
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMaterialId, setSummaryMaterialId] = useState(null);

  // Quiz
  const [quizData, setQuizData] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizMaterialId, setQuizMaterialId] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/materials/${classroomId}`);
      setMaterials(res.data.materials);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Teacher Upload ─────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!file || !title) { setError("Title and file are required"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("classroomId", classroomId);
      await api.post("/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Material uploaded successfully!");
      setTitle(""); setDescription(""); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Teacher Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (materialId) => {
    if (!window.confirm("Delete this material? This cannot be undone.")) return;
    try {
      await api.delete("/materials/" + materialId);
      setSuccess("Material deleted.");
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // ── Student AI Summarize ───────────────────────────────────────────────────
  const handleSummarize = async (materialId) => {
    setSummaryLoading(true);
    setSummaryMaterialId(materialId);
    setSummary("");
    try {
      const res = await api.post("/summarize", { materialId });
      setSummary(res.data.summary);
    } catch (err) {
      setSummary(err.response?.data?.message || "Failed to summarize");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Student AI Quiz ────────────────────────────────────────────────────────
  const handleGenerateQuiz = async (materialId) => {
    setQuizLoading(true);
    setQuizMaterialId(materialId);
    setQuizData(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await api.post("/quiz/generate", { materialId });
      setQuizData(res.data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const quizScore = () => {
    if (!quizData) return 0;
    return quizData.questions.filter(
      (q, i) => quizAnswers[i] === q.answer
    ).length;
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = materials
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => filterType === "all" || (m.fileType || "").toLowerCase() === filterType);

  const uniqueTypes = [...new Set(materials.map((m) => (m.fileType || "").toLowerCase()).filter(Boolean))];

  // ── File type helpers ─────────────────────────────────────────────────────
  const fileTypeBadge = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "pdf") return "bg-red-50 text-red-600 border border-red-100";
    if (t === "ppt" || t === "pptx") return "bg-orange-50 text-orange-600 border border-orange-100";
    if (t === "doc" || t === "docx") return "bg-blue-50 text-blue-700 border border-blue-100";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const fileTypeIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "pdf") return (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    );
    if (t === "ppt" || t === "pptx") return (
      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    );
    return (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" placeholder="Search materials…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all placeholder-gray-400 bg-white"
          />
        </div>
        {uniqueTypes.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => setFilterType("all")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${filterType === "all" ? "bg-[#1F4E79] text-white border-[#1F4E79]" : "bg-white text-gray-500 border-gray-200 hover:border-[#2E75B6]"}`}
            >All</button>
            {uniqueTypes.map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors uppercase ${filterType === t ? "bg-[#1F4E79] text-white border-[#1F4E79]" : "bg-white text-gray-500 border-gray-200 hover:border-[#2E75B6]"}`}
              >{t}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Teacher Upload Form ── */}
      {user.role === "Teacher" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-5 py-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <h3 className="text-white font-semibold text-sm">Upload Study Material</h3>
          </div>

          <form onSubmit={handleUpload} className="px-5 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
              <input type="text" placeholder="e.g. Chapter 3 – Data Structures" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
              <textarea placeholder="Brief description of this material…" value={description}
                onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all placeholder-gray-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-[#2E75B6] transition-colors">
                <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])} ref={fileInputRef}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer file:transition-colors"
                />
                {file && <p className="text-xs text-[#2E75B6] mt-2 font-medium">✓ {file.name}</p>}
                <p className="text-xs text-gray-400 mt-1">PDF, PPT, PPTX, DOC, DOCX accepted</p>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Uploading…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Material</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Materials List ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#2E75B6] opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No materials found</p>
          <p className="text-gray-400 text-xs mt-1">
            {search || filterType !== "all" ? "Try different search/filter" : user.role === "Teacher" ? "Upload your first material above" : "No materials uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">

              {/* Main row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {fileTypeIcon(m.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{m.title}</p>
                  {m.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{m.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-block text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${fileTypeBadge(m.fileType)}`}>
                      {m.fileType}
                    </span>
                    {m.createdAt && (
                      <span className="text-[11px] text-gray-400">{fmtDate(m.createdAt)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View */}
                  <a
                    href={"http://localhost:5000/uploads/" + m.filePath}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-white hover:bg-[#1F4E79] border border-[#1F4E79]/30 hover:border-[#1F4E79] px-3 py-1.5 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View
                  </a>
                  {/* Download */}
                  <a
                    href={"http://localhost:5000/uploads/" + m.filePath}
                    download
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </a>
                  {/* Teacher: delete */}
                  {user.role === "Teacher" && (
                    <button onClick={() => handleDelete(m._id)}
                      className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* ── Student: AI Tools ── */}
              {user.role === "Student" && (
                <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/60">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Summarize */}
                    <button
                      onClick={() =>
                        summaryMaterialId === m._id && summary
                          ? (setSummaryMaterialId(null), setSummary(""))
                          : handleSummarize(m._id)
                      }
                      disabled={summaryLoading && summaryMaterialId === m._id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {summaryLoading && summaryMaterialId === m._id ? (
                        <><svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Summarizing…</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        {summaryMaterialId === m._id && summary ? "Hide Summary" : "AI Summarize"}</>
                      )}
                    </button>

                    <span className="text-gray-300 text-xs">|</span>

                    {/* Quiz */}
                    <button
                      onClick={() =>
                        quizMaterialId === m._id && quizData
                          ? (setQuizMaterialId(null), setQuizData(null))
                          : handleGenerateQuiz(m._id)
                      }
                      disabled={quizLoading && quizMaterialId === m._id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {quizLoading && quizMaterialId === m._id ? (
                        <><svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Generating Quiz…</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                        {quizMaterialId === m._id && quizData ? "Hide Quiz" : "AI Quiz Me"}</>
                      )}
                    </button>
                  </div>

                  {/* AI Summary */}
                  {summaryMaterialId === m._id && summary && (
                    <div className="mt-3 bg-white border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg className="w-3.5 h-3.5 text-[#2E75B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        <p className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">AI Summary</p>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {/* AI Quiz */}
                  {quizMaterialId === m._id && quizData && (
                    <div className="mt-3 bg-white border border-purple-100 rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
                          </svg>
                          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Quick Quiz</p>
                        </div>
                        {quizSubmitted && (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                            Score: {quizScore()}/{quizData.questions.length}
                          </span>
                        )}
                      </div>
                      {quizData.questions.map((q, qi) => (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{qi + 1}. {q.question}</p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const isSelected = quizAnswers[qi] === opt;
                              const isCorrect = quizSubmitted && opt === q.answer;
                              const isWrong = quizSubmitted && isSelected && opt !== q.answer;
                              return (
                                <button key={oi}
                                  onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qi]: opt }))}
                                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-all ${
                                    isCorrect
                                      ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold"
                                      : isWrong
                                      ? "bg-red-50 border-red-400 text-red-600"
                                      : isSelected
                                      ? "bg-purple-50 border-purple-400 text-purple-700 font-semibold"
                                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/30"
                                  } ${quizSubmitted ? "cursor-default" : "cursor-pointer"}`}
                                >
                                  {opt}
                                  {isCorrect && " ✓"}
                                  {isWrong && " ✗"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {!quizSubmitted ? (
                        <button onClick={handleQuizSubmit}
                          disabled={Object.keys(quizAnswers).length < quizData.questions.length}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                        >
                          Submit Quiz
                        </button>
                      ) : (
                        <button onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                          className="w-full border border-purple-200 text-purple-600 hover:bg-purple-50 text-xs font-semibold py-2.5 rounded-xl transition-colors"
                        >
                          Retake Quiz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;