const User = require("../models/User");
const Link = require("../models/Link");

/* ======================================================
   REDIRECT REFERRAL → REGISTER
====================================================== */
exports.redirectReferral = async (req, res) => {
  try {
    const { code } = req.params;

    const refUser = await User.findOne({ referralCode: code }).select("_id");

    // ❌ Invalid referral → normal register
    if (!refUser) {
      return res.redirect(`${process.env.FRONTEND_URL}/register`);
    }

    // ✅ Valid referral → pass code
    return res.redirect(
      `${process.env.FRONTEND_URL}/register?ref=${code}`
    );
  } catch (err) {
    console.error("Referral redirect error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/register`);
  }
};

/* ======================================================
   GET MY REFERRALS (EXISTING – UNTOUCHED)
====================================================== */
exports.getMyReferrals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch logged-in user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Commission rate (default 10%, max 20%)
    const commissionRate = Math.min(
      Math.max(user.referralCommissionRate || 10, 10),
      20
    );

    // Fetch referred users
    const referredUsers = await User.find({ referredBy: userId })
      .select("username createdAt");

    let totalClicks = 0;
    let totalEarnings = 0;

    const usersData = [];

    for (const refUser of referredUsers) {
      const links = await Link.find({ user: refUser._id }).select(
        "clicks earnings"
      );

      let userClicks = 0;
      let userEarnings = 0;

      links.forEach(link => {
        userClicks += Number(link.clicks || 0);
        userEarnings += Number(link.earnings || 0);
      });

      const commission = Number(
        ((userEarnings * commissionRate) / 100).toFixed(2)
      );

      totalClicks += userClicks;
      totalEarnings += commission;

      usersData.push({
        username: refUser.username,
        joined: refUser.createdAt.toISOString().split("T")[0],
        clicks: userClicks,
        earnings: commission
      });
    }

    return res.json({
      referralCode: user.referralCode,
      commissionRate,
      totalReferrals: referredUsers.length,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      users: usersData
    });
  } catch (err) {
    console.error("Referral error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
