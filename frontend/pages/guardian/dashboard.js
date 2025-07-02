"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaUser, FaChild, FaClipboardList, FaEnvelope, FaBookOpen, FaBullhorn, FaCalendarAlt, FaLaptop, FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { BASE_API_URL } from '../apiurl.js';
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';

function GuardianSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu }) {
  const menuItems = [
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "child", label: "Linked Children", icon: <FaChild style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "books", label: "Books", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "resources", label: "Digital Resources", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "delete-account", label: "Delete Account", icon: <span style={{fontSize:18, color:'#c00'}}>🗑️</span> }
  ];
  return (
    <aside style={{ width: 260, background: "#fff", borderRight: "1px solid #e0e0e0", minHeight: "100vh", padding: "32px 0 0 0", position: "fixed", left: 0, top: 0, zIndex: 2000, boxShadow: "2px 0 16px rgba(30,60,114,0.07)", overflow: "hidden" }}>
      <div style={{ height: "calc(100vh - 120px)", overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Guardian Panel</div>
          <img src={userPhoto || "/default-avatar.png"} alt="Profile" style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }} />
          {userName && <div style={{ fontWeight: 600, fontSize: 16, color: "#1e3c72", marginBottom: 2 }}>{userName}</div>}
          <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
        </div>
        <nav>
          {menuItems.map(item => (
            <button key={item.key} onClick={() => { onMenuSelect(item.key); }} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: selectedMenu === item.key ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "none", border: "none", textAlign: "left", padding: "14px 28px", fontSize: 17, color: selectedMenu === item.key ? "#1e3c72" : "#444", cursor: "pointer", fontWeight: 600, borderLeft: selectedMenu === item.key ? "4px solid #1e3c72" : "4px solid transparent", transition: "background 0.18s, color 0.18s" }}>{item.icon}{item.label}</button>
          ))}
        </nav>
        <button onClick={() => { logout(); window.location.href = "/login"; }} style={{ margin: "32px auto 0 auto", width: "80%", background: "#ff0080", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 600, cursor: "pointer", alignSelf: "center" }}>Logout</button>
      </div>
    </aside>
  );
}

function PhoneInputBoxes({ value, onChange }) {
  const inputsRef = useRef([]);
  const handleInput = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
    let newValue = value.split('');
    newValue[idx] = val;
    newValue = newValue.join('').slice(0, 10);
    onChange(newValue);
    if (val && idx < 9 && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1].focus();
    }
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      if (inputsRef.current[idx - 1]) inputsRef.current[idx - 1].focus();
    }
  };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[...Array(10)].map((_, i) => (
        <input key={i} ref={el => inputsRef.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={value[i] || ""} onChange={e => handleInput(e, i)} onKeyDown={e => handleKeyDown(e, i)} style={{ width: 32, height: 40, textAlign: "center", fontSize: 18, border: "1.5px solid #e0e0e0", borderRadius: 6 }} />
      ))}
    </div>
  );
}

function GuardianDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("announcements");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [cbseUpdates, setCbseUpdates] = useState([]);
  const [cbseLoading, setCbseLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const router = useRouter();

  // Fetch guardian profile
  const fetchProfile = useCallback(() => {
    fetch(`${BASE_API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
        setUserName(data.user.name || "");
        setUserEmail(data.user.email || "");
        setForm({ name: data.user.name || '', phone: data.user.phone || '', photo: null });
        setPreview(data.user.photo && data.user.photo !== "" ? data.user.photo : "/default-avatar.png");
        setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        setChildren(Array.isArray(data.user.child) ? data.user.child : []);
      })
      .catch(() => {
        setProfile(null);
        setUserName("");
        setUserPhoto('');
        setChildren([]);
      });
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { if (form.photo) { const url = URL.createObjectURL(form.photo); setPreview(url); return () => URL.revokeObjectURL(url); } }, [form.photo]);

  // Announcements
  const fetchAnnouncements = useCallback(() => {
    setAnnouncementsLoading(true);
    fetch(`${BASE_API_URL}/getannouncements`)
      .then(res => res.json())
      .then(data => { setAnnouncements(data.announcements || []); setAnnouncementsLoading(false); })
      .catch(() => setAnnouncementsLoading(false));
  }, []);
  // CBSE Updates
  const fetchCbseUpdates = useCallback(() => {
    setCbseLoading(true);
    fetch(`${BASE_API_URL}/cbse-updates`)
      .then(res => res.json())
      .then(data => { setCbseUpdates(data.updates || []); setCbseLoading(false); })
      .catch(() => setCbseLoading(false));
  }, []);
  useEffect(() => { if (selectedMenu === "announcements") fetchAnnouncements(); }, [selectedMenu, fetchAnnouncements]);
  useEffect(() => { if (selectedMenu === "cbse-updates") fetchCbseUpdates(); }, [selectedMenu, fetchCbseUpdates]);

  // Profile edit handlers
  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({ name: profile?.name || '', phone: profile?.phone || '', photo: null });
    setPreview(profile?.photo || "/default-avatar.png");
    setStatus('');
  };
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setForm(f => ({ ...f, photo: files[0] }));
    } else if (name === "phone") {
      setForm(f => ({ ...f, phone: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleSave = async () => {
    setStatus('Saving...');
    try {
      let body;
      let headers;
      if (form.photo) {
        body = new FormData();
        body.append('name', form.name);
        body.append('phone', form.phone);
        body.append('photo', form.photo);
        headers = { 'Authorization': `Bearer ${getToken()}` };
      } else {
        body = JSON.stringify({ name: form.name, phone: form.phone });
        headers = { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
      }
      const res = await fetch(`${BASE_API_URL}/profile`, { method: 'PUT', headers, body });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        setStatus('Profile updated!');
        setPreview(data.user.photo || "/default-avatar.png");
        setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        fetchProfile();
      } else {
        setStatus(data.message || 'Failed to update profile');
      }
    } catch {
      setStatus('Failed to update profile');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${BASE_API_URL}/user/delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail }) });
      if (res.ok) {
        localStorage.clear();
        window.location.href = "/Login";
      } else {
        alert("Failed to delete account.");
      }
    } catch {
      alert("Failed to delete account.");
    }
  };

  // Main content rendering
  const renderContent = () => {
    if (selectedMenu === "profile") {
      if (!profile) return <div style={{ padding: 32 }}><h2>Profile</h2><p>Loading profile...</p></div>;
      if (editMode) {
        return (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(30,60,114,0.10)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)", padding: 36, maxWidth: 420, width: "95vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 style={{ marginBottom: 18, fontWeight: 700, fontSize: 26, color: "#1e3c72", letterSpacing: 0.5 }}>Edit Profile</h2>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
                <div style={{ position: "relative" }}>
                  <img src={preview || "/default-avatar.png"} alt="Profile" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: "3px solid #e0e0e0", boxShadow: "0 2px 12px rgba(30,60,114,0.08)" }} />
                  <input type="file" name="photo" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleChange} />
                  <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ position: "absolute", bottom: 0, right: 0, background: "#fff", border: "1px solid #ccc", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>📷</button>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Name:</label>
                    <input name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Phone:</label>
                    <PhoneInputBoxes value={form.phone || ""} onChange={val => setForm(f => ({ ...f, phone: val }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                  <button onClick={handleSave} style={{ padding: "10px 32px", borderRadius: 8, background: "linear-gradient(90deg,#28a745 0%,#20c997 100%)", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}>Save</button>
                  <button onClick={handleCancel} style={{ padding: "10px 32px", borderRadius: 8, background: "#bbb", color: "#222", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}>Cancel</button>
                </div>
                {status && <div style={{ marginTop: 10, color: "#1e3c72" }}>{status}</div>}
              </div>
            </div>
          </div>
        );
      }
      // Profile details view
      return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(30,60,114,0.10)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)", padding: 36, maxWidth: 420, width: "95vw", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ marginBottom: 18, fontWeight: 700, fontSize: 26, color: "#1e3c72", letterSpacing: 0.5 }}>Profile Details</h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
              <div style={{ position: "relative" }}>
                <img src={preview || "/default-avatar.png"} alt="Profile" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: "3px solid #e0e0e0", boxShadow: "0 2px 12px rgba(30,60,114,0.08)" }} />
              </div>
              <div style={{ width: "100%", background: "#f7fafd", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 8px rgba(30,60,114,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Name:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Email:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Phone:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.phone || "-"}</span>
                </div>
              </div>
              <button onClick={handleEdit} style={{ marginTop: 18, padding: "10px 32px", borderRadius: 8, background: "linear-gradient(90deg,#1e3c72 0%,#2a5298 100%)", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}>Edit</button>
              <button onClick={() => setSelectedMenu("child") } style={{ marginTop: 10, padding: "10px 32px", borderRadius: 8, background: "#bbb", color: "#222", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}>Back</button>
            </div>
          </div>
        </div>
      );
    }
    if (selectedMenu === "child") {
      return (
        <div style={{ padding: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, color: "#1e3c72", marginBottom: 18 }}>Linked Children</h2>
          {children.length === 0 ? <div>No children linked to this guardian account.</div> : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {children.map((child, idx) => {
                let email = typeof child === 'string' ? child : (child.email || JSON.stringify(child));
                return (
                  <li key={idx} style={{ background: "#f7fafd", borderRadius: 10, marginBottom: 12, padding: 18, boxShadow: "0 2px 8px rgba(30,60,114,0.04)" }}>
                    <div style={{ fontWeight: 600, color: "#1e3c72", fontSize: 17 }}>Child Email: {email}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }
    if (selectedMenu === "announcements") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Announcements</h2>
          {announcementsLoading ? <div>Loading...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {announcements.length === 0 && <div>No announcements yet.</div>}
              {announcements.map((a, idx) => (
                <div key={idx} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8 }}>
                  <div style={{ fontSize: 17, color: "#222", marginBottom: 12, whiteSpace: "pre-line" }}>{a.text}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "cbse-updates") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}><FaBullhorn style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />CBSE Updates</h2>
          {cbseLoading ? (<div style={{ textAlign: "center", color: "#1e3c72", fontSize: 20, marginTop: 40 }}>Loading...</div>) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {cbseUpdates.length === 0 && (<div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>No updates found.</div>)}
              {cbseUpdates.map((u, idx) => (
                <a key={idx} href={u.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(30,60,114,0.10)", padding: "20px 28px", textDecoration: "none", transition: "box-shadow 0.18s, background 0.18s", borderLeft: "5px solid #1e3c72", marginBottom: 2, cursor: "pointer", position: "relative" }} onMouseOver={e => e.currentTarget.style.background = "#f7fafd"} onMouseOut={e => e.currentTarget.style.background = "#fff"}>
                  <span style={{ fontSize: 22, color: "#ff0080", flexShrink: 0, marginRight: 2 }}>{u.link && (u.link.endsWith(".pdf") || u.link.endsWith(".PDF")) ? <FaBookOpen /> : <FaBullhorn />}</span>
                  <span style={{ fontWeight: 600, fontSize: 17, color: "#1e3c72", flex: 1, lineHeight: 1.5 }}>{u.title}</span>
                  <span style={{ fontSize: 15, color: "#888", marginLeft: 12, flexShrink: 0 }}>View &rarr;</span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "books") {
      return <div style={{ padding: 32 }}><h2>Books</h2><p>Feature coming soon.</p></div>;
    }
    if (selectedMenu === "resources") {
      return <div style={{ padding: 32 }}><h2>Digital Resources</h2><p>Feature coming soon.</p></div>;
    }
    if (selectedMenu === "delete-account") {
      return (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ color: "#c00", fontWeight: 700, marginBottom: 18 }}>Delete Account</h2>
          <p>This action is <b>permanent</b>. Are you sure you want to delete your account?</p>
          <button onClick={handleDeleteAccount} style={{ padding: "10px 32px", borderRadius: 8, background: "#c00", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", marginRight: 16 }}>Yes, Delete</button>
          <button onClick={() => setSelectedMenu("profile")} style={{ padding: "10px 32px", borderRadius: 8, background: "#bbb", color: "#222", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Cancel</button>
        </div>
      );
    }
    return <div style={{ padding: 32 }}><h2>Welcome to the Guardian Dashboard</h2></div>;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa" }}>
      <GuardianSidebar userEmail={userEmail} userPhoto={userPhoto} userName={userName} onMenuSelect={setSelectedMenu} selectedMenu={selectedMenu} />
      <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }}>{renderContent()}</main>
    </div>
  );
}

export default function GuardianDashboardProtected(props) {
  return (
    <ProtectedRoute allowedRoles={["guardian"]}>
      <GuardianDashboard {...props} />
    </ProtectedRoute>
  );
}