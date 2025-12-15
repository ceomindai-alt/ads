const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");

exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user._id;

    const links = await Link.find({ user: userId }).select("_id earnings");
    const linkIds = links.map(l => l._id);

    const totalClicks = await Click.countDocuments({
      link: { $in: linkIds }
    });

    const totalEarnings = Number(
      links.reduce((sum, l) => sum + (l.earnings || 0), 0).toFixed(4)
    );

    const user = await User.findById(userId);

    /* ==================================================
       🔑 AUTO SYNC WALLET (SINGLE SOURCE OF TRUTH)
       ================================================== */
    if (Number(user.walletBalance.toFixed(4)) !== totalEarnings) {
      user.walletBalance = totalEarnings;
      await user.save();
    }

    return res.json({
      totalClicks,
      totalEarnings,
      walletBalance: user.walletBalance
    });
  } catch (err) {
    console.error("earnings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
