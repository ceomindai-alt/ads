const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const uaParser = require("ua-parser-js");

const generateShortCode =
  require("../utils/generateShortCode") ||
  (() => Math.random().toString(36).slice(2, 8));

const PLATFORM_COMMISSION = 0.30;

// CREATE LINK
exports.createLink = async (req, res) => {
  try {
    const { originalUrl, customAlias, adType } = req.body;

    if (!originalUrl)
      return res.status(400).json({ message: "originalUrl required" });

    const allowedAdTypes = ["pop", "interstitial", "none", "banner"];
    const safeAdType = allowedAdTypes.includes(adType) ? adType : "pop";

    let alias = customAlias?.trim() || undefined;

    if (alias) {
      if (/[^a-zA-Z0-9-_]/.test(alias)) {
        return res.status(400).json({
          message: "Alias may contain only letters, numbers, - and _"
        });
      }

      const exists = await Link.findOne({ customAlias: alias });
      if (exists)
        return res.status(400).json({ message: "Alias already taken" });
    }

    let shortCode = generateShortCode();
    while (await Link.findOne({ shortCode })) {
      shortCode = generateShortCode();
    }

    const link = await Link.create({
      user: req.user._id,
      originalUrl,
      shortCode,
      customAlias: alias,
      adType: safeAdType
    });

    return res.json({
      success: true,
      link,
      shortUrl: `${process.env.BACKEND_URL}/r/${alias || shortCode}`
    });
  } catch (err) {
    console.error("CREATE LINK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LIST USER LINKS
exports.listLinks = async (req, res) => {
  const links = await Link.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ links });
};

// DELETE LINK
exports.deleteLink = async (req, res) => {
  const link = await Link.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!link) return res.status(404).json({ message: "Not found" });

  await Click.deleteMany({ link: link._id });
  await link.deleteOne();

  res.json({ success: true });
};

// REDIRECT + TRACK
exports.trackAndRedirect = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    }).populate("user");

    if (!link || link.status !== "active")
      return res.status(404).send("Not found");

    const ua = uaParser(req.headers["user-agent"] || "");
    const device = ua.device.type || "desktop";
    const browser = ua.browser.name || "unknown";
    const country = req.headers["cf-ipcountry"] || "IN";

    const revenueGenerated = parseFloat((Math.random() * 0.02).toFixed(4));

    await new Click({
      link: link._id,
      country,
      device,
      browser,
      revenueGenerated
    }).save();

    link.clicks += 1;
    link.earnings += revenueGenerated;
    await link.save();

    const creatorShare = revenueGenerated * (1 - PLATFORM_COMMISSION);

    await User.findByIdAndUpdate(link.user._id, {
      $inc: { walletBalance: creatorShare }
    });

    res.redirect(link.originalUrl);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    res.status(500).send("Server error");
  }
};
