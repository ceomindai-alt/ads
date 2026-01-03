// src/components/CardStat.jsx
import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const CardStat = ({ title, value, icon: Icon = FaChartLine, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-indigo-500/10 text-primary',
    secondary: 'bg-emerald-500/10 text-secondary',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-sky-500/10 text-sky-500',
  }[color];

  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 transition duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardStat;