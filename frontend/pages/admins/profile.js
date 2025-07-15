import React, { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from "../../utils/apiurl.js";
import { getUserData, getToken } from "../../utils/auth.js";
import ProfileCommon from "../ProfileCommon";

function AdminProfilePage() {
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileVisibility, setProfileVisibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    async function fetchData() {
      setLoading(true);
      try {
        const [profileRes, visRes] = await Promise.all([
          fetch(`${BASE_API_URL}/profile`, { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch(`${BASE_API_URL}/profile-visibility`, { headers: { Authorization: `Bearer ${getToken()}` } })
        ]);
        const profileData = await profileRes.json();
        const visData = await visRes.json();
        setProfile(profileData.user);
        setProfileVisibility(visData.profileVisibility || {});
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
    if (form.phone && form.phone.length !== 10) {
      setStatus('Phone number must be exactly 10 digits or left empty');
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
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      photo: null
    });
    setPreview(profile?.photo || "/default-avatar.png");
    setEditMode(true);
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: '#c00', padding: 40 }}>{error}</div>;
  if (!profile) return null;
  const show = (field) => !profileVisibility || profileVisibility[field] !== false;
  return (
    <ProtectedRoute>
      <div style={{ padding: 48, maxWidth: 600, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Profile
        </h2>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32 }}>
          {!editMode ? (
            <>
              {show('photo') && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <img src={profile.photo || "/default-avatar.png"} alt="Profile" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {show('name') && <div><b>Name:</b> {profile.name}</div>}
                {show('email') && <div><b>Email:</b> {profile.email}</div>}
                {show('phone') && <div><b>Phone:</b> {profile.phone || '-'}</div>}
                {show('role') && <div><b>Role:</b> {profile.role || 'Admin'}</div>}
              </div>
              <button onClick={handleEdit} style={{ marginTop: 28, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer' }}>Edit Profile</button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <img src={preview || "/default-avatar.png"} alt="Profile" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }} />
              </div>
              <input ref={fileInputRef} type="file" name="photo" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ marginBottom: 18, background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Change Photo</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label><b>Name:</b></label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginTop: 4 }} />
                </div>
                <div>
                  <label><b>Phone:</b></label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button onClick={handleSave} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer' }}>Save</button>
                <button onClick={handleCancel} style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 17, cursor: 'pointer' }}>Cancel</button>
              </div>
              {status && <div style={{ color: status.includes('success') ? '#28a745' : '#c00', marginTop: 14 }}>{status}</div>}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default AdminProfilePage; 