require("dotenv").config();
const mongoose = require("mongoose");
const Cpm = require("../models/Cpm");

/* =========================================
   ✅ SAFE MONGODB CONNECTION
========================================= */
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const data = [
      { country: "United States", countryCode: "US", cpm: 19 },
      { country: "United Kingdom", countryCode: "GB", cpm: 17 },
      { country: "Canada", countryCode: "CA", cpm: 11.5 },
      { country: "Australia", countryCode: "AU", cpm: 10.5 },
      { country: "Germany", countryCode: "DE", cpm: 9.5 },
      { country: "France", countryCode: "FR", cpm: 8.5 },
      { country: "Netherlands", countryCode: "NL", cpm: 8.5 },
      { country: "Italy", countryCode: "IT", cpm: 7 },
      { country: "Spain", countryCode: "ES", cpm: 7 },
      { country: "Sweden", countryCode: "SE", cpm: 6 },
      { country: "Switzerland", countryCode: "CH", cpm: 10 },
      { country: "Singapore", countryCode: "SG", cpm: 7.5 },
      { country: "Japan", countryCode: "JP", cpm: 6 },
      { country: "South Korea", countryCode: "KR", cpm: 5 },
      { country: "United Arab Emirates", countryCode: "AE", cpm: 7 },
      { country: "Saudi Arabia", countryCode: "SA", cpm: 5 },
      { country: "Brazil", countryCode: "BR", cpm: 3 },
      { country: "India", countryCode: "IN", cpm: 0.82 }
    ];

    /* =========================================
       EXISTING LOGIC (UNCHANGED)
    ========================================= */
    await Cpm.deleteMany({});
    await Cpm.insertMany(data);

    console.log("CPM Seeded");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("CPM Seeding Failed:", error);
    process.exit(1);
  }
})();
