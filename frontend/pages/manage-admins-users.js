import React, { useState, useEffect, useRef } from "react";
import { FaUserShield, FaUsers, FaUserMinus, FaUserPlus, FaUserGraduate, FaChalkboardTeacher, FaUserFriends } from "react-icons/fa";
import { BASE_API_URL } from "../utils/apiurl";
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

  // New state for student/teacher/guardian search
  const [searchStudent, setSearchStudent] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [studentStatus, setStudentStatus] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchedTeacher, setSearchedTeacher] = useState(null);
  const [teacherStatus, setTeacherStatus] = useState("");
  const [searchGuardian, setSearchGuardian] = useState("");
  const [searchedGuardian, setSearchedGuardian] = useState(null);
  const [guardianStatus, setGuardianStatus] = useState("");

  // Add state for sub-option (all/search) for each user type
  const [studentViewMode, setStudentViewMode] = useState(null); // 'all' or 'search'
  const [teacherViewMode, setTeacherViewMode] = useState(null);
  const [guardianViewMode, setGuardianViewMode] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allGuardians, setAllGuardians] = useState([]);
  const [allStatus, setAllStatus] = useState("");

  // Add state for admin view mode
  const [adminViewMode, setAdminViewMode] = useState(null); // 'all' or 'search'
  const [searchAdminEmail, setSearchAdminEmail] = useState("");
  const [searchedAdmin, setSearchedAdmin] = useState(null);
  const [adminSearchStatus, setAdminSearchStatus] = useState("");

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

  // Handlers for student/teacher/guardian search
  const handleStudentSearch = async (e) => {
    e.preventDefault();
    setStudentStatus("Searching...");
    setSearchedStudent(null);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/find-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: searchStudent, requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedStudent(data.user);
        setStudentStatus("");
      } else {
        const data = await res.json();
        setSearchedStudent(null);
        setStudentStatus(data.message || "Student not found");
      }
    } catch {
      setSearchedStudent(null);
      setStudentStatus("Error searching student");
    }
  };
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

  // Add handlers to fetch all users
  const handleViewAllStudents = async () => {
    setAllStatus("Loading...");
    setAllStudents([]);
    try {
      const res = await fetch(`${BASE_API_URL}/admin/all-students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ requesterEmail: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data.students || []);
        setAllStatus("");
      } else {
        setAllStatus("Failed to fetch students");
      }
    } catch {
      setAllStatus("Failed to fetch students");
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

  // Handler for searching admin by email
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

  // UI for each box
  const boxStyle = (active) => ({
    background: active ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "#fff",
    border: active ? "2px solid #1e3c72" : "2px solid #e0e0e0",
    borderRadius: 18,
    boxShadow: active ? "0 4px 24px rgba(30,60,114,0.10)" : "0 2px 8px rgba(30,60,114,0.06)",
    padding: 28,
    cursor: "pointer",
    transition: "all 0.18s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    minWidth: 220,
    fontWeight: 600,
    fontSize: 18,
    color: active ? "#1e3c72" : "#444",
    position: "relative",
    outline: "none"
  });

  const addAdminRef = useRef();
  const removeAdminRef = useRef();
  const viewAdminsRef = useRef();
  const manageUsersRef = useRef();
  const viewStudentsRef = useRef();
  const viewTeachersRef = useRef();
  const viewGuardiansRef = useRef();

  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
       
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Manage Admins and Users
        </h2>
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 24,
  marginBottom: 40,
  marginTop: 24
}}>
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "add-admin")}
      onClick={() => { setActiveBox("add-admin"); setTimeout(() => scrollToRef(addAdminRef), 100); }}
      className="feature-card"
    >
      <FaUserPlus style={{ fontSize: 36, marginBottom: 10, color: activeBox === "add-admin" ? '#1e3c72' : '#888' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Add Admin</div>
      <div style={{ color: '#888', fontSize: 14 }}>Create a new admin or superadmin</div>
    </div>
  )}
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "remove-admin")}
      onClick={() => { setActiveBox("remove-admin"); setTimeout(() => scrollToRef(removeAdminRef), 100); }}
      className="feature-card"
    >
      <FaUserMinus style={{ fontSize: 36, marginBottom: 10, color: '#c0392b' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Remove Admin</div>
      <div style={{ color: '#888', fontSize: 14 }}>Delete an existing admin</div>
    </div>
  )}
  <div style={boxStyle(activeBox === "view-admins")}
    onClick={() => { setActiveBox("view-admins"); setTimeout(() => scrollToRef(viewAdminsRef), 100); }}
    className="feature-card"
  >
    <FaUsers style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-admins" ? '#1e3c72' : '#888' }} />
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Admins</div>
    <div style={{ color: '#888', fontSize: 14 }}>See all admins and superadmins</div>
  </div>
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "manage-users")}
      onClick={() => { setActiveBox("manage-users"); setTimeout(() => scrollToRef(manageUsersRef), 100); }}
      className="feature-card"
    >
      <FaUserShield style={{ fontSize: 36, marginBottom: 10, color: activeBox === "manage-users" ? '#1e3c72' : '#888' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Manage Users</div>
      <div style={{ color: '#888', fontSize: 14 }}>Search, view, or delete any user</div>
    </div>
  )}
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "view-students")}
      onClick={() => { setActiveBox("view-students"); setTimeout(() => scrollToRef(viewStudentsRef), 100); }}
      className="feature-card"
    >
      <FaUserGraduate style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-students" ? '#1e3c72' : '#888' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Students</div>
      <div style={{ color: '#888', fontSize: 14 }}>Browse or search all students</div>
    </div>
  )}
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "view-teachers")}
      onClick={() => { setActiveBox("view-teachers"); setTimeout(() => scrollToRef(viewTeachersRef), 100); }}
      className="feature-card"
    >
      <FaChalkboardTeacher style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-teachers" ? '#1e3c72' : '#888' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Teachers</div>
      <div style={{ color: '#888', fontSize: 14 }}>Browse or search all teachers</div>
    </div>
  )}
  {isSuperAdmin && (
    <div style={boxStyle(activeBox === "view-guardians")}
      onClick={() => { setActiveBox("view-guardians"); setTimeout(() => scrollToRef(viewGuardiansRef), 100); }}
      className="feature-card"
    >
      <FaUserFriends style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-guardians" ? '#1e3c72' : '#888' }} />
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Guardians</div>
      <div style={{ color: '#888', fontSize: 14 }}>Browse or search all guardians</div>
    </div>
  )}
</div>

        {/* Feature sections */}
        {activeBox === "add-admin" && isSuperAdmin && (
          <div ref={addAdminRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
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
          <div ref={removeAdminRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
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
          <div ref={viewAdminsRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Current Admins</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <button onClick={() => setAdminViewMode('all')} style={{ padding: "8px 18px", borderRadius: 6, background: adminViewMode === 'all' ? "#1e3c72" : "#eee", color: adminViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Admins</button>
              <button onClick={() => setAdminViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: adminViewMode === 'search' ? "#1e3c72" : "#eee", color: adminViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
            </div>
            {adminViewMode === 'all' && (
              <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
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
                        {Object.entries(admin).map(([key, value]) => {
                          if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
                      {Object.entries(searchedAdmin).map(([key, value]) => {
                        if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
        )}

        {activeBox === "manage-users" && isSuperAdmin && (
          <div ref={manageUsersRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Manage Users</h3>
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
                  {Object.entries(searchedUser).map(([key, value]) => {
                    if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
        )}

        {/* Feature sections for new views */}
        {activeBox === "view-students" && isSuperAdmin && (
          <div ref={viewStudentsRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Student</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <button onClick={() => { setStudentViewMode('all'); handleViewAllStudents(); }} style={{ padding: "8px 18px", borderRadius: 6, background: studentViewMode === 'all' ? "#1e3c72" : "#eee", color: studentViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Students</button>
              <button onClick={() => setStudentViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: studentViewMode === 'search' ? "#1e3c72" : "#eee", color: studentViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
            </div>
            {studentViewMode === 'all' && (
              <div>
                {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
                {allStudents.length > 0 ? (
                  <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                    {allStudents.map((student, idx) => (
                      <div key={student._id || idx} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                          <img
                            src={student.photo || '/default-avatar.png'}
                            alt="Profile"
                            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                          />
                        </div>
                        {Object.entries(student).map(([key, value]) => {
                          if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                            return (
                              <div key={key} style={{ marginTop: 8 }}>
                                <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                                <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                                  <thead>
                                    <tr>
                                      <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                                      <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                      <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {value.map((g, idx) => (
                                      <tr key={idx}>
                                        <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                        <td style={{ padding: 4 }}>{g.email}</td>
                                        <td style={{ padding: 4 }}>{g.role}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }
                          if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
                ) : !allStatus && <div>No students found.</div>}
              </div>
            )}
            {studentViewMode === 'search' && (
              <>
                <form onSubmit={handleStudentSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  <input type="email" placeholder="Enter student email (exact match)" value={searchStudent} onChange={e => {
                    setSearchStudent(e.target.value);
                    if (e.target.value === "") setSearchedStudent(null);
                  }} required style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }} />
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
                </form>
                {studentStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{studentStatus}</div>}
                {searchedStudent && (
                  <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 24, marginBottom: 18 }}>
                    <h4 style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: "#1e3c72" }}>Student Details</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                        <img
                          src={searchedStudent.photo || '/default-avatar.png'}
                          alt="Profile"
                          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0', background: '#f7fafd' }}
                        />
                      </div>
                      {Object.entries(searchedStudent).map(([key, value]) => {
                        if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                          return (
                            <div key={key} style={{ marginTop: 8 }}>
                              <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                              <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {value.map((g, idx) => (
                                    <tr key={idx}>
                                      <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                      <td style={{ padding: 4 }}>{g.email}</td>
                                      <td style={{ padding: 4 }}>{g.role}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
        )}
        {activeBox === "view-teachers" && isSuperAdmin && (
          <div ref={viewTeachersRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Teacher</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <button onClick={() => { setTeacherViewMode('all'); handleViewAllTeachers(); }} style={{ padding: "8px 18px", borderRadius: 6, background: teacherViewMode === 'all' ? "#1e3c72" : "#eee", color: teacherViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Teachers</button>
              <button onClick={() => setTeacherViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: teacherViewMode === 'search' ? "#1e3c72" : "#eee", color: teacherViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
            </div>
            {teacherViewMode === 'all' && (
              <div>
                {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
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
                        {Object.entries(teacher).map(([key, value]) => {
                          if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
                      {Object.entries(searchedTeacher).map(([key, value]) => {
                        if (key === "guardian" && Array.isArray(value) && value.length > 0) {
                          return (
                            <div key={key} style={{ marginTop: 8 }}>
                              <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Guardians:</span>
                              <table style={{ width: '100%', marginTop: 4, background: '#f7fafd', borderRadius: 8 }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Email</th>
                                    <th style={{ padding: 4, textAlign: 'left' }}>Role</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {value.map((g, idx) => (
                                    <tr key={idx}>
                                      <td style={{ padding: 4 }}>{g.name || "-"}</td>
                                      <td style={{ padding: 4 }}>{g.email}</td>
                                      <td style={{ padding: 4 }}>{g.role}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
        )}
        {activeBox === "view-guardians" && isSuperAdmin && (
          <div ref={viewGuardiansRef} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>View Guardian</h3>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <button onClick={() => { setGuardianViewMode('all'); handleViewAllGuardians(); }} style={{ padding: "8px 18px", borderRadius: 6, background: guardianViewMode === 'all' ? "#1e3c72" : "#eee", color: guardianViewMode === 'all' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>View All Guardians</button>
              <button onClick={() => setGuardianViewMode('search')} style={{ padding: "8px 18px", borderRadius: 6, background: guardianViewMode === 'search' ? "#1e3c72" : "#eee", color: guardianViewMode === 'search' ? "#fff" : "#1e3c72", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search by Email</button>
            </div>
            {guardianViewMode === 'all' && (
              <div>
                {allStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{allStatus}</div>}
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
                          if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
                        if (key !== "password" && key !== "__v" && key !== "_id" && key !== "photo" && key !== "guardianIds" && key !== "quizIds") {
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
        )}
      </div>
    </ProtectedRoute>
  );
}

export default ManageAdminsUsersPage; 