"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../utils/auth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount((data.notifications || []).filter(n => !n.read).length);
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds) => {
    const token = getToken();
    if (!token) return;
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationIds }),
    });
    setNotifications((prev) =>
      prev.map((n) =>
        notificationIds.includes(n._id) ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => prev - notificationIds.length);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // Decode userId from token (assume JWT, or adapt as needed)
    let userId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id || payload._id || payload.userId;
    } catch (e) {}
    if (!userId) return;
    // Connect to Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000', {
      query: { userId },
      transports: ['websocket'],
    });
    socketRef.current.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
} 