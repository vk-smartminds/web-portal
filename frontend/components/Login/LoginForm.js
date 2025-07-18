"use client";

import React from "react";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { BASE_API_URL } from "../../utils/apiurl";
import RegisterModal from "../RegisterModal";
import Image from "next/image";

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
    <div className="min-h-screen flex items-center justify-center bg-[#111015] px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl p-8 shadow-lg border border-[#23232a]">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/vk-logo.png" alt="VK Logo" width={48} height={48} className="mb-2" />
          <h1 className="text-white text-2xl font-bold mb-1">VK Global Publications</h1>
        </div>
        {/* Tab Switch */}
        <div className="flex mb-6 bg-[#23232a] rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-2 font-semibold text-sm transition-colors ${mode === "password" ? "bg-[#ff4d1c] text-white" : "bg-[#23232a] text-gray-300"}`}
            onClick={() => setMode("password")}
          >
            Password Login
          </button>
          <button
            className={`flex-1 py-2 font-semibold text-sm transition-colors ${mode === "otp" ? "bg-[#ff4d1c] text-white" : "bg-[#23232a] text-gray-300"}`}
            onClick={() => setMode("otp")}
          >
            OTP Login
          </button>
        </div>
        {/* Forms */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="w-full">
            <label className="block text-white text-sm font-semibold mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#23232a] text-white placeholder-gray-400 border border-[#23232a] focus:outline-none focus:ring-2 focus:ring-[#ff4d1c]"
            />
            <label className="block text-white text-sm font-semibold mb-1">Password</label>
            <div className="relative mb-2">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-md bg-[#23232a] text-white placeholder-gray-400 border border-[#23232a] focus:outline-none focus:ring-2 focus:ring-[#ff4d1c]"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  // Eye (visible)
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                  // Eye-off (hidden)
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.956 9.956 0 012.293-3.95m3.25-2.568A9.956 9.956 0 0112 5c4.478 0 8.269 2.943 9.543 7a9.97 9.97 0 01-4.423 5.568M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 9l18-18"/></svg>
                )}
              </span>
            </div>
            <div className="w-full text-right mb-4">
              <span
                onClick={() => setShowForgotModal(true)}
                className="text-[13px] text-[#ffb14d] hover:text-[#ff4d1c] cursor-pointer font-medium"
              >
                Forgot Password?
              </span>
            </div>
            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
            {msg && <p className="text-blue-500 mb-2 text-sm">{msg}</p>}
            <button
              type="submit"
              className="w-full py-3 mt-1 mb-2 font-semibold rounded-md bg-[#ff6b4d] text-white transition-colors duration-150 hover:bg-[#d63a1b] active:bg-[#d63a1b] focus:outline-none focus:ring-2 focus:ring-[#ff4d1c]"
            >
              Login
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-[#23232a]" />
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow h-px bg-[#23232a]" />
            </div>
            <button
              type="button"
              className="w-full py-3 font-semibold rounded-md bg-white text-black flex items-center justify-center gap-2 border border-[#4285F4] hover:bg-gray-100 transition-colors duration-150 mb-2"
              style={{ boxShadow: 'none' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.451h6.484a5.54 5.54 0 01-2.4 3.637v3.017h3.877c2.27-2.092 3.565-5.176 3.565-8.749z" fill="#4285F4"/>
                  <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.877-3.017c-1.077.72-2.453 1.15-4.073 1.15-3.13 0-5.78-2.112-6.73-4.946H1.54v3.09A11.997 11.997 0 0012.24 24z" fill="#34A853"/>
                  <path d="M5.51 14.277a7.19 7.19 0 010-4.554V6.633H1.54a12.004 12.004 0 000 10.734l3.97-3.09z" fill="#FBBC05"/>
                  <path d="M12.24 4.771c1.763 0 3.34.606 4.584 1.797l3.436-3.436C18.2 1.07 15.478 0 12.24 0 7.36 0 2.97 2.69 1.54 6.633l3.97 3.09c.95-2.834 3.6-4.946 6.73-4.946z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="24" height="24" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              Continue with Google
            </button>
          </form>
        )}
        {mode === "otp" && (
          <form onSubmit={handleOtpLogin} className="w-full">
            <label className="block text-white text-sm font-semibold mb-1">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#23232a] text-white placeholder-gray-400 border border-[#23232a] focus:outline-none focus:ring-2 focus:ring-[#ff4d1c]"
            />
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className={`w-full py-3 mb-2 font-semibold rounded-md ${sendingOtp ? "bg-blue-400 opacity-70 cursor-not-allowed" : "bg-[#ff6b4d] hover:bg-[#d63a1b] active:bg-[#d63a1b]"} text-white transition-colors duration-150`}
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
                      className="w-10 h-12 text-xl text-center rounded-md bg-[#23232a] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff4d1c]"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mb-2 text-center">
                  {otpExpired ? (
                    <span className="text-red-500">
                      OTP expired.{' '}
                      <span
                        className="text-blue-500 underline cursor-pointer"
                        onClick={handleSendOtp}
                      >
                        Resend
                      </span>
                    </span>
                  ) : (
                    <>Time left: <b className="text-blue-400">{otpTimer}s</b></>
                  )}
                </p>
                <button
                  type="submit"
                  className="w-full py-3 font-semibold rounded-md bg-[#ff6b4d] text-white hover:bg-[#d63a1b] active:bg-[#d63a1b] transition-colors duration-150"
                >
                  Login
                </button>
              </div>
            )}
            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
            {msg && <p className="text-blue-500 mb-2 text-sm">{msg}</p>}
          </form>
        )}
        {/* Register link */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          Don’t have an account?{' '}
          <span
            className="text-[#ffb14d] font-medium cursor-pointer hover:underline"
            onClick={() => setShowRegister(true)}
          >
            Register here
          </span>
        </div>
      </div>
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={() => setShowForgotModal(false)}
        apiSendOtp={apiSendOtp}
        apiVerifyOtp={apiVerifyOtp}
        apiResetPassword={apiResetPassword}
      />

      {/* Not Found Popup */}
      {showNotFoundPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#23232a', color: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
          }}>
            {/* Show error message at the top of the popup if present */}
            {error && (
              <div style={{ color: '#ff4d1c', fontWeight: 600, marginBottom: 16, fontSize: 16, textAlign: 'center' }}>{error}</div>
            )}
            <div style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 12 }}>Let's register</div>
            <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
              <RegisterDropdown router={router} setShowNotFoundPopup={setShowNotFoundPopup} />
              <button
                style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setShowNotFoundPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterDropdown({ router, setShowNotFoundPopup }) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(null); // 'Student' | 'Teacher' | 'Guardian' | null
  // Keep dropdown open as long as mouse is over button or dropdown
  const containerRef = React.useRef();
  return (
    <div
      style={{ position: 'relative', minWidth: 120 }}
      ref={containerRef}
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => { setDropdownOpen(false); setHovered(null); }}
    >
      <button
        style={{ background: '#ff6b4d', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 1, width: 120 }}
      >
        Register
      </button>
      {dropdownOpen && (
        <div
          style={{
            position: 'absolute', top: '110%', left: 0, background: '#18181b', borderRadius: 8, boxShadow: '0 2px 8px #0008', minWidth: 140, zIndex: 2,
            display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #333'
          }}
        >
          <DropdownItem label="Student" hovered={hovered === 'Student'} onMouseEnter={() => setHovered('Student')} onMouseLeave={() => setHovered(null)} onClick={() => { setShowNotFoundPopup(false); router.push('/student/register'); }} />
          <DropdownItem label="Teacher" hovered={hovered === 'Teacher'} onMouseEnter={() => setHovered('Teacher')} onMouseLeave={() => setHovered(null)} onClick={() => { setShowNotFoundPopup(false); router.push('/teacher/register'); }} />
          <DropdownItem label="Guardian" hovered={hovered === 'Guardian'} onMouseEnter={() => setHovered('Guardian')} onMouseLeave={() => setHovered(null)} onClick={() => { setShowNotFoundPopup(false); router.push('/guardian/register'); }} />
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, hovered, onMouseEnter, onMouseLeave, onClick }) {
  return (
    <button
      style={{
        background: hovered ? '#2d3748' : 'none',
        border: hovered ? '2px solid #ff6b4d' : 'none',
        color: '#fff',
        padding: '12px 18px',
        textAlign: 'left',
        fontWeight: 500,
        cursor: 'pointer',
        fontSize: 15,
        transition: 'background 0.2s, border 0.2s',
        width: '100%',
        borderRadius: hovered ? 6 : 0,
        margin: 0
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
      onKeyDown={e => { if (e.key === 'Enter') onClick(); }}
    >
      {label}
    </button>
  );
}
