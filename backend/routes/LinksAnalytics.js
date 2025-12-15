const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Click = require("../models/Click");

router.get("/analytics/:id", auth, async (req, res) => {
  try {
    const linkId = req.params.id;

    const clicks = await Click.find({ link: linkId }).sort({ createdAt: -1 });

    // Build analytics maps
    const countryMap = {};
    const deviceMap = {};
    const browserMap = {};

    clicks.forEach((c) => {
      countryMap[c.country] = (countryMap[c.country] || 0) + 1;
      deviceMap[c.device] = (deviceMap[c.device] || 0) + 1;
      browserMap[c.browser] = (browserMap[c.browser] || 0) + 1;
    });

    return res.json({
      total: clicks.length,
      countries: countryMap,
      devices: deviceMap,
      browsers: browserMap,
      recent: clicks.slice(0, 50) // UI uses this
    });

  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ message: "Analytics error" });
  }
});

module.exports = router;
