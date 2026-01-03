// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    terms: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* =========================
     AUTO-FILL REFERRAL CODE
  ========================= */
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({
        ...prev,
        referralCode: ref
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.username) newErrors.username = 'Username is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.password) newErrors.password = 'Password is required.';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions.';
    }

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
        referralCode: formData.referralCode || null
      };

      await axiosInstance.post('/auth/register', payload);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     GOOGLE REGISTER
  ========================= */
  const handleGoogleRegister = async (credentialResponse) => {
  try {
    setLoading(true);

    const payload = {
      credential: credentialResponse.credential,
      referralCode: formData.referralCode || null
    };

    await axiosInstance.post('/auth/google-register', payload);

    toast.success('Google registration successful!');
    navigate('/dashboard');

  } catch (error) {
    // 👇 AUTO FALLBACK TO GOOGLE LOGIN
    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data?.message === 'Account already exists'
    ) {
      try {
        const loginRes = await axiosInstance.post('/auth/google-login', {
          credential: credentialResponse.credential
        });

        localStorage.setItem('token', loginRes.data.token);

        toast.success('Logged in with Google');
        navigate('/dashboard');
        return;
      } catch (loginError) {
        console.error('Google login fallback failed:', loginError);
      }
    }

    console.error('Google register error:', error);
    toast.error('Google authentication failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700/50">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
        Create an Account
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        Start shortening links and earning money
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          error={errors.username}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={errors.confirmPassword}
        />

        {/* OPTIONAL REFERRAL CODE */}
        <Input
          label="Referral Code (optional)"
          name="referralCode"
          value={formData.referralCode}
          onChange={handleChange}
        />

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
            <Link
              to="/terms"
              className="text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Terms and Conditions
            </Link>
          </label>
        </div>

        {errors.terms && (
          <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </form>

      {/* GOOGLE REGISTER */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <span className="mx-3 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleRegister}
          onError={() => toast.error('Google sign-in failed')}
        />
      </div>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Log In
        </Link>
      </p>
    </div>
  );
};

export default Register;
