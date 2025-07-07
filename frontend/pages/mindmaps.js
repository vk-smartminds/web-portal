import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { BASE_API_URL } from "../utils/apiurl";
import { getUserData, getToken, setUserData } from "../utils/auth";
import { FaBookOpen } from "react-icons/fa";

const MindMapsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [mindMaps, setMindMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ class: '', subject: '', chapter: '', files: [] });
  const [status, setStatus] = useState('');
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', fileType: '' });
  const [filter, setFilter] = useState({ class: '', subject: '', chapter: '' });
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Detect user and role
  useEffect(() => {
    const email = (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || '';
    setUserEmail(email);
    const u = getUserData();
    setUser(u);
    if (u && u.role) {
      setRole(u.role.toLowerCase());
      if (u.role.toLowerCase() === 'student' && !u.class) {
        fetch(`${BASE_API_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.class) {
              setForm(f => ({ ...f, class: data.user.class }));
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

  // Fetch mind maps
  const fetchMindMaps = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.class) params.append('class', filter.class);
    if (filter.subject) params.append('subject', filter.subject);
    if (filter.chapter) params.append('chapter', filter.chapter);
    let url = `${BASE_API_URL}/mindmaps?${params.toString()}`;
    fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setMindMaps(data.mindMaps || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  // Fetch mind maps only after filter is clicked
  useEffect(() => {
    if (searchInitiated) {
      fetchMindMaps();
    }
  }, [fetchMindMaps, searchInitiated]);

  // After add/edit/delete, re-fetch only if searchInitiated is true
  const refetchIfSearched = () => {
    if (searchInitiated) fetchMindMaps();
  };

  // Handle form changes
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'files' && files) {
      setForm(f => ({ ...f, files: Array.from(files) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Create mind map
  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    const formData = new FormData();
    formData.append('class', form.class);
    formData.append('subject', form.subject);
    formData.append('chapter', form.chapter);
    form.files.forEach(f => formData.append('mindmap', f));
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Mind map added!");
        setForm({ class: '', subject: '', chapter: '', files: [] });
        setShowCreate(false);
        refetchIfSearched();
      } else {
        setStatus(data.message || data.error || "Failed to add");
      }
    } catch {
      setStatus("Failed to add");
    }
  };

  // Edit mind map
  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      class: item.class,
      subject: item.subject,
      chapter: item.chapter,
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
    form.files.forEach(f => formData.append("mindmap", f));
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap/${editItem._id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("Updated!");
        setShowEdit(false);
        setEditItem(null);
        refetchIfSearched();
      } else {
        setStatus(data.message || data.error || "Failed to update");
      }
    } catch {
      setStatus("Failed to update");
    }
  };

  // Delete mind map
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mind map?")) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/mindmap/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setStatus("Deleted!");
        refetchIfSearched();
      } else {
        setStatus("Failed to delete");
      }
    } catch {
      setStatus("Failed to delete");
    }
  };

  // Update Filter button handler
  const handleFilter = () => {
    setSearchInitiated(true);
    fetchMindMaps();
  };

  return (
    <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
        <FaBookOpen style={{ marginRight: 12, color: "#1e3c72", fontSize: 28, verticalAlign: "middle" }} />
        Mind Maps
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
        <button type="button" onClick={handleFilter} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
        <button type="button" onClick={() => { setFilter({ class: role === 'student' && user && user.class ? user.class : '', subject: '', chapter: '' }); setSearchInitiated(false); setMindMaps([]); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
      </div>
      {/* Only show add mind map section for non-students */}
      {role !== 'student' && (
        <>
          <button onClick={() => {
            setForm({ class: '', subject: '', chapter: '', files: [] });
            setStatus('');
          }} style={{ marginBottom: 24, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
            + Add Mind Map
          </button>
          {/* Add Mind Map Form - always visible below the button */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', maxWidth: 900 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" name="class" value={form.class} onChange={handleFormChange} placeholder="Class" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} disabled={role === 'student'} />
                <input type="text" name="subject" value={form.subject} onChange={handleFormChange} placeholder="Subject" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} placeholder="Chapter" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <input type="file" name="files" accept="image/jpeg,image/png,image/jpg,application/pdf" multiple onChange={handleFormChange} style={{ flex: 2 }} />
              </div>
              <div style={{ marginTop: 10, color: '#c0392b', fontWeight: 500 }}>{status}</div>
              <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Add</button>
            </form>
          </div>
        </>
      )}
      {(!searchInitiated) ? null : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      ) : mindMaps.length === 0 ? (
        <div style={{ color: "#888", fontSize: 17 }}>No mind maps found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {mindMaps.map(item => (
            <div key={item._id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(30,60,114,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 8, position: 'relative' }}>
              <div style={{ fontWeight: 600, color: "#1e3c72" }}>Class: {item.class} | Subject: {item.subject} | Chapter: {item.chapter}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {item.mindmap && item.mindmap.map((f, idx) => (
                  f.fileType === 'pdf'
                    ? <div key={idx} style={{ display: 'inline-block', position: 'relative', width: 120, height: 80, border: '1px solid #eee', borderRadius: 6, background: '#fafafa', textAlign: 'center', verticalAlign: 'middle', lineHeight: '80px', fontWeight: 600, color: '#1e3c72', fontSize: 18, cursor: 'pointer' }} onClick={() => setPreviewModal({ open: true, url: f.url, fileType: 'pdf' })}>
                        <span>PDF</span>
                      </div>
                    : <img key={idx} src={f.url} alt="mindmap" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: "1px solid #eee", cursor: 'pointer' }} onClick={() => setPreviewModal({ open: true, url: f.url, fileType: 'image' })} />
                ))}
              </div>
              {role !== 'student' && (
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
            <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit Mind Map</h3>
            <input type="text" name="class" value={form.class} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} disabled={role === 'student'} />
            <input type="text" name="subject" value={form.subject} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
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
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewModal({ open: false, url: '', fileType: '' })}>
          <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewModal({ open: false, url: '', fileType: '' })} style={{ position: 'fixed', top: 24, right: 32, background: '#c0392b', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 28, fontWeight: 700, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} aria-label="Close">×</button>
            {previewModal.fileType === 'pdf' ? (
              <iframe src={previewModal.url} title="PDF Preview" style={{ width: '80vw', height: '90vh', border: 'none', borderRadius: 8, background: '#fff' }} />
            ) : (
              <img src={previewModal.url} alt="Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapsPage; 