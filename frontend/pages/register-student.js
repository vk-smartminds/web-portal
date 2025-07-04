"use client";
import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "./apiurl";
import { useRouter } from "next/navigation";

// ...existing styles...
const btnStyle = {
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "12px 0",
  fontSize: "1.1rem", fontWeight: 600, cursor: "pointer"
};
const inputStyle = {
  width: "100%", padding: 8, margin: "8px 0", borderRadius: 6, border: "1px solid #ccc"
};

// Add password validation helpers
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

export default function RegisterStudent() {
  const [form, setForm] = useState({
    name: '', email: '', school: '', class: '', otp: '', password: ''
  });
  const [otpSent, setOtpSent] = useState(false);
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
    // Check if email already registered
    try {
      const checkRes = await fetch(`${BASE_API_URL}/student/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (checkRes.ok) {
        setError("Email already registered as Student.");
        setLoading(false);
        return;
      }
    } catch {}
    // Send OTP
    try {
      const res = await fetch(`${BASE_API_URL}/student/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() })
      });
      if (res.ok) { setOtpSent(true); setMsg("OTP sent to your email."); }
      else { const data = await res.json(); setError(data.message || "Failed to send OTP."); }
    } catch { setError("Failed to send OTP. Please try again."); }
    setLoading(false);
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
      const res = await fetch(`${BASE_API_URL}/student/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase(), otp: otpBlocks.join("") })
      });
      if (res.ok) {
        setMsg("Registration successful! Redirecting...");
        localStorage.setItem("userEmail", form.email.trim().toLowerCase());
        setTimeout(() => { 
          router.replace("/student/dashboard"); 
        }, 1200);
      } else {
        const data = await res.json(); setError(data.message || "Registration failed.");
      }
    } catch { setError("Registration failed. Please try again."); }
    setLoading(false);
  };

  useEffect(() => {
    if (otpSent) setOtpTimer(120); // 2 minutes
  }, [otpSent]);

  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // --- Animated, colliding shapes state ---
  const [shapeStates, setShapeStates] = useState([]);

  // Initialize shapes only on client (after mount)
  useEffect(() => {
    function getInitialShapes() {
      return Array.from({ length: 100 }).map((_, idx) => {
        const props = getRandomShapeProps(idx);
        const w = typeof window !== "undefined" ? window.innerWidth : 1920;
        const h = typeof window !== "undefined" ? window.innerHeight : 1080;
        const x = Math.random() * (w - props.size);
        const y = Math.random() * (h - props.size);
        // No movement, no touch/collision effect
        return { ...props, x, y, vx: 0, vy: 0 };
      });
    }
    setShapeStates(getInitialShapes());
  }, []);

  // Remove mouse tracking and all collision/touch logic:
  // ...existing code...

  // Helper for random shape positions and types
  function getRandomShapeProps(idx) {
    // Randomly pick a shape type and color
    const shapeTypes = ['pyramid', 'tetrahedron', 'cube', 'dodecahedron', 'octahedron', 'icosahedron', 'hexagon', 'pentagon', 'triangle', 'star', 'ellipse', 'diamond', 'parallelogram', 'prism', 'cylinder', 'sphere', 'cone', 'torus', 'cross', 'arrow', 'heart', 'moon', 'wave', 'zigzag', 'rect', 'circle', 'trapezoid', 'rhombus', 'kite', 'crescent', 'plus'];
    const colors = ['#4a69bb', '#ff8c00', '#ff0080', '#00b894', '#00bcd4', '#e17055', '#fdcb6e', '#6c5ce7', '#fd79a8', '#636e72'];
    const type = shapeTypes[idx % shapeTypes.length];
    const color = colors[idx % colors.length];
    // Random position and size
    const vw = Math.random() * 80 + 5;
    const vh = Math.random() * 80 + 5;
    const size = Math.random() * 80 + 60;
    return { type, color, left: `${vw}vw`, top: `${vh}vh`, size, idx };
  }

  // Render a single shape (2D/3D SVG)
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
          position: 'absolute',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.18,
          filter: 'blur(0.5px)',
          animation: `${anim} ${8 + (idx % 7)}s linear infinite`,
          // Use px for left/top
          transform: `translate(0,0)`,
        }}
      >
        <style>{`
          @keyframes ${anim} {
            0% { transform: scale(1) rotate(0deg);}
            100% { transform: scale(1.12) rotate(${(idx % 2 ? 1 : -1) * 360}deg);}
          }
        `}</style>
        {type === 'pyramid' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill={color} />
            <polygon points="50,10 90,90 50,60" fill="#ff8c00" opacity="0.7"/>
            <polygon points="50,10 10,90 50,60" fill="#ff0080" opacity="0.7"/>
            <polygon points="10,90 90,90 50,60" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'tetrahedron' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill={color} />
            <polygon points="50,10 90,90 50,60" fill="#4a69bb" opacity="0.7"/>
            <polygon points="50,10 10,90 50,60" fill="#ff0080" opacity="0.7"/>
            <polygon points="10,90 90,90 50,60" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'cube' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="30,20 70,20 90,40 50,40" fill={color} />
            <polygon points="30,20 50,40 50,80 30,60" fill="#ff8c00" opacity="0.7"/>
            <polygon points="70,20 90,40 90,80 70,60" fill="#ff0080" opacity="0.7"/>
            <polygon points="50,40 90,40 90,80 50,80" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'dodecahedron' && (
          <svg width={size} height={size} viewBox="0 0 200 200">
            <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill={color} opacity="0.7"/>
            <polygon points="100,20 170,60 100,100 30,60" fill="#4a69bb" opacity="0.7"/>
            <polygon points="30,60 100,100 100,180 30,140" fill="#ff8c00" opacity="0.7"/>
            <polygon points="170,60 100,100 100,180 170,140" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'octahedron' && (
          <svg width={size} height={size} viewBox="0 0 180 180">
            <polygon points="90,10 170,90 90,170 10,90" fill={color} opacity="0.7"/>
            <polygon points="90,10 170,90 90,90" fill="#4a69bb" opacity="0.7"/>
            <polygon points="90,10 10,90 90,90" fill="#ff0080" opacity="0.7"/>
            <polygon points="10,90 90,170 90,90" fill="#fff" opacity="0.15"/>
            <polygon points="170,90 90,170 90,90" fill="#fff" opacity="0.10"/>
          </svg>
        )}
        {type === 'icosahedron' && (
          <svg width={size} height={size} viewBox="0 0 220 220">
            <polygon points="110,20 200,70 180,180 40,180 20,70" fill={color} opacity="0.6"/>
            <polygon points="110,20 200,70 110,110 20,70" fill="#ff8c00" opacity="0.7"/>
            <polygon points="20,70 110,110 40,180" fill="#ff0080" opacity="0.7"/>
            <polygon points="200,70 110,110 180,180" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'prism' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" fill={color} />
            <polygon points="20,20 50,10 80,20 50,30" fill="#fff" opacity="0.2"/>
          </svg>
        )}
        {type === 'cylinder' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <ellipse cx="50" cy="20" rx="30" ry="10" fill={color} />
            <rect x="20" y="20" width="60" height="60" fill={color} />
            <ellipse cx="50" cy="80" rx="30" ry="10" fill={color} />
          </svg>
        )}
        {type === 'sphere' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} />
            <ellipse cx="50" cy="50" rx="40" ry="15" fill="#fff" opacity="0.15"/>
          </svg>
        )}
        {type === 'cone' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <ellipse cx="50" cy="80" rx="30" ry="10" fill={color} />
            <polygon points="20,80 80,80 50,10" fill={color} />
          </svg>
        )}
        {type === 'sphere' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="35" fill={color} />
            <circle cx="50" cy="50" r="20" fill="#fff" />
          </svg>
        )}
        {type === 'crescent' && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <path d="M70 50 A30 30 0 1 1 30 50 A20 20 0 1 0 70 50 Z" fill={color} />
          </svg>
        )}
      </div>
    );
  }

  // Render 100 moving/colliding shapes
  // Use px for left/top, not vw/vh
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'rgb(203 213 225)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Render all shapes */}
      {shapeStates.map((props, idx) => (
        <RenderShape
          key={idx}
          {...props}
          left={props.x}
          top={props.y}
        />
      ))}
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          background: 'transparent',
          width: '100%',
          maxWidth: 680,
          gap: 0,
          zIndex: 1
        }}
      >
        {/* Registration box */}
          <div
            style={{
              padding: 40,
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              background: 'rgb(255, 255, 255)',
              background: 'transparent',
              borderRadius: 16,
              boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.09)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              position: 'relative'
            }}
          >
             <div style={{ fontWeight: 700, fontSize: '2rem', color: '#222f5b', marginBottom: 8 }}>Student Registration</div>
            <form onSubmit={otpSent ? handleSubmit : handleSendOtp} style={{ width: '100%' }}>
              <input
                type="text"
                name="name"
                placeholder="Student Name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={otpSent}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 14,
                  borderRadius: 8,
                  border: '1.5px solidrgb(253, 253, 253)',
                  background: 'transparent',
                  fontSize: '1rem',
                  background: '#f7f8fa'
                }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={otpSent}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 14,
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  background: 'transparent',
                  fontSize: '1rem',
                  background: '#f7f8fa'
                }}
              />
              <input
                type="text"
                name="school"
                placeholder="School (optional)"
                value={form.school}
                onChange={handleChange}
                disabled={otpSent}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 14,
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  background: 'transparent',
                  fontSize: '1rem',
                  background: '#f7f8fa'
                }}
              />
              <input
                type="text"
                name="class"
                placeholder="Class"
                value={form.class}
                onChange={handleChange}
                required
                disabled={otpSent}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 14,
                  borderRadius: 8,
                  border: '1.5px solid #e0e0e0',
                  background: 'transparent',
                  fontSize: '1rem',
                  background: '#f7f8fa'
                }}
              />
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
                        style={{ width: 36, height: 44, textAlign: 'center', fontSize: 22, borderRadius: 7, border: '1.5px solid #e0e0e0', background: '#f7f8fa' }}
                      />
                    ))}
                  </div>
                  {otpSent && (
                    <div style={{ marginBottom: 8, color: otpTimer > 0 ? '#222f5b' : '#c00', fontWeight: 600, fontSize: 14 }}>
                      {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer/60)}:${(otpTimer%60).toString().padStart(2,'0')}` : 'OTP expired'}
                    </div>
                  )}
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      placeholder='Password'
                      value={form.password}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: '1rem', background: '#f7f8fa' }}
                      maxLength={30}
                      disabled={otpTimer <= 0}
                    />
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
                  {form.password && <PasswordChecklist password={form.password} />}
                  <button type="submit" disabled={!otpSent || otpTimer <= 0} style={{ width: '100%', background: '#4a69bb', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: '1.1rem', marginTop: 6, marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #4a69bb22' }}>{loading ? 'Registering...' : 'Register'}</button>
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
        {/* Image box */}
        <div
          style={{
            background: 'transparent',
            borderRadius: 18,
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 420,
            minWidth: 220,
            height: 680,
            padding: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
        </div>
      </div>
  );
}

// Add this component for the animated Send OTP button
function AnimatedSendOtpButton({ loading, children, ...props }) {
  // Track mouse position relative to button
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


  // Add a state for click effect
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
        padding: "14px 32px",
        background: "#4a69bb", // blue
        fontSize: "20px",
        fontWeight: 600,
        color: "#fff",
        boxShadow: "0px 0px 10px 0px #4a69bb55",
        borderRadius: "100px",
        border: "none",
        transition: "all 0.3s ease-in-out",
        cursor: loading ? "not-allowed" : "pointer",
        width: "auto",
        minWidth: 160,
        margin: "0 auto 8px auto",
        display: "block",
        textAlign: "center",
        outline: "none",
        overflow: "hidden"
      }}
      className={`animated-otp-btn${clicked ? " animated-otp-btn-clicked" : ""}`}
      {...props}
    >
      {/* Multicolor wave overlay following mouse */}
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
      {/* Multicolor overlay for click */}
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
      <style>{`
        .animated-otp-btn .otp-btn-multicolor {
          pointer-events: none;
        }
      `}</style>
    </button>
  );
}

// Add this component at the end of the file (outside RegisterStudent)
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
