"use client";
import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "./apiurl";
import { useRouter } from "next/navigation";

const btnStyle = {
  background: "linear-gradient(90deg, #ff0080 0%, #1e3c72 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "12px 0",
  fontSize: "1.1rem", fontWeight: 600, cursor: "pointer"
};
const inputStyle = {
  width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc"
};

export default function RegisterGuardian() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', otp: '', role: '', child: ''
  });
  const [childEmail, setChildEmail] = useState("");
  const [childOtpSent, setChildOtpSent] = useState(false);
  const [childOtp, setChildOtp] = useState(["", "", "", "", "", ""]);
  const childOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [childOtpTimer, setChildOtpTimer] = useState(0);
  const [childVerified, setChildVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // <-- FIX: add this state
  const [msg, setMsg] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleSendOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-register-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (res.ok) {
        setOtpSent(true); setMsg("OTP sent to your email.");
        setOtpBlocks(["", "", "", "", "", ""]); // Clear OTP input boxes on resend
        setOtpTimer(120); // Reset OTP timer on resend
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      // Verify OTP first
      const verifyRes = await fetch(`${BASE_API_URL}/verify-register-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: otpBlocks.join("") })
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.message || "Invalid OTP."); setLoading(false); return;
      }
      // Register Guardian
      const res = await fetch(`${BASE_API_URL}/register-guardian`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include', // Ensure cookies/session are sent
        body: JSON.stringify({
          name: form.name,
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone,
          otp: otpBlocks.join(""),
          role: form.role,
          child: form.child ? [form.child] : []
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

  // Child OTP handlers
  const handleSendChildOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-child-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include', // Ensure cookie is set
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

  const handleChildOtpBlockChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...childOtp];
    newBlocks[idx] = val;
    setChildOtp(newBlocks);
    if (val && idx < 5) childOtpRefs[idx + 1].current.focus();
  };

  const handleChildOtpBlockKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !childOtp[idx] && idx > 0) {
      childOtpRefs[idx - 1].current.focus();
    }
  };

  const handleVerifyChildOtp = async e => {
    e.preventDefault();
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/verify-child-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: 'include', // Ensure cookie is set
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase(), otp: childOtp.join("") })
      });
      if (res.ok) {
        setChildVerified(true); setMsg("Child email verified. Continue registration.");
      } else {
        const data = await res.json();
        setError(data.message || "Child OTP verification failed.");
      }
    } catch {
      setError("Child OTP verification failed. Please try again.");
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
  useEffect(() => {
    if (childOtpSent) setChildOtpTimer(120);
  }, [childOtpSent]);
  useEffect(() => {
    if (!childOtpSent || childOtpTimer <= 0) return;
    const interval = setInterval(() => setChildOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [childOtpSent, childOtpTimer]);
  // When child is verified, always set form.child to childEmail
  useEffect(() => {
    if (childVerified && childEmail) {
      setForm(f => ({ ...f, child: childEmail }));
    }
  }, [childVerified, childEmail]);
  // Check with backend if child verification cookie is valid for autofilled child email
  useEffect(() => {
    async function checkChildVerified() {
      if (childEmail) {
        try {
          const res = await fetch(`${BASE_API_URL}/check-child-verified?childEmail=${encodeURIComponent(childEmail)}`, {
            credentials: 'include'
          });
          const data = await res.json();
          setChildVerified(!!data.verified);
        } catch {
          setChildVerified(false);
        }
      }
    }
    checkChildVerified();
  }, [childEmail]);
  useEffect(() => {
    setChildVerified(false);
    setChildOtpSent(false);
    setChildOtp(["", "", "", "", "", ""]);
    setChildOtpTimer(0);
    // Optionally, clear backend cookie here if needed
    // fetch(`${BASE_API_URL}/clear-child-verified`, { method: 'POST', credentials: 'include' });
  }, []);

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", background: "#f8fafc", borderRadius: 18, padding: 36, boxShadow: "0 4px 32px 0 rgba(31, 38, 135, 0.13)", fontFamily: 'Segoe UI, sans-serif', transition: 'box-shadow 0.2s' }}>
      <h2 style={{ color: "#1e3c72", marginBottom: 22, fontWeight: 700, letterSpacing: 1 }}>Guardian Registration</h2>
      {!childVerified ? (
        <form onSubmit={childOtpSent ? handleVerifyChildOtp : handleSendChildOtp}>
          <input style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="childEmail" placeholder="Child Email (required)" value={childEmail} onChange={e => setChildEmail(e.target.value)} required disabled={childOtpSent || childVerified} readOnly={childVerified} />
          {/* Info card for child email requirement, only show if not verified and no error */}
          {(!childVerified && (!childEmail || !childVerified) && !error) && (
            <div style={{
              background: '#fffbe6',
              color: '#b45309',
              borderRadius: 10,
              padding: '10px 14px',
              marginTop: 14,
              fontWeight: 500,
              fontSize: 15,
              boxShadow: '0 2px 8px #f3e8d2',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
              opacity: 1,
              animation: 'fadeIn 0.5s',
            }}>
              <span style={{display:'flex',alignItems:'center',gap:8}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fde68a"/><path d="M12 8v4m0 4h.01" stroke="#b45309" strokeWidth="2" strokeLinecap="round"/></svg>
                Child email is required for Guardian registration
              </span>
            </div>
          )}
          {!childOtpSent ? (
            <button type="submit" style={{ ...btnStyle, width: '100%', marginTop: 8 }}>{loading ? 'Sending OTP...' : 'Send OTP to Child'}</button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
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
                    style={{ width: 40, height: 40, textAlign: 'center', fontSize: 22, borderRadius: 8, border: '1.5px solid #b6c6e3', background: '#fff', boxShadow: '0 1px 4px #e3e8f0' }}
                  />
                ))}
              </div>
              <div style={{ marginBottom: 10, color: childOtpTimer > 0 ? '#2563eb' : '#f59e42', fontWeight: 600, fontSize: 15 }}>
                {childOtpTimer > 0 ? `OTP expires in ${Math.floor(childOtpTimer/60)}:${(childOtpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
              </div>
              <button type="submit" style={{ ...btnStyle, width: '100%' }} disabled={loading || childOtpTimer <= 0}>Verify Child OTP</button>
              {childOtpSent && childOtpTimer <= 0 && (
                <button type="button" onClick={handleSendChildOtp} style={{ marginTop: 10, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
              )}
            </>
          )}
          {error && (
            <div style={{ background: '#fffbe6', color: '#b45309', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #f3e8d2' }}>
              {error}
              {error.includes('No student found') && (
                <button
                  type="button"
                  style={{ ...btnStyle, marginTop: 12, background: '#2563eb', width: '100%' }}
                  onClick={() => window.location.href = `/register-student?email=${encodeURIComponent(childEmail)}`}
                >
                  Register Student
                </button>
              )}
            </div>
          )}
          {msg && <div style={{ background: '#e0f7fa', color: '#047857', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #b2f5ea' }}>{msg}</div>}
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <input style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="phone" placeholder="Phone (10 digits)" value={form.phone} onChange={handleChange} pattern="\d{10}" required />
          <input style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={handleChange} required />
          <select style={{ ...inputStyle, background: '#fff', border: '1.5px solid #b6c6e3' }} name="role" value={form.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Guardian">Guardian</option>
          </select>
          <input style={{ ...inputStyle, background: '#f1f5f9', border: '1.5px solid #b6c6e3', color: '#64748b' }} name="child" placeholder="Child Email (required)" value={childEmail} readOnly required />
          {!otpSent ? (
            <button type="button" style={{ ...btnStyle, width: '100%', marginTop: 8 }} onClick={handleSendOtp} disabled={loading}>Send OTP</button>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
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
                    style={{ width: 40, height: 40, textAlign: 'center', fontSize: 22, borderRadius: 8, border: '1.5px solid #b6c6e3', background: '#fff', boxShadow: '0 1px 4px #e3e8f0' }}
                  />
                ))}
              </div>
              <div style={{ marginBottom: 10, color: otpTimer > 0 ? '#2563eb' : '#f59e42', fontWeight: 600, fontSize: 15 }}>
                {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
              </div>
              {otpSent && otpTimer <= 0 && (
                <button type="button" onClick={handleSendOtp} style={{ marginBottom: 10, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'block', width: '100%' }}>Resend OTP</button>
              )}
              <button type="submit" style={{ ...btnStyle, width: '100%' }} disabled={loading || otpTimer <= 0 || !childVerified}>Register</button>
              {!childVerified && (
                <div style={{ background: '#fffbe6', color: '#b45309', borderRadius: 8, padding: '10px 14px', marginTop: 10, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #f3e8d2', textAlign: 'center' }}>
                  Please verify your child's email before completing registration.
                </div>
              )}
            </>
          )}
          {msg && <div style={{ background: '#e0f7fa', color: '#047857', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #b2f5ea' }}>{msg}</div>}
          {error && <div style={{ background: '#fffbe6', color: '#b45309', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontWeight: 500, fontSize: 15, boxShadow: '0 1px 4px #f3e8d2' }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
