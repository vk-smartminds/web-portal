import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function NotificationSettings() {
  const [notifSettings, setNotifSettings] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");

  useEffect(() => {
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
  }, []);

  const handleNotifToggle = (key) => setNotifSettings(s => ({ ...s, [key]: !s[key] }));

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

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Notification Settings</h3>
      {notifLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #1e3c72', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <span style={{ marginLeft: 12, fontSize: 16, color: '#1e3c72' }}>Loading notification settings...</span>
        </div>
      ) : notifError ? (
        <div style={{ color: '#c00', padding: '20px 0', fontSize: 16 }}>{notifError}</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
} 