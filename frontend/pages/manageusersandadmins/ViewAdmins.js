import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ViewAdmins({ userEmail, isSuperAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [adminViewMode, setAdminViewMode] = useState(null);
  const [searchAdminEmail, setSearchAdminEmail] = useState("");
  const [searchedAdmin, setSearchedAdmin] = useState(null);
  const [adminSearchStatus, setAdminSearchStatus] = useState("");

  useEffect(() => {
    if (adminViewMode === "all") {
      fetch(`${BASE_API_URL}/getadmins`)
        .then(res => res.json())
        .then(data => setAdmins(data.admins || []))
        .catch(() => setAdmins([]));
    }
  }, [adminViewMode]);

  const handleAdminSearch = async (e) => {
    e.preventDefault();
    setAdminSearchStatus("Searching...");
    setSearchedAdmin(null);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchAdminEmail, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.isSuperAdmin !== undefined) {
          setSearchedAdmin(data.user);
          setAdminSearchStatus("");
        } else {
          setSearchedAdmin(null);
          setAdminSearchStatus("Not an admin");
        }
      } else {
        setSearchedAdmin(null);
        setAdminSearchStatus("Admin not found");
      }
    } catch {
      setSearchedAdmin(null);
      setAdminSearchStatus("Error searching admin");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Current Admins</h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button onClick={() => setAdminViewMode('all')} style={{ padding: "8px 18px", borderRadius: 6, background: adminViewMode === 'all' ? "#1e3c72" : "#eee", color: adminViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Admins</button>
        <button onClick={() => setAdminViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: adminViewMode === 'search' ? "#1e3c72" : "#eee", color: adminViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
      </div>
      {adminViewMode === 'all' && (
        <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
          {admins.length > 0 && (
            <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total number of admins = {admins.length}</div>
          )}
          {admins.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
              <div className="spinner" style={{ width: 40, height: 40, border: '5px solid #eee', borderTop: '5px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
          ) : (
            admins.map((admin, idx) => (
              <div key={admin._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8, marginBottom: 8, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(30,60,114,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img
                    src={admin.photo || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {admin.name && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{admin.name}</span>
                    </div>
                  )}
                  {Object.entries(admin).map(([key, value]) => {
                    // Exclude sensitive or backend-only fields
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
            ))
          )}
        </div>
      )}
      {adminViewMode === 'search' && (
        <>
          <form onSubmit={handleAdminSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input
              type="email"
              placeholder="Enter admin email (exact match)"
              value={searchAdminEmail}
              onChange={e => {
                setSearchAdminEmail(e.target.value);
                if (e.target.value === "") setSearchedAdmin(null);
              }}
              required
              style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
            />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
          </form>
          {adminSearchStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{adminSearchStatus}</div>}
          {searchedAdmin && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Admin Details</h4>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <img
                  src={searchedAdmin.photo || '/default-avatar.png'}
                  alt="Profile"
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {searchedAdmin.name && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                    <span style={{ color: "#222", fontWeight: 500 }}>{searchedAdmin.name}</span>
                  </div>
                )}
                {Object.entries(searchedAdmin).map(([key, value]) => {
                  // Exclude sensitive or backend-only fields
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
        </>
      )}
    </div>
  );
} 