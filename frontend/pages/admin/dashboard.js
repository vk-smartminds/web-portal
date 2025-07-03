"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaUsers, FaUserTie, FaBook, FaRegListAlt, FaCog, FaBullhorn, FaChartBar, FaUserShield, FaBars, FaTimes, FaUser, FaBookOpen, FaLaptop, FaFilePdf, FaPalette, FaFileAlt, FaImage, FaBookReader, FaPenFancy, FaTasks, FaFileVideo } from "react-icons/fa";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from '../apiurl.js';
import { getUserData, getToken, isAuthenticated, isTokenExpired, logout } from "../../utils/auth.js";

function AdminSidebar({ userEmail, userPhoto, onMenuSelect, selectedMenu, isSuperAdmin, setShowAddAdmin, setShowRemoveAdmin, setShowViewAdmins }) {
  const menuItems = [
    ...(isSuperAdmin ? [
      { key: "add-admin", label: "Add Admin", icon: <FaUserShield style={{ fontSize: 18 }} />, action: () => setShowAddAdmin(true) },
      { key: "remove-admin", label: "Remove Admin", icon: <FaUserShield style={{ fontSize: 18, color: '#c0392b' }} />, action: () => setShowRemoveAdmin(true) },
      { key: "manage-users", label: "Manage Users", icon: <FaUsers style={{ fontSize: 18 }} /> },
    ] : []),
    { key: "view-admins", label: "View Admins", icon: <FaUsers style={{ fontSize: 18 }} />, action: () => setShowViewAdmins(true) },
    { key: "manage-books", label: "Manage Books", icon: <FaBook style={{ fontSize: 18 }} /> },
    { key: "records", label: "Records", icon: <FaRegListAlt style={{ fontSize: 18 }} /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "cbse-updates", label: "CBSE Updates", icon: <FaBullhorn style={{ fontSize: 18 }} /> },
    { key: "mindmap", label: "Mind Map", icon: <FaBookOpen style={{ fontSize: 18 }} /> }, // <-- Mind Map option
    { key: "reports", label: "Reports", icon: <FaChartBar style={{ fontSize: 18 }} /> },
    { key: "settings", label: "Settings", icon: <FaCog style={{ fontSize: 18 }} /> },
    { key: "profile", label: "Profile", icon: <FaUser style={{ fontSize: 18 }} /> },
    { key: "avlrs", label: "AVLRs", icon: <FaLaptop style={{ fontSize: 18 }} /> },
    { key: "dlrs", label: "DLRs", icon: <FaFilePdf style={{ fontSize: 18 }} /> },
    { key: "creative-corner", label: "Creative Corner", icon: <FaPalette style={{ fontSize: 18, color: '#ff0080' }} /> },
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
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6, alignSelf: "flex-start", color: "#1e3c72" }}>Admin Panel</div>
          <img
            src={userPhoto || "/default-avatar.png"}
            alt="Profile"
            style={{ width: 72, height: 72, borderRadius: "50%", margin: "14px 0", objectFit: "cover", boxShadow: "0 2px 8px rgba(30,60,114,0.10)" }}
          />
          <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>{userEmail}</div>
        </div>
        <nav>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={item.action ? item.action : () => { onMenuSelect(item.key); }}
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

function AdminDashboard() {
  const [selectedMenu, setSelectedMenu] = useState("manage-users");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showRemoveAdmin, setShowRemoveAdmin] = useState(false);
  const [showViewAdmins, setShowViewAdmins] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [adminForm, setAdminForm] = useState({ email: "", isSuperAdmin: false });
  const [addStatus, setAddStatus] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [removeStatus, setRemoveStatus] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState("");
  const [showRemoveImages, setShowRemoveImages] = useState(false);
  const [removeImagesAnnouncement, setRemoveImagesAnnouncement] = useState(null);
  const [removeImagesPreview, setRemoveImagesPreview] = useState([]);
  const [removeImagesToDelete, setRemoveImagesToDelete] = useState([]);
  const [removeImagesStatus, setRemoveImagesStatus] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [removedImages, setRemovedImages] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [removingImage, setRemovingImage] = useState({ announcementId: null, imageIndex: null, loading: false });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [cbseUpdates, setCbseUpdates] = useState([]);
  const [cbseLoading, setCbseLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [editClasses, setEditClasses] = useState(""); // <-- for editing classes

  // Mind Map hooks (must be at top level)
  const [mmClass, setMmClass] = useState("");
  const [mmSubject, setMmSubject] = useState("");
  const [mmChapter, setMmChapter] = useState("");
  const [mmImages, setMmImages] = useState([]);
  const [mmStatus, setMmStatus] = useState("");
  const [mindMaps, setMindMaps] = useState([]);
  const [mmLoading, setMmLoading] = useState(false);

  // Add state for editing mind maps
  const [editMindMap, setEditMindMap] = useState(null);
  const [editMmClass, setEditMmClass] = useState("");
  const [editMmSubject, setEditMmSubject] = useState("");
  const [editMmChapter, setEditMmChapter] = useState("");
  const [editMmImages, setEditMmImages] = useState([]); // new files
  const [editMmRemove, setEditMmRemove] = useState([]); // indices to remove

  // In Mind Map section, add a loading state for fetching mind maps
  const [mindMapsLoading, setMindMapsLoading] = useState(true);

  // Add state for preview modal
  const [previewFile, setPreviewFile] = useState(null); // { url, fileType }

  // Add state for AVLRs
  const [avlrs, setAvlrs] = useState([]);
  const [avlrsLoading, setAvlrsLoading] = useState(false);
  const [avlrForm, setAvlrForm] = useState({ class: '', subject: '', chapter: '', link: '' });
  const [avlrStatus, setAvlrStatus] = useState('');
  const [editAvlr, setEditAvlr] = useState(null);

  // Add state for DLRs
  const [dlrs, setDlrs] = useState([]);
  const [dlrsLoading, setDlrsLoading] = useState(false);
  const [dlrForm, setDlrForm] = useState({ class: '', subject: '', chapter: '', pdfs: [] });
  const [dlrStatus, setDlrStatus] = useState('');
  const [editDlr, setEditDlr] = useState(null);

  // Search state for AVLRs and DLRs
  const [avlrSearch, setAvlrSearch] = useState({ class: '', subject: '', chapter: '' });
  const [dlrSearch, setDlrSearch] = useState({ class: '', subject: '', chapter: '' });
  const [avlrSearchInitiated, setAvlrSearchInitiated] = useState(false);
  const [dlrSearchInitiated, setDlrSearchInitiated] = useState(false);

  // Add state for PDF preview modal
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

  // Creative Corner filter state
  const [ccFilterClass, setCcFilterClass] = useState("");
  const [ccFilterSubject, setCcFilterSubject] = useState("");
  const [ccFilterChapter, setCcFilterChapter] = useState("");
  const [ccFilterType, setCcFilterType] = useState("");

  // Creative Corner edit modal state
  const [ccEditModal, setCcEditModal] = useState({ open: false, item: null });
  const [ccEditClass, setCcEditClass] = useState("");
  const [ccEditSubject, setCcEditSubject] = useState("");
  const [ccEditChapter, setCcEditChapter] = useState("");
  const [ccEditType, setCcEditType] = useState("");
  const [ccEditTitle, setCcEditTitle] = useState("");
  const [ccEditDescription, setCcEditDescription] = useState("");
  const [ccEditFiles, setCcEditFiles] = useState([]);
  const [ccEditStatus, setCcEditStatus] = useState("");
  // For edit modal: track files to remove
  const [ccEditRemoveFiles, setCcEditRemoveFiles] = useState([]);
  // For delete confirmation
  const [ccDeleteConfirmId, setCcDeleteConfirmId] = useState(null);

  // Add state for Creative Corner search initiation and createdBy filter
  const [ccSearchInitiated, setCcSearchInitiated] = useState(false);
  const [ccFilterCreatedBy, setCcFilterCreatedBy] = useState("");

  // Handle open edit modal
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

  // Handle save edit
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

  // Fetch all mind maps
  useEffect(() => {
    setMindMapsLoading(true);
    fetch(`${BASE_API_URL}/mindmaps`)
      .then(res => res.json())
      .then(data => {
        setMindMaps(data.mindMaps || []);
        setMindMapsLoading(false);
      })
      .catch(() => {
        setMindMaps([]);
        setMindMapsLoading(false);
      });
  }, []);

  // Handle image input
  const handleMmImageChange = e => {
    setMmImages(Array.from(e.target.files));
  };

  // Handle add mind map
  const handleAddMindMap = async e => {
    e.preventDefault();
    setMmStatus("Adding...");
    const formData = new FormData();
    formData.append("class", mmClass);
    formData.append("subject", mmSubject);
    formData.append("chapter", mmChapter);
    mmImages.forEach(img => formData.append("mindmap", img));
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMmStatus("Mind map added!");
        setMmClass(""); setMmSubject(""); setMmChapter(""); setMmImages([]);
        setMindMaps(prev => [data.mindMap, ...prev]);
      } else {
        setMmStatus(data.message || data.error || "Failed to add");
      }
    } catch {
      setMmStatus("Failed to add");
    }
  };

  // Handle delete mind map
  const handleDeleteMindMap = async id => {
    if (!window.confirm("Delete this mind map?")) return;
    setMmStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setMindMaps(prev => prev.filter(m => m._id !== id));
        setMmStatus("Deleted!");
      } else {
        setMmStatus("Failed to delete");
      }
    } catch {
      setMmStatus("Failed to delete");
    }
  };

  // PhoneInputBoxes component for 10-digit phone input
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
          setUserPhoto('');
        });
    }
  }, [userEmail]);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
    setIsSuperAdmin(localStorage.getItem("isSuperAdmin") === "true");
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

  // Admin management logic
  // Fetch admin info for this user to check isSuperAdmin
  useEffect(() => {
    const user = getUserData();
    if (user && user.email) {
      setUserEmail(user.email);
      fetch(`${BASE_API_URL}/getadmins`)
        .then(res => res.json())
        .then(data => {
          const found = (data.admins || []).find(a => a.email === user.email);
          setIsSuperAdmin(found?.isSuperAdmin === true);
        })
        .catch(() => setIsSuperAdmin(false));
    }
  }, []);

  // Fetch admins when modal opens
  useEffect(() => {
    if (showViewAdmins) {
      fetch(`${BASE_API_URL}/getadmins`)
        .then(res => res.json())
        .then(data => setAdmins(data.admins || []))
        .catch(() => setAdmins([]));
    }
  }, [showViewAdmins]);

  // Add admin handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddStatus("Adding...");
    try {
      const res = await fetch(`${BASE_API_URL}/addadmins`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          email: adminForm.email,
          isSuperAdmin: adminForm.isSuperAdmin,
          requesterEmail: userEmail
        })
      });
      if (res.ok) {
        setAddStatus("Admin added!");
        setAdminForm({ email: "", isSuperAdmin: false });
      } else {
        const data = await res.json();
        setAddStatus(data.message || "Failed to add admin");
      }
    } catch {
      setAddStatus("Failed to add admin");
    }
  };

  // Remove admin handler
  const handleRemoveAdmin = async (e) => {
    e.preventDefault();
    setRemoveStatus("Removing...");
    try {
      const res = await fetch(`${BASE_API_URL}/removeadmin`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          email: removeEmail,
          requesterEmail: userEmail
        })
      });
      if (res.ok) {
        setRemoveStatus("Admin removed!");
        setRemoveEmail("");
      } else {
        const data = await res.json();
        setRemoveStatus(data.message || "Failed to remove admin");
      }
    } catch {
      setRemoveStatus("Failed to remove admin");
    }
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
        setSelectedMenu('manage-users');
      } else {
        setStatus(data.message || 'Failed to update profile');
      }
    } catch {
      setStatus('Failed to update profile');
    }
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    setSearchStatus("Searching...");
    setSearchedUser(null);
    setDeleteStatus("");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email: searchEmail, requesterEmail: userEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedUser(data.user);
        setSearchStatus("");
      } else {
        const data = await res.json();
        setSearchedUser(null);
        setSearchStatus(data.message || "User not found");
      }
    } catch {
      setSearchedUser(null);
      setSearchStatus("Error searching user");
    }
  };

  const handleDeleteUser = async () => {
    setDeleteStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ email: searchedUser.email, requesterEmail: userEmail })
      });
      if (res.ok) {
        setDeleteStatus("User deleted successfully.");
        setSearchedUser(null);
        setSearchEmail("");
        setTimeout(() => {
          setShowDeleteModal(false);
          setDeleteStatus("");
        }, 1200);
      } else {
        const data = await res.json();
        setDeleteStatus(data.message || "Failed to delete user");
      }
    } catch {
      setDeleteStatus("Failed to delete user");
    }
  };

  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'images' && files) {
      setForm(f => ({ ...f, images: Array.from(files) }));
      // Show previews for new images
      const filePreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreview(prev => Array.isArray(prev) ? [...prev, ...filePreviews] : filePreviews);
    } else if (name === 'text' || name === 'announcementFor') {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      
      // Parse and send announcementFor as array
      let announcementForArr = editAnnouncementFor;
      if (typeof announcementForArr === "string") {
        announcementForArr = announcementForArr.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      
      // Only send classes if ONLY Student is selected
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        // Handle classes update
        let classesArr = editClasses;
        if (typeof classesArr === "string") {
          classesArr = classesArr.split(",").map(cls => cls.trim()).filter(Boolean);
        }
        if (Array.isArray(classesArr)) {
          classesArr.forEach(cls => formData.append('classes[]', cls));
        }
      } else {
        // If Student is selected with others, send empty classes array (all students)
        if (announcementForArr.some(item => item.toLowerCase() === 'student')) {
          formData.append('classes[]', ''); // Empty array for all students
        }
      }
      
      if (form.images && form.images.length > 0) {
        for (let i = 0; i < form.images.length; i++) {
          formData.append('images', form.images[i]);
        }
      }
      if (removedImages.length > 0) {
        removedImages.forEach(idx => formData.append('removeImages', idx));
      }
      const res = await fetch(`${BASE_API_URL}/updateannouncement/${editAnnouncement._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Announcement updated!');
        setShowEdit(false);
        setEditAnnouncement(null);
        setForm({ text: '', images: [], announcementFor: '' });
        setEditClasses("");
        setEditAnnouncementFor("");
        // Update the announcement in the state
        setAnnouncements(prev => prev.map(a => a._id === data.announcement._id ? data.announcement : a));
      } else {
        setStatus(data.message || 'Failed to update');
      }
    } catch {
      setStatus('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    setStatus('Deleting...');
    try {
      const res = await fetch(`${BASE_API_URL}/removeannouncement/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Deleted!');
        setDeleteConfirmId(null);
        // Remove the deleted announcement from the state
        setAnnouncements(prev => prev.filter(a => a._id !== data.id));
      } else {
        setStatus('Failed to delete');
      }
    } catch {
      setStatus('Failed to delete');
    }
  };

  const handleRemoveImage = (idx) => {
    setPreview(prev => Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : []);
    setRemovedImages(prev => [...prev, idx]);
  };

  // Open remove images modal
  const handleOpenRemoveImages = (announcement) => {
    console.log("open modal", announcement); // DEBUG: Check if handler is called
    setRemoveImagesAnnouncement(announcement);
    setRemoveImagesPreview(Array.isArray(announcement.images) ? [...announcement.images] : []);
    setRemoveImagesToDelete([]);
    setShowRemoveImages(true);
    setRemoveImagesStatus('');
  };

  // Remove image in remove images modal
  const handleRemoveImageInModal = (idx) => {
    setRemoveImagesPreview(prev => prev.filter((_, i) => i !== idx));
    setRemoveImagesToDelete(prev => [...prev, idx]);
  };

  // Save changes in remove images modal
  const handleSaveRemoveImages = async () => {
    setRemoveImagesStatus('Saving...');
    try {
      const formData = new FormData();
      if (removeImagesToDelete.length > 0) {
        removeImagesToDelete.forEach(idx => formData.append('removeImages', idx));
      }
      const res = await fetch(`${BASE_API_URL}/updateannouncement/${removeImagesAnnouncement._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setRemoveImagesStatus('Images removed!');
        setShowRemoveImages(false);
        setRemoveImagesAnnouncement(null);
        setRemoveImagesPreview([]);
        setRemoveImagesToDelete([]);
        fetchAnnouncements();
      } else {
        setRemoveImagesStatus(data.message || 'Failed to remove images');
      }
    } catch {
      setRemoveImagesStatus('Failed to remove images');
    }
  };

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
    if (selectedMenu === "cbse-updates") {
      fetchCbseUpdates();
    }
  }, [selectedMenu, fetchCbseUpdates]);

  // Open edit modal
  const handleOpenEditMindMap = (m) => {
    setEditMindMap(m);
    setEditMmClass(m.class);
    setEditMmSubject(m.subject);
    setEditMmChapter(m.chapter);
    setEditMmImages([]);
    setEditMmRemove([]);
  };

  // Remove existing image/pdf by index
  const handleRemoveEditMmImage = (idx) => {
    setEditMmRemove(prev => [...prev, idx]);
  };

  // Add new files
  const handleEditMmImageChange = e => {
    setEditMmImages(Array.from(e.target.files));
  };

  // Save edit
  const handleSaveEditMindMap = async (e) => {
    e.preventDefault();
    if (!editMindMap) return;
    setMmStatus("Saving...");
    const formData = new FormData();
    formData.append("class", editMmClass);
    formData.append("subject", editMmSubject);
    formData.append("chapter", editMmChapter);
    editMmImages.forEach(img => formData.append("mindmap", img));
    editMmRemove.forEach(idx => formData.append("removeImages", idx));
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap/${editMindMap._id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMindMaps(prev => prev.map(m => m._id === data.mindMap._id ? data.mindMap : m));
        setEditMindMap(null);
        setMmStatus("Mind map updated!");
      } else {
        setMmStatus(data.message || data.error || "Failed to update");
      }
    } catch {
      setMmStatus("Failed to update");
    }
  };

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
                onClick={() => setSelectedMenu("manage-users")}
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
    if (selectedMenu === "manage-users" && isSuperAdmin) {
      return (
        <div style={{ padding: 48, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Manage Users</h2>
          <form onSubmit={handleUserSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input
              type="email"
              placeholder="Enter user email (exact match)"
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              required
              style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
            />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
          </form>
          {searchStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{searchStatus}</div>}
          {searchedUser && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
              <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, color: "#1e3c72" }}>User Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(searchedUser).map(([key, value]) => (
                  key !== "password" && key !== "__v" && key !== "_id" && (
                    <div key={key} style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                    </div>
                  )
                ))}
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{ marginTop: 18, background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer" }}
              >
                Delete User
              </button>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", textAlign: "center" }}>
                <div style={{ marginBottom: 18, fontWeight: 600, fontSize: "1.2rem", color: "#c0392b" }}>
                  Are you sure you want to delete this user?
                </div>
                <button
                  onClick={handleDeleteUser}
                  style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, cursor: "pointer", marginRight: 12 }}
                  disabled={deleteStatus === "Deleting..."}
                >
                  {deleteStatus === "Deleting..." ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteStatus(""); }}
                  style={{ background: "#eee", color: "#1e3c72", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, cursor: "pointer" }}
                  disabled={deleteStatus === "Deleting..."}
                >
                  Cancel
                </button>
                {deleteStatus && deleteStatus !== "Deleting..." && <div style={{ marginTop: 12, color: deleteStatus.includes("success") ? "#28a745" : "#c0392b" }}>{deleteStatus}</div>}
              </div>
            </div>
          )}
        </div>
      );
    }
    if (selectedMenu === "announcements") {
      // Announcements Section
      return (
        <AnnouncementsSection isSuperAdmin={isSuperAdmin} userEmail={userEmail} />
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
    if (selectedMenu === "mindmap") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
            <FaBookOpen style={{ marginRight: 12, color: "#1e3c72", fontSize: 28, verticalAlign: "middle" }} />
            Mind Maps
          </h2>
          <form onSubmit={handleAddMindMap} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18, color: "#1e3c72" }}>Add Mind Map</h3>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={mmClass} onChange={e => setMmClass(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={mmSubject} onChange={e => setMmSubject(e.target.value)} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={mmChapter} onChange={e => setMmChapter(e.target.value)} required style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="file" accept="image/*,application/pdf" multiple onChange={handleMmImageChange} required style={{ fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }} disabled={mmLoading}>Add Mind Map</button>
            {mmStatus && <div style={{ marginTop: 12, color: mmStatus.includes("add") || mmStatus.includes("Deleted") ? "#28a745" : "#c0392b" }}>{mmStatus}</div>}
          </form>
          <form onSubmit={handleMmSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, color: "#1e3c72" }}>Search Mind Maps to Edit/Delete</h3>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={mmSearch.class} onChange={e => setMmSearch(f => ({ ...f, class: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={mmSearch.subject} onChange={e => setMmSearch(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={mmSearch.chapter} onChange={e => setMmSearch(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
            <button type="button" onClick={() => { setMmSearch({ class: '', subject: '', chapter: '' }); setMmSearchInitiated(false); setMindMaps([]); }} style={{ background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer", marginLeft: 12 }}>Clear</button>
          </form>
          {mindMapsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            !mmSearchInitiated ? (
              <div style={{ color: "#888", fontSize: 17 }}>Enter search criteria to find Mind Maps to edit or delete.</div>
            ) : mindMaps.length === 0 ? (
              <div style={{ color: "#888", fontSize: 17 }}>No mind maps found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {mindMaps.map(m => (
                  <div key={m._id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(30,60,114,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontWeight: 600, color: "#1e3c72" }}>Class: {m.class} | Subject: {m.subject} | Chapter: {m.chapter}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {m.mindmap && m.mindmap.map((img, idx) => (
                        img.fileType === 'pdf'
                          ? <div key={idx} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setPreviewFile({ url: img.url, fileType: 'pdf' })}>
                              <span>PDF</span>
                              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2 }}>
                                <div className="spinner" style={{ width: 24, height: 24, border: '4px solid #eee', borderTop: '4px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              </span>
                              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
                            </div>
                          : <img key={idx} src={img.url} alt="mindmap" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setPreviewFile({ url: img.url, fileType: 'image' })} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button onClick={() => handleOpenEditMindMap(m)} style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => handleDeleteMindMap(m._id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {/* Edit Mind Map Modal */}
          {editMindMap && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
              <form onSubmit={handleSaveEditMindMap} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center', maxWidth: 420 }}>
                <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit Mind Map</h3>
                <input type="text" placeholder="Class" value={editMmClass} onChange={e => setEditMmClass(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" placeholder="Subject" value={editMmSubject} onChange={e => setEditMmSubject(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" placeholder="Chapter" value={editMmChapter} onChange={e => setEditMmChapter(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Existing Files:</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {editMindMap.mindmap && editMindMap.mindmap.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        {img.fileType === 'pdf'
                          ? <a href={img.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', border: '1px solid #eee', borderRadius: 6, padding: 4, background: '#fafafa', maxWidth: 120, maxHeight: 80, overflow: 'hidden' }}>PDF {idx + 1}</a>
                          : <img src={img.url} alt="mindmap" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: '1px solid #eee' }} />}
                        <button type="button" onClick={() => handleRemoveEditMmImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 700, cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <input type="file" accept="image/*,application/pdf" multiple onChange={handleEditMmImageChange} style={{ fontSize: 16 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18 }}>
                  <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={() => setEditMindMap(null)} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
                {mmStatus && <div style={{ marginTop: 10, color: mmStatus.includes('update') ? '#28a745' : '#c0392b' }}>{mmStatus}</div>}
              </form>
            </div>
          )}
          {/* Preview Modal */}
          {previewFile && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewFile(null)}>
              <div
                style={{
                  position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewFile(null)}
                  style={{
                    position: 'fixed', top: 24, right: 32, background: '#c0392b', color: '#fff', border: 'none',
                    borderRadius: '50%', width: 44, height: 44, fontSize: 28, fontWeight: 700, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                  }}
                  aria-label="Close"
                >×</button>
                {previewFile.fileType === 'pdf' ? (
                  <PDFWithLoader url={previewFile.url} fullscreen={true} />
                ) : (
                  <img
                    src={previewFile.url}
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
          {/* Search Form */}
          <form onSubmit={handleAvlrSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, color: "#1e3c72" }}>Search AVLRs to Edit/Delete</h3>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={avlrSearch.class} onChange={e => setAvlrSearch(f => ({ ...f, class: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={avlrSearch.subject} onChange={e => setAvlrSearch(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={avlrSearch.chapter} onChange={e => setAvlrSearch(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
            <button type="button" onClick={() => { setAvlrSearch({ class: '', subject: '', chapter: '' }); setAvlrSearchInitiated(false); }} style={{ background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer", marginLeft: 12 }}>Clear</button>
          </form>
          {/* Add/Edit Form */}
          <form onSubmit={editAvlr ? handleUpdateAvlr : handleAddAvlr} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={avlrForm.class} onChange={e => setAvlrForm(f => ({ ...f, class: e.target.value }))} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={avlrForm.subject} onChange={e => setAvlrForm(f => ({ ...f, subject: e.target.value }))} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={avlrForm.chapter} onChange={e => setAvlrForm(f => ({ ...f, chapter: e.target.value }))} required style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="url" placeholder="Link (https://...)" value={avlrForm.link} onChange={e => setAvlrForm(f => ({ ...f, link: e.target.value }))} required style={{ width: '100%', padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: editAvlr ? "#f7ca18" : "#1e3c72", color: editAvlr ? "#222" : "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>{editAvlr ? 'Update' : 'Add'} AVLR</button>
            {avlrStatus && <div style={{ marginTop: 12, color: avlrStatus.includes("add") || avlrStatus.includes("updated") || avlrStatus.includes("Deleted") ? "#28a745" : "#c0392b" }}>{avlrStatus}</div>}
          </form>
          {avlrsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            !avlrSearchInitiated ? (
              <div style={{ color: "#888", fontSize: 17 }}>Enter search criteria to find AVLRs to edit or delete.</div>
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
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <button onClick={() => handleEditAvlr(a)} style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteAvlr(a._id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      );
    }
    if (selectedMenu === "dlrs") {
      return (
        <div style={{ padding: 48, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>DLRs</h2>
          {/* Search Form */}
          <form onSubmit={handleDlrSearch} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, color: "#1e3c72" }}>Search DLRs to Edit/Delete</h3>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={dlrSearch.class} onChange={e => setDlrSearch(f => ({ ...f, class: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={dlrSearch.subject} onChange={e => setDlrSearch(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={dlrSearch.chapter} onChange={e => setDlrSearch(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Search</button>
            <button type="button" onClick={() => { setDlrSearch({ class: '', subject: '', chapter: '' }); setDlrSearchInitiated(false); }} style={{ background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer", marginLeft: 12 }}>Clear</button>
          </form>
          {/* Add/Edit Form */}
          <form onSubmit={editDlr ? handleUpdateDlr : handleAddDlr} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
              <input type="text" placeholder="Class" value={dlrForm.class} onChange={e => setDlrForm(f => ({ ...f, class: e.target.value }))} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Subject" value={dlrForm.subject} onChange={e => setDlrForm(f => ({ ...f, subject: e.target.value }))} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
              <input type="text" placeholder="Chapter" value={dlrForm.chapter} onChange={e => setDlrForm(f => ({ ...f, chapter: e.target.value }))} required style={{ flex: 2, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input type="file" accept="application/pdf" multiple onChange={handleDlrFileChange} style={{ width: '100%', padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            </div>
            <button type="submit" style={{ background: editDlr ? "#f7ca18" : "#1e3c72", color: editDlr ? "#222" : "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>{editDlr ? 'Update' : 'Add'} DLR</button>
            {dlrStatus && <div style={{ marginTop: 12, color: dlrStatus.includes("add") || dlrStatus.includes("updated") || dlrStatus.includes("Deleted") ? "#28a745" : "#c0392b" }}>{dlrStatus}</div>}
          </form>
          {dlrsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
              <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            !dlrSearchInitiated ? (
              <div style={{ color: "#888", fontSize: 17 }}>Enter search criteria to find DLRs to edit or delete.</div>
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
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button onClick={() => handleEditDlr(dlr)} style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => handleDeleteDlr(dlr._id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
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
            {ccStatus && <div style={{ marginTop: 10, color: '#c0392b', fontWeight: 500 }}>{ccStatus}</div>}
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
          ) : !ccSearchInitiated ? null : creativeItems.length === 0 ? (
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
                        : <img key={idx} src={f.url} alt={f.originalName} style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setCcPreviewModal({ open: true, url: f.url, fileType: 'image', name: f.originalName })} />
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
              "manage-users": "Manage Users",
              "manage-teachers": "Manage Teachers",
              "manage-books": "Manage Books",
              "records": "Records",
              "announcements": "Announcements",
              "reports": "Reports",
              "settings": "Settings"
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

  // Move AVLRs functions inside AdminDashboard
  const fetchAvlrs = () => {
    setAvlrsLoading(true);
    const params = new URLSearchParams();
    if (avlrSearch.class) params.append('class', avlrSearch.class);
    if (avlrSearch.subject) params.append('subject', avlrSearch.subject);
    if (avlrSearch.chapter) params.append('chapter', avlrSearch.chapter);
    fetch(`${BASE_API_URL}/avlrs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setAvlrs(data.avlrs || []);
        setAvlrsLoading(false);
      })
      .catch(() => {
        setAvlrs([]);
        setAvlrsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedMenu === "avlrs") fetchAvlrs();
  }, [selectedMenu]);

  const handleAddAvlr = async (e) => {
    e.preventDefault();
    setAvlrStatus('Adding...');
    try {
      const res = await fetch(`${BASE_API_URL}/avlr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(avlrForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAvlrStatus('AVLR added!');
        setAvlrForm({ class: '', subject: '', chapter: '', link: '' });
        fetchAvlrs();
      } else {
        setAvlrStatus(data.message || 'Failed to add');
      }
    } catch {
      setAvlrStatus('Failed to add');
    }
  };

  const handleEditAvlr = (avlr) => {
    setEditAvlr(avlr);
    setAvlrForm({ class: avlr.class, subject: avlr.subject, chapter: avlr.chapter, link: avlr.link });
  };

  const handleUpdateAvlr = async (e) => {
    e.preventDefault();
    if (!editAvlr) return;
    setAvlrStatus('Updating...');
    try {
      const res = await fetch(`${BASE_API_URL}/avlr/${editAvlr._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(avlrForm)
      });
      const data = await res.json();
      if (res.ok) {
        setAvlrStatus('AVLR updated!');
        setEditAvlr(null);
        setAvlrForm({ class: '', subject: '', chapter: '', link: '' });
        fetchAvlrs();
      } else {
        setAvlrStatus(data.message || 'Failed to update');
      }
    } catch {
      setAvlrStatus('Failed to update');
    }
  };

  const handleDeleteAvlr = async (id) => {
    if (!window.confirm('Delete this AVLR?')) return;
    setAvlrStatus('Deleting...');
    try {
      const res = await fetch(`${BASE_API_URL}/avlr/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setAvlrStatus('Deleted!');
        fetchAvlrs();
      } else {
        setAvlrStatus('Failed to delete');
      }
    } catch {
      setAvlrStatus('Failed to delete');
    }
  };

  const fetchDlrs = () => {
    setDlrsLoading(true);
    const params = new URLSearchParams();
    if (dlrSearch.class) params.append('class', dlrSearch.class);
    if (dlrSearch.subject) params.append('subject', dlrSearch.subject);
    if (dlrSearch.chapter) params.append('chapter', dlrSearch.chapter);
    fetch(`${BASE_API_URL}/dlrs?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setDlrs(data.dlrs || []);
        setDlrsLoading(false);
      })
      .catch(() => {
        setDlrs([]);
        setDlrsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedMenu === "dlrs") fetchDlrs();
  }, [selectedMenu]);

  const handleDlrFileChange = e => {
    setDlrForm(f => ({ ...f, pdfs: Array.from(e.target.files) }));
  };

  const handleAddDlr = async (e) => {
    e.preventDefault();
    setDlrStatus('Adding...');
    const formData = new FormData();
    formData.append('class', dlrForm.class);
    formData.append('subject', dlrForm.subject);
    formData.append('chapter', dlrForm.chapter);
    dlrForm.pdfs.forEach(pdf => formData.append('pdfs', pdf));
    try {
      const res = await fetch(`${BASE_API_URL}/dlr`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setDlrStatus('DLR added!');
        setDlrForm({ class: '', subject: '', chapter: '', pdfs: [] });
        fetchDlrs();
      } else {
        setDlrStatus(data.message || 'Failed to add');
      }
    } catch {
      setDlrStatus('Failed to add');
    }
  };

  const handleEditDlr = (dlr) => {
    setEditDlr(dlr);
    setDlrForm({ class: dlr.class, subject: dlr.subject, chapter: dlr.chapter, pdfs: [] });
  };

  const handleUpdateDlr = async (e) => {
    e.preventDefault();
    if (!editDlr) return;
    setDlrStatus('Updating...');
    const formData = new FormData();
    formData.append('class', dlrForm.class);
    formData.append('subject', dlrForm.subject);
    formData.append('chapter', dlrForm.chapter);
    dlrForm.pdfs.forEach(pdf => formData.append('pdfs', pdf));
    try {
      const res = await fetch(`${BASE_API_URL}/dlr/${editDlr._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setDlrStatus('DLR updated!');
        setEditDlr(null);
        setDlrForm({ class: '', subject: '', chapter: '', pdfs: [] });
        fetchDlrs();
      } else {
        setDlrStatus(data.message || 'Failed to update');
      }
    } catch {
      setDlrStatus('Failed to update');
    }
  };

  const handleDeleteDlr = async (id) => {
    if (!window.confirm('Delete this DLR?')) return;
    setDlrStatus('Deleting...');
    try {
      const res = await fetch(`${BASE_API_URL}/dlr/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setDlrStatus('Deleted!');
        fetchDlrs();
      } else {
        setDlrStatus('Failed to delete');
      }
    } catch {
      setDlrStatus('Failed to delete');
    }
  };

  // Search handlers for AVLRs and DLRs
  const handleAvlrSearch = async (e) => {
    e.preventDefault();
    setAvlrSearchInitiated(true);
    fetchAvlrs();
  };

  const handleDlrSearch = async (e) => {
    e.preventDefault();
    setDlrSearchInitiated(true);
    fetchDlrs();
  };

  // Add handleEdit for profile editing
  const handleEdit = () => setEditMode(true);

  // Fetch creative items with filters
  const fetchCreativeItems = useCallback(() => {
    setCcLoading(true);
    setCcSearchInitiated(true);
    setCcStatus('');
    const params = new URLSearchParams();
    if (ccFilterClass) params.append('class', ccFilterClass);
    if (ccFilterSubject) params.append('subject', ccFilterSubject);
    if (ccFilterChapter) params.append('chapter', ccFilterChapter);
    if (ccFilterType) params.append('type', ccFilterType);
    fetch(`${BASE_API_URL}/creative-corner?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setCreativeItems(data.creativeItems || []);
        setCcLoading(false);
      })
      .catch(() => setCcLoading(false));
  }, [ccFilterClass, ccFilterSubject, ccFilterChapter, ccFilterType]);


  // Handle add creative item
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

  // 1. Add state for mind map search/filter
  const [mmSearch, setMmSearch] = useState({ class: '', subject: '', chapter: '' });
  const [mmSearchInitiated, setMmSearchInitiated] = useState(false);

  // 2. Add a search handler
  const handleMmSearch = (e) => {
    e.preventDefault();
    setMmSearchInitiated(true);
    setMindMapsLoading(true);
    const params = new URLSearchParams();
    if (mmSearch.class) params.append('class', mmSearch.class);
    if (mmSearch.subject) params.append('subject', mmSearch.subject);
    if (mmSearch.chapter) params.append('chapter', mmSearch.chapter);
    fetch(`${BASE_API_URL}/mindmaps?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setMindMaps(data.mindMaps || []);
        setMindMapsLoading(false);
      })
      .catch(() => {
        setMindMaps([]);
        setMindMapsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedMenu === "creative-corner") {
      setCreativeItems([]);
      setCcSearchInitiated(false);
    }
  }, [selectedMenu]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    fetch(`${BASE_API_URL}/getannouncements`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data.announcements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Mark announcement as viewed
  const markAsViewed = async (announcementId) => {
    console.log('Admin markAsViewed called for:', announcementId);
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
    let anyMarked = false;
    announcements.forEach(announcement => {
      if (announcement.isNew) {
        markAsViewed(announcement._id);
        anyMarked = true;
      }
    });
    if (anyMarked) {
      // Refetch announcements after marking as viewed to update the UI
      setTimeout(() => fetchAnnouncements(), 300);
    }
  }, [announcements, fetchAnnouncements]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fa", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <AdminSidebar
          userEmail={userEmail}
          userPhoto={userPhoto}
          onMenuSelect={setSelectedMenu}
          selectedMenu={selectedMenu}
          isSuperAdmin={isSuperAdmin}
          setShowAddAdmin={setShowAddAdmin}
          setShowRemoveAdmin={setShowRemoveAdmin}
          setShowViewAdmins={setShowViewAdmins}
        />
        <main style={{ marginLeft: 260, flex: 1, minHeight: "100vh", background: "#f4f7fa", transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)" }}>
          {renderContent()}
        </main>
      </div>
      {/* Admin management UI for superadmins */}
      {isSuperAdmin && (
        <>
          {/* Add Admin Modal */}
          {showAddAdmin && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
            }}>
              <div style={{
                background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
              }}>
                <h2 style={{ marginBottom: 18 }}>Add Admin</h2>
                <form onSubmit={handleAddAdmin}>
                  <div style={{ marginBottom: 12 }}>
                    <label>Email:</label><br />
                    <input
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                      style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                    />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={adminForm.isSuperAdmin}
                        onChange={e => setAdminForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                      />{" "}
                      Is Superadmin
                    </label>
                  </div>
                  <button type="submit" style={{
                    background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer"
                  }}>
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowAddAdmin(false); setAddStatus(""); }} style={{
                    marginLeft: 12, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                  }}>
                    Cancel
                  </button>
                  <div style={{ marginTop: 10, color: "#1e3c72", fontWeight: 500 }}>{addStatus}</div>
                </form>
              </div>
            </div>
          )}
          {/* Remove Admin Modal */}
          {showRemoveAdmin && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
            }}>
              <div style={{
                background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
              }}>
                <h2 style={{ marginBottom: 18, color: "#c0392b" }}>Remove Admin</h2>
                <form onSubmit={handleRemoveAdmin}>
                  <div style={{ marginBottom: 12 }}>
                    <label>Email:</label><br />
                    <input
                      type="email"
                      required
                      value={removeEmail}
                      onChange={e => setRemoveEmail(e.target.value)}
                      style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                    />
                  </div>
                  <button type="submit" style={{
                    background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer"
                  }}>
                    Remove
                  </button>
                  <button type="button" onClick={() => { setShowRemoveAdmin(false); setRemoveStatus(""); }} style={{
                    marginLeft: 12, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer"
                  }}>
                    Cancel
                  </button>
                  <div style={{ marginTop: 10, color: "#c0392b", fontWeight: 500 }}>{removeStatus}</div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
      {/* View Admins Modal - moved outside isSuperAdmin check */}
      {showViewAdmins && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#fff", color: "#222", borderRadius: 12, padding: 32, minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
          }}>
            <h2 style={{ marginBottom: 18 }}>Current Admins</h2>
            {admins.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '5px solid #eee', borderTop: '5px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8, color: "#ff0080" }}>Superadmins</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 8 }}>
                  {admins.filter(a => a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
                <div style={{ fontWeight: 700, margin: "18px 0 8px 0", color: "#1e3c72" }}>Admins</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {admins.filter(a => !a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setShowViewAdmins(false)} style={{ marginTop: 18, background: "#bbb", color: "#222", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
      {/* Remove Images Modal */}
      {showRemoveImages && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18 }}>Remove Images</h3>
            {Array.isArray(removeImagesPreview) && removeImagesPreview.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                {removeImagesPreview.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={img} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6 }} />
                    <button type="button" onClick={() => handleRemoveImageInModal(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 700, cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: 18 }}>No images to remove.</div>
            )}
            <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{removeImagesStatus}</div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button type="button" onClick={handleSaveRemoveImages} style={{ background: '#e67e22', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setShowRemoveImages(false)} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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
        © {new Date().getFullYear()} VK Admin Portal. All rights reserved. | Demo Footer Info
      </footer>
    </div>
  );
}

export default function AdminDashboardProtected() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function AnnouncementsSection({ isSuperAdmin, userEmail }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [form, setForm] = useState({ text: '', images: [], announcementFor: '' });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [removedImages, setRemovedImages] = useState([]);
  const [removingImage, setRemovingImage] = useState({ announcementId: null, imageIndex: null, loading: false });

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });

  // Add this line to define selectedClasses state inside AnnouncementsSection
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [editClasses, setEditClasses] = useState(""); // <-- for editing classes
  const [editAnnouncementFor, setEditAnnouncementFor] = useState(""); // <-- for editing announcementFor

  // Fetch announcements
  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    fetch(`${BASE_API_URL}/getannouncements`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data.announcements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Handle image/pdf preview
  useEffect(() => {
    if (form.images && form.images.length > 0) {
      // Generate preview objects for all files
      const previews = Array.from(form.images).map(file => {
        if (file.type === "application/pdf") {
          return { type: "pdf", url: URL.createObjectURL(file) };
        }
        return { type: "image", url: URL.createObjectURL(file) };
      });
      setPreview(previews);
      return () => {
        previews.forEach(p => URL.revokeObjectURL(p.url));
      };
    } else {
      setPreview('');
    }
  }, [form.images]);

  // Create announcement
  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      
      // Parse and send announcementFor as array
      let announcementForArr = form.announcementFor;
      if (typeof announcementForArr === "string") {
        announcementForArr = announcementForArr.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      
      // Only send classes if ONLY Student is selected
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        // Accept comma-separated classes as well as array
        let classesArr = selectedClasses;
        if (typeof classesArr === "string") {
          classesArr = classesArr.split(",").map(cls => cls.trim()).filter(Boolean);
        }
        if (Array.isArray(classesArr)) {
          classesArr.forEach(cls => formData.append('classes[]', cls));
        }
      } else {
        // If Student is selected with others, send empty classes array (all students)
        if (announcementForArr.some(item => item.toLowerCase() === 'student')) {
          formData.append('classes[]', ''); // Empty array for all students
        }
      }
      
      if (form.images && form.images.length > 0) {
        for (let i = 0; i < form.images.length; i++) {
          formData.append('images', form.images[i]);
        }
      }
      formData.append('createdBy', userEmail);
      const res = await fetch(`${BASE_API_URL}/addannouncement`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Announcement created!');
        setForm({ text: '', images: [], announcementFor: '' });
        setSelectedClasses([]);
        setShowCreate(false);
        setAnnouncements(prev => [data.announcement, ...prev]);
      } else {
        setStatus(data.message || 'Failed to create');
      }
    } catch {
      setStatus('Failed to create');
    }
  };

  // Edit announcement
  const handleEdit = (announcement) => {
    setEditAnnouncement(announcement);
    setForm({ text: announcement.text, images: [], announcementFor: announcement.announcementFor || '' });
    setPreview(Array.isArray(announcement.images) ? [...announcement.images] : []);
    setRemovedImages([]);
    setEditClasses(Array.isArray(announcement.classes) ? announcement.classes.join(",") : ""); // <-- prefill classes
    setEditAnnouncementFor(Array.isArray(announcement.announcementFor) ? announcement.announcementFor.join(",") : ""); // <-- prefill announcementFor
    setShowEdit(true);
    setStatus('');
  };

  // Update announcement
  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      
      // Parse and send announcementFor as array
      let announcementForArr = editAnnouncementFor;
      if (typeof announcementForArr === "string") {
        announcementForArr = announcementForArr.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      
      // Only send classes if ONLY Student is selected
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        // Handle classes update
        let classesArr = editClasses;
        if (typeof classesArr === "string") {
          classesArr = classesArr.split(",").map(cls => cls.trim()).filter(Boolean);
        }
        if (Array.isArray(classesArr)) {
          classesArr.forEach(cls => formData.append('classes[]', cls));
        }
      } else {
        // If Student is selected with others, send empty classes array (all students)
        if (announcementForArr.some(item => item.toLowerCase() === 'student')) {
          formData.append('classes[]', ''); // Empty array for all students
        }
      }
      
      if (form.images && form.images.length > 0) {
        for (let i = 0; i < form.images.length; i++) {
          formData.append('images', form.images[i]);
        }
      }
      if (removedImages.length > 0) {
        removedImages.forEach(idx => formData.append('removeImages', idx));
      }
      const res = await fetch(`${BASE_API_URL}/updateannouncement/${editAnnouncement._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Announcement updated!');
        setShowEdit(false);
        setEditAnnouncement(null);
        setForm({ text: '', images: [], announcementFor: '' });
        setEditClasses("");
        setEditAnnouncementFor("");
        // Update the announcement in the state
        setAnnouncements(prev => prev.map(a => a._id === data.announcement._id ? data.announcement : a));
      } else {
        setStatus(data.message || 'Failed to update');
      }
    } catch {
      setStatus('Failed to update');
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    setStatus('Deleting...');
    try {
      const res = await fetch(`${BASE_API_URL}/removeannouncement/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Deleted!');
        setDeleteConfirmId(null);
        // Remove the deleted announcement from the state
        setAnnouncements(prev => prev.filter(a => a._id !== data.id));
      } else {
        setStatus('Failed to delete');
      }
    } catch {
      setStatus('Failed to delete');
    }
  };

  // Form change handler
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'images' && files) {
      setForm(f => ({ ...f, images: Array.from(files) }));
      // Previews handled in useEffect
    } else if (name === 'text' || name === 'announcementFor') {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Remove image in edit (by index)
  const handleRemoveImage = (idx) => {
    setPreview(prev => Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : []);
    setRemovedImages(prev => [...prev, idx]);
  };

  // Add this function inside AnnouncementsSection:
  const handleRemoveImageClick = (announcementId, imageIndex) => {
    setRemovingImage({ announcementId, imageIndex, loading: false });
  };
  const handleConfirmRemoveImage = async (announcementId, imageIndex) => {
    setRemovingImage({ announcementId, imageIndex, loading: true });
    try {
      const res = await fetch(`${BASE_API_URL}/announcement/${announcementId}/remove-image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ imageIndex })
      });
      setRemovingImage({ announcementId: null, imageIndex: null, loading: false });
      const data = await res.json();
      if (res.ok) {
        // Update the announcement in the state with the returned announcement
        setAnnouncements(prev => prev.map(a => a._id === announcementId ? data.announcement : a));
      } else {
        alert(data.message || 'Failed to remove image');
      }
    } catch {
      setRemovingImage({ announcementId: null, imageIndex: null, loading: false });
      alert('Failed to remove image');
    }
  };
  const handleCancelRemoveImage = () => {
    setRemovingImage({ announcementId: null, imageIndex: null, loading: false });
  };

  // Mark announcement as viewed
  const markAsViewed = async (announcementId) => {
    console.log('Admin markAsViewed called for:', announcementId);
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

  return (
    <div style={{ padding: 48, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: '#1e3c72' }}>Announcements</h2>
      {isSuperAdmin && (
        <button onClick={() => { setShowCreate(true); setForm({ text: '', images: [], announcementFor: '' }); setPreview(''); setStatus(''); }}
          style={{ marginBottom: 24, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          + Create Announcement
        </button>
      )}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {(
            isSuperAdmin
              ? announcements
              : announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'admin' || role.toLowerCase() === 'all'))
          ).length === 0 && <div>No announcements yet.</div>}
          {(
            isSuperAdmin
              ? announcements
              : announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'admin' || role.toLowerCase() === 'all'))
          ).map(a => (
            <div key={a._id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', padding: 24, position: 'relative', marginBottom: 8 }}>
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
              {isSuperAdmin && (
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(a)} style={{ background: '#f7ca18', color: '#222', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => setDeleteConfirmId(a._id)} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              )}
              <div style={{ fontSize: 17, color: '#222', marginBottom: 12, whiteSpace: 'pre-line' }}>{a.text}</div>
              {/* Show all images/pdfs in the announcement */}
              {a.images && a.images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  {a.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      {img.fileType === "pdf" ? (
                        <div
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
                          <div style={{
                            position: "absolute", bottom: 6, left: 6, background: "#fff", borderRadius: 4, padding: "2px 6px", fontSize: 13, color: "#c0392b", fontWeight: 700, boxShadow: "0 1px 4px rgba(30,60,114,0.08)"
                          }}>
                            PDF
                          </div>
                        </div>
                      ) : (
                        <img
                          src={img.url}
                          alt="Announcement"
                          style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(30,60,114,0.10)', cursor: "pointer" }}
                          onClick={() => setPreviewModal({ open: true, url: img.url, fileType: "image" })}
                        />
                      )}
                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageClick(a._id, idx)}
                            style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 700, cursor: 'pointer' }}
                            title="Remove file"
                            disabled={removingImage.loading && removingImage.announcementId === a._id && removingImage.imageIndex === idx}
                          >×</button>
                          {removingImage.announcementId === a._id && removingImage.imageIndex === idx && (
                            <div style={{ position: 'absolute', top: 30, right: 0, background: '#fff', border: '1px solid #c0392b', borderRadius: 6, padding: '8px 12px', zIndex: 10, boxShadow: '0 2px 8px rgba(192,57,43,0.10)', minWidth: 160 }}>
                              <div style={{ color: '#c0392b', fontWeight: 600, marginBottom: 8 }}>Remove this {img.fileType === "pdf" ? "PDF" : "image"}?</div>
                              <button
                                type="button"
                                onClick={() => handleConfirmRemoveImage(a._id, idx)}
                                style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}
                                disabled={removingImage.loading}
                              >{removingImage.loading ? 'Removing...' : 'Yes'}</button>
                              <button
                                type="button"
                                onClick={handleCancelRemoveImage}
                                style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                                disabled={removingImage.loading}
                              >Cancel</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>By: {a.createdBy} | {new Date(a.createdAt).toLocaleString()}</div>
              {/* Delete confirmation popup below the announcement */}
              {isSuperAdmin && deleteConfirmId === a._id && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 8,
                  background: '#fff', border: '1.5px solid #c0392b', borderRadius: 10, boxShadow: '0 4px 24px rgba(192,57,43,0.10)',
                  padding: 24, zIndex: 10, textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#c0392b', marginBottom: 12 }}>
                    Are you sure you want to delete this announcement?
                  </div>
                  <button
                    onClick={() => handleDelete(a._id)}
                    style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 8, padding: '8px 28px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  {status && <div style={{ marginTop: 10, color: status.includes('Deleted') ? '#28a745' : '#c0392b' }}>{status}</div>}
                </div>
              )}
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
              <PDFWithLoader url={previewModal.url} fullscreen={true} />
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
      {/* Create Announcement Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18 }}>Create Announcement</h3>
            <form onSubmit={handleCreate}>
              <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
              
              {/* Announcement For input */}
              <div style={{ marginBottom: 12, textAlign: "left" }}>
                <label style={{ fontWeight: 600, color: "#1e3c72" }}>Announcement For (comma separated):</label>
                <input
                  type="text"
                  name="announcementFor"
                  value={form.announcementFor}
                  onChange={handleFormChange}
                  placeholder="e.g. Student, Teacher, Parent, Admin, All"
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                  required
                />
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Enter target audience separated by commas (e.g. Student, Teacher, Parent, Admin, All)</div>
              </div>
              
              {/* Classes input - only show if ONLY Student is selected */}
              {form.announcementFor && 
               form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean).length === 1 && 
               form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean)[0] === 'student' && (
                <div style={{ marginBottom: 12, textAlign: "left" }}>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Classes (comma separated):</label>
                  <input
                    type="text"
                    value={typeof selectedClasses === "string" ? selectedClasses : selectedClasses.join(",")}
                    onChange={e => {
                      // Accept raw string, but also update as array for internal use
                      setSelectedClasses(e.target.value);
                    }}
                    placeholder="e.g. 10,11,12"
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                    required
                  />
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Enter one or more classes separated by commas (e.g. 10,11,12)</div>
                </div>
              )}
              
              <input type="file" name="images" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ marginBottom: 12 }} />
              {/* Show previews for all selected files */}
              {Array.isArray(preview) && preview.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  {preview.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      {p.type === "pdf" ? (
                        <iframe src={p.url} title={`PDF Preview ${idx + 1}`} style={{ width: 120, height: 80, border: "1px solid #e0e0e0", borderRadius: 6 }} />
                      ) : (
                        <img src={p.url} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{status}</div>
              <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Create</button>
                <button type="button" onClick={() => { setShowCreate(false); setStatus(''); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Announcement Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18 }}>Edit Announcement</h3>
            <form onSubmit={handleUpdate}>
              <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
              
              {/* Announcement For input for editing */}
              <div style={{ marginBottom: 12, textAlign: "left" }}>
                <label style={{ fontWeight: 600, color: "#1e3c72" }}>Announcement For (comma separated):</label>
                <input
                  type="text"
                  value={editAnnouncementFor}
                  onChange={e => setEditAnnouncementFor(e.target.value)}
                  placeholder="e.g. Student, Teacher, Parent, Admin, All"
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                  required
                />
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Edit, add, or remove target audience separated by commas (e.g. Student, Teacher, Parent, Admin, All)</div>
              </div>
              
              {/* Classes input for editing - only show if ONLY Student is selected */}
              {editAnnouncementFor && 
               editAnnouncementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean).length === 1 && 
               editAnnouncementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean)[0] === 'student' && (
                <div style={{ marginBottom: 12, textAlign: "left" }}>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Classes (comma separated):</label>
                  <input
                    type="text"
                    value={editClasses}
                    onChange={e => setEditClasses(e.target.value)}
                    placeholder="e.g. 10,11,12"
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                    required
                  />
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Edit, add, or remove classes separated by commas (e.g. 10,11,12)</div>
                </div>
              )}
              
              <input type="file" name="images" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ marginBottom: 12 }} />
              {/* Show all preview images/pdfs with remove buttons */}
              {Array.isArray(preview) && preview.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  {preview.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      {p.type === "pdf" ? (
                        <iframe src={p.url} title={`PDF Preview ${idx + 1}`} style={{ width: 120, height: 80, border: "1px solid #e0e0e0", borderRadius: 6 }} />
                      ) : (
                        <img src={p.url} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6 }} />
                      )}
                      <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, fontWeight: 700, cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{status}</div>
              <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="submit" style={{ background: '#f7ca18', color: '#222', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Update</button>
                <button type="button" onClick={() => { setShowEdit(false); setEditAnnouncement(null); setStatus(''); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this helper component at the bottom of the file (outside any function/component):
function PDFWithLoader({ url, fullscreen }) {
  const [loading, setLoading] = useState(true);
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
        style={{ width: "100%", height: "100%", border: "none", borderRadius: fullscreen ? 0 : 8, background: "#fff" }}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}