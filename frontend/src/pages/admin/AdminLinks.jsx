import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminLinks() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================
     LOAD LINKS (ADMIN ONLY)
  ========================= */
  const loadLinks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/links");
      setLinks(res.data || []);
    } catch (err) {
      console.error("Load links error:", err);
      toast.error("Failed to load links");
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

    loadLinks();
  }, [authLoading, isAuthenticated, isAdmin]);

  /* =========================
     BLOCK NON-ADMIN ACCESS
  ========================= */
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  /* =========================
     DELETE LINK
  ========================= */
  const deleteLink = async (id) => {
    if (!window.confirm("Delete this link permanently?")) return;

    try {
      setActionLoading(id);
      await axiosInstance.delete(`/admin/links/${id}`);
      toast.success("Link deleted");
      await loadLinks();
    } catch (err) {
      toast.error("Failed to delete link");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Manage Links</h2>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">Short Code</th>
              <th className="p-3">Destination</th>
              <th className="p-3">Clicks</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  Loading links…
                </td>
              </tr>
            )}

            {!loading &&
              links.map((l) => (
                <tr
                  key={l._id}
                  className="border-b last:border-none dark:border-gray-700"
                >
                  <td className="p-3 font-mono text-blue-600">
                    {l.shortCode}
                  </td>

                  <td className="p-3 truncate max-w-xs">
                    <a
                      href={l.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {l.originalUrl}
                    </a>
                  </td>

                  <td className="p-3">{l.clicks ?? 0}</td>

                  <td className="p-3 text-right">
                    <button
                      disabled={actionLoading === l._id}
                      onClick={() => deleteLink(l._id)}
                      className={`px-3 py-1 text-xs rounded text-white ${
                        actionLoading === l._id
                          ? "bg-gray-400"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {actionLoading === l._id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}

            {!loading && links.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No links found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
