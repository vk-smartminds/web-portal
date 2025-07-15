import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '../utils/auth';
import { BASE_API_URL } from '../utils/apiurl';

export default function DeleteAccountPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [show, setShow] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    setStatus('');
    const token = getToken();
    if (!token) {
      setStatus('Session expired. Please log in again.');
      window.location.href = '/login';
      return;
    }
    try {
      const res = await fetch(`${BASE_API_URL}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setStatus('Account deleted successfully. Redirecting to login...');
        setTimeout(() => {
          logout();
          window.location.href = '/login';
        }, 1500);
      } else {
        const data = await res.json();
        setStatus(data.message || 'Failed to delete account.');
      }
    } catch (err) {
      setStatus('Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,30,30,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 32px rgba(30,60,114,0.18)', maxWidth: 440, width: '95vw', textAlign: 'center', position: 'relative', border: '6px solid #444' }}>
        <div style={{ background: '#222', borderTopLeftRadius: 8, borderTopRightRadius: 8, padding: '18px 0 12px 0', position: 'relative' }}>
          <button
            onClick={() => router.back()}
            style={{ position: 'absolute', top: 8, right: 12, background: '#fff', color: '#222', border: 'none', borderRadius: '50%', width: 28, height: 28, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 1px 4px #2222' }}
            aria-label="Close"
          >
            ×
          </button>
          <h2 style={{ fontWeight: 700, fontSize: 28, color: '#fff', margin: 0 }}>Delete customer account</h2>
        </div>
        <div style={{ padding: '28px 28px 24px 28px' }}>
          <p style={{ color: '#222', fontWeight: 500, marginBottom: 18, fontSize: 16 }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <input
              type="checkbox"
              id="delete-confirm"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ marginRight: 10, width: 18, height: 18 }}
            />
            <label htmlFor="delete-confirm" style={{ fontSize: 15, color: '#222', fontWeight: 500, cursor: 'pointer' }}>
              I have read and understood this notice. <span style={{ color: '#c00' }}>*</span>
            </label>
          </div>
          <button
            onClick={handleDelete}
            disabled={!checked || loading}
            style={{ padding: '10px 32px', borderRadius: 6, background: !checked || loading ? '#ffb366' : '#ff8800', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: !checked || loading ? 'not-allowed' : 'pointer', marginBottom: 8, marginTop: 8, letterSpacing: 1 }}
          >
            {loading ? 'Deleting...' : 'DELETE'}
          </button>
          {status && <div style={{ marginTop: 18, color: status.includes('success') ? '#28a745' : '#c00', fontWeight: 500 }}>{status}</div>}
        </div>
      </div>
    </div>
  );
} 