import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [activeTab, setActiveTab] = useState("organizations");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [orgForm, setOrgForm] = useState({
    collegeName: "",
    emailDomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchOrganizations();
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

  const fetchOrganizations = async () => {
    try {
      const res = await api.get("/admin/organizations");
      setOrganizations(res.data.organizations);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveUser = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    setError(""); setSuccess("");
    try {
      await api.delete("/admin/users/" + id);
      setSuccess("User removed successfully");
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove user");
    }
  };

  const handleAddOrg = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setAddLoading(true);
    try {
      await api.post("/admin/organizations", orgForm);
      setSuccess("Organization and admin account created successfully");
      setOrgForm({ collegeName: "", emailDomain: "", adminName: "", adminEmail: "", adminPassword: "" });
      setShowAddOrg(false);
      fetchOrganizations();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add organization");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteOrg = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and ALL its users and classrooms? This cannot be undone.`)) return;
    setError(""); setSuccess("");
    try {
      await api.delete("/admin/organizations/" + id);
      setSuccess("Organization removed successfully");
      fetchOrganizations();
      fetchStats();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete organization");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1F4E79]">ClassVerse</h1>
          <p className="text-xs text-gray-400">Super Admin Panel</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="p-6">
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">{success}</p>}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {[
              { label: "Total Users", value: stats.totalUsers },
              { label: "Organizations", value: stats.totalOrganizations },
              { label: "Classrooms", value: stats.totalClassrooms },
              { label: "Admins", value: stats.totalAdmins },
              { label: "Teachers", value: stats.totalTeachers },
              { label: "Students", value: stats.totalStudents },
            ].map((s) => (
              <div key={s.label} className="bg-white border rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#1F4E79]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-5 border-b">
          {["organizations", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 capitalize text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-[#1F4E79] text-[#1F4E79]"
                  : "text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <div>
            {/* Add Organization Button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[#1F4E79]">Registered Organizations</h2>
              <button
                onClick={() => setShowAddOrg(!showAddOrg)}
                className="bg-[#1F4E79] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E75B6]"
              >
                + Add Organization
              </button>
            </div>

            {/* Add Organization Form */}
            {showAddOrg && (
              <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="font-bold text-[#1F4E79] mb-4">Add New Organization</h3>
                <form onSubmit={handleAddOrg} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">College Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Vishwakarma Institute of IT"
                        value={orgForm.collegeName}
                        onChange={(e) => setOrgForm({ ...orgForm, collegeName: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Email Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. viit.ac.in"
                        value={orgForm.emailDomain}
                        onChange={(e) => setOrgForm({ ...orgForm, emailDomain: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Admin Name</label>
                      <input
                        type="text"
                        placeholder="Admin's full name"
                        value={orgForm.adminName}
                        onChange={(e) => setOrgForm({ ...orgForm, adminName: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Admin Email</label>
                      <input
                        type="email"
                        placeholder="admin@viit.ac.in"
                        value={orgForm.adminEmail}
                        onChange={(e) => setOrgForm({ ...orgForm, adminEmail: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Admin Password</label>
                      <input
                        type="password"
                        placeholder="Set a password for admin"
                        value={orgForm.adminPassword}
                        onChange={(e) => setOrgForm({ ...orgForm, adminPassword: e.target.value })}
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="bg-[#1F4E79] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#2E75B6] disabled:opacity-60"
                    >
                      {addLoading ? "Creating..." : "Create Organization"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddOrg(false)}
                      className="border text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Organizations Table */}
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#1F4E79] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">College Name</th>
                    <th className="px-4 py-3 text-left">Email Domain</th>
                    <th className="px-4 py-3 text-left">Admin</th>
                    <th className="px-4 py-3 text-left">Registered On</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                        No organizations yet. Add one above.
                      </td>
                    </tr>
                  ) : (
                    organizations.map((org, i) => (
                      <tr key={org._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-4 py-3 font-medium">{org.name}</td>
                        <td className="px-4 py-3 text-gray-500">@{org.emailDomain}</td>
                        <td className="px-4 py-3">{org.adminId?.name || "—"}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteOrg(org._id, org.name)}
                            className="text-red-500 text-xs font-medium underline hover:text-red-700"
                          >
                            Remove Org
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b">
              <h2 className="font-bold text-[#1F4E79]">All Users</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#1F4E79] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Organization</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        u.role === "SuperAdmin" ? "bg-purple-100 text-purple-700"
                        : u.role === "Admin" ? "bg-blue-100 text-blue-700"
                        : u.role === "Teacher" ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.organizationId?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== "SuperAdmin" && (
                        <button
                          onClick={() => handleRemoveUser(u._id)}
                          className="text-red-500 text-xs underline hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;