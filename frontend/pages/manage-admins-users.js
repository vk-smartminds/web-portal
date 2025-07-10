import React, { useState, useEffect } from "react";
import { FaUserShield, FaUsers, FaUserMinus, FaUserPlus, FaUserGraduate, FaChalkboardTeacher, FaUserFriends, FaChartBar } from "react-icons/fa";
import { BASE_API_URL } from "../utils/apiurl";
import ProtectedRoute from "../components/ProtectedRoute";
import AddAdmin from "./manageusersandadmins/AddAdmin";
import RemoveAdmin from "./manageusersandadmins/RemoveAdmin";
import ViewAdmins from "./manageusersandadmins/ViewAdmins";
import ManageUsers from "./manageusersandadmins/ManageUsers";
import ViewStudents from "./manageusersandadmins/ViewStudents";
import ViewTeachers from "./manageusersandadmins/ViewTeachers";
import ViewGuardians from "./manageusersandadmins/ViewGuardians";
import UsersLoginActivity from "./manageusersandadmins/UsersLoginActivity";
import LoginStatistics from "./manageusersandadmins/LoginStatistics";

function ManageAdminsUsersPage() {
  const [activeBox, setActiveBox] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    setUserEmail(localStorage.getItem("userEmail") || "");
    setIsSuperAdmin(localStorage.getItem("isSuperAdmin") === "true");
  }, []);

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

  const featureCards = [
    ...(isSuperAdmin ? [{
      key: "add-admin",
      icon: <FaUserPlus style={{ fontSize: 36, marginBottom: 10, color: activeBox === "add-admin" ? '#1e3c72' : '#888' }} />,
      title: "Add Admin",
      desc: "Create a new admin or superadmin",
      onClick: () => setActiveBox("add-admin")
    }] : []),
    ...(isSuperAdmin ? [{
      key: "remove-admin",
      icon: <FaUserMinus style={{ fontSize: 36, marginBottom: 10, color: '#c0392b' }} />,
      title: "Remove Admin",
      desc: "Delete an existing admin",
      onClick: () => setActiveBox("remove-admin")
    }] : []),
    {
      key: "view-admins",
      icon: <FaUsers style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-admins" ? '#1e3c72' : '#888' }} />,
      title: "View Admins",
      desc: "See all admins and superadmins",
      onClick: () => setActiveBox("view-admins")
    },
    ...(isSuperAdmin ? [{
      key: "manage-users",
      icon: <FaUserShield style={{ fontSize: 36, marginBottom: 10, color: activeBox === "manage-users" ? '#1e3c72' : '#888' }} />,
      title: "Manage Users",
      desc: "Search, view, or delete any user",
      onClick: () => setActiveBox("manage-users")
    }] : []),
    {
      key: "view-students",
      icon: <FaUserGraduate style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-students" ? '#1e3c72' : '#888' }} />,
      title: "View Students",
      desc: "Browse or search all students",
      onClick: () => setActiveBox("view-students")
    },
    {
      key: "view-teachers",
      icon: <FaChalkboardTeacher style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-teachers" ? '#1e3c72' : '#888' }} />,
      title: "View Teachers",
      desc: "Browse or search all teachers",
      onClick: () => setActiveBox("view-teachers")
    },
    {
      key: "view-guardians",
      icon: <FaUserFriends style={{ fontSize: 36, marginBottom: 10, color: activeBox === "view-guardians" ? '#1e3c72' : '#888' }} />,
      title: "View Guardians",
      desc: "Browse or search all guardians",
      onClick: () => setActiveBox("view-guardians")
    },
    ...(isSuperAdmin ? [{
      key: "users-login-activity",
      icon: <FaChartBar style={{ fontSize: 36, marginBottom: 10, color: activeBox === "users-login-activity" ? '#1e3c72' : '#888' }} />,
      title: "Users Login Activity",
      desc: "View login sessions for any user",
      onClick: () => setActiveBox("users-login-activity")
    }] : []),
    ...(isSuperAdmin ? [{
      key: "login-statistics",
      icon: <FaChartBar style={{ fontSize: 36, marginBottom: 10, color: activeBox === "login-statistics" ? '#1e3c72' : '#888' }} />,
      title: "Login Statistics",
      desc: "Aggregate and visualize login data",
      onClick: () => setActiveBox("login-statistics")
    }] : []),
  ];

  let featureSection = null;
  if (activeBox === "add-admin" && isSuperAdmin) featureSection = <AddAdmin userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "remove-admin" && isSuperAdmin) featureSection = <RemoveAdmin userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "view-admins") featureSection = <ViewAdmins userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "manage-users" && isSuperAdmin) featureSection = <ManageUsers userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "view-students") featureSection = <ViewStudents userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "view-teachers") featureSection = <ViewTeachers userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "view-guardians") featureSection = <ViewGuardians userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "users-login-activity") featureSection = <UsersLoginActivity userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;
  else if (activeBox === "login-statistics") featureSection = <LoginStatistics userEmail={userEmail} isSuperAdmin={isSuperAdmin} />;

  function InlineCommonManageUsersAdmins({ title, featureCards, activeBox, setActiveBox, children }) {
    return (
      <div style={{ padding: 48, maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          {title || "Manage Admins and Users"}
        </h2>
        {/* Feature cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 40,
          marginTop: 24
        }}>
          {featureCards.map(card => (
            <div
              key={card.key}
              style={{
                background: activeBox === card.key ? "linear-gradient(90deg,#e0e7ff 0%,#f7fafd 100%)" : "#fff",
                border: activeBox === card.key ? "2px solid #1e3c72" : "2px solid #e0e0e0",
                borderRadius: 18,
                boxShadow: activeBox === card.key ? "0 4px 24px rgba(30,60,114,0.10)" : "0 2px 8px rgba(30,60,114,0.06)",
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
                color: activeBox === card.key ? "#1e3c72" : "#444",
                position: "relative",
                outline: "none"
              }}
              onClick={card.onClick}
            >
              {card.icon}
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{card.title}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{card.desc}</div>
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <InlineCommonManageUsersAdmins
        title="Manage Admins and Users"
        featureCards={featureCards}
        activeBox={activeBox}
        setActiveBox={setActiveBox}
      >
        {featureSection}
      </InlineCommonManageUsersAdmins>
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