import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { BASE_API_URL } from "./apiurl";
import { getUserData, getToken } from "../utils/auth";

// PDFWithLoader helper
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

const AnnouncementPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [isSuperAdminState, setIsSuperAdminState] = useState(false);

  // Announcement state
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
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [editClasses, setEditClasses] = useState("");
  const [editAnnouncementFor, setEditAnnouncementFor] = useState("");

  // Use router.query for isSuperAdmin
  const isSuperAdminQuery = router.query && typeof router.query.isSuperAdmin !== 'undefined' ? router.query.isSuperAdmin : null;

  // Detect user and role
  useEffect(() => {
    // Always read from localStorage for consistency with admin dashboard
    const email = (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || '';
    const isSuperAdminLS = (typeof window !== 'undefined' && localStorage.getItem('isSuperAdmin')) || '';
    setUser(u => ({ ...(u || {}), email }));
    // If userData exists, use its role, else fallback to localStorage-based detection
    const u = getUserData();
    if (u && u.role) {
      setRole(u.role.toLowerCase());
    } else if (typeof window !== "undefined") {
      if (window.location.pathname.includes("admin")) setRole("admin");
      else if (window.location.pathname.includes("teacher")) setRole("teacher");
      else if (window.location.pathname.includes("student")) setRole("student");
      else if (window.location.pathname.includes("guardian")) setRole("parent");
      else setRole("");
    }
    // Set isSuperAdmin from localStorage (string comparison)
    setIsSuperAdminState(isSuperAdminLS === 'true');
  }, []);

  // Fetch announcements
  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    let url = `${BASE_API_URL}/getannouncements`;
    if (role === "admin" && !isSuperAdminState) {
      url += `?registeredAs=Admin`;
    }
    fetch(url, {
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
  }, [role, isSuperAdminState]);

  useEffect(() => {
    if (role) {
      fetchAnnouncements();
    }
  }, [fetchAnnouncements, role, isSuperAdminState]);

  // Handle image/pdf preview
  useEffect(() => {
    if (form.images && form.images.length > 0) {
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

  // Create announcement (admin only)
  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      let announcementForArr = form.announcementFor;
      if (typeof announcementForArr === "string") {
        announcementForArr = announcementForArr.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        let classesArr = selectedClasses;
        if (typeof classesArr === "string") {
          classesArr = classesArr.split(",").map(cls => cls.trim()).filter(Boolean);
        }
        if (Array.isArray(classesArr)) {
          classesArr.forEach(cls => formData.append('classes[]', cls));
        }
      } else {
        if (announcementForArr.some(item => item.toLowerCase() === 'student')) {
          formData.append('classes[]', '');
        }
      }
      if (form.images && form.images.length > 0) {
        for (let i = 0; i < form.images.length; i++) {
          formData.append('images', form.images[i]);
        }
      }
      formData.append('createdBy', user?.email || "");
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

  // Edit announcement (admin only)
  const handleEdit = (announcement) => {
    setEditAnnouncement(announcement);
    setForm({ text: announcement.text, images: [], announcementFor: announcement.announcementFor || '' });
    setPreview(Array.isArray(announcement.images) ? [...announcement.images] : []);
    setRemovedImages([]);
    setEditClasses(Array.isArray(announcement.classes) ? announcement.classes.join(",") : "");
    setEditAnnouncementFor(Array.isArray(announcement.announcementFor) ? announcement.announcementFor.join(",") : "");
    setShowEdit(true);
    setStatus('');
  };

  // Update announcement (admin only)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      let announcementForArr = editAnnouncementFor;
      if (typeof announcementForArr === "string") {
        announcementForArr = announcementForArr.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        let classesArr = editClasses;
        if (typeof classesArr === "string") {
          classesArr = classesArr.split(",").map(cls => cls.trim()).filter(Boolean);
        }
        if (Array.isArray(classesArr)) {
          classesArr.forEach(cls => formData.append('classes[]', cls));
        }
      } else {
        if (announcementForArr.some(item => item.toLowerCase() === 'student')) {
          formData.append('classes[]', '');
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
        setAnnouncements(prev => prev.map(a => a._id === data.announcement._id ? data.announcement : a));
      } else {
        setStatus(data.message || 'Failed to update');
      }
    } catch {
      setStatus('Failed to update');
    }
  };

  // Delete announcement (admin only)
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
    } else if (name === 'text' || name === 'announcementFor') {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Remove image in edit (by index)
  const handleRemoveImage = (idx) => {
    setPreview(prev => Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : []);
    setRemovedImages(prev => [...prev, idx]);
  };

  // Remove image from announcement (admin only)
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

  // Role-based filtering
  let visibleAnnouncements = announcements;
  let isSuperAdmin = isSuperAdminState;
  if (role === "admin") {
    if (!isSuperAdmin) {
      visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'admin' || role.toLowerCase() === 'all'));
    } else {
      visibleAnnouncements = announcements; // show all for superadmin
    }
  } else if (role === "teacher") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'teacher' || role.toLowerCase() === 'all'));
  } else if (role === "student") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'student' || role.toLowerCase() === 'all'));
  } else if (role === "parent" || role === "guardian") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'parent' || role.toLowerCase() === 'guardian' || role.toLowerCase() === 'all'));
  }

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
          {visibleAnnouncements.length === 0 && <div>No announcements yet.</div>}
          {visibleAnnouncements.map(a => (
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
      {isSuperAdmin && showCreate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18 }}>Create Announcement</h3>
            <form onSubmit={handleCreate}>
              <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
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
              {form.announcementFor && 
               form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean).length === 1 && 
               form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean)[0] === 'student' && (
                <div style={{ marginBottom: 12, textAlign: "left" }}>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Classes (comma separated):</label>
                  <input
                    type="text"
                    value={typeof selectedClasses === "string" ? selectedClasses : selectedClasses.join(",")}
                    onChange={e => { setSelectedClasses(e.target.value); }}
                    placeholder="e.g. 10,11,12"
                    style={{ width: "100%", padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                    required
                  />
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Enter one or more classes separated by commas (e.g. 10,11,12)</div>
                </div>
              )}
              <input type="file" name="images" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ marginBottom: 12 }} />
              {Array.isArray(preview) && preview.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  {preview.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      {p.type === "pdf" ? (
                        <iframe src={p.url} title={`PDF Preview ${idx + 1}`} style={{ width: 120, height: 80, border: "1.5px solid #e0e0e0", borderRadius: 6 }} />
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
      {isSuperAdmin && showEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 18 }}>Edit Announcement</h3>
            <form onSubmit={handleUpdate}>
              <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
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
              {Array.isArray(preview) && preview.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  {preview.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                      {p.type === "pdf" ? (
                        <iframe src={p.url} title={`PDF Preview ${idx + 1}`} style={{ width: 120, height: 80, border: "1.5px solid #e0e0e0", borderRadius: 6 }} />
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
};

export default AnnouncementPage; 