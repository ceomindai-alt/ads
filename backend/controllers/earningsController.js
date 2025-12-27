const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");

exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ User links
    const links = await Link.find({ user: userId }).select("_id");
    const linkIds = links.map(l => l._id);

    // 2️⃣ Total clicks
    const totalClicks = await Click.countDocuments({
      link: { $in: linkIds }
    });

    // 3️⃣ Lifetime earnings (never reduced)
    const earningsAgg = await Click.aggregate([
      { $match: { link: { $in: linkIds } } },
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

    // 4️⃣ Read balances ONLY (no recalculation)
    const user = await User.findById(userId).select(
      "walletBalance lockedBalance"
    );

    return res.json({
      totalClicks,
      totalEarnings,              // lifetime
      walletBalance: Number(user.walletBalance.toFixed(4)), // withdrawable
      lockedBalance: Number(user.lockedBalance.toFixed(4))  // pending
    });

  } catch (err) {
    console.error("earnings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
