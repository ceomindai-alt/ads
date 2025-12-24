import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

/* =========================
   HELPERS
========================= */
const mask = (val = "", show = 4) =>
  val.length > show ? "****" + val.slice(-show) : val;

/* =========================
   PAYMENT DETAILS RENDER
========================= */
const renderPaymentDetails = (w) => {
  switch (w.method) {
    case "upi":
      return (
        <div className="space-y-0.5">
          <div><strong>UPI ID:</strong> {w.upiId || "N/A"}</div>
        </div>
      );

    case "bank":
      return (
        <div className="space-y-0.5">
          <div><strong>Bank:</strong> {w.bankName || "N/A"}</div>
          <div><strong>Account No:</strong> {w.accNumber || "N/A"}</div>
          <div><strong>IFSC:</strong> {w.ifsc || "N/A"}</div>
          <div><strong>Acc HolderName:</strong> {w.holderName || "N/A"}</div>
        </div>
      );

    case "paypal":
      return (
        <div className="space-y-0.5">
          <div><strong>Email:</strong> {w.paypalEmail || "N/A"}</div>
          {w.paypalBankName && (
            <div><strong>Bank:</strong> {w.paypalBankName}</div>
          )}
          {w.paypalAccountNumber && (
            <div><strong>Account:</strong> {w.paypalAccountNumber}</div>
          )}
        </div>
      );

    default:
      return "—";
  }
};


export default function AdminWithdrawals() {
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* =========================
     LOAD WITHDRAWALS
  ========================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/admin/withdrawals");
      setWithdrawals(res.data || []);
    } catch (err) {
      console.error("Load withdrawals error:", err);
      toast.error("Failed to load withdrawals");
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
      await axiosInstance.post(`/admin/withdrawals/${id}/approve`);
      toast.success("Withdrawal approved");
      await loadData();
    } catch {
      toast.error("Approval failed");
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
      toast.success("Withdrawal rejected");
      await loadData();
    } catch {
      toast.error("Rejection failed");
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
      toast.success("Marked as paid");
      await loadData();
    } catch {
      toast.error("Mark paid failed");
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Withdrawals</h2>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Payment Details</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-400">
                  Loading withdrawals…
                </td>
              </tr>
            )}

            {!loading &&
              withdrawals.map((w) => (
                <tr key={w._id} className="border-b align-top">
                  <td>{w.user?.email}</td>
                  <td>${Number(w.amount).toFixed(2)}</td>
                  <td className="uppercase">{w.method}</td>

                  <td className="text-xs text-gray-700 dark:text-gray-300">
                    {renderPaymentDetails(w)}
                  </td>

                  <td className="capitalize">{w.status}</td>

                  <td className="text-right space-x-2">
                    {w.status === "pending" && (
                      <>
                        <button
                          disabled={actionLoading === w._id}
                          onClick={() => approveWithdraw(w._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          disabled={actionLoading === w._id}
                          onClick={() => rejectWithdraw(w._id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {w.status === "approved" && (
                      <button
                        disabled={actionLoading === w._id}
                        onClick={() => markPaid(w._id)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded disabled:opacity-50"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            {!loading && withdrawals.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center opacity-60">
                  No withdrawals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
