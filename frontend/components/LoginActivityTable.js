import React from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';

export default function LoginActivityTable({ showSessionDuration }) {
  const [sessions, setSessions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    fetch(`${BASE_API_URL}/login-activity`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load login activity');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: '#c00' }}>{error}</div>;
  if (!sessions.length) return <div>No login activity found.</div>;

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 8 }}>
        <thead>
          <tr style={{ background: '#e0e7ff' }}>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Login Time</th>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Logout Time</th>
            {showSessionDuration && <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Session Duration</th>}
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>IP</th>
            <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Device</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, idx) => {
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
                {showSessionDuration && <td style={{ padding: 8 }}>{duration !== null ? formatDuration(duration) : '-'}</td>}
                <td style={{ padding: 8 }}>{s.login && s.login.ip ? s.login.ip : '-'}</td>
                <td style={{ padding: 8 }}>{s.login && s.login.userAgent ? s.login.userAgent : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hrs}h ${remMins}m ${secs}s`;
} 