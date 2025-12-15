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
    min: 1
  },

  // upi | bank | paypal
  method: {
    type: String,
    enum: ["upi", "bank", "paypal"],
    required: true,
    lowercase: true, // ✅ AUTO-FIX HERE
    trim: true
  },

  // UPI
  upiId: {
    type: String,
    default: ""
  },

  // BANK
  accNumber: {
    type: String,
    default: ""
  },
  ifsc: {
    type: String,
    default: ""
  },
  holderName: {
    type: String,
    default: ""
  },

  // PAYPAL
  paypalEmail: {
    type: String,
    default: ""
  },
  paypalBankName: {
    type: String,
    default: ""
  },
  paypalRoutingNumber: {
    type: String,
    default: ""
  },
  paypalAccountNumber: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["pending", "processed", "rejected"],
    default: "pending"
  },

  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
