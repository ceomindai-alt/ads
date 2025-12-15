const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  originalUrl: {
    type: String,
    required: true
  },

  shortCode: {
    type: String,
    required: true,
    unique: true
  },

  customAlias: {
    type: String,
    sparse: true
  },

  adType: {
    type: String,
    enum: ["pop", "interstitial", "none", "banner"],
    default: "pop"
  },

  clicks: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["active", "paused", "deleted"],
    default: "active"
  },

  createdAt: { type: Date, default: Date.now }
});

// UNIQUE ALIAS
linkSchema.index({ customAlias: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Link", linkSchema);
