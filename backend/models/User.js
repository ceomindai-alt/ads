const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    /* =========================
       AUTH
    ========================= */

    passwordHash: {
      type: String,
      required: true
    },

    // 🔒 OTP-based reset
    resetOtpHash: {
      type: String,
      default: null
    },

    resetOtpExpires: {
      type: Date,
      default: null
    },

    // 🔁 Legacy token reset
    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    },

    accountType: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    /* =========================
       REFERRAL SYSTEM
    ========================= */

    referralCode: {
      type: String,
      unique: true
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
        ref: "User",
        default: null,
        immutable: true 
    },

    referralCommissionRate: {
      type: Number,
      default: 10,
      min: 10,
      max: 20
    },

    referralEarnings: {
      type: Number,
      default: 0
    },

    /* =========================
       WALLET
    ========================= */

    // ✅ AVAILABLE BALANCE (can withdraw)
    walletBalance: {
      type: Number,
      default: 0
    },

    // ✅ LOCKED BALANCE (during pending withdrawal)
    lockedBalance: {
      type: Number,
      default: 0
    },

    /* =========================
       WITHDRAWAL CONTROL (NEW)
    ========================= */

    // Prevent multiple withdrawals
    hasPendingWithdrawal: {
      type: Boolean,
      default: false
    },

    // Last withdrawal timestamp (rate limiting)
    lastWithdrawalAt: {
      type: Date,
      default: null
    },

    /* =========================
       ACCOUNT STATUS
    ========================= */

    accountStatus: {
      type: String,
      enum: ["active", "deleted"],
      default: "active"
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema);
