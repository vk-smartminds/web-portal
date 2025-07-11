import React, { useEffect, useState } from "react";

export default function AppearanceSettings() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("vk-dark-mode");
    } else {
      document.body.classList.remove("vk-dark-mode");
    }
    // Clean up on unmount
    return () => document.body.classList.remove("vk-dark-mode");
  }, [darkMode]);

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Appearance</h3>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 18, color: '#1e3c72', gap: 16 }}>
          <span>Dark Mode</span>
          <span style={{ marginLeft: 18 }}>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(v => !v)} style={{ display: 'none' }} />
            <span style={{
              display: 'inline-block',
              width: 44,
              height: 24,
              background: darkMode ? '#1e3c72' : '#ccc',
              borderRadius: 16,
              position: 'relative',
              transition: 'background 0.18s',
              verticalAlign: 'middle',
              cursor: 'pointer'
            }} onClick={() => setDarkMode(v => !v)}>
              <span style={{
                position: 'absolute',
                left: darkMode ? 22 : 2,
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
      </div>
      <div style={{ color: '#666', fontSize: 16, marginBottom: 12 }}>
        Enable dark mode for a more comfortable viewing experience at night.<br />
        More appearance options coming soon!
      </div>
      {/* Add dark mode CSS globally if not already present */}
      <style>{`
        body.vk-dark-mode {
          background: #181a1b !important;
          color: #f1f1f1 !important;
        }
        body.vk-dark-mode .vk-dark-bg {
          background: #23272a !important;
          color: #f1f1f1 !important;
        }
        body.vk-dark-mode input, body.vk-dark-mode textarea {
          background: #23272a !important;
          color: #f1f1f1 !important;
          border-color: #444 !important;
        }
        body.vk-dark-mode .vk-dark-border {
          border-color: #444 !important;
        }
      `}</style>
    </div>
  );
} 