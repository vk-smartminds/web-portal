import React, { useState } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ViewTeachers({ userEmail, isSuperAdmin }) {
  const [teacherViewMode, setTeacherViewMode] = useState(null);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStatus, setAllStatus] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchedTeacher, setSearchedTeacher] = useState(null);
  const [teacherStatus, setTeacherStatus] = useState("");

  const handleTeacherSearch = async (e) => {
    e.preventDefault();
    setTeacherStatus("Searching...");
    setSearchedTeacher(null);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchTeacher, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedTeacher(data.user);
        setTeacherStatus("");
      } else {
        const data = await res.json();
        setSearchedTeacher(null);
        setTeacherStatus(data.message || "Teacher not found");
      }
    } catch {
      setSearchedTeacher(null);
      setTeacherStatus("Error searching teacher");
    }
  };

  const handleViewAllTeachers = async () => {
    setAllStatus("Loading...");
    setAllTeachers([]);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/all-teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllTeachers(data.teachers || []);
        setAllStatus("");
      } else {
        setAllStatus("Failed to fetch teachers");
      }
    } catch {
      setAllStatus("Failed to fetch teachers");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Teacher</h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button onClick={() => { setTeacherViewMode('all'); handleViewAllTeachers(); }} style={{ padding: "8px 18px", borderRadius: 6, background: teacherViewMode === 'all' ? "#1e3c72" : "#eee", color: teacherViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Teachers</button>
        <button onClick={() => setTeacherViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: teacherViewMode === 'search' ? "#1e3c72" : "#eee", color: teacherViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
      </div>
      {teacherViewMode === 'all' && (
        <div>
          {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
          {allTeachers.length > 0 && (
            <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total number of teachers = {allTeachers.length}</div>
          )}
          {allTeachers.length > 0 ? (
            <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
              {allTeachers.map((teacher, idx) => (
                <div key={teacher._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <img
                      src={teacher.photo || '/default-avatar.png'}
                      alt="Profile"
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                    />
                  </div>
                  {teacher.name && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{teacher.name}</span>
                    </div>
                  )}
                  {Object.entries(teacher).map(([key, value]) => {
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
          ) : !allStatus && <div>No teachers found.</div>}
        </div>
      )}
      {teacherViewMode === 'search' && (
        <>
          <form onSubmit={handleTeacherSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input type="email" placeholder="Enter teacher email (exact match)" value={searchTeacher} onChange={e => {
              setSearchTeacher(e.target.value);
              if (e.target.value === "") setSearchedTeacher(null);
            }} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
            <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
          </form>
          {teacherStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{teacherStatus}</div>}
          {searchedTeacher && (
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
              <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Teacher Details</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <img
                    src={searchedTeacher.photo || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                  />
                </div>
                {searchedTeacher.name && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                    <span style={{ color: "#222", fontWeight: 500 }}>{searchedTeacher.name}</span>
                  </div>
                )}
                {Object.entries(searchedTeacher).map(([key, value]) => {
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