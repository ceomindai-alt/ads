import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./utils/ProtectedRoute";

/* Layouts */
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

/* Lazy Pages */
import * as Pages from "./utils/lazyPages";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>

        {/* 🌐 GLOBAL LAZY LOADER */}
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Pages.Landing />} />
            <Route path="/ad/:shortCode" element={<Pages.InterstitialAd />} />

            {/* AUTH */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Pages.Login />} />
              <Route path="/register" element={<Pages.Register />} />
            </Route>

            {/* USER PROTECTED */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>

                <Route path="/dashboard" element={<Pages.Dashboard />} />
                <Route path="/shorten" element={<Pages.ShortenLink />} />
                <Route path="/withdraw" element={<Pages.Withdraw />} />
                <Route path="/referrals" element={<Pages.Referrals />} />
                <Route path="/settings" element={<Pages.Settings />} />

                {/* ADMIN */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/admin/dashboard" element={<Pages.AdminDashboard />} />
                  <Route path="/admin/users" element={<Pages.AdminUsers />} />
                  <Route path="/admin/links" element={<Pages.AdminLinks />} />
                  <Route path="/admin/withdrawals" element={<Pages.AdminWithdrawals />} />
                  <Route path="/admin/cpm" element={<Pages.AdminCPM />} />
                </Route>

              </Route>
            </Route>

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>

        <Toast />

      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
