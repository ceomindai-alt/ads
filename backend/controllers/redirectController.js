const Link = require("../models/Link");
const Click = require("../models/Click");
const User = require("../models/User");
const uaParser = require("ua-parser-js");

const PLATFORM_COMMISSION = 0.30;

/* ===================== CSP ===================== */
const ADSTERRA_CSP =
  "default-src * data: blob:; " +
  "script-src * 'unsafe-inline'; " +
  "script-src-elem * 'unsafe-inline'; " +
  "style-src * 'unsafe-inline'; " +
  "img-src * data: blob:; " +
  "frame-src *; " +
  "connect-src *;";

/* ===================== CLICK TRACKING ===================== */
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

/* ===================== CONTROLLERS ===================== */
exports.premiumStep1 = async (req, res) => {
  const link = await Link.findOne({
    $or: [{ shortCode: req.params.code }, { customAlias: req.params.code }]
  });
  if (!link) return res.status(404).send("Invalid link");

  
  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);
  res.send(renderPage("Step 1 of 3", "Please wait to continue", 15, `/r/${req.params.code}/step2`, false));
};

exports.premiumStep2 = async (req, res) => {
  const link = await Link.findOne({
    $or: [{ shortCode: req.params.code }, { customAlias: req.params.code }]
  });
  if (!link) return res.status(404).send("Invalid link");

  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);
  res.send(renderPage("Step 2 of 3", "Almost there…", 15, `/r/${req.params.code}/step3`, false));
};

exports.premiumStep3 = async (req, res) => {
  const link = await Link.findOne({
    $or: [{ shortCode: req.params.code }, { customAlias: req.params.code }]
  });
  if (!link || !link.originalUrl) return res.status(404).send("Invalid link");

  await trackClick(req, link);
  res.setHeader("Content-Security-Policy", ADSTERRA_CSP);
  res.send(renderPage("Your download is ready", "Click the button below", 10, link.originalUrl, true));
};

/* ===================== POP AD (ONCE) ===================== */
function renderPopAd() {
  return `
<script>
if(!window.__popOnce){
  window.__popOnce = true;
  document.addEventListener("click", function(){
    var s=document.createElement("script");
    s.src="https://pl28322765.effectivegatecpm.com/b1/36/20/b136203f76a84cd2b48556e7f150099a.js";
    s.async=true;
    document.body.appendChild(s);
  }, { once:true });
}
</script>`;
}

/* ===================== TOP NOTIFICATION SOCIAL BAR ===================== */
function renderSocialBar() {
  return `
<style>
#top-social-bar{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  background:#ffffff;
  box-shadow:0 4px 16px rgba(0,0,0,.2);
  z-index:999999;
  padding:6px 0;
  display:none;
  animation:slideDown .4s ease;
}
#top-social-bar-inner{
  max-width:360px;
  margin:auto;
  position:relative;
  display:flex;
  justify-content:center;
}
#top-social-close{
  position:absolute;
  right:6px;
  top:-4px;
  font-size:20px;
  cursor:pointer;
  color:#444;
}
@keyframes slideDown{
  from{transform:translateY(-100%);opacity:0}
  to{transform:translateY(0);opacity:1}
}
</style>

<div id="top-social-bar">
  <div id="top-social-bar-inner">
    <span id="top-social-close">×</span>

    <!-- AD INSIDE NOTIFICATION BAR -->
    <script>
      atOptions={
        key:'1ccec5f203aff915a2a70d31cd0e0306',
        format:'iframe',
        width:720,
        height:30,
        params:{}
      };
    </script>
    <script src="https://www.highperformanceformat.com/1ccec5f203aff915a2a70d31cd0e0306/invoke.js"></script>
  </div>
</div>

<script>
(function(){
  let shown = 0;
  const bar = document.getElementById("top-social-bar");
  const close = document.getElementById("top-social-close");

  function showBar(){
    if(shown >= 1) return;
    bar.style.display = "block";
  }

  function hideBar(){
    bar.style.display = "none";
    shown++;
    if(shown < 1){
      setTimeout(showBar, 5000); // show again after 5 sec
    }
  }

  close.onclick = hideBar;

  // first appearance
  window.addEventListener("load", () => {
    setTimeout(showBar, 3000);
  });
})();
</script>
`;
}

/* ===================== NATIVE BANNER ===================== */
function renderNativeBanner() {
  return `
<div class="ad">
  <div id="container-fceb1e8a3833c59056c4d7687e88d185"></div>
  <script async data-cfasync="false"
    src="https://pl28322783.effectivegatecpm.com/fceb1e8a3833c59056c4d7687e88d185/invoke.js">
  </script>
</div>`;
}

/* ===================== BANNER HELPER ===================== */
function banner(key, w, h) {
  return `
<script>
atOptions={key:'${key}',format:'iframe',width:${w},height:${h},params:{}};
</script>
<script src="https://www.highperformanceformat.com/${key}/invoke.js"></script>`;
}

/* ===================== PAGE TEMPLATE ===================== */
function renderPage(title, message, waitSeconds, nextUrl, isFinal) {
  const btnText = isFinal ? "Go to Link" : "Continue";

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>

<style>
body{margin:0;background:#f6f4ff;font-family:Arial;}
.wrapper{max-width:760px;margin:auto;padding:16px;text-align:center;}
.ad{margin:14px 0;display:flex;justify-content:center;}
.card{background:#fff;border-radius:18px;padding:26px;box-shadow:0 20px 40px rgba(0,0,0,.08);}
button{margin-top:20px;padding:14px 36px;border-radius:999px;border:none;
background:${isFinal ? "#28a745" : "#7A5CFF"};
color:#fff;font-size:16px;font-weight:600;opacity:.5;}
button.active{opacity:1;cursor:pointer;}
</style>
</head>

<body>

${renderSocialBar()}
${renderPopAd()}

<div class="wrapper">

  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",300,250)}</div>
  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",160,300)}</div>
  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",728,90)}</div>

  ${renderNativeBanner()}

  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",320,100)}</div>
  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",468,60)}</div>
  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",300,600)}</div>
  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",336,280)}</div>
  <div><p>${message}</p></div>
  <div >
    
    <button id="btn">${btnText} (${waitSeconds}s)</button>
  </div>

  ${renderNativeBanner()}

  <div class="ad">${banner("1ccec5f203aff915a2a70d31cd0e0306",728,90)}</div>

</div>

<script>
let t=${waitSeconds};
const btn=document.getElementById("btn");
const timer=setInterval(()=>{
  t--;
  btn.innerText = t>0 ? "${btnText} ("+t+"s)" : "${btnText}";
  if(t<=0){
    clearInterval(timer);
    btn.classList.add("active");
    btn.onclick=()=>location.href="${nextUrl}";
  }
},1000);
</script>
</body>
</html>`;
}
