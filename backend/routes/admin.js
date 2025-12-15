// routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// Admin-protected endpoints
router.get('/stats', auth, admin, adminController.getPlatformStats);
router.post('/withdrawals/:id/approve', auth, admin, adminController.approveWithdrawal);

module.exports = router;
