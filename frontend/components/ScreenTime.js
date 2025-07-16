import React, { useEffect, useRef, useState } from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';
import ScreenTimeHistory from './ScreenTimeHistory';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function ScreenTime() {
  const [screenTime, setScreenTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef();
  const syncRef = useRef();
  const unsyncedSeconds = useRef(0);

  // Fetch initial screen time
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_API_URL}/screen-time`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(res => res.json())
      .then(data => {
        setScreenTime(data.screenTime || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load screen time');
        setLoading(false);
      });
  }, []);

  // Increment timer every second and sync every 5 seconds
  useEffect(() => {
    if (loading || error) return;
    intervalRef.current = setInterval(() => {
      setScreenTime(prev => prev + 1);
      unsyncedSeconds.current += 1;
    }, 1000);
    syncRef.current = setInterval(() => {
      const increment = unsyncedSeconds.current;
      if (increment > 0) {
        fetch(`${BASE_API_URL}/screen-time/increment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ increment })
        })
          .then(res => res.json())
          .then(data => {
            // Only update if backend value is higher (e.g. if user has another tab open)
            if (typeof data.screenTime === 'number' && data.screenTime > screenTime) {
              setScreenTime(data.screenTime);
            }
          });
        unsyncedSeconds.current = 0;
      }
    }, 5000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(syncRef.current);
    };
  }, [loading, error, screenTime]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ color: '#c00', padding: 40 }}>{error}</div>;

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(30,60,114,0.08)', padding: 32, marginBottom: 32, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#1e3c72' }}>Screen Time</h3>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#2563eb', marginBottom: 16 }}>{formatTime(screenTime)}</div>
      <div style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>This is your screen time for today.</div>
      <button
        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 8 }}
        onClick={() => setShowHistory(true)}
      >
        View Past Screen Times
      </button>
      {showHistory && <ScreenTimeHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
} 