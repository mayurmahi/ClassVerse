// import { useEffect, useState } from "react";
// import api from "../services/api";

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetchStats();
//     fetchUsers();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const res = await api.get("/admin/stats");
//       setStats(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const res = await api.get("/admin/users");
//       setUsers(res.data.users);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleRemove = async (id) => {
//     if (!window.confirm("Are you sure you want to remove this user?")) return;
//     setError("");
//     setSuccess("");
//     try {
//       await api.delete("/admin/users/" + id);
//       setSuccess("User removed successfully");
//       fetchUsers();
//       fetchStats();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to remove user");
//     }
//   };

//   return (
//     <div className="p-5">
//       <h1 className="text-2xl font-bold text-blue-900 mb-4">Admin Dashboard</h1>

//       {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
//       {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

//       {/* Stats Cards */}
//       {stats && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="border rounded p-4 text-center">
//             <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
//             <p className="text-gray-500 text-sm">Total Users</p>
//           </div>
//           <div className="border rounded p-4 text-center">
//             <p className="text-2xl font-bold text-blue-900">{stats.totalClassrooms}</p>
//             <p className="text-gray-500 text-sm">Total Classrooms</p>
//           </div>
//           <div className="border rounded p-4 text-center">
//             <p className="text-2xl font-bold text-blue-900">{stats.totalTeachers}</p>
//             <p className="text-gray-500 text-sm">Teachers</p>
//           </div>
//           <div className="border rounded p-4 text-center">
//             <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
//             <p className="text-gray-500 text-sm">Students</p>
//           </div>
//         </div>
//       )}

//       {/* Users Table */}
//       <h2 className="text-lg font-bold mb-3">All Users</h2>
//       {users.length === 0 ? (
//         <p className="text-gray-500">No users found</p>
//       ) : (
//         <table className="w-full border-collapse border text-sm">
//           <thead>
//             <tr className="bg-blue-900 text-white">
//               <th className="border px-4 py-2 text-left">Name</th>
//               <th className="border px-4 py-2 text-left">Email</th>
//               <th className="border px-4 py-2 text-left">Role</th>
//               <th className="border px-4 py-2 text-left">Joined</th>
//               <th className="border px-4 py-2 text-left">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u, i) => (
//               <tr key={u._id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
//                 <td className="border px-4 py-2">{u.name}</td>
//                 <td className="border px-4 py-2">{u.email}</td>
//                 <td className="border px-4 py-2">
//                   <span className={
//                     u.role === "Admin"
//                       ? "bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
//                       : u.role === "Teacher"
//                       ? "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
//                       : "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
//                   }>
//                     {u.role}
//                   </span>
//                 </td>
//                 <td className="border px-4 py-2">
//                   {new Date(u.createdAt).toLocaleDateString()}
//                 </td>
//                 <td className="border px-4 py-2">
//                   {u.role !== "Admin" && (
//                     <button
//                       onClick={() => handleRemove(u._id)}
//                       className="text-red-500 text-sm underline"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;



import { useEffect, useState } from "react";
import api from "../services/api";

const AdminDashboard = () => {
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
    if (!window.confirm("Are you sure you want to remove this user?")) return;
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

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
          bg: "bg-blue-50",
          iconColor: "text-[#1F4E79]",
          border: "border-l-4 border-[#1F4E79]",
        },
        {
          label: "Total Classrooms",
          value: stats.totalClassrooms,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ),
          bg: "bg-indigo-50",
          iconColor: "text-indigo-600",
          border: "border-l-4 border-indigo-500",
        },
        {
          label: "Teachers",
          value: stats.totalTeachers,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
          bg: "bg-sky-50",
          iconColor: "text-[#2E75B6]",
          border: "border-l-4 border-[#2E75B6]",
        },
        {
          label: "Students",
          value: stats.totalStudents,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422A12.08 12.08 0 0 1 18.5 19a12.08 12.08 0 0 1-13 0 12.08 12.08 0 0 1 .34-8.422L12 14z" />
            </svg>
          ),
          bg: "bg-emerald-50",
          iconColor: "text-emerald-600",
          border: "border-l-4 border-emerald-500",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header bar */}
      <div className="bg-[#1F4E79] px-8 py-5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-blue-200 text-xs">ClassVerse Management Panel</p>
            </div>
          </div>
          <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            Administrator
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {statCards.map(({ label, value, icon, bg, iconColor, border }) => (
              <div key={label} className={`bg-white rounded-2xl shadow-sm ${border} p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
                <div className={`${bg} ${iconColor} p-3 rounded-xl`}>
                  {icon}
                </div>
                <div>
                  <p className="text-2xl font-black text-[#1F4E79]">{value}</p>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1F4E79]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h2 className="text-base font-bold text-[#1F4E79]">All Users</h2>
            </div>
            <span className="bg-blue-50 text-[#1F4E79] text-xs font-semibold px-3 py-1 rounded-full">
              {users.length} total
            </span>
          </div>

          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u, i) => (
                    <tr key={u._id} className="hover:bg-blue-50/40 transition-colors duration-150">
                      {/* Name with avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1F4E79] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={
                          u.role === "Admin"
                            ? "inline-flex items-center bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold"
                            : u.role === "Teacher"
                            ? "inline-flex items-center bg-blue-100 text-[#1F4E79] px-2.5 py-1 rounded-full text-xs font-semibold"
                            : "inline-flex items-center bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold"
                        }>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== "Admin" && (
                          <button
                            onClick={() => handleRemove(u._id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all duration-200"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                            </svg>
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
    </div>
  );
};

export default AdminDashboard;