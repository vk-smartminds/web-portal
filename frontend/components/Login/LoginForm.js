import React from "react";

export default function LoginForm(props) {
  const {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    otpSent, sendingOtp, showPassword, setShowPassword,
    otpBlocks, otpRefs, otpTimer, otpExpired,
    error, msg,
    showRegister, setShowRegister,
    showNotFoundPopup, setShowNotFoundPopup,
    handlePasswordLogin, handleSendOtp, handleOtpBlockChange, handleOtpBlockKeyDown, handleOtpLogin,
    isAdminOtp, adminOtpSent, router
  } = props;

  // VK-themed colors
  const vkPrimary = "#4a69bb";
  const vkAccent = "#222f5b";
  const vkGradient = "linear-gradient(135deg, #4a69bb 0%,rgb(77, 105, 198) 100%)";
  const vkShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.18)";
  const vkLogo = "/vk-logo.png"; // Use the provided VK logo in public folder
  const vkBgImg = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"; // Placeholder VK-themed image

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      background: vkGradient,
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1.2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `url(${vkBgImg}) center/cover no-repeat`,
        position: "relative",
        minWidth: 350,
        maxWidth: 500
      }}>
        {/* Overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(34,47,91,0.7)",
          zIndex: 1
        }} />
        <div style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* VK Logo */}
          <img src={vkLogo} alt="VK Logo" style={{ width: 70, marginBottom: 32, filter: "drop-shadow(0 2px 8px #0008)" }} />
          {/* Tagline */}
          <div style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "2rem",
            textAlign: "center",
            marginBottom: 16,
            textShadow: "0 2px 8px #0007"
          }}>
            THE BRAND YOU TRUST,<br />REIMAGINED FOR TODAY
          </div>
        </div>
      </div>
      {/* Right Panel (Login Card) */}
      <div style={{
        flex: 1.5,
        minWidth: 350,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8fa"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: vkShadow,
          padding: "48px 40px 36px 40px",
          minWidth: 340,
          maxWidth: 400,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{ fontWeight: 700, fontSize: "2rem", color: vkAccent, marginBottom: 8 }}>Sign in to VK Portal</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 28 }}>Welcome back! Please login to your account.</div>
          {/* Login method switch */}
          <div style={{ display: "flex", width: "100%", marginBottom: 24, gap: 0 }}>
            <button
              style={{
                flex: 1,
                background: mode === "password" ? vkGradient : "#f0f0f0",
                color: mode === "password" ? "#fff" : vkAccent,
                border: "none",
                borderRadius: "8px 0 0 8px",
                padding: "12px 0",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onClick={() => setMode("password")}
            >
              Password
            </button>
            <button
              style={{
                flex: 1,
                background: mode === "otp" ? vkGradient : "#f0f0f0",
                color: mode === "otp" ? "#fff" : vkAccent,
                border: "none",
                borderRadius: "0 8px 8px 0",
                padding: "12px 0",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onClick={() => setMode("otp")}
            >
              OTP
            </button>
          </div>
          {/* Login Form */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} style={{ width: "100%" }}>
              <input
                type="email"
                placeholder="Email"
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
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
                    // Eye with slash SVG
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L21 21" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13" stroke="#222f5b" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    // Open eye SVG
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="11" cy="11" rx="9" ry="5.5" stroke="#222f5b" strokeWidth="2"/>
                      <circle cx="11" cy="11" r="2.5" stroke="#222f5b" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
              </div>
              {error && <div style={{ color: "#e74c3c", marginBottom: 10, fontSize: 14 }}>{error}</div>}
              {msg && <div style={{ color: vkPrimary, marginBottom: 10, fontSize: 14 }}>{msg}</div>}
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
                  marginTop: 6,
                  marginBottom: 8,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #4a69bb22"
                }}
              >
                Login
              </button>
            </form>
          )}
          {mode === "otp" && (
            <form onSubmit={handleOtpLogin} style={{ width: "100%" }}>
              <input
                type="email"
                placeholder="Email"
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
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
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
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                    {otpBlocks.map((val, idx) => (
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
                      <span style={{ color: "#e74c3c" }}>OTP expired. <span style={{ cursor: "pointer", color: vkPrimary, textDecoration: "underline" }} onClick={handleSendOtp}>Resend</span></span>
                    ) : (
                      <>Time left: <b>{otpTimer}s</b></>
                    )}
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
                    Login
                  </button>
                </div>
              )}
              {error && <div style={{ color: "#e74c3c", marginBottom: 10, fontSize: 14 }}>{error}</div>}
              {msg && <div style={{ color: vkPrimary, marginBottom: 10, fontSize: 14 }}>{msg}</div>}
            </form>
          )}
          {/* Register link */}
          <div style={{ marginTop: 18, fontSize: 15, color: vkAccent }}>
            Don&apos;t have an account?{' '}
            <span
              style={{ color: vkPrimary, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setShowRegister(true)}
            >
              Register
            </span>
          </div>
        </div>
      </div>
      {/* Registration Modal - Card Selection Style */}
      {showRegister && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(34,47,91,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000
        }}>
          <RegisterCardModal
            vkGradient={vkGradient}
            vkPrimary={vkPrimary}
            vkAccent={vkAccent}
            vkShadow={vkShadow}
            setShowRegister={setShowRegister}
            router={router}
          />
        </div>
      )}
      {/* User Not Found Modal */}
      {showNotFoundPopup && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(34,47,91,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 3000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: vkShadow,
            padding: 36,
            minWidth: 320,
            maxWidth: 370,
            textAlign: "center",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <button
              onClick={() => setShowNotFoundPopup(false)}
              style={{
                position: "absolute", top: 12, right: 16, background: "#eee", color: vkAccent, border: "none",
                borderRadius: "50%", width: 32, height: 32, fontSize: 20, fontWeight: 700, cursor: "pointer"
              }}
              aria-label="Close"
            >×</button>
            <div style={{ fontWeight: 700, fontSize: "1.25rem", color: vkAccent, marginBottom: 16 }}>
              User not found
            </div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 24 }}>
              User not found. Please register to continue.
            </div>
            <button
              onClick={() => { setShowNotFoundPopup(false); setShowRegister(true); }}
              style={{
                width: "100%",
                background: vkGradient,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.08rem",
                cursor: "pointer",
                marginBottom: 10,
                boxShadow: "0 2px 8px #4a69bb22"
              }}
            >
              Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Registration Card Modal Component
function RegisterCardModal({ vkGradient, vkPrimary, vkAccent, vkShadow, setShowRegister, router }) {
  const [selected, setSelected] = React.useState("");
  const options = [
    {
      key: "student",
      label: "Student",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#eaf1fb"/><path d="M16 7l11 5-11 5-11-5 11-5zm0 8.5c4.5 0 8.5 2.02 8.5 4.5V23H7.5v-3c0-2.48 4-4.5 8.5-4.5z" fill="#4a69bb"/></svg>
      )
    },
    {
      key: "teacher",
      label: "Teacher",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#eaf1fb"/><path d="M16 8a4 4 0 110 8 4 4 0 010-8zm0 10c4.42 0 8 1.79 8 4v2H8v-2c0-2.21 3.58-4 8-4z" fill="#4a69bb"/></svg>
      )
    },
    {
      key: "Guardian",
      label: "Guardian",
      icon: (
        <svg width="40" height="32" fill="none" viewBox="0 0 40 32">
          <rect width="40" height="32" rx="8" fill="#eaf1fb"/>
          {/* Father (taller) */}
          <circle cx="15" cy="14" r="4" fill="#4a69bb"/>
          <rect x="12.5" y="18" width="5" height="7" rx="2.5" fill="#4a69bb"/>
          {/* Mother (shorter, slightly right) */}
          <circle cx="25" cy="15.5" r="3.2" fill="#7ea6e6"/>
          <rect x="22.5" y="18.5" width="5" height="5.5" rx="2.2" fill="#7ea6e6"/>
        </svg>
      )
    }
  ];
  const handleContinue = () => {
    if (selected === "student") router.push("/register-student");
    else if (selected === "teacher") router.push("/register-teacher");
    else if (selected === "Guardian") router.push("/register-guardian");
    setShowRegister(false);
  };
  return (
    <div style={{
      background: "#fff",
      color: vkAccent,
      borderRadius: 18,
      boxShadow: vkShadow,
      padding: 36,
      minWidth: 340,
      maxWidth: 370,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{ marginBottom: 18, fontWeight: 700, fontSize: "1.3rem", color: vkAccent }}>
        Register as:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", marginBottom: 18 }}>
        {options.map(opt => (
          <label key={opt.key} style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: 18,
            borderRadius: 12,
            border: selected === opt.key ? `2px solid ${vkPrimary}` : "1.5px solid #e0e0e0",
            background: selected === opt.key ? "#eaf1fb" : "#f7f8fa",
            boxShadow: selected === opt.key ? "0 2px 8px #4a69bb22" : "none",
            cursor: "pointer",
            transition: "all 0.18s",
            fontWeight: 600,
            fontSize: "1.08rem"
          }}>
            <input
              type="radio"
              name="register-as"
              checked={selected === opt.key}
              onChange={() => setSelected(opt.key)}
              style={{ accentColor: vkPrimary, marginRight: 8 }}
            />
            {opt.icon}
            <span style={{ flex: 1 }}>{opt.label}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleContinue}
        disabled={!selected}
        style={{
          width: "100%",
          background: selected ? vkGradient : "#e0e0e0",
          color: selected ? "#fff" : "#aaa",
          border: "none",
          borderRadius: 8,
          padding: "13px 0",
          fontWeight: 700,
          fontSize: "1.08rem",
          cursor: selected ? "pointer" : "not-allowed",
          marginBottom: 10,
          boxShadow: selected ? "0 2px 8px #4a69bb22" : "none",
          transition: "all 0.18s"
        }}
      >
        Continue
      </button>
      <button
        onClick={() => setShowRegister(false)}
        style={{
          background: "#f0f0f0",
          color: vkAccent,
          border: "none",
          borderRadius: 8,
          padding: "11px 0",
          fontWeight: 600,
          fontSize: "1.05rem",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Cancel
      </button>
    </div>
  );
} 