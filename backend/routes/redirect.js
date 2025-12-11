const express = require("express");
const router = express.Router();

const {
  premiumStep1,
  premiumStep2,
  finalRedirect
} = require("../controllers/redirectController");

router.get("/:code", premiumStep1);
router.get("/:code/step2", premiumStep2);
router.get("/final/:code", finalRedirect);

module.exports = router;
