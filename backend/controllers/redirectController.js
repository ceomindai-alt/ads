const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const uaParser = require("ua-parser-js");

const PLATFORM_COMMISSION = 0.30;

/**
 * OPEN CSP FOR ADSTERRA (Banner / Native)
 * APPLY ONLY ON /r/:code ROUTES
 */
const ADSTERRA_CSP =
  "default-src * data: blob:; " +
  "script-src * 'unsafe-inline'; " +
  "script-src-elem * 'unsafe-inline'; " +
  "style-src * 'unsafe-inline'; " +
  "img-src * data: blob:; " +
  "frame-src *; " +
  "connect-src *;";

/* ===================== CLICK TRACKING (STEP 1 ONLY) ===================== */
async function trackClick(req, link) {
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

  link.clicks += 1;
  link.earnings += revenue;
  await link.save();

  const user = await User.findById(link.user);
  if (user) {
    user.walletBalance += revenue * (1 - PLATFORM_COMMISSION);
    await user.save();
  }
}

/* ===================== STEP 1 ===================== */
exports.premiumStep1 = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ $or: [{ shortCode: code }, { customAlias: code }] });
  if (!link) return res.status(404).send("Invalid link");

  await trackClick(req, link);
  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

  res.send(stepPage({
    title: "Step 1 of 3",
    message: "Please wait to continue",
    waitSeconds: 15,
    nextUrl: `/r/${code}/step2`
  }));
};

/* ===================== STEP 2 ===================== */
exports.premiumStep2 = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ $or: [{ shortCode: code }, { customAlias: code }] });
  if (!link) return res.status(404).send("Invalid link");

  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

  res.send(stepPage({
    title: "Step 2 of 3",
    message: "Almost there…",
    waitSeconds: 15,
    nextUrl: `/r/${code}/step3`
  }));
};

/* ===================== STEP 3 (FINAL WITH BUTTON) ===================== */
exports.premiumStep3 = async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ $or: [{ shortCode: code }, { customAlias: code }] });
  if (!link || !link.originalUrl) return res.status(404).send("Invalid link");

  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

  res.send(finalStepPage({
    waitSeconds: 10,
    finalUrl: link.originalUrl
  }));
};

/* ===================== STEP PAGE (1 & 2) ===================== */
function stepPage({ title, message, waitSeconds, nextUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>

<style>
body{margin:0;background:#f6f4ff;font-family:Arial;}
.wrapper{max-width:720px;margin:auto;padding:12px;}
.ad{margin:12px 0;text-align:center;}
.card{
  background:#fff;
  border-radius:18px;
  padding:26px;
  text-align:center;
  box-shadow:0 20px 40px rgba(0,0,0,.08);
}
button{
  margin-top:18px;
  padding:12px 28px;
  border-radius:999px;
  border:none;
  background:#7A5CFF;
  color:#fff;
  font-weight:600;
  opacity:.35;
}
button.active{opacity:1;cursor:pointer;}
</style>
</head>

<body>
<div class="wrapper">

  <div class="ad"><!-- TOP AD 1 --></div>
  <div class="ad"><!-- TOP AD 2 --></div>
  <div class="ad"><!-- TOP AD 3 --></div>

  <div class="card">
    <h2>${title}</h2>
    <p>${message}</p>
    <p>Continue in <strong><span id="t">${waitSeconds}</span>s</strong></p>
    <button id="btn">Continue</button>
  </div>

  <div class="ad"><!-- BOTTOM AD --></div>

</div>

<script>
let t=${waitSeconds};
const btn=document.getElementById("btn");
const next="${nextUrl}";
const timer=setInterval(()=>{
  t--;
  document.getElementById("t").innerText=t;
  if(t<=0){
    clearInterval(timer);
    btn.classList.add("active");
    btn.onclick=()=>location.href=next;
  }
},1000);
</script>
</body>
</html>`;
}

/* ===================== FINAL STEP (BUTTON ONLY) ===================== */
function finalStepPage({ waitSeconds, finalUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Final Step</title>

<style>
body{margin:0;background:#f6f4ff;font-family:Arial;}
.wrapper{max-width:720px;margin:auto;padding:12px;}
.ad{margin:12px 0;text-align:center;}
.card{
  background:#fff;
  border-radius:18px;
  padding:26px;
  text-align:center;
  box-shadow:0 20px 40px rgba(0,0,0,.08);
}
button{
  margin-top:18px;
  padding:14px 32px;
  border-radius:999px;
  border:none;
  background:#28a745;
  color:#fff;
  font-weight:700;
  font-size:16px;
  opacity:.35;
}
button.active{opacity:1;cursor:pointer;}
</style>
</head>

<body>
<div class="wrapper">

  <div class="ad"><!-- TOP AD 1 --></div>
  <div class="ad"><!-- TOP AD 2 --></div>
  <div class="ad"><!-- TOP AD 3 --></div>

  <div class="card">
    <h2>Your download is ready</h2>
    <p>Click the button after timer ends</p>
    <h3><span id="t">${waitSeconds}</span>s</h3>
    <button id="btn">Your Link</button>
  </div>

  <div class="ad"><!-- BOTTOM AD --></div>

</div>

<script>
let t=${waitSeconds};
const btn=document.getElementById("btn");
const url="${finalUrl}";
const timer=setInterval(()=>{
  t--;
  document.getElementById("t").innerText=t;
  if(t<=0){
    clearInterval(timer);
    btn.classList.add("active");
    btn.onclick=()=>window.open(url,"_self");
  }
},1000);
</script>
</body>
</html>`;
}
