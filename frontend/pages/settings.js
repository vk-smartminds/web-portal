import React, { useState, useEffect } from "react";
import SettingsSidebar from "../components/SettingsSidebar";
import AccountSettings from "./Settings/AccountSettings";
import AppearanceSettings from "./Settings/AppearanceSettings";
import PrivacySettings from "./Settings/PrivacySettings";
import SupportHelp from "./Settings/SupportHelp";
import ChangePassword from "./Settings/ChangePassword";
import AlternativeEmail from "./Settings/AlternativeEmail";
import ScreenTime from '../components/ScreenTime';
import { BASE_API_URL } from "../utils/apiurl";
import { getToken } from "../utils/auth";
import { useRouter } from "next/router";

const Placeholder = ({ label }) => (
  <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
    <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>{label}</h3>
    <div style={{ color: '#666', fontSize: 16 }}>Feature coming soon!</div>
  </div>
);

const settingsComponents = {
  "change-password": ChangePassword,
  "alternative-email": AlternativeEmail,
  "account-settings": AccountSettings,
  "notification": () => <Placeholder label="Notification Settings" />,
  "appearance": AppearanceSettings,
  "privacy": PrivacySettings,
  "screen-time": ScreenTime,
  "payment": () => <Placeholder label="Payment & Subscriptions" />,
  "support": SupportHelp,
};

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

export default function SettingsPage() {
  // No default selection
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check for tab query param on mount
    if (router && router.query && router.query.tab) {
      setSelected(router.query.tab);
    }
  }, [router.query]);

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
    if (selected === "update-profile") {
      const url = getProfileUrl();
      window.location.href = url;
    }
  }, [selected]);

  let SelectedComponent = null;
  let accountSubOption = null;
  if (selected === "delete" || selected === "login") {
    SelectedComponent = AccountSettings;
    accountSubOption = selected;
  } else if (settingsComponents[selected]) {
    SelectedComponent = settingsComponents[selected];
  }

  function ProfileSummaryCard() {
    if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
    if (error) return <div style={{ color: '#c00', padding: 40 }}>{error}</div>;
    if (!profile) return null;
    const role = getRoleFromToken();
    // Only show School and Class if not guardian and not admin
    const showSchoolClass = role !== 'guardian' && role !== 'admin';
    return (
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 700, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={profile.photo || "/default-avatar.png"} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginRight: 24, border: '2px solid #e0e0e0' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 22 }}>{profile.name || "-"}</div>
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
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SettingsSidebar selected={selected} onSelect={setSelected} />
      <main style={{ flex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
        <div style={{ width: '100%', maxWidth: 900, padding: 32 }}>
          {selected === null ? (
            <ProfileSummaryCard />
          ) : (
            selected !== "update-profile" && SelectedComponent && <SelectedComponent subOption={accountSubOption} />
          )}
        </div>
      </main>
    </div>
  );
} 