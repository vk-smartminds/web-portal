"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from "./apiurl";

const btnStyle = {
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "12px 0",
  fontSize: "1.1rem", fontWeight: 600, cursor: "pointer"
};
const inputStyle = {
  width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc"
};

export default function RegisterTeacher() {
  const [form, setForm] = useState({ name: '', email: '', otp: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/teacher/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
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

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      if (getPasswordSuggestions(form.password).length > 0) {
        setError('Password is not strong enough.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_API_URL}/teacher/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase(), otp: otpBlocks.join("") })
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        setTimeout(() => { 
          router.replace("/teacher/dashboard"); 
        }, 1200);
      } else {
        const data = await res.json(); setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  function getPasswordRequirements(password) {
    return {
      length: password.length >= 8 && password.length <= 30,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
  }
  function getPasswordSuggestions(password) {
    const req = getPasswordRequirements(password);
    const suggestions = [];
    if (!req.length) suggestions.push('8-30 characters');
    if (!req.uppercase) suggestions.push('an uppercase letter');
    if (!req.lowercase) suggestions.push('a lowercase letter');
    if (!req.number) suggestions.push('a number');
    return suggestions;
  }

  useEffect(() => {
    if (otpSent) setOtpTimer(120); // 2 minutes
  }, [otpSent]);
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        color: '#222',
        borderRadius: 18,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        padding: 40,
        minWidth: 340,
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ fontWeight: 700, fontSize: '2rem', color: '#222f5b', marginBottom: 8 }}>Teacher Registration</div>
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp} style={{ width: '100%' }}>
          <input type="text" name="name" placeholder="Teacher Name" value={form.name} onChange={handleChange} required disabled={otpSent} style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={otpSent} style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }} />
          {!otpSent ? (
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
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
                    style={{ width: 36, height: 44, textAlign: 'center', fontSize: 22, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#f7f8fa' }}
                  />
                ))}
              </div>
              {otpSent && (
                <div style={{ marginBottom: 8, color: otpTimer > 0 ? '#222f5b' : '#c00', fontWeight: 600, fontSize: 14 }}>
                  {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
              )}
              <input type="hidden" name="otp" value={otpBlocks.join("")} />
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Password' value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }} maxLength={30} />
                <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#222f5b', fontSize: 20, display: 'flex', alignItems: 'center' }} title={showPassword ? 'Hide password' : 'Show password'}>
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
                <div style={{ color: '#c00', fontSize: 13, marginTop: 4 }}>
                  Password must contain: {getPasswordSuggestions(form.password).join(', ')}
                </div>
              )}
              <button type="submit" disabled={!otpSent || otpTimer <= 0} style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginTop: 6, marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}>{loading ? 'Registering...' : 'Register'}</button>
              {otpSent && otpTimer <= 0 && (
                <button type="button" onClick={handleSendOtp} style={{ marginTop: 8, color: '#222f5b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
              )}
            </>
          )}
        </form>
        {msg && <div style={{ color: '#0a0', marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#f00', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

