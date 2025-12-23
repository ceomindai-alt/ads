const express = require("express");
const router = express.Router();
const Cpm = require("../models/Cpm");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

/* =========================
   GET ALL CPM
   GET /api/admin/cpm
========================= */
router.get("/", auth, admin, async (req, res) => {
  const data = await Cpm.find().sort({ country: 1 });
  res.json(data);
});

/* =========================
   UPDATE CPM (BULK)
   POST /api/admin/cpm
========================= */
router.post("/", auth, admin, async (req, res) => {
  const updates = req.body; // array

  for (const item of updates) {
    await Cpm.findOneAndUpdate(
      { countryCode: item.countryCode },
      { cpm: item.cpm },
      { upsert: true }
    );
  }

  res.json({ success: true });
});

module.exports = router;
