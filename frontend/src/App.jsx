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

// Immediately load token BEFORE rendering
const savedToken = localStorage.getItem('token');
if (savedToken) {
  setAuthToken(savedToken);
}

export default function App(){
  const [token, setToken] = useState(savedToken);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  return (
    <>
      <Navbar token={token} setToken={setToken}/>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={ token ? <Navigate to="/dashboard" /> : <Navigate to="/login" /> } />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateLink />} />
          <Route path="/links" element={<LinksList />} />
          <Route path="/analytics/:id" element={<Analytics />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/r/*" element={<ExternalRedirect />} />
          <Route path="/r/:code" element={<RedirectPage />} />

        </Routes>
      </div>
    </>
  );
}
