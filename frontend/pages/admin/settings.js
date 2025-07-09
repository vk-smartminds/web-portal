import React, { useRef, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { FaKey, FaEnvelope, FaUserEdit, FaCogs, FaBell, FaPaintBrush, FaShieldAlt, FaCreditCard, FaLifeRing, FaEye, FaEyeSlash, FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaTrashAlt } from "react-icons/fa";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken, getUserData } from "../../utils/auth";
import useOtpTimer from "../../components/Login/useOtpTimer";
import LoginActivityTable from "../../components/LoginActivityTable";

const boxStyle = (active) => ({
  background: active ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "#fff",
  border: active ? "2px solid #1e3c72" : "2px solid #e0e0e0",
  borderRadius: 18,
  boxShadow: active ? "0 4px 24px rgba(30,60,114,0.10)" : "0 2px 8px rgba(30,60,114,0.06)",
  padding: 28,
  cursor: "pointer",
  transition: "all 0.18s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 160,
  minWidth: 220,
  fontWeight: 600,
  fontSize: 18,
  color: active ? "#1e3c72" : "#444",
  position: "relative",
  outline: "none"
});

export default function AdminSettingsPage() {
  const [activeFeature, setActiveFeature] = useState(null);
  // Password change state
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Alternative email state
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

  // Notification toggles state
  const [notifSettings, setNotifSettings] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");
  const handleNotifToggle = (key) => setNotifSettings(s => ({ ...s, [key]: !s[key] }));

  React.useEffect(() => {
    if (activeFeature === "notification-settings") {
      setNotifLoading(true);
      setNotifError("");
      setNotifSuccess("");
      fetch(`${BASE_API_URL}/notification-settings`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(data => {
          setNotifSettings(data.notificationSettings || { announcements: true });
          setNotifLoading(false);
        })
        .catch(() => {
          setNotifSettings({ announcements: true });
          setNotifError("Failed to load notification settings");
          setNotifLoading(false);
        });
    }
  }, [activeFeature]);

  const handleNotifSave = async () => {
    setNotifLoading(true);
    setNotifError("");
    setNotifSuccess("");
    try {
      const res = await fetch(`${BASE_API_URL}/notification-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(notifSettings)
      });
      const data = await res.json();
      if (!res.ok) {
        setNotifError(data.message || "Failed to save notification settings");
        setNotifLoading(false);
        return;
      }
      setNotifSuccess("Notification settings saved!");
    } catch {
      setNotifError("Failed to save notification settings");
    } finally {
      setNotifLoading(false);
    }
  };

  // Privacy settings state
  const [privacy, setPrivacy] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [privacySuccess, setPrivacySuccess] = useState("");
  React.useEffect(() => {
    if (activeFeature === "privacy-settings") {
      setPrivacyLoading(true);
      setPrivacyError("");
      fetch(`${BASE_API_URL}/profile-visibility`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(data => {
          setPrivacy(data.profileVisibility || {});
          setPrivacyLoading(false);
        })
        .catch(() => {
          setPrivacyError("Failed to load privacy settings");
          setPrivacyLoading(false);
        });
    }
  }, [activeFeature]);
  const handlePrivacyToggle = (key) => setPrivacy(p => ({ ...p, [key]: !p[key] }));
  const handlePrivacySave = async () => {
    setPrivacyLoading(true);
    setPrivacyError("");
    setPrivacySuccess("");
    try {
      const res = await fetch(`${BASE_API_URL}/profile-visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(privacy)
      });
      const data = await res.json();
      if (!res.ok) {
        setPrivacyError(data.message || "Failed to save privacy settings");
        setPrivacyLoading(false);
        return;
      }
      setPrivacySuccess("Privacy settings saved!");
    } catch {
      setPrivacyError("Failed to save privacy settings");
    } finally {
      setPrivacyLoading(false);
    }
  };

  // Fetch current alternative email when section is opened
  React.useEffect(() => {
    if (activeFeature === "alternative-email") {
      setAltEmail(""); setAltEmailError(""); setAltEmailSuccess(""); setOtpSent(false); setOtp(""); setOtpError(""); setOtpSuccess(""); setShowChangeForm(false);
      fetch(`${BASE_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
        .then(res => res.json())
        .then(data => {
          setCurrentAltEmail(data.user && data.user.alternativeEmail ? data.user.alternativeEmail : "");
        })
        .catch(() => setCurrentAltEmail(""));
    }
  }, [activeFeature]);

  const changePasswordRef = useRef();
  const alternativeEmailRef = useRef();
  const updateProfileRef = useRef();
  const accountSettingsRef = useRef();
  const notificationSettingsRef = useRef();
  const appearanceRef = useRef();
  const privacySettingsRef = useRef();
  const paymentRef = useRef();
  const supportRef = useRef();

  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    { key: "change-password", label: "Change Password", icon: <FaKey style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Update your account password", ref: changePasswordRef },
    { key: "alternative-email", label: "Alternative Email", icon: <FaEnvelope style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Add or update an alternative email", ref: alternativeEmailRef },
    { key: "update-profile", label: "Update Profile", icon: <FaUserEdit style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Edit your profile information", ref: updateProfileRef, action: () => window.location.href = "/admin/profile" },
    { key: "account-settings", label: "Account Settings", icon: <FaCogs style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Manage your account settings, delete your account, and view login activity", ref: accountSettingsRef },
    { key: "notification-settings", label: "Notification Settings", icon: <FaBell style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Control your notifications", ref: notificationSettingsRef },
    { key: "appearance", label: "Appearance", icon: <FaPaintBrush style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Theme and appearance options", ref: appearanceRef },
    { key: "privacy-settings", label: "Privacy Settings", icon: <FaShieldAlt style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Control your privacy", ref: privacySettingsRef },
    { key: "payment", label: "Payment & Subscriptions", icon: <FaCreditCard style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Manage payments and subscriptions", ref: paymentRef },
    { key: "support", label: "Support & Help", icon: <FaLifeRing style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Get support and help", ref: supportRef },
  ];

  // Step 1: Verify current password
  const handleVerifyCurrent = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to verify password");
        setLoading(false);
        return;
      }
      // Only move to step 2, do not show success or reset fields
      setStep(2);
    } catch (err) {
      setError("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_API_URL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to change password");
        setLoading(false);
        return;
      }
      setSuccess("Password changed successfully!");
      setStep(1);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 48, maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Settings
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 40,
          marginTop: 24
        }}>
          {features.map(f => (
            <div
              key={f.key}
              style={boxStyle(activeFeature === f.key)}
              onClick={() => {
                if (f.action) {
                  f.action();
                } else {
                  setActiveFeature(f.key);
                  setTimeout(() => scrollToRef(f.ref), 100);
                }
              }}
            >
              {f.icon}
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{f.label}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        {/* Feature sections */}
        <div style={{ marginTop: 60 }}>
          <div ref={changePasswordRef} style={{ display: activeFeature === "change-password" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Change Password</h3>
            <form onSubmit={step === 2 ? handlePasswordChange : (e) => e.preventDefault()} style={{ maxWidth: 400 }}>
              {step === 1 && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontWeight: 600 }}>Current Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #bbb', borderRadius: 6, padding: '6px 10px', marginTop: 6 }}>
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16 }}
                      required
                      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                    />
                    <span style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => setShowCurrent(v => !v)}>
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              )}
              {step === 2 && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 600 }}>New Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #bbb', borderRadius: 6, padding: '6px 10px', marginTop: 6 }}>
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16 }}
                        required
                      />
                      <span style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => setShowNew(v => !v)}>
                        {showNew ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                      Password must be 8-30 characters, include uppercase, lowercase, and a number.
                    </div>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 600 }}>Confirm New Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #bbb', borderRadius: 6, padding: '6px 10px', marginTop: 6 }}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16 }}
                        required
                      />
                      <span style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                </>
              )}
              {error && <div style={{ color: '#c00', marginBottom: 12 }}>{error}</div>}
              {success && <div style={{ color: '#28a745', marginBottom: 12 }}>{success}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                {step === 1 && (
                  <button
                    type="button"
                    style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                    disabled={loading || !currentPassword}
                    onClick={handleVerifyCurrent}
                  >
                    Next
                  </button>
                )}
                {step === 2 && (
                  <button
                    type="submit"
                    style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                    disabled={loading || !newPassword || !confirmNewPassword}
                  >
                    Change Password
                  </button>
                )}
                {step === 2 && (
                  <button
                    type="button"
                    style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => {
                      setStep(1);
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Back
                  </button>
                )}
              </div>
            </form>
          </div>
          <div ref={alternativeEmailRef} style={{ display: activeFeature === "alternative-email" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
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
                <form onSubmit={async e => {
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
                }} style={{ maxWidth: 400 }}>
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
                  <form onSubmit={async e => {
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
                  }} style={{ maxWidth: 400, marginTop: 24 }}>
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
                          <span style={{ color: "#e74c3c" }}>OTP expired. <span style={{ cursor: "pointer", color: "#4a69bb", textDecoration: "underline" }} onClick={async () => {
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
                          }}>Resend OTP</span></span>
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
          <div ref={updateProfileRef} style={{ display: activeFeature === "update-profile" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Update Profile</h3>
            <div>Update Profile feature coming soon!</div>
          </div>
          <div ref={accountSettingsRef} style={{ display: activeFeature === "account-settings" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Account Settings</h3>
            <button onClick={() => window.location.href = "/delete-account"} style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, marginBottom: 24, cursor: 'pointer' }}>Delete Account</button>
            <h4 style={{ fontWeight: 700, fontSize: 18, margin: '24px 0 12px 0', color: '#1e3c72' }}>Login Activity</h4>
            <LoginActivityTable showSessionDuration />
          </div>
          <div ref={notificationSettingsRef} style={{ display: activeFeature === "notification-settings" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Notification Settings</h3>
            <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {notifSettings && [
                { key: 'announcements', label: 'Announcements' },
                { key: 'discussionReplies', label: 'Discussion Replies' },
                { key: 'assignmentDeadlines', label: 'Assignment Deadlines' },
                { key: 'newResources', label: 'New Resources Added' },
                { key: 'systemUpdates', label: 'System Updates' }
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 17, fontWeight: 600, color: '#1e3c72', background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', border: '1.5px solid #e0e0e0', cursor: 'pointer' }}>
                  <span>{opt.label}</span>
                  <span style={{ marginLeft: 18 }}>
                    <input type="checkbox" checked={!!notifSettings[opt.key]} onChange={() => handleNotifToggle(opt.key)} style={{ display: 'none' }} />
                    <span style={{
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      background: notifSettings[opt.key] ? '#1e3c72' : '#ccc',
                      borderRadius: 16,
                      position: 'relative',
                      transition: 'background 0.18s',
                      verticalAlign: 'middle',
                      cursor: 'pointer'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: notifSettings[opt.key] ? 22 : 2,
                        top: 2,
                        width: 20,
                        height: 20,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 1px 4px #0002',
                        transition: 'left 0.18s',
                        border: '1.5px solid #e0e0e0'
                      }} />
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <button onClick={handleNotifSave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer', minWidth: 120 }} disabled={notifLoading}>Save</button>
            {notifSuccess && <div style={{ color: '#28a745', marginTop: 10 }}>{notifSuccess}</div>}
            {notifError && <div style={{ color: '#c00', marginTop: 10 }}>{notifError}</div>}
          </div>
          <div ref={appearanceRef} style={{ display: activeFeature === "appearance" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Appearance</h3>
            <div>Appearance feature coming soon!</div>
          </div>
          <div ref={privacySettingsRef} style={{ display: activeFeature === "privacy-settings" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Privacy Settings</h3>
            {privacyLoading ? <div>Loading...</div> : privacyError ? <div style={{ color: '#c00' }}>{privacyError}</div> : (
              <>
                <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 18 }}>
                  {privacy && Object.entries(privacy).map(([key, value]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 17, fontWeight: 600, color: '#1e3c72', background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', border: '1.5px solid #e0e0e0', cursor: 'pointer' }}>
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span style={{ marginLeft: 18 }}>
                        <input type="checkbox" checked={!!privacy[key]} onChange={() => handlePrivacyToggle(key)} style={{ display: 'none' }} />
                        <span style={{
                          display: 'inline-block',
                          width: 44,
                          height: 24,
                          background: privacy[key] ? '#1e3c72' : '#ccc',
                          borderRadius: 16,
                          position: 'relative',
                          transition: 'background 0.18s',
                          verticalAlign: 'middle',
                          cursor: 'pointer'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: privacy[key] ? 22 : 2,
                            top: 2,
                            width: 20,
                            height: 20,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 4px #0002',
                            transition: 'left 0.18s',
                            border: '1.5px solid #e0e0e0'
                          }} />
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <button onClick={handlePrivacySave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer', minWidth: 120 }} disabled={privacyLoading}>Save</button>
                {privacySuccess && <div style={{ color: '#28a745', marginTop: 10 }}>{privacySuccess}</div>}
              </>
            )}
          </div>
          <div ref={paymentRef} style={{ display: activeFeature === "payment" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Payment & Subscriptions</h3>
            <div>Payment & Subscriptions feature coming soon!</div>
          </div>
          <div ref={supportRef} style={{ display: activeFeature === "support" ? 'block' : 'none', background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Support & Help</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 400 }}>
              <a href="mailto:smart-minds@vkpublications.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
                <FaEnvelope style={{ fontSize: 22, color: '#c97a2b' }} />
                Email: smart-minds@vkpublications.com
              </a>
              <a href="https://www.instagram.com/vkglobalgroup/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
                <FaInstagram style={{ fontSize: 22, color: '#e1306c' }} />
                Instagram
              </a>
              <a href="https://twitter.com/vkglobalgroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
                <FaTwitter style={{ fontSize: 22, color: '#1da1f2' }} />
                Twitter
              </a>
              <a href="https://www.facebook.com/vkglobalgroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
                <FaFacebook style={{ fontSize: 22, color: '#1877f3' }} />
                Facebook
              </a>
              <a href="https://www.youtube.com/@VKGlobalGroup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f7f8fa', borderRadius: 8, padding: '12px 18px', textDecoration: 'none', color: '#1e3c72', fontWeight: 600, fontSize: 17, border: '1.5px solid #e0e0e0', transition: 'background 0.15s' }}>
                <FaYoutube style={{ fontSize: 22, color: '#ff0000' }} />
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 