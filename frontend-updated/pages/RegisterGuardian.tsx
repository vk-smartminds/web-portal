"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from "../utils/apiurl";

export default function RegisterGuardian() {
  // State for child email verification
  const [childEmail, setChildEmail] = useState("");
  const [childOtpSent, setChildOtpSent] = useState(false);
  const [childOtp, setChildOtp] = useState(["", "", "", "", "", ""]);
  const childOtpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const [childOtpTimer, setChildOtpTimer] = useState(0);
  const [childVerified, setChildVerified] = useState(false);

  // State for guardian registration
  const [form, setForm] = useState({ name: '', email: '', password: '', child: '', role: 'Guardian' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const [otpTimer, setOtpTimer] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Password strength helpers
  function getPasswordRequirements(password: string) {
    return {
      length: password.length >= 8 && password.length <= 30,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
  }
  function getPasswordSuggestions(password: string) {
    const req = getPasswordRequirements(password);
    const suggestions = [];
    if (!req.length) suggestions.push('8-30 characters');
    if (!req.uppercase) suggestions.push('an uppercase letter');
    if (!req.lowercase) suggestions.push('a lowercase letter');
    if (!req.number) suggestions.push('a number');
    return suggestions;
  }

  // Child OTP logic
  const handleSendChildOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-child-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase() })
      });
      if (res.ok) {
        setChildOtpSent(true); setMsg("OTP sent to child email.");
        setChildOtpTimer(120);
      } else {
        const data = await res.json();
        if (res.status === 404 && (data.message || "").toLowerCase().includes("student")) {
          setError("No student found with this email. Please register the student first.");
        } else {
          setError(data.message || "Failed to send child OTP.");
        }
      }
    } catch {
      setError("Failed to send child OTP. Please try again.");
    }
    setLoading(false);
  };
  const handleChildOtpBlockChange = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...childOtp];
    newBlocks[idx] = val;
    setChildOtp(newBlocks);
    if (val && idx < 5) childOtpRefs[idx + 1].current?.focus();
  };
  const handleChildOtpBlockKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !childOtp[idx] && idx > 0) {
      childOtpRefs[idx - 1].current?.focus();
    }
  };
  const handleVerifyChildOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/verify-child-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase(), otp: childOtp.join("") })
      });
      if (res.ok) {
        setChildVerified(true); setMsg("Child email verified. Continue registration.");
        setForm(f => ({ ...f, child: childEmail }));
      } else {
        const data = await res.json();
        setError(data.message || "Child OTP verification failed.");
      }
    } catch {
      setError("Child OTP verification failed. Please try again.");
    }
    setLoading(false);
  };
  useEffect(() => { if (childOtpSent) setChildOtpTimer(120); }, [childOtpSent]);
  useEffect(() => {
    if (!childOtpSent || childOtpTimer <= 0) return;
    const interval = setInterval(() => setChildOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [childOtpSent, childOtpTimer]);
  useEffect(() => {
    setChildOtp(["", "", "", "", "", ""]);
    setChildOtpSent(false);
    setChildOtpTimer(0);
    setChildVerified(false);
    setError("");
    setMsg("");
  }, [childEmail]);

  // Guardian registration logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOtpBlockChange = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...otpBlocks];
    newBlocks[idx] = val;
    setOtpBlocks(newBlocks);
    if (val && idx < 5) otpRefs[idx + 1].current?.focus();
  };
  const handleOtpBlockKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpBlocks[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-register-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), allowGuardian: true })
      });
      if (res.ok) {
        setOtpSent(true); setMsg("OTP sent to your email.");
        setOtpBlocks(["", "", "", "", "", ""]);
        setOtpTimer(120);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    if (!form.name.trim()) {
      setError("Parent name is required.");
      setLoading(false);
      return;
    }
    try {
      const verifyRes = await fetch(`${BASE_API_URL}/verify-register-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: otpBlocks.join("") })
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.message || "Invalid OTP."); setLoading(false); return;
      }
      const res = await fetch(`${BASE_API_URL}/register-guardian`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          otp: otpBlocks.join(""),
          child: form.child ? [form.child] : [],
          role: form.role
        })
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting to login...");
        setTimeout(() => router.replace("/login"), 1200);
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };
  useEffect(() => { if (otpSent) setOtpTimer(120); }, [otpSent]);
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // UI rendering
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center relative">
        <div className="text-2xl font-bold text-[#222f5b] mb-2">Guardian Registration</div>
        {/* Child email/OTP verification step */}
        {!childVerified ? (
          <form onSubmit={childOtpSent ? handleVerifyChildOtp : handleSendChildOtp} className="w-full">
            <input type="email" name="childEmail" placeholder="Child Email (required)" value={childEmail} onChange={e => setChildEmail(e.target.value)} required disabled={childOtpSent} className="w-full px-4 py-3 mb-3 rounded-lg border border-gray-200 bg-[#f7f8fa] text-base" />
            {/* Show OTP input and verify button only after OTP is sent */}
            {!childOtpSent ? (
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-base mb-2 shadow-md transition">{loading ? 'Sending OTP...' : 'Send OTP to Child'}</button>
            ) : (
              <>
                <div className="flex gap-2 justify-center mb-2">
                  {childOtp.map((v, i) => (
                    <input
                      key={i}
                      ref={childOtpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={e => handleChildOtpBlockChange(i, e.target.value)}
                      onKeyDown={e => handleChildOtpBlockKeyDown(i, e)}
                      className="w-9 h-11 text-center text-lg rounded-md border border-gray-200 bg-[#f7f8fa]"
                    />
                  ))}
                </div>
                <div className="mb-2 text-sm font-semibold" style={{ color: childOtpTimer > 0 ? '#222f5b' : '#c00' }}>
                  {childOtpTimer > 0 ? `OTP expires in ${Math.floor(childOtpTimer/60)}:${(childOtpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
                <button type="submit" disabled={loading || childOtpTimer <= 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-base mb-2 shadow-md transition">Verify Child OTP</button>
                {childOtpSent && childOtpTimer <= 0 && (
                  <button type="button" onClick={handleSendChildOtp} className="mt-2 text-blue-700 font-semibold bg-none border-none cursor-pointer">Resend OTP</button>
                )}
              </>
            )}
            {error && <div className="text-red-600 mt-3 font-medium">{error}</div>}
            {msg && <div className="text-green-600 mt-3 font-medium">{msg}</div>}
          </form>
        ) : (
          // Guardian registration form (only after childVerified)
          <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="w-full">
            <input type="text" name="name" placeholder="Parent Name" value={form.name} onChange={handleChange} required disabled={otpSent} className="w-full px-4 py-3 mb-3 rounded-lg border border-gray-200 bg-[#f7f8fa] text-base" />
            <input type="email" name="child" placeholder="Child Email (required)" value={childEmail} readOnly required className="w-full px-4 py-3 mb-3 rounded-lg border border-gray-200 bg-[#f7f8fa] text-base" />
            <input type="email" name="email" placeholder="Parent Email" value={form.email} onChange={handleChange} required disabled={otpSent} className="w-full px-4 py-3 mb-3 rounded-lg border border-gray-200 bg-[#f7f8fa] text-base" />
            <div className="relative mb-3">
              <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Password' value={form.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-[#f7f8fa] text-base pr-10" maxLength={30} disabled={otpSent} />
              <span onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" title={showPassword ? 'Hide password' : 'Show password'}>
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
            {form.password && getPasswordSuggestions(form.password).length > 0 && (
              <div className="text-red-600 text-xs mt-1">
                Password must contain: {getPasswordSuggestions(form.password).join(', ')}
              </div>
            )}
            {/* OTP for parent email */}
            {!otpSent ? (
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-base mb-2 shadow-md transition">{loading ? 'Sending OTP...' : 'Send OTP'}</button>
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
                      className="w-9 h-11 text-center text-lg rounded-md border border-gray-200 bg-[#f7f8fa]"
                    />
                  ))}
                </div>
                {otpSent && (
                  <div className="mb-2 text-sm font-semibold" style={{ color: otpTimer > 0 ? '#222f5b' : '#c00' }}>
                    {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                  </div>
                )}
                <button type="submit" disabled={!otpSent || otpTimer <= 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-base mt-2 mb-2 shadow-md transition">{loading ? 'Registering...' : 'Register'}</button>
                {otpSent && otpTimer <= 0 && (
                  <button type="button" onClick={handleSendOtp} className="mt-2 text-blue-700 font-semibold bg-none border-none cursor-pointer">Resend OTP</button>
                )}
              </>
            )}
            {msg && <div className="text-green-600 mt-3 font-medium">{msg}</div>}
            {error && <div className="text-red-600 mt-3 font-medium">{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 