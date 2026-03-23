import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StudyMaterials from "./StudyMaterials";
import Assignments from "./Assignments";
import Chat from "./Chat";

const ClassroomView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    fetchClassroom();
  }, [id]);

  const fetchClassroom = async () => {
    try {
      const res = await api.get(`/classroom/${id}`);
      setClassroom(res.data.classroom);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Join my classroom "${classroom.name}" on ClassVerse!\n\nSubject: ${classroom.subject}\nJoin Code: *${classroom.joinCode}*\n\nEnter this code on ClassVerse to join.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareSMS = () => {
    const msg = encodeURIComponent(
      `Join my classroom "${classroom.name}" on ClassVerse! Subject: ${classroom.subject}. Join Code: ${classroom.joinCode}`
    );
    window.open(`sms:?body=${msg}`, "_blank");
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join ${classroom.name} on ClassVerse`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to invite you to join my classroom on ClassVerse.\n\nClassroom: ${classroom.name}\nSubject: ${classroom.subject}\nJoin Code: ${classroom.joinCode}\n\nOpen ClassVerse and enter the code above to join.\n\nSee you there!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    setShowShareMenu(false);
  };

  if (!classroom)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-[#2E75B6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-gray-500 text-sm font-medium">Loading classroom…</p>
        </div>
      </div>
    );

  const tabs = [
    {
      key: "materials",
      label: "Materials",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      key: "chat",
      label: "Discussion",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1F4E79] shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div>
                <h1 className="text-white text-xl font-bold leading-tight">{classroom.name}</h1>
                <p className="text-blue-200 text-xs mt-0.5">{classroom.subject}</p>
              </div>
            </div>

            {/* Right: Join code + share (Teacher only) */}
            <div className="flex items-center gap-3">
              {user.role === "Teacher" && (
                <div className="flex items-center gap-2">
                  {/* Code badge */}
                  <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" />
                    </svg>
                    <span className="text-white font-bold text-sm tracking-widest">{classroom.joinCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="ml-1 text-blue-200 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      {codeCopied ? (
                        <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Share button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-1.5 bg-white text-[#1F4E79] hover:bg-blue-50 font-semibold text-xs px-3 py-2 rounded-xl shadow-sm transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Share
                    </button>

                    {showShareMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                        <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-52">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Share Class Code</p>
                          </div>
                          <button
                            onClick={handleShareWhatsApp}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.133 1.535 5.868L.057 23.854c-.059.23.007.473.174.641a.51.51 0 0 0 .502.132l6.254-1.637A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.899 0-3.67-.516-5.181-1.413l-.371-.22-3.854 1.011 1.028-3.744-.242-.384A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">WhatsApp</p>
                              <p className="text-xs text-gray-400">Send via WhatsApp</p>
                            </div>
                          </button>
                          <button
                            onClick={handleShareSMS}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#2E75B6] flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">SMS</p>
                              <p className="text-xs text-gray-400">Send via text message</p>
                            </div>
                          </button>
                          <button
                            onClick={handleShareEmail}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Email</p>
                              <p className="text-xs text-gray-400">Send via email</p>
                            </div>
                          </button>
                          <button
                            onClick={handleCopyCode}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{codeCopied ? "Copied!" : "Copy Code"}</p>
                              <p className="text-xs text-gray-400">Copy to clipboard</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Student: show teacher name */}
              {user.role === "Student" && classroom.teacherId && (
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {classroom.teacherId?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-blue-100 text-xs font-medium">{classroom.teacherId?.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-gray-50 text-[#1F4E79]"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === "materials" && <StudyMaterials classroomId={id} />}
        {activeTab === "assignments" && <Assignments classroomId={id} />}
        {activeTab === "chat" && <Chat classroomId={id} />}
      </div>
    </div>
  );
};

export default ClassroomView;