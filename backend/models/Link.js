const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },

  // sparse unique index (works with missing fields)
  customAlias: { type: String, index: true, sparse: true },

  // allow banner to avoid validation errors from frontend
  adType: { type: String, enum: ['pop','interstitial','none','banner'], default: 'pop' },

  clicks: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  status: { type: String, enum: ['active','paused','deleted'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure the index exists: unique on customAlias but sparse so null/missing are not considered duplicates.
// Mongoose can't create "unique + sparse" using only the schema property reliably across installs,
// so create the compound index explicitly.
linkSchema.index({ customAlias: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Link', linkSchema);
