import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    setError(""); setSuccess("");
    try {
      await api.delete("/admin/users/" + id);
      setSuccess("User removed successfully");
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1F4E79]">Admin Dashboard</h1>
          <p className="text-xs text-gray-400">Managing your organization</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="p-6">
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users", value: stats.totalUsers },
              { label: "Classrooms", value: stats.totalClassrooms },
              { label: "Teachers", value: stats.totalTeachers },
              { label: "Students", value: stats.totalStudents },
            ].map((s) => (
              <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-[#1F4E79]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold text-[#1F4E79]">Users in Your Organization</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#1F4E79] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-400">
                    No users in your organization yet
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.role === "Teacher"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(u._id)}
                        className="text-red-500 text-xs underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;