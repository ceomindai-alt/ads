import React from "react";
import { Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Center Container */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
