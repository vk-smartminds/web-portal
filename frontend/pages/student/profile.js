import React, { useState, useEffect, useRef, useCallback } from "react";
import ProtectedRoute from '../../components/ProtectedRoute';
import { BASE_API_URL } from "../../utils/apiurl.js";
import { getUserData, getToken } from "../../utils/auth.js";
import ProfileCommon from "../ProfileCommon";

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
    setEditMode(true);
  };

  // Student-specific: read-only class field in edit mode
  const classField = editMode ? (
    <div>
      <label style={{ fontWeight: 600, color: "#1e3c72" }}>Class:</label>
      <input
        name="class"
        value={form.class}
        readOnly
        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16, marginTop: 4, background: "#f8f9fa", color: "#888" }}
      />
    </div>
  ) : null;

  // --- Show guardians table if any guardians are linked ---
  const guardiansTable = profile && Array.isArray(profile.guardian) && profile.guardian.length > 0 ? (
    <div style={{ marginTop: 24, width: '100%' }}>
      <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1e3c72', marginBottom: 8 }}>Guardians</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
        <thead>
          <tr style={{ background: '#e0e7ff' }}>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Email</th>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {profile.guardian.map((g, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
              <td style={{ padding: 8 }}>{g.name || "-"}</td>
              <td style={{ padding: 8 }}>{g.email}</td>
              <td style={{ padding: 8 }}>{g.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;

  return (
    <ProtectedRoute>
      <ProfileCommon
        userType="Student"
        profile={profile}
        editMode={editMode}
        form={form}
        setForm={setForm}
        preview={preview}
        setPreview={setPreview}
        fileInputRef={fileInputRef}
        status={status}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleChange={handleChange}
        handleSave={handleSave}
        fetchProfile={fetchProfile}
        customFields={classField}
        children={!editMode ? guardiansTable : null}
      />
    </ProtectedRoute>
  );
}

export default StudentProfilePage;