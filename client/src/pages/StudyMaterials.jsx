// import { useEffect, useState, useRef } from "react";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";


// const StudyMaterials = ({ classroomId }) => {
//     const { user } = useAuth();
//     const fileInputRef = useRef(null);
//     const [materials, setMaterials] = useState([]);
//     const [search, setSearch] = useState("");
//     const [title, setTitle] = useState("");
//     const [file, setFile] = useState(null);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [loading, setLoading] = useState(false);

//     const [summary, setSummary] = useState("");
//     const [summaryLoading, setSummaryLoading] = useState(false);
//     const [summaryMaterialId, setSummaryMaterialId] = useState(null);

//     useEffect(() => {
//         fetchMaterials();
//     }, [classroomId]);

//     const fetchMaterials = async () => {
//         try {
//             const res = await api.get(`/materials/${classroomId}`);
//             setMaterials(res.data.materials);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const handleUpload = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");

//         if (!file || !title) {
//             setError("Title and file are required");
//             return;
//         }
//         setLoading(true);
//         try {
//             const formData = new FormData();
//             formData.append("file", file);
//             formData.append("title", title);
//             formData.append("classroomId", classroomId);
//             await api.post("/materials/upload", formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             setSuccess("Material uploaded successfully");
//             setTitle("");
//             setFile(null);
//             fileInputRef.current.value = "";
//             fetchMaterials();
//         } catch (err) {
//             setError(err.response?.data?.message || "Upload failed");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filtered = materials.filter((m) =>
//         m.title.toLowerCase().includes(search.toLowerCase())
//     );

//     const handleSummarize = async (materialId) => {
//         setSummaryLoading(true);
//         setSummaryMaterialId(materialId);
//         setSummary("");
//         try {
//             const res = await api.post("/summarize", { materialId });
//             setSummary(res.data.summary);
//         } catch (err) {
//             setSummary(err.response?.data?.message || "Failed to summarize");
//         } finally {
//             setSummaryLoading(false);
//         }
//     };

//     return (
//         <div>
//             <input
//                 type="text"
//                 placeholder="Search materials..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="border px-3 py-2 rounded w-full mb-4"
//             />

//             {user.role === "Teacher" && (
//                 <form onSubmit={handleUpload} className="mb-4 p-4 border rounded">
//                     <h3 className="font-bold mb-2">Upload Material</h3>
//                     {error && <p className="text-red-500 text-sm">{error}</p>}
//                     {success && <p className="text-green-500 text-sm">{success}</p>}
//                     <input
//                         type="text"
//                         placeholder="Material title"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         className="border px-3 py-2 rounded w-full mb-2"
//                     />
//                     <input
//                         type="file"
//                         accept=".pdf,.ppt,.pptx"
//                         onChange={(e) => setFile(e.target.files[0])}
//                         ref={fileInputRef}
//                         className="mb-2"
//                     />
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="bg-blue-700 text-white px-4 py-2 rounded"
//                     >
//                         {loading ? "Uploading..." : "Upload"}
//                     </button>
//                 </form>
//             )}

//             {filtered.length === 0 ? (
//                 <p className="text-gray-500">No materials found</p>
//             ) : (
//                 <ul className="space-y-2">
//                     {filtered.map((m) => (
//                         <li key={m._id} className="border rounded p-3 flex justify-between items-center">
//                             <div>
//                                 <p className="font-medium">{m.title}</p>
//                                 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{m.fileType}</span>
//                             </div>

//                             <a href={"http://localhost:5000/uploads/" + m.filePath}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="text-blue-600 text-sm underline"
//                             >
//                                 View
//                             </a>

                            
//                     {user.role === "Student" && (
//                         <div className="mt-2">
//                             <button
//                                 onClick={() => handleSummarize(m._id)}
//                                 disabled={summaryLoading && summaryMaterialId === m._id}
//                                 className="text-blue-600 text-sm underline"
//                             >
//                                 {summaryLoading && summaryMaterialId === m._id
//                                     ? "Summarizing..."
//                                     : "Summarize"}
//                             </button>
//                             {summaryMaterialId === m._id && summary && (
//                                 <div className="mt-2 p-3 bg-gray-50 border rounded text-sm">
//                                     <p className="font-bold mb-1">Summary:</p>
//                                     <p>{summary}</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                         </li>
//                     ))}

//                 </ul>
//             )
//             }
//         </div >
//     );
// };

// export default StudyMaterials;



import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudyMaterials = ({ classroomId }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMaterialId, setSummaryMaterialId] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/materials/${classroomId}`);
      setMaterials(res.data.materials);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!file || !title) {
      setError("Title and file are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("classroomId", classroomId);
      await api.post("/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Material uploaded successfully");
      setTitle("");
      setFile(null);
      fileInputRef.current.value = "";
      fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

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

  // file type badge color
  const fileTypeBadge = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "pdf")  return "bg-red-50 text-red-600 border border-red-100";
    if (t === "ppt" || t === "pptx") return "bg-orange-50 text-orange-600 border border-orange-100";
    return "bg-blue-50 text-[#1F4E79] border border-blue-100";
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
    return (
      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    );
  };

  return (
    <div className="space-y-5">

      {/* ── Search bar ── */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search materials…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-white"
        />
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Material Title
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 3 – Data Structures"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent transition-all duration-200 placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                File (PDF / PPT / PPTX)
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 hover:border-[#2E75B6] transition-colors duration-200">
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={fileInputRef}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F4E79] file:text-white hover:file:bg-[#2E75B6] file:cursor-pointer file:transition-colors"
                />
                {file && (
                  <p className="text-xs text-[#2E75B6] mt-2 font-medium">✓ {file.name}</p>
                )}
              </div>
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
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload Material
                </>
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
            {search ? "Try a different search term" : "No materials uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m._id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4">
                {/* File icon */}
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {fileTypeIcon(m.fileType)}
                </div>

                {/* Title + badge */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{m.title}</p>
                  <span className={`inline-block mt-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md ${fileTypeBadge(m.fileType)}`}>
                    {m.fileType}
                  </span>
                </div>

                {/* View button */}
                <a
                  href={"http://localhost:5000/uploads/" + m.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:text-white hover:bg-[#1F4E79] border border-[#1F4E79]/30 hover:border-[#1F4E79] px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </a>
              </div>

              {/* ── Student Summarize ── */}
              {user.role === "Student" && (
                <div className="border-t border-gray-50 px-5 py-3 bg-gray-50/60">
                  <button
                    onClick={() => handleSummarize(m._id)}
                    disabled={summaryLoading && summaryMaterialId === m._id}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#2E75B6] hover:text-[#1F4E79] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {summaryLoading && summaryMaterialId === m._id ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Summarizing…
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        AI Summarize
                      </>
                    )}
                  </button>

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