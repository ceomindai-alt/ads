const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const withdrawController = require('../controllers/withdrawController');

// user create withdraw
router.post('/', auth, withdrawController.createWithdraw);

// admin routes (you should protect these with admin middleware in admin routes)
router.get('/', withdrawController.listWithdrawals);
router.post('/:id/approve', withdrawController.approveWithdraw);
router.post('/:id/reject', withdrawController.rejectWithdraw);

module.exports = router;
