"use client";
import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import { BASE_API_URL } from "../../../utils/apiurl";
import { getUserData, getToken } from "../../../utils/auth";

// PDFWithLoader helper
function PDFWithLoader({ url, fullscreen }: { url: string; fullscreen: boolean }) {
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
            borderTop: "6px solid #a259ec",
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

const blinkStyle = `
@keyframes blink-badge {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.blink-badge {
  animation: blink-badge 1s steps(1, end) infinite;
}
`;

// Types
interface Announcement {
  _id: string;
  text: string;
  images: { fileType: string }[];
  createdBy: string;
  createdAt: string;
  announcementFor: string[];
  classes?: string[];
  isNew?: boolean;
}

interface PreviewItem {
  type: string;
  url: string;
}

interface User {
  email: string;
  [key: string]: any;
}

// Tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <span
        tabIndex={0}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 18, height: 18, borderRadius: '50%', background: '#a259ec22', color: '#a259ec', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: '1.5px solid #a259ec',
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="Help"
      >
        i
      </span>
      {show && (
        <div style={{
          position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)', background: '#23243a', color: '#fff', border: '1.5px solid #a259ec', borderRadius: 8, padding: '10px 14px', fontSize: 14, boxShadow: '0 2px 8px rgba(162,89,236,0.10)', zIndex: 1000, minWidth: 220, maxWidth: 320
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

export default function AdminAnnouncements() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [isSuperAdminState, setIsSuperAdminState] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState<{ text: string; images: File[]; announcementFor: string }>({ text: '', images: [], announcementFor: '' });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [removedImages, setRemovedImages] = useState<number[]>([]);
  const [removingImage, setRemovingImage] = useState<{ announcementId: string | null; imageIndex: number | null; loading: boolean }>({ announcementId: null, imageIndex: null, loading: false });
  const [previewModal, setPreviewModal] = useState<{ open: boolean; url: string; fileType: string; imgLoaded: boolean }>({ open: false, url: '', fileType: '', imgLoaded: false });
  const [selectedClasses, setSelectedClasses] = useState<string>("");
  const [editClasses, setEditClasses] = useState<string>("");
  const [editAnnouncementFor, setEditAnnouncementFor] = useState<string>("");

  // Detect user and role
  useEffect(() => {
    const email = (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || '';
    const isSuperAdminLS = (typeof window !== 'undefined' && localStorage.getItem('isSuperAdmin')) || '';
    setUser(u => ({ ...(u || {}), email }));
    const u = getUserData();
    if (u && u.role) {
      setRole(u.role.toLowerCase());
    } else {
      try {
        const token = getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role) {
            setRole(payload.role.toLowerCase());
          } else if (isSuperAdminLS === 'true' || isSuperAdminLS === 'false') {
            setRole("admin");
          }
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          if (window.location.pathname.includes("admin")) setRole("admin");
          else if (window.location.pathname.includes("teacher")) setRole("teacher");
          else if (window.location.pathname.includes("student")) setRole("student");
          else if (window.location.pathname.includes("guardian")) setRole("parent");
          else setRole("");
        }
      }
    }
    setIsSuperAdminState(isSuperAdminLS === 'true');
  }, []);

  // Fetch announcements
  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    let url = `${BASE_API_URL}/getannouncements`;
    if (role === "admin") {
      url += `?registeredAs=Admin`;
    } else if (role === "teacher") {
      url += `?registeredAs=Teacher`;
    } else if (role === "student") {
      url += `?registeredAs=Student`;
    } else if (role === "parent" || role === "guardian") {
      url += `?registeredAs=Parent`;
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
  }, [role]);

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
      setPreview([]);
    }
  }, [form.images]);

  // Create announcement (admin only)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      let announcementForArr: string[] = [];
      if (typeof form.announcementFor === "string") {
        announcementForArr = form.announcementFor.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        let classesArr: string[] = [];
        if (typeof selectedClasses === "string") {
          classesArr = selectedClasses.split(",").map(cls => cls.trim()).filter(Boolean);
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
        setSelectedClasses("");
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
  const handleEdit = (announcement: Announcement) => {
    setEditAnnouncement(announcement);
    setForm({ text: announcement.text, images: [], announcementFor: Array.isArray(announcement.announcementFor) ? announcement.announcementFor.join(",") : '' });
    // Map images to PreviewItem[]
    if (Array.isArray(announcement.images)) {
      setPreview(
        announcement.images.map((img, idx) => ({
          type: img.fileType === 'pdf' ? 'pdf' : 'image',
          url: `${BASE_API_URL}/announcement/${announcement._id}/file/${idx}`
        }))
      );
    } else {
      setPreview([]);
    }
    setRemovedImages([]);
    setEditClasses(Array.isArray(announcement.classes) ? announcement.classes.join(",") : "");
    setEditAnnouncementFor(Array.isArray(announcement.announcementFor) ? announcement.announcementFor.join(",") : "");
    setShowEdit(true);
    setStatus('');
  };

  // Update announcement (admin only)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      const formData = new FormData();
      formData.append('text', form.text);
      let announcementForArr: string[] = [];
      if (typeof editAnnouncementFor === "string") {
        announcementForArr = editAnnouncementFor.split(",").map(item => item.trim()).filter(Boolean);
      }
      if (Array.isArray(announcementForArr)) {
        announcementForArr.forEach(item => formData.append('announcementFor[]', item));
      }
      const isOnlyStudent = announcementForArr.length === 1 && announcementForArr[0].toLowerCase() === 'student';
      if (isOnlyStudent) {
        let classesArr: string[] = [];
        if (typeof editClasses === "string") {
          classesArr = editClasses.split(",").map(cls => cls.trim()).filter(Boolean);
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
        removedImages.forEach(idx => formData.append('removeImages', idx.toString()));
      }
      if (!editAnnouncement) return;
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
      visibleAnnouncements = announcements;
    }
  } else if (role === "teacher") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'teacher' || role.toLowerCase() === 'all'));
  } else if (role === "student") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'student' || role.toLowerCase() === 'all'));
  } else if (role === "parent" || role === "guardian") {
    visibleAnnouncements = announcements.filter(a => Array.isArray(a.announcementFor) && a.announcementFor.some(role => role.toLowerCase() === 'parent' || role.toLowerCase() === 'guardian' || role.toLowerCase() === 'all'));
  }

  // --- UI ---
  return (
    <div className="flex">
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-60">
        <AdminSidebar />
      </div>
      <div className="bg-[#1A1B21] p-6 w-full min-h-screen text-white space-y-6" style={{ marginLeft: '16rem' }}>
        <style>{blinkStyle}</style>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Announcements</h2>
          {isSuperAdmin && (
            <button
              onClick={() => { setShowCreate(true); setForm({ text: '', images: [], announcementFor: '' }); setPreview([]); setStatus(''); }}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Create Announcement
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {visibleAnnouncements.length === 0 && <div>No announcements yet.</div>}
            {visibleAnnouncements.map(a => (
              <div key={a._id} className="relative bg-[#23243a] rounded-xl shadow p-6 mb-2">
                {a.isNew && (
                  <div className="blink-badge absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">NEW</div>
                )}
                {isSuperAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => handleEdit(a)} className="bg-yellow-400 text-black rounded px-3 py-1 font-semibold">Edit</button>
                    <button onClick={() => setDeleteConfirmId(a._id)} className="bg-red-600 text-white rounded px-3 py-1 font-semibold">Delete</button>
                  </div>
                )}
                <div className="text-base text-white mb-3 whitespace-pre-line">{a.text}</div>
                {a.images && a.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {a.images.map((img, idx) => (
                      <div key={idx} className="relative inline-block">
                        {img.fileType === "pdf" ? (
                          <div
                            className="cursor-pointer relative inline-block"
                            onClick={() => setPreviewModal({ open: true, url: `${BASE_API_URL}/announcement/${a._id}/file/${idx}`, fileType: "pdf", imgLoaded: false })}
                          >
                            <iframe
                              src={`${BASE_API_URL}/announcement/${a._id}/file/${idx}`}
                              title={`Announcement PDF ${idx + 1}`}
                              className="w-44 h-28 border border-gray-300 rounded-lg shadow"
                            />
                            <div className="absolute bottom-2 left-2 bg-white rounded px-2 py-1 text-xs text-red-600 font-bold shadow">PDF</div>
                          </div>
                        ) : (
                          <img
                            src={`${BASE_API_URL}/announcement/${a._id}/file/${idx}`}
                            alt="Announcement"
                            className="max-w-[180px] max-h-[120px] rounded-lg shadow cursor-pointer"
                            onClick={() => setPreviewModal({ open: true, url: `${BASE_API_URL}/announcement/${a._id}/file/${idx}`, fileType: "image", imgLoaded: false })}
                          />
                        )}
                        {isSuperAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageClick(a._id, idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 font-bold flex items-center justify-center"
                              title="Remove file"
                              disabled={removingImage.loading && removingImage.announcementId === a._id && removingImage.imageIndex === idx}
                            >×</button>
                            {removingImage.announcementId === a._id && removingImage.imageIndex === idx && (
                              <div className="absolute top-8 right-0 bg-white border border-red-600 rounded-lg p-3 z-20 min-w-[160px] shadow">
                                <div className="text-red-600 font-semibold mb-2">Remove this {img.fileType === "pdf" ? "PDF" : "image"}?</div>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmRemoveImage(a._id, idx)}
                                  className="bg-red-600 text-white rounded px-3 py-1 font-semibold mr-2"
                                  disabled={removingImage.loading}
                                >{removingImage.loading ? 'Removing...' : 'Yes'}</button>
                                <button
                                  type="button"
                                  onClick={handleCancelRemoveImage}
                                  className="bg-gray-200 text-purple-800 rounded px-3 py-1 font-semibold"
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
                <div className="text-xs text-gray-400 mt-2">By: {a.createdBy} | {new Date(a.createdAt).toLocaleString()}</div>
                {isSuperAdmin && deleteConfirmId === a._id && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-red-600 rounded-xl shadow p-6 z-20 text-center">
                    <div className="font-semibold text-lg text-red-600 mb-3">Are you sure you want to delete this announcement?</div>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="bg-red-600 text-white rounded-lg px-6 py-2 font-semibold mr-3"
                    >Yes, Delete</button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="bg-gray-200 text-purple-800 rounded-lg px-6 py-2 font-semibold"
                    >Cancel</button>
                    {status && <div className={`mt-2 ${status.includes('Deleted') ? 'text-green-500' : 'text-red-600'}`}>{status}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Preview Modal for image/pdf */}
        {previewModal.open && (
          <div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 z-50 flex items-center justify-center"
            onClick={() => setPreviewModal({ open: false, url: '', fileType: '', imgLoaded: false })}
          >
            <div
              className="bg-white rounded-xl p-4 max-w-[90vw] max-h-[90vh] shadow-lg relative flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewModal({ open: false, url: '', fileType: '', imgLoaded: false })}
                className="absolute top-2 right-3 bg-red-600 text-white rounded-full w-8 h-8 text-xl font-bold flex items-center justify-center z-10"
                aria-label="Close"
              >×</button>
              {previewModal.fileType === "pdf" ? (
                <PDFWithLoader url={previewModal.url} fullscreen={true} />
              ) : (
                <div className="relative w-[80vw] h-[90vh] flex items-center justify-center">
                  {!previewModal.imgLoaded && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
                    </div>
                  )}
                  <img
                    src={previewModal.url}
                    alt="Preview"
                    className="max-w-[80vw] max-h-[80vh] rounded-lg z-20"
                    onLoad={() => setPreviewModal(prev => ({ ...prev, imgLoaded: true }))}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {/* Create Announcement Modal */}
        {isSuperAdmin && showCreate && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-[#23243a] rounded-2xl p-8 min-w-[320px] shadow-2xl text-white">
              <h3 className="mb-4 text-lg font-bold">Create Announcement</h3>
              <form onSubmit={handleCreate}>
                <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." className="w-full p-3 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mb-3" />
                <div className="mb-3 text-left">
                  <label className="font-semibold text-purple-400 flex items-center gap-1">
                    Announcement For (comma separated):
                    <InfoTooltip text={"You can choose individual roles (Student, Parent, Teacher, Admin), any combination (e.g., Student,Teacher), or 'All' to target everyone."} />
                  </label>
                  <input
                    type="text"
                    name="announcementFor"
                    value={form.announcementFor}
                    onChange={handleFormChange}
                    placeholder="e.g. Student, Teacher, Parent, Admin, All"
                    className="w-full p-2 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mt-1"
                    required
                  />
                </div>
                {form.announcementFor &&
                  form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean).length === 1 &&
                  form.announcementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean)[0] === 'student' && (
                    <div className="mb-3 text-left">
                      <label className="font-semibold text-purple-400 flex items-center gap-1">
                        Classes (comma separated):
                        <InfoTooltip text={"Enter a single class, multiple classes separated by commas, or 'all' for all classes."} />
                      </label>
                      <input
                        type="text"
                        value={selectedClasses}
                        onChange={e => { setSelectedClasses(e.target.value); }}
                        placeholder="e.g. 10,11,12"
                        className="w-full p-2 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mt-1"
                        required
                      />
                    </div>
                  )}
                <input type="file" name="images" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} className="mb-3" />
                {Array.isArray(preview) && preview.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {preview.map((p, idx) => (
                      <div key={idx} className="relative inline-block">
                        {p.type === "pdf" ? (
                          <iframe src={p.url} title={`PDF Preview ${idx + 1}`} className="w-28 h-20 border border-gray-700 rounded-lg" />
                        ) : (
                          <img src={p.url} alt="Preview" className="max-w-[120px] max-h-[80px] rounded-lg" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-purple-400 font-medium">{status}</div>
                <div className="mt-4 flex gap-3 justify-center">
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2 font-semibold">Create</button>
                  <button type="button" onClick={() => { setShowCreate(false); setStatus(''); }} className="bg-gray-500 text-white rounded-lg px-4 py-2 font-semibold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Announcement Modal */}
        {isSuperAdmin && showEdit && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-[#23243a] rounded-2xl p-8 min-w-[320px] shadow-2xl text-white">
              <h3 className="mb-4 text-lg font-bold">Edit Announcement</h3>
              <form onSubmit={handleUpdate}>
                <textarea name="text" value={form.text} onChange={handleFormChange} required rows={4} placeholder="Announcement text..." className="w-full p-3 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mb-3" />
                <div className="mb-3 text-left">
                  <label className="font-semibold text-purple-400 flex items-center gap-1">
                    Announcement For (comma separated):
                    <InfoTooltip text={"Edit, add, or remove target audience separated by commas (e.g. Student, Teacher, Parent, Admin, All)"} />
                  </label>
                  <input
                    type="text"
                    value={editAnnouncementFor}
                    onChange={e => setEditAnnouncementFor(e.target.value)}
                    placeholder="e.g. Student, Teacher, Parent, Admin, All"
                    className="w-full p-2 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mt-1"
                    required
                  />
                </div>
                {editAnnouncementFor &&
                  editAnnouncementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean).length === 1 &&
                  editAnnouncementFor.toLowerCase().split(',').map(item => item.trim()).filter(Boolean)[0] === 'student' && (
                    <div className="mb-3 text-left">
                      <label className="font-semibold text-purple-400 flex items-center gap-1">
                        Classes (comma separated):
                        <InfoTooltip text={"Edit, add, or remove classes separated by commas (e.g. 10,11,12)"} />
                      </label>
                      <input
                        type="text"
                        value={editClasses}
                        onChange={e => setEditClasses(e.target.value)}
                        placeholder="e.g. 10,11,12"
                        className="w-full p-2 rounded-lg border border-gray-700 bg-[#181926] text-white text-base mt-1"
                        required
                      />
                    </div>
                  )}
                <input type="file" name="images" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} className="mb-3" />
                {Array.isArray(preview) && preview.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {preview.map((p, idx) => (
                      <div key={idx} className="relative inline-block">
                        {p.type === "pdf" ? (
                          <iframe src={p.url} title={`PDF Preview ${idx + 1}`} className="w-28 h-20 border border-gray-700 rounded-lg" />
                        ) : (
                          <img src={p.url} alt="Preview" className="max-w-[120px] max-h-[80px] rounded-lg" />
                        )}
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 font-bold flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-purple-400 font-medium">{status}</div>
                <div className="mt-4 flex gap-3 justify-center">
                  <button type="submit" className="bg-yellow-400 text-black rounded-lg px-6 py-2 font-semibold">Update</button>
                  <button type="button" onClick={() => { setShowEdit(false); setEditAnnouncement(null); setStatus(''); }} className="bg-gray-500 text-white rounded-lg px-4 py-2 font-semibold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
