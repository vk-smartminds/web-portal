"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from "react";
import { FaClipboardList, FaNewspaper, FaChartBar, FaBookOpen, FaBullhorn, FaCalendarAlt, FaEnvelope, FaLaptop, FaUser, FaTrashAlt, FaFilePdf, FaPalette, FaFileVideo, FaBell } from "react-icons/fa";
import ProfileMenu from '../ProfileMenu'; // If you want to use the same ProfileMenu as admin
import { BASE_API_URL } from '../apiurl.js';
import { getToken, logout } from "../../utils/auth.js";
import ProtectedRoute from '../../components/ProtectedRoute';
import DiscussionPanel from '../discussion';
import NotificationPanel from '../../components/NotificationPanel';
// ...
// Sidebar component for Teacher with feature buttons (always visible, no hamburger)
function TeacherSidebar({ userEmail, userPhoto, userName, onMenuSelect, selectedMenu, onLogout }) {
  const menuItems = [
    { key: "test-generator", label: "Test Generator", icon: <FaClipboardList style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} /> }, // <-- Changed icon to FaBullhorn for consistency
    { key: "student-performance", label: "Student Performance", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "book-solutions", label: "Book Solutions", icon: <FaBookOpen style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "timetable", label: "Timetable", icon: <FaCalendarAlt style={{ fontSize: 18 }} /> },
    { key: "messages", label: "Messages", icon: <FaEnvelope style={{ fontSize: 18 }} /> },
    { key: "resources", label: "Digital Resources", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "delete-account", label: "Delete Account", icon: <span style={{fontSize:18, color:'#c00'}}>🗑️</span> },
    { key: "mind-maps", label: "Mind Maps", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} /> },
    { key: "discussion-panel", label: "Discussion Panel", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "notifications", label: "Notifications", icon: <FaBell style={{ fontSize: 18 }} /> },
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
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Teacher Panel</div>
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
          onClick={onLogout}
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
  const inputsRef = React.useRef([]);
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

function TeacherDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("test-generator");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = React.useRef();

  // Add userPhoto state to track the current photo for sidebar
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // CBSE Updates state
  const [cbseUpdates, setCbseUpdates] = useState([]);
  const [cbseLoading, setCbseLoading] = useState(false);

  // Add this line to define previewModal state at the top level of TeacherDashboard
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });

  // Add this state for mind maps
  const [mindMaps, setMindMaps] = useState([]);
  const [mindMapsLoading, setMindMapsLoading] = useState(false);
  const [mmPreview, setMmPreview] = useState({ open: false, url: '', fileType: '' });

  // Add state for Mind Map search fields
  const [mmClass, setMmClass] = useState("");
  const [mmSubject, setMmSubject] = useState("");
  const [mmChapter, setMmChapter] = useState("");
  const [mmStatus, setMmStatus] = useState("");

  // Add state for AVLRs
  const [avlrs, setAvlrs] = useState([]);
  const [avlrsLoading, setAvlrsLoading] = useState(false);
  const [search, setSearch] = useState({ class: '', subject: '', chapter: '' });
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Add state for DLRs
  const [dlrs, setDlrs] = useState([]);
  const [dlrsLoading, setDlrsLoading] = useState(false);
  const [dlrSearch, setDlrSearch] = useState({ class: '', subject: '', chapter: '' });
  const [dlrSearchInitiated, setDlrSearchInitiated] = useState(false);

  // Add previewPdf state and modal as in admin dashboard
  const [previewPdf, setPreviewPdf] = useState({ open: false, url: '' });

  // Creative Corner state
  const [ccClass, setCcClass] = useState("");
  const [ccSubject, setCcSubject] = useState("");
  const [ccChapter, setCcChapter] = useState("");
  const [ccType, setCcType] = useState("");
  const [ccTitle, setCcTitle] = useState("");
  const [ccDescription, setCcDescription] = useState("");
  const [ccFiles, setCcFiles] = useState([]);
  const [ccStatus, setCcStatus] = useState("");
  const [creativeItems, setCreativeItems] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccPreviewModal, setCcPreviewModal] = useState({ open: false, url: '', fileType: '', name: '' });
  // Filters
  const [ccFilterClass, setCcFilterClass] = useState("");
  const [ccFilterSubject, setCcFilterSubject] = useState("");
  const [ccFilterChapter, setCcFilterChapter] = useState("");
  const [ccFilterType, setCcFilterType] = useState("");
  // Edit modal state
  const [ccEditModal, setCcEditModal] = useState({ open: false, item: null });
  const [ccEditClass, setCcEditClass] = useState("");
  const [ccEditSubject, setCcEditSubject] = useState("");
  const [ccEditChapter, setCcEditChapter] = useState("");
  const [ccEditType, setCcEditType] = useState("");
  const [ccEditTitle, setCcEditTitle] = useState("");
  const [ccEditDescription, setCcEditDescription] = useState("");
  const [ccEditFiles, setCcEditFiles] = useState([]);
  const [ccEditRemoveFiles, setCcEditRemoveFiles] = useState([]);
  const [ccEditStatus, setCcEditStatus] = useState("");
  const [ccDeleteConfirmId, setCcDeleteConfirmId] = useState(null);
  // Add state for Creative Corner search initiation
  const [ccSearchInitiated, setCcSearchInitiated] = useState(false);

  const router = useRouter();

  // Logout handler using router.push for consistency
  const handleLogout = useCallback(() => {
    logout();
    router.push("/Login");
  }, [router]);

  // Fetch profile on mount and when userEmail changes (not just when profile menu is selected)
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
            phone: data.user.phone || '',
            school: data.user.school || '',
            class: data.user.class || '',
            photo: null
          });
          const photoUrl = data.user.photo && data.user.photo !== "" ? data.user.photo : "/default-avatar.png";
          setPreview(photoUrl);
          setUserPhoto(data.user.photo && data.user.photo !== "" ? data.user.photo : "");
        })
        .catch(() => {
          setProfile(null);
          setUserName("");
          setUserPhoto('');
        });
    }
  }, [userEmail]);

  // Fetch announcements for all teachers (read-only)
  const fetchAnnouncements = useCallback(() => {
    setAnnouncementsLoading(true);
    fetch(`${BASE_API_URL}/getannouncements?registeredAs=Teacher`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const filtered = (data.announcements || []).filter(a => {
          if (a.announcementFor && Array.isArray(a.announcementFor) && !a.announcementFor.some(role => role.toLowerCase() === 'teacher' || role.toLowerCase() === 'all')) return false;
          return true;
        });
        setAnnouncements(filtered);
        setAnnouncementsLoading(false);
      })
      .catch(() => setAnnouncementsLoading(false));
  }, []);

  // Mark announcement as viewed
  const markAsViewed = async (announcementId) => {
    try {
      await fetch(`${BASE_API_URL}/announcement/${announcementId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
    } catch {}
  };

  // Mark announcements as viewed when they're displayed
  useEffect(() => {
    announcements.forEach(announcement => {
      if (announcement.isNew) {
        markAsViewed(announcement._id);
      }
    });
  }, [announcements]);

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

  // Fetch profile on mount and whenever userEmail changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch profile again when switching to profile tab (to ensure latest data after edit)
  useEffect(() => {
    if (selectedMenu === "profile" && userEmail) {
      fetchProfile();
    }
  }, [selectedMenu, userEmail, fetchProfile]);

  // Fetch announcements when "Announcements" is selected
  useEffect(() => {
    if (selectedMenu === "announcements") {
      fetchAnnouncements();
    }
  }, [selectedMenu, fetchAnnouncements]);

  // Fetch CBSE updates when "CBSE Updates" is selected
  useEffect(() => {
    if (selectedMenu === "cbse-updates") {
      fetchCbseUpdates();
    }
  }, [selectedMenu, fetchCbseUpdates]);

  // Show preview when photo changes
  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.photo]);

  const handleEdit = () => setEditMode(true);
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
        fetchProfile(); // Ensure sidebar photo updates after save
      } else {
        setStatus(data.message || 'Failed to update profile');
      }
    } catch {
      setStatus('Failed to update profile');
    }
  };

  // On mount, verify token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/Login");
      return;
    }
    fetch(`${BASE_API_URL}/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          localStorage.clear();
          router.replace("/Login");
        }
      })
      .catch(() => {
        localStorage.clear();
        router.replace("/Login");
      });
  }, []);

  // Mind Map search handler
  const handleMindMapSearch = async (e) => {
    e.preventDefault();
    if (!mmClass.trim() || !mmSubject.trim() || !mmChapter.trim()) {
      setMmStatus("Please fill all fields.");
      return;
    }
    setMindMapsLoading(true);
    setMmStatus("");
    setMindMaps([]);
    try {
      const res = await fetch(`${BASE_API_URL}/mindmaps`);
      const data = await res.json();
      if (res.ok && data.mindMaps) {
        const filtered = data.mindMaps.filter(m =>
          m.class === mmClass.trim().toLowerCase() &&
          m.subject === mmSubject.trim().toLowerCase() &&
          m.chapter === mmChapter.trim().toLowerCase()
        );
        setMindMaps(filtered);
        if (filtered.length === 0) setMmStatus("No mind maps found.");
      } else {
        setMmStatus("No mind maps found.");
      }
    } catch {
      setMmStatus("Failed to fetch mind maps.");
    }
    setMindMapsLoading(false);
  };

  // Search AVLRs
  const handleSearch = async (e) => {
    e.preventDefault();
    setAvlrsLoading(true);
    setSearchInitiated(true);
    try {
      const params = new URLSearchParams();
      if (search.class) params.append('class', search.class);
      if (search.subject) params.append('subject', search.subject);
      if (search.chapter) params.append('chapter', search.chapter);
      const res = await fetch(`${BASE_API_URL}/avlrs?${params.toString()}`);
      const data = await res.json();
      setAvlrs(data.avlrs || []);
      setAvlrsLoading(false);
    } catch {
      setAvlrs([]);
      setAvlrsLoading(false);
    }
  };

  // Search DLRs
  const handleDlrSearch = async (e) => {
    e.preventDefault();
    setDlrsLoading(true);
    setDlrSearchInitiated(true);
    try {
      const params = new URLSearchParams();
      if (dlrSearch.class) params.append('class', dlrSearch.class);
      if (dlrSearch.subject) params.append('subject', dlrSearch.subject);
      if (dlrSearch.chapter) params.append('chapter', dlrSearch.chapter);
      const res = await fetch(`${BASE_API_URL}/dlrs?${params.toString()}`);
      const data = await res.json();
      setDlrs(data.dlrs || []);
      setDlrsLoading(false);
    } catch {
      setDlrs([]);
      setDlrsLoading(false);
    }
  };

  // Fetch creative items with filters
  const fetchCreativeItems = useCallback(() => {
    setCcLoading(true);
    setCcSearchInitiated(true);
    const params = new URLSearchParams();
    if (ccFilterClass) params.append('class', ccFilterClass);
    if (ccFilterSubject) params.append('subject', ccFilterSubject);
    if (ccFilterChapter) params.append('chapter', ccFilterChapter);
    if (ccFilterType) params.append('type', ccFilterType);
    if (userEmail) params.append('createdBy', userEmail); // Only fetch own items
    fetch(`${BASE_API_URL}/creative-corner?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCreativeItems(data.creativeItems || []);
        setCcLoading(false);
      })
      .catch(() => setCcLoading(false));
  }, [ccFilterClass, ccFilterSubject, ccFilterChapter, ccFilterType, userEmail]);
  useEffect(() => {
    if (selectedMenu === "creative-corner") fetchCreativeItems();
  }, [selectedMenu, fetchCreativeItems]);

  // Add creative item
  const handleAddCreative = async e => {
    e.preventDefault();
    setCcStatus("Adding...");
    const formData = new FormData();
    formData.append("class", ccClass);
    formData.append("subject", ccSubject);
    formData.append("chapter", ccChapter);
    formData.append("type", ccType);
    formData.append("title", ccTitle);
    formData.append("description", ccDescription);
    ccFiles.forEach(f => formData.append("files", f));
    try {
      const res = await fetch(`${BASE_API_URL}/creative-corner`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCcStatus("Creative item added!");
        setCcClass(""); setCcSubject(""); setCcChapter(""); setCcType(""); setCcTitle(""); setCcDescription(""); setCcFiles([]);
        fetchCreativeItems();
      } else {
        setCcStatus(data.message || data.error || "Failed to add");
      }
    } catch {
      setCcStatus("Failed to add");
    }
  };

  // Edit modal logic
  const openEditModal = (item) => {
    setCcEditModal({ open: true, item });
    setCcEditClass(item.class);
    setCcEditSubject(item.subject);
    setCcEditChapter(item.chapter);
    setCcEditType(item.type);
    setCcEditTitle(item.title);
    setCcEditDescription(item.description || "");
    setCcEditFiles([]);
    setCcEditRemoveFiles([]);
    setCcEditStatus("");
  };
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setCcEditStatus("Saving...");
    const formData = new FormData();
    formData.append("class", ccEditClass);
    formData.append("subject", ccEditSubject);
    formData.append("chapter", ccEditChapter);
    formData.append("type", ccEditType);
    formData.append("title", ccEditTitle);
    formData.append("description", ccEditDescription);
    ccEditFiles.forEach(f => formData.append("files", f));
    ccEditRemoveFiles.forEach(idx => formData.append("removeFiles", idx));
    try {
      const res = await fetch(`${BASE_API_URL}/creative-corner/${ccEditModal.item._id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCcEditStatus("Updated!");
        setCcEditModal({ open: false, item: null });
        fetchCreativeItems();
      } else {
        setCcEditStatus(data.message || data.error || "Failed to update");
      }
    } catch {
      setCcEditStatus("Failed to update");
    }
  };

  // Main content based on selected menu
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
                onClick={() => setSelectedMenu("test-generator")}
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
    if (selectedMenu === "announcements") {
      return (
        <div style={{ padding: 48, maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Announcements</h2>
          {announcementsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {announcements.length === 0 && <div>No announcements yet.</div>}
              {announcements.map(a => (
                <div key={a._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8, position: 'relative' }}>
                  {/* NEW indicator */}
                  {a.isNew && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#ff0080',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 2
                    }}>
                      NEW
                    </div>
                  )}
                  <div style={{ fontSize: 17, color: "#222", marginBottom: 12, whiteSpace: "pre-line" }}>{a.text}</div>
                  {a.images && a.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                      {a.images.map((img, idx) => (
                        typeof img === "object" && img.url ? (
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
                        ) : (
                          // fallback for old data: just show as image
                          <img key={idx} src={img} alt="Announcement" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }} />
                        )
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
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
    if (selectedMenu === "mind-maps") {
      return (
        <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Search Mind Maps</h2>
          <form onSubmit={handleMindMapSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", flexDirection: 'column', gap: 18, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <input type="text" placeholder="Class" value={mmClass} onChange={e => setMmClass(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginBottom: 12 }} />
              </div>
              <div style={{ flex: 1 }}>
                <input type="text" placeholder="Subject" value={mmSubject} onChange={e => setMmSubject(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginBottom: 12 }} />
              </div>
              <div style={{ flex: 2 }}>
                <input type="text" placeholder="Chapter" value={mmChapter} onChange={e => setMmChapter(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              </div>
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
            {mmStatus && <div style={{ marginTop: 12, color: mmStatus.includes("found") ? "#c0392b" : "#1e3c72" }}>{mmStatus}</div>}
          </form>
          {mindMapsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : mindMaps.length === 0 && mmStatus ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {mindMaps.map((m, idx) => (
                <div key={m._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: "#1e3c72", marginBottom: 8 }}>Class: {m.class} | Subject: {m.subject} | Chapter: {m.chapter}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {m.mindmap && m.mindmap.map((img, i) => (
                      img.fileType === 'pdf'
                        ? <div key={i} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setMmPreview({ open: true, url: img.url, fileType: 'pdf' })}>
                          <span>PDF</span>
                          <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                            <div className="spinner" style={{ width: 24, height: 24, border: '4px solid #eee', borderTop: '4px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          </span>
                          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
                        </div>
                        : <img key={i} src={img.url} alt="mindmap" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setMmPreview({ open: true, url: img.url, fileType: 'image' })} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Preview Modal for image/pdf */}
          {mmPreview.open && (
            <div
              style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
              }}
              onClick={() => setMmPreview({ open: false, url: '', fileType: '' })}
            >
              <div
                style={{
                  position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setMmPreview({ open: false, url: '', fileType: '' })}
                  style={{
                    position: 'fixed', top: 24, right: 32, background: '#c0392b', color: '#fff', border: 'none',
                    borderRadius: '50%', width: 44, height: 44, fontSize: 28, fontWeight: 700, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                  }}
                  aria-label="Close"
                >×</button>
                {mmPreview.fileType === 'pdf' ? (
                  <PDFWithLoader url={mmPreview.url} fullscreen={true} />
                ) : (
                  <img
                    src={mmPreview.url}
                    alt="Preview"
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'contain', background: '#222', borderRadius: 0, margin: 0, padding: 0, zIndex: 5 }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "avlrs") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>AVLRs</h2>
          <form onSubmit={handleSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={search.class} onChange={e => setSearch(f => ({ ...f, class: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={search.subject} onChange={e => setSearch(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={search.chapter} onChange={e => setSearch(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
          </form>
          {avlrsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (!searchInitiated ? (
            <div style={{ color: "#888", fontSize: 17 }}>Enter search criteria to find AVLRs.</div>
          ) : avlrs.length === 0 ? (
            <div style={{ color: "#888", fontSize: 17 }}>No AVLRs found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {avlrs.map(a => {
                // Extract YouTube video ID if possible
                let ytId = null;
                try {
                  const url = new URL(a.link);
                  if (url.hostname.includes("youtube.com")) {
                    const params = new URLSearchParams(url.search);
                    ytId = params.get("v");
                  } else if (url.hostname === "youtu.be") {
                    ytId = url.pathname.slice(1);
                  }
                } catch {}
                const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                return (
                  <div key={a._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 18 }}>
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="Video thumbnail" style={{ width: 120, height: 80, borderRadius: 8, objectFit: 'cover', border: '1.5px solid #eee' }} />
                    ) : (
                      <div style={{ width: 120, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafd', borderRadius: 8, border: '1.5px solid #eee' }}>
                        <FaFileVideo style={{ fontSize: 38, color: '#1e3c72' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#1e3c72", marginBottom: 8 }}>Class: {a.class} | Subject: {a.subject} | Chapter: {a.chapter}</div>
                      <div style={{ marginBottom: 8 }}>
                        <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ color: "#007bff", fontWeight: 600, wordBreak: 'break-all' }}>{a.link}</a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }
    if (selectedMenu === "dlrs") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>DLRs</h2>
          <form onSubmit={handleDlrSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={dlrSearch.class} onChange={e => setDlrSearch(f => ({ ...f, class: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={dlrSearch.subject} onChange={e => setDlrSearch(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={dlrSearch.chapter} onChange={e => setDlrSearch(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
          </form>
          {dlrsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (!dlrSearchInitiated ? (
            <div style={{ color: "#888", fontSize: 17 }}>Enter search criteria to find DLRs.</div>
          ) : dlrs.length === 0 ? (
            <div style={{ color: "#888", fontSize: 17 }}>No DLRs found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {dlrs.map(dlr => (
                <div key={dlr._id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: "#1e3c72", marginBottom: 8 }}>Class: {dlr.class} | Subject: {dlr.subject} | Chapter: {dlr.chapter}</div>
                  <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {dlr.pdfs.map((pdf, idx) => (
                      <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setPreviewPdf({ open: true, url: pdf.url })}>
                        <FaFilePdf style={{ fontSize: 20, color: '#e74c3c' }} /> <span style={{ fontWeight: 600 }}>PDF {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {/* PDF Preview Modal */}
          {previewPdf.open && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,60,114,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '90vw', height: '90vh', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => setPreviewPdf({ open: false, url: '' })} style={{ position: 'absolute', top: 16, right: 24, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontWeight: 700, fontSize: 22, cursor: 'pointer', zIndex: 2 }}>×</button>
                <iframe src={previewPdf.url} title="PDF Preview" style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12, background: '#fff' }} />
              </div>
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "creative-corner") {
      return (
        <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#ff0080", letterSpacing: 1, textAlign: "center" }}>
            <FaPalette style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />
            Creative Corner
          </h2>
          {/* Add Form */}
          <form onSubmit={handleAddCreative} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
              <input type="text" placeholder="Class" value={ccClass} onChange={e => setCcClass(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={ccSubject} onChange={e => setCcSubject(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={ccChapter} onChange={e => setCcChapter(e.target.value)} required style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
              <select value={ccType} onChange={e => setCcType(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}>
                <option value="">Select Type</option>
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
              <input type="text" placeholder="Title" value={ccTitle} onChange={e => setCcTitle(e.target.value)} required style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <textarea placeholder="Description (optional)" value={ccDescription} onChange={e => setCcDescription(e.target.value)} rows={2} style={{ width: "100%", padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginBottom: 18 }} />
            <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={e => setCcFiles(Array.from(e.target.files))} style={{ marginBottom: 12 }} />
            <div style={{ marginTop: 10, color: "#1e3c72", fontWeight: 500 }}>{ccStatus}</div>
            <button type="submit" style={{ background: "#ff0080", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer", marginTop: 12 }}>Add</button>
          </form>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Class" value={ccFilterClass} onChange={e => setCcFilterClass(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
            <input type="text" placeholder="Subject" value={ccFilterSubject} onChange={e => setCcFilterSubject(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
            <input type="text" placeholder="Chapter" value={ccFilterChapter} onChange={e => setCcFilterChapter(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
            <select value={ccFilterType} onChange={e => setCcFilterType(e.target.value)} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }}>
              <option value="" disabled>Select Type</option>
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
            <button type="button" onClick={() => { setCcFilterClass(""); setCcFilterSubject(""); setCcFilterChapter(""); setCcFilterType(""); setCcSearchInitiated(false); setCreativeItems([]); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>All Creative Items</h3>
          {ccLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #ff0080', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : !ccSearchInitiated ? (
            <div style={{ color: "#888", fontSize: 17 }}>Enter filter criteria to search Creative Corner items.</div>
          ) : creativeItems.length === 0 ? (
            <div style={{ color: "#888", fontSize: 17 }}>No creative items found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {creativeItems.map(item => (
                <div key={item._id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(30,60,114,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 8, position: 'relative' }}>
                  <div style={{ fontWeight: 600, color: "#ff0080" }}>Class: {item.class} | Subject: {item.subject} | Chapter: {item.chapter} | Type: {item.type} | Title: {item.title}</div>
                  <div style={{ color: "#222", marginBottom: 6 }}>{item.description}</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>By: {item.createdBy} | {new Date(item.createdAt).toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {item.files && item.files.map((f, idx) => (
                      f.fileType === 'pdf'
                        ? <div key={idx} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setCcPreviewModal({ open: true, url: f.url, fileType: 'pdf', name: f.originalName })}>
                            <span>PDF</span>
                          </div>
                        : <img key={idx} src={f.url} alt={f.originalName} style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee" }} />
                    ))}
                  </div>
                  {/* Only show Edit/Delete if createdBy matches userEmail */}
                  {item.createdBy === userEmail && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button onClick={() => openEditModal(item)} style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => setCcDeleteConfirmId(item._id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Edit Modal */}
          {ccEditModal.open && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
              <form onSubmit={handleSaveEdit} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center', maxWidth: 420 }}>
                <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit Creative Item</h3>
                <input type="text" placeholder="Class" value={ccEditClass} onChange={e => setCcEditClass(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" placeholder="Subject" value={ccEditSubject} onChange={e => setCcEditSubject(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" placeholder="Chapter" value={ccEditChapter} onChange={e => setCcEditChapter(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <select value={ccEditType} onChange={e => setCcEditType(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }}>
                  <option value="">Select Type</option>
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
                <input type="text" placeholder="Title" value={ccEditTitle} onChange={e => setCcEditTitle(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <textarea placeholder="Description (optional)" value={ccEditDescription} onChange={e => setCcEditDescription(e.target.value)} rows={2} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
                {/* Existing files with remove buttons */}
                {ccEditModal.item && ccEditModal.item.files && ccEditModal.item.files.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Existing Files:</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {ccEditModal.item.files.map((f, idx) => (
                        <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                          {f.fileType === 'pdf'
                            ? <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', border: '1px solid #eee', borderRadius: 6, padding: 4, background: '#fafafa', maxWidth: 120, maxHeight: 80, overflow: 'hidden' }}>PDF {idx + 1}</a>
                            : <img src={f.url} alt={f.originalName} style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: '1px solid #eee' }} />}
                          <button type="button" onClick={() => setCcEditRemoveFiles(prev => [...prev, idx])} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 700, cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={e => setCcEditFiles(Array.from(e.target.files))} style={{ marginBottom: 12 }} />
                <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{ccEditStatus}</div>
                <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setCcEditModal({ open: false, item: null })} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
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
    if (selectedMenu === "discussion-panel") {
      return <DiscussionPanel />;
    }
    if (selectedMenu === "notifications") {
      return <NotificationPanel />;
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
              "test-generator": "Test Generator",
              "cbse-updates": "CBSE Updates",
              "student-performance": "Student Performance",
              "book-solutions": "Book Solutions",
              "announcements": "Announcements",
              "timetable": "Timetable",
              "messages": "Messages",
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

  useEffect(() => {
    if (selectedMenu === "creative-corner") {
      setCreativeItems([]);
      setCcSearchInitiated(false);
    }
  }, [selectedMenu]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <TeacherSidebar
          userEmail={userEmail}
          userPhoto={userPhoto}
          userName={userName}
          onMenuSelect={setSelectedMenu}
          selectedMenu={selectedMenu}
          onLogout={handleLogout}
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
        © {new Date().getFullYear()} VK Teacher Portal. All rights reserved. | Demo Footer Info
      </footer>
    </div>
  );
}

export default function TeacherDashboardPage(props) {
  return (
    <ProtectedRoute>
      <TeacherDashboard {...props} />
    </ProtectedRoute>
  );
}

// Add this helper component at the bottom of the file (outside any function/component):
function PDFWithLoader({ url, fullscreen }) {
  const [loading, setLoading] = React.useState(true);
  return (
    <div style={{ position: "relative", width: fullscreen ? "100vw" : "70vw", height: fullscreen ? "100vh" : "80vh" }}>
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