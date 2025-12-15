// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', terms: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const validate = () => {
    let newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions.';
    }
    // Simple checks for presence
    if (!formData.username) newErrors.username = 'Username is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.password) newErrors.password = 'Password is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      await axiosInstance.post('/auth/register', payload); // POST /api/auth/register
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      // Error toast is handled by axiosInstance interceptor
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700/50">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Create an Account</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Start shortening links and earning money</p>

      <form onSubmit={handleSubmit}>
        <Input label="Username" name="username" value={formData.username} onChange={handleChange} required error={errors.username} />
        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required error={errors.email} />
        <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required error={errors.password} />
        <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required error={errors.confirmPassword} />
        
        {/* reCAPTCHA Placeholder */}
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-center text-gray-500 dark:text-gray-400">
            [ reCAPTCHA Placeholder ]
        </div>

        <div className="flex items-start mb-6">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
              Terms and Conditions
            </Link>
          </label>
        </div>
        {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default Register;