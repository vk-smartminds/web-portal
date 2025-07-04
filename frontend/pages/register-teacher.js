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

function AnimatedSendOtpButton({ loading, children, ...props }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0, active: false });
  const btnRef = useRef();
  function handleMouseMove(e) {
    const rect = btnRef.current.getBoundingClientRect();
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    });
  }
  function handleMouseLeave() {
    setMouse(m => ({ ...m, active: false }));
  }
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    if (clicked) {
      const timeout = setTimeout(() => setClicked(false), 700);
      return () => clearTimeout(timeout);
    }
  }, [clicked]);
  return (
    <button
      type="submit"
      disabled={loading}
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setClicked(true)}
      style={{
        position: "relative",
        padding: "20px 35px",
        background: "linear-gradient(90deg, #2563eb 0%, #1e40af 100%)", // blue gradient
        fontSize: "20px",
        fontWeight: 600,
        color: "#fff",
        boxShadow: "0px 0px 10px 0px #2563eb44",
        borderRadius: "100px",
        border: "none",
        transition: "all 0.3s ease-in-out",
        cursor: loading ? "not-allowed" : "pointer",
        width: "100%",
        marginBottom: 8,
        outline: "none",
        overflow: "hidden"
      }}
      className={`animated-otp-btn${clicked ? " animated-otp-btn-clicked" : ""}`}
      {...props}
    >
      <span
        className="otp-btn-multicolor"
        style={{
          pointerEvents: "none",
          position: "absolute",
          zIndex: 1,
          opacity: mouse.active ? 0.7 : 0,
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          transition: "opacity 0.4s",
          background: mouse.active
            ? `radial-gradient(circle at ${mouse.x}px ${mouse.y}px, #ff8c00 0%, #ff0080 30%, #00b894 60%, #4a69bb 80%, transparent 100%)`
            : "none",
          mixBlendMode: "screen"
        }}
      />
      <span
        className="otp-btn-multicolor"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: clicked ? 0.7 : 0,
          transition: "opacity 0.5s",
          background: "linear-gradient(90deg, #ff8c00, #ff0080, #00b894, #4a69bb, #fdcb6e, #fd79a8, #00bcd4)",
          mixBlendMode: "screen"
        }}
      />
      {loading ? "Sending OTP..." : children}
      <div className="star-1">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <div className="star-2">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <div className="star-3">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <div className="star-4">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <div className="star-5">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <div className="star-6">
        <svg viewBox="0 0 784.11 815.53"><g><path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" className="fil0"></path></g></svg>
      </div>
      <style>{`
        .animated-otp-btn .fil0 { fill: #fffdef; }
        .animated-otp-btn .star-1, .animated-otp-btn .star-2, .animated-otp-btn .star-3, .animated-otp-btn .star-4, .animated-otp-btn .star-5, .animated-otp-btn .star-6 {
          position: absolute;
          z-index: -5;
          filter: drop-shadow(0 0 0 #fffdef);
          transition: all 0.8s cubic-bezier(0.05, 0.83, 0.43, 0.96);
        }
        .animated-otp-btn .star-1 { top: 20%; left: 20%; width: 25px; }
        .animated-otp-btn .star-2 { top: 45%; left: 45%; width: 15px; }
        .animated-otp-btn .star-3 { top: 40%; left: 40%; width: 5px; }
        .animated-otp-btn .star-4 { top: 20%; left: 40%; width: 8px; }
        .animated-otp-btn .star-5 { top: 25%; left: 45%; width: 15px; }
        .animated-otp-btn .star-6 { top: 5%; left: 50%; width: 5px; }
        .animated-otp-btn:hover { background: #000; color: #fff; box-shadow: 0 0 80px #ffffff8c; }
        .animated-otp-btn:hover .star-1 { top: -20%; left: -20%; width: 20px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn:hover .star-2 { top: 35%; left: -25%; width: 15px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn:hover .star-3 { top: 80%; left: -10%; width: 10px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn:hover .star-4 { top: -25%; left: 105%; width: 20px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn:hover .star-5 { top: 30%; left: 115%; width: 15px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn:hover .star-6 { top: 80%; left: 105%; width: 10px; filter: drop-shadow(0 0 10px #fffdef); z-index: 2; }
        .animated-otp-btn .otp-btn-multicolor {
          pointer-events: none;
        }
      `}</style>
    </button>
  );
}

export default function RegisterTeacher() {
  const [form, setForm] = useState({ name: '', email: '', otp: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);

  // Animated floating shapes state
  const [shapeStates, setShapeStates] = useState([]);

  // Initialize shapes only on client (after mount)
  useEffect(() => {
    function getInitialShapes() {
      return Array.from({ length: 40 }).map((_, idx) => {
        const props = getRandomShapeProps(idx);
        const w = typeof window !== "undefined" ? window.innerWidth : 1920;
        const h = typeof window !== "undefined" ? window.innerHeight : 1080;
        const x = Math.random() * (w - props.size);
        const y = Math.random() * (h - props.size);
        return { ...props, x, y, vx: 0, vy: 0 };
      });
    }
    setShapeStates(getInitialShapes());
  }, []);

  function getRandomShapeProps(idx) {
    const shapeTypes = [
      "cube", "sphere", "ellipse", "star", "triangle", "hexagon", "diamond", "circle"
    ];
    const colors = [
      "#4a69bb", "#ff8c00", "#ff0080", "#00b894", "#00bcd4", "#e17055", "#fdcb6e", "#6c5ce7"
    ];
    const type = shapeTypes[idx % shapeTypes.length];
    const color = colors[idx % colors.length];
    const vw = Math.random() * 80 + 5;
    const vh = Math.random() * 80 + 5;
    const size = Math.random() * 60 + 40;
    return { type, color, left: `${vw}vw`, top: `${vh}vh`, size, idx };
  }

  function RenderShape({ type, color, left, top, size, idx }) {
    const anim = `floating-shape-anim-${idx}`;
    return (
      <div
        className="floating-3d-shape"
        style={{
          left,
          top,
          width: size,
          height: size,
          position: "absolute",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.13,
          filter: "blur(0.5px)",
          animation: `${anim} ${8 + (idx % 7)}s linear infinite`,
          transform: `translate(0,0)`,
        }}
      >
        <style>{`
          @keyframes ${anim} {
            0% { transform: scale(1) rotate(0deg);}
            100% { transform: scale(1.12) rotate(${(idx % 2 ? 1 : -1) * 360}deg);}
          }
        `}</style>
        {type === "cube" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="30,20 70,20 90,40 50,40" fill={color} />
            <polygon points="30,20 50,40 50,80 30,60" fill="#ff8c00" opacity="0.7" />
            <polygon points="70,20 90,40 90,80 70,60" fill="#ff0080" opacity="0.7" />
            <polygon points="50,40 90,40 90,80 50,80" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "sphere" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} />
            <ellipse cx="50" cy="50" rx="40" ry="15" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "ellipse" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="40" ry="25" fill={color} />
          </svg>
        )}
        {type === "star" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 61,39 92,39 66,59 76,89 50,70 24,89 34,59 8,39 39,39" fill={color} />
          </svg>
        )}
        {type === "triangle" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill={color} />
          </svg>
        )}
        {type === "hexagon" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill={color} />
          </svg>
        )}
        {type === "diamond" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,50 50,90 10,50" fill={color} />
          </svg>
        )}
        {type === "circle" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} />
          </svg>
        )}
      </div>
    );
  }

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

  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #f7f8fa 0%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated floating shapes */}
      {shapeStates.map((props, idx) => (
        <RenderShape key={idx} {...props} left={props.x} top={props.y} />
      ))}

      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.85) 100%)',
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
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ fontWeight: 700, fontSize: '2rem', color: '#222f5b', marginBottom: 8 }}>Teacher Registration</div>
        <form onSubmit={otpSent ? handleSubmit : handleSendOtp} style={{ width: '100%' }}>
          <input type="text" name="name" placeholder="Teacher Name" value={form.name} onChange={handleChange} required disabled={otpSent} style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }} />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={otpSent} style={{ width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }} />
          {!otpSent ? (
            <AnimatedSendOtpButton loading={loading}>
              Send OTP
            </AnimatedSendOtpButton>
          ) : (
            <>
              <div
                style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}
                onPaste={e => {
                  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                  if (text.length === 6) {
                    setOtpBlocks(text.split(''));
                    setTimeout(() => {
                      if (otpRefs[5].current) otpRefs[5].current.focus();
                    }, 0);
                    e.preventDefault();
                  }
                }}
              >
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
                    style={{
                      width: 36,
                      height: 44,
                      textAlign: 'center',
                      fontSize: 22,
                      borderRadius: 7,
                      border: '1.5px solid #e0e0e0',
                      background: '#fff',
                      boxShadow: '0 1px 4px #e3e8f0',
                      transition: 'border 0.2s, box-shadow 0.2s'
                    }}
                  />
                ))}
              </div>
              {otpSent && (
                <div style={{ marginBottom: 8, color: otpTimer > 0 ? '#222f5b' : '#c00', fontWeight: 600, fontSize: 14 }}>
                  {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                </div>
              )}
              <input type="hidden" name="otp" value={otpBlocks.join("")} />
              <div
                style={{
                  position: 'relative',
                  marginBottom: 18,
                  width: '100%',
                  minHeight: 64
                }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='New password'
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '50%',
                    padding: '18px 150px 12px 50px',
                    borderRadius: 12,
                    border: '2px solid #cbd5e1',
                    fontSize: '1.13rem',
                    background: '#f1f5f9',
                    color: '#222f5b',
                    fontFamily: "'Segoe UI', 'Inter', 'Roboto', Arial, sans-serif",
                    fontWeight: 400,
                    letterSpacing: 0.2,
                    outline: 'none',
                    boxShadow: '0 2px 8px #e0e7ef22',
                    transition: 'border 0.2s, box-shadow 0.2s'
                  }}
                  maxLength={10}
                  autoComplete="new-password"
                  spellCheck={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                {/* Lock icon left */}
                <span
                  style={{
                    position: 'absolute',
                    left: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: 22,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <rect x="5" y="10" width="14" height="9" rx="2.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5"/>
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="#64748b" strokeWidth="1.5"/>
                    <circle cx="12" cy="15" r="1.5" fill="#64748b"/>
                  </svg>
                </span>
                {/* Eye icon right */}
                <span
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#222f5b',
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f1f5f9',
                    borderRadius: 6,
                    padding: 2
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
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
              <PasswordChecklist password={form.password} show={passwordFocused || !!form.password} />
              <button
                type="submit"
                disabled={!otpSent || otpTimer <= 0}
                ref={btnRef => { if (btnRef) window.registerBtnRef = btnRef; }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 100,
                  padding: '20px 35px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  marginTop: 6,
                  marginBottom: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #2563eb22',
                  transition: 'all 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="animated-register-btn"
                onMouseMove={e => {
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  btn.style.setProperty('--register-btn-x', `${x}px`);
                  btn.style.setProperty('--register-btn-y', `${y}px`);
                  btn.classList.add('register-btn-hover');
                }}
                onMouseLeave={e => {
                  e.currentTarget.classList.remove('register-btn-hover');
                }}
                onClick={e => {
                  const btn = e.currentTarget;
                  btn.classList.add('register-btn-clicked');
                  setTimeout(() => btn.classList.remove('register-btn-clicked'), 700);
                }}
              >
                <span
                  className="register-btn-multicolor"
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    zIndex: 1,
                    opacity: 0,
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    transition: "opacity 0.4s",
                    background:
                      "radial-gradient(circle at var(--register-btn-x,50%) var(--register-btn-y,50%), #ff8c00 0%, #ff0080 30%, #00b894 60%, #4a69bb 80%, transparent 100%)",
                    mixBlendMode: "screen"
                  }}
                />
                <span
                  className="register-btn-multicolor"
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    opacity: 0,
                    transition: "opacity 0.5s",
                    background:
                      "linear-gradient(90deg, #ff8c00, #ff0080, #00b894, #4a69bb, #fdcb6e, #fd79a8, #00bcd4)",
                    mixBlendMode: "screen"
                  }}
                />
                {loading ? 'Registering...' : 'Register'}
                <style>{`
                  .animated-register-btn {
                    position: relative;
                    overflow: hidden;
                  }
                  .animated-register-btn .register-btn-multicolor {
                    pointer-events: none;
                  }
                  .animated-register-btn.register-btn-hover .register-btn-multicolor:first-child {
                    opacity: 0.7;
                  }
                  .animated-register-btn.register-btn-clicked .register-btn-multicolor:last-child {
                    opacity: 0.7;
                  }
                  .animated-register-btn.register-btn-hover {
                    background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%) !important;
                    color: #fff;
                    box-shadow: 0 0 40px #2563eb55;
                  }
                `}</style>
              </button>
              {otpSent && otpTimer <= 0 && (
                <button type="button" onClick={handleSendOtp} style={{ marginTop: 8, color: '#222f5b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
              )}
            </>
          )}
        </form>
        {msg && <div style={{ color: '#059669', marginTop: 12 }}>{msg}</div>}
        {error && <div style={{ color: '#059669', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}

function PasswordChecklist({ password }) {
  const requirements = [
    {
      label: "At least one lowercase letter",
      test: (pw) => /[a-z]/.test(pw)
    },
    {
      label: "At least one uppercase letter",
      test: (pw) => /[A-Z]/.test(pw)
    },
    {
      label: "At least one number",
      test: (pw) => /[0-9]/.test(pw)
    },
    {
      label: "Minimum 8 characters",
      test: (pw) => pw.length >= 8
    }
  ];
  if (!password) return null;
  return (
    <div style={{ marginBottom: 10, marginTop: -8 }}>
      {requirements.map((req, i) => {
        const ok = req.test(password);
        return (
          <div key={i} style={{
            color: ok ? "#059669" : "#64748b",
            fontSize: 15,
            fontFamily: "Arial, sans-serif",
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 2
          }}>
            <span style={{
              display: "inline-flex",
              width: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center"
            }}>
              {ok ? (
                // Green check (no circle)
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9.5l4 4 6-7" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                // Gray check (no circle)
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9.5l4 4 6-7" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            {req.label}
          </div>
        );
      })}
    </div>
  );
}
