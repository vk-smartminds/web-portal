// JWT Token management utilities

import { BASE_API_URL } from './apiurl.js';

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const setUserData = (userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
};

export const removeUserData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_data');
  }
};

export const setSessionId = (sessionId) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_id', sessionId);
  }
};

export const getSessionId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('session_id');
  }
  return null;
};

export const removeSessionId = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session_id');
  }
};

export const logout = async () => {
  const token = getToken();
  const sessionId = getSessionId();
  if (token) {
    try {
      await fetch(`${BASE_API_URL}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) { /* ignore errors */ }
  }
  removeToken();
  removeUserData();
  removeSessionId();
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isSuperAdmin');
  localStorage.removeItem('parentEmail');
  // Add any other user-specific or role-specific keys here
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const getStudentIdFromJWT = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check for both userId and _id
    const id = payload.userId || payload._id || null;
    // Validate MongoDB ObjectId (24 hex chars)
    if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
      return id;
    }
    return null;
  } catch (error) {
    return null;
  }
};