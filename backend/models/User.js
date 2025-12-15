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

    // 🔒 OTP-based reset (NEW)
    resetOtpHash: {
      type: String,
      default: null
    },

    resetOtpExpires: {
      type: Date,
      default: null
    },

    // 🔁 Legacy token reset (OPTIONAL – can remove later)
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
      ref: "User"
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

    walletBalance: {
      type: Number,
      default: 0
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
