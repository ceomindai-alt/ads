const Withdraw = require("../models/Withdraw");
const User = require("../models/User");

/* ======================================================
   CREATE WITHDRAW REQUEST
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

    // 🔑 normalize method (CRITICAL FIX)
    method = method?.toLowerCase();

    if (!["upi", "bank", "paypal"].includes(method)) {
      return res.status(400).json({ message: "Invalid withdrawal method" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (numericAmount > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    /* ======================================================
       VALIDATE METHOD-SPECIFIC DETAILS
    ====================================================== */
    if (method === "upi") {
      if (!upiId) {
        return res.status(400).json({ message: "UPI ID required" });
      }
      user.upiId = upiId;
    }

    if (method === "bank") {
      if (!accNumber || !ifsc || !holderName) {
        return res
          .status(400)
          .json({ message: "Complete bank details required" });
      }
      user.accNumber = accNumber;
      user.ifsc = ifsc;
      user.holderName = holderName;
    }

    if (method === "paypal") {
      if (!paypalEmail) {
        return res
          .status(400)
          .json({ message: "PayPal email required" });
      }
      user.paypalEmail = paypalEmail;
      user.paypalBankName = paypalBankName || "";
      user.paypalRoutingNumber = paypalRoutingNumber || "";
      user.paypalAccountNumber = paypalAccountNumber || "";
      if (holderName) user.holderName = holderName;
    }

    /* ======================================================
       DEDUCT BALANCE IMMEDIATELY
    ====================================================== */
    user.walletBalance = parseFloat(
      (user.walletBalance - numericAmount).toFixed(4)
    );
    await user.save();

    /* ======================================================
       CREATE WITHDRAW RECORD
    ====================================================== */
    const w = new Withdraw({
      user: req.user._id,
      amount: numericAmount,
      method,

      // UPI
      upiId: method === "upi" ? upiId : "",

      // BANK
      accNumber: method === "bank" ? accNumber : "",
      ifsc: method === "bank" ? ifsc : "",
      holderName: method === "bank" ? holderName : "",

      // PAYPAL
      paypalEmail: method === "paypal" ? paypalEmail : "",
      paypalBankName: method === "paypal" ? paypalBankName || "" : "",
      paypalRoutingNumber: method === "paypal" ? paypalRoutingNumber || "" : "",
      paypalAccountNumber: method === "paypal" ? paypalAccountNumber || "" : ""
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
    const list = await Withdraw.find({ user: req.user._id })
      .sort({ requestedAt: -1 });

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
      .populate("user", "username email walletBalance");

    return res.json(list);
  } catch (err) {
    console.error("listWithdrawals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: APPROVE WITHDRAW
====================================================== */
exports.approveWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    if (w.status === "processed") {
      return res.status(400).json({ message: "Already processed" });
    }

    w.status = "processed";
    w.processedAt = new Date();
    await w.save();

    return res.json({ success: true, message: "Withdrawal approved" });
  } catch (err) {
    console.error("approveWithdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: REJECT WITHDRAW (REFUND)
====================================================== */
exports.rejectWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    if (w.status === "rejected") {
      return res.status(400).json({ message: "Already rejected" });
    }

    const user = await User.findById(w.user);
    if (user) {
      user.walletBalance = parseFloat(
        (user.walletBalance + w.amount).toFixed(4)
      );
      await user.save();
    }

    w.status = "rejected";
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
