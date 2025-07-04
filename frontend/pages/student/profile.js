import React, { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from '../apiurl.js';
import { getUserData, getToken } from "../../utils/auth.js";

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

function StudentProfilePage() {
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', school: '', class: '', photo: null });
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef();
  const [userPhoto, setUserPhoto] = useState('');

  const fetchProfile = useCallback(() => {
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (form.photo) {
      const url = URL.createObjectURL(form.photo);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [form.photo]);

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

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 32, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>Student Profile</h2>
        {!profile ? (
          <p>Loading profile...</p>
        ) : editMode ? (
          <div style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)",
            padding: 36,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <h2 style={{ marginBottom: 18, fontWeight: 700, fontSize: 26, color: "#1e3c72", letterSpacing: 0.5 }}>Edit Profile</h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={preview || "/default-avatar.png"}
                  alt="Profile"
                  style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: "3px solid #e0e0e0", boxShadow: "0 2px 12px rgba(30,60,114,0.08)" }}
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
                  style={{ position: "absolute", bottom: 0, right: 0, background: "#fff", border: "1px solid #ccc", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                >📷</button>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Name:</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
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
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Class:</label>
                  <input
                    name="class"
                    value={form.class}
                    readOnly
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4, background: "#f8f9fa", color: "#888" }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, color: "#1e3c72" }}>Registered As:</label>
                  <input
                    name="registeredAs"
                    value={profile?.registeredAs || ""}
                    disabled
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4, background: "#f8f9fa", color: "#666" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button
                  onClick={handleSave}
                  style={{ padding: "10px 32px", borderRadius: 8, background: "linear-gradient(90deg,#28a745 0%,#20c997 100%)", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{ padding: "10px 32px", borderRadius: 8, background: "#bbb", color: "#222", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}
                >
                  Cancel
                </button>
              </div>
              {status && <div style={{ marginTop: 10, color: "#1e3c72" }}>{status}</div>}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13)", padding: 36, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 style={{ marginBottom: 18, fontWeight: 700, fontSize: 26, color: "#1e3c72", letterSpacing: 0.5 }}>Profile Details</h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={preview || "/default-avatar.png"}
                  alt="Profile"
                  style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 8, border: "3px solid #e0e0e0", boxShadow: "0 2px 12px rgba(30,60,114,0.08)" }}
                />
              </div>
              <div style={{ width: "100%", background: "#f7fafd", borderRadius: 12, padding: "18px 20px", boxShadow: "0 2px 8px rgba(30,60,114,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
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
                style={{ marginTop: 18, padding: "10px 32px", borderRadius: 8, background: "linear-gradient(90deg,#1e3c72 0%,#2a5298 100%)", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(30,60,114,0.08)", transition: "background 0.2s" }}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default StudentProfilePage; 