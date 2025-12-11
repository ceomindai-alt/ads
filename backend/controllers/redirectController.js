const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const uaParser = require("ua-parser-js");

const PLATFORM_COMMISSION = 0.30;

// ONE-LINE CSP – FULLY GOOGLE ADS COMPATIBLE
const GOOGLE_CSP =
  "default-src 'self'; img-src * data: blob: https:; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagservices.com; style-src 'self' 'unsafe-inline'; frame-src https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; connect-src *; media-src * blob: data:;";

// ============================================================================================
// STEP 1 (Ads + Timer + Continue)
// ============================================================================================
exports.premiumStep1 = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    }).populate("user");

    if (!link) return res.status(404).send("Invalid link");

    const ua = uaParser(req.headers["user-agent"] || "");
    const ip = req.headers["x-forwarded-for"] || req.ip;

    const revenue = parseFloat((Math.random() * 0.02).toFixed(4));

    await Click.create({
      link: link._id,
      ip,
      device: ua.device.type || "desktop",
      browser: ua.browser.name || "unknown",
      country: req.headers["cf-ipcountry"] || "IN",
      revenueGenerated: revenue
    });

    link.clicks++;
    link.earnings += revenue;
    await link.save();

    const user = await User.findById(link.user._id);
    if (user) {
      user.walletBalance += revenue * (1 - PLATFORM_COMMISSION);
      await user.save();
    }

    const waitSeconds = 20;
    const AD_CLIENT = process.env.AD_CLIENT;
    const SLOT_TOP = process.env.SLOT_TOP;
    const SLOT_MID = process.env.SLOT_MID;

    res.setHeader("Content-Security-Policy", GOOGLE_CSP);

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{margin:0;background:#0B0B11;height:100vh;display:flex;justify-content:center;align-items:center;color:white;font-family:Inter,Arial;}
.box{width:90%;max-width:520px;background:#1A1A22;padding:28px;border-radius:18px;text-align:center;}
.ad-box{background:#111;border-radius:10px;padding:10px;min-height:100px;margin-top:16px;}
.progress{width:100%;height:8px;background:#222;border-radius:8px;overflow:hidden;margin:16px 0;}
#bar{width:0%;height:100%;background:#7A5CFF;}
#continueBtn{margin-top:20px;padding:10px 24px;border-radius:8px;background:#7A5CFF;border:none;color:white;opacity:.3;pointer-events:none;}
#continueBtn.active{opacity:1;pointer-events:auto;}
</style>
</head>

<body>
<div class="box">
  <h2>Step 1 of 2</h2>
  <p>Watch the ad to continue</p>

  <div class="ad-box">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${AD_CLIENT}"
      data-ad-slot="${SLOT_TOP}">
    </ins>
  </div>

  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}" crossorigin="anonymous"></script>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

  <div class="progress"><div id="bar"></div></div>

  <p>Continue available in <span id="count">${waitSeconds}</span>s</p>

  <button id="continueBtn">Continue</button>

  <div class="ad-box">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${AD_CLIENT}"
      data-ad-slot="${SLOT_MID}">
    </ins>
  </div>

  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<script>
let timeLeft = ${waitSeconds};
const btn = document.getElementById("continueBtn");
const count = document.getElementById("count");
const bar = document.getElementById("bar");

setTimeout(() => { bar.style.transition = "width ${waitSeconds}s linear"; bar.style.width = "100%"; }, 100);

const timer = setInterval(() => {
  timeLeft--;
  count.textContent = timeLeft;

  if (timeLeft <= 0) {
    clearInterval(timer);
    btn.classList.add("active");
    btn.onclick = () => window.location.href = "/r/${code}/step2";
  }
}, 1000);
</script>
</body>
</html>
`);
  } catch (err) {
    console.error("STEP 1 ERROR:", err);
    res.status(500).send("Step 1 Error");
  }
};

// ============================================================================================
// STEP 2 (Final)
// ============================================================================================
exports.premiumStep2 = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });

    if (!link) return res.status(404).send("Invalid link");

    const waitSeconds = 15;

    const AD_CLIENT = process.env.AD_CLIENT;
    const SLOT_BOTTOM = process.env.SLOT_BOTTOM;

    res.setHeader("Content-Security-Policy", GOOGLE_CSP);

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{margin:0;background:#0D0D12;height:100vh;display:flex;justify-content:center;align-items:center;color:white;font-family:Inter,Arial;}
.box{width:90%;max-width:520px;background:#1A1A22;padding:30px;border-radius:18px;text-align:center;}
#ad{min-height:120px;background:#111;border-radius:12px;padding:10px;margin-top:18px;}
#btn{margin-top:22px;padding:12px 28px;border-radius:10px;background:#7A5CFF;border:none;color:white;opacity:.3;pointer-events:none;}
#btn.active{opacity:1;pointer-events:auto;}
</style>
</head>

<body>
<div class="box">
  <h2>Final Step</h2>
  <p>Your link will unlock shortly</p>

  <div id="ad">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="${AD_CLIENT}"
      data-ad-slot="${SLOT_BOTTOM}">
    </ins>
  </div>

  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}" crossorigin="anonymous"></script>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

  <p>Open link in <span id="count">${waitSeconds}</span>s</p>

  <button id="btn">Open Link</button>
</div>

<script>
let timeLeft = ${waitSeconds};
const count = document.getElementById("count");
const btn = document.getElementById("btn");
const target = "${link.originalUrl}";

const timer = setInterval(() => {
  timeLeft--;
  count.textContent = timeLeft;

  if (timeLeft <= 0) {
    clearInterval(timer);
    btn.classList.add("active");
    btn.onclick = () => window.location.href = target;
  }
}, 1000);
</script>

</body>
</html>
`);
  } catch (err) {
    console.error("STEP 2 ERROR:", err);
    res.status(500).send("Step 2 Error");
  }
};

exports.finalRedirect = (req, res) => {
  res.send("<h1>Final Redirect</h1>");
};
