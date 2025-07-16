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
import { getToken } from "../utils/auth";
import { useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    end.setDate(end.getDate() + 1);
  } else return sessions;
  return sessions.filter(s => {
    const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
    return loginTime && loginTime >= start && loginTime < end;
  });
}

function SessionPieChart() {
  const [roleTotals, setRoleTotals] = useState(null);
  const [status, setStatus] = useState("");
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('today');
  const [customYear, setCustomYear] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    async function fetchSessions() {
      setStatus("Loading...");
      try {
        const res = await fetch(`${BASE_API_URL}/admin/all-sessions`, {
          method: "GET",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) {
          setStatus("Failed to fetch session data");
          return;
        }
        const data = await res.json();
        setSessions(data.sessions || []);
        setStatus("");
      } catch {
        setStatus("Failed to fetch session data");
      }
    }
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    const filtered = filterSessionsByTimeRange(sessions, timeRange, customYear, customRange);
    const totals = { Student: 0, Teacher: 0, Guardian: 0, Admin: 0 };
    filtered.forEach(s => {
      const role = s.userRole;
      const loginTime = s.login && s.login.timestamp ? new Date(s.login.timestamp) : null;
      const logoutTime = s.logout && s.logout.timestamp ? new Date(s.logout.timestamp) : null;
      if (loginTime && logoutTime && role && totals[role] !== undefined) {
        const duration = Math.round((logoutTime - loginTime) / 1000);
        totals[role] += duration;
      }
    });
    setRoleTotals(totals);
  }, [sessions, timeRange, customYear, customRange]);

  if (status) return <div style={{ color: '#c00', margin: 16, textAlign: 'center' }}>{status}</div>;
  if (!roleTotals) return <div style={{ color: '#888', margin: 16, textAlign: 'center' }}>Loading chart...</div>;

  const total = Object.values(roleTotals).reduce((a, b) => a + b, 0);
  const colors = { Student: '#008FFB', Teacher: '#FEB019', Guardian: '#00E396', Admin: '#FF4560' };
  
  let startAngle = -90; // Start from the top
  const pieData = Object.entries(roleTotals)
    .filter(([, value]) => value > 0)
    .map(([role, value]) => {
      const angle = total > 0 ? (value / total) * 360 : 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      
      const r = 100, cx = 150, cy = 150;
      const largeArc = angle > 180 ? 1 : 0;
      const endAngle = startAngle + angle;
      
      const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
      const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
      const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
      const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
      
      const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
      const path = <path key={role} d={d} fill={colors[role]} />;
      
      const labelAngle = startAngle + angle / 2;
      const labelRadius = r * 0.65;
      const labelX = cx + labelRadius * Math.cos(Math.PI * labelAngle / 180);
      const labelY = cy + labelRadius * Math.sin(Math.PI * labelAngle / 180);
      
      const textLabel = percentage > 4 ? (
        <text
          key={`${role}-label`}
          x={labelX}
          y={labelY}
          fill="#fff"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {`${percentage.toFixed(0)}%`}
        </text>
      ) : null;
      
      startAngle = endAngle;
      return { path, textLabel, role, color: colors[role] };
  });

  const arcs = pieData.map(d => d.path);
  const labels = pieData.map(d => d.textLabel);
  
  return (
    <div style={{ width: '100%', maxWidth: 450, padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(30,60,114,0.08)', textAlign: 'center' }}>
      <div style={{
        background: '#f4f6fa',
        border: '1.5px solid #dbeafe',
        borderRadius: 12,
        padding: '18px 12px 10px 12px',
        marginBottom: 18,
        display: 'inline-block',
        minWidth: 260
      }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { key: 'today', label: 'Day' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' },
            { key: 'all', label: 'All' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setTimeRange(opt.key)}
              style={{ padding: '6px 16px', borderRadius: 6, background: timeRange === opt.key ? '#1e3c72' : '#eee', color: timeRange === opt.key ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {timeRange === 'customYear' && (
            <>
              <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Year:</span>
              <input type="number" min="2000" max="2100" value={customYear} onChange={e => setCustomYear(e.target.value)}
                placeholder="e.g. 2024" style={{ width: 90, padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
            </>
          )}
          {timeRange === 'customRange' && (
            <>
              <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Date Range:</span>
              <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
              <span style={{ margin: '0 6px' }}>to</span>
              <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
            </>
          )}
          {timeRange !== 'customYear' && (
            <button onClick={() => setTimeRange('customYear')}
              style={{ padding: '6px 16px', borderRadius: 6, background: timeRange === 'customYear' ? '#1e3c72' : '#eee', color: timeRange === 'customYear' ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Year
            </button>
          )}
          {timeRange !== 'customRange' && (
            <button onClick={() => setTimeRange('customRange')}
              style={{ padding: '6px 16px', borderRadius: 6, background: timeRange === 'customRange' ? '#1e3c72' : '#eee', color: timeRange === 'customRange' ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Date Range
            </button>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#1e3c72', marginBottom: 24 }}>Session Time Distribution</div>
      {total > 0 ? (
        <svg width={300} height={300} viewBox="0 0 300 300">
          {arcs}
          {labels}
        </svg>
      ) : (
        <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'}}>No session data to display.</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem 2rem', marginTop: 24, flexWrap: 'wrap' }}>
        {pieData.map(({ role, color }) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: color, display: 'inline-block' }}></span>
            <span>{role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserCountPieChart({ userEmail, isSuperAdmin }) {
  const [counts, setCounts] = useState({ Student: 0, Teacher: 0, Guardian: 0, Admin: 0 });
  const [status, setStatus] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (!isSuperAdmin || fetched.current) return;
    fetched.current = true;
    setStatus("Loading...");
    Promise.all([
      fetch(`${BASE_API_URL}/admin/all-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ requesterEmail: userEmail })
      }).then(res => res.json()).then(data => data.students?.length || 0).catch(() => 0),
      fetch(`${BASE_API_URL}/admin/all-teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ requesterEmail: userEmail })
      }).then(res => res.json()).then(data => data.teachers?.length || 0).catch(() => 0),
      fetch(`${BASE_API_URL}/admin/all-guardians`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ requesterEmail: userEmail })
      }).then(res => res.json()).then(data => data.guardians?.length || 0).catch(() => 0),
      fetch(`${BASE_API_URL}/getadmins`).then(res => res.json()).then(data => data.admins?.length || 0).catch(() => 0)
    ]).then(([students, teachers, guardians, admins]) => {
      setCounts({ Student: students, Teacher: teachers, Guardian: guardians, Admin: admins });
      setStatus("");
    }).catch(() => setStatus("Failed to fetch user counts"));
  }, [isSuperAdmin, userEmail]);

  const total = counts.Student + counts.Teacher + counts.Guardian + counts.Admin;
  const colors = { Student: '#008FFB', Teacher: '#FEB019', Guardian: '#00E396', Admin: '#FF4560' };
  let startAngle = -90;
  const pieData = Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([role, value]) => {
      const angle = total > 0 ? (value / total) * 360 : 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const r = 60, cx = 90, cy = 90;
      const largeArc = angle > 180 ? 1 : 0;
      const endAngle = startAngle + angle;
      const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
      const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
      const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
      const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
      const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
      const path = <path key={role} d={d} fill={colors[role]} />;
      const labelAngle = startAngle + angle / 2;
      const labelRadius = r * 0.7;
      const labelX = cx + labelRadius * Math.cos(Math.PI * labelAngle / 180);
      const labelY = cy + labelRadius * Math.sin(Math.PI * labelAngle / 180);
      const textLabel = percentage > 7 ? (
        <text
          key={`${role}-label`}
          x={labelX}
          y={labelY}
          fill="#fff"
          fontSize="15"
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {`${percentage.toFixed(0)}%`}
        </text>
      ) : null;
      startAngle = endAngle;
      return { path, textLabel, role, color: colors[role], value };
    });
  const arcs = pieData.map(d => d.path);
  const labels = pieData.map(d => d.textLabel);
  const legendOrder = ["Student", "Teacher", "Guardian", "Admin"];
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 12px rgba(30,60,114,0.10)',
      padding: 16,
      minWidth: 340,
      maxWidth: 400,
      textAlign: 'center',
      border: '1.5px solid #dbeafe',
      display: isSuperAdmin ? 'block' : 'none',
      marginBottom: 0
    }}>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#1e3c72', marginBottom: 12 }}>User Distribution</div>
      {status ? <div style={{ color: '#c00', margin: 12 }}>{status}</div> : null}
      {total > 0 ? (
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ display: 'block', margin: '0 auto' }}>
          {arcs}
          {labels}
        </svg>
      ) : (
        <div style={{height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'}}>No data</div>
      )}
      {/* Vertical legend with color dots and counts */}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', width: '100%', maxWidth: 220, marginLeft: 'auto', marginRight: 'auto' }}>
        {legendOrder.map(role => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, background: '#f7fafd', borderRadius: 8, padding: '4px 10px', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: colors[role], display: 'inline-block' }}></span>
              <span>{role}</span>
            </span>
            <span style={{ fontWeight: 700 }}>{counts[role]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenTimeBarChart({ userEmail, isSuperAdmin }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  // Time range filter state
  const [timeRange, setTimeRange] = useState('day');
  const [customYearInput, setCustomYearInput] = useState(new Date().getFullYear());
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customRangeInput, setCustomRangeInput] = useState({ start: '', end: '' });
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  function getTimeRangeParams() {
    if (timeRange === 'day') {
      return '&range=day';
    } else if (timeRange === 'week') {
      return '&range=week';
    } else if (timeRange === 'month') {
      return '&range=month';
    } else if (timeRange === 'year') {
      return '&range=year';
    } else if (timeRange === 'customYear') {
      return `&range=customYear&year=${customYear}`;
    } else if (timeRange === 'customRange') {
      return `&range=customRange&start=${customRange.start}&end=${customRange.end}`;
    }
    return '';
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (timeRange === 'customYear' && !customYear) return;
    if (timeRange === 'customRange' && (!customRange.start || !customRange.end)) return;
    setStatus("Loading...");
    let url = `${BASE_API_URL}/track-screen-time?role=all`;
    url += getTimeRangeParams();
    fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setStatus("");
      })
      .catch(() => {
        setStatus("Failed to fetch screen time data.");
      });
  }, [isSuperAdmin, userEmail, timeRange, customYear, customRange]);

  // Reset custom inputs when switching filter
  useEffect(() => {
    if (timeRange !== 'customYear') setCustomYearInput(new Date().getFullYear());
    if (timeRange !== 'customRange') setCustomRangeInput({ start: '', end: '' });
  }, [timeRange]);

  if (!isSuperAdmin) return null;
  if (status && status !== 'Loading...') return <div style={{ color: '#c00', margin: 12, textAlign: 'center' }}>{status}</div>;
  if (!data) return <div style={{ color: '#888', margin: 12, textAlign: 'center' }}>Loading...</div>;

  // Prepare graph data as percentage
  const total = Object.values(data.roleTotals).reduce((a, b) => a + b, 0);
  const chartData = {
    labels: Object.keys(data.roleTotals),
    datasets: [
      {
        label: 'Screen Time (%)',
        data: Object.values(data.roleTotals).map((v) => total > 0 ? Math.round((v / total) * 100) : 0),
        backgroundColor: [
          "#a855f7",
          "#3b82f6",
          "#22c55e",
          "#f59e42",
        ],
      },
    ],
  };
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 12px rgba(30,60,114,0.10)',
      padding: 28,
      margin: '32px auto 0 auto',
      minWidth: 320,
      maxWidth: 420,
      textAlign: 'center',
      border: '1.5px solid #dbeafe',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Filters row: time range (no unit selector) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 0 }}>
        <div style={{ background: '#f4f6fa', border: '1.5px solid #dbeafe', borderRadius: 12, padding: '18px 12px 10px 12px', marginBottom: 18, display: 'inline-block', minWidth: 260 }}>
          {/* ...time range filter code... */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {[
              { key: 'day', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'year', label: 'This Year' },
              { key: 'customYear', label: 'Year (Custom)' },
              { key: 'customRange', label: 'Date Range' },
            ].map(opt => (
              <button key={opt.key} onClick={() => setTimeRange(opt.key)}
                style={{ padding: '6px 16px', borderRadius: 6, background: timeRange === opt.key ? '#1e3c72' : '#eee', color: timeRange === opt.key ? '#fff' : '#1e3c72', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {timeRange === 'customYear' && (
              <>
                <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Year:</span>
                <input type="number" min="2000" max="2100" value={customYearInput} onChange={e => setCustomYearInput(e.target.value)}
                  placeholder="e.g. 2024" style={{ width: 90, padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                <button onClick={() => setCustomYear(customYearInput)} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Apply</button>
              </>
            )}
            {timeRange === 'customRange' && (
              <>
                <span style={{ fontWeight: 600, color: '#1e3c72', fontSize: 15 }}>Date Range:</span>
                <input type="date" value={customRangeInput.start} onChange={e => setCustomRangeInput(r => ({ ...r, start: e.target.value }))}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                <span style={{ margin: '0 6px' }}>to</span>
                <input type="date" value={customRangeInput.end} onChange={e => setCustomRangeInput(r => ({ ...r, end: e.target.value }))}
                  style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 15 }} />
                <button onClick={() => { if (customRangeInput.start && customRangeInput.end) setCustomRange(customRangeInput); }} style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Apply</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 20, color: '#1e3c72', marginBottom: 18 }}>Screen Time by Role {timeRange !== 'day' ? '(Filtered)' : ''}</div>
      <Bar
        data={chartData}
        options={{
          plugins: { legend: { display: false } },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Screen Time (%)',
                font: { size: 16, weight: 'bold' },
                color: '#1e3c72'
              },
              min: 0,
              max: 100,
              ticks: { stepSize: 10, callback: v => v + '%' }
            }
          },
          barPercentage: 0.4,
          categoryPercentage: 0.5
        }}
      />
    </div>
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
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa', position: 'relative', gap: 32 }}>
        {/* Sidebar column */}
        <div style={{ minWidth: 260, maxWidth: 300, background: '#181d23', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100vh', boxShadow: '2px 0 8px rgba(30,60,114,0.06)' }}>
          <ManageSidebar activeBox={activeBox} setActiveBox={setActiveBox} isSuperAdmin={isSuperAdmin} />
        </div>
        {/* Main content column */}
        <div style={{ flex: 1, display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 0' }}>
          {/* Left: SessionPieChart + featureSection */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 32 }}>
            <div style={{ marginLeft: 24, marginTop: 150 }}>
              <SessionPieChart />
            </div>
            <div style={{ width: '100%', maxWidth: 900 }}>
              {featureSection}
            </div>
          </div>
          {/* Right: UserCountPieChart + ScreenTimeBarChart stacked */}
          <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 32 }}>
            <div style={{ marginLeft: -200 }}>
              <UserCountPieChart userEmail={userEmail} isSuperAdmin={isSuperAdmin} />
            </div>
            <div style={{ marginLeft: -200 }}>
              <ScreenTimeBarChart userEmail={userEmail} isSuperAdmin={isSuperAdmin} />
            </div>
          </div>
        </div>
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