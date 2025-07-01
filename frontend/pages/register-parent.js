"use client";
import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "./apiurl";
import { useRouter } from "next/navigation";
import { getToken, isAuthenticated, isTokenExpired } from "../utils/auth.js";

const btnStyle = {
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 0",
  fontSize: "1.1rem",
  fontWeight: 600,
  cursor: "pointer",
};
const inputStyle = {
  width: "100%",
  padding: 8,
  margin: "8px 0",
  borderRadius: 6,
  border: "1px solid #ccc",
};

export default function RegisterParent() {
  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState("");
  const [childOtpBlocks, setChildOtpBlocks] = useState(["", "", "", "", "", ""]);
  const childOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [childOtpSent, setChildOtpSent] = useState(false);
  const [childOtpVerified, setChildOtpVerified] = useState(false);
  const [childOtpTimer, setChildOtpTimer] = useState(0);

  // Guardian info
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianPassword, setGuardianPassword] = useState("");
  const [guardianOtpBlocks, setGuardianOtpBlocks] = useState(["", "", "", "", "", ""]);
  const guardianOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [guardianOtpSent, setGuardianOtpSent] = useState(false);
  const [guardianOtpVerified, setGuardianOtpVerified] = useState(false);
  const [guardianOtpTimer, setGuardianOtpTimer] = useState(0);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showStudentRegister, setShowStudentRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [childClass, setChildClass] = useState("");

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = getToken();
    if (isAuthenticated() && !isTokenExpired(token)) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'student') router.replace('/student/dashboard');
        else if (role === 'teacher') router.replace('/teacher/dashboard');
        else if (role === 'parent') router.replace('/parent/dashboard');
        else router.replace('/login');
      } catch {}
    }
  }, [router]);
  
  useEffect(() => {
    if (childOtpSent) setChildOtpTimer(120); // 2 minutes
  }, [childOtpSent]);
  useEffect(() => {
    if (!childOtpSent || childOtpTimer <= 0) return;
    const interval = setInterval(() => setChildOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [childOtpSent, childOtpTimer]);
  useEffect(() => {
    if (guardianOtpSent) setGuardianOtpTimer(120); // 2 minutes
  }, [guardianOtpSent]);
  useEffect(() => {
    if (!guardianOtpSent || guardianOtpTimer <= 0) return;
    const interval = setInterval(() => setGuardianOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [guardianOtpSent, guardianOtpTimer]);

  // Step 1: Verify child email and send OTP
  const handleChildEmailSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/parent/verify-child-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childEmail: childEmail.trim().toLowerCase(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setChildOtpSent(true);
        setChildClass("");
        setMsg("Child found. OTP sent to child email.");
      } else {
        setError(data.message || "Child verification failed");
        setShowStudentRegister(true); // Show register student option if not found
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP sent to child email
  const handleChildOtpVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    const otp = childOtpBlocks.join("");
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to child email.");
      setLoading(false);
      return;
    }
    // Verify OTP with backend
    try {
      const res = await fetch(`${BASE_API_URL}/parent/verify-child-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childEmail: childEmail.trim().toLowerCase(),
          otp
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChildOtpVerified(true);
        setStep(2);
        setMsg("Child email verified. Please complete your registration.");
      } else {
        setError(data.message || "Invalid or expired OTP.");
      }
    } catch {
      setError("OTP verification failed. Please try again.");
    }
    setLoading(false);
  };

  // Step 2: Guardian info and OTP
  const handleGuardianInfoSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    // Check if guardian email already exists
    try {
      const checkRes = await fetch(`${BASE_API_URL}/user/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guardianEmail.trim().toLowerCase() }),
      });
      if (checkRes.ok) {
        setError("Email already registered.");
        setLoading(false);
        return;
      }
    } catch {}
    // Send OTP to guardian email
    try {
      const res = await fetch(`${BASE_API_URL}/user/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guardianEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setGuardianOtpSent(true);
        setMsg("OTP sent to your email.");
      } else {
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
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

  const handleOtpBlockChange = (blocks, setBlocks, refs, idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newBlocks = [...blocks];
    newBlocks[idx] = val;
    setBlocks(newBlocks);
    if (val && idx < 5) refs[idx + 1].current.focus();
  };

  const handleOtpBlockKeyDown = (blocks, refs, idx, e) => {
    if (e.key === "Backspace" && !blocks[idx] && idx > 0) {
      refs[idx - 1].current.focus();
    }
  };

  const handleGuardianOtpVerifyAndRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    // Verify OTP
    try {
      const res = await fetch(`${BASE_API_URL}/user/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: guardianEmail.trim().toLowerCase(),
          otp: guardianOtpBlocks.join(""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid or expired OTP.");
        setLoading(false);
        return;
      }
    } catch {
      setError("OTP verification failed. Please try again.");
      setLoading(false);
      return;
    }
    // Check password strength
    if (getPasswordSuggestions(guardianPassword).length > 0) {
      setError('Password is not strong enough.');
      setLoading(false);
      return;
    }
    // Register guardian
    try {
      const res = await fetch(`${BASE_API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guardianName,
          email: guardianEmail.trim().toLowerCase(),
          password: guardianPassword,
          otp: guardianOtpBlocks.join(""),
          registeredAs: "Parent",
          childEmail: childEmail.trim().toLowerCase(),
          childClass: childClass.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        // Store JWT and user data if provided
        if (data.token) {
          localStorage.setItem('jwt_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user));
        }
        localStorage.setItem("userEmail", guardianEmail.trim().toLowerCase());
        setTimeout(() => {
          router.replace("/parent/dashboard");
        }, 1200);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

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
        <div style={{ fontWeight: 700, fontSize: '2rem', color: '#222f5b', marginBottom: 8 }}>Guardian Registration</div>
        {step === 1 && (
          <form
            onSubmit={childOtpSent ? handleChildOtpVerify : handleChildEmailSubmit}
          >
            <input
              type="email"
              placeholder="Enter your child's registered email"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required
              disabled={childOtpSent}
              style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }}
            />
            {!childOtpSent ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}
                >
                  {loading ? "Verifying..." : "Verify Child Email"}
                </button>
                {/* Show Register Student option if student not found */}
                {showStudentRegister && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ color: "#c00", marginBottom: 8 }}>
                      Do you want to register the student?
                    </div>
                    <button
                      type="button"
                      style={{
                        ...btnStyle,
                        background: "linear-gradient(90deg, #1e3c72 0%, #ff0080 100%)",
                        width: "100%",
                      }}
                      onClick={() => {
                        setShowStudentRegister(false);
                        // Redirect to login page (as per your request)
                        window.location.href = "/Login";
                      }}
                    >
                      Register Student
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                  {childOtpBlocks.map((v, i) => (
                    <input
                      key={i}
                      ref={childOtpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={e => handleOtpBlockChange(childOtpBlocks, setChildOtpBlocks, childOtpRefs, i, e.target.value)}
                      onKeyDown={e => handleOtpBlockKeyDown(childOtpBlocks, childOtpRefs, i, e)}
                      style={{ width: 36, height: 44, textAlign: 'center', fontSize: 22, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#f7f8fa' }}
                    />
                  ))}
                </div>
                <input type="hidden" name="childOtp" value={childOtpBlocks.join("")} />
                <div style={{ marginBottom: 8, color: childOtpTimer > 0 ? '#222f5b' : '#c00', fontWeight: 600, fontSize: 14 }}>
                  {childOtpTimer > 0 ? `OTP expires in ${Math.floor(childOtpTimer/60)}:${(childOtpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
                <button
                  type="submit"
                  disabled={!childOtpSent || childOtpTimer <= 0}
                  style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}
                >
                  {loading ? "Verifying OTP..." : "Verify OTP"}
                </button>
                {childOtpSent && childOtpTimer <= 0 && (
                  <button type="button" onClick={handleChildEmailSubmit} style={{ marginTop: 8, color: '#222f5b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
                )}
              </>
            )}
          </form>
        )}
        {step === 2 && (
          <form onSubmit={guardianOtpSent ? handleGuardianOtpVerifyAndRegister : handleGuardianInfoSubmit}>
            <input
              type="text"
              placeholder="Guardian Name"
              value={guardianName}
              onChange={e => setGuardianName(e.target.value)}
              required
              disabled={guardianOtpSent}
              style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }}
            />
            <input
              type="email"
              placeholder="Guardian Email"
              value={guardianEmail}
              onChange={e => setGuardianEmail(e.target.value)}
              required
              disabled={guardianOtpSent}
              style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }}
            />
            <input
              type="text"
              placeholder="Enter your child's class (e.g. 5A, 10, etc.)"
              value={childClass}
              onChange={e => setChildClass(e.target.value)}
              required
              disabled={guardianOtpSent}
              style={inputStyle}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={guardianPassword}
                onChange={e => setGuardianPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }}
                disabled={guardianOtpSent}
                maxLength={30}
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 12, top: 14, cursor: 'pointer', userSelect: 'none', color: '#888', fontSize: 18 }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            {guardianPassword && getPasswordSuggestions(guardianPassword).length > 0 && (
              <div style={{ color: '#c00', fontSize: 13, marginTop: 4 }}>
                Password must contain: {getPasswordSuggestions(guardianPassword).join(', ')}
              </div>
            )}
            {!guardianOtpSent ? (
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}>
                {loading ? "Sending OTP..." : "Send OTP to Guardian Email"}
              </button>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                  {guardianOtpBlocks.map((v, i) => (
                    <input
                      key={i}
                      ref={guardianOtpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={e => handleOtpBlockChange(guardianOtpBlocks, setGuardianOtpBlocks, guardianOtpRefs, i, e.target.value)}
                      onKeyDown={e => handleOtpBlockKeyDown(guardianOtpBlocks, guardianOtpRefs, i, e)}
                      style={{ width: 36, height: 44, textAlign: 'center', fontSize: 22, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#f7f8fa' }}
                    />
                  ))}
                </div>
                <input type="hidden" name="guardianOtp" value={guardianOtpBlocks.join("")} />
                <div style={{ marginBottom: 8, color: guardianOtpTimer > 0 ? '#222f5b' : '#c00', fontWeight: 600, fontSize: 14 }}>
                  {guardianOtpTimer > 0 ? `OTP expires in ${Math.floor(guardianOtpTimer/60)}:${(guardianOtpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
                <button type="submit" disabled={!guardianOtpSent || guardianOtpTimer <= 0} style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginTop: 6, marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}>
                  {loading ? "Verifying & Registering..." : "Verify OTP & Register"}
                </button>
                {guardianOtpSent && guardianOtpTimer <= 0 && (
                  <button type="button" onClick={handleGuardianInfoSubmit} style={{ marginTop: 8, color: '#222f5b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
                )}
              </>
            )}
          </form>
        )}
        {msg && (
          <div style={{ color: "#0a0", marginTop: 12 }}>{msg}</div>
        )}
        {error && (
          <div style={{ color: "#f00", marginTop: 12 }}>{error}</div>
        )}
      </div>
    </div>
  );
}

