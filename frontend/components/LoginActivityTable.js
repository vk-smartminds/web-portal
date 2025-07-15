import React from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';

function parseUserAgent(ua) {
  if (!ua) return '-';
  // Brave detection
  if (/brave/i.test(ua)) return 'Brave';
  // Basic browser detection
  let browser = 'Unknown';
  if (/chrome|crios|crmo/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios|crmo|android/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  // Basic OS detection
  let os = '';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'Mac';
  else if (/linux/i.test(ua)) os = 'Linux';

  return os ? `${browser} on ${os}` : browser;
}

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
    <div style={{ maxWidth: 950, margin: '32px auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(30,60,114,0.10)', padding: 28 }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1e3c72', marginBottom: 18, letterSpacing: 0.5 }}>Login Activity</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#e0e7ff', color: '#1e3c72' }}>
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 700, fontSize: 16, borderTopLeftRadius: 10 }}>Login Time</th>
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 700, fontSize: 16 }}>Logout Time</th>
              {showSessionDuration && <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 700, fontSize: 16 }}>Session Duration</th>}
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 700, fontSize: 16 }}>IP</th>
              <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 700, fontSize: 16, borderTopRightRadius: 10 }}>Device</th>
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
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? '#f7fafd' : '#fff',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
                  onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#f7fafd' : '#fff')}
                >
                  <td style={{ padding: '12px 10px', borderBottom: '1.5px solid #e5e7eb' }}>{loginTime ? loginTime.toLocaleString() : '-'}</td>
                  <td style={{ padding: '12px 10px', borderBottom: '1.5px solid #e5e7eb' }}>{logoutTime ? logoutTime.toLocaleString() : '-'}</td>
                  {showSessionDuration && <td style={{ padding: '12px 10px', borderBottom: '1.5px solid #e5e7eb' }}>{duration !== null ? formatDuration(duration) : '-'}</td>}
                  <td style={{ padding: '12px 10px', borderBottom: '1.5px solid #e5e7eb' }}>{s.login && s.login.ip ? s.login.ip : '-'}</td>
                  <td style={{ padding: '12px 10px', borderBottom: '1.5px solid #e5e7eb' }}>{s.login && s.login.userAgent ? parseUserAgent(s.login.userAgent) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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