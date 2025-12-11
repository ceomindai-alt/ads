const Withdraw = require('../models/Withdraw');
const User = require('../models/User');

exports.createWithdraw = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    if (amount > user.walletBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct immediately (simple flow)
    user.walletBalance = parseFloat((user.walletBalance - amount).toFixed(4));
    await user.save();

    const w = new Withdraw({
      user: req.user._id,
      amount,
      method
    });

    await w.save();

    res.json({ success: true, message: "Withdrawal request submitted" });
  } catch (err) {
    console.error('createWithdraw error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listWithdrawals = async (req, res) => {
  try {
    const list = await Withdraw.find().populate('user');
    res.json({ list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });
    w.status = "processed";
    w.processedAt = new Date();
    await w.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectWithdraw = async (req, res) => {
  try {
    const w = await Withdraw.findById(req.params.id);
    if (!w) return res.status(404).json({ message: "Not found" });

    const user = await User.findById(w.user);
    if (user) {
      user.walletBalance = parseFloat((user.walletBalance + w.amount).toFixed(4));
      await user.save();
    }

    w.status = "rejected";
    w.processedAt = new Date();
    await w.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
