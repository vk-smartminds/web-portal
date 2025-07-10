import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ViewGuardians({ userEmail, isSuperAdmin }) {
  const [guardianViewMode, setGuardianViewMode] = useState(null);
  const [allGuardians, setAllGuardians] = useState([]);
  const [allStatus, setAllStatus] = useState("");
  const [searchGuardian, setSearchGuardian] = useState("");
  const [searchedGuardian, setSearchedGuardian] = useState(null);
  const [guardianStatus, setGuardianStatus] = useState("");

  const handleGuardianSearch = async (e) => {
    e.preventDefault();
    setGuardianStatus("Searching...");
    setSearchedGuardian(null);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-guardian`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchGuardian, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedGuardian(data.user);
        setGuardianStatus("");
      } else {
        const data = await res.json();
        setSearchedGuardian(null);
        setGuardianStatus(data.message || "Guardian not found");
      }
    } catch {
      setSearchedGuardian(null);
      setGuardianStatus("Error searching guardian");
    }
  };

  const handleViewAllGuardians = async () => {
    setAllStatus("Loading...");
    setAllGuardians([]);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/all-guardians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllGuardians(data.guardians || []);
        setAllStatus("");
      } else {
        setAllStatus("Failed to fetch guardians");
      }
    } catch {
      setAllStatus("Failed to fetch guardians");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Guardian</h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button onClick={() => { setGuardianViewMode('all'); handleViewAllGuardians(); }} style={{ padding: "8px 18px", borderRadius: 6, background: guardianViewMode === 'all' ? "#1e3c72" : "#eee", color: guardianViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Guardians</button>
        <button onClick={() => setGuardianViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: guardianViewMode === 'search' ? "#1e3c72" : "#eee", color: guardianViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
      </div>
      {guardianViewMode === 'all' && (
        <div>
          {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
          {allGuardians.length > 0 && (
            <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total number of guardians = {allGuardians.length}</div>
          )}
          {allGuardians.length > 0 ? (
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              {allGuardians.map((guardian, idx) => (
                <div key={guardian._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                      src={guardian.photo || '/default-avatar.png'}
                      alt="Profile"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                    />
                  </div>
                  {guardian.name && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{guardian.name}</span>
                    </div>
                  )}
                  {Object.entries(guardian).map(([key, value]) => {
                    if (key === "child" && Array.isArray(value) && value.length > 0) {
                      return (
                        <div key={key} style={{ marginTop: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Children:</span>
                          <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                            <thead>
                              <tr>
                                <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Class</th>
                                <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {value.map((c, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: 4 }}>{c.email}</td>
                                  <td style={{ padding: 4 }}>{c.class}</td>
                                  <td style={{ padding: 4 }}>{c.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds" && key !== "name" && key !== "profileVisibility" && key !== "notificationSettings") {
                      return (
                        <div key={key} style={{ display: "flex", gap: 10 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          ) : !allStatus && <div>No guardians found.</div>}
        </div>
      )}
      {guardianViewMode === 'search' && (
        <>
          <form onSubmit={handleGuardianSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input type="email" placeholder="Enter guardian email (exact match)" value={searchGuardian} onChange={e => {
              setSearchGuardian(e.target.value);
              if (e.target.value === "") setSearchedGuardian(null);
            }} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
          </form>
          {guardianStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{guardianStatus}</div>}
          {searchedGuardian && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Guardian Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img
                    src={searchedGuardian.photo || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                  />
                </div>
                {searchedGuardian.name && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                    <span style={{ color: "#222", fontWeight: 500 }}>{searchedGuardian.name}</span>
                  </div>
                )}
                {Object.entries(searchedGuardian).map(([key, value]) => {
                  if (key === "child" && Array.isArray(value) && value.length > 0) {
                    return (
                      <div key={key} style={{ marginTop: 8 }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Children:</span>
                        <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                              <th style={{ padding: 4, textAlign: 'left' }}>Class</th>
                              <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((c, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: 4 }}>{c.email}</td>
                                <td style={{ padding: 4 }}>{c.class}</td>
                                <td style={{ padding: 4 }}>{c.role}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds" && key !== "name" && key !== "profileVisibility" && key !== "notificationSettings") {
                    return (
                      <div key={key} style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                        <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 