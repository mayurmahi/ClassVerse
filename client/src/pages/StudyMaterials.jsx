import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const fileTypeBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "pdf")                  return "bg-red-50 text-red-600 border border-red-100";
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

const getViewerUrl = (url, fileType) => {
  if (!url) return "#";
  const t = (fileType || "").toLowerCase();
  const officeTypes = ["pdf", "ppt", "pptx", "doc", "docx"];
  if (officeTypes.includes(t)) return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  if (url.includes("res.cloudinary.com")) return url.replace("/upload/", "/upload/fl_inline/");
  return url;
};

const emptyQuestion = () => ({
  id: `q_${Date.now()}_${Math.random()}`,
  question: "",
  options: ["", "", "", ""],
  answer: "",
  marks: 1,
});

/* ─────────────────────────────────────────────────────────────────────────────
   TEACHER – Quiz Creator Modal (3-step)
───────────────────────────────────────────────────────────────────────────── */
const QuizCreatorModal = ({ material, classroomId, onClose, onCreated }) => {
  const [step, setStep]               = useState("suggest");
  const [suggestedQs, setSuggestedQs] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [customQs, setCustomQs]       = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError]     = useState("");

  const [quizTitle, setQuizTitle]   = useState(`Quiz – ${material.title}`);
  const [quizDesc, setQuizDesc]     = useState("");
  const [deadline, setDeadline]     = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError]     = useState("");

  useEffect(() => { fetchSuggestions(); }, []); // eslint-disable-line

  const fetchSuggestions = async () => {
    setSuggestLoading(true); setSuggestError("");
    try {
      const res = await api.post("/quiz/suggest", { materialId: material._id });
      setSuggestedQs(res.data.questions.map((q, i) => ({ ...q, id: `s_${i}` })));
    } catch (err) {
      setSuggestError(err.response?.data?.message || "Failed to get AI suggestions. You can still add questions manually.");
    } finally {
      setSuggestLoading(false);
    }
  };

  const toggleSelect         = (id) => setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const updateSuggestedMarks = (id, val) => setSuggestedQs((prev) => prev.map((q) => q.id === id ? { ...q, suggestedMarks: Number(val) } : q));
  const addCustom            = () => setCustomQs((prev) => [...prev, emptyQuestion()]);
  const removeCustom         = (id) => setCustomQs((prev) => prev.filter((q) => q.id !== id));
  const updateCustom         = (id, field, val) => setCustomQs((prev) => prev.map((q) => q.id === id ? { ...q, [field]: val } : q));
  const updateOption         = (id, idx, val) => setCustomQs((prev) => prev.map((q) => {
    if (q.id !== id) return q;
    const opts   = [...q.options];
    const oldVal = opts[idx];
    opts[idx]    = val;
    return { ...q, options: opts, answer: q.answer === oldVal ? "" : q.answer };
  }));

  const finalQuestions = [
    ...suggestedQs.filter((q) => selectedIds.has(q.id)).map((q) => ({
      question: q.question, options: q.options, answer: q.answer, marks: q.suggestedMarks || 1,
    })),
    ...customQs.map((q) => ({
      question: q.question, options: q.options, answer: q.answer, marks: q.marks,
    })),
  ];

  const totalMarks = finalQuestions.reduce((s, q) => s + (Number(q.marks) || 1), 0);

  const validateBuild = () => {
    if (finalQuestions.length === 0) return "Add at least one question.";
    for (let i = 0; i < finalQuestions.length; i++) {
      const q = finalQuestions[i];
      if (!q.question.trim())               return `Question ${i + 1}: enter question text.`;
      if (q.options.some((o) => !o.trim())) return `Question ${i + 1}: fill all 4 options.`;
      if (!q.answer)                        return `Question ${i + 1}: select the correct answer.`;
      if (!q.options.includes(q.answer))    return `Question ${i + 1}: answer must match an option.`;
    }
    return null;
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) { setCreateError("Quiz title is required."); return; }
    if (!deadline)         { setCreateError("Deadline is required."); return; }
    if (new Date(deadline) <= new Date()) { setCreateError("Deadline must be in the future."); return; }
    setCreateLoading(true); setCreateError("");
    try {
      await api.post("/quiz/create", {
        classroomId, materialId: material._id,
        title: quizTitle, description: quizDesc,
        deadline, questions: finalQuestions,
      });
      onCreated();
      onClose();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to publish quiz.");
    } finally {
      setCreateLoading(false);
    }
  };

  const minDeadline = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[93vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Create Quiz</h2>
            <p className="text-blue-200 text-xs mt-0.5 truncate max-w-sm">From: {material.title}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
          {[{ key: "suggest", label: "1. AI Suggestions" }, { key: "build", label: "2. Build Quiz" }, { key: "details", label: "3. Publish" }].map((s) => (
            <button key={s.key}
              onClick={() => { if (s.key === "details") { const err = validateBuild(); if (err) { alert(err); return; } } setStep(s.key); }}
              className={`flex-1 text-xs font-semibold py-3 border-b-2 transition-colors ${step === s.key ? "border-[#2E75B6] text-[#1F4E79] bg-white" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "suggest" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">AI-suggested questions</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tick questions you want to include.</p>
                </div>
                <button onClick={fetchSuggestions} disabled={suggestLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] border border-[#2E75B6]/30 hover:border-[#2E75B6] px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all">
                  <svg className={`w-3.5 h-3.5 ${suggestLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  {suggestLoading ? "Generating…" : "Regenerate"}
                </button>
              </div>
              {suggestError && <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">⚠ {suggestError}</div>}
              {suggestLoading ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <svg className="w-8 h-8 text-[#2E75B6] animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <p className="text-sm text-gray-400">Generating questions from material…</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestedQs.length === 0 && !suggestError && (
                    <p className="text-center text-sm text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-xl">No suggestions. Click "Regenerate" or add questions manually.</p>
                  )}
                  {suggestedQs.map((q) => (
                    <div key={q.id} onClick={() => toggleSelect(q.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all select-none ${selectedIds.has(q.id) ? "border-[#2E75B6] bg-blue-50/40" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${selectedIds.has(q.id) ? "bg-[#2E75B6] border-[#2E75B6]" : "border-gray-300 bg-white"}`}>
                          {selectedIds.has(q.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{q.question}</p>
                          <div className="grid grid-cols-2 gap-1.5 mt-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg border ${opt === q.answer ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                                {opt === q.answer ? "✓ " : ""}{opt}
                              </div>
                            ))}
                          </div>
                          {selectedIds.has(q.id) && (
                            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <label className="text-xs text-gray-500">Marks:</label>
                              <input type="number" min="1" max="10" value={q.suggestedMarks || 1} onChange={(e) => updateSuggestedMarks(q.id, e.target.value)}
                                className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2E75B6]"/>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">{selectedIds.size} selected</p>
                <button onClick={() => setStep("build")} className="bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">Next: Build Quiz →</button>
              </div>
            </>
          )}

          {step === "build" && (
            <>
              {selectedIds.size > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">From AI ({selectedIds.size} selected)</p>
                  <div className="space-y-2">
                    {suggestedQs.filter((q) => selectedIds.has(q.id)).map((q, idx) => (
                      <div key={q.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-700">{idx + 1}. {q.question}</p>
                          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">{q.suggestedMarks || 1} mk</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-2 py-1 rounded-lg border ${opt === q.answer ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold" : "bg-white border-gray-200 text-gray-500"}`}>
                              {opt === q.answer ? "✓ " : ""}{opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {customQs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Custom Questions ({customQs.length})</p>
                  <div className="space-y-4">
                    {customQs.map((q, idx) => (
                      <div key={q.id} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question {selectedIds.size + idx + 1}</p>
                          <button onClick={() => removeCustom(q.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                        <textarea placeholder="Enter question text…" value={q.question} onChange={(e) => updateCustom(q.id, "question", e.target.value)} rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] resize-none placeholder-gray-300"/>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <input key={oi} type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={(e) => updateOption(q.id, oi, e.target.value)}
                              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] placeholder-gray-300"/>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex-1 min-w-40">
                            <label className="text-xs text-gray-500 mb-1 block font-medium">Correct Answer *</label>
                            <select value={q.answer} onChange={(e) => updateCustom(q.id, "answer", e.target.value)}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] bg-white">
                              <option value="">Select correct answer…</option>
                              {q.options.filter(Boolean).map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block font-medium">Marks</label>
                            <input type="number" min="1" max="20" value={q.marks} onChange={(e) => updateCustom(q.id, "marks", Number(e.target.value))}
                              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {finalQuestions.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  No questions yet. Go back to select AI suggestions, or add custom questions below.
                </div>
              )}
              <button onClick={addCustom}
                className="w-full border-2 border-dashed border-[#2E75B6]/40 hover:border-[#2E75B6] text-[#2E75B6] text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Custom Question
              </button>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">{finalQuestions.length} questions · {totalMarks} total marks</p>
                <div className="flex gap-2">
                  <button onClick={() => setStep("suggest")} className="text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-2 rounded-xl">← Back</button>
                  <button onClick={() => { const err = validateBuild(); if (err) { alert(err); return; } setStep("details"); }}
                    className="bg-[#1F4E79] hover:bg-[#2E75B6] text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">Next: Publish →</button>
                </div>
              </div>
            </>
          )}

          {step === "details" && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1F4E79]">Quiz Summary</p>
                <p className="text-xs text-gray-500 mt-1">{finalQuestions.length} questions · {totalMarks} total marks</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Answers are hidden from students by default</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Students will submit their answers but won't see their score or correct answers until you click
                    <strong> "Publish Answers"</strong> from the quiz panel. You can do this any time after the deadline.
                  </p>
                </div>
              </div>
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Quiz Title *</label>
                <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] placeholder-gray-300" placeholder="e.g. Chapter 3 Mid-Term Quiz"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description / Instructions (optional)</label>
                <textarea value={quizDesc} onChange={(e) => setQuizDesc(e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] resize-none placeholder-gray-300" placeholder="Any instructions for students…"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Deadline *</label>
                <input type="datetime-local" min={minDeadline} value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"/>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button onClick={() => setStep("build")} className="text-sm text-gray-500 hover:text-gray-700 font-semibold px-4 py-2 rounded-xl">← Back</button>
                <button onClick={handlePublish} disabled={createLoading}
                  className="bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2">
                  {createLoading
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Publishing…</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Publish Quiz</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   TEACHER – Submissions Modal
───────────────────────────────────────────────────────────────────────────── */
const SubmissionsModal = ({ quiz, onClose, onAnswersPublished }) => {
  const [submissions, setSubmissions] = useState([]);
  const [quizMeta, setQuizMeta]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [publishing, setPublishing]   = useState(false);
  const [pubError, setPubError]       = useState("");

  useEffect(() => {
    api.get(`/quiz/${quiz._id}/submissions`)
      .then((r) => { setSubmissions(r.data.submissions); setQuizMeta(r.data.quiz); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quiz._id]);

  const handlePublishAnswers = async () => {
    if (!window.confirm("Publish answers? Students will immediately see their scores and correct answers.")) return;
    setPublishing(true); setPubError("");
    try {
      await api.patch(`/quiz/${quiz._id}/publish-answers`);
      setQuizMeta((prev) => ({ ...prev, answersPublished: true }));
      onAnswersPublished();
    } catch (err) {
      setPubError(err.response?.data?.message || "Failed to publish answers.");
    } finally {
      setPublishing(false);
    }
  };

  const answersPublished = quizMeta?.answersPublished ?? quiz.answersPublished;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Submissions</h2>
            <p className="text-blue-200 text-xs mt-0.5">{quiz.title} · {quiz.totalMarks} total marks</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!answersPublished && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-amber-800">Answers not published yet</p>
                <p className="text-xs text-amber-600 mt-0.5">Students cannot see their scores until you publish.</p>
                {pubError && <p className="text-xs text-red-600 mt-1">{pubError}</p>}
              </div>
              <button onClick={handlePublishAnswers} disabled={publishing}
                className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
                {publishing
                  ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Publishing…</>
                  : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Publish Answers</>}
              </button>
            </div>
          )}
          {answersPublished && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <p className="text-sm font-semibold text-emerald-700">Answers published — students can now view their results.</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="w-7 h-7 text-[#2E75B6] animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No submissions yet</div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</p>
              {submissions.map((s) => (
                <div key={s._id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.studentId?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-400">{s.studentId?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Submitted: {fmtDateTime(s.submittedAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-[#1F4E79]">
                      {s.totalMarksAwarded}<span className="text-gray-400 font-normal text-sm">/{s.totalMarks}</span>
                    </p>
                    <p className={`text-xs font-bold ${s.percentage >= 75 ? "text-emerald-600" : s.percentage >= 50 ? "text-amber-600" : "text-red-500"}`}>
                      {s.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STUDENT – Quiz Taking Modal
   KEY FIX: quiz.answersPublished is the ONLY gate for showing results/answers.
   Students NEVER see scores or correct answers until teacher publishes.
───────────────────────────────────────────────────────────────────────────── */
const StudentQuizModal = ({ quiz, onClose, onSubmitted }) => {
  const [answers, setAnswers]             = useState({});
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [freshResult, setFreshResult]     = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const expired          = quiz.isExpired || new Date(quiz.deadline) < new Date();
  const alreadySubmitted = !!quiz.submission;

  // ── SINGLE SOURCE OF TRUTH ──────────────────────────────────────────────
  // answersPublished MUST be explicitly true. undefined / false / null = hidden.
  const answersPublished = quiz.answersPublished === true;

  // Pending = student has submitted but teacher hasn't published answers yet
  const isPending = alreadySubmitted && !answersPublished;

  // Prior result: ONLY when both conditions are met:
  //   1. student already submitted
  //   2. teacher has published answers (answersPublished === true)
  const priorResult =
    alreadySubmitted &&
    answersPublished &&
    quiz.submission?.totalMarksAwarded !== undefined
      ? {
          totalMarksAwarded: quiz.submission.totalMarksAwarded,
          totalMarks:        quiz.submission.totalMarks,
          percentage:        quiz.submission.percentage,
          questions:         quiz.questions,
          gradedAnswers:     quiz.submission.answers,
        }
      : null;

  // displayResult is NEVER set unless answersPublished === true.
  // freshResult is only populated post-submit when backend confirms answersPublished.
  const displayResult = answersPublished ? (freshResult || priorResult) : null;

  // Show pending banner when submitted but answers not yet published
  const showPendingBanner =
    (alreadySubmitted && !answersPublished) ||
    (justSubmitted && !answersPublished);

  const selectAnswer = (qi, opt) => {
    if (alreadySubmitted || freshResult || expired) return;
    setAnswers((prev) => ({ ...prev, [qi]: opt }));
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) { setError(`Please answer all ${quiz.questions.length} questions.`); return; }
    setSubmitting(true); setError("");
    try {
      const answersArr = Object.entries(answers).map(([idx, opt]) => ({
        questionIndex: Number(idx), selectedOption: opt,
      }));
      const res = await api.post(`/quiz/${quiz._id}/submit`, { answers: answersArr });
      setJustSubmitted(true);
      // Only show result immediately if teacher has ALREADY published answers
      // Backend returns answersPublished: true only in that case
      if (res.data.answersPublished === true && res.data.result) {
        setFreshResult(res.data.result);
      }
      // If answersPublished is false → freshResult stays null → pending banner shows
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionStyle = (opt, qi) => {
    // This function is only called when displayResult is set (answers published)
    const gradedAnswer = displayResult?.gradedAnswers?.[qi];
    const selected     = gradedAnswer?.selectedOption ?? answers[qi];
    const isSelected   = selected === opt;
    const isCorrect    = opt === quiz.questions[qi]?.answer;
    const isWrong      = isSelected && !isCorrect;

    if (isCorrect)   return "bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold";
    if (isWrong)     return "bg-red-50 border-red-400 text-red-600";
    if (isSelected)  return "bg-purple-50 border-purple-400 text-purple-700 font-semibold";
    return "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/30";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-purple-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base truncate">{quiz.title}</h2>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-purple-200 text-xs">{quiz.questions.length} questions · {quiz.totalMarks} marks</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {expired ? "Expired" : `Due: ${fmtDateTime(quiz.deadline)}`}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white ml-3 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Score banner — ONLY when answers are published and result is ready ── */}
          {displayResult && (
            <div className={`border rounded-xl p-4 ${displayResult.percentage >= 75 ? "bg-emerald-50 border-emerald-200" : displayResult.percentage >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
              <p className="text-base font-bold text-gray-800">
                {displayResult.percentage >= 75 ? "🎉 Excellent!" : displayResult.percentage >= 50 ? "👍 Good effort!" : "📚 Keep practising!"}
              </p>
              <p className="mt-1">
                <span className="text-3xl font-black text-gray-800">{displayResult.totalMarksAwarded}</span>
                <span className="text-gray-400 text-base"> / {displayResult.totalMarks} marks</span>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {displayResult.percentage}% · {displayResult.gradedAnswers?.filter((a) => a.isCorrect).length} correct out of {displayResult.questions?.length}
              </p>
              {alreadySubmitted && quiz.submission?.submittedAt && (
                <p className="text-xs text-gray-400 mt-1">Submitted: {fmtDateTime(quiz.submission.submittedAt)}</p>
              )}
            </div>
          )}

          {/* ── Pending banner — submitted but teacher hasn't published answers yet ── */}
          {showPendingBanner && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <p className="text-sm font-bold text-blue-800">
                  {justSubmitted ? "Quiz submitted successfully!" : "Already submitted"}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Your answers have been saved. Your score and correct answers will be visible once your teacher publishes the results.
                </p>
              </div>
            </div>
          )}

          {/* ── Questions ── */}
          <div className="space-y-5">
            {quiz.questions.map((q, qi) => {
              // In pending mode: show which option the student picked, no correct/wrong colouring
              const submittedOption = alreadySubmitted && quiz.submission?.answers?.[qi]?.selectedOption;
              // pendingMode = submitted but answers not published (hide correct/wrong)
              const pendingMode = isPending || (justSubmitted && !answersPublished);

              return (
                <div key={qi} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {qi + 1}. {q.question}
                    <span className="ml-2 text-xs text-gray-400 font-normal">({q.marks || 1} mark)</span>
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = pendingMode
                        ? opt === submittedOption
                        : (displayResult?.gradedAnswers?.[qi]?.selectedOption ?? answers[qi]) === opt;

                      let cls = "";
                      if (pendingMode) {
                        // Only highlight what the student selected — no green/red
                        cls = isSelected
                          ? "bg-purple-50 border-purple-300 text-purple-700 font-semibold cursor-default"
                          : "bg-gray-50 border-gray-200 text-gray-500 cursor-default";
                      } else if (displayResult) {
                        // Answers published — show correct/wrong with colours
                        cls = `${getOptionStyle(opt, qi)} cursor-default`;
                      } else {
                        // Active quiz — interactive
                        cls = `${isSelected ? "bg-purple-50 border-purple-400 text-purple-700 font-semibold" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/30"} cursor-pointer`;
                      }

                      return (
                        <button key={oi}
                          onClick={() => selectAnswer(qi, opt)}
                          disabled={!!displayResult || expired || alreadySubmitted}
                          className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all ${cls}`}>
                          {opt}
                          {/* Only show ✓/✗ markers when answers are published */}
                          {displayResult && opt === q.answer && " ✓"}
                          {displayResult && displayResult.gradedAnswers?.[qi]?.selectedOption === opt && opt !== q.answer && " ✗"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
        </div>

        {/* Submit button — only when not yet submitted and not expired */}
        {!alreadySubmitted && !justSubmitted && !expired && (
          <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0 bg-gray-50/60">
            <p className="text-xs text-gray-500">{Object.keys(answers).length}/{quiz.questions.length} answered</p>
            <button onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < quiz.questions.length}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
              {submitting
                ? <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Submitting…</>
                : "Submit Quiz"}
            </button>
          </div>
        )}

        {/* Close button */}
        {(displayResult || expired || alreadySubmitted || justSubmitted) && (
          <div className="border-t border-gray-100 px-5 py-4 flex justify-end flex-shrink-0">
            <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Classroom-wide Quiz Board (Students – Quizzes tab)
   KEY FIX: resultReady and pendingResult use quiz.answersPublished — not
   submission.pending — as the single source of truth.
───────────────────────────────────────────────────────────────────────────── */
export const StudentQuizBoard = ({ classroomId }) => {
  const [quizzes, setQuizzes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quiz/classroom/${classroomId}`);
      setQuizzes(res.data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <svg className="w-7 h-7 text-purple-500 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
  );

  if (quizzes.length === 0) return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
      </div>
      <p className="text-gray-500 text-sm font-medium">No quizzes yet</p>
      <p className="text-gray-400 text-xs mt-1">Your teacher hasn't published any quizzes yet</p>
    </div>
  );

  const active    = quizzes.filter((q) => !q.isExpired && !q.submission);
  const submitted = quizzes.filter((q) => !!q.submission);
  const expired   = quizzes.filter((q) => q.isExpired && !q.submission);

  const QuizCard = ({ q }) => {
    // KEY FIX: quiz.answersPublished is the single source of truth
    const resultReady   = !!q.submission && q.answersPublished === true;
    const pendingResult = !!q.submission && q.answersPublished !== true;

    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                resultReady   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                pendingResult ? "bg-blue-50 text-blue-700 border-blue-200" :
                q.isExpired   ? "bg-gray-100 text-gray-500 border-gray-200" :
                                "bg-green-50 text-green-700 border-green-200"
              }`}>
                {resultReady ? "Result Ready" : pendingResult ? "Submitted – Pending" : q.isExpired ? "Expired" : "Active"}
              </span>
              {q.materialId?.title && <span className="text-[11px] text-gray-400 truncate max-w-[150px]">📄 {q.materialId.title}</span>}
            </div>
            <p className="font-semibold text-gray-800 text-sm">{q.title}</p>
            {q.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{q.description}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-gray-400">🕐 Due: {fmtDateTime(q.deadline)}</span>
              <span className="text-xs text-gray-400">{q.questions.length} Qs · {q.totalMarks} marks</span>
              {resultReady && (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ {q.submission.totalMarksAwarded}/{q.submission.totalMarks} ({q.submission.percentage}%)
                </span>
              )}
              {pendingResult && (
                <span className="text-xs text-blue-500 font-medium">⏳ Awaiting teacher to publish answers</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {!q.submission && !q.isExpired && (
              <button onClick={() => setActiveQuiz(q)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">Take Quiz</button>
            )}
            {resultReady && (
              <button onClick={() => setActiveQuiz(q)} className="border border-purple-200 text-purple-600 hover:bg-purple-50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors">View Result</button>
            )}
            {pendingResult && (
              <button onClick={() => setActiveQuiz(q)} className="border border-blue-200 text-blue-500 hover:bg-blue-50 text-xs font-semibold px-4 py-2 rounded-xl transition-colors">View Submission</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {active.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active ({active.length})</p>
          <div className="space-y-3">{active.map((q) => <QuizCard key={q._id} q={q} />)}</div>
        </div>
      )}
      {submitted.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Submitted ({submitted.length})</p>
          <div className="space-y-3">{submitted.map((q) => <QuizCard key={q._id} q={q} />)}</div>
        </div>
      )}
      {expired.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Missed / Expired ({expired.length})</p>
          <div className="space-y-3">{expired.map((q) => <QuizCard key={q._id} q={q} />)}</div>
        </div>
      )}
      {activeQuiz && <StudentQuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmitted={load} />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Per-material quiz panel
   KEY FIX: resultReady and pendingResult use quiz.answersPublished as
   the single source of truth — not submission.pending.
───────────────────────────────────────────────────────────────────────────── */
const MaterialQuizPanel = ({ material, classroomId, userRole, allQuizzes, onRefresh, onCreateQuiz }) => {
  const [expanded, setExpanded]                           = useState(false);
  const [activeStudentQuiz, setActiveStudentQuiz]         = useState(null);
  const [activeSubmissionsQuiz, setActiveSubmissionsQuiz] = useState(null);

  const matQuizzes = allQuizzes.filter((q) => q.materialId?._id === material._id || q.materialId === material._id);
  const hasActive  = matQuizzes.some((q) => !q.isExpired && !q.submission);

  return (
    <div className={`border-t px-5 py-3 ${hasActive && userRole === "Student" ? "border-purple-100 bg-purple-50/20" : "border-gray-50 bg-gray-50/30"}`}>
      <button onClick={() => setExpanded((v) => !v)}
        className={`flex items-center gap-2 text-xs font-semibold transition-colors ${hasActive && userRole === "Student" ? "text-purple-600 hover:text-purple-800" : "text-indigo-500 hover:text-indigo-700"}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
        {hasActive && userRole === "Student"
          ? `🔔 Quiz Available (${matQuizzes.filter((q) => !q.isExpired && !q.submission).length})`
          : `Quizzes${matQuizzes.length > 0 ? ` (${matQuizzes.length})` : ""}`}
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {matQuizzes.length === 0 ? (
            <p className="text-xs text-gray-400 py-1">{userRole === "Teacher" ? "No quizzes yet for this material." : "No quizzes for this material."}</p>
          ) : (
            matQuizzes.map((q) => {
              // KEY FIX: quiz.answersPublished is the single source of truth
              const resultReady   = !!q.submission && q.answersPublished === true;
              const pendingResult = !!q.submission && q.answersPublished !== true;

              return (
                <div key={q._id} className="bg-white border border-indigo-100 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{q.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        resultReady   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        pendingResult ? "bg-blue-50 text-blue-600 border-blue-200" :
                        q.isExpired   ? "bg-gray-100 text-gray-500 border-gray-200" :
                                        "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {resultReady ? "Result Ready" : pendingResult ? "Pending" : q.isExpired ? "Expired" : "Active"}
                      </span>
                      <span className="text-[11px] text-gray-400">Due: {fmtDateTime(q.deadline)}</span>
                      <span className="text-[11px] text-gray-400">{q.questions.length} Qs · {q.totalMarks} marks</span>
                      {userRole === "Teacher" && (
                        <>
                          <span className="text-[11px] text-indigo-500 font-semibold">{q.submissionCount || 0} submissions</span>
                          {!q.answersPublished && <span className="text-[11px] text-amber-500 font-semibold">Answers hidden</span>}
                          {q.answersPublished  && <span className="text-[11px] text-emerald-600 font-semibold">Answers published</span>}
                        </>
                      )}
                      {resultReady && userRole === "Student" && (
                        <span className="text-[11px] font-bold text-emerald-600">✓ {q.submission.totalMarksAwarded}/{q.submission.totalMarks} ({q.submission.percentage}%)</span>
                      )}
                      {pendingResult && userRole === "Student" && (
                        <span className="text-[11px] text-blue-500">⏳ Score pending</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {userRole === "Teacher" && (
                      <button onClick={() => setActiveSubmissionsQuiz(q)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-all">
                        Results
                      </button>
                    )}
                    {userRole === "Student" && !q.submission && !q.isExpired && (
                      <button onClick={() => setActiveStudentQuiz(q)} className="text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors">Take Quiz</button>
                    )}
                    {userRole === "Student" && resultReady && (
                      <button onClick={() => setActiveStudentQuiz(q)} className="text-xs font-semibold text-purple-600 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg">View Result</button>
                    )}
                    {userRole === "Student" && pendingResult && (
                      <button onClick={() => setActiveStudentQuiz(q)} className="text-xs font-semibold text-blue-500 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg">View Submission</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {userRole === "Teacher" && (
            <button onClick={() => onCreateQuiz(material)}
              className="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-600 text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New Quiz
            </button>
          )}
        </div>
      )}

      {activeStudentQuiz     && <StudentQuizModal quiz={activeStudentQuiz}     onClose={() => setActiveStudentQuiz(null)}     onSubmitted={onRefresh} />}
      {activeSubmissionsQuiz && <SubmissionsModal  quiz={activeSubmissionsQuiz} onClose={() => setActiveSubmissionsQuiz(null)} onAnswersPublished={onRefresh} />}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const StudyMaterials = ({ classroomId }) => {
  const { user }     = useAuth();
  const fileInputRef = useRef(null);

  const [materials, setMaterials]           = useState([]);
  const [quizzes, setQuizzes]               = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [search, setSearch]                 = useState("");
  const [filterType, setFilterType]         = useState("all");
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [file, setFile]                     = useState(null);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState("");
  const [loading, setLoading]               = useState(false);
  const [summary, setSummary]               = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMaterialId, setSummaryMaterialId]   = useState(null);
  const [quizCreatorMaterial, setQuizCreatorMaterial] = useState(null);

  useEffect(() => { fetchMaterials(); fetchQuizzes(); }, [classroomId]); // eslint-disable-line

  const fetchMaterials = async () => {
    try { const res = await api.get(`/materials/${classroomId}`); setMaterials(res.data.materials); }
    catch (err) { console.error(err); }
  };

  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try { const res = await api.get(`/quiz/classroom/${classroomId}`); setQuizzes(res.data.quizzes); }
    catch (err) { console.error(err); }
    finally { setQuizzesLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!file || !title) { setError("Title and file are required"); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file); formData.append("title", title);
      formData.append("description", description); formData.append("classroomId", classroomId);
      await api.post("/materials/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Material uploaded successfully!");
      setTitle(""); setDescription(""); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMaterials();
    } catch (err) { setError(err.response?.data?.message || "Upload failed"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Delete this material? This cannot be undone.")) return;
    try { await api.delete("/materials/" + materialId); setSuccess("Material deleted."); fetchMaterials(); }
    catch (err) { setError(err.response?.data?.message || "Delete failed"); }
  };

  const handleSummarize = async (materialId) => {
    setSummaryLoading(true); setSummaryMaterialId(materialId); setSummary("");
    try { const res = await api.post("/summarize", { materialId }); setSummary(res.data.summary); }
    catch (err) { setSummary(err.response?.data?.message || "Failed to summarize"); }
    finally { setSummaryLoading(false); }
  };

  const filtered = materials
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => filterType === "all" || (m.fileType || "").toLowerCase() === filterType);

  const uniqueTypes      = [...new Set(materials.map((m) => (m.fileType || "").toLowerCase()).filter(Boolean))];
  const pendingQuizCount = quizzes.filter((q) => !q.isExpired && !q.submission).length;

  return (
    <div className="space-y-5">
      {user.role === "Student" && pendingQuizCount > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-purple-800">{pendingQuizCount} quiz{pendingQuizCount !== 1 ? "zes" : ""} waiting for you</p>
            <p className="text-xs text-purple-500 mt-0.5">Look for the 🔔 badge on materials below, or check the Quizzes tab.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input type="text" placeholder="Search materials…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] transition-all placeholder-gray-400 bg-white"/>
        </div>
        {uniqueTypes.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => setFilterType("all")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${filterType === "all" ? "bg-[#1F4E79] text-white border-[#1F4E79]" : "bg-white text-gray-500 border-gray-200 hover:border-[#2E75B6]"}`}>All</button>
            {uniqueTypes.map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border uppercase transition-colors ${filterType === t ? "bg-[#1F4E79] text-white border-[#1F4E79]" : "bg-white text-gray-500 border-gray-200 hover:border-[#2E75B6]"}`}>{t}</button>
            ))}
          </div>
        )}
      </div>

      {user.role === "Teacher" && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1F4E79] to-[#2E75B6] px-5 py-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <h3 className="text-white font-semibold text-sm">Upload Study Material</h3>
          </div>
          <form onSubmit={handleUpload} className="px-5 py-5 space-y-4">
            {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            {success && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{success}</div>}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title *</label>
              <input type="text" placeholder="e.g. Chapter 3 – Data Structures" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] placeholder-gray-300"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (optional)</label>
              <textarea placeholder="Brief description…" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] resize-none placeholder-gray-300"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">File *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-[#2E75B6] transition-colors">
                <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} ref={fileInputRef}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer"/>
                {file && <p className="text-xs text-[#2E75B6] mt-2 font-medium">✓ {file.name}</p>}
                <p className="text-xs text-gray-400 mt-1">PDF, PPT, PPTX, DOC, DOCX</p>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1F4E79] hover:bg-[#2E75B6] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Uploading…</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Material</>}
            </button>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-[#2E75B6] opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">No materials found</p>
          <p className="text-gray-400 text-xs mt-1">{search || filterType !== "all" ? "Try different search/filter" : user.role === "Teacher" ? "Upload your first material above" : "No materials uploaded yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">{fileTypeIcon(m.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{m.title}</p>
                  {m.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{m.description}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${fileTypeBadge(m.fileType)}`}>{m.fileType}</span>
                    {m.createdAt && <span className="text-[11px] text-gray-400">{fmtDate(m.createdAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={getViewerUrl(m.fileUrl, m.fileType)} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-white hover:bg-[#1F4E79] border border-[#1F4E79]/30 hover:border-[#1F4E79] px-3 py-1.5 rounded-lg transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                  </a>
                  <a href={`${import.meta.env.VITE_API_URL}/api/download/${m._id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg transition-all">
                    Download
                  </a>
                  {user.role === "Teacher" && (
                    <>
                      <button onClick={() => setQuizCreatorMaterial(m)}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                        Quiz
                      </button>
                      <button onClick={() => handleDelete(m._id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {user.role === "Student" && (
                <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/60">
                  <button
                    onClick={() => summaryMaterialId === m._id && summary ? (setSummaryMaterialId(null), setSummary("")) : handleSummarize(m._id)}
                    disabled={summaryLoading && summaryMaterialId === m._id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] disabled:opacity-60 transition-colors">
                    {summaryLoading && summaryMaterialId === m._id
                      ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Summarizing…</>
                      : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        {summaryMaterialId === m._id && summary ? "Hide Summary" : "AI Summarize"}</>}
                  </button>
                  {summaryMaterialId === m._id && summary && (
                    <div className="mt-3 bg-white border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg className="w-3.5 h-3.5 text-[#2E75B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        <p className="text-xs font-bold text-[#1F4E79] uppercase tracking-wider">AI Summary</p>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{summary}</p>
                    </div>
                  )}
                </div>
              )}

              <MaterialQuizPanel material={m} classroomId={classroomId} userRole={user.role}
                allQuizzes={quizzes} onRefresh={fetchQuizzes} onCreateQuiz={(mat) => setQuizCreatorMaterial(mat)}/>
            </div>
          ))}
        </div>
      )}

      {quizCreatorMaterial && (
        <QuizCreatorModal material={quizCreatorMaterial} classroomId={classroomId}
          onClose={() => setQuizCreatorMaterial(null)}
          onCreated={() => { fetchQuizzes(); setSuccess("Quiz published! Students can now see it."); setTimeout(() => setSuccess(""), 4000); }}/>
      )}
    </div>
  );
};

export default StudyMaterials;