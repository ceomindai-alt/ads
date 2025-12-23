const Withdraw = require("../models/Withdraw");
const User = require("../models/User");

/* ======================================================
   CREATE WITHDRAW REQUEST (USER)
====================================================== */
exports.createWithdraw = async (req, res) => {
  try {
    let {
      amount,
      method,
      upiId,
      accNumber,
      ifsc,
      holderName,
      paypalEmail,
      paypalBankName,
      paypalRoutingNumber,
      paypalAccountNumber
    } = req.body;

    // Normalize method
    method = method?.toLowerCase();

    if (!["upi", "bank", "paypal"].includes(method)) {
      return res.status(400).json({ message: "Invalid withdrawal method" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    /* =========================
       ONE PENDING WITHDRAWAL ONLY
    ========================= */
    if (user.hasPendingWithdrawal) {
      return res
        .status(400)
        .json({ message: "You already have a pending withdrawal" });
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (numericAmount > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    /* =========================
       VALIDATE METHOD-SPECIFIC DETAILS
    ========================= */
    if (method === "upi") {
      if (!upiId) {
        return res.status(400).json({ message: "UPI ID required" });
      }
    }

    if (method === "bank") {
      if (!accNumber || !ifsc || !holderName) {
        return res
          .status(400)
          .json({ message: "Complete bank details required" });
      }
    }

    if (method === "paypal") {
      if (!paypalEmail) {
        return res.status(400).json({ message: "PayPal email required" });
      }
    }

    /* =========================
       LOCK BALANCE (CRITICAL FIX)
    ========================= */
    user.walletBalance = +(user.walletBalance - numericAmount).toFixed(4);
    user.lockedBalance = +(user.lockedBalance + numericAmount).toFixed(4);
    user.hasPendingWithdrawal = true;
    user.lastWithdrawalAt = new Date();
    await user.save();

    /* =========================
       CREATE WITHDRAW RECORD
    ========================= */
    const w = new Withdraw({
      user: user._id,
      amount: numericAmount,
      method,

      // UPI
      upiId: method === "upi" ? upiId : "",

      // BANK
      accNumber: method === "bank" ? accNumber : "",
      ifsc: method === "bank" ? ifsc : "",
      holderName: holderName || "",

      // PAYPAL
      paypalEmail: method === "paypal" ? paypalEmail : "",
      paypalBankName: paypalBankName || "",
      paypalRoutingNumber: paypalRoutingNumber || "",
      paypalAccountNumber: paypalAccountNumber || ""
    });

    await w.save();

    return res.json({
      success: true,
      message: "Withdrawal request submitted",
      withdrawId: w._id
    });
  } catch (err) {
    console.error("createWithdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   USER WITHDRAW HISTORY
====================================================== */
exports.userHistory = async (req, res) => {
  try {
    const list = await Withdraw.find({ user: req.user._id }).sort({
      requestedAt: -1
    });

    return res.json(list);
  } catch (err) {
    console.error("userHistory error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: LIST ALL WITHDRAWS
====================================================== */
exports.listWithdrawals = async (req, res) => {
  try {
    const list = await Withdraw.find()
      .populate("user", "username email walletBalance lockedBalance")
      .sort({ requestedAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("listWithdrawals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: APPROVE WITHDRAW (NO MONEY MOVE)
====================================================== */
exports.approveWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    if (w.status !== "pending") {
      return res.status(400).json({ message: "Invalid withdrawal status" });
    }

    w.status = "approved";
    w.admin = req.user._id;
    w.approvedAt = new Date();
    await w.save();

    return res.json({ success: true, message: "Withdrawal approved" });
  } catch (err) {
    console.error("approveWithdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: MARK AS PAID (FINAL STEP)
====================================================== */
exports.markAsPaid = async (req, res) => {
  try {
    const { transactionRef } = req.body;

    if (!transactionRef) {
      return res
        .status(400)
        .json({ message: "Transaction reference required" });
    }

    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    if (w.status !== "approved") {
      return res.status(400).json({ message: "Withdrawal not approved" });
    }

    const user = await User.findById(w.user);

    user.lockedBalance = +(user.lockedBalance - w.amount).toFixed(4);
    user.hasPendingWithdrawal = false;
    await user.save();

    w.status = "paid";
    w.transactionRef = transactionRef;
    w.processedAt = new Date();
    await w.save();

    return res.json({ success: true, message: "Payment marked as paid" });
  } catch (err) {
    console.error("markAsPaid error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: REJECT WITHDRAW (REFUND SAFELY)
====================================================== */
exports.rejectWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    if (["paid", "rejected"].includes(w.status)) {
      return res.status(400).json({ message: "Cannot reject this withdrawal" });
    }

    const user = await User.findById(w.user);

    user.walletBalance = +(user.walletBalance + w.amount).toFixed(4);
    user.lockedBalance = +(user.lockedBalance - w.amount).toFixed(4);
    user.hasPendingWithdrawal = false;
    await user.save();

    w.status = "rejected";
    w.admin = req.user._id;
    w.adminNote = req.body.reason || "";
    w.processedAt = new Date();
    await w.save();

    return res.json({
      success: true,
      message: "Withdrawal rejected and amount refunded"
    });
  } catch (err) {
    console.error("rejectWithdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
