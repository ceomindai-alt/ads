const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const Withdraw = require("../models/Withdraw");
const Cpm = require("../models/Cpm");


/* ======================================================
   PLATFORM STATS (FIXED)
====================================================== */
exports.getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLinks,
      totalClicks,
      pendingWithdrawals,
      approvedWithdrawals,
      totalPaidAgg
    ] = await Promise.all([
      User.countDocuments(),
      Link.countDocuments(),
      Click.countDocuments(),
      Withdraw.countDocuments({ status: "pending" }),
      Withdraw.countDocuments({ status: "approved" }),
      Withdraw.aggregate([
        { $match: { status: { $in: ["paid", "processed"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      totalUsers,
      totalLinks,
      totalClicks,
      pendingWithdrawals,
      approvedWithdrawals,
      totalPaid: totalPaidAgg[0]?.total || 0
    });
  } catch (err) {
    console.error("getPlatformStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   APPROVE WITHDRAWAL (NO MONEY MOVE)
====================================================== */
exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = "" } = req.body;

    const withdrawal = await Withdraw.findById(id);
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });

    if (withdrawal.status !== "pending")
      return res.status(400).json({ message: "Invalid withdrawal state" });

    withdrawal.status = "approved";
    withdrawal.approvedAt = new Date();

    // ✅ SAFE ADMIN ASSIGNMENT
    if (req.user && req.user._id) {
      withdrawal.admin = req.user._id;
    }

    withdrawal.adminNote = note;

    await withdrawal.save();

    res.json({
      success: true,
      message: "Withdrawal approved",
      withdrawal
    });
  } catch (err) {
    console.error("approveWithdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ======================================================
   MARK WITHDRAWAL AS PAID (FINAL STEP)
====================================================== */
exports.markWithdrawalPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionRef } = req.body;

    if (!transactionRef) {
      return res
        .status(400)
        .json({ message: "Transaction reference required" });
    }

    const withdrawal = await Withdraw.findById(id);
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });

    if (withdrawal.status !== "approved")
      return res.status(400).json({ message: "Withdrawal not approved" });

    const user = await User.findById(withdrawal.user);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // RELEASE LOCKED BALANCE
    user.lockedBalance = +(user.lockedBalance - withdrawal.amount).toFixed(4);
    user.hasPendingWithdrawal = false;
    await user.save();

    withdrawal.status = "paid";
    withdrawal.transactionRef = transactionRef;
    withdrawal.processedAt = new Date();
    withdrawal.admin = req.user._id;

    await withdrawal.save();

    res.json({
      success: true,
      message: "Withdrawal marked as paid",
      withdrawal
    });
  } catch (err) {
    console.error("markWithdrawalPaid error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   REJECT WITHDRAWAL (REFUND SAFELY)
====================================================== */
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res.status(400).json({ message: "Rejection reason required" });

    const withdrawal = await Withdraw.findById(id);
    if (!withdrawal)
      return res.status(404).json({ message: "Withdrawal not found" });

    if (["paid", "rejected"].includes(withdrawal.status))
      return res.status(400).json({ message: "Cannot reject this withdrawal" });

    const user = await User.findById(withdrawal.user);
    if (user) {
      user.walletBalance = +(
        user.walletBalance + withdrawal.amount
      ).toFixed(4);
      user.lockedBalance = +(
        user.lockedBalance - withdrawal.amount
      ).toFixed(4);
      user.hasPendingWithdrawal = false;
      await user.save();
    }

    withdrawal.status = "rejected";
    withdrawal.processedAt = new Date();
    withdrawal.admin = req.user._id;
    withdrawal.adminNote = reason;

    await withdrawal.save();

    res.json({
      success: true,
      message: "Withdrawal rejected and refunded",
      withdrawal
    });
  } catch (err) {
    console.error("rejectWithdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL USERS (FIXED FIELDS)
====================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "username email accountType accountStatus walletBalance lockedBalance createdAt"
      )
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

/* ======================================================
   TOGGLE USER STATUS (SAFE)
====================================================== */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ❌ Never allow blocking admins
    if (user.accountType === "admin") {
      return res.status(403).json({ message: "Cannot block admin" });
    }

    user.accountStatus =
      user.accountStatus === "active" ? "deleted" : "active";

    await user.save();

    res.json({
      success: true,
      accountStatus: user.accountStatus
    });
  } catch (err) {
    console.error("toggleUserStatus error:", err);
    res.status(500).json({ message: "Action failed" });
  }
};
exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdraw.find()
      .populate("user", "username email")
      .sort({ requestedAt: -1 });

    res.json(withdrawals);
  } catch (err) {
    console.error("getAllWithdrawals error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllLinks = async (req, res) => {
  try {
    const links = await Link.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json(links);
  } catch (err) {
    res.status(500).json({ message: "Failed to load links" });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    await Link.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.getCpmSettings = async (req, res) => {
  try {
    const cpms = await Cpm.find().sort({ country: 1 });
    res.json(cpms);
  } catch (err) {
    console.error("getCpmSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateCpmSettings = async (req, res) => {
  try {
    const { cpms } = req.body;

    if (!Array.isArray(cpms)) {
      return res.status(400).json({ message: "Invalid CPM payload" });
    }

    for (const item of cpms) {
      await Cpm.findOneAndUpdate(
        { countryCode: item.countryCode },
        {
          country: item.country,
          countryCode: item.countryCode,
          cpm: item.cpm
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("updateCpmSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

