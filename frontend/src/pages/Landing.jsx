import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactCountryFlag from "react-country-flag";

// COUNTRY DATA
const countries = [
  { name: "United States", code: "US", range: [8, 30], currency: "$" },
  { name: "United Kingdom", code: "GB", range: [6, 22], currency: "£" },
  { name: "Canada", code: "CA", range: [5, 18], currency: "C$" },
  { name: "Australia", code: "AU", range: [5, 16], currency: "A$" },
  { name: "Germany", code: "DE", range: [4, 14], currency: "€" },
  { name: "France", code: "FR", range: [4, 12], currency: "€" },
  { name: "Netherlands", code: "NL", range: [4, 12], currency: "€" },
  { name: "Italy", code: "IT", range: [3, 10], currency: "€" },
  { name: "Spain", code: "ES", range: [3, 10], currency: "€" },
  { name: "Sweden", code: "SE", range: [3, 9], currency: "kr" },
  { name: "Switzerland", code: "CH", range: [5, 14], currency: "CHF" },
  { name: "Singapore", code: "SG", range: [3, 12], currency: "S$" },
  { name: "Japan", code: "JP", range: [3, 10], currency: "¥" },
  { name: "South Korea", code: "KR", range: [2, 8], currency: "₩" },
  { name: "UAE", code: "AE", range: [3, 12], currency: "AED" },
  { name: "Saudi Arabia", code: "SA", range: [2, 8], currency: "SR" },
  { name: "Brazil", code: "BR", range: [1, 5], currency: "R$" },
  { name: "India", code: "IN", range: [16, 120], currency: "₹" }
];

// --------------------------------------------------------
// Earnings Calculator
// --------------------------------------------------------
const Calculator = () => {
  const [selected, setSelected] = useState(countries[0]);
  const [clicks, setClicks] = useState(1000);
  const [result, setResult] = useState(null);

  const calculate = () => {
    const [min, max] = selected.range;

    const minEarning = (clicks / 1000) * min;
    const maxEarning = (clicks / 1000) * max;

    setResult({
      min: minEarning.toFixed(2),
      max: maxEarning.toFixed(2)
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* COUNTRY */}
        <div>
          <label className="block mb-1 font-semibold">Country</label>
          <div className="relative">
            <select
              className="w-full p-3 border rounded-lg pl-10"
              value={selected.name}
              onChange={(e) => {
                const obj = countries.find(c => c.name === e.target.value);
                setSelected(obj);
                setResult(null);
              }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>

            <div className="absolute left-3 top-3 pointer-events-none">
              <ReactCountryFlag svg countryCode={selected.code} style={{ width: 22, height: 22 }} />
            </div>
          </div>
        </div>

        {/* CLICKS */}
        <div>
          <label className="block mb-1 font-semibold">Clicks</label>
          <input
            type="number"
            min="1"
            value={clicks}
            onChange={(e) => setClicks(Number(e.target.value))}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* BUTTON */}
        <div className="flex items-end">
          <button
            onClick={calculate}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white p-3 rounded-lg font-semibold hover:opacity-90"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-6">
          <p className="text-gray-700 text-lg">
            Estimated earnings for {clicks} clicks in {selected.name}:
          </p>
          <p className="text-3xl font-bold mt-2">
            {selected.currency}{result.min}
            {" – "}
            {selected.currency}{result.max}
          </p>
        </div>
      )}

      <p className="text-gray-500 text-sm mt-4">
        Note: Earnings shown are based on country-wise CPM ranges per 1000 clicks.
      </p>
    </>
  );
};

// --------------------------------------------------------
// LIVE WITHDRAW FEED
// --------------------------------------------------------
const LiveWithdrawFeed = () => {
  const names = ["Arun", "Sneha", "David","Leo","Sam", "Amit", "Lily", "Karan", "Rohit", "Meera", "Sofia", "John"];
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const amount = (Math.random() * (5 - 0.5) + 0.5).toFixed(2);

      const newEntry = {
        name: randomName,
        country: randomCountry.name,
        code: randomCountry.code,
        currency: randomCountry.currency,
        amount
      };

      setFeed((prev) => [newEntry, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-10 bg-gray-100 p-6 rounded-xl shadow">
      <h3 className="text-2xl font-bold mb-4 text-center">Live Payout</h3>

      {feed.map((item, index) => (
        <div key={index} className="flex justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <ReactCountryFlag countryCode={item.code} svg style={{ fontSize: "1.5em" }} />
            <span className="font-semibold">{item.name}</span>
          </div>
          <span className="text-purple-700 font-bold">
            {item.currency}{item.amount}
          </span>
        </div>
      ))}
    </div>
  );
};

// --------------------------------------------------------
// MAIN LANDING PAGE
// --------------------------------------------------------
const LandingPage = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleShorten = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/shorten?url=" + encodeURIComponent(input));
  };

  return (
    <div className="bg-white text-gray-900">

      {/* NAVBAR */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm bg-white sticky top-0 z-40">
        <h1 className="text-2xl font-bold">LinkPay</h1>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Login
        </button>
      </header>

      {/* HERO */}
      <section className="text-center py-16 px-4">
        <h2 className="text-4xl font-bold mb-4">Shorten Links. Earn Money.</h2>
        <p className="text-gray-600 mb-8">
          Get paid for every valid click. Highest global earnings.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Paste your long URL here..."
            className="w-full px-4 py-3 border rounded-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleShorten}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Shorten
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["⚡", "Fast Redirect"],
            ["💰", "Link Monetization"],
            ["👥", "Referral Earnings"],
            ["🛡️", "Anti-Bot Protection"]
          ].map(([icon, title], i) => (
            <div
              key={i}
              onClick={() => navigate("/register")}
              className="bg-gray-100 cursor-pointer p-6 rounded-xl flex flex-col items-center justify-center shadow-sm text-center h-40 
                        transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="text-4xl mb-2">{icon}</div>
              <p className="font-medium text-lg">{title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-6">Estimate Your Earnings</h3>
        <div className="bg-gray-100 p-6 rounded-xl shadow">
          <Calculator />
        </div>
      </section>

      {/* COUNTRY EARNINGS TABLE */}
      {/* COUNTRY EARNINGS TABLE */}
<section className="py-16 px-4 max-w-6xl mx-auto">
  <h3 className="text-center text-3xl font-bold mb-6">
    Top 20 Country Earnings
  </h3>

  <p className="text-center text-gray-600 mb-6">
    Estimated earnings per 1000 clicks (country-wise payout ranges).
  </p>

  {/* ✅ DESKTOP SIDE GAP ADDED */}
  <div className="border rounded-xl px-3 md:px-8 lg:px-12">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3">Country</th>
          <th className="p-3 md:text-right">
            Earnings per 1000 Clicks
          </th>
        </tr>
      </thead>

      <tbody>
        {countries.map((c, i) => (
          <tr key={i} className="border-t">
            <td className="p-3 flex items-center gap-2">
              <ReactCountryFlag
                countryCode={c.code}
                svg
                style={{ fontSize: "1.5em" }}
              />
              {c.name}
            </td>

            <td className="p-3 md:text-right font-semibold">
              {c.currency}{c.range[0]} – {c.currency}{c.range[1]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <LiveWithdrawFeed />
</section>


      {/* TESTIMONIALS */}
      <section className="py-16 px-4 bg-gray-50">
        <h3 className="text-center text-3xl font-bold mb-10">What Our Users Say</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            ["I withdrew my earnings in minutes!", "Arun Kumar"],
            ["Best link shortener with real payouts!", "Sneha Rao"],
            ["Love the fast redirects and income!", "Rohit Sharma"]
          ].map(([text, name], i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-700 italic mb-4">“{text}”</p>
              <p className="font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h3 className="text-center text-3xl font-bold mb-10">How It Works</h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
          {[
            ["1", "Create Account"],
            ["2", "Shorten Link"],
            ["3", "Share Everywhere"],
            ["4", "Earn Per Click"],
            ["5", "Withdraw Cash"]
          ].map(([num, step], i) => (
            <div
              key={i}
              onClick={() => navigate("/register")}
              className="bg-white cursor-pointer p-6 rounded-xl shadow text-center h-40 
                        flex flex-col justify-center transition-transform duration-300 
                        hover:scale-105 hover:shadow-xl"
            >
              <h4 className="text-3xl font-bold text-purple-600 mb-2">{num}</h4>
              <p className="font-medium text-lg">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center bg-purple-600 text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to Start Earning?</h3>
        <p className="mb-6">Create your free account today and start earning instantly.</p>

        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-200"
        >
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-600 text-sm">
        © 2025 LinkPay. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
