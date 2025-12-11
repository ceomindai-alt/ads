const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Click = require('../models/Click');

router.get('/analytics/:id', auth, async (req, res) => {
  try {
    const clicks = await Click.find({ link: req.params.id }).sort({ createdAt: -1 });
    res.json({ clicks });
  } catch (err) {
    res.status(500).json({ message: "Analytics error" });
  }
});

module.exports = router;
