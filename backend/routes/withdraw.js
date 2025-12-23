// routes/withdraw.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const withdrawController = require('../controllers/withdrawController');

/*
|--------------------------------------------------------------------------
| USER ROUTES
|--------------------------------------------------------------------------
*/

router.get('/history', auth, withdrawController.userHistory);
router.post('/request', auth, withdrawController.createWithdraw);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

router.get('/', auth, admin, withdrawController.listWithdrawals);
router.post('/:id/approve', auth, admin, withdrawController.approveWithdraw);
router.post('/:id/reject', auth, admin, withdrawController.rejectWithdraw);

/* ✅ NEW – MARK AS PAID (MANUAL PAYOUT CONFIRMATION) */
router.post('/:id/paid', auth, admin, withdrawController.markAsPaid);




module.exports = router;
