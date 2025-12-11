import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import client from "../api/api";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState(null);

  // Dynamic Fields
  const [upiId, setUpiId] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accHolder, setAccHolder] = useState("");

  useEffect(() => {
    async function load() {
      const me = await client.get("/auth/me");
      setBalance(me.data.walletBalance);
    }
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      return setMsg({ type: "error", text: "Enter valid amount" });
    }

    if (method === "upi" && !upiId) {
      return setMsg({ type: "error", text: "Enter UPI ID" });
    }

    if (method === "bank" && (!accNumber || !ifsc || !accHolder)) {
      return setMsg({
        type: "error",
        text: "All bank details are required",
      });
    }

    try {
      const payload = { amount, method };

      if (method === "upi") payload.upiId = upiId;
      if (method === "bank") {
        payload.accNumber = accNumber;
        payload.ifsc = ifsc;
        payload.accHolder = accHolder;
      }

      await client.post("/withdraw", payload);

      setMsg({ type: "success", text: "Withdrawal request submitted" });
    } catch (e) {
      setMsg({
        type: "error",
        text: e.response?.data?.message || "Failed to submit",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gray-900 p-6 rounded-xl shadow-lg">
      
      {/* Back Button */}
      <Link to="/dashboard">
        <button className="mb-4 bg-gray-700 px-4 py-2 rounded text-white hover:bg-gray-600">
          ← Back
        </button>
      </Link>

      <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>

      <p className="text-gray-300 mb-4">
        Available Balance: <b className="text-white">₹{balance}</b>
      </p>

      {msg && (
        <div
          className={`p-3 mb-4 rounded ${
            msg.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-black`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">

        {/* Amount */}
        <div>
          <label className="text-gray-300 block mb-1">Amount</label>
          <input
            className="w-full p-2 rounded bg-gray-800 text-white outline-none"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Method */}
        <div>
          <label className="text-gray-300 block mb-1">Payout Method</label>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white outline-none"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        {/* UPI DETAILS */}
        {method === "upi" && (
          <div>
            <label className="text-gray-300 block mb-1">UPI ID</label>
            <input
              className="w-full p-2 rounded bg-gray-800 text-white outline-none"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        )}

        {/* BANK DETAILS */}
        {method === "bank" && (
          <>
            <div>
              <label className="text-gray-300 block mb-1">
                Account Number
              </label>
              <input
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
                placeholder="Enter account number"
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">IFSC Code</label>
              <input
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
                placeholder="Enter IFSC"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-300 block mb-1">
                Account Holder Name
              </label>
              <input
                className="w-full p-2 rounded bg-gray-800 text-white outline-none"
                placeholder="Enter account holder name"
                value={accHolder}
                onChange={(e) => setAccHolder(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded mt-4"
        >
          Submit Withdrawal
        </button>
      </form>
    </div>
  );
}
