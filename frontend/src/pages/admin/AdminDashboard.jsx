import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================
     LOAD DASHBOARD DATA
  ========================= */
  const loadData = async () => {
    try {
      setLoading(true);

      const [statsRes, withdrawRes] = await Promise.all([
        axiosInstance.get("/admin/stats"),
        axiosInstance.get("/admin/withdrawals")
      ]);

      setStats(statsRes?.data || {});
      setWithdrawals(withdrawRes?.data || []);
    } catch (err) {
      console.error("Admin dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     SAFE EFFECT
  ========================= */
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (!isAdmin) return;

    loadData();
  }, [authLoading, isAuthenticated, isAdmin]);

  /* =========================
     BLOCK NON-ADMIN ACCESS
  ========================= */
  if (!authLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  /* =========================
     ADMIN ACTIONS
  ========================= */
  const approveWithdraw = async (id) => {
    try {
      setActionLoading(id);
      await axiosInstance.post(`/admin/withdrawals/${id}/approve`, {
        note: ""
      });
      await loadData();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const markPaid = async (id) => {
    const ref = prompt("Enter transaction reference");
    if (!ref) return;

    try {
      setActionLoading(id);
      await axiosInstance.post(`/admin/withdrawals/${id}/paid`, {
        transactionRef: ref
      });
      await loadData();
    } catch (err) {
      console.error("Mark paid failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectWithdraw = async (id) => {
    const reason = prompt("Reason for rejection");
    if (!reason) return;

    try {
      setActionLoading(id);
      await axiosInstance.post(`/admin/withdrawals/${id}/reject`, { reason });
      await loadData();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================
     STATS CARDS
  ========================= */
  const cards = [
    { title: "Total Users", value: stats?.totalUsers },
    { title: "Total Links", value: stats?.totalLinks },
    { title: "Total Clicks", value: stats?.totalClicks },
    { title: "Pending Withdrawals", value: stats?.pendingWithdrawals },
    { title: "Approved Withdrawals", value: stats?.approvedWithdrawals },
    { title: "Total Paid ($)", value: stats?.totalPaid }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {/* STATS */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        {(loading || authLoading)
          ? cards.map((_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-center">
                <p className="text-2xl font-bold text-gray-400">—</p>
              </div>
            ))
          : cards.map((item, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-center">
                <h3 className="text-sm font-semibold mb-1 opacity-80">{item.title}</h3>
                <p className="text-2xl font-bold">{item.value ?? 0}</p>
              </div>
            ))}
      </div>

      {/* WITHDRAWALS */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Withdrawal Requests</h3>

        <div className="overflow-x-auto">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="border-b text-gray-600 dark:text-gray-300">
        <th className="py-3 px-2 text-left w-[32%]">User</th>
        <th className="py-3 px-2 text-right w-[12%]">Amount</th>
        <th className="py-3 px-2 text-center w-[12%]">Method</th>
        <th className="py-3 px-2 text-center w-[16%]">Status</th>
        <th className="py-3 px-2 text-right w-[18%]">Actions</th>
      </tr>
    </thead>

    <tbody>
      {withdrawals.length === 0 && (
        <tr>
          <td colSpan="5" className="py-6 text-center opacity-60">
            No withdrawals found
          </td>
        </tr>
      )}

      {withdrawals.map((w) => (
        <tr
          key={w._id}
          className="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {/* USER */}
          <td className="py-3 px-2 text-left truncate">
            {w.user?.email || "User"}
          </td>

          {/* AMOUNT */}
          <td className="py-3 px-2 text-right font-semibold">
            ${Number(w.amount).toFixed(2)}
          </td>

          {/* METHOD */}
          <td className="py-3 px-2 text-center uppercase">
            {w.method}
          </td>

          {/* STATUS */}
          <td className="py-3 px-2 text-center">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold
                ${
                  w.status === "approved"
                    ? "bg-blue-100 text-blue-700"
                    : w.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : w.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {w.status}
            </span>
          </td>

          {/* ACTIONS */}
          <td className="py-3 px-2 text-right space-x-2">
            {w.status === "pending" && (
              <>
                <button
                  disabled={actionLoading === w._id}
                  onClick={() => approveWithdraw(w._id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={actionLoading === w._id}
                  onClick={() => rejectWithdraw(w._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}

            {w.status === "approved" && (
              <button
                disabled={actionLoading === w._id}
                onClick={() => markPaid(w._id)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
              >
                Mark Paid
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}
