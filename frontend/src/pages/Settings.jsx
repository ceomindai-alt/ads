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

  /* NORMAL PASSWORD CHANGE */
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setMsg("Fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return setMsg("Passwords do not match");
    }

    setLoading(true);
    setMsg("");

    try {
      await axiosInstance.post("/user/change-password", {
        currentPassword,
        newPassword
      });
      setMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMsg("Current password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  /* SEND OTP */
  const sendOtp = async () => {
    setLoading(true);
    setMsg("");

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setOtpMode(true);
      setMsg("4-digit OTP sent to your email");
    } catch {
      setMsg("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* RESET VIA OTP */
  const resetViaOtp = async () => {
    if (!otp || !forgotNewPassword || !forgotConfirmPassword) {
      return setMsg("Fill all fields");
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      return setMsg("Passwords do not match");
    }

    setLoading(true);
    setMsg("");

    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword: forgotNewPassword
      });
      setMsg("Password reset successfully");
      setOtpMode(false);
      setOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    } catch {
      setMsg("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
      <div className="w-full max-w-2xl px-4 space-y-8">

        <h2 className="text-3xl font-bold text-center">Account Settings</h2>

        {/* PROFILE */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Profile Information</h3>

          <label className="block mb-1">Username</label>
          <input
            value={username}
            disabled
            className="w-full p-3 mb-4 rounded-lg border bg-gray-100"
          />

          <label className="block mb-1">Email</label>
          <input
            value={email}
            disabled
            className="w-full p-3 rounded-lg border bg-gray-100"
          />
        </div>

      </div>
    </div>
  );
}
