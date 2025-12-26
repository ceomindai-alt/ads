// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { FaBars, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  /* ✅ AUTO-CLOSE MENUS ON ROUTE CHANGE */
  useEffect(() => {
    setOpen(false);
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">

        {/* Mobile Sidebar Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars className="h-6 w-6" />
        </button>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          
        </h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4">

          <ThemeToggle />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary transition"
            >
              <FaUserCircle className="w-6 h-6" />
              <span className="hidden sm:block">
                {user?.username || "User"}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1">
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FaUserCircle className="mr-2" /> Profile
                </Link>

                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
