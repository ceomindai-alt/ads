import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaClock, FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import axios from "axios";

const InterstitialAd = () => {
  const { shortCode } = useParams();
  const [countdown, setCountdown] = useState(5);
  const [targetUrl, setTargetUrl] = useState(null);
  const [loading, setLoading] = useState(true);
const script = document.createElement("script");
script.src = "https://pl28261218.effectivegatecpm.com/3f/b8/da/3fb8da7c494bf238f9dcbb169f654d71.js";
document.body.appendChild(script);

  /* ======================================================
     LOAD ADSTERRA (STEP PAGE ONLY)
  ====================================================== */
  useEffect(() => {
    if (document.getElementById("adsterra-script")) return;

    const script = document.createElement("script");
    script.id = "adsterra-script";
    script.type = "text/javascript";
    script.src =
      "https://pl28261218.effectivegatecpm.com/3f/b8/da/3fb8da7c494bf238f9dcbb169f654d71.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);

  /* ======================================================
     FETCH LONG URL
  ====================================================== */
  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const res = await axios.get(`/api/resolve/${shortCode}`);
        setTargetUrl(res.data.longUrl);
      } catch (err) {
        console.error("Resolve failed", err);
        setTargetUrl(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTarget();
  }, [shortCode]);

  /* ======================================================
     COUNTDOWN
  ====================================================== */
  useEffect(() => {
    if (!targetUrl || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, targetUrl]);

  const handleContinue = () => {
    if (targetUrl) window.location.href = targetUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin w-8 h-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl text-center">

        {/* TOP ADSTERRA SLOT */}
        <div className="mb-6 h-32 bg-white border rounded flex items-center justify-center text-gray-400">
          Advertisement
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-xl shadow p-8 border">
          <h1 className="text-3xl font-bold mb-3">Please Wait</h1>
          <p className="text-gray-600 mb-6">
            Your link will be available shortly
          </p>

          <div className="flex justify-center items-center mb-6">
            <FaClock className="mr-2 text-purple-600" />
            <span className="text-4xl font-bold">{countdown}</span>
            <span className="ml-2 text-gray-500">seconds</span>
          </div>

          <button
            onClick={handleContinue}
            disabled={countdown > 0}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
              countdown > 0
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <FaExternalLinkAlt className="inline mr-2" />
            {countdown > 0 ? `Wait (${countdown}s)` : "Continue"}
          </button>
        </div>

        {/* BOTTOM ADSTERRA SLOT */}
        <div className="mt-6 h-32 bg-white border rounded flex items-center justify-center text-gray-400">
          Advertisement
        </div>

      </div>
    </div>
  );
};

export default InterstitialAd;
