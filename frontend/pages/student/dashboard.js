"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaClipboardList, FaBookOpen, FaChartBar, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser, FaTrashAlt } from "react-icons/fa";
import { BASE_API_URL } from '../apiurl.js';
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '../../service/api.js';

// Sidebar component for Student (always visible, no hamburger)
function StudentSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu }) {
  const menuItems = [
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "quizzes", label: "Quizzes", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "sample-papers", label: "Sample Papers", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "mind-maps", label: "Mind Maps", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "dlr", label: "DLRs", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "books", label: "Books", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "performance", label: "Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "delete-account", label: "Delete Account", icon: <span style={{fontSize:18, color:'#c00'}}>🗑️</span> }
  ];
  return (
    <aside style={{
      width: 260,
      background: "#fff",
      borderRight: "1px solid #e0e0e0",
      minHeight: "100vh",
      padding: "32px 0 0 0",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 2000,
      boxShadow: "2px 0 16px rgba(30,60,114,0.07)",
      overflow: "hidden"
    }}>
      <div style={{ height: "calc(100vh - 120px)", overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px", marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Student Panel</div>
          <img
            src={userPhoto || "/default-avatar.png"}
            alt="Profile"
            style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
          />
          {userName && <div style={{ fontWeight: 600, fontSize: 16, color: "#1e3c72", marginBottom: 2 }}>{userName}</div>}
          <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
        </div>
        <nav>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => { onMenuSelect(item.key); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                background: selectedMenu === item.key ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "none",
                border: "none",
                textAlign: "left",
                padding: "14px 28px",
                fontSize: 17,
                color: selectedMenu === item.key ? "#1e3c72" : "#444",
                cursor: "pointer",
                fontWeight: 600,
                borderLeft: selectedMenu === item.key ? "4px solid #1e3c72" : "4px solid transparent",
                transition: "background 0.18s, color 0.18s"
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => { logout(); window.location.href = "/login"; }}
          style={{
            margin: "32px auto 0 auto",
            width: "80%",
            background: "#ff0080",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "center"
          }}
        >
          Logout
        </button>
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
    };
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      if (inputsRef.current[idx - 1]) inputsRef.current[idx - 1].focus();
    }
  };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[...Array(10)].map((_, i) => (
        <input
          key={i}
          ref={el => inputsRef.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleInput(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          style={{
            width: 32, height: 40, textAlign: "center", fontSize: 18,
            border: "1.5px solid #e0e0e0", borderRadius: 6
          }}
        />
      ))}
    </div>
  );
}

// Move globalUserClass outside the component to persist across renders
let globalUserClass = null;

function StudentDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("assignments");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // CBSE Updates state
  const [cbseUpdates, setCbseUpdates] = useState([]);
  const [cbseLoading, setCbseLoading] = useState(false);

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });

  // Track if announcements have already been fetched for the current class
  const [lastFetchedClass, setLastFetchedClass] = useState(null);

  const fetchAnnouncements = useCallback(() => {
    const studentClass = (profile && profile.class) ? profile.class : globalUserClass;
    if (!studentClass || lastFetchedClass === studentClass) return; // Prevent repeated fetches for same class
    setAnnouncementsLoading(true);
    setLastFetchedClass(studentClass);
    const classParam = `?class=${encodeURIComponent(studentClass)}`;
    console.log("Frontend: Sending class to backend:", studentClass);
    fetch(`${BASE_API_URL}/getannouncements${classParam}`)
      .then(res => res.json())
      .then(data => {
        console.log("Frontend: Announcements received for class", studentClass, data.announcements);
        setAnnouncements(data.announcements || []);
        setAnnouncementsLoading(false);
      })
      .catch(() => setAnnouncementsLoading(false));
  }, [profile, lastFetchedClass]);

  // Fetch profile on mount and when userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchProfile();
    }
  }, [userEmail]);

  const fetchProfile = useCallback(() => {
    if (userEmail) {
      fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data.user);
          setUserName(data.user.name || "");
          setForm({
            name: data.user.name || '',
            username: data.user.username || '',
            phone: data.user.phone || '',
            school: data.user.school || '',
            class: data.user.class || '',
            photo: null
          });
          const photoUrl = data.user.photo && data.user.photo !== "" ? data.user.photo : "/default-avatar.png";
          setPreview(photoUrl);
          setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
          globalUserClass = data.user.class || null;
          console.log("Fetched user class:", globalUserClass);
          if (selectedMenu === "announcements") {
            fetchAnnouncements();
          }
        })
        .catch(() => {
          setProfile(null);
          setUserName("");
          setUserPhoto('');
          globalUserClass = null;
          console.log("Fetched user class: null");
        });
    }
  }, [userEmail, selectedMenu, fetchAnnouncements]);

  // Fetch CBSE updates
  const fetchCbseUpdates = useCallback(() => {
    setCbseLoading(true);
    fetch(`${BASE_API_URL}/cbse-updates`)
      .then(res => res.json())
      .then(data => {
        setCbseUpdates(data.updates || []);
        setCbseLoading(false);
      })
      .catch(() => setCbseLoading(false));
  }, []);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [userEmail]);

  useEffect(() => {
    if (selectedMenu === "announcements") {
      fetchAnnouncements();
    }
  }, [selectedMenu, fetchAnnouncements]);

  useEffect(() => {
    if (selectedMenu === "cbse-updates") {
      fetchCbseUpdates();
    }
  }, [selectedMenu, fetchCbseUpdates]);

  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.photo]);

  const handleEdit = () => {
    setForm({
      name: profile?.name || '',
      username: profile?.username || '',
      phone: profile?.phone || '',
      school: profile?.school || '',
      class: profile?.class || '',
      photo: null
    });
    setPreview(profile?.photo || "/default-avatar.png");
    setEditMode(true);
    setStatus('');
  };
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile?.name || '',
      username: profile?.username || '',
      phone: profile?.phone || '',
      school: profile?.school || '',
      class: profile?.class || '',
      photo: null
    });
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
        body.append('name', form.name ?? '');
        body.append('username', form.username ?? '');
        body.append('phone', form.phone ?? '');
        body.append('school', form.school ?? '');
        body.append('class', form.class ?? '');
        body.append('photo', form.photo);
        headers = { 'Authorization': `Bearer ${getToken()}` };
      } else {
        body = JSON.stringify({
          name: form.name ?? '',
          username: form.username ?? '',
          phone: form.phone ?? '',
          school: form.school ?? '',
          class: form.class ?? ''
        });
        headers = {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        };
      }
      const res = await fetch(`${BASE_API_URL}/profile`, {
        method: 'PUT',
        headers,
        body
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditMode(false);
        setStatus('Profile updated!');
        setPreview(data.user.photo || "/default-avatar.png");
        setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        fetchProfile(); // Only fetch after save
      } else {
        setStatus(data.message || 'Failed to update profile');
      }
    } catch {
      setStatus('Failed to update profile');
    }
  };

  useEffect(() => {
    // On mount, verify token
    const token = getToken();
    console.log('[Student Dashboard] JWT read from localStorage:', token);
    if (!token) {
      // No token, redirect to login
      router.replace("/login");
      return;
    }
    fetch(`${BASE_API_URL}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          // Token invalid or expired
          localStorage.clear();
          router.replace("/login");
        } else if (!res.ok) {
          // Other errors: do not clear JWT, show error or stay
          console.error('Token verification failed with status:', res.status);
        }
      })
      .catch((err) => {
        // Network or other error: do not clear JWT
        console.error('Token verification error:', err);
      });
  }, []);

  const renderContent = () => {
    if (selectedMenu === "profile") {
      if (!profile) {
        return (
          <div style={{ padding: 32 }}>
            <h2>Profile</h2>
            <p>Loading profile...</p>
          </div>
        );
      }
      if (editMode) {
        return (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(30,60,114,0.10)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
              padding: 36,
              maxWidth: 420,
              width: "95vw",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h2 style={{
                marginBottom: 18,
                fontWeight: 700,
                fontSize: 26,
                color: "#1e3c72",
                letterSpacing: 0.5
              }}>Edit Profile</h2>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                width: "100%"
              }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={preview || "/default-avatar.png"}
                    alt="Profile"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 8,
                      border: "3px solid #e0e0e0",
                      boxShadow: "0 2px 12px rgba(30,60,114,0.08)"
                    }}
                  />
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                    }}
                  >📷</button>
                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Name:</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Username:</label>
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Phone:</label>
                    <PhoneInputBoxes
                      value={form.phone || ""}
                      onChange={val => setForm(f => ({ ...f, phone: val }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>School:</label>
                    <input
                      name="school"
                      value={form.school}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Class:</label>
                    <input
                      name="class"
                      value={form.class}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "10px 32px",
                      borderRadius: 8,
                      background: "linear-gradient(90deg,#28a745 0%,#20c997 100%)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
                      transition: "background 0.2s"
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: "10px 32px",
                      borderRadius: 8,
                      background: "#bbb",
                      color: "#222",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
                      transition: "background 0.2s"
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {status && <div style={{ marginTop: 10, color: "#1e3c72" }}>{status}</div>}
              </div>
            </div>
          </div>
        );
      }
      // Profile details view
      return (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(30,60,114,0.10)",
          zIndex: 3000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
            padding: 36,
            maxWidth: 420,
            width: "95vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h2 style={{
              marginBottom: 18,
              fontWeight: 700,
              fontSize: 26,
              color: "#1e3c72",
              letterSpacing: 0.5
            }}>Profile Details</h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              width: "100%"
            }}>
              <div style={{ position: "relative" }}>
                <img
                  src={preview || "/default-avatar.png"}
                  alt="Profile"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 8,
                    border: "3px solid #e0e0e0",
                    boxShadow: "0 2px 12px rgba(30,60,114,0.08)"
                  }}
                />
              </div>
              <div style={{
                width: "100%",
                background: "#f7fafd",
                borderRadius: 12,
                padding: "18px 20px",
                boxShadow: "0 2px 8px rgba(30,60,114,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Name:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Email:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Username:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.username}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Phone:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.phone || "-"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>School:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.school || "-"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Class:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.class || "-"}</span>
                </div>
              </div>
              <button
                onClick={handleEdit}
                style={{
                  marginTop: 18,
                  padding: "10px 32px",
                  borderRadius: 8,
                  background: "linear-gradient(90deg,#1e3c72 0%,#2a5298 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
                  transition: "background 0.2s"
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedMenu("assignments")}
                style={{
                  marginTop: 10,
                  padding: "10px 32px",
                  borderRadius: 8,
                  background: "#bbb",
                  color: "#222",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
                  transition: "background 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (selectedMenu === "delete-account") {
      return (
        <>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(30,60,114,0.10)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
              padding: 36,
              maxWidth: 420,
              width: "95vw",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <FaTrashAlt style={{ fontSize: 48, color: "#c00", marginBottom: 18 }} />
              <h2 style={{
                marginBottom: 12,
                fontWeight: 700,
                fontSize: 26,
                color: "#c00",
                letterSpacing: 0.5
              }}>Delete Account</h2>
              <div style={{ color: "#c00", fontWeight: 600, marginBottom: 18, textAlign: "center" }}>
                Are you sure you want to delete your account?<br />This action cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <button
                  style={{
                    padding: "10px 32px",
                    borderRadius: 8,
                    background: "#c00",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrashAlt style={{ fontSize: 18, marginBottom: -2 }} />
                  Delete Account
                </button>
                <button
                  style={{
                    padding: "10px 32px",
                    borderRadius: 8,
                    background: "#bbb",
                    color: "#222",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedMenu("profile")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          {showDeleteModal && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.25)",
              zIndex: 4000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 20,
                padding: 36,
                minWidth: 340,
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <FaTrashAlt style={{ fontSize: 54, color: "#c00", marginBottom: 18 }} />
                <div style={{ fontWeight: 700, fontSize: 22, color: "#c00", marginBottom: 12 }}>
                  Confirm Account Deletion
                </div>
                <div style={{ color: "#333", marginBottom: 28, fontSize: 16 }}>
                  This action is <b>permanent</b>.<br />Do you really want to delete your account?
                </div>
                <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
                  <button
                    style={{
                      padding: "10px 32px",
                      borderRadius: 8,
                      background: "#c00",
                      color: "#fff",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                    onClick={async () => {
                      try {
                        await deleteAccount(userEmail);
                        localStorage.clear();
                        window.location.href = "/Login";
                      } catch (err) {
                        alert("Failed to delete account. " + (err?.response?.data?.message || err.message));
                        setShowDeleteModal(false);
                      }
                    }}
                  >
                    <FaTrashAlt style={{ fontSize: 18, marginBottom: -2 }} />
                    Yes, Delete
                  </button>
                  <button
                    style={{
                      padding: "10px 32px",
                      borderRadius: 8,
                      background: "#bbb",
                      color: "#222",
                      border: "none",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
    if (selectedMenu === "announcements") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Announcements</h2>
          {announcementsLoading ? <div>Loading...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {announcements.length === 0 && <div>No announcements yet.</div>}
              {announcements.map(a => (
                <div key={a._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8 }}>
                  <div style={{ fontSize: 17, color: "#222", marginBottom: 12, whiteSpace: "pre-line" }}>{a.text}</div>
                  {a.images && a.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                      {a.images.map((img, idx) => (
                        img.fileType === "pdf" ? (
                          <div
                            key={idx}
                            style={{ cursor: "pointer", position: "relative", display: "inline-block" }}
                            onClick={() => setPreviewModal({ open: true, url: img.url, fileType: "pdf" })}
                          >
                            <iframe
                              src={img.url}
                              title={`Announcement PDF ${idx + 1}`}
                              style={{ width: 180, height: 120, border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
                            />
                            <div style={{
                              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                              background: "rgba(255,255,255,0.01)", borderRadius: 8
                            }} />
                          </div>
                        ) : (
                          <img
                            key={idx}
                            src={img.url}
                            alt="Announcement"
                            style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: "0 2px 8px rgba(30,60,114,0.10)", cursor: "pointer" }}
                            onClick={() => setPreviewModal({ open: true, url: img.url, fileType: "image" })}
                          />
                        )
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          {/* Preview Modal for image/pdf */}
          {previewModal.open && (
            <div
              style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
              }}
              onClick={() => setPreviewModal({ open: false, url: '', fileType: '' })}
            >
              <div
                style={{
                  background: "#fff", borderRadius: 12, padding: 16, maxWidth: "90vw", maxHeight: "90vh",
                  boxShadow: "0 4px 24px rgba(30,60,114,0.18)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewModal({ open: false, url: '', fileType: '' })}
                  style={{
                    position: "absolute", top: 8, right: 12, background: "#c0392b", color: "#fff", border: "none",
                    borderRadius: "50%", width: 32, height: 32, fontSize: 22, fontWeight: 700, cursor: "pointer", zIndex: 2
                  }}
                  aria-label="Close"
                >×</button>
                {previewModal.fileType === "pdf" ? (
                  <PDFWithLoader url={previewModal.url} />
                ) : (
                  <img
                    src={previewModal.url}
                    alt="Preview"
                    style={{ maxWidth: "80vw", maxHeight: "80vh", borderRadius: 8 }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "cbse-updates") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 28,
            color: "#1e3c72",
            letterSpacing: 1,
            textAlign: "center"
          }}>
            <FaBullhorn style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />
            CBSE Updates
          </h2>
          {cbseLoading ? (
            <div style={{ textAlign: "center", color: "#1e3c72", fontSize: 20, marginTop: 40 }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {cbseUpdates.length === 0 && (
                <div style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(30,60,114,0.08)",
                  padding: 32,
                  textAlign: "center",
                  color: "#888",
                  fontSize: 18
                }}>
                  No updates found.
                </div>
              )}
              {cbseUpdates.map((u, idx) => (
                <a
                  key={idx}
                  href={u.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 2px 12px rgba(30,60,114,0.10)",
                    padding: "20px 28px",
                    textDecoration: "none",
                    transition: "box-shadow 0.18s, background 0.18s",
                    borderLeft: "5px solid #1e3c72",
                    marginBottom: 2,
                    cursor: "pointer",
                    position: "relative"
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f7fafd"}
                  onMouseOut={e => e.currentTarget.style.background = "#fff"}
                >
                  <span style={{
                    fontSize: 22,
                    color: "#ff0080",
                    flexShrink: 0,
                    marginRight: 2
                  }}>
                    {u.link && (u.link.endsWith(".pdf") || u.link.endsWith(".PDF"))
                      ? <FaBookOpen />
                      : <FaBullhorn />}
                  </span>
                  <span style={{
                    fontWeight: 600,
                    fontSize: 17,
                    color: "#1e3c72",
                    flex: 1,
                    lineHeight: 1.5
                  }}>
                    {u.title}
                  </span>
                  <span style={{
                    fontSize: 15,
                    color: "#888",
                    marginLeft: 12,
                    flexShrink: 0
                  }}>
                    View &rarr;
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "quizzes") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Quizzes</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "sample-papers") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Sample Papers</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "avlrs") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>AVLRs (Video Resource Learning)</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "mind-maps") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Mind Maps</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "dlr") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>DLR (Digital Resource Learning)</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "discussion-panel") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Discussion Panel</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    if (selectedMenu === "creative-corner") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Creative Corner</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, textAlign: "center", color: "#888", fontSize: 18 }}>
            Feature coming soon.
          </div>
        </div>
      );
    }
    // Main content for other menu items
    return (
      <div style={{
        padding: 48,
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(30,60,114,0.08)",
          padding: "48px 32px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center"
        }}>
          <h2 style={{
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 16,
            letterSpacing: 1,
            color: "#1e3c72"
          }}>
            {{
              "assignments": "Assignments",
              "books": "Books",
              "performance": "Performance",
              "announcements": "Announcements",
              "timetable": "Timetable",
              "resources": "Digital Resources"
            }[selectedMenu] || "Welcome"}
          </h2>
          <p style={{
            fontSize: "1.1rem",
            marginBottom: 32,
            color: "#444"
          }}>
            Feature coming soon.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <StudentSidebar
          userEmail={userEmail}
          userPhoto={userPhoto}
          userName={userName}
          onMenuSelect={setSelectedMenu}
          selectedMenu={selectedMenu}
        />
        <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }}>
          {renderContent()}
        </main>
      </div>
      <footer style={{
        width: "100%",
        background: "#1e3c72",
        color: "#fff",
        textAlign: "center",
        padding: "18px 0",
        fontSize: 15,
        letterSpacing: 0.5,
        boxShadow: "0 -2px 12px rgba(30,60,114,0.08)",
        position: "relative"
      }}>
        © {new Date().getFullYear()} VK Student Portal. All rights reserved. | Demo Footer Info
      </footer>
    </div>
  );
}

export default function StudentDashboardPage(props) {
  return (
    <ProtectedRoute>
      <StudentDashboard {...props} />
    </ProtectedRoute>
  );
}

// Add this helper component at the bottom of the file (outside any function/component):
function PDFWithLoader({ url }) {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ position: "relative", width: "70vw", height: "80vh" }}>
      {loading && (
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 1
        }}>
          <div style={{
            border: "6px solid #eee",
            borderTop: "6px solid #1e3c72",
            borderRadius: "50%",
            width: 48,
            height: 48,
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}
      <iframe
        src={url}
        title="PDF Preview"
        style={{ width: "100%", height: "100%", border: "none", borderRadius: 8, background: "#fff" }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}


