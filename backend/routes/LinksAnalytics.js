const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Link = require('../models/Link');

// Simple analytics: return clicks + url + createdAt
router.get('/analytics/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Optional: ensure user can only view their own link
    if (String(link.user) !== String(req.user.id)) {
      return res.status(403).json({ error: "You do not have access to this link’s analytics" });
    }

    res.json({
      id: link._id,
      originalUrl: link.originalUrl,
      shortId: link.shortId,
      totalClicks: link.clicks || 0,
      createdAt: link.createdAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
