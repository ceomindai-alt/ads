// controllers/adminController.js
const Link = require('../models/Link');
const Click = require('../models/Click');
const User = require('../models/User');
const Withdraw = require('../models/Withdraw');

exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    const totalClicks = await Click.countDocuments();
    const totalWithdrawals = await Withdraw.countDocuments();
    res.json({ totalUsers, totalLinks, totalClicks, totalWithdrawals });
  } catch (err) {
    console.error('getPlatformStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdraw.findById(id);
    if (!withdrawal) return res.status(404).json({ message: 'Not found' });
    withdrawal.status = 'processed';
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    res.json({ withdrawal });
  } catch (err) {
    console.error('approveWithdrawal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
