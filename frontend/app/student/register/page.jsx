'use client';

import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "../../../utils/apiurl";
import { useRouter } from "next/navigation";

function getPasswordRequirements(password) {
  return {
    length: password.length >= 8 && password.length <= 30,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

function getPasswordSuggestions(password) {
  const req = getPasswordRequirements(password);
  const suggestions = [];
  if (!req.length) suggestions.push("8-30 characters");
  if (!req.uppercase) suggestions.push("an uppercase letter");
  if (!req.lowercase) suggestions.push("a lowercase letter");
  if (!req.number) suggestions.push("a number");
  return suggestions;
}

export default function RegisterStudent() {
  const [form, setForm] = useState({
    name: '', email: '', school: '', class: '', otp: '', password: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOtpBlockChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...otpBlocks];
    newBlocks[idx] = val;
    setOtpBlocks(newBlocks);
    if (val && idx < 5) otpRefs[idx + 1].current.focus();
  };

  const handleOtpBlockKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpBlocks[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (res.ok) {
        setOtpSent(true); setMsg("OTP sent to your email.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      if (getPasswordSuggestions(form.password).length > 0) {
        setError('Password is not strong enough.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_API_URL}/register-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase(),
          otp: otpBlocks.join("")
        })
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        setTimeout(() => router.replace("/student/dashboard"), 1200);
      } else {
        const data = await res.json(); setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (otpSent) setOtpTimer(120);
  }, [otpSent]);

  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-white flex items-center justify-center">
      <div className="bg-[#1e293b] text-white rounded-[18px] shadow-xl px-10 py-10 w-full max-w-md flex flex-col items-center relative">
        <div className="font-bold text-2xl text-white mb-2">Student Registration</div>
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp} className="w-full">
          <input type="text" name="name" placeholder="Student Name" value={form.name} onChange={handleChange} required disabled={otpSent} className="w-full p-3 mb-3 rounded-lg border border-gray-600 text-base bg-[#0f172a] placeholder-gray-400" />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={otpSent} className="w-full p-3 mb-3 rounded-lg border border-gray-600 text-base bg-[#0f172a] placeholder-gray-400" />
          <input type="text" name="school" placeholder="School (optional)" value={form.school} onChange={handleChange} disabled={otpSent} className="w-full p-3 mb-3 rounded-lg border border-gray-600 text-base bg-[#0f172a] placeholder-gray-400" />
          <input type="text" name="class" placeholder="Class" value={form.class} onChange={handleChange} required disabled={otpSent} className="w-full p-3 mb-3 rounded-lg border border-gray-600 text-base bg-[#0f172a] placeholder-gray-400" />

          {!otpSent ? (
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-lg mb-2 shadow-md disabled:cursor-not-allowed">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          ) : (
            <>
              <div className="flex gap-2 justify-center mb-2">
                {otpBlocks.map((v, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={e => handleOtpBlockChange(i, e.target.value)}
                    onKeyDown={e => handleOtpBlockKeyDown(i, e)}
                    className="w-9 h-11 text-center text-xl rounded-md border border-gray-600 bg-[#0f172a] text-white"
                  />
                ))}
              </div>
              {otpSent && (
                <div className={`mb-2 font-semibold text-sm ${otpTimer > 0 ? 'text-white' : 'text-red-400'}`}>
                  {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
              )}
              <div className="relative mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Password'
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pr-10 rounded-lg border border-gray-600 text-base bg-[#0f172a] text-white placeholder-gray-400"
                  maxLength={30}
                  disabled={otpTimer <= 0}
                />
                <span
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 text-lg"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {form.password && getPasswordSuggestions(form.password).length > 0 && (
                <div className="text-red-400 text-sm mt-1">
                  Password must contain: {getPasswordSuggestions(form.password).join(', ')}
                </div>
              )}
              <button
                type="submit"
                disabled={!otpSent || otpTimer <= 0}
                className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-lg mt-2 mb-2 shadow-md"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
              {otpSent && otpTimer <= 0 && (
                <button type="button" onClick={handleSendOtp} className="text-blue-300 font-semibold mt-2">
                  Resend OTP
                </button>
              )}
            </>
          )}
        </form>
        {msg && <div className="text-green-400 mt-3">{msg}</div>}
        {error && <div className="text-red-400 mt-3">{error}</div>}
      </div>
    </div>
  );
}