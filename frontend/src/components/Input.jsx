// src/components/Input.jsx
import React, { forwardRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Input = forwardRef(({ label, type = 'text', name, value, onChange, placeholder, required, error, showPasswordToggle, isPasswordVisible, togglePasswordVisibility }, ref) => {
  const baseClasses = "w-full px-4 py-2 border rounded-lg focus:ring-2 transition duration-150";
  const colorClasses = "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const focusClasses = "focus:border-primary focus:ring-primary/50";
  const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "";

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          ref={ref}
          type={showPasswordToggle && isPasswordVisible ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder || label}
          required={required}
          className={`${baseClasses} ${colorClasses} ${focusClasses} ${errorClasses} ${showPasswordToggle ? 'pr-10' : ''}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-150"
          >
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;