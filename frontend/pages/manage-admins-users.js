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

function ManageSidebar({ activeBox, setActiveBox, isSuperAdmin }) {
  const [hovered, setHovered] = React.useState(null);
  const items = [
    ...(isSuperAdmin ? [{ key: "add-admin", label: "Add Admin", icon: <FaUserPlus /> }] : []),
    ...(isSuperAdmin ? [{ key: "remove-admin", label: "Remove Admin", icon: <FaUserMinus style={{ color: '#c0392b' }} /> }] : []),
    { key: "view-admins", label: "View Admins", icon: <FaUsers /> },
    ...(isSuperAdmin ? [{ key: "manage-users", label: "Manage Users", icon: <FaUserShield /> }] : []),
    { key: "view-students", label: "View Students", icon: <FaUserGraduate /> },
    { key: "view-teachers", label: "View Teachers", icon: <FaChalkboardTeacher /> },
    { key: "view-guardians", label: "View Guardians", icon: <FaUserFriends /> },
    ...(isSuperAdmin ? [{ key: "users-login-activity", label: "Users Login Activity", icon: <FaChartBar /> }] : []),
    ...(isSuperAdmin ? [{ key: "login-statistics", label: "Login Statistics", icon: <FaChartBar /> }] : []),
  ];
  return (
    <aside style={{ width: 240, background: '#181d23', color: '#fff', minHeight: '100vh', paddingTop: 32, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}>
      <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 32, textAlign: 'center', letterSpacing: 1 }}>Manage Admins & Users</div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => {
          const isActive = activeBox === item.key;
          const isHovered = hovered === item.key;
          return (
            <li
              key={item.key}
              onClick={() => setActiveBox(item.key)}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '14px 28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 8,
                marginBottom: 6,
                background: isActive || isHovered ? '#2563eb' : 'none',
                color: isActive || isHovered ? '#fff' : '#cfd8dc',
                fontWeight: isActive ? 700 : 500,
                transition: 'background 0.2s, color 0.2s',
                fontSize: 16
              }}
            >
              <span style={{ marginRight: 16, fontSize: 18, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

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

  const isCentered = activeBox === 'add-admin' || activeBox === 'remove-admin';

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <ManageSidebar activeBox={activeBox} setActiveBox={setActiveBox} isSuperAdmin={isSuperAdmin} />
        <main style={{ 
          flex: 1, 
          minHeight: '100vh', 
          padding: '48px 0', 
          display: 'flex', 
          alignItems: isCentered ? 'center' : 'flex-start', 
          justifyContent: 'center' 
        }}>
          <div style={{ width: '100%', maxWidth: 900 }}>
            {featureSection || (
              <div style={{ color: '#888', fontSize: 20, textAlign: 'center', marginTop: 80 }}>
                Select a feature from the sidebar to begin.
              </div>
            )}
          </div>
        </main>
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