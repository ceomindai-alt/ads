const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");

exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Get all user links
    const links = await Link.find({ user: userId }).select("_id");
    const linkIds = links.map(l => l._id);

    // 2️⃣ Total valid clicks
    const totalClicks = await Click.countDocuments({
      link: { $in: linkIds }
    });

    // 3️⃣ SUM earnings from Click collection (CPM based)
    const earningsAgg = await Click.aggregate([
      {
        $match: { link: { $in: linkIds } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$revenueGenerated" }
        }
      }
    ]);

    const totalEarnings = Number(
      (earningsAgg[0]?.total || 0).toFixed(4)
    );

    // 4️⃣ Wallet sync (single source of truth)
    const user = await User.findById(userId);

    if (Number(user.walletBalance.toFixed(4)) !== totalEarnings) {
      user.walletBalance = totalEarnings;
      await user.save();
    }

    return res.json({
      totalClicks,
      totalEarnings,
      walletBalance: Number(user.walletBalance.toFixed(4))
    });
  } catch (err) {
    console.error("earnings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
