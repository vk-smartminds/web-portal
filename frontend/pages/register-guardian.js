"use client";
import React, { useState, useRef, useEffect } from "react";
import { BASE_API_URL } from "./apiurl";
import { useRouter } from "next/navigation";

// Styles similar to register-student.js
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: 14,
  borderRadius: 8,
  border: "1.5px solid #e0e0e0",
  background: "#f7f8fa",
  fontSize: "1rem",
};
const btnStyle = {
  position: "relative",
  padding: "14px 32px",
  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
  fontSize: "20px",
  fontWeight: 600,
  color: "#fff",
  boxShadow: "0px 0px 10px 0px #ff8c0055",
  borderRadius: "100px",
  border: "none",
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  width: "100%",
  minWidth: 160,
  margin: "0 auto 8px auto",
  display: "block",
  textAlign: "center",
  outline: "none",
  overflow: "hidden",
};

export default function RegisterGuardian() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
    child: "",
    role: "Guardian",
  });
  const [childEmail, setChildEmail] = useState("");
  const [childOtpSent, setChildOtpSent] = useState(false);
  const [childOtp, setChildOtp] = useState(["", "", "", "", "", ""]);
  const childOtpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [childOtpTimer, setChildOtpTimer] = useState(0);
  const [childVerified, setChildVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [otpTimer, setOtpTimer] = useState(0);
  const [guardianExists, setGuardianExists] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Animated floating shapes state
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

  // Helper for random shape positions and types
  function getRandomShapeProps(idx) {
    const shapeTypes = [
      "pyramid",
      "tetrahedron",
      "cube",
      "dodecahedron",
      "octahedron",
      "icosahedron",
      "hexagon",
      "pentagon",
      "triangle",
      "star",
      "ellipse",
      "diamond",
      "parallelogram",
      "prism",
      "cylinder",
      "sphere",
      "cone",
      "torus",
      "cross",
      "arrow",
      "heart",
      "moon",
      "wave",
      "zigzag",
      "rect",
      "circle",
      "trapezoid",
      "rhombus",
      "kite",
      "crescent",
      "plus",
    ];
    const colors = [
      "#4a69bb",
      "#ff8c00",
      "#ff0080",
      "#00b894",
      "#00bcd4",
      "#e17055",
      "#fdcb6e",
      "#6c5ce7",
      "#fd79a8",
      "#636e72",
    ];
    const type = shapeTypes[idx % shapeTypes.length];
    const color = colors[idx % colors.length];
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
          position: "absolute",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.18,
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
        {type === "pyramid" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill={color} />
            <polygon points="50,10 90,90 50,60" fill="#ff8c00" opacity="0.7" />
            <polygon points="50,10 10,90 50,60" fill="#ff0080" opacity="0.7" />
            <polygon points="10,90 90,90 50,60" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "tetrahedron" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill={color} />
            <polygon points="50,10 90,90 50,60" fill="#4a69bb" opacity="0.7" />
            <polygon points="50,10 10,90 50,60" fill="#ff0080" opacity="0.7" />
            <polygon points="10,90 90,90 50,60" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "cube" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon points="30,20 70,20 90,40 50,40" fill={color} />
            <polygon points="30,20 50,40 50,80 30,60" fill="#ff8c00" opacity="0.7" />
            <polygon points="70,20 90,40 90,80 70,60" fill="#ff0080" opacity="0.7" />
            <polygon points="50,40 90,40 90,80 50,80" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "dodecahedron" && (
          <svg width={size} height={size} viewBox="0 0 200 200">
            <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill={color} opacity="0.7" />
            <polygon points="100,20 170,60 100,100 30,60" fill="#4a69bb" opacity="0.7" />
            <polygon points="30,60 100,100 100,180 30,140" fill="#ff8c00" opacity="0.7" />
            <polygon points="170,60 100,100 100,180 170,140" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "octahedron" && (
          <svg width={size} height={size} viewBox="0 0 180 180">
            <polygon points="90,10 170,90 90,170 10,90" fill={color} opacity="0.7" />
            <polygon points="90,10 170,90 90,90" fill="#4a69bb" opacity="0.7" />
            <polygon points="90,10 10,90 90,90" fill="#ff0080" opacity="0.7" />
            <polygon points="10,90 90,170 90,90" fill="#fff" opacity="0.15" />
            <polygon points="170,90 90,170 90,90" fill="#fff" opacity="0.1" />
          </svg>
        )}
        {type === "icosahedron" && (
          <svg width={size} height={size} viewBox="0 0 220 220">
            <polygon points="110,20 200,70 180,180 40,180 20,70" fill={color} opacity="0.6" />
            <polygon points="110,20 200,70 110,110 20,70" fill="#ff8c00" opacity="0.7" />
            <polygon points="20,70 110,110 40,180" fill="#ff0080" opacity="0.7" />
            <polygon points="200,70 110,110 180,180" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "prism" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" fill={color} />
            <polygon points="20,20 50,10 80,20 50,30" fill="#fff" opacity="0.2" />
          </svg>
        )}
        {type === "cylinder" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <ellipse cx="50" cy="20" rx="30" ry="10" fill={color} />
            <rect x="20" y="20" width="60" height="60" fill={color} />
            <ellipse cx="50" cy="80" rx="30" ry="10" fill={color} />
          </svg>
        )}
        {type === "sphere" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} />
            <ellipse cx="50" cy="50" rx="40" ry="15" fill="#fff" opacity="0.15" />
          </svg>
        )}
        {type === "cone" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <ellipse cx="50" cy="80" rx="30" ry="10" fill={color} />
            <polygon points="20,80 80,80 50,10" fill={color} />
          </svg>
        )}
        {type === "crescent" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <path d="M70 50 A30 30 0 1 1 30 50 A20 20 0 1 0 70 50 Z" fill={color} />
          </svg>
        )}
        {type === "plus" && (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="45" y="20" width="10" height="60" fill={color} />
            <rect x="20" y="45" width="60" height="10" fill={color} />
          </svg>
        )}
      </div>
    );
  }

  // Form handlers and logic

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
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setOtpSent(true);
        setMsg("OTP sent to your email.");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const verifyRes = await fetch(`${BASE_API_URL}/verify-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: otpBlocks.join("") }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.message || "Invalid OTP.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_API_URL}/register-guardian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          otp: otpBlocks.join(""),
          child: form.child ? [form.child] : [],
          role: form.role,
        }),
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

  const handleSendChildOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-child-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase() }),
      });
      if (res.ok) {
        setChildOtpSent(true);
        setMsg("OTP sent to child email.");
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

  const handleVerifyChildOtp = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/verify-child-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase(), otp: childOtp.join("") }),
      });
      if (res.ok) {
        setChildVerified(true);
        setMsg("Child email verified. Continue registration.");
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
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);
  useEffect(() => {
    if (childOtpSent) setChildOtpTimer(120);
  }, [childOtpSent]);
  useEffect(() => {
    if (!childOtpSent || childOtpTimer <= 0) return;
    const interval = setInterval(() => setChildOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [childOtpSent, childOtpTimer]);
  useEffect(() => {
    if (childVerified && childEmail) {
      setForm((f) => ({ ...f, child: childEmail }));
    }
  }, [childVerified, childEmail]);
  useEffect(() => {
    async function checkChildVerified() {
      if (childEmail) {
        try {
          const res = await fetch(
            `${BASE_API_URL}/check-child-verified?childEmail=${encodeURIComponent(childEmail)}`,
            {
              credentials: "include",
            }
          );
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
  }, []);

  // Check if guardian exists after entering email
  const handleEmailBlur = async () => {
    if (!form.email) return;
    try {
      const res = await fetch(`${BASE_API_URL}/guardian/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setGuardianExists(!!data.exists);
      setPasswordChecked(false);
      setPasswordError("");
    } catch {
      setGuardianExists(false);
    }
  };

  // Validate password for existing guardian
  const handlePasswordCheck = async () => {
    setPasswordError("");
    try {
      const res = await fetch(`${BASE_API_URL}/guardian/validate-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();
      if (data.valid) {
        setPasswordChecked(true);
        setPasswordError("");
      } else {
        setPasswordChecked(false);
        setPasswordError("Your password is incorrect.");
      }
    } catch {
      setPasswordChecked(false);
      setPasswordError("Your password is incorrect.");
    }
  };

  // Animated Send OTP Button component copied from register-student.js
  function AnimatedSendOtpButton({ loading, children, ...props }) {
    const [mouse, setMouse] = useState({ x: 0, y: 0, active: false });
    const btnRef = useRef();

    function handleMouseMove(e) {
      const rect = btnRef.current.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      });
    }
    function handleMouseLeave() {
      setMouse((m) => ({ ...m, active: false }));
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
          padding: "14px 32px",
          background: "#ff8c00",
          fontSize: "20px",
          fontWeight: 600,
          color: "#fff",
          boxShadow: "0px 0px 10px 0px #ff8c0055",
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
          overflow: "hidden",
          zIndex: 2,
        }}
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
            mixBlendMode: "screen",
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
            background:
              "linear-gradient(90deg, #ff8c00, #ff0080, #00b894, #4a69bb, #fdcb6e, #fd79a8, #00bcd4)",
            mixBlendMode: "screen",
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

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "rgb(203 213 225)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Render all floating shapes */}
      {shapeStates.map((props, idx) => (
        <RenderShape key={idx} {...props} left={props.x} top={props.y} />
      ))}

      {/* Registration box */}
        <div
          style={{
            padding: 40,
            width: "100%",
            maxWidth: 480,
            margin: "0 auto",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(240, 240, 255, 0.6) 100%)",
            borderRadius: 18,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            position: "relative",
            zIndex: 1,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
        <h2
          style={{
            fontWeight: 700,
            fontSize: "2rem",
            color: "#222f5b",
            marginBottom: 22,
            letterSpacing: 1,
          }}
        >
          Guardian Registration
        </h2>

        {!childVerified ? (
          <form onSubmit={childOtpSent ? handleVerifyChildOtp : handleSendChildOtp}>
            <input
              style={{ ...inputStyle, background: "#fff", border: "1.5px solid #b6c6e3" }}
              name="childEmail"
              placeholder="Child Email (required)"
              value={childEmail}
              onChange={(e) => setChildEmail(e.target.value)}
              required
              disabled={childOtpSent || childVerified}
              readOnly={childVerified}
            />
            {(!childVerified && (!childEmail || !childVerified) && !error) && (
              <div
                style={{
                  background: "#fffbe6",
                  color: "#b45309",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginTop: 14,
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 2px 8px #f3e8d2",
                  transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
                  opacity: 1,
                  animation: "fadeIn 0.5s",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#fde68a" />
                    <path
                      d="M12 8v4m0 4h.01"
                      stroke="#b45309"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Child email is required for Guardian registration
                </span>
              </div>
            )}
            {!childOtpSent ? (
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "14px 32px",
                  background: "linear-gradient(90deg, #ff8c00 0%, #ff0080 100%)",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: "100px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0px 0px 10px 0px #ff8c0055",
                  transition: "all 0.3s ease-in-out",
                  outline: "none",
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP to Child"}
              </button>
            ) : (
              <>
                <div
                  style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (text.length === 6) {
                      setChildOtp(text.split(""));
                      setTimeout(() => {
                        if (childOtpRefs[5].current) childOtpRefs[5].current.focus();
                      }, 0);
                      e.preventDefault();
                    }
                  }}
                >
                  {childOtp.map((v, i) => (
                    <input
                      key={i}
                      ref={childOtpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={v}
                      onChange={(e) => handleChildOtpBlockChange(i, e.target.value)}
                      onKeyDown={(e) => handleChildOtpBlockKeyDown(i, e)}
                      style={{
                        width: 40,
                        height: 40,
                        textAlign: "center",
                        fontSize: 22,
                        borderRadius: 8,
                        border: "1.5px solid #b6c6e3",
                        background: "#fff",
                        boxShadow: "0 1px 4px #e3e8f0",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    marginBottom: 10,
                    color: childOtpTimer > 0 ? "#2563eb" : "#f59e42",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {childOtpTimer > 0
                    ? `OTP expires in ${Math.floor(childOtpTimer / 60)}:${(childOtpTimer % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : "OTP expired"}
                </div>
                <button
                  type="submit"
                  style={{ ...btnStyle, width: "100%" }}
                  disabled={loading || childOtpTimer <= 0}
                >
                  Verify Child OTP
                </button>
                {childOtpSent && childOtpTimer <= 0 && (
                  <button
                    type="button"
                    onClick={handleSendChildOtp}
                    style={{
                      marginTop: 10,
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      width: "100%",
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </>
            )}
            {error && (
              <div
                style={{
                  background: "#fffbe6",
                  color: "#b45309",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 14,
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 1px 4px #f3e8d2",
                }}
              >
                {error}
                {error.includes("No student found") && (
                  <button
                    type="button"
                    style={{ ...btnStyle, marginTop: 12, background: "#2563eb", width: "100%" }}
                    onClick={() =>
                      (window.location.href = `/register-student?email=${encodeURIComponent(childEmail)}`)
                    }
                  >
                    Register Student
                  </button>
                )}
              </div>
            )}
            {msg && (
              <div
                style={{
                  background: "#e0f7fa",
                  color: "#047857",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 14,
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 1px 4px #b2f5ea",
                }}
              >
                {msg}
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              style={{ ...inputStyle, background: "#fff", border: "1.5px solid #b6c6e3" }}
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              required
              disabled={guardianExists && passwordChecked}
            />
            {guardianExists && !passwordChecked && (
              <>
                <div style={{ position: "relative", marginBottom: 14, width: "100%", minHeight: 64 }}>
                  <input
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "18px 48px 18px 48px",
                      borderRadius: 12,
                      border: "2px solid #cbd5e1",
                      fontSize: "1.13rem",
                      background: "#f1f5f9",
                      color: "#222f5b",
                      fontFamily: "'Segoe UI', 'Inter', 'Roboto', Arial, sans-serif",
                      fontWeight: 500,
                      letterSpacing: 0.2,
                      outline: "none",
                      boxShadow: "0 2px 8px #e0e7ef22",
                      transition: "border 0.2s, box-shadow 0.2s"
                    }}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
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
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 18,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#222f5b",
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      background: "#f1f5f9",
                      borderRadius: 6,
                      padding: 2
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L21 21"
                          stroke="#222f5b"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13"
                          stroke="#222f5b"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="11"
                          cy="11"
                          rx="9"
                          ry="5.5"
                          stroke="#222f5b"
                          strokeWidth="2"
                        />
                        <circle cx="11" cy="11" r="2.5" stroke="#222f5b" strokeWidth="2" />
                      </svg>
                    )}
                  </span>
                </div>
                <PasswordChecklist password={form.password} />
                <button
                  type="button"
                  style={{ ...btnStyle, width: "100%", marginTop: 8 }}
                  onClick={handlePasswordCheck}
                >
                  Check Password
                </button>
                {passwordError && (
                  <div style={{ color: "#c00", marginTop: 8 }}>{passwordError}</div>
                )}
              </>
            )}
            {(!guardianExists || passwordChecked) && (
              <>
                {!guardianExists && (
                  <div style={{ position: "relative", marginBottom: 14, width: "100%", minHeight: 64 }}>
                    <input
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "18px 48px 18px 48px",
                        borderRadius: 12,
                        border: "2px solid #cbd5e1",
                        fontSize: "1.13rem",
                        background: "#f1f5f9",
                        color: "#222f5b",
                        fontFamily: "'Segoe UI', 'Inter', 'Roboto', Arial, sans-serif",
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        outline: "none",
                        boxShadow: "0 2px 8px #e0e7ef22",
                        transition: "border 0.2s, box-shadow 0.2s"
                      }}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
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
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 18,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#222f5b",
                        fontSize: 22,
                        display: "flex",
                        alignItems: "center",
                        background: "#f1f5f9",
                        borderRadius: 6,
                        padding: 2
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1L21 21"
                            stroke="#222f5b"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                          d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13"
                          stroke="#222f5b"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      ) : (
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <ellipse
                            cx="11"
                            cy="11"
                            rx="9"
                            ry="5.5"
                            stroke="#222f5b"
                            strokeWidth="2"
                          />
                          <circle cx="11" cy="11" r="2.5" stroke="#222f5b" strokeWidth="2" />
                        </svg>
                      )}
                    </span>
                  </div>
                )}
                <PasswordChecklist password={form.password} />
                <select
                  style={{ ...inputStyle, background: "#fff", border: "1.5px solid #b6c6e3" }}
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
                <input
                  style={{ ...inputStyle, background: "#f1f5f9", border: "1.5px solid #b6c6e3", color: "#64748b" }}
                  name="child"
                  placeholder="Child Email (required)"
                  value={childEmail}
                  readOnly
                  required
                />
                {!otpSent ? (
                  <button type="button" style={{ ...btnStyle, width: "100%", marginTop: 8 }} onClick={handleSendOtp} disabled={loading}>
                    Send OTP
                  </button>
                ) : (
                  <>
                    <div
                      style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                        if (text.length === 6) {
                          setOtpBlocks(text.split(""));
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
                          onChange={(e) => handleOtpBlockChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpBlockKeyDown(i, e)}
                          style={{
                            width: 40,
                            height: 40,
                            textAlign: "center",
                            fontSize: 22,
                            borderRadius: 8,
                            border: "1.5px solid #b6c6e3",
                            background: "#fff",
                            boxShadow: "0 1px 4px #e3e8f0",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ marginBottom: 10, color: otpTimer > 0 ? "#2563eb" : "#f59e42", fontWeight: 600, fontSize: 15 }}>
                      {otpTimer > 0 ? `OTP expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}` : "OTP expired"}
                    </div>
                    {otpSent && otpTimer <= 0 && (
                      <button type="button" onClick={handleSendOtp} style={{ marginBottom: 10, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "block", width: "100%" }}>
                        Resend OTP
                      </button>
                    )}
                    <button type="submit" style={{ ...btnStyle, width: "100%" }} disabled={loading || otpTimer <= 0 || !childVerified}>
                      Register
                    </button>
                    {!childVerified && (
                      <div style={{ background: "#fffbe6", color: "#b45309", borderRadius: 8, padding: "10px 14px", marginTop: 10, fontWeight: 500, fontSize: 15, boxShadow: "0 1px 4px #f3e8d2", textAlign: "center" }}>
                        Please verify your child's email before completing registration.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {msg && (
              <div
                style={{
                  background: "#e0f7fa",
                  color: "#047857",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 14,
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 1px 4px #b2f5ea",
                }}
              >
                {msg}
              </div>
            )}
            {error && (
              <div
                style={{
                  background: "#fffbe6",
                  color: "#b45309",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginTop: 14,
                  fontWeight: 500,
                  fontSize: 15,
                  boxShadow: "0 1px 4px #f3e8d2",
                }}
              >
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// Place this component at the end of the file (outside RegisterGuardian)
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
    <div style={{ marginBottom: 10, marginTop: -8, fontFamily: 'Arial, sans-serif', fontWeight: 400 }}>
      {requirements.map((req, i) => {
        const ok = req.test(password);
        return (
          <div key={i} style={{
            color: ok ? "#059669" : "#64748b",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 2,
            fontWeight: 400
          }}>
            {ok ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'inline-block' }}>
                <path d="M5 10.5l3 3 7-7" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span style={{ width: 18, display: 'inline-block' }}></span>
            )}
            {req.label}
          </div>
        );
      })}
    </div>
  );
}
