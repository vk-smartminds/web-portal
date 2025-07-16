import React, { useEffect, useState } from "react";
import { BASE_API_URL } from "../utils/apiurl";
import { getToken } from "../utils/auth";
import { Bar } from "react-chartjs-2";
import ProtectedRoute from "../components/ProtectedRoute";
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

const roles = ["student", "teacher", "guardian", "admin"];

// Helper to format seconds as d h m s
function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '-';
  seconds = Math.floor(seconds);
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  let str = '';
  if (days > 0) str += days + 'd ';
  if (hrs > 0 || days > 0) str += hrs + 'h ';
  if (mins > 0 || hrs > 0 || days > 0) str += mins + 'm ';
  str += secs + 's';
  return str.trim();
}

export default function TrackScreenTimePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  // New: time range filter state
  const [timeRange, setTimeRange] = useState('day');
  const [customYearInput, setCustomYearInput] = useState(new Date().getFullYear());
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customRangeInput, setCustomRangeInput] = useState({ start: '', end: '' });
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Helper to build query params for time range
  function getTimeRangeParams() {
    if (roleFilter !== 'all') return '';
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

  // Only fetch when relevant state changes
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("isSuperAdmin") !== "true") {
      setError("Access denied: Superadmin only.");
      setLoading(false);
      return;
    }
    // For customYear, only fetch when customYear changes (not input)
    // For customRange, only fetch when customRange changes (not input)
    if (timeRange === 'customYear' && !customYear) return;
    if (timeRange === 'customRange' && (!customRange.start || !customRange.end)) return;
    setLoading(true);
    let url = `${BASE_API_URL}/track-screen-time?role=${roleFilter}`;
    if (roleFilter === 'all') {
      url += getTimeRangeParams();
    }
    fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch screen time data.");
        setLoading(false);
      });
  }, [roleFilter, timeRange, customYear, customRange]);

  // Reset custom inputs when switching filter
  useEffect(() => {
    if (timeRange !== 'customYear') setCustomYearInput(new Date().getFullYear());
    if (timeRange !== 'customRange') setCustomRangeInput({ start: '', end: '' });
  }, [timeRange]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: "#c00", padding: 40 }}>{error}</div>;
  if (!data) return null;

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
    <ProtectedRoute allowedRoles={["admin"]}>
      <div style={{ padding: 48, maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 28, color: "#1e3c72", letterSpacing: 1, textAlign: "center" }}>
          Track Screen Time (All Users)
        </h2>
        <div style={{ color: "#111", fontSize: 20, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
          Combined Total Screen Time: <span style={{ color: "#111", fontWeight: 700 }}>{formatDuration(data.combinedTotal)}</span>
        </div>
        <div style={{ marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
          <label style={{ fontWeight: 600, color: "#1e3c72" }}>Filter by Role:</label>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1.5px solid #e0e0e0", fontSize: 16 }}>
            <option value="all">All</option>
            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        {roleFilter === 'all' && (
          <div>
            {/* Time range filter UI (no unit selector) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 0 }}>
              <div style={{ background: '#f4f6fa', border: '1.5px solid #dbeafe', borderRadius: 12, padding: '18px 12px 10px 12px', marginBottom: 18, display: 'inline-block', minWidth: 260 }}>
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
            <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>Screen Time by Role {timeRange !== 'day' ? '(Filtered)' : ''}</h3>
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
          </div>
        )}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(30,60,114,0.08)", padding: 32, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#1e3c72" }}>User Screen Time List</h3>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16, width: 280 }}
            />
            {search.trim() && data.users.filter(u => {
              const s = search.trim().toLowerCase();
              return (u.name && u.name.toLowerCase().includes(s)) || (u.email && u.email.toLowerCase().includes(s));
            }).length === 0 && (
              <span style={{ color: '#c00', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 900 }}>&#10006;</span> No results found
              </span>
            )}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#f7fafd", borderRadius: 8 }}>
            <thead>
              <tr style={{ background: "#e0e7ff" }}>
                <th style={{ padding: 8, textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 8, textAlign: "left", fontWeight: 600 }}>Email</th>
                <th style={{ padding: 8, textAlign: "left", fontWeight: 600 }}>Role</th>
                <th style={{ padding: 8, textAlign: "left", fontWeight: 600 }}>Total Screen Time</th>
                <th style={{ padding: 8, textAlign: "left", fontWeight: 600 }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {data.users.filter(u => {
                const s = search.trim().toLowerCase();
                if (!s) return true;
                return (u.name && u.name.toLowerCase().includes(s)) || (u.email && u.email.toLowerCase().includes(s));
              }).map((u) => (
                <tr key={u.userId} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: 8 }}>{u.name || "-"}</td>
                  <td style={{ padding: 8 }}>{u.email || "-"}</td>
                  <td style={{ padding: 8 }}>{u.role}</td>
                  <td style={{ padding: 8 }}>{formatDuration(u.totalTime)}</td>
                  <td style={{ padding: 8 }}>{u.lastActive ? new Date(u.lastActive).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
} 