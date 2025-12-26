// src/components/ThemeToggle.jsx
import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative w-16 h-8 rounded-full overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-purple-500
        transition-all duration-300
      "
    >
      {/* LIGHT BACKGROUND */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: "url(/drak.png)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* DARK BACKGROUND */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url(/light.png)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />

      {/* TOGGLE KNOB */}
      <span
        className={`
          absolute top-1 left-1
          w-6 h-6 rounded-full bg-white shadow-lg
          flex items-center justify-center
          transform transition-transform duration-300
          ${isDarkMode ? "translate-x-8" : "translate-x-0"}
        `}
      >
        {isDarkMode ? (
          <FaMoon className="w-3.5 h-3.5 text-indigo-700" />
        ) : (
          <FaSun className="w-3.5 h-3.5 text-yellow-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;