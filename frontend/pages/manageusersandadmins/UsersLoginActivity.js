import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs}s`;
}

export default function UsersLoginActivity({ userEmail, isSuperAdmin }) {
  const [loginActivityEmail, setLoginActivityEmail] = useState("");
  const [loginActivityStatus, setLoginActivityStatus] = useState("");
  const [loginActivitySessions, setLoginActivitySessions] = useState([]);
  const [loginActivityUser, setLoginActivityUser] = useState(null);

  const handleLoginActivitySearch = async (e) => {
    e.preventDefault();
    setLoginActivityStatus("Searching...");
    setLoginActivitySessions([]);
    setLoginActivityUser(null);
    try {
      // 1. Find user by email (get _id and role)
      const resUser = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: loginActivityEmail, requesterEmail: userEmail }),
      });
      if (!resUser.ok) {
        const data = await resUser.json();
        setLoginActivityStatus(data.message || "User not found");
        return;
      }
      const dataUser = await resUser.json();
      setLoginActivityUser(dataUser.user);
      // 2. Determine userRole robustly
      let userRole = null;
      if (dataUser.user.role) userRole = dataUser.user.role;
      else if (dataUser.user.userRole) userRole = dataUser.user.userRole;
      else userRole = 'Admin';
      // Capitalize userRole for Session model
      userRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
      if (userRole === 'Superadmin') userRole = 'Admin';
      // 3. Fetch login activity from backend by userId and userRole
      const resSessions = await fetch(`${BASE_API_URL}/admin/user-login-activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId: dataUser.user._id, userRole }),
      });
      if (!resSessions.ok) {
        const data = await resSessions.json();
        setLoginActivityStatus(data.message || "No login activity found");
        return;
      }
      const dataSessions = await resSessions.json();
      setLoginActivitySessions(dataSessions.sessions || []);
      setLoginActivityStatus("");
    } catch {
      setLoginActivityStatus("Error fetching login activity");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Users Login Activity</h3>
      <form onSubmit={handleLoginActivitySearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="email"
          placeholder="Enter user email (exact match)"
          value={loginActivityEmail}
          onChange={e => setLoginActivityEmail(e.target.value)}
          required
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
        />
        <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
      </form>
      {loginActivityStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{loginActivityStatus}</div>}
      {loginActivityUser && (
        <div style={{ marginBottom: 18, background: "#f7fafd", borderRadius: 8, padding: 16 }}>
          {loginActivityUser.name && (
            <div style={{ fontWeight: 600, color: "#1e3c72" }}>User: {loginActivityUser.name}</div>
          )}
          {((loginActivityUser.role && loginActivityUser.role !== '') || (loginActivityUser.userRole && loginActivityUser.userRole !== '')) && (
            <div style={{ color: "#444" }}>Role: {loginActivityUser.role || loginActivityUser.userRole}</div>
          )}
          {loginActivitySessions.length > 0 && (
            <div style={{ marginTop: 8, fontWeight: 600, color: '#1e3c72', fontSize: 16 }}>
              Total Session Time: {formatDuration(loginActivitySessions.reduce((sum, s) => {
                const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
                const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
                if (loginTime && logoutTime) {
                  return sum + Math.round((logoutTime - loginTime) / 1000);
                }
                return sum;
              }, 0))}
            </div>
          )}
        </div>
      )}
      {loginActivitySessions.length > 0 && (
        <>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
              <thead>
                <tr style={{ background: '#e0e7ff' }}>
                  <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Login Time</th>
                  <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Logout Time</th>
                  <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Session Duration</th>
                  <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>IP</th>
                  <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Device</th>
                </tr>
              </thead>
              <tbody>
                {loginActivitySessions.map((s, idx) => {
                  const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
                  const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
                  let duration = null;
                  if (loginTime && logoutTime) {
                    duration = Math.round((logoutTime - loginTime) / 1000);
                  }
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: 8 }}>{loginTime ? loginTime.toLocaleString() : '-'}</td>
                      <td style={{ padding: 8 }}>{logoutTime ? logoutTime.toLocaleString() : '-'}</td>
                      <td style={{ padding: 8 }}>{duration !== null ? formatDuration(duration) : '-'}</td>
                      <td style={{ padding: 8 }}>{s.login && s.login.ip ? s.login.ip : '-'}</td>
                      <td style={{ padding: 8 }}>{s.login && s.login.userAgent ? s.login.userAgent : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
} 