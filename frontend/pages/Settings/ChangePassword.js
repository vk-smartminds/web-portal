import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ChangePassword() {
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
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
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
  );
} 