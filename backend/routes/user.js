const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Link = require("../models/Link");
const User = require("../models/User");
const Click = require("../models/Click");

//
// GET USER STATS
// GET /api/user/stats
//
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const links = await Link.find({ user: userId }).select("_id createdAt earnings");
    const linkIds = links.map(l => l._id);

    const totalClicks = await Click.countDocuments({
      link: { $in: linkIds }
    });

    const totalEarnings = links.reduce((sum, l) => sum + (l.earnings || 0), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLinks = links.filter(l => new Date(l.createdAt) >= today);
    const todayEarnings = todayLinks.reduce((s, l) => s + (l.earnings || 0), 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthLinks = links.filter(l => new Date(l.createdAt) >= monthStart);
    const monthEarnings = monthLinks.reduce((s, l) => s + (l.earnings || 0), 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    const clickStats = await Click.aggregate([
      {
        $match: {
          link: { $in: linkIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const clicksMap = {};
    clickStats.forEach(c => {
      clicksMap[c._id] = c.count;
    });

    const clicksPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];

      clicksPerDay.push({
        date: key,
        count: clicksMap[key] || 0
      });
    }

    res.json({
      totalClicks,
      totalEarnings,
      todayEarnings,
      monthEarnings,
      clicksPerDay
    });

  } catch (err) {
    console.error("User stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// GET USER LINKS
// GET /api/user/links?limit=20
//
router.get("/links", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const baseUrl =
      process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

    const links = await Link.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedLinks = links.map(l => ({
      shortUrl: `${baseUrl}/r/${l.customAlias || l.shortCode}`,
      longUrl: l.originalUrl,
      clicks: l.clicks || 0,
      earnings: l.earnings || 0,
      createdAt: l.createdAt
    }));

    res.json({ links: formattedLinks });
  } catch (err) {
    console.error("User links error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// GET USER PAYMENT DETAILS
// GET /api/user/payment-details
//
router.get("/payment-details", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "walletBalance upiId accNumber ifsc accHolder"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      walletBalance: user.walletBalance,
      upiId: user.upiId || null,
      accNumber: user.accNumber || null,
      ifsc: user.ifsc || null,
      accHolder: user.accHolder || null
    });

  } catch (err) {
    console.error("Payment details error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


//
// UPDATE PAYMENT DETAILS
// POST /api/user/payment-details
//
router.post("/payment-details", auth, async (req, res) => {
  try {
    const { upiId, accNumber, ifsc, accHolder } = req.body;

    await User.findByIdAndUpdate(
      req.user._id,
      { upiId, accNumber, ifsc, accHolder },
      { new: true }
    );

    res.json({ success: true, message: "Updated" });

  } catch (err) {
    console.error("Payment details post error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   DELETE ACCOUNT (SOFT DELETE)
   DELETE /api/user/delete-account
   ====================================================== */
router.delete("/delete-account", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Delete ALL user-generated data
    await Link.deleteMany({ user: userId });
    await Click.deleteMany({ user: userId });
    await Withdraw.deleteMany({ user: userId });

    // 2️⃣ Reset sensitive user data but KEEP registration info
    await User.findByIdAndUpdate(userId, {
      walletBalance: 0,
      referralEarnings: 0,
      accountStatus: "deleted",
      deletedAt: new Date()
    });

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
