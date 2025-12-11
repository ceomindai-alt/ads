import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/api";

// Load Google Ads
function AdInit() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return null;
}

export default function RedirectPage() {
  const { code } = useParams();
  const [target, setTarget] = useState(null);

  // loading effect
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await client.get(`/links/resolve/${code}`);
        setTarget(res.data.url);
      } catch (e) {
        setTarget("ERROR");
      }
      setTimeout(() => setLoading(false), 900); // shimmer delay
    }
    load();
  }, [code]);

  if (target === "ERROR") {
    return <div className="center">Link not found.</div>;
  }

  return (
    <div className="premium-container">
      <ParticlesBackground />

      <div className="redirect-card fade-in">

        <h2 className="title-glow">Your link is almost ready</h2>
        <p className="subtitle">Viewing ads helps support free services</p>

        {/* Shimmer while loading */}
        {loading && <SkeletonAd />}

        {/* TOP AD */}
        {!loading && (
          <>
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
              data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT_TOP}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
            <AdInit />
          </>
        )}

        {/* Continue Button */}
        <a
          href={target}
          className="continue-btn pulse"
          style={{ marginTop: 28 }}
        >
          Continue
        </a>

        {/* Bottom AD */}
        {!loading && (
          <>
            <br />
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
              data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT_BOTTOM}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
            <AdInit />
          </>
        )}
      </div>

      {/* PREMIUM CSS */}
      <style>{premiumCSS}</style>
    </div>
  );
}

// PREMIUM CSS
const premiumCSS = `
body {
  margin:0;
  font-family: Inter, Arial;
}

.premium-container {
  min-height:100vh;
  background:#0D0D12;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
  position:relative;
  overflow:hidden;
}

/* Floating Glow Particles */
.particle {
  position:absolute;
  width:8px;
  height:8px;
  background:#7A5CFF;
  border-radius:50%;
  animation: floatUp 6s infinite ease-in-out;
  opacity:0.6;
}

@keyframes floatUp {
  0% { transform: translateY(20px); opacity:0.3; }
  50% { transform: translateY(-20px); opacity:0.8; }
  100% { transform: translateY(20px); opacity:0.3; }
}

.redirect-card {
  width:100%;
  max-width:600px;
  background:rgba(255,255,255,0.06);
  padding:30px;
  border-radius:20px;
  text-align:center;
  backdrop-filter: blur(10px);
  border:1px solid rgba(255,255,255,0.12);
  animation: fadeIn 1s ease-out;
  position:relative;
  z-index:10;
}

.title-glow {
  font-size:26px;
  font-weight:700;
  color:white;
  text-shadow:0 0 22px rgba(140,100,255,0.8);
}

.subtitle {
  color:#ccc;
  margin-top:4px;
  margin-bottom:20px;
}

.continue-btn {
  background:linear-gradient(135deg,#7A5CFF,#AA2FFF);
  padding:12px 26px;
  border-radius:10px;
  color:white;
  text-decoration:none;
  font-weight:600;
  transition:0.3s;
  display:inline-block;
}

.continue-btn:hover {
  transform:scale(1.05);
}

.pulse {
  animation:pulseAnim 1.8s infinite;
}
@keyframes pulseAnim {
  0% { box-shadow:0 0 0 0 rgba(138,90,255,0.5); }
  70% { box-shadow:0 0 18px 10px rgba(138,90,255,0); }
  100% { box-shadow:0 0 0 0 rgba(138,90,255,0); }
}

.fade-in {
  animation: fadeIn 1.2s ease-in-out forwards;
}

@keyframes fadeIn {
  from { opacity:0; transform:translateY(20px); }
  to { opacity:1; transform:translateY(0); }
}

/* Skeleton Loading Shimmer */
.skeleton {
  height:100px;
  border-radius:12px;
  background:linear-gradient(90deg,#202020 0%, #2a2a2a 50%, #202020 100%);
  background-size:200% 100%;
  animation: shimmer 1.4s infinite;
  margin-top:20px;
}

@keyframes shimmer {
  0% { background-position:200% 0; }
  100% { background-position:-200% 0; }
}
`;

function SkeletonAd() {
  return <div className="skeleton"></div>;
}

// Floating particle background
function ParticlesBackground() {
  const particles = [];

  for (let i = 0; i < 20; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 5;

    particles.push(
      <div
        key={i}
        className="particle"
        style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
      />
    );
  }

  return particles;
}
