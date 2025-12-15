import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function Referrals() {
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    commissionRate: 10 // default minimum
  });
  const [users, setUsers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Build referral link dynamically
  const referralLink = referralCode
    ? `${window.location.origin}/ref/${referralCode}`
    : "";

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        const res = await axiosInstance.get("/referrals/me");

        setReferralCode(res.data.referralCode);
        setStats({
          totalReferrals: res.data.totalReferrals,
          totalEarnings: res.data.totalEarnings,
          commissionRate: res.data.commissionRate // backend-controlled
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

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6">Referral Program</h2>

      {/* REFERRAL LINK CARD */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-2">Your Referral Link</h3>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={referralLink || "Loading..."}
            className="flex-1 p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-700"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
          Share your referral link and earn{" "}
          <span className="font-semibold">10% – 20%</span> lifetime commission.
        </p>

        <p className="mt-2 text-sm">
          <span className="font-semibold">Your Referral Code:</span>{" "}
          <span className="text-purple-600 font-mono">
            {referralCode || "Loading..."}
          </span>
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          {
            title: "Total Referrals",
            value: loading ? "—" : stats.totalReferrals
          },
          {
            title: "Referral Earnings",
            value: loading ? "—" : `₹${stats.totalEarnings}`
          },
          {
            title: "Commission Rate",
            value: "10% – 20%"
          }
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-gray-800 shadow rounded-xl text-center"
          >
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* REFERRED USERS */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Referred Users</h3>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="p-3">User</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No referrals yet
                </td>
              </tr>
            )}

            {users.map((row, i) => (
              <tr key={i} className="border-b dark:border-gray-700">
                <td className="p-3">{row.username}</td>
                <td className="p-3">{row.joined}</td>
                <td className="p-3">{row.clicks}</td>
                <td className="p-3">₹{row.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
