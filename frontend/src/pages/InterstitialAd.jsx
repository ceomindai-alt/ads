// src/pages/InterstitialAd.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaClock, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios'; // Use raw axios for public, non-auth API

const InterstitialAd = () => {
  const { shortCode } = useParams();
  const [countdown, setCountdown] = useState(5);
  const [targetUrl, setTargetUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the long URL
  useEffect(() => {
    const fetchTargetUrl = async () => {
      try {
        // NOTE: This assumes a public, non-authenticated endpoint like GET /api/resolve/:shortCode
        // This endpoint is not in the list, so we will use a mock one and simulate the fetch.
        // In a real scenario, this would hit the backend to get the long URL and log the click.
        const res = await axios.get(`/api/resolve/${shortCode}`); 
        setTargetUrl(res.data.longUrl); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching target URL:", error);
        setTargetUrl('/404'); // Redirect to a 404 page on failure
        setLoading(false);
      }
    };
    fetchTargetUrl();
  }, [shortCode]);

  // 2. Countdown Timer Logic
  useEffect(() => {
    if (!targetUrl) return; // Wait for URL to be fetched

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, targetUrl]);

  // 3. Handle Continue/Redirect
  const handleContinue = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <FaSpinner className="animate-spin w-8 h-8 text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl">
        {/* Top Ad Container */}
        <div className="mb-6 p-4 h-32 md:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          [ Ad Container: PropellerAds / Adsterra 728x90 or 300x250 ]
        </div>

        {/* Main Countdown Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Almost There!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please wait for the timer to finish before proceeding to your link.
          </p>

          <div className="flex items-center justify-center mb-8">
            <FaClock className="w-6 h-6 text-primary mr-2" />
            <span className="text-4xl font-bold text-primary">{countdown}</span>
            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400 ml-1">seconds</span>
          </div>
          
          <Button 
            onClick={handleContinue} 
            disabled={countdown > 0} 
            variant="secondary"
            className="w-full max-w-xs mx-auto"
            size="lg"
          >
            <FaExternalLinkAlt className="mr-2" />
            {countdown > 0 ? `Please Wait (${countdown}s)` : 'Continue to Link'}
          </Button>
        </div>

        {/* Bottom Ad Container (optional) */}
        <div className="mt-6 p-4 h-32 md:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
          [ Ad Container: PropellerAds / Adsterra 300x250 or Native Banner ]
        </div>
      </div>
    </div>
  );
};

export default InterstitialAd;