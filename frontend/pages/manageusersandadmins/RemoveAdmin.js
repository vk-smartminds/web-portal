import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function RemoveAdmin({ userEmail, isSuperAdmin }) {
  const [removeEmail, setRemoveEmail] = useState("");
  const [removeStatus, setRemoveStatus] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  const [fetchStatus, setFetchStatus] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFetchAdmin = async (e) => {
    e.preventDefault();
    setFetchStatus("Fetching admin info...");
    setAdminInfo(null);
    setRemoveStatus("");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: removeEmail, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.isSuperAdmin !== undefined) {
          setAdminInfo(data.user);
          setFetchStatus("");
        } else {
          setAdminInfo(null);
          setFetchStatus("Not an admin");
        }
      } else {
        setAdminInfo(null);
        setFetchStatus("Admin not found");
      }
    } catch {
      setAdminInfo(null);
      setFetchStatus("Error fetching admin info");
    }
  };

  const handleRemoveAdmin = async () => {
    setRemoveStatus("Removing...");
    try {
      const res = await fetch(`${BASE_API_URL}/removeadmin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          email: removeEmail,
          requesterEmail: userEmail,
        }),
      });
      if (res.ok) {
        setRemoveStatus("Admin removed!");
        setRemoveEmail("");
        setAdminInfo(null);
        setShowConfirm(false);
      } else {
        const data = await res.json();
        setRemoveStatus(data.message || "Failed to remove admin");
      }
    } catch {
      setRemoveStatus("Failed to remove admin");
    }
  };

  if (!isSuperAdmin) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#c0392b" }}>Remove Admin</h3>
      <form onSubmit={handleFetchAdmin} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:</label><br />
          <input
            type="email"
            required
            value={removeEmail}
            onChange={e => { setRemoveEmail(e.target.value); setAdminInfo(null); setFetchStatus(""); setRemoveStatus(""); }}
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
          />
        </div>
        <button type="submit" style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>
          Fetch Admin Info
        </button>
        <div style={{ marginTop: 10, color: "#c0392b", fontWeight: 500 }}>{fetchStatus}</div>
      </form>
      {adminInfo && (
        <div style={{ background: "#f7fafd", borderRadius: 12, padding: 20, marginBottom: 18, boxShadow: "0 1px 4px rgba(30,60,114,0.06)" }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img
              src={adminInfo.photo || '/default-avatar.png'}
              alt="Profile"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adminInfo.name && (
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                <span style={{ color: "#222", fontWeight: 500 }}>{adminInfo.name}</span>
              </div>
            )}
            {Object.entries(adminInfo).map(([key, value]) => {
              if (["password", "__v", "_id", "photo", "guardianIds", "quizIds", "name", "profileVisibility", "notificationSettings"].includes(key)) {
                return null;
              }
              return (
                <div key={key} style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {adminInfo && (
        <>
          <button
            type="button"
            style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer", marginBottom: 10 }}
            onClick={() => setShowConfirm(true)}
          >
            Remove
          </button>
          {showConfirm && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #c0392b', borderRadius: 10, padding: 24, marginTop: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(192,57,43,0.08)' }}>
              <div style={{ color: '#c0392b', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
                Are you sure you want to remove this admin?
              </div>
              <button
                type="button"
                style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer", marginRight: 16 }}
                onClick={handleRemoveAdmin}
              >
                Yes, Remove
              </button>
              <button
                type="button"
                style={{ background: "#eee", color: "#c0392b", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
      <div style={{ marginTop: 10, color: "#c0392b", fontWeight: 500 }}>{removeStatus}</div>
    </div>
  );
} 