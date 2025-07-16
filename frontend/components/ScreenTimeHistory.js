import React, { useEffect, useState } from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDateTime(dt) {
  if (!dt) return '-';
  const d = new Date(dt);
  return d.toLocaleString();
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function ScreenTimeHistory({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('week');
  const [customStart, setCustomStart] = useState(getNDaysAgo(7));
  const [customEnd, setCustomEnd] = useState(getToday());
  const [year, setYear] = useState(getCurrentYear());
  const [applyClicked, setApplyClicked] = useState(false);

  useEffect(() => {
    if (filter !== 'custom') setApplyClicked(false);
    fetchHistory();
    // eslint-disable-next-line
  }, [filter, year]);

  function fetchHistory() {
    setLoading(true);
    let start, end;
    const today = getToday();
    if (filter === 'day') {
      start = today;
      end = today;
    } else if (filter === 'week') {
      start = getNDaysAgo(6);
      end = today;
    } else if (filter === 'month') {
      start = getNDaysAgo(29);
      end = today;
    } else if (filter === 'year') {
      start = `${year}-01-01`;
      end = `${year}-12-31`;
    } else if (filter === 'custom') {
      start = customStart;
      end = customEnd;
    }
    fetch(`${BASE_API_URL}/screen-time/history?start=${start}&end=${end}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load history');
        setLoading(false);
      });
  }

  function handleCustomChange() {
    setApplyClicked(true);
    fetchHistory();
  }

  function handleYearChange(e) {
    setYear(e.target.value);
  }

  return (
    <div style={{ background: '#f7fafd', borderRadius: 16, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', padding: 24, marginTop: 24, maxWidth: 700, margin: '0 auto', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
      <h4 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18, color: '#1e3c72', textAlign: 'center' }}>Past Screen Times</h4>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
        <button onClick={() => setFilter('day')} className={filter==='day'?'active-btn':''}>Day</button>
        <button onClick={() => setFilter('week')} className={filter==='week'?'active-btn':''}>Week</button>
        <button onClick={() => setFilter('month')} className={filter==='month'?'active-btn':''}>Month</button>
        <button onClick={() => setFilter('year')} className={filter==='year'?'active-btn':''}>Year</button>
        <button onClick={() => setFilter('custom')} className={filter==='custom'?'active-btn':''}>Custom</button>
      </div>
      {filter === 'year' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Year:</label>
          <input type="number" min="2000" max={getCurrentYear()} value={year} onChange={handleYearChange} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', width: 90 }} />
        </div>
      )}
      {filter === 'custom' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
          <span>to</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          <button
            onClick={handleCustomChange}
            style={{ marginLeft: 8, background: applyClicked ? '#1741a6' : '#2563eb', color: '#fff' }}
          >
            Apply
          </button>
        </div>
      )}
      {loading ? (
        <div style={{ padding: 24 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#c00', padding: 24 }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#e0e7ff' }}>
              <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Date</th>
              <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Screen Time</th>
              <th style={{ padding: 8, textAlign: 'left', fontWeight: 600 }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 16, textAlign: 'center', color: '#888' }}>No data</td></tr>
            ) : history.map((rec, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: 8 }}>{rec.date}</td>
                <td style={{ padding: 8 }}>{formatTime(rec.screenTime)}</td>
                <td style={{ padding: 8 }}>{formatDateTime(rec.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx>{`
        button { background: #e0e7ff; color: #1e3c72; border: none; border-radius: 6px; padding: 6px 16px; font-weight: 600; cursor: pointer; }
        .active-btn { background: #2563eb; color: #fff; }
        input[type="date"] { padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; }
      `}</style>
    </div>
  );
} 