const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const referralController = require("../controllers/referralController");

router.get("/me", auth, referralController.getMyReferrals);

module.exports = router;
