import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';
import { useRouter } from 'next/navigation';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const router = useRouter();

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${BASE_API_URL}/discussion/notifications?page=${pageNum}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      if (pageNum === 1) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications(1);
    setPage(1);
  }, []);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => { if (loader.current) observer.unobserve(loader.current); };
  }, [handleObserver]);

  const markAsRead = async (id) => {
    try {
      const token = getToken();
      await fetch(`${BASE_API_URL}/discussion/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      const token = getToken();
      await fetch(`${BASE_API_URL}/discussion/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const handleNotificationClick = async (n) => {
    await markAsRead(n._id);
    if (n.thread && n.post) {
      router.push(`/discussion?thread=${n.thread._id}&post=${n.post._id}`);
    } else if (n.thread) {
      router.push(`/discussion?thread=${n.thread._id}`);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #eee', padding: 24 }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18, color: '#1e3c72' }}>Notifications</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {notifications.map(n => (
          <li key={n._id} style={{ background: n.isRead ? '#f7fafd' : '#e0e7ff', borderRadius: 8, marginBottom: 12, padding: 16, boxShadow: '0 1px 4px #eee', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }} onClick={() => handleNotificationClick(n)}>
            <div style={{ fontWeight: 600, color: n.isRead ? '#888' : '#1e3c72' }}>
              {n.type === 'vote' ? 'Your post/thread received a vote.' : n.type === 'reply' ? 'You received a reply.' : n.type}
            </div>
            <div style={{ fontSize: 15, color: '#444' }}>
              Thread: {n.thread?.title || 'N/A'}
              {n.post && n.post.body && (
                <><br />Post: {n.post.body.length > 60 ? n.post.body.slice(0, 60) + '...' : n.post.body}</>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {!n.isRead && <button onClick={e => { e.stopPropagation(); markAsRead(n._id); }} style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: 'pointer' }}>Mark as Read</button>}
              <button onClick={e => { e.stopPropagation(); deleteNotification(n._id); }} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {loading && <div style={{ textAlign: 'center', color: '#888' }}>Loading...</div>}
      <div ref={loader} />
      {!hasMore && !loading && <div style={{ textAlign: 'center', color: '#888', marginTop: 12 }}>No more notifications.</div>}
    </div>
  );
} 