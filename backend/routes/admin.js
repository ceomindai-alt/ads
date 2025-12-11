const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { getPlatformStats, approveWithdrawal } = require('../controllers/adminController');

router.get('/stats', auth, admin, getPlatformStats);
router.post('/withdrawals/:id/approve', auth, admin, approveWithdrawal);

module.exports = router;
