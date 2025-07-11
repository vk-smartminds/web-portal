import React, { useState, useRef } from "react";

export default function ForgotPasswordModal({ open, onClose, onSuccess, apiSendOtp, apiVerifyOtp, apiResetPassword, vkPrimary = "#4a69bb", vkAccent = "#222f5b", vkGradient = "linear-gradient(135deg, #4a69bb 0%,rgb(77, 105, 198) 100%)", vkShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.18)", vkLightBlue = "#7ea6e6" }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = Array.from({ length: 6 }, () => useRef());
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes
  const [otpExpired, setOtpExpired] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // OTP timer effect
  React.useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0 && !otpExpired) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else if (otpSent && otpTimer === 0) {
      setOtpExpired(true);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer, otpExpired]);

  const handleSendOtp = async () => {
    setError("");
    setMsg("");
    setSendingOtp(true);
    try {
      await apiSendOtp(email);
      setOtpSent(true);
      setOtpTimer(120);
      setOtpExpired(false);
      setStep(2);
      setMsg("OTP sent to your email.");
    } catch (e) {
      setError(e.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpBlockChange = (idx, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      otpRefs[idx + 1].current?.focus();
    }
  };

  const handleOtpBlockKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (otpExpired) {
      setError("OTP expired. Please request a new OTP.");
      return;
    }
    setVerifyingOtp(true);
    try {
      await apiVerifyOtp(email, otp.join(""));
      setOtpVerified(true);
      setStep(3);
      setMsg("OTP verified. Please set your new password.");
    } catch (e) {
      setError(e.message || "Invalid OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Password requirements helper
  function getPasswordRequirements(password) {
    return {
      length: password.length >= 8 && password.length <= 30,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    const req = getPasswordRequirements(password);
    if (!req.length) {
      setError("Password must be 8-30 characters long.");
      return;
    }
    if (!req.uppercase) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!req.lowercase) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!req.number) {
      setError("Password must contain at least one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await apiResetPassword(email, otp.join(""), password);
      setMsg("Password reset successfully. You can now login.");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (e) {
      setError(e.message || "Failed to reset password.");
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(34,47,91,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 4000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: vkShadow,
        padding: 36,
        minWidth: 340,
        maxWidth: 370,
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 16, background: "#eee", color: vkAccent, border: "none",
            borderRadius: "50%", width: 32, height: 32, fontSize: 20, fontWeight: 700, cursor: "pointer"
          }}
          aria-label="Close"
        >×</button>
        <div style={{ fontWeight: 700, fontSize: "1.25rem", color: vkAccent, marginBottom: 16 }}>
          Forgot Password
        </div>
        {step === 1 && (
          <form onSubmit={e => { e.preventDefault(); handleSendOtp(); }} style={{ width: "100%" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                marginBottom: 16,
                borderRadius: 8,
                border: "1.5px solid #e0e0e0",
                fontSize: "1rem",
                background: "#f7f8fa"
              }}
            />
            <button
              type="submit"
              disabled={sendingOtp}
              style={{
                width: "100%",
                background: vkGradient,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: 8,
                cursor: sendingOtp ? "not-allowed" : "pointer",
                opacity: sendingOtp ? 0.7 : 1,
                boxShadow: "0 2px 8px #4a69bb22"
              }}
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpBlockChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpBlockKeyDown(idx, e)}
                  style={{
                    width: 36,
                    height: 44,
                    fontSize: 22,
                    textAlign: "center",
                    borderRadius: 7,
                    border: "1.5px solid #e0e0e0",
                    background: "#f7f8fa"
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 13, color: vkAccent, marginBottom: 6 }}>
                {otpExpired ? (
                  <span style={{ color: "#e74c3c", fontWeight: 500, fontFamily: 'Segoe UI', letterSpacing: 0.1 }}>
                    OTP expired.{' '}
                    <span
                      style={{
                        cursor: "pointer",
                        color: vkLightBlue,
                        fontWeight: 600,
                        textDecoration: "none",
                        borderBottom: `1.5px dotted ${vkLightBlue}`,
                        transition: 'color 0.18s',
                        fontSize: 14
                      }}
                      onMouseOver={e => e.currentTarget.style.color = vkPrimary}
                      onMouseOut={e => e.currentTarget.style.color = vkLightBlue}
                      onClick={handleSendOtp}
                    >
                      Resend
                    </span>
                  </span>
                ) : (
                  <span style={{ color: vkLightBlue, fontWeight: 500, fontFamily: 'Segoe UI', fontSize: 14 }}>
                    Time left: <b>{otpTimer}s</b>
                  </span>
                )}
            </div>
            <button
              type="submit"
              disabled={verifyingOtp}
              style={{
                width: "100%",
                background: vkGradient,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: 8,
                cursor: verifyingOtp ? "not-allowed" : "pointer",
                opacity: verifyingOtp ? 0.7 : 1,
                boxShadow: "0 2px 8px #4a69bb22"
              }}
            >
              {verifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e0e0e0",
                  fontSize: "1rem",
                  background: "#f7f8fa"
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: vkAccent,
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L21 21" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="11" cy="11" rx="9" ry="5.5" stroke="#222f5b" strokeWidth="2"/>
                    <circle cx="11" cy="11" r="2.5" stroke="#222f5b" strokeWidth="2"/>
                  </svg>
                )}
              </span>
            </div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1.5px solid #e0e0e0",
                  fontSize: "1rem",
                  background: "#f7f8fa"
                }}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: vkAccent,
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L21 21" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="11" cy="11" rx="9" ry="5.5" stroke="#222f5b" strokeWidth="2"/>
                    <circle cx="11" cy="11" r="2.5" stroke="#222f5b" strokeWidth="2"/>
                  </svg>
                )}
              </span>
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                background: vkGradient,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: 8,
                cursor: "pointer",
                boxShadow: "0 2px 8px #4a69bb22"
              }}
            >
              Confirm
            </button>
          </form>
        )}
        {error && <div style={{ color: "#e74c3c", marginBottom: 10, fontSize: 14 }}>{error}</div>}
        {msg && <div style={{ color: vkPrimary, marginBottom: 10, fontSize: 14 }}>{msg}</div>}
      </div>
    </div>
  );
} 