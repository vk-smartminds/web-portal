import React, { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from '../components/ProtectedRoute';
import { BASE_API_URL } from '../utils/apiurl.js';
import { getUserData, getToken, logout } from "../utils/auth.js";

// Add this style block at the top of the file (or in a global CSS if preferred)
const blinkStyle = `
@keyframes blink-badge {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.blink-badge {
  animation: blink-badge 1s steps(1, end) infinite;
}
`;

export default function DashboardCommon({
  SidebarComponent,
  menuItems,
  userType = "User",
  renderContent,
  profileFields = ["name", "phone", "school", "class", "photo"],
  customSidebarProps = {},
  customProfileFetch,
  children
}) {
  const [selectedMenu, setSelectedMenu] = useState(menuItems?.[0]?.key || "profile");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [userName, setUserName] = useState("");
  const [newAnnouncementCount, setNewAnnouncementCount] = useState(0);
  const [blink, setBlink] = useState(true);

  // Fetch profile logic (can be overridden)
  const fetchProfile = useCallback(() => {
    if (typeof customProfileFetch === "function") return customProfileFetch();
    const u = getUserData();
    if (u && u.email) {
      setUserEmail(u.email);
      fetch(`${BASE_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data.user);
          setUserName(data.user.name || "");
          const newForm = {};
          profileFields.forEach(f => newForm[f] = data.user[f] || (f === 'photo' ? null : ''));
          setForm(newForm);
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
  }, [customProfileFetch, profileFields]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (form.photo && typeof form.photo === "object" && form.photo instanceof File) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof form.photo === "string") {
      setPreview(form.photo);
    }
  }, [form.photo]);

  useEffect(() => {
    let registeredAs = userType;
    if (userType === 'Guardian') registeredAs = 'Parent';
    fetch(`${BASE_API_URL}/getannouncements?registeredAs=${registeredAs}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.announcements) {
          const count = data.announcements.filter(a => a.isNew).length;
          setNewAnnouncementCount(count);
        }
      });
  }, [userType]);

  // Blinking effect for announcement count
  useEffect(() => {
    if (newAnnouncementCount > 0) {
      const interval = setInterval(() => {
        setBlink(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setBlink(true);
    }
  }, [newAnnouncementCount]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      const newForm = {};
      profileFields.forEach(f => newForm[f] = profile[f] || (f === 'photo' ? null : ''));
      setForm(newForm);
      setPreview(profile.photo || "/default-avatar.png");
    }
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

  // Render badge function to be used by all sidebars
  const renderAnnouncementBadge = (count) => (
    count > 0 ? (
      <span className="blink-badge" style={{
        marginLeft: 8,
        background: "#1e3c72",
        color: "#fff",
        borderRadius: "50%",
        padding: "2px 8px",
        fontSize: 13,
        fontWeight: 700,
        minWidth: 22,
        textAlign: "center",
        display: "inline-block"
      }}>{count}</span>
    ) : null
  );

  // Sidebar props
  const sidebarProps = {
    userEmail,
    userPhoto,
    userName,
    onMenuSelect: setSelectedMenu,
    selectedMenu,
    profile,
    newAnnouncementCount,
    renderAnnouncementBadge,
    ...customSidebarProps
  };

  return (
    <ProtectedRoute>
      <style>{blinkStyle}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", flexDirection: "column" }}>
        <div style={{ display: "flex", flex: 1 }}>
          {SidebarComponent && <SidebarComponent {...sidebarProps} />}
          <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }}>
            {renderContent ? renderContent({
              selectedMenu,
              setSelectedMenu,
              profile,
              editMode,
              setEditMode,
              form,
              setForm,
              status,
              setStatus,
              preview,
              setPreview,
              fileInputRef,
              userPhoto,
              userName,
              handleEdit,
              handleCancel,
              handleChange,
              fetchProfile
            }) : children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 