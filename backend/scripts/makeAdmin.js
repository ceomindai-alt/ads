require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOneAndUpdate(
    { email: "ceomindai@gmail.com" },
    { accountType: "admin" },
    { new: true }
  );

  if (!user) {
    console.log("User not found");
  } else {
    console.log(`Admin created: ${user.email}`);
  }

  mongoose.disconnect();
}

makeAdmin();
