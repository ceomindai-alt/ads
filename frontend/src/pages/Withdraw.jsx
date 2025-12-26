import React, { useState, useEffect } from "react"; 
import axiosInstance from "../utils/axiosInstance";

/* =========================
   VALIDATION HELPERS (SAFE ADD)
========================= */
const isValidUpi = (upi) =>
  /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upi);

const isValidIfsc = (ifsc) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

const isValidAccountNumber = (acc) =>
  /^[0-9]{9,18}$/.test(acc);

const isValidName = (name) =>
  /^[a-zA-Z ]{3,}$/.test(name);

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");

  const [upiId, setUpiId] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");

  // PAYPAL
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalBankName, setPaypalBankName] = useState("");
  const [paypalRoutingNumber, setPaypalRoutingNumber] = useState("");
  const [paypalAccountNumber, setPaypalAccountNumber] = useState("");

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axiosInstance.get("/withdraw/history");
        setHistory(res.data || []);

        const profile = await axiosInstance.get("/user/payment-details");
        if (profile.data) {
          setUpiId(profile.data.upiId || "");
          setAccNumber(profile.data.accNumber || "");
          setIfsc(profile.data.ifsc || "");
          setHolderName(profile.data.holderName || "");

          setPaypalEmail(profile.data.paypalEmail || "");
          setPaypalBankName(profile.data.paypalBankName || "");
          setPaypalRoutingNumber(profile.data.paypalRoutingNumber || "");
          setPaypalAccountNumber(profile.data.paypalAccountNumber || "");
        }

        const earnings = await axiosInstance.get("/earnings");
        setBalance(Number(earnings.data.walletBalance || 0));
      } catch (err) {
        console.error("Load error", err);
        setBalance(0);
      }
    };

    loadData();
  }, []);

  const submitRequest = async () => {
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Enter a valid withdrawal amount");
      return;
    }

    if (withdrawAmount < 1) {
      alert("Minimum withdrawal amount is ₹500");
      return;
    }

    if (withdrawAmount > balance) {
      alert("Withdrawal amount exceeds withdrawable balance");
      return;
    }

    /* =========================
       STRICT METHOD VALIDATION (SAFE ADD)
    ========================= */

    if (method === "UPI") {
      if (!upiId) {
        alert("Enter UPI ID");
        return;
      }
      if (!isValidUpi(upiId)) {
        alert("Enter a valid UPI ID (example: name@bank)");
        return;
      }
    }

    if (method === "Bank") {
      if (!holderName || !accNumber || !ifsc) {
        alert("Enter complete bank details");
        return;
      }
      if (!isValidName(holderName)) {
        alert("Enter valid account holder name");
        return;
      }
      if (!isValidAccountNumber(accNumber)) {
        alert("Enter valid bank account number");
        return;
      }
      if (!isValidIfsc(ifsc)) {
        alert("Enter valid IFSC code");
        return;
      }
    }

    if (method === "PayPal") {
      if (!paypalEmail) {
        alert("Enter PayPal email");
        return;
      }
      if (!isValidEmail(paypalEmail)) {
        alert("Enter a valid PayPal email");
        return;
      }
      if (!paypalAccountNumber) {
        alert("Enter PayPal bank account number");
        return;
      }
      if (!isValidAccountNumber(paypalAccountNumber)) {
        alert("Enter valid PayPal bank account number");
        return;
      }
    }

    setLoading(true);
    try {
      await axiosInstance.post("/withdraw/request", {
        amount: withdrawAmount,
        method,
        upiId,
        accNumber,
        ifsc,
        holderName,
        paypalEmail,
        paypalBankName,
        paypalRoutingNumber,
        paypalAccountNumber
      });

      alert("Withdrawal request submitted!");
      setAmount("");

      const earnings = await axiosInstance.get("/earnings");
      setBalance(Number(earnings.data.walletBalance || 0));

      const updated = await axiosInstance.get("/withdraw/history");
      setHistory(updated.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DATE FORMATTER (SAFE ADD)
  ========================= */
  const formatDate = (row) => {
    if (row.date) return new Date(row.date).toLocaleDateString();
    if (row.createdAt) return new Date(row.createdAt).toLocaleDateString();
    if (row.updatedAt) return new Date(row.updatedAt).toLocaleDateString();
    if (row._id)
      return new Date(
        parseInt(row._id.substring(0, 8), 16) * 1000
      ).toLocaleDateString();
    return "-";
  };
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">

          <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            Withdraw Earnings
          </h2>

          {/* BALANCE CARD */}
          <div className="text-center mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow ">
            <p className="text-sm font-medium opacity-90">
              Withdrawable Balance
            </p>
            <p className="text-4xl font-bold mt-1">
              ${Number(balance).toFixed(2)}
            </p>
            <p className="text-xs opacity-80 mt-2">
              This is the amount you can withdraw.
            </p>
          </div>

          {/* WITHDRAW CARD */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-200 mb-10">
            <h3 className="text-xl font-semibold mb-4">Request Withdrawal</h3>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Withdraw Amount ($)
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Payment Method</label>
              <select
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>UPI</option>
                <option>Bank</option>
                <option>PayPal</option>
              </select>
            </div>

            {method === "UPI" && (
              <input
                placeholder="UPI ID"
                className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-4"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            )}

            {method === "Bank" && (
              <div className="grid gap-4 mb-4">
                <input
                  placeholder="Account Holder Name"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
                <input
                  placeholder="Account Number"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                />
                <input
                  placeholder="IFSC Code"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {method === "PayPal" && (
              <div className="grid gap-4 mb-4">
                <input
                  placeholder="PayPal Email"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                />
                <input
                  placeholder="Account Holder Name (must match PayPal)"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
                <input
                  placeholder="Bank Name"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={paypalBankName}
                  onChange={(e) => setPaypalBankName(e.target.value)}
                />
                <input
                  placeholder="Bank Account Number"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={paypalAccountNumber}
                  onChange={(e) => setPaypalAccountNumber(e.target.value)}
                />
                <input
                  placeholder="Routing / Sort / Branch Code"
                  className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                  value={paypalRoutingNumber}
                  onChange={(e) => setPaypalRoutingNumber(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={submitRequest}
              disabled={loading}
              className="mt-4 px-6 py-3 w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
            >
              {loading ? "Submitting..." : "Submit Withdrawal"}
            </button>
          </div>

          {/* HISTORY */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Withdrawal History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No withdrawal history
                      </td>
                    </tr>
                  )}
                  {history.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3">${row.amount}</td>
                      <td className="p-3">{row.method}</td>
                      <td className="p-3">{row.status || "Pending"}</td>
                      <td className="p-3">{formatDate(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
