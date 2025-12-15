// routes/withdraw.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const withdrawController = require('../controllers/withdrawController');

/*
|--------------------------------------------------------------------------
| USER ROUTES (Authenticated users only)
|--------------------------------------------------------------------------
|
| /api/withdraw/history
| /api/withdraw/request
|
*/

router.get('/history', auth, withdrawController.userHistory); 
router.post('/request', auth, withdrawController.createWithdraw);


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (Must require auth + admin role)
|--------------------------------------------------------------------------
|
| /api/withdraw/
| /api/withdraw/:id/approve
| /api/withdraw/:id/reject
|
*/

router.get('/', auth, admin, withdrawController.listWithdrawals);
router.post('/:id/approve', auth, admin, withdrawController.approveWithdraw);
router.post('/:id/reject', auth, admin, withdrawController.rejectWithdraw);

module.exports = router;
