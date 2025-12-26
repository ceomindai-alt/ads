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

      {/* Center Container (NO CARD HERE) */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* 🔽 Login / Register already has its own card */}
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
