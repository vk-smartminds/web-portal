import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

export default function ManageUsers({ userEmail, isSuperAdmin }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState("");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    // Fetch all students
    fetch(`${BASE_API_URL}/admin/all-students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ requesterEmail: userEmail })
    })
      .then(res => res.json())
      .then(data => setStudents(data.students || []))
      .catch(() => setStudents([]));
    // Fetch all teachers
    fetch(`${BASE_API_URL}/admin/all-teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ requesterEmail: userEmail })
    })
      .then(res => res.json())
      .then(data => setTeachers(data.teachers || []))
      .catch(() => setTeachers([]));
    // Fetch all guardians
    fetch(`${BASE_API_URL}/admin/all-guardians`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ requesterEmail: userEmail })
    })
      .then(res => res.json())
      .then(data => setGuardians(data.guardians || []))
      .catch(() => setGuardians([]));
    // Fetch all admins
    fetch(`${BASE_API_URL}/getadmins`)
      .then(res => res.json())
      .then(data => setAdmins(data.admins || []))
      .catch(() => setAdmins([]));
  }, [isSuperAdmin, userEmail]);

  const handleUserSearch = async (e) => {
    e.preventDefault();
    setSearchStatus("Searching...");
    setSearchedUser(null);
    setDeleteStatus("");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchEmail, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedUser(data.user);
        setSearchStatus("");
      } else {
        const data = await res.json();
        setSearchedUser(null);
        setSearchStatus(data.message || "User not found");
      }
    } catch {
      setSearchedUser(null);
      setSearchStatus("Error searching user");
    }
  };

  const handleDeleteUser = async () => {
    setDeleteStatus("Deleting...");
    try {
      const res = await fetch(`${BASE_API_URL}/admin/delete-user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchedUser.email, requesterEmail: userEmail }),
      });
      if (res.ok) {
        setDeleteStatus("User deleted successfully.");
        setSearchedUser(null);
        setSearchEmail("");
        setTimeout(() => {
          setShowDeleteModal(false);
          setDeleteStatus("");
        }, 1200);
      } else {
        const data = await res.json();
        setDeleteStatus(data.message || "Failed to delete user");
      }
    } catch {
      setDeleteStatus("Failed to delete user");
    }
  };

  if (!isSuperAdmin) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Manage Users</h3>
      {isSuperAdmin && (
        <div style={{ marginBottom: 18, color: '#1e3c72', fontWeight: 600 }}>
          <div>Total number of students = {students.length}</div>
          <div>Total number of teachers = {teachers.length}</div>
          <div>Total number of guardians = {guardians.length}</div>
          <div>Total number of admins = {admins.length}</div>
          <div style={{ marginTop: 6 }}>Total number of users = {students.length + teachers.length + guardians.length + admins.length}</div>
        </div>
      )}
      <form onSubmit={handleUserSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="email"
          placeholder="Enter user email (exact match)"
          value={searchEmail}
          onChange={e => {
            setSearchEmail(e.target.value);
            if (e.target.value === "") setSearchedUser(null);
          }}
          required
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
        />
        <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
      </form>
      {searchStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{searchStatus}</div>}
      {searchedUser && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
          <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Admin Details</h4>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img
              src={searchedUser.photo || '/default-avatar.png'}
              alt="Profile"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchedUser.name && (
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                <span style={{ color: "#222", fontWeight: 500 }}>{searchedUser.name}</span>
              </div>
            )}
            {Object.entries(searchedUser).map(([key, value]) => {
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
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{ marginTop: 18, background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 600, cursor: "pointer" }}
          >
            Delete User
          </button>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", textAlign: "center" }}>
            <div style={{ marginBottom: 18, fontWeight: 600, fontSize: "1.2rem", color: "#c0392b" }}>
              Are you sure you want to delete this user?
            </div>
            <button
              onClick={handleDeleteUser}
              style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, cursor: "pointer", marginRight: 12 }}
              disabled={deleteStatus === "Deleting..."}
            >
              {deleteStatus === "Deleting..." ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteStatus(""); }}
              style={{ background: "#eee", color: "#1e3c72", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, cursor: "pointer" }}
              disabled={deleteStatus === "Deleting..."}
            >
              Cancel
            </button>
            {deleteStatus && deleteStatus !== "Deleting..." && <div style={{ marginTop: 12, color: deleteStatus.includes("success") ? "#28a745" : "#c0392b" }}>{deleteStatus}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 