import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import LinksList from './pages/LinkList';
import Analytics from './pages/Analytics';
import Withdraw from './pages/Withdraw';
import Navbar from './components/Navbar';
import { setAuthToken } from './api/api';
import ExternalRedirect from './pages/ExternalRedirect';
import RedirectPage from './pages/RedirectPage';

// Load token immediately at startup
const savedToken = localStorage.getItem('token');
if (savedToken) {
  setAuthToken(savedToken);
}

export default function App() {
  const [token, setToken] = useState(savedToken);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  function PrivateRoute({ children }) {
    return token ? children : <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar token={token} setToken={setToken} />
      <div className="container mx-auto p-4">
        <Routes>

          {/* Auth Routes */}
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/register" />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><CreateLink /></PrivateRoute>} />
          <Route path="/links" element={<PrivateRoute><LinksList /></PrivateRoute>} />
          <Route path="/analytics/:id" element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="/withdraw" element={<PrivateRoute><Withdraw /></PrivateRoute>} />

          {/* Redirect System */}
          <Route path="/r/:code" element={<RedirectPage />} />
          <Route path="/r/*" element={<ExternalRedirect />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
