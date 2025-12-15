// src/components/LoadingSpinner.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ fullScreen = false }) => {
  const baseClasses = 'flex items-center justify-center';
  const screenClasses = fullScreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'w-full h-full';

  return (
    <div className={`${baseClasses} ${screenClasses}`}>
      <FaSpinner className="animate-spin w-8 h-8 text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;