import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '../utils/auth';
import { BASE_API_URL } from '../utils/apiurl';

export default function DeleteAccountPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // No token, redirect to login
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
    console.log('Token used for delete:', token);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f7fa' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,60,114,0.08)', padding: 36, maxWidth: 420, width: '95vw', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, color: '#c00', marginBottom: 18 }}>Delete Account</h2>
        <p style={{ color: '#c00', fontWeight: 600, marginBottom: 18 }}>
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{ padding: '10px 32px', borderRadius: 8, background: '#c00', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 12 }}
          >
            Yes, Delete My Account
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ padding: '10px 32px', borderRadius: 8, background: loading ? '#bbb' : '#c00', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12 }}
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        )}
        <br />
        <button
          onClick={() => router.back()}
          disabled={loading}
          style={{ padding: '10px 32px', borderRadius: 8, background: '#bbb', color: '#222', border: 'none', fontWeight: 600, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
        >
          Cancel
        </button>
        {status && <div style={{ marginTop: 18, color: status.includes('success') ? '#28a745' : '#c00', fontWeight: 500 }}>{status}</div>}
      </div>
    </div>
  );
} 