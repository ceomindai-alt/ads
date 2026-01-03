// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* SIDEBAR: Desktop + Mobile Drawer */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* RIGHT SECTION */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* MAIN CONTENT */}
        <main className="
          flex-1 overflow-x-hidden overflow-y-auto 
          p-4 sm:p-5 md:p-6 lg:p-8 
          scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600
        ">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BACKDROP (when sidebar open) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
