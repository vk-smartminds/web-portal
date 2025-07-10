import React, { useRef, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { FaKey, FaEnvelope, FaUserEdit, FaCogs, FaBell, FaPaintBrush, FaShieldAlt, FaCreditCard, FaLifeRing } from "react-icons/fa";
import { getToken } from "../utils/auth";
import ChangePassword from "./Settings/ChangePassword";
import AlternativeEmail from "./Settings/AlternativeEmail";
import NotificationSettings from "./Settings/NotificationSettings";
import PrivacySettings from "./Settings/PrivacySettings";
import AccountSettings from "./Settings/AccountSettings";
import SupportHelp from "./Settings/SupportHelp";
import AppearanceSettings from "./Settings/AppearanceSettings";

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

export default function SettingsPage() {
  // Add CSS for spinner animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [activeFeature, setActiveFeature] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Get user role from JWT token
  React.useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role ? payload.role.toLowerCase() : null);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }
  }, []);



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

  // Get profile URL based on user role
  const getProfileUrl = () => {
    switch (userRole) {
      case 'admin': return "/admin/profile";
      case 'student': return "/student/profile";
      case 'teacher': return "/teacher/profile";
      case 'guardian': return "/guardian/profile";
      default: return "/";
    }
  };

  const features = [
    { key: "change-password", label: "Change Password", icon: <FaKey style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Update your account password", ref: changePasswordRef },
    { key: "alternative-email", label: "Alternative Email", icon: <FaEnvelope style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Add or update an alternative email", ref: alternativeEmailRef },
    { key: "update-profile", label: "Update Profile", icon: <FaUserEdit style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Edit your profile information", ref: updateProfileRef, action: () => window.location.href = getProfileUrl() },
    { key: "account-settings", label: "Account Settings", icon: <FaCogs style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Manage your account settings, delete your account, and view login activity", ref: accountSettingsRef },
    { key: "notification-settings", label: "Notification Settings", icon: <FaBell style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Control your notifications", ref: notificationSettingsRef },
    { key: "appearance", label: "Appearance", icon: <FaPaintBrush style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Theme and appearance options", ref: appearanceRef },
    { key: "privacy-settings", label: "Privacy Settings", icon: <FaShieldAlt style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Control your privacy", ref: privacySettingsRef },
    { key: "payment", label: "Payment & Subscriptions", icon: <FaCreditCard style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Manage payments and subscriptions", ref: paymentRef },
    { key: "support", label: "Support & Help", icon: <FaLifeRing style={{ fontSize: 36, marginBottom: 10, color: '#1e3c72' }} />, desc: "Get support and help", ref: supportRef },
  ];



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
          <div ref={changePasswordRef} style={{ display: activeFeature === "change-password" ? 'block' : 'none' }}>
            <ChangePassword />
          </div>
          <div ref={alternativeEmailRef} style={{ display: activeFeature === "alternative-email" ? 'block' : 'none' }}>
            <AlternativeEmail />
          </div>
          <div ref={updateProfileRef} style={{ display: activeFeature === "update-profile" ? 'block' : 'none' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Update Profile</h3>
              <div style={{ color: '#666', fontSize: 16 }}>Feature coming soon!</div>
            </div>
          </div>
          <div ref={accountSettingsRef} style={{ display: activeFeature === "account-settings" ? 'block' : 'none' }}>
            <AccountSettings />
          </div>
          <div ref={notificationSettingsRef} style={{ display: activeFeature === "notification-settings" ? 'block' : 'none' }}>
            <NotificationSettings />
          </div>
          <div ref={appearanceRef} style={{ display: activeFeature === "appearance" ? 'block' : 'none' }}>
            <AppearanceSettings />
          </div>
          <div ref={privacySettingsRef} style={{ display: activeFeature === "privacy-settings" ? 'block' : 'none' }}>
            <PrivacySettings userRole={userRole} />
          </div>
          <div ref={paymentRef} style={{ display: activeFeature === "payment" ? 'block' : 'none' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Payment & Subscriptions</h3>
              <div style={{ color: '#666', fontSize: 16 }}>Feature coming soon!</div>
            </div>
          </div>
          <div ref={supportRef} style={{ display: activeFeature === "support" ? 'block' : 'none' }}>
            <SupportHelp />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 