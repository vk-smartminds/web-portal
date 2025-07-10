import React, { useState, useEffect, useRef } from "react";
import { FaUserShield, FaUsers, FaUserMinus, FaUserPlus, FaUserGraduate, FaChalkboardTeacher, FaUserFriends, FaChartBar } from "react-icons/fa";
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

  // Add state for Users Login Activity
  const [loginActivityEmail, setLoginActivityEmail] = useState("");
  const [loginActivityStatus, setLoginActivityStatus] = useState("");
  const [loginActivitySessions, setLoginActivitySessions] = useState([]);
  const [loginActivityUser, setLoginActivityUser] = useState(null);

  // State for Login Statistics
  const [loginStats, setLoginStats] = useState(null);
  const [loginStatsStatus, setLoginStatsStatus] = useState("");
  const [loginStatsRole, setLoginStatsRole] = useState(null); // 'Student', 'Teacher', 'Guardian', 'Admin'
  const [loginStatsUsers, setLoginStatsUsers] = useState([]);

  // Add state for time range filter
  const [loginStatsTimeRange, setLoginStatsTimeRange] = useState('all'); // 'today', 'week', 'month', 'year', 'all', 'customYear', 'customRange'
  const [customYear, setCustomYear] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [loginStatsFiltered, setLoginStatsFiltered] = useState(null);

  // Add state for combined list
  const [showCombinedList, setShowCombinedList] = useState(false);
  const [combinedUsers, setCombinedUsers] = useState([]);

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

  // Handler to fetch login activity for a user
  const handleLoginActivitySearch = async (e) => {
    e.preventDefault();
    setLoginActivityStatus("Searching...");
    setLoginActivitySessions([]);
    setLoginActivityUser(null);
    try {
      // 1. Find user by email (get _id and role)
      const resUser = await fetch(`${BASE_API_URL}/admin/find-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: loginActivityEmail, requesterEmail: userEmail }),
      });
      if (!resUser.ok) {
        const data = await resUser.json();
        setLoginActivityStatus(data.message || "User not found");
        return;
      }
      const dataUser = await resUser.json();
      setLoginActivityUser(dataUser.user);
      // 2. Determine userRole robustly
      let userRole = null;
      if (dataUser.user.role) userRole = dataUser.user.role;
      else if (dataUser.user.userRole) userRole = dataUser.user.userRole;
      else userRole = 'Admin';
      // Capitalize userRole for Session model
      userRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase();
      if (userRole === 'Superadmin') userRole = 'Admin';
      // 3. Fetch login activity from backend by userId and userRole
      const resSessions = await fetch(`${BASE_API_URL}/admin/user-login-activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ userId: dataUser.user._id, userRole }),
      });
      if (!resSessions.ok) {
        const data = await resSessions.json();
        setLoginActivityStatus(data.message || "No login activity found");
        return;
      }
      const dataSessions = await resSessions.json();
      setLoginActivitySessions(dataSessions.sessions || []);
      setLoginActivityStatus("");
    } catch {
      setLoginActivityStatus("Error fetching login activity");
    }
  };

  // Helper to filter sessions by time range
  function filterSessionsByTimeRange(sessions, range, customYear, customRange) {
    if (range === 'all') return sessions;
    const now = new Date();
    let start, end;
    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (range === 'week') {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (range === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
    } else if (range === 'customYear' && customYear) {
      const y = parseInt(customYear);
      if (!isNaN(y)) {
        start = new Date(y, 0, 1);
        end = new Date(y + 1, 0, 1);
      }
    } else if (range === 'customRange' && customRange.start && customRange.end) {
      start = new Date(customRange.start);
      end = new Date(customRange.end);
      end.setDate(end.getDate() + 1); // include end date
    } else return sessions;
    return sessions.filter(s => {
      const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
      return loginTime && loginTime >= start && loginTime < end;
    });
  }

  // Recompute stats when time range or sessions change
  useEffect(() => {
    if (!loginStats || !loginStats.sessions) return;
    const filteredSessions = filterSessionsByTimeRange(loginStats.sessions, loginStatsTimeRange, customYear, customRange);
    // Aggregate totals as before
    const roleTotals = { Student: 0, Teacher: 0, Guardian: 0, Admin: 0 };
    const userTotals = { Student: {}, Teacher: {}, Guardian: {}, Admin: {} };
    filteredSessions.forEach(s => {
      const role = s.userRole;
      const userId = s.userId;
      const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
      const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
      if (loginTime && logoutTime && role && userId) {
        const duration = Math.round((logoutTime - loginTime) / 1000);
        if (roleTotals[role] !== undefined) roleTotals[role] += duration;
        if (!userTotals[role][userId]) userTotals[role][userId] = 0;
        userTotals[role][userId] += duration;
      }
    });
    const roleRank = Object.entries(roleTotals)
      .map(([role, total]) => ({ role, total }))
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
    setLoginStatsFiltered({ roleTotals, roleRank, userTotals, sessions: filteredSessions });
  }, [loginStats, loginStatsTimeRange, customYear, customRange]);

  // Update handleLoginStats to store all sessions
  const handleLoginStats = async () => {
    setLoginStatsStatus("Loading...");
    setLoginStats(null);
    setLoginStatsRole(null);
    setLoginStatsUsers([]);
    try {
      // 1. Fetch all sessions
      const res = await fetch(`${BASE_API_URL}/admin/all-sessions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        setLoginStatsStatus("Failed to fetch session data");
        return;
      }
      const data = await res.json();
      const sessions = data.sessions || [];
      setLoginStats({ sessions });
      setLoginStatsStatus("");
    } catch {
      setLoginStatsStatus("Failed to fetch session data");
    }
  };

  // Update handleLoginStatsRoleUsers to use filtered stats
  const handleLoginStatsRoleUsers = async (role) => {
    setLoginStatsRole(role);
    setLoginStatsUsers([]);
    setLoginStatsStatus("Loading users...");
    if (!loginStatsFiltered || !loginStatsFiltered.userTotals[role]) return;
    // Get userIds sorted by total session time
    const userTotalsArr = Object.entries(loginStatsFiltered.userTotals[role])
      .map(([userId, total]) => ({ userId, total }))
      .sort((a, b) => b.total - a.total);
    // Fetch user details in parallel using the new endpoint
    const userDetails = await Promise.all(userTotalsArr.map(async ({ userId, total }) => {
      let email = '', name = '';
      try {
        const res = await fetch(`${BASE_API_URL}/admin/user-basic-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ userId, userRole: role })
        });
        if (res.ok) {
          const data = await res.json();
          email = data.email || '';
          name = data.name || '';
        }
      } catch {}
      return { userId, email, name, role, total };
    }));
    setLoginStatsUsers(userDetails);
    setLoginStatsStatus("");
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

  const handleShowCombinedList = async () => {
    setShowCombinedList(true);
    setCombinedUsers([]);
    if (!loginStatsFiltered) return;
    // Combine all userTotals from all roles
    const allUsers = [];
    ['Student', 'Teacher', 'Guardian', 'Admin'].forEach(role => {
      if (loginStatsFiltered.userTotals[role]) {
        Object.entries(loginStatsFiltered.userTotals[role]).forEach(([userId, total]) => {
          allUsers.push({ userId, role, total });
        });
      }
    });
    // Sort by total session time descending
    allUsers.sort((a, b) => b.total - a.total);
    // Fetch user info in parallel
    const userDetails = await Promise.all(allUsers.map(async ({ userId, role, total }) => {
      let email = '', name = '';
      try {
        const res = await fetch(`${BASE_API_URL}/admin/user-basic-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ userId, userRole: role })
        });
        if (res.ok) {
          const data = await res.json();
          email = data.email || '';
          name = data.name || '';
        }
      } catch {}
      return { userId, email, name, role, total };
    }));
    setCombinedUsers(userDetails);
  };

  // Add this useEffect after all useState/useEffect hooks
  useEffect(() => {
    if (activeBox === "login-statistics") {
      handleLoginStats();
    }
  }, [activeBox]);

  return (
    <ProtectedRoute>
      <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
       
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Manage Admins and Users
        </h2>
        {/* Feature cards grid */}
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
          {/* Make view-students, view-teachers, view-guardians available to all admins */}
          <div style={boxStyle(activeBox === "view-students")}
            onClick={() => { setActiveBox("view-students"); setTimeout(() => scrollToRef(viewStudentsRef), 100); }}
            className="feature-card"
          >
            <FaUserGraduate style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-students" ? '#1e3c72' : '#888' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Students</div>
            <div style={{ color: '#888', fontSize: 14 }}>Browse or search all students</div>
          </div>
          <div style={boxStyle(activeBox === "view-teachers")}
            onClick={() => { setActiveBox("view-teachers"); setTimeout(() => scrollToRef(viewTeachersRef), 100); }}
            className="feature-card"
          >
            <FaChalkboardTeacher style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-teachers" ? '#1e3c72' : '#888' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Teachers</div>
            <div style={{ color: '#888', fontSize: 14 }}>Browse or search all teachers</div>
          </div>
          <div style={boxStyle(activeBox === "view-guardians")}
            onClick={() => { setActiveBox("view-guardians"); setTimeout(() => scrollToRef(viewGuardiansRef), 100); }}
            className="feature-card"
          >
            <FaUserFriends style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-guardians" ? '#1e3c72' : '#888' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>View Guardians</div>
            <div style={{ color: '#888', fontSize: 14 }}>Browse or search all guardians</div>
          </div>
          <div style={boxStyle(activeBox === "users-login-activity")}
            onClick={() => { setActiveBox("users-login-activity"); }}
            className="feature-card"
          >
            <FaChartBar style={{ fontSize: 36, marginBottom: 10, color: activeBox === "users-login-activity" ? '#1e3c72' : '#888' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Users Login Activity</div>
            <div style={{ color: '#888', fontSize: 14 }}>View login sessions for any user</div>
          </div>
          <div style={boxStyle(activeBox === "login-statistics")}
            onClick={() => { setActiveBox("login-statistics"); }}
            className="feature-card"
          >
            <FaChartBar style={{ fontSize: 36, marginBottom: 10, color: activeBox === "login-statistics" ? '#1e3c72' : '#888' }} />
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Login Statistics</div>
            <div style={{ color: '#888', fontSize: 14 }}>Aggregate and visualize login data</div>
          </div>
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
                                              {/* Display name at the top */}
                      {admin.name && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                          <span style={{ color: "#222", fontWeight: 500 }}>{admin.name}</span>
                        </div>
                      )}
                      {Object.entries(admin).map(([key, value]) => {
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
                      {/* Display name at the top */}
                      {searchedAdmin.name && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                          <span style={{ color: "#222", fontWeight: 500 }}>{searchedAdmin.name}</span>
                        </div>
                      )}
                      {Object.entries(searchedAdmin).map(([key, value]) => {
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
                      {/* Display name at the top */}
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
        )}

        {/* Feature sections for new views */}
        {activeBox === "view-students" && (
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
                        {/* Display name at the top */}
                        {student.name && (
                          <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                            <span style={{ color: "#222", fontWeight: 500 }}>{student.name}</span>
                          </div>
                        )}
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
                      {/* Display name at the top */}
                      {searchedStudent.name && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                          <span style={{ color: "#222", fontWeight: 500 }}>{searchedStudent.name}</span>
                        </div>
                      )}
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
        )}
        {activeBox === "view-teachers" && (
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
                        {/* Display name at the top */}
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
                      {/* Display name at the top */}
                      {searchedTeacher.name && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, minWidth: 120, color: "#444" }}>Name:</span>
                          <span style={{ color: "#222", fontWeight: 500 }}>{searchedTeacher.name}</span>
                        </div>
                      )}
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
        )}
        {activeBox === "view-guardians" && (
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
                        {/* Display name at the top */}
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
                      {/* Display name at the top */}
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
        )}
        {activeBox === "users-login-activity" && (
  <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 600, margin: "0 auto" }}>
    <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Users Login Activity</h3>
    <form onSubmit={handleLoginActivitySearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <input
        type="email"
        placeholder="Enter user email (exact match)"
        value={loginActivityEmail}
        onChange={e => setLoginActivityEmail(e.target.value)}
        required
        style={{ flex: 1, padding: 10, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}
      />
      <button type="submit" style={{ padding: "10px 24px", borderRadius: 6, background: "#1e3c72", color: "#fff", border: "none", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Search</button>
    </form>
    {loginActivityStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{loginActivityStatus}</div>}
    {loginActivityUser && (
      <div style={{ marginBottom: 18, background: "#f7fafd", borderRadius: 8, padding: 16 }}>
        {/* Only show name/email if name is present */}
        {loginActivityUser.name && (
          <div style={{ fontWeight: 600, color: "#1e3c72" }}>User: {loginActivityUser.name}</div>
        )}
        {/* Only show role if present */}
        {((loginActivityUser.role && loginActivityUser.role !== '') || (loginActivityUser.userRole && loginActivityUser.userRole !== '')) && (
          <div style={{ color: "#444" }}>Role: {loginActivityUser.role || loginActivityUser.userRole}</div>
        )}
        {/* Show total session time at the top */}
        {loginActivitySessions.length > 0 && (
          <div style={{ marginTop: 8, fontWeight: 600, color: '#1e3c72', fontSize: 16 }}>
            Total Session Time: {formatDuration(loginActivitySessions.reduce((sum, s) => {
              const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
              const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
              if (loginTime && logoutTime) {
                return sum + Math.round((logoutTime - loginTime) / 1000);
              }
              return sum;
            }, 0))}
          </div>
        )}
      </div>
    )}
    {loginActivitySessions.length > 0 && (
      <>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: '#e0e7ff' }}>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Login Time</th>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Logout Time</th>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Session Duration</th>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>IP</th>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Device</th>
              </tr>
            </thead>
            <tbody>
              {loginActivitySessions.map((s, idx) => {
                const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
                const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
                let duration = null;
                if (loginTime && logoutTime) {
                  duration = Math.round((logoutTime - loginTime) / 1000); // seconds
                }
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: 8 }}>{loginTime ? loginTime.toLocaleString() : '-'}</td>
                    <td style={{ padding: 8 }}>{logoutTime ? logoutTime.toLocaleString() : '-'}</td>
                    <td style={{ padding: 8 }}>{duration !== null ? formatDuration(duration) : '-'}</td>
                    <td style={{ padding: 8 }}>{s.login && s.login.ip ? s.login.ip : '-'}</td>
                    <td style={{ padding: 8 }}>{s.login && s.login.userAgent ? s.login.userAgent : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
)}
        {activeBox === "login-statistics" && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 700, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Login Statistics</h3>
            {/* Time range filter buttons and custom inputs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' },
                { key: 'all', label: 'All Time' },
                { key: 'customYear', label: 'Year:' },
                { key: 'customRange', label: 'Date Range:' }
              ].map(opt => (
                (opt.key === 'customYear' || opt.key === 'customRange') ? null : (
                  <button key={opt.key} onClick={() => setLoginStatsTimeRange(opt.key)}
                    style={{ padding: '6px 18px', borderRadius: 6, background: loginStatsTimeRange === opt.key ? '#1e3c72' : '#eee', color: loginStatsTimeRange === opt.key ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                )
              ))}
            </div>
            {/* Custom year and date range on next line */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              {loginStatsTimeRange === 'customYear' && (
                <>
                  <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Year:</span>
                  <input type="number" min="2000" max="2100" value={customYear} onChange={e => setCustomYear(e.target.value)}
                    placeholder="e.g. 2024" style={{ width: 90, padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                </>
              )}
              {loginStatsTimeRange === 'customRange' && (
                <>
                  <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Date Range:</span>
                  <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                  <span style={{ margin: '0 6px' }}>to</span>
                  <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                </>
              )}
              {loginStatsTimeRange !== 'customYear' && (
                <button onClick={() => setLoginStatsTimeRange('customYear')}
                  style={{ padding: '6px 18px', borderRadius: 6, background: loginStatsTimeRange === 'customYear' ? '#1e3c72' : '#eee', color: loginStatsTimeRange === 'customYear' ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Year
                </button>
              )}
              {loginStatsTimeRange !== 'customRange' && (
                <button onClick={() => setLoginStatsTimeRange('customRange')}
                  style={{ padding: '6px 18px', borderRadius: 6, background: loginStatsTimeRange === 'customRange' ? '#1e3c72' : '#eee', color: loginStatsTimeRange === 'customRange' ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Date Range
                </button>
              )}
            </div>
            {loginStatsStatus && <div style={{ color: "#c00", marginBottom: 16 }}>{loginStatsStatus}</div>}
            {loginStatsFiltered && (
              <>
                {/* Bar chart visualization with axes and seconds */}
                <div style={{ marginBottom: 32, position: 'relative', paddingLeft: 48 }}>
                  <div style={{ fontWeight: 600, color: '#1e3c72', marginBottom: 10 }}>Total Session Time by User Role</div>
                  {/* Y-axis (seconds) */}
                  <div style={{ position: 'absolute', left: 0, top: 40, bottom: 20, width: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                    {(() => {
                      const max = Math.max(...loginStatsFiltered.roleRank.map(r => r.total));
                      const ticks = 5;
                      return Array.from({ length: ticks + 1 }).map((_, i) => {
                        const val = Math.round((max * (ticks - i)) / ticks);
                        return <div key={i} style={{ fontSize: 12, color: '#888', height: 1 }}>{val}</div>;
                      });
                    })()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 180, padding: '0 12px', borderLeft: '2px solid #bbb', borderBottom: '2px solid #bbb', position: 'relative', zIndex: 1 }}>
                    {loginStatsFiltered.roleRank.map(item => {
                      const max = Math.max(...loginStatsFiltered.roleRank.map(r => r.total));
                      const barHeight = max > 0 ? Math.round((item.total / max) * 140) : 0;
                      return (
                        <div key={item.role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80, justifyContent: 'flex-end' }}>
                          <div style={{
                            height: barHeight,
                            width: 36,
                            background: '#1e3c72',
                            borderRadius: 8,
                            marginBottom: 8,
                            transition: 'height 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 14,
                            position: 'relative'
                          }} title={item.total + ' seconds'}>
                            {/* Show total in seconds inside the bar */}
                            <span style={{ fontSize: 13 }}>{item.total} s</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* X-axis (roles) */}
                  <div style={{ display: 'flex', gap: 24, marginLeft: 40, marginTop: 4, paddingLeft: 8 }}>
                    {loginStatsFiltered.roleRank.map(item => (
                      <div key={item.role} style={{ width: 80, textAlign: 'center', fontWeight: 600, fontSize: 15, color: '#1e3c72' }}>{item.role}</div>
                    ))}
                  </div>
                </div>
                {/* Rank cards and user lists */}
                <div style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
                  {loginStatsFiltered.roleRank.map(item => (
                    <div key={item.role} style={{ background: '#f7fafd', borderRadius: 10, padding: 18, minWidth: 140, textAlign: 'center', boxShadow: '0 2px 8px rgba(30,60,114,0.06)' }}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#1e3c72' }}>{item.role}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#444', margin: '8px 0' }}>{formatDuration(item.total)}</div>
                      <div style={{ fontSize: 15, color: '#888' }}>Rank: {item.rank}</div>
                      <button style={{ marginTop: 10, background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        onClick={() => handleLoginStatsRoleUsers(item.role)}>
                        View {item.role}s by Session Time
                      </button>
                    </div>
                  ))}
                </div>
                {loginStatsRole && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: 700, fontSize: 18, color: '#1e3c72', marginBottom: 10 }}>All {loginStatsRole}s by Total Session Time</h4>
                      <button onClick={() => setLoginStatsRole(null)} style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
                    </div>
                    {loginStatsUsers.length === 0 ? (
                      <div>Loading...</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
                        <thead>
                          <tr style={{ background: '#e0e7ff' }}>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Total Session Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginStatsUsers.map((u, idx) => (
                            <tr key={u.userId} style={{ borderBottom: '1px solid #e0e0e0' }}>
                              <td style={{ padding: 8 }}>{u.email}</td>
                              <td style={{ padding: 8 }}>{u.name || '-'}</td>
                              <td style={{ padding: 8 }}>{u.role}</td>
                              <td style={{ padding: 8 }}>{formatDuration(u.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                  <button onClick={handleShowCombinedList} style={{ padding: '10px 32px', borderRadius: 8, background: '#1e3c72', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                    Show Combined Sorted List
                  </button>
                </div>
                {showCombinedList && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontWeight: 700, fontSize: 18, color: '#1e3c72', marginBottom: 10 }}>All Users by Total Session Time</h4>
                      <button onClick={() => setShowCombinedList(false)} style={{ background: '#eee', color: '#1e3c72', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Close</button>
                    </div>
                    {combinedUsers.length === 0 ? (
                      <div>Loading...</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
                        <thead>
                          <tr style={{ background: '#e0e7ff' }}>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Name</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Role</th>
                            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Total Session Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {combinedUsers.map((u, idx) => (
                            <tr key={u.userId + u.role} style={{ borderBottom: '1px solid #e0e0e0' }}>
                              <td style={{ padding: 8 }}>{u.email}</td>
                              <td style={{ padding: 8 }}>{u.name || '-'}</td>
                              <td style={{ padding: 8 }}>{u.role}</td>
                              <td style={{ padding: 8 }}>{formatDuration(u.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs}s`;
} 