import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { BASE_API_URL } from "../utils/apiurl";
import { getUserData, getToken, setUserData } from "../utils/auth";
import { FaLaptop } from "react-icons/fa";

const AvlrsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avlrs, setAvlrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ class: '', subject: '', chapter: '', link: '' });
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState({ class: '', subject: '', chapter: '' });
  const [searchInitiated, setSearchInitiated] = useState(false);

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

  useEffect(() => {
    if (role === 'student' && user && user.class) {
      setForm(f => ({ ...f, class: user.class }));
    }
  }, [role, user]);

  useEffect(() => {
    if (role === 'student' && user && user.class) {
      setFilter(f => ({ ...f, class: user.class }));
    }
  }, [role, user]);

  useEffect(() => {
    if (role === 'student' && router.query.class) {
      setFilter(f => ({ ...f, class: router.query.class }));
    }
  }, [role, router.query.class]);

  const fetchAvlrs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.class) params.append('class', filter.class);
    if (filter.subject) params.append('subject', filter.subject);
    if (filter.chapter) params.append('chapter', filter.chapter);
    let url = `${BASE_API_URL}/avlrs?${params.toString()}`;
    fetch(url, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setAvlrs(data.avlrs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (searchInitiated) {
      fetchAvlrs();
    }
  }, [fetchAvlrs, searchInitiated]);

  const refetchIfSearched = () => {
    if (searchInitiated) fetchAvlrs();
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    try {
      const res = await fetch(`${BASE_API_URL}/avlr`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("AVLR added!");
        setForm({ class: '', subject: '', chapter: '', link: '' });
        setShowCreate(false);
        refetchIfSearched();
      } else {
        setStatus(data.message || data.error || "Failed to add");
      }
    } catch {
      setStatus("Failed to add");
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      class: item.class,
      subject: item.subject,
      chapter: item.chapter,
      link: item.link
    });
    setShowEdit(true);
    setStatus('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const res = await fetch(`${BASE_API_URL}/avlr/${editItem._id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(form)
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this AVLR?")) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/avlr/${id}`, {
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

  const handleFilter = () => {
    setSearchInitiated(true);
    fetchAvlrs();
  };

  return (
    <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
        <FaLaptop style={{ marginRight: 12, color: "#1e3c72", fontSize: 28, verticalAlign: "middle" }} />
        AVLRs
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
        <button type="button" onClick={() => { setFilter({ class: role === 'student' && user && user.class ? user.class : '', subject: '', chapter: '' }); setSearchInitiated(false); setAvlrs([]); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
      </div>
      {/* Only show add AVLR section for non-students */}
      {role !== 'student' && (
        <>
          <button onClick={() => {
            setForm({ class: '', subject: '', chapter: '', link: '' });
            setStatus('');
          }} style={{ marginBottom: 24, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
            + Add AVLR
          </button>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', maxWidth: 900 }}>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" name="class" value={form.class} onChange={handleFormChange} placeholder="Class" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} disabled={role === 'student'} />
                <input type="text" name="subject" value={form.subject} onChange={handleFormChange} placeholder="Subject" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} placeholder="Chapter" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
                <input type="text" name="link" value={form.link} onChange={handleFormChange} placeholder="YouTube/Video Link" required style={{ flex: 2, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
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
      ) : avlrs.length === 0 ? (
        <div style={{ color: "#888", fontSize: 17 }}>No AVLRs found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {avlrs.map(item => (
            <div key={item._id} style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(30,60,114,0.06)", padding: 18, display: "flex", flexDirection: "column", gap: 8, position: 'relative' }}>
              <div style={{ fontWeight: 600, color: "#1e3c72" }}>Class: {item.class} | Subject: {item.subject} | Chapter: {item.chapter}</div>
              <div style={{ color: "#222", marginBottom: 6 }}>Link: <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', fontWeight: 600 }}>{item.link}</a></div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>By: {item.createdBy} | {new Date(item.createdAt).toLocaleString()}</div>
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
            <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit AVLR</h3>
            <input type="text" name="class" value={form.class} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} disabled={role === 'student'} />
            <input type="text" name="subject" value={form.subject} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <input type="text" name="chapter" value={form.chapter} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <input type="text" name="link" value={form.link} onChange={handleFormChange} required style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} />
            <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}>{status}</div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => { setShowEdit(false); setEditItem(null); setStatus(''); }} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AvlrsPage; 