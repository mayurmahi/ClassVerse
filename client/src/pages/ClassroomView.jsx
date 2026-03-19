import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StudyMaterials from "./StudyMaterials";
import Assignments from "./Assignments";
import Chat from "./Chat";

const ClassroomView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState("materials");

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

  if (!classroom) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">{classroom.name}</h1>
      <p className="text-gray-500">{classroom.subject}</p>

      {/* Tabs */}
      <div className="flex gap-4 mt-4 border-b">
        {["materials", "assignments", "chat"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "materials" && (
          <StudyMaterials classroomId={id} />
        )}
        {activeTab === "assignments" && (
          <Assignments classroomId={id} />
        )}
        {activeTab === "chat" && (
          <Chat classroomId={id} />
        )}
      </div>
    </div>
  );
};

export default ClassroomView;