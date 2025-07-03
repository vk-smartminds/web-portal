"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaClipboardList, FaBookOpen, FaChartBar, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser, FaTrashAlt, FaFilePdf, FaPalette, FaFileVideo } from "react-icons/fa";
import { BASE_API_URL } from '../apiurl.js';
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

// Sidebar component for Student (always visible, no hamburger)
function StudentSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu, profile }) {
  const router = useRouter();
  const menuItems = [
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/cbse-updates" },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} />, action: () => window.location.href = "/announcement" },
    { key: "quizzes", label: "Quizzes", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "sample-papers", label: "Sample Papers", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} />, action: () => window.location.href = "/avlrs" },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} />, action: () => window.location.href = "/dlrs" },
    { key: "mind-maps", label: "Mind Maps", icon: <FaChartBar style={{ fontSize: 18 }} />, action: () => window.location.href = "/mindmaps" },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} />, action: () => {
      if (profile && profile.class) {
        router.push(`/creative-corner?class=${encodeURIComponent(profile.class)}`);
      } else {
        router.push("/creative-corner");
      }
    } },
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
              onClick={() => { item.action ? item.action() : onMenuSelect(item.key); }}
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
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });

  // Track if announcements have already been fetched for the current class
  const [lastFetchedClass, setLastFetchedClass] = useState(null);

  // Creative Corner state
  const [ccSubject, setCcSubject] = useState("");
  const [ccChapter, setCcChapter] = useState("");
  const [ccType, setCcType] = useState("");
  const [creativeItems, setCreativeItems] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccPreviewModal, setCcPreviewModal] = useState({ open: false, url: '', fileType: '', name: '' });

  // Add missing AVLR/DLR search state
  const [avlrSearch, setAvlrSearch] = useState({ class: '', subject: '', chapter: '' });
  const [dlrSearch, setDlrSearch] = useState({ class: '', subject: '', chapter: '' });

  // Fetch profile on mount and when userEmail changes
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
          // Only update form state if not in edit mode
          setForm(f => editMode ? f : {
            name: data.user.name || '',
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
        })
        .catch(() => {
          setProfile(null);
          setUserName("");
          setUserPhoto('');
          globalUserClass = null;
          console.log("Fetched user class: null");
        });
    }
  }, [userEmail, selectedMenu, editMode]);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (selectedMenu === "profile" && userEmail) {
      fetchProfile();
    }
  }, [selectedMenu, userEmail, fetchProfile]);

  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.photo]);

  // Prefill class from student profile
  useEffect(() => {
    if (profile && profile.class) {
      setAvlrSearch(f => ({ ...f, class: profile.class }));
    }
  }, [profile]);

  useEffect(() => {
    if (profile && profile.class) {
      setDlrSearch(f => ({ ...f, class: profile.class }));
    }
  }, [profile]);

  const handleEdit = () => {
    // When entering edit mode, set form state from profile
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      school: profile?.school || '',
      class: profile?.class || '',
      photo: null
    });
    setPreview(profile?.photo || "/default-avatar.png");
    setEditMode(true);
  };
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: profile?.name || '',
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
    if (!form.phone || form.phone.length !== 10) {
      setStatus('Phone number must be exactly 10 digits');
      return;
    }
    setStatus('Saving...');
    try {
      let body;
      let headers;
      if (form.photo) {
        body = new FormData();
        body.append('name', form.name);
        body.append('phone', form.phone);
        body.append('school', form.school);
        body.append('class', form.class);
        body.append('photo', form.photo);
        headers = { 'Authorization': `Bearer ${getToken()}` };
      } else {
        body = JSON.stringify({
          name: form.name,
          phone: form.phone,
          school: form.school,
          class: form.class
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
        fetchProfile();
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
    if (!token) {
      // No token, redirect to login
      router.replace("/Login");
      return;
    }
    fetch(`${BASE_API_URL}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          // Token invalid or user deleted
          localStorage.clear();
          router.replace("/Login");
        }
      })
      .catch(() => {
        localStorage.clear();
        router.replace("/Login");
      });
  }, []);

  // Fetch creative items for student's class
  const fetchCreativeItems = useCallback(() => {
    if (!profile?.class) return;
    setCcLoading(true);
    const params = new URLSearchParams();
    params.append('class', profile.class);
    if (ccSubject) params.append('subject', ccSubject);
    if (ccChapter) params.append('chapter', ccChapter);
    if (ccType) params.append('type', ccType);
    fetch(`${BASE_API_URL}/creative-corner?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCreativeItems(data.creativeItems || []);
        setCcLoading(false);
      })
      .catch(() => setCcLoading(false));
  }, [profile, ccSubject, ccChapter, ccType]);

  useEffect(() => {
    if (selectedMenu === "creative-corner" && profile?.class) {
      fetchCreativeItems();
    }
    // Only run when selectedMenu or filters change
    // eslint-disable-next-line
  }, [selectedMenu, profile?.class]);

  // Refetch only when filters change (not on every render)
  useEffect(() => {
    if (selectedMenu === "creative-corner" && profile?.class) {
      fetchCreativeItems();
    }
    // eslint-disable-next-line
  }, [ccSubject, ccChapter, ccType]);

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
                      // Make class read-only
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4,
                        background: "#f8f9fa",
                        color: "#888"
                      }}
                    />
                  </div>
                  {/* Registered As (read-only) */}
                  <div>
                    <label style={{ fontWeight: 600, color: "#1e3c72" }}>Registered As:</label>
                    <input
                      name="registeredAs"
                      value={profile?.registeredAs || ""}
                      disabled
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1.5px solid #e0e0e0",
                        fontSize: 16,
                        marginTop: 4,
                        background: "#f8f9fa",
                        color: "#666"
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Registered As:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.registeredAs}</span>
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
                      const res = await fetch(`${BASE_API_URL}/user/delete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: userEmail })
                      });
                      if (res.ok) {
                        localStorage.clear();
                        window.location.href = "/Login";
                      } else {
                        alert("Failed to delete account.");
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
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>AVLRs</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <p>AVLRs are not available in this version. Please visit the <a href="/avlrs" style={{ color: "#007bff", fontWeight: 600 }}>AVLRs page</a> for more information.</p>
          </div>
        </div>
      );
    }
    if (selectedMenu === "dlrs") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>DLRs</h2>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <p>DLRs are not available in this version. Please visit the <a href="/dlrs" style={{ color: "#007bff", fontWeight: 600 }}>DLRs page</a> for more information.</p>
          </div>
        </div>
      );
    }
    if (selectedMenu === "discussion-panel") {
      return <DiscussionPanel />;
    }
    if (selectedMenu === "creative-corner") {
      return (
        <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#ff0080", letterSpacing: 1, textAlign: "center" }}>
            <FaPalette style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />
            Creative Corner
          </h2>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Class" value={profile?.class || ""} readOnly style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15, background: '#f7fafd', color: '#888' }} />
            <input type="text" placeholder="Subject" value={ccSubject} onChange={e => setCcSubject(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
            <input type="text" placeholder="Chapter" value={ccChapter} onChange={e => setCcChapter(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
            <select value={ccType} onChange={e => setCcType(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }}>
              <option value="">All Types</option>
              <option value="project">Project</option>
              <option value="activity">Activity</option>
              <option value="poster">Poster</option>
              <option value="artwork">Artwork</option>
              <option value="quiz">Quiz</option>
              <option value="worksheet">Worksheet</option>
              <option value="poem">Poem</option>
              <option value="story">Story</option>
              <option value="other">Other</option>
            </select>
            <button type="button" onClick={fetchCreativeItems} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
            <button type="button" onClick={() => { setCcSubject(""); setCcChapter(""); setCcType(""); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Creative Items for Class {profile?.class}</h3>
          {ccLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #ff0080', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : creativeItems.length === 0 ? (
            <div style={{ color: "#888", fontSize: 17 }}>No creative items found for your class.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {creativeItems.map(item => (
                <div key={item._id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(30,60,114,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontWeight: 600, color: "#ff0080" }}>Subject: {item.subject} | Chapter: {item.chapter} | Type: {item.type} | Title: {item.title}</div>
                  <div style={{ color: "#222", marginBottom: 6 }}>{item.description}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>By: {item.createdBy} | {new Date(item.createdAt).toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {item.files && item.files.map((f, idx) => (
                      f.fileType === 'pdf'
                        ? <div key={idx} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setCcPreviewModal({ open: true, url: f.url, fileType: 'pdf', name: f.originalName })}>
                          <span>PDF</span>
                        </div>
                        : <img key={idx} src={f.url} alt={f.originalName} style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setCcPreviewModal({ open: true, url: f.url, fileType: 'image', name: f.originalName })} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Preview Modal for image/pdf */}
          {ccPreviewModal.open && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCcPreviewModal({ open: false, url: '', fileType: '', name: '' })}>
              <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setCcPreviewModal({ open: false, url: '', fileType: '', name: '' })} style={{ position: 'fixed', top: 24, right: 32, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 28, fontWeight: 700, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} aria-label="Close">×</button>
                {ccPreviewModal.fileType === 'pdf' ? (
                  <iframe src={ccPreviewModal.url} title={ccPreviewModal.name} style={{ width: '80vw', height: '90vh', border: 'none', borderRadius: 8, background: '#fff' }} />
                ) : (
                  <img src={ccPreviewModal.url} alt={ccPreviewModal.name} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
                )}
              </div>
            </div>
          )}
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
          profile={profile}
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


