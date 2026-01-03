import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================
     LOAD USERS (ADMIN ONLY)
  ========================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Load users error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAFE EFFECT
  ========================= */
  useEffect(() => {
    if (authLoading) return;       // ⛔ wait for auth
    if (!isAuthenticated) return; // ⛔ not logged in
    if (!isAdmin) return;         // ⛔ not admin

    loadUsers();
  }, [authLoading, isAuthenticated, isAdmin]);

  /* =========================
     BLOCK NON-ADMIN ACCESS
  ========================= */
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  /* =========================
     TOGGLE USER STATUS
  ========================= */
  const toggleStatus = async (id) => {
    if (!window.confirm("Change user status?")) return;

    try {
      setActionLoading(id);
      await axiosInstance.post(`/admin/users/${id}/toggle`);
      toast.success("User status updated");
      await loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Manage Users</h2>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  Loading users…
                </td>
              </tr>
            )}

            {!loading &&
              users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b last:border-none dark:border-gray-700"
                >
                  <td className="p-3 font-medium">{u.username || "—"}</td>
                  <td className="p-3">{u.email}</td>

                  <td className="p-3 font-semibold">
                    {u.accountType === "admin" ? (
                      <span className="text-purple-600">ADMIN</span>
                    ) : (
                      <span className="text-gray-600">USER</span>
                    )}
                  </td>

                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        u.accountStatus === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {u.accountStatus === "active" ? "Active" : "Blocked"}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    {u.accountType !== "admin" && (
                      <button
                        disabled={actionLoading === u._id}
                        onClick={() => toggleStatus(u._id)}
                        className={`px-3 py-1 text-xs rounded text-white ${
                          actionLoading === u._id
                            ? "bg-gray-400"
                            : u.accountStatus === "active"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {actionLoading === u._id
                          ? "Updating…"
                          : u.accountStatus === "active"
                          ? "Block"
                          : "Unblock"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
