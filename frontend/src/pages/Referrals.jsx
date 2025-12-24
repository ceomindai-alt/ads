import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function Referrals() {
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    commissionRate: 10
  });
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =========================
     REFERRAL LINK
  ========================= */
  const referralLink = referralCode
    ? `${window.location.origin}/ref/${referralCode}`
    : "";

  /* =========================
     LOAD REFERRAL DATA
  ========================= */
  useEffect(() => {
    const loadReferralData = async () => {
      try {
        const res = await axiosInstance.get("/referrals/me");

        setReferralCode(res.data.referralCode);
        setStats({
          totalReferrals: res.data.totalReferrals,
          totalEarnings: res.data.totalEarnings,
          commissionRate: res.data.commissionRate
        });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to load referral data", err);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, []);

  /* =========================
     COPY LINK
  ========================= */
  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Referral Program</h2>

      {/* =========================
          REFERRAL LINK CARD
      ========================= */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-3">Your Referral Link</h3>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            value={loading ? "Loading..." : referralLink}
            className="flex-1 p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700 text-sm"
          />
          <button
            onClick={copyLink}
            disabled={!referralLink}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Share this link. When someone registers and earns, you receive{" "}
          <span className="font-semibold">
            {stats.commissionRate}% lifetime commission
          </span>.
        </p>

        <p className="mt-2 text-sm">
          <span className="font-semibold">Your Referral Code:</span>{" "}
          <span className="text-purple-600 font-mono">
            {referralCode || "—"}
          </span>
        </p>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Referrals"
          value={loading ? "—" : stats.totalReferrals}
        />
        <StatCard
          title="Referral Earnings"
          value={loading ? "—" : `₹${stats.totalEarnings}`}
        />
        <StatCard
          title="Commission Rate"
          value={`${stats.commissionRate}%`}
        />
      </div>

      {/* =========================
          REFERRED USERS
      ========================= */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Referred Users</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-3">User</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Clicks</th>
                <th className="p-3">Your Earnings</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-gray-500"
                  >
                    No referrals yet
                  </td>
                </tr>
              )}

              {users.map((row, i) => (
                <tr key={i} className="border-b dark:border-gray-700">
                  <td className="p-3 font-medium">{row.username}</td>
                  <td className="p-3">{row.joined}</td>
                  <td className="p-3">{row.clicks}</td>
                  <td className="p-3">₹{row.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SMALL STAT CARD
========================= */
function StatCard({ title, value }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-center">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
