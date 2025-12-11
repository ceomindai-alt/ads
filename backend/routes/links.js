const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const linksController = require('../controllers/linksController');

// Resolve link for frontend UI
router.get('/resolve/:code', async (req, res) => {
  const Link = require('../models/Link');
  const link = await Link.findOne({
    $or: [{ shortCode: req.params.code }, { customAlias: req.params.code }]
  });
  if (!link) return res.status(404).json({ url: "ERROR" });
  res.json({ url: link.originalUrl });
});

// CRUD routes only
router.post('/create', auth, linksController.createLink);
router.get('/my', auth, linksController.listLinks);
router.delete('/:id', auth, linksController.deleteLink);
router.get('/analytics/:id', auth, linksController.linkAnalytics);

// ❌ REMOVE redirect handling from here
// router.get('/:code', linksController.trackAndRedirect);

module.exports = router;
