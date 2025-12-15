const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateShortCode = require("../utils/generateShortCode");

/* ======================================================
   PASSWORD VALIDATION
====================================================== */
const isStrongPassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]).{8,}$/;
  return regex.test(password);
};

/* ======================================================
   REGISTER
====================================================== */
exports.register = async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
    }

    const newUser = new User({
      username,
      email,
      passwordHash: hashed,
      referralCode: generateShortCode(),
      referredBy: referrer ? referrer._id : null
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, accountType: newUser.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        accountType: newUser.accountType,
        referralCode: newUser.referralCode
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   LOGIN
====================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.accountStatus === "deleted") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType,
        referralCode: user.referralCode
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ME
====================================================== */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    return res.json(user);
  } catch (err) {
    console.error("Get Me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   CHANGE PASSWORD (LOGGED-IN USER)
====================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.accountStatus === "deleted") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   FORGOT PASSWORD (SEND 4-DIGIT OTP)
====================================================== */
exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.accountStatus === "deleted") {
      return res.json({ success: true });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtpHash = await bcrypt.hash(otp, 10);
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: send email via Nodemailer
    console.log("OTP:", otp);

    return res.json({
      success: true,
      message: "4-digit OTP sent to email"
    });
  } catch (err) {
    console.error("Forgot OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   RESET PASSWORD VIA OTP
====================================================== */
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetOtpHash ||
      user.resetOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const validOtp = await bcrypt.compare(otp, user.resetOtpHash);
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = null;
    user.resetOtpExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (err) {
    console.error("Reset OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   FORGOT PASSWORD (RESET LINK – LEGACY, KEPT)
====================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.accountStatus === "deleted") {
      return res.json({ success: true });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("RESET LINK:", resetLink);

    return res.json({
      success: true,
      message: "Password reset link sent"
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   RESET PASSWORD (RESET LINK)
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "Password required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.accountStatus === "deleted") {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful"
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
