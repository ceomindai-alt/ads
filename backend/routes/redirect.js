const express = require("express");
const router = express.Router();

const {
  premiumStep1,
  premiumStep2,
  premiumStep3
} = require("../controllers/redirectController");

router.get("/:code/page3", premiumStep3);
router.get("/:code/page2", premiumStep2);
router.get("/:code", premiumStep1);

module.exports = router;
