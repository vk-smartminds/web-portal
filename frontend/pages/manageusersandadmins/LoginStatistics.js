import React, { useState, useEffect } from "react";
import { BASE_API_URL } from "../../utils/apiurl";
import { getToken } from "../../utils/auth";

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs}s`;
}

export default function LoginStatistics({ userEmail, isSuperAdmin }) {
  const [loginStats, setLoginStats] = useState(null);
  const [loginStatsStatus, setLoginStatsStatus] = useState("");
  const [loginStatsRole, setLoginStatsRole] = useState(null);
  const [loginStatsUsers, setLoginStatsUsers] = useState([]);
  const [loginStatsTimeRange, setLoginStatsTimeRange] = useState('all');
  const [customYear, setCustomYear] = useState('');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [loginStatsFiltered, setLoginStatsFiltered] = useState(null);
  const [showCombinedList, setShowCombinedList] = useState(false);
  const [combinedUsers, setCombinedUsers] = useState([]);

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

  useEffect(() => {
    if (!loginStats || !loginStats.sessions) return;
    const filteredSessions = filterSessionsByTimeRange(loginStats.sessions, loginStatsTimeRange, customYear, customRange);
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

  const handleLoginStats = async () => {
    setLoginStatsStatus("Loading...");
    setLoginStats(null);
    setLoginStatsRole(null);
    setLoginStatsUsers([]);
    try {
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

  const handleLoginStatsRoleUsers = async (role) => {
    setLoginStatsRole(role);
    setLoginStatsUsers([]);
    setLoginStatsStatus("Loading users...");
    if (!loginStatsFiltered || !loginStatsFiltered.userTotals[role]) return;
    const userTotalsArr = Object.entries(loginStatsFiltered.userTotals[role])
      .map(([userId, total]) => ({ userId, total }))
      .sort((a, b) => b.total - a.total);
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

  const handleShowCombinedList = async () => {
    setShowCombinedList(true);
    setCombinedUsers([]);
    if (!loginStatsFiltered) return;
    const allUsers = [];
    ['Student', 'Teacher', 'Guardian', 'Admin'].forEach(role => {
      if (loginStatsFiltered.userTotals[role]) {
        Object.entries(loginStatsFiltered.userTotals[role]).forEach(([userId, total]) => {
          allUsers.push({ userId, role, total });
        });
      }
    });
    allUsers.sort((a, b) => b.total - a.total);
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

  useEffect(() => {
    handleLoginStats();
  }, []);

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32, maxWidth: 900, margin: "0 auto" }}>
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
                      <span style={{ fontSize: 13 }}>{item.total} s</span>
                    </div>
                  </div>
                );
              })}
            </div>
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
  );
} 