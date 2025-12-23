const mongoose = require("mongoose");

const cpmSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    countryCode: { type: String, required: true, unique: true },
    cpm: { type: Number, required: true } // ALWAYS USD
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cpm", cpmSchema);
