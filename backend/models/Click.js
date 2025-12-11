const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  ip: { type: String },
  country: { type: String },
  device: { type: String },
  browser: { type: String },
  timestamp: { type: Date, default: Date.now },
  cpm: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 }
});

module.exports = mongoose.model('Click', clickSchema);
