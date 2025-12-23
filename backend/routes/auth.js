const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const authController = require("../controllers/authController");

// PUBLIC
router.post("/register", authController.register);
router.post("/login", authController.login);

// OTP FLOW (FIXED)
router.post("/forgot-password", authController.forgotPasswordOtp); // send OTP
router.post("/reset-password", authController.resetPasswordWithOtp); // verify OTP + reset

// PROTECTED
router.get("/me", auth, authController.getMe);
router.post("/change-password", auth, authController.changePassword);

module.exports = router;
