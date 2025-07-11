import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken, getUserData } from "../../utils/auth";
import useOtpTimer from "../../components/Login/useOtpTimer";

export default function AlternativeEmail() {
  const [altEmail, setAltEmail] = useState("");
  const [altEmailError, setAltEmailError] = useState("");
  const [altEmailSuccess, setAltEmailSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [currentAltEmail, setCurrentAltEmail] = useState(null);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const userData = getUserData();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpBlocks, setOtpBlocks] = useState(["", "", "", "", "", ""]);
  const otpRefs = Array.from({ length: 6 }, () => React.useRef());
  const { timeLeft, expired, start: startOtpTimer, reset: resetOtpTimer } = useOtpTimer(120);

  // Fetch current alternative email when component mounts
  useEffect(() => {
    setAltEmail(""); 
    setAltEmailError(""); 
    setAltEmailSuccess(""); 
    setOtpSent(false); 
    setOtp(""); 
    setOtpError(""); 
    setOtpSuccess(""); 
    setShowChangeForm(false);
    fetch(`${BASE_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setCurrentAltEmail(data.user && data.user.alternativeEmail ? data.user.alternativeEmail : "");
      })
      .catch(() => setCurrentAltEmail(""));
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAltEmailError("");
    setAltEmailSuccess("");
    setOtpError("");
    setOtpSuccess("");
    if (!altEmail) {
      setAltEmailError("Please enter an alternative email.");
      return;
    }
    if (userData && userData.email && altEmail.trim().toLowerCase() === userData.email.trim().toLowerCase()) {
      setAltEmailError("Alternative email cannot be the same as your current email.");
      return;
    }
    if (currentAltEmail && altEmail.trim().toLowerCase() === currentAltEmail.trim().toLowerCase()) {
      setAltEmailError("New alternative email cannot be the same as your current alternative email.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-alt-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ alternativeEmail: altEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setAltEmailError(data.message || "Failed to send OTP");
        setSendingOtp(false);
        return;
      }
      setOtpSent(true);
      setAltEmailSuccess("OTP sent to alternative email.");
      setOtpBlocks(["", "", "", "", "", ""]);
      startOtpTimer();
    } catch {
      setAltEmailError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    if (expired) {
      setOtpError("OTP expired. Please resend OTP.");
      return;
    }
    const otp = otpBlocks.join("");
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    try {
      const res = await fetch(`${BASE_API_URL}/verify-alt-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ alternativeEmail: altEmail, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Failed to verify OTP");
        return;
      }
      setOtpSuccess("Alternative email updated successfully!");
      setOtpSent(false);
      setAltEmail("");
      setOtpBlocks(["", "", "", "", "", ""]);
      setShowChangeForm(false);
      fetch(`${BASE_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(data => {
          setCurrentAltEmail(data.user && data.user.alternativeEmail ? data.user.alternativeEmail : "");
        })
        .catch(() => setCurrentAltEmail(""));
    } catch {
      setOtpError("Failed to verify OTP");
    }
  };

  const handleResendOtp = async () => {
    setAltEmailError("");
    setAltEmailSuccess("");
    setOtpError("");
    setOtpSuccess("");
    setSendingOtp(true);
    try {
      const res = await fetch(`${BASE_API_URL}/send-alt-email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ alternativeEmail: altEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.message || "Failed to resend OTP");
        setSendingOtp(false);
        return;
      }
      setOtpBlocks(["", "", "", "", "", ""]);
      startOtpTimer();
    } catch {
      setOtpError("Failed to resend OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Alternative Email</h3>
      {currentAltEmail && !showChangeForm ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontWeight: 600 }}>Current Alternative Email: </span>
            <span style={{ color: '#1e3c72', fontWeight: 600 }}>{currentAltEmail}</span>
          </div>
          <button type="button" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 600, cursor: 'pointer', marginBottom: 18 }} onClick={() => setShowChangeForm(true)}>
            Change Alternative Email
          </button>
        </>
      ) : null}
      {(!currentAltEmail || showChangeForm) && (
        <>
          <form onSubmit={handleSendOtp} style={{ maxWidth: 400 }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>Alternative Email</label>
              <input
                type="email"
                value={altEmail}
                onChange={e => setAltEmail(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 6 }}
                required
                disabled={otpSent || sendingOtp}
              />
            </div>
            {altEmailError && <div style={{ color: '#c00', marginBottom: 12 }}>{altEmailError}</div>}
            {altEmailSuccess && <div style={{ color: '#28a745', marginBottom: 12 }}>{altEmailSuccess}</div>}
            {!otpSent && (
              <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: sendingOtp ? 'not-allowed' : 'pointer' }} disabled={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            )}
          </form>
          {otpSent && (
            <form onSubmit={handleVerifyOtp} style={{ maxWidth: 400, marginTop: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600 }}>Enter OTP</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 8 }}>
                  {otpBlocks.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (!v) return;
                        const newBlocks = [...otpBlocks];
                        newBlocks[idx] = v;
                        setOtpBlocks(newBlocks);
                        if (idx < 5 && v) otpRefs[idx + 1].current.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace") {
                          if (otpBlocks[idx]) {
                            const newBlocks = [...otpBlocks];
                            newBlocks[idx] = "";
                            setOtpBlocks(newBlocks);
                          } else if (idx > 0) {
                            otpRefs[idx - 1].current.focus();
                          }
                        }
                      }}
                      style={{ width: 36, height: 44, fontSize: 22, textAlign: "center", borderRadius: 7, border: "1.5px solid #e0e0e0", background: "#f7f8fa" }}
                      disabled={expired}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: '#1e3c72', marginBottom: 6 }}>
                  {expired ? (
                    <span style={{ color: "#e74c3c" }}>OTP expired. <span style={{ cursor: "pointer", color: "#4a69bb", textDecoration: "underline" }} onClick={handleResendOtp}>Resend OTP</span></span>
                  ) : (
                    <>Time left: <b>{timeLeft}s</b></>
                  )}
                </div>
              </div>
              {otpError && <div style={{ color: '#c00', marginBottom: 12 }}>{otpError}</div>}
              {otpSuccess && <div style={{ color: '#28a745', marginBottom: 12 }}>{otpSuccess}</div>}
              <button type="submit" style={{ background: expired ? '#ccc' : '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: expired ? 'not-allowed' : 'pointer' }} disabled={expired}>
                Verify OTP
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
} 