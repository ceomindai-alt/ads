const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: Number,
  method: { type: String, enum: ["upi", "bank"], default: "upi" },

  // UPI
  upiId: String,

  // BANK DETAILS
  accNumber: String,
  ifsc: String,
  accHolder: String,

  status: { type: String, enum: ["pending", "processed", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
