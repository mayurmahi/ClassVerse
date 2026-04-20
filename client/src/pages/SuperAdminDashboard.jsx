import { useEffect, useState, useMemo } from "react";
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

  // Search & filter state
  const [orgSearch, setOrgSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(""); // for filtering users by org

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

  // --- NAYA LOGIC: Users ko filter karne ke liye ---
  const filteredUsers = selectedOrgId
    ? users.filter((u) => u.organizationId?._id === selectedOrgId)
    : users;

  const handleRemoveUser = async (id) => {
    if (!window.confirm("Remove this user?")) return;
    setError("");
    setSuccess("");
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
    setError("");
    setSuccess("");
    setAddLoading(true);
    try {
      await api.post("/admin/organizations", orgForm);
      setSuccess("Organization and admin account created successfully");
      setOrgForm({
        collegeName: "",
        emailDomain: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
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
    if (
      !window.confirm(
        `Delete "${name}" and ALL its users and classrooms? This cannot be undone.`
      )
    )
      return;
    setError("");
    setSuccess("");
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

  // Filtered & sorted organizations
  const filteredOrganizations = useMemo(() => {
    const q = orgSearch.toLowerCase();
    return organizations.filter(
      (org) =>
        org.name?.toLowerCase().includes(q) ||
        org.emailDomain?.toLowerCase().includes(q) ||
        org.adminId?.name?.toLowerCase().includes(q)
    );
  }, [organizations, orgSearch]);

  // Filtered & sorted users — sorted by organization name, then filtered by search + org dropdown
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users
      .filter((u) => {
        const matchesSearch =
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q) ||
          u.organizationId?.name?.toLowerCase().includes(q);
        const matchesOrg = selectedOrg
          ? u.organizationId?._id === selectedOrg || u.organizationId?.name === selectedOrg
          : true;
        return matchesSearch && matchesOrg;
      })
      .sort((a, b) => {
        const orgA = a.organizationId?.name || "zzz"; // push no-org users to bottom
        const orgB = b.organizationId?.name || "zzz";
        return orgA.localeCompare(orgB);
      });
  }, [users, userSearch, selectedOrg]);

  // Unique orgs from users list for the filter dropdown
  const orgOptions = useMemo(() => {
    const seen = new Map();
    users.forEach((u) => {
      if (u.organizationId?._id && !seen.has(u.organizationId._id)) {
        seen.set(u.organizationId._id, u.organizationId.name);
      }
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [users]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#1F4E79]">OptimalPadho</h1>
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
        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
            {success}
          </p>
        )}

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
              <div
                key={s.label}
                className="bg-white border rounded-xl p-4 text-center shadow-sm"
              >
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

        {/* ── Organizations Tab ── */}
        {activeTab === "organizations" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="font-bold text-[#1F4E79]">Registered Organizations</h2>

              <div className="flex gap-2 w-full sm:w-auto">
                {/* Search bar */}
                <div className="relative flex-1 sm:w-64">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search organizations…"
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                  />
                </div>

                <button
                  onClick={() => setShowAddOrg(!showAddOrg)}
                  className="bg-[#1F4E79] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E75B6] whitespace-nowrap"
                >
                  + Add Organization
                </button>
              </div>
            </div>

            {showAddOrg && (
              <div className="bg-white border rounded-xl p-5 mb-5 shadow-sm">
                <h3 className="font-bold text-[#1F4E79] mb-4">
                  Add New Organization
                </h3>
                <form onSubmit={handleAddOrg} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">
                        College Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. VIT"
                        value={orgForm.collegeName}
                        onChange={(e) =>
                          setOrgForm({ ...orgForm, collegeName: e.target.value })
                        }
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">
                        Email Domain
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. vit.edu"
                        value={orgForm.emailDomain}
                        onChange={(e) =>
                          setOrgForm({ ...orgForm, emailDomain: e.target.value })
                        }
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">
                        Admin Name
                      </label>
                      <input
                        type="text"
                        placeholder="Admin's full name"
                        value={orgForm.adminName}
                        onChange={(e) =>
                          setOrgForm({ ...orgForm, adminName: e.target.value })
                        }
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        placeholder="admin@vit.edu"
                        value={orgForm.adminEmail}
                        onChange={(e) =>
                          setOrgForm({ ...orgForm, adminEmail: e.target.value })
                        }
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">
                        Admin Password
                      </label>
                      <input
                        type="password"
                        placeholder="Set password"
                        value={orgForm.adminPassword}
                        onChange={(e) =>
                          setOrgForm({
                            ...orgForm,
                            adminPassword: e.target.value,
                          })
                        }
                        required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
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
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                        {orgSearch ? "No organizations match your search." : "No organizations yet. Add one above."}
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org, i) => (
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
                            className="text-red-500 text-xs font-medium underline"
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

        {/* ── Users Tab ── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-bold text-[#1F4E79]">All Users</h2>
                <p className="text-xs text-gray-400 mt-0.5">Sorted by organization</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {/* Search bar */}
                <div className="relative flex-1 sm:w-56">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E75B6]"
                  />
                </div>

                {/* Filter by org dropdown */}
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2E75B6] bg-white"
                >
                  <option value="">All Organizations</option>
                  {orgOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-[#1F4E79] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Organization ↑</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      No users match your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr key={u._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            u.role === "SuperAdmin"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "Admin"
                              ? "bg-blue-100 text-blue-700"
                              : u.role === "Teacher"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
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
                  ))
                )}
              </tbody>
            </table>

            {/* Footer count */}
            <div className="px-5 py-3 border-t bg-gray-50 text-xs text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;