// src/components/Button.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, loading, className = '' }) => {
  let baseClasses = 'font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center whitespace-nowrap';
  let variantClasses = '';
  let sizeClasses = '';

  // Variants
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-primary hover:bg-indigo-700 text-white shadow-md';
      break;
    case 'secondary':
      variantClasses = 'bg-secondary hover:bg-emerald-600 text-white shadow-md';
      break;
    case 'danger':
      variantClasses = 'bg-red-500 hover:bg-red-600 text-white shadow-md';
      break;
    case 'outline':
      variantClasses = 'border border-primary text-primary hover:bg-primary/10 dark:text-white dark:border-white/50 dark:hover:bg-white/10';
      break;
    case 'ghost':
        variantClasses = 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';
        break;
    default:
      variantClasses = 'bg-primary hover:bg-indigo-700 text-white shadow-md';
  }

  // Sizes
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3 text-lg';
      break;
    case 'md':
    default:
      sizeClasses = 'px-4 py-2';
      break;
  }

  const disabledClasses = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
    >
      {loading ? (
        <FaSpinner className="animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;