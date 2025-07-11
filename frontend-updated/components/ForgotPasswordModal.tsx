import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "../utils/apiurl";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordModal({ open, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [otpExpired, setOtpExpired] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpTimer > 0 && !otpExpired) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else if (otpSent && otpTimer === 0) {
      setOtpExpired(true);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer, otpExpired]);

  const apiSendOtp = async (email: string) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to send OTP");
    return res.json();
  };
  const apiVerifyOtp = async (email: string, otp: string) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to verify OTP");
    return res.json();
  };
  const apiResetPassword = async (email: string, otp: string, password: string) => {
    const res = await fetch(`${BASE_API_URL}/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password })
    });
    if (!res.ok) throw new Error((await res.json()).message || "Failed to reset password");
    return res.json();
  };

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
    } catch (e: any) {
      setError(e.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpBlockChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      otpRefs[idx + 1].current?.focus();
    }
  };

  const handleOtpBlockKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (e: any) {
      setError(e.message || "Invalid OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  function getPasswordRequirements(password: string) {
    return {
      length: password.length >= 8 && password.length <= 30,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch (e: any) {
      setError(e.message || "Failed to reset password.");
    }
  };

  useEffect(() => {
    if (!open) {
      setStep(1);
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setOtpSent(false);
      setOtpTimer(120);
      setOtpExpired(false);
      setOtpVerified(false);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError("");
      setMsg("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
          aria-label="Close"
        >×</button>
        <div className="font-bold text-lg text-white mb-4 text-center">Forgot Password</div>
        {step === 1 && (
          <form onSubmit={e => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-[#222] text-white border border-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium disabled:opacity-60"
            >
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
            {msg && <div className="text-green-400 text-sm text-center">{msg}</div>}
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((val, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={e => handleOtpBlockChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpBlockKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg rounded-md bg-[#222] text-white border border-gray-700 focus:outline-none"
                />
              ))}
            </div>
            <div className="text-xs text-gray-400 text-center mb-2">
              {otpExpired ? (
                <span className="text-red-400 font-semibold cursor-pointer" onClick={handleSendOtp}>
                  OTP expired. Resend
                </span>
              ) : (
                <>OTP expires in <span className="text-blue-400 font-semibold">{Math.floor(otpTimer/60)}:{(otpTimer%60).toString().padStart(2,'0')}</span></>
              )}
            </div>
            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium disabled:opacity-60"
            >
              {verifyingOtp ? "Verifying..." : "Verify OTP"}
            </button>
            {msg && <div className="text-green-400 text-sm text-center">{msg}</div>}
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-[#222] text-white border border-gray-700 focus:outline-none"
              maxLength={30}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-[#222] text-white border border-gray-700 focus:outline-none"
              maxLength={30}
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} className="mr-1" />
                Show Password
              </label>
              <label className="flex items-center text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={showConfirmPassword} onChange={() => setShowConfirmPassword(v => !v)} className="mr-1" />
                Show Confirm
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium"
            >
              Reset Password
            </button>
            {msg && <div className="text-green-400 text-sm text-center">{msg}</div>}
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 