// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTimes,
  FaTachometerAlt,
  FaLink,
  FaMoneyBillWave,
  FaUserFriends,
  FaCog,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
      active
        ? "bg-primary text-white shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="ml-3 font-medium">{label}</span>
  </Link>
);

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const userNav = [
    { to: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { to: "/shorten", icon: FaLink, label: "Shorten Link" },
    { to: "/withdraw", icon: FaMoneyBillWave, label: "Withdrawals" },
    { to: "/referrals", icon: FaUserFriends, label: "Referrals" },
    { to: "/settings", icon: FaCog, label: "Settings" },
  ];

  const adminNav = [
    { to: "/admin/dashboard", icon: FaLock, label: "Admin Dashboard" },
    { to: "/admin/users", icon: FaUserFriends, label: "Manage Users" },
    { to: "/admin/links", icon: FaLink, label: "All Links" },
    { to: "/admin/withdrawals", icon: FaMoneyBillWave, label: "Payout Requests" },
    { to: "/admin/cpm", icon: FaCog, label: "CPM Settings" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r
          border-gray-200 dark:border-gray-700 px-6 py-6 transform transition-transform duration-300
          md:static md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            LinkPay
          </Link>

          <button
            className="text-gray-600 dark:text-gray-300 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-3">
          {userNav.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}

          {isAdmin && (
            <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wide mb-2">
                Admin Panel
              </p>

              <div className="space-y-2">
                {adminNav.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.to}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
