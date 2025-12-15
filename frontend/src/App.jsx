import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Toast from './components/Toast';
import ProtectedRoute from './utils/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Landing
import Landing from "./pages/Landing";

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import Dashboard from './pages/Dashboard';
import ShortenLink from './pages/ShortenLink';
import Withdraw from './pages/Withdraw';
import Referrals from './pages/Referrals';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLinks from './pages/admin/AdminLinks';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminCPM from './pages/admin/AdminCPM';

// Interstitial
import InterstitialAd from './pages/InterstitialAd';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>

        <Routes>

          {/* PUBLIC LANDING PAGE */}
          <Route path="/" element={<Landing />} />

          {/* PUBLIC AD PAGE */}
          <Route path="/ad/:shortCode" element={<InterstitialAd />} />

          {/* AUTH PAGES */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* USER PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shorten" element={<ShortenLink />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/settings" element={<Settings />} />

              {/* ADMIN PROTECTED ROUTES */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/links" element={<AdminLinks />} />
                <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                <Route path="/admin/cpm" element={<AdminCPM />} />
              </Route>

            </Route>
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        <Toast />

      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
