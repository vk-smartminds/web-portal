import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function PrivacySettings({ userRole }) {
  const [privacy, setPrivacy] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [privacySuccess, setPrivacySuccess] = useState("");

  useEffect(() => {
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
  }, []);

  const handlePrivacyToggle = (key) => setPrivacy(p => ({ ...p, [key]: !p[key] }));
  
  const handlePrivacySave = async () => {
    setPrivacyLoading(true);
    setPrivacyError("");
    setPrivacySuccess("");
    try {
      let privacyData = privacy;
      
      // For students, filter allowed privacy fields
      if (userRole === 'student') {
        const allowedPrivacyFields = ['name', 'email', 'phone', 'school', 'class', 'photo', 'guardian', 'role'];
        privacyData = Object.fromEntries(
          Object.entries(privacy || {}).filter(([key]) => allowedPrivacyFields.includes(key))
        );
      }
      
      const res = await fetch(`${BASE_API_URL}/profile-visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(privacyData)
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

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Privacy Settings</h3>
      {privacyLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #1e3c72', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <span style={{ marginLeft: 12, fontSize: 16, color: '#1e3c72' }}>Loading privacy settings...</span>
        </div>
      ) : privacyError ? (
        <div style={{ color: '#c00', padding: '20px 0', fontSize: 16 }}>{privacyError}</div>
      ) : (
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
  );
} 