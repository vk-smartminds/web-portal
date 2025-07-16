import React, { useState, useEffect } from "react";
import LoginActivityTable from "../../components/LoginActivityTable";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken, getUserData } from "../../utils/auth";
import { FaTrashAlt, FaHistory } from "react-icons/fa";

const subOptions = [
  { key: "delete", label: "Delete Account", icon: <FaTrashAlt /> },
  { key: "login", label: "Login Activity", icon: <FaHistory /> },
];

export default function AccountSettings({ subOption }) {
  const [selected, setSelected] = useState(subOption || null); // Use subOption as initial value
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update selected if subOption changes
  React.useEffect(() => {
    if (subOption && selected !== subOption) {
      setSelected(subOption);
    }
  }, [subOption]);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selected === "delete") {
      window.location.href = "/delete-account";
    }
  }, [selected]);

  let content;
  if (selected === "delete") {
    // Don't render delete UI here, handled by redirect
    return null;
  } else if (selected === "login") {
    content = (
      <div>
        <h4 style={{ fontWeight: 700, fontSize: 18, margin: '0 0 12px 0', color: '#1e3c72' }}>Login Activity</h4>
        <LoginActivityTable showSessionDuration />
      </div>
    );
  } else {
    if (loading) {
      content = <div style={{ padding: 40 }}>Loading...</div>;
    } else if (error) {
      content = <div style={{ color: '#c00', padding: 40 }}>{error}</div>;
    } else if (profile) {
      const role = getRoleFromToken();
      const showSchoolClass = role !== 'guardian' && role !== 'admin';
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', width: '100%' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 700, width: '100%', marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={profile.photo || "/default-avatar.png"} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginRight: 24, border: '2px solid #e0e0e0' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 24 }}>{profile.name || "-"}</div>
                  <div style={{ color: '#888', fontSize: 16 }}>{profile.email || "-"}</div>
                </div>
              </div>
              <button
                onClick={() => { window.location.href = getProfileUrl(); }}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 4px rgba(30,60,114,0.08)' }}
              >
                Edit
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 32 }}>
              <div style={{ flex: '1 1 220px' }}>
                <label style={{ color: '#888', fontSize: 13 }}>Full Name</label>
                <div style={{ fontWeight: 500, fontSize: 16, background: '#f7f7fa', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>{profile.name || '-'}</div>
              </div>
              <div style={{ flex: '1 1 220px' }}>
                <label style={{ color: '#888', fontSize: 13 }}>Phone</label>
                <div style={{ fontWeight: 500, fontSize: 16, background: '#f7f7fa', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>{profile.phone || '-'}</div>
              </div>
              {showSchoolClass && (
                <>
                  <div style={{ flex: '1 1 220px' }}>
                    <label style={{ color: '#888', fontSize: 13 }}>School</label>
                    <div style={{ fontWeight: 500, fontSize: 16, background: '#f7f7fa', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>{profile.school || '-'}</div>
                  </div>
                  <div style={{ flex: '1 1 220px' }}>
                    <label style={{ color: '#888', fontSize: 13 }}>Class</label>
                    <div style={{ fontWeight: 500, fontSize: 16, background: '#f7f7fa', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>{profile.class || '-'}</div>
                  </div>
                </>
              )}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>My email address</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, color: '#1e3c72' }}>✉️</span>
                <span style={{ fontWeight: 500, fontSize: 16 }}>{profile.email || '-'}</span>
              </div>
            </div>
            {/* Show My Children for guardians */}
            {Array.isArray(profile.child) && profile.child.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>My Children</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: '#e0e7ff' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Class</th>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.child.map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: 8 }}>{c.email || '-'}</td>
                        <td style={{ padding: 8 }}>{c.class || '-'}</td>
                        <td style={{ padding: 8 }}>{c.role || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Show My Guardian Info for students */}
            {Array.isArray(profile.guardian) && profile.guardian.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>My Guardian Info</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: '#e0e7ff' }}>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.guardian.map((g, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: 8 }}>{g.name || '-'}</td>
                        <td style={{ padding: 8 }}>{g.email}</td>
                        <td style={{ padding: 8 }}>{g.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      content = <div style={{ color: '#888', padding: 40 }}>No profile data found.</div>;
    }
  }

  return (
    <div style={{ display: 'flex', background: 'transparent', borderRadius: 16, minHeight: 400 }}>
      <aside className="settings-sidebar-custom">
        <div className="sidebar-title-custom">Account</div>
        <ul>
          {subOptions.map(opt => (
            <li
              key={opt.key}
              className={selected === opt.key ? 'active-custom' : ''}
              onClick={() => setSelected(opt.key)}
            >
              <span className="icon-custom">{opt.icon}</span>
              {opt.label}
            </li>
          ))}
        </ul>
        <style jsx>{`
          .settings-sidebar-custom {
            width: 220px;
            background: #181d23;
            border-right: 1px solid #23272e;
            padding: 32px 0 0 0;
            color: #fff;
            font-family: 'Segoe UI', 'Arial', sans-serif;
            border-top-left-radius: 16px;
            border-bottom-left-radius: 16px;
          }
          .sidebar-title-custom {
            font-weight: bold;
            font-size: 1.3rem;
            margin-bottom: 28px;
            text-align: center;
            letter-spacing: 1px;
            color: #fff;
          }
          ul {
            list-style: none;
            padding: 0;
          }
          li {
            padding: 14px 28px;
            cursor: pointer;
            display: flex;
            align-items: center;
            border-radius: 8px;
            margin-bottom: 6px;
            transition: background 0.2s, color 0.2s;
            color: #cfd8dc;
          }
          li.active-custom, li:hover {
            background: #2563eb;
            color: #fff;
          }
          .icon-custom {
            margin-right: 16px;
            font-size: 1.1em;
            display: flex;
            align-items: center;
          }
        `}</style>
      </aside>
      <div style={{ flex: 1, padding: 32 }}>{content}</div>
    </div>
  );
}

function getProfileUrl() {
  const token = getToken();
  if (!token) return "/";
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role ? payload.role.toLowerCase() : null;
    switch (role) {
      case 'admin': return "/admins/profile";
      case 'student': return "/student/profile";
      case 'teacher': return "/teacher/profile";
      case 'guardian': return "/guardian/profile";
      default: return "/";
    }
  } catch {
    return "/";
  }
}

function getRoleFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ? payload.role.toLowerCase() : null;
  } catch {
    return null;
  }
} 