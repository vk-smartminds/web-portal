import React from "react";

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

export default function ProfileCommon({
  userType = "User",
  profile,
  editMode,
  form,
  preview,
  fileInputRef,
  status,
  handleEdit,
  handleCancel,
  handleChange,
  handleSave,
  setForm,
  children,
  customFields
}) {
  return (
    <div style={{ padding: 32, maxWidth: 480, margin: "0 auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, color: "#1e3c72" }}>{userType} Profile</h2>
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
              {customFields}
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
              {profile.name !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Name:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.name}</span>
                </div>
              )}
              {profile.email !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Email:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.email}</span>
                </div>
              )}
              {profile.phone !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 600, color: "#1e3c72", minWidth: 80 }}>Phone:</span>
                  <span style={{ color: "#222", fontSize: 16 }}>{profile.phone || "-"}</span>
                </div>
              )}
              {children}
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
  );
} 