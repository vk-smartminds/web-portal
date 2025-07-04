import React, { useState, useEffect } from "react";
import { FaUserShield, FaUsers, FaUserMinus, FaUserPlus } from "react-icons/fa";
import { BASE_API_URL } from "./apiurl";
import { getToken, getUserData, logout } from "../utils/auth";
import ProtectedRoute from "../components/ProtectedRoute";

function ManageAdminsUsersPage() {
  const [activeBox, setActiveBox] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Shared state for all features
  const [admins, setAdmins] = useState([]);
  const [addForm, setAddForm] = useState({ email: "", isSuperAdmin: false });
  const [addStatus, setAddStatus] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [removeStatus, setRemoveStatus] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchStatus, setSearchStatus] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");

  // On mount, get user info
  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
    setIsSuperAdmin(localStorage.getItem("isSuperAdmin") === "true");
  }, []);

  // Ensure isSuperAdmin is set and read correctly from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      function updateIsSuperAdmin() {
        const isSuper = localStorage.getItem("isSuperAdmin") === "true";
        setIsSuperAdmin(isSuper);
      }
      updateIsSuperAdmin();
      window.addEventListener('storage', updateIsSuperAdmin);
      return () => window.removeEventListener('storage', updateIsSuperAdmin);
    }
  }, []);

  // Debug state for localStorage value
  const [debugLocalStorage, setDebugLocalStorage] = useState("");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDebugLocalStorage(localStorage.getItem("isSuperAdmin"));
    }
  }, [isSuperAdmin]);

  // Fetch admins for View Admins
  useEffect(() => {
    if (activeBox === "view-admins") {
      fetch(`${BASE_API_URL}/getadmins`)
        .then(res => res.json())
        .then(data => setAdmins(data.admins || []))
        .catch(() => setAdmins([]));
    }
  }, [activeBox]);

  // Add Admin handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddStatus("Adding...");
    try {
      const res = await fetch(`${BASE_API_URL}/addadmins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          email: addForm.email,
          isSuperAdmin: addForm.isSuperAdmin,
          requesterEmail: userEmail,
        }),
      });
      if (res.ok) {
        setAddStatus("Admin added!");
        setAddForm({ email: "", isSuperAdmin: false });
      } else {
        const data = await res.json();
        setAddStatus(data.message || "Failed to add admin");
      }
    } catch {
      setAddStatus("Failed to add admin");
    }
  };

  // Remove Admin handler
  const handleRemoveAdmin = async (e) => {
    e.preventDefault();
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
      } else {
        const data = await res.json();
        setRemoveStatus(data.message || "Failed to remove admin");
      }
    } catch {
      setRemoveStatus("Failed to remove admin");
    }
  };

  // Manage Users: Search
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

  // Manage Users: Delete
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

  // UI for each box
  const boxStyle = (active) => ({
    flex: 1,
    minWidth: 220,
    minHeight: 120,
    margin: 16,
    background: active ? "#e0e7ff" : "#fff",
    border: `2px solid ${active ? '#1e3c72' : '#e0e0e0'}`,
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: active ? "0 4px 16px rgba(30,60,114,0.10)" : "0 2px 8px rgba(30,60,114,0.06)",
    fontWeight: 600,
    fontSize: 18,
    color: active ? "#1e3c72" : "#444",
    transition: "all 0.18s",
  });

  return (
    <ProtectedRoute>
      <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
       
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Manage Admins and Users
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
          {isSuperAdmin && (
            <div style={boxStyle(activeBox === "add-admin")}
              onClick={() => setActiveBox("add-admin")}
            >
              <FaUserPlus style={{ fontSize: 36, marginBottom: 10 }} />
              Add Admin
            </div>
          )}
          {isSuperAdmin && (
            <div style={boxStyle(activeBox === "remove-admin")}
              onClick={() => setActiveBox("remove-admin")}
            >
              <FaUserMinus style={{ fontSize: 36, marginBottom: 10, color: "#c0392b" }} />
              Remove Admin
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
          <div style={boxStyle(activeBox === "view-admins")}
            onClick={() => setActiveBox("view-admins")}
          >
            <FaUsers style={{ fontSize: 36, marginBottom: 10 }} />
            View Admins
          </div>
          {isSuperAdmin && (
            <div style={boxStyle(activeBox === "manage-users")}
              onClick={() => setActiveBox("manage-users")}
            >
              <FaUserShield style={{ fontSize: 36, marginBottom: 10 }} />
              Manage Users
            </div>
          )}
        </div>

        {/* Feature sections */}
        {activeBox === "add-admin" && isSuperAdmin && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Add Admin</h3>
            <form onSubmit={handleAddAdmin}>
              <div style={{ marginBottom: 12 }}>
                <label>Email:</label><br />
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={addForm.isSuperAdmin}
                    onChange={e => setAddForm(f => ({ ...f, isSuperAdmin: e.target.checked }))}
                  />{" "}
                  Is Superadmin
                </label>
              </div>
              <button type="submit" style={{ background: "#1e3c72", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>
                Add
              </button>
              <div style={{ marginTop: 10, color: "#1e3c72", fontWeight: 500 }}>{addStatus}</div>
            </form>
          </div>
        )}

        {activeBox === "remove-admin" && isSuperAdmin && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#c0392b" }}>Remove Admin</h3>
            <form onSubmit={handleRemoveAdmin}>
              <div style={{ marginBottom: 12 }}>
                <label>Email:</label><br />
                <input
                  type="email"
                  required
                  value={removeEmail}
                  onChange={e => setRemoveEmail(e.target.value)}
                  style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #bbb" }}
                />
              </div>
              <button type="submit" style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, cursor: "pointer" }}>
                Remove
              </button>
              <div style={{ marginTop: 10, color: "#c0392b", fontWeight: 500 }}>{removeStatus}</div>
            </form>
          </div>
        )}

        {activeBox === "view-admins" && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Current Admins</h3>
            {admins.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '5px solid #eee', borderTop: '5px solid #1e3c72', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8, color: "#ff0080" }}>Superadmins</div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 8 }}>
                  {admins.filter(a => a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
                <div style={{ fontWeight: 700, margin: "18px 0 8px 0", color: "#1e3c72" }}>Admins</div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {admins.filter(a => !a.isSuperAdmin).map(a => (
                    <li key={a._id} style={{ marginBottom: 2 }}>
                      {a.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeBox === "manage-users" && isSuperAdmin && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Manage Users</h3>
            <form onSubmit={handleUserSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <input
                type="email"
                placeholder="Enter user email (exact match)"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                required
                style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
              />
              <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
            </form>
            {searchStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{searchStatus}</div>}
            {searchedUser && (
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
                <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>User Details</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(searchedUser).map(([key, value]) => (
                    key !== "password" && key !== "__v" && key !== "_id" && (
                      <div key={key} style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                        <span style={{ color: "#222" }}>{String(value) || "-"}</span>
                      </div>
                    )
                  ))}
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
        )}
      </div>
    </ProtectedRoute>
  );
}

export default ManageAdminsUsersPage; 