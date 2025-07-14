"use client";

import React from "react";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { BASE_API_URL } from "../../utils/apiurl";
import RegisterModal from "../RegisterModal";

export default function LoginForm(props) {
  const {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    otpSent, sendingOtp, showPassword, setShowPassword,
    otpBlocks, otpRefs, otpTimer, otpExpired,
    error, msg,
    showRegister, setShowRegister,
    showNotFoundPopup, setShowNotFoundPopup,
    handlePasswordLogin, handleSendOtp, handleOtpBlockChange, handleOtpBlockKeyDown, handleOtpLogin,
    router
  } = props;

  const [showForgotModal, setShowForgotModal] = React.useState(false);

  const apiSendOtp = async (email) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to send OTP");
    return res.json();
  };
  const apiVerifyOtp = async (email, otp) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to verify OTP");
    return res.json();
  };
  const apiResetPassword = async (email, otp, password) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to reset password");
    return res.json();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#111111] rounded-2xl p-6 shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            VK
          </div>
        </div>

        <h2 className="text-white text-center text-xl font-semibold mb-1">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Don’t have an account yet?{" "}
          <span
            className="text-white font-medium cursor-pointer hover:underline"
            onClick={() => setShowRegister(true)}
          >
            Sign up
          </span>
        </p>

        {/* Mode Switch */}
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-l-md ${
              mode === "password"
                ? "bg-blue-600 text-white"
                : "bg-[#1c1c1c] text-gray-400"
            }`}
            onClick={() => setMode("password")}
          >
            Password
          </button>
          <button
            className={`flex-1 py-2 rounded-r-md ${
              mode === "otp"
                ? "bg-blue-600 text-white"
                : "bg-[#1c1c1c] text-gray-400"
            }`}
            onClick={() => setMode("otp")}
          >
            OTP
          </button>
        </div>

        {/* Forms */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="w-full">
            <input
              type="email"
              placeholder="email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#1c1c1c] text-white placeholder-gray-500 border-none"
            />

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#1c1c1c] text-white placeholder-gray-500 border-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
            {msg && <p className="text-blue-500 mb-2 text-sm">{msg}</p>}

            <button
              type="submit"
              className="w-full py-3 mt-1 mb-2 font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login
            </button>

            <div className="w-full text-right">
              <span
                onClick={() => setShowForgotModal(true)}
                className="text-[13px] text-gray-400 hover:text-white cursor-pointer underline"
              >
                Forgot password?
              </span>
            </div>
          </form>
        )}

        {mode === "otp" && (
          <form onSubmit={handleOtpLogin} className="w-full">
            <input
              type="email"
              placeholder="email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#1c1c1c] text-white placeholder-gray-500 border-none"
            />

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className={`w-full py-3 mb-2 font-semibold rounded-md ${
                  sendingOtp
                    ? "bg-blue-400 opacity-70 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <div className="mb-4">
                <div className="flex gap-2 justify-center mb-2">
                  {otpBlocks.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpBlockChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpBlockKeyDown(idx, e)}
                      className="w-10 h-12 text-xl text-center rounded-md bg-[#1c1c1c] text-white border border-gray-700"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mb-2 text-center">
                  {otpExpired ? (
                    <span className="text-red-500">
                      OTP expired.{" "}
                      <span
                        className="text-blue-500 underline cursor-pointer"
                        onClick={handleSendOtp}
                      >
                        Resend
                      </span>
                    </span>
                  ) : (
                    <>Time left: <b>{otpTimer}s</b></>
                  )}
                </p>
                <button
                  type="submit"
                  className="w-full py-3 font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login
                </button>
              </div>
            )}

            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
            {msg && <p className="text-blue-500 mb-2 text-sm">{msg}</p>}
          </form>
        )}

        {/* Popups */}
        {showNotFoundPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="relative bg-[#111111] text-white rounded-xl shadow-lg p-9 w-full max-w-sm text-center">
              <button
                onClick={() => setShowNotFoundPopup(false)}
                className="absolute top-3 right-4 w-8 h-8 rounded-full bg-[#1c1c1c] text-white font-bold text-lg"
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4">User not found</h3>
              <p className="text-gray-400 mb-6">Please register to continue.</p>
              <button
                onClick={() => { setShowNotFoundPopup(false); setShowRegister(true); }}
                className="w-full py-3 font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Register
              </button>
            </div>
          </div>
        )}

        <ForgotPasswordModal
          open={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          onSuccess={() => setShowForgotModal(false)}
          apiSendOtp={apiSendOtp}
          apiVerifyOtp={apiVerifyOtp}
          apiResetPassword={apiResetPassword}
        />
        
      </div>
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </div>
  );
}
