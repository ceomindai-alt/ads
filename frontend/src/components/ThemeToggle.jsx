// src/components/ThemeToggle.jsx
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="md"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-full"
    >
      {isDarkMode ? <FaSun className="w-5 h-5 text-yellow-400" /> : <FaMoon className="w-5 h-5 text-gray-600" />}
    </Button>
  );
};

export default ThemeToggle;