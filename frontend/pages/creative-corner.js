import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { BASE_API_URL } from "../utils/apiurl";
import { getUserData, getToken, setUserData } from "../utils/auth";
import { FaPalette } from "react-icons/fa";

const CreativeCornerPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [creativeItems, setCreativeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ class: '', subject: '', chapter: '', type: '', title: '', description: '', files: [] });
  const [status, setStatus] = useState('');
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '', name: '' });
  const [filter, setFilter] = useState({ class: '', subject: '', chapter: '', type: '' });
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Detect user and role
  useEffect(() => {
    const email = (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || '';
    setUserEmail(email);
    const u = getUserData();
    setUser(u);
    if (u && u.role) {
      setRole(u.role.toLowerCase());
      // If student and class is missing, fetch from backend
      if (u.role.toLowerCase() === 'student' && !u.class) {
        fetch(`${BASE_API_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.class) {
              setForm(f => ({ ...f, class: data.user.class }));
              // Update localStorage for future use
              setUserData({ ...u, class: data.user.class });
            }
          });
      } else if (u.role.toLowerCase() === 'student' && u.class) {
        setForm(f => ({ ...f, class: u.class }));
      }
    } else if (typeof window !== "undefined") {
      if (window.location.pathname.includes("admin")) setRole("admin");
      else if (window.location.pathname.includes("teacher")) setRole("teacher");
      else if (window.location.pathname.includes("student")) setRole("student");
      else if (window.location.pathname.includes("guardian")) setRole("parent");
      else setRole("");
    }
  }, []);

  // Prefill class for students and make it uneditable
  useEffect(() => {
    if (role === 'student' && user && user.class) {
      setForm(f => ({ ...f, class: user.class }));
    }
  }, [role, user]);

  // Prefill class for students in the filter/search bar and make it uneditable
  useEffect(() => {
    if (role === 'student' && user && user.class) {
      setFilter(f => ({ ...f, class: user.class }));
    }
  }, [role, user]);

  // If student and class is present in query, use it
  useEffect(() => {
    if (role === 'student' && router.query.class) {
      setFilter(f => ({ ...f, class: router.query.class }));
    }
  }, [role, router.query.class]);

  // Fetch creative items
  const fetchCreativeItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.class) params.append('class', filter.class);
    if (filter.subject) params.append('subject', filter.subject);
    if (filter.chapter) params.append('chapter', filter.chapter);
    if (filter.type) params.append('type', filter.type);
    let url = `${BASE_API_URL}/creative-corner?${params.toString()}`;
    fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setCreativeItems(data.creativeItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (searchInitiated) {
      fetchCreativeItems();
    }
  }, [fetchCreativeItems, searchInitiated]);

  // Handle form changes
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'files' && files) {
      setForm(f => ({ ...f, files: Array.from(files) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Create item
  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    const formData = new FormData();
    formData.append('class', form.class);
    formData.append('subject', form.subject);
    formData.append('chapter', form.chapter);
    formData.append('type', form.type);
    formData.append('title', form.title);
    formData.append('description', form.description);
    form.files.forEach(f => formData.append('files', f));
    try {
      const res = await fetch(`${BASE_API_URL}/creative-corner`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Creative item added!");
        setForm({ class: '', subject: '', chapter: '', type: '', title: '', description: '', files: [] });
        setShowCreate(false);
        fetchCreativeItems();
      } else {
        setStatus(data.message || data.error || "Failed to add");
      }
    } catch {
      setStatus("Failed to add");
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      class: item.class,
      subject: item.subject,
      chapter: item.chapter,
      type: item.type,
      title: item.title,
      description: item.description || '',
      files: []
    });
    setShowEdit(true);
    setStatus('');
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    const formData = new FormData();
    formData.append("class", form.class);
    formData.append("subject", form.subject);
    formData.append("chapter", form.chapter);
    formData.append("type", form.type);
    formData.append("title", form.title);
    formData.append("description", form.description);
    form.files.forEach(f => formData.append("files", f));
    try {
      const res = await fetch(`${BASE_API_URL}/creative-corner/${editItem._id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Updated!");
        setShowEdit(false);
        setEditItem(null);
        fetchCreativeItems();
      } else {
        setStatus(data.message || data.error || "Failed to update");
      }
    } catch {
      setStatus("Failed to update");
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this creative item?")) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/creative-corner/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setStatus("Deleted!");
        fetchCreativeItems();
      } else {
        setStatus("Failed to delete");
      }
    } catch {
      setStatus("Failed to delete");
    }
  };

  // Determine if user can edit/delete (createdBy matches userEmail)
  const canEdit = (item) => item.createdBy === userEmail;

  // Update Filter button handler
  const handleFilter = () => {
    setSearchInitiated(true);
    fetchCreativeItems();
  };

  return (
    <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#ff0080", letterSpacing: 1, textAlign: "center" }}>
        <FaPalette style={{ marginRight: 12, color: "#ff0080", fontSize: 28, verticalAlign: "middle" }} />
        Creative Corner
      </h2>
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Class"
          value={filter.class}
          onChange={e => {
            if (role !== 'student') setFilter(f => ({ ...f, class: e.target.value }));
          }}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15, background: role === 'student' ? '#f7fafd' : undefined, color: role === 'student' ? '#888' : undefined }}
          disabled={role === 'student'}
        />
        <input type="text" placeholder="Subject" value={filter.subject} onChange={e => setFilter(f => ({ ...f, subject: e.target.value }))} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
        <input type="text" placeholder="Chapter" value={filter.chapter} onChange={e => setFilter(f => ({ ...f, chapter: e.target.value }))} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }} />
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 15 }}>
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
        <button type="button" onClick={handleFilter} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: filter.type ? 'pointer' : 'not-allowed' }} disabled={!filter.type}>Filter</button>
        <button type="button" onClick={() => { setFilter({ class: role === 'student' && user && user.class ? user.class : '', subject: '', chapter: '', type: '' }); setSearchInitiated(false); setCreativeItems([]); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
      </div>
      {/* Only show add creative item section for non-students */}
      {role !== 'student' && (
        <>
          <button onClick={() => {
            setForm({ class: '', subject: '', chapter: '', type: '', title: '', description: '', files: [] });
            setStatus('');
          }} style={{ marginBottom: 24, background: '#ff0080', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
            + Add Creative Item
          </button>
          {/* Add Creative Item Form - always visible below the button */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', maxWidth: 900 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text"
                  name="class"
                  value={form.class}
                  onChange={e => {
                    if (role !== 'student') handleFormChange(e);
                  }}
                  placeholder="Class"
                  required
                  style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, background: role === 'student' ? '#f7fafd' : undefined, color: role === 'student' ? '#888' : undefined }}
                  disabled={role === 'student'}
                />
                <input type="text" name="subject" value={form.subject} onChange={handleFormChange} placeholder="Subject" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} placeholder="Chapter" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <select name="type" value={form.type} onChange={handleFormChange} required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }}>
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
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Title" required style={{ flex: 2, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <textarea name="description" value={form.description} onChange={handleFormChange} rows={1} placeholder="Description (optional)" style={{ flex: 2, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <input type="file" name="files" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ flex: 2 }} />
              </div>
              <div style={{ marginTop: 10, color: '#c0392b', fontWeight: 500 }}>{status}</div>
              <button type="submit" style={{ background: '#ff0080', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Add</button>
            </form>
          </div>
        </>
      )}
      {(!searchInitiated) ? null : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #ff0080', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
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
                    ? <div key={idx} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setPreviewModal({ open: true, url: f.url, fileType: 'pdf', name: f.originalName })}>
                      <span>PDF</span>
                    </div>
                    : <img key={idx} src={f.url} alt={f.originalName} style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setPreviewModal({ open: true, url: f.url, fileType: 'image', name: f.originalName })} />
                ))}
              </div>
              {canEdit(item) && (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={() => handleEdit(item)} style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Edit Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <form onSubmit={handleSaveEdit} style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center', maxWidth: 420 }}>
            <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit Creative Item</h3>
            <input
              type="text"
              name="class"
              value={form.class}
              onChange={e => {
                if (role !== 'student') handleFormChange(e);
              }}
              required
              style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, background: role === 'student' ? '#f7fafd' : undefined, color: role === 'student' ? '#888' : undefined }}
              disabled={role === 'student'}
            />
            <input type="text" name="subject" value={form.subject} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <select name="type" value={form.type} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }}>
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
            <input type="text" name="title" value={form.title} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginBottom: 12 }} />
            <input type="file" name="files" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ marginBottom: 12 }} />
            <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{status}</div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => { setShowEdit(false); setEditItem(null); setStatus(''); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Preview Modal for image/pdf */}
      {previewModal.open && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewModal({ open: false, url: '', fileType: '', name: '' })}>
          <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewModal({ open: false, url: '', fileType: '', name: '' })} style={{ position: 'fixed', top: 24, right: 32, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 28, fontWeight: 700, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} aria-label="Close">×</button>
            {previewModal.fileType === 'pdf' ? (
              <iframe src={previewModal.url} title={previewModal.name} style={{ width: '80vw', height: '90vh', border: 'none', borderRadius: 8, background: '#fff' }} />
            ) : (
              <img src={previewModal.url} alt={previewModal.name} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeCornerPage; 