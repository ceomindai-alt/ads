import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  /* NORMAL CHANGE PASSWORD */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* FORGOT PASSWORD */
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* LOAD PROFILE */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        setUsername(res.data.username);
        setEmail(res.data.email);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center pt-10 transition-colors">
      <div className="w-full max-w-2xl px-4 space-y-8">

        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Account Settings
        </h2>

        {/* PROFILE */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Profile Information
          </h3>

          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            value={username}
            disabled
            className="w-full p-3 mb-4 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
          />

          <label className="block mb-1 text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            value={email}
            disabled
            className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
          />
        </div>

      </div>
    </div>
  );
}
