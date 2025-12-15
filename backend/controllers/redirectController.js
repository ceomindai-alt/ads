const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const uaParser = require("ua-parser-js");

const PLATFORM_COMMISSION = 0.30;

/**
 * ⚠️ OPEN CSP – REQUIRED FOR ADSTERRA POP / DIRECT CPM
 * APPLY ONLY ON /r/:code ROUTES
 */
const ADSTERRA_CSP =
  "default-src * data: blob:; " +
  "script-src * 'unsafe-inline' 'unsafe-eval'; " +
  "script-src-elem * 'unsafe-inline' 'unsafe-eval'; " +
  "style-src * 'unsafe-inline'; " +
  "img-src * data: blob:; " +
  "frame-src *; " +
  "connect-src *; " +
  "media-src * blob: data:;";

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
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });
    if (!link) return res.status(404).send("Invalid link");

    await trackClick(req, link);
    res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

    res.send(
      stepPage({
        title: "Step 1 of 3",
        message: "Please wait to continue",
        waitSeconds: 15,
        nextUrl: `/r/${code}/step2`
      })
    );
  } catch (err) {
    console.error("STEP 1 ERROR:", err);
    res.status(500).send("Step 1 Error");
  }
};

/* ===================== STEP 2 ===================== */
exports.premiumStep2 = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });
    if (!link) return res.status(404).send("Invalid link");

    res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

    res.send(
      stepPage({
        title: "Step 2 of 3",
        message: "Your content will unlock soon",
        waitSeconds: 15,
        nextUrl: `/r/${code}/step3`
      })
    );
  } catch (err) {
    console.error("STEP 2 ERROR:", err);
    res.status(500).send("Step 2 Error");
  }
};

/* ===================== STEP 3 (FINAL) ===================== */
exports.premiumStep3 = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });
    if (!link || !link.originalUrl) {
      return res.status(404).send("Invalid or broken link");
    }

    res.setHeader("Content-Security-Policy", ADSTERRA_CSP);

    res.send(
      finalPage({
        waitSeconds: 10,
        finalUrl: link.originalUrl
      })
    );
  } catch (err) {
    console.error("STEP 3 ERROR:", err);
    res.status(500).send("Step 3 Error");
  }
};

/* ===================== STEP PAGE (1 & 2) ===================== */
function stepPage({ title, message, waitSeconds, nextUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>

<!-- ✅ ADSTERRA POP / DIRECT SCRIPT -->
<script src="https://pl28261218.effectivegatecpm.com/3f/b8/da/3fb8da7c494bf238f9dcbb169f654d71.js"></script>

<style>
body{
  margin:0;
  background:#f6f4ff;
  font-family:Arial;
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
}
.box{
  background:#fff;
  border-radius:18px;
  padding:26px;
  max-width:520px;
  width:92%;
  text-align:center;
  box-shadow:0 20px 40px rgba(0,0,0,.08);
}
button{
  margin-top:18px;
  padding:12px 28px;
  border-radius:999px;
  border:none;
  background:#7A5CFF;
  color:white;
  font-weight:600;
  opacity:.35;
}
button.active{
  opacity:1;
  cursor:pointer;
}
</style>
</head>

<body>
<div class="box">
  <h2>${title}</h2>
  <p>${message}</p>
  <p>Continue in <strong><span id="t">${waitSeconds}</span>s</strong></p>
  <button id="btn">Continue</button>
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
    btn.onclick=()=>window.location.href=next;
  }
},1000);
</script>
</body>
</html>`;
}

/* ===================== FINAL PAGE ===================== */
function finalPage({ waitSeconds, finalUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Final Step</title>

<!-- ✅ ADSTERRA POP SCRIPT -->
<script src="https://pl28261218.effectivegatecpm.com/3f/b8/da/3fb8da7c494bf238f9dcbb169f654d71.js"></script>

<style>
body{
  margin:0;
  background:#f6f4ff;
  font-family:Arial;
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
}
.box{
  background:#fff;
  border-radius:18px;
  padding:26px;
  max-width:520px;
  width:92%;
  text-align:center;
  box-shadow:0 20px 40px rgba(0,0,0,.08);
}
button{
  margin-top:18px;
  padding:12px 28px;
  border-radius:999px;
  border:none;
  background:#7A5CFF;
  color:white;
  font-weight:600;
  opacity:.35;
}
button.active{
  opacity:1;
  cursor:pointer;
}
</style>
</head>

<body>
<div class="box">
  <h2>Final Step</h2>
  <p>Your link is ready</p>
  <p>Open in <strong><span id="t">${waitSeconds}</span>s</strong></p>
  <button id="btn">Open Original Link</button>
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
    btn.onclick=()=>window.location.href=url;
  }
},1000);
</script>
</body>
</html>`;
}
