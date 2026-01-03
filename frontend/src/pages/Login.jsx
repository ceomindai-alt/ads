// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(formData.email, formData.password);

    setLoading(false);

    if (success) {
      navigate('/dashboard', { replace: true });
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================= */
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post('/auth/google-login', {
        credential: credentialResponse.credential
      });

      // Store token exactly like normal login
      localStorage.setItem('token', res.data.token);

      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700/50">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
        Welcome Back
      </h2>

      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        Sign in to your dashboard
      </p>

      <form onSubmit={handleSubmit}>

        {/* EMAIL INPUT */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* PASSWORD INPUT WITH TOGGLE */}
        <Input
          label="Password"
          type={isPasswordVisible ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          showPasswordToggle
          isPasswordVisible={isPasswordVisible}
          togglePasswordVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
        />

        {/* LOGIN BUTTON */}
        <Button type="submit" loading={loading} className="w-full">
          Log In
        </Button>
      </form>

      {/* GOOGLE LOGIN */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <span className="mx-3 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => toast.error('Google sign-in failed')}
        />
      </div>

      {/* SIGN UP LINK */}
      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
