import React from "react";
import LoginActivityTable from "../../components/LoginActivityTable";

export default function AccountSettings() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Account Settings</h3>
      <button onClick={() => window.location.href = "/delete-account"} style={{ background: '#c00', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, marginBottom: 24, cursor: 'pointer' }}>Delete Account</button>
      <h4 style={{ fontWeight: 700, fontSize: 18, margin: '24px 0 12px 0', color: '#1e3c72' }}>Login Activity</h4>
      <LoginActivityTable showSessionDuration />
    </div>
  );
} 