const Link = require('../models/Link');
const Click = require('../models/Click');
const User = require('../models/User');
const generateShortCode = require('../utils/generateShortCode') || (() => Math.random().toString(36).slice(2,8));
const uaParser = require('ua-parser-js');

const PLATFORM_COMMISSION = 0.30; // 30%

// CREATE LINK
exports.createLink = async (req, res) => {
  try {
    const { originalUrl, adType, customAlias } = req.body;
    if (!originalUrl) return res.status(400).json({ message: 'originalUrl required' });

    // Normalize alias: undefined if empty -> avoid saving null
    const aliasToSave = customAlias && String(customAlias).trim() !== '' ? String(customAlias).trim() : undefined;

    if (aliasToSave) {
      // validate allowed characters
      if (/[^a-zA-Z0-9-_]/.test(aliasToSave)) {
        return res.status(400).json({
          message: "Custom alias may only contain letters, numbers, hyphens and underscores."
        });
      }
      const exists = await Link.findOne({ customAlias: aliasToSave });
      if (exists) return res.status(400).json({ message: 'customAlias already used' });
    }

    // Ensure unique shortCode
    let shortCode = generateShortCode();
    while (await Link.findOne({ shortCode })) {
      shortCode = generateShortCode();
    }

    const linkData = {
      user: req.user._id,
      originalUrl,
      shortCode,
      adType: adType || 'pop'
    };
    if (aliasToSave) linkData.customAlias = aliasToSave;

    const link = new Link(linkData);
    await link.save();

    res.json({ link });
  } catch (err) {
    console.error('createLink error:', err);
    // if duplicate index error still comes, send helpful message
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error - alias or shortcode exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ links });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const link = await Link.findOne({ _id: req.params.id, user: req.user._id });
    if (!link) return res.status(404).json({ message: "Not found" });
    await Click.deleteMany({ link: link._id });
    await link.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.linkAnalytics = async (req, res) => {
  try {
    const clicks = await Click.find({ link: req.params.id }).sort({ createdAt: -1 });
    const total = clicks.length;
    const countryMap = {};
    const deviceMap = {};
    const browserMap = {};
    clicks.forEach(c => {
      countryMap[c.country] = (countryMap[c.country] || 0) + 1;
      deviceMap[c.device] = (deviceMap[c.device] || 0) + 1;
      browserMap[c.browser] = (browserMap[c.browser] || 0) + 1;
    });
    res.json({
      total,
      countries: countryMap,
      devices: deviceMap,
      browsers: browserMap,
      recent: clicks.slice(0, 50)
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// TRACK + REDIRECT (simple final redirect)
exports.trackAndRedirect = async (req, res) => {
  try {
    const { code } = req.params;
    const link = await Link.findOne({ $or: [{ shortCode: code }, { customAlias: code }] }).populate('user');
    if (!link || link.status !== 'active') return res.status(404).send('Not found or inactive');

    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
    const ua = uaParser(req.headers['user-agent'] || '');
    const device = ua.device.type || 'desktop';
    const browser = ua.browser.name || 'unknown';
    const country = req.headers['cf-ipcountry'] || 'IN';
    const revenueGenerated = parseFloat((Math.random() * 0.02).toFixed(4));

    await new Click({ link: link._id, ip, country, device, browser, revenueGenerated }).save();

    link.clicks += 1;
    link.earnings = parseFloat((link.earnings + revenueGenerated).toFixed(4));
    await link.save();

    const creatorShare = parseFloat((revenueGenerated * (1 - PLATFORM_COMMISSION)).toFixed(4));
    const user = await User.findById(link.user._id);
    if (user) {
      user.walletBalance = parseFloat((user.walletBalance + creatorShare).toFixed(4));
      await user.save();
    }

    // Basic redirect page (or direct redirect - keep simple)
    res.redirect(link.originalUrl);
  } catch (err) {
    console.error('trackAndRedirect error:', err);
    res.status(500).send('Server error');
  }
};
