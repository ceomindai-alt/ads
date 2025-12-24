const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

// PLATFORM
router.get("/stats", auth, admin, adminController.getPlatformStats);

// WITHDRAWALS (MANUAL PAYOUT FLOW)
router.post(
  "/withdrawals/:id/approve",
  auth,
  admin,
  adminController.approveWithdrawal
);

router.post(
  "/withdrawals/:id/paid",
  auth,
  admin,
  adminController.markWithdrawalPaid
);

router.post(
  "/withdrawals/:id/reject",
  auth,
  admin,
  adminController.rejectWithdrawal
);

// USERS
router.get("/users", auth, admin, adminController.getAllUsers);
router.post("/users/:id/toggle", auth, admin, adminController.toggleUserStatus);
router.get(
  "/withdrawals",
  auth,
  admin,
  adminController.getAllWithdrawals
);

router.get("/links", auth, admin, adminController.getAllLinks);
router.delete("/links/:id", auth, admin, adminController.deleteLink);
// CPM SETTINGS
router.get("/cpm", auth, admin, adminController.getCpmSettings);
router.post("/cpm", auth, admin, adminController.updateCpmSettings);

module.exports = router;
