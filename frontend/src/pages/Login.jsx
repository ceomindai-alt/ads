// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

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
