const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ALWAYS STORED IN USD
  amount: {
    type: Number,
    required: true,
    min: 0.0001
  },

  method: {
    type: String,
    enum: ["upi", "bank", "paypal"],
    required: true,
    lowercase: true,
    trim: true
  },

  /* =========================
     PAYMENT DETAILS (USER)
  ========================= */

  upiId: String,
  accNumber: String,
  ifsc: String,
  holderName: String,

  paypalEmail: String,
  paypalBankName: String,
  paypalRoutingNumber: String,
  paypalAccountNumber: String,

  /* =========================
     WITHDRAWAL STATUS
     (UPDATED – EXTENDED ONLY)
  ========================= */

  status: {
    type: String,
    enum: [
      "pending",    // user requested
      "approved",   // admin approved
      "processed",  // paid (legacy support)
      "paid",       // ✅ NEW – final success
      "rejected"    // admin rejected
    ],
    default: "pending"
  },

  /* =========================
     ADMIN AUDIT (EXISTING)
  ========================= */

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  adminNote: {
    type: String,
    default: ""
  },

  /* =========================
     PAYMENT CONFIRMATION (NEW)
  ========================= */

  // Bank / UPI / PayPal reference ID
  transactionRef: {
    type: String,
    default: null
  },

  /* =========================
     TIMESTAMPS
  ========================= */

  requestedAt: {
    type: Date,
    default: Date.now
  },

  approvedAt: {
    type: Date,
    default: null
  },

  processedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
