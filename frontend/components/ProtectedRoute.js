"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, isTokenExpired, getToken, logout } from '../utils/auth.js';
import { BASE_API_URL } from '../utils/apiurl';

function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ? payload.role.toLowerCase() : null;
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Map dashboard routes to roles
  const roleDashboardMap = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    teacher: '/teacher/dashboard',
    parent: '/parent/dashboard',
    guardian: '/guardian/dashboard', // Added guardian
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        console.log('DEBUG [ProtectedRoute] token:', token);
        console.log('DEBUG [ProtectedRoute] isAuthenticated:', isAuthenticated());
        console.log('DEBUG [ProtectedRoute] isTokenExpired:', isTokenExpired(token));

        if (typeof pathname !== 'string') {
          console.log('DEBUG [ProtectedRoute] pathname not ready, skipping auth check');
          return;
        }

        if (!token) {
          console.log('DEBUG [ProtectedRoute] Reason: No token found. Logging out.');
          logout();
          router.replace('/login');
          return;
        }
        if (!isAuthenticated()) {
          console.log('DEBUG [ProtectedRoute] Reason: Not authenticated. Logging out.');
          logout();
          router.replace('/login');
          return;
        }
        if (isTokenExpired(token)) {
          console.log('DEBUG [ProtectedRoute] Reason: Token expired. Logging out.');
          logout();
          router.replace('/login');
          return;
        }

        const role = getRoleFromToken(token);
        console.log('DEBUG [ProtectedRoute] role:', role);

        if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(role)) {
          console.log('DEBUG [ProtectedRoute] Reason: Role not allowed:', role);
          if (roleDashboardMap[role]) {
            router.replace(roleDashboardMap[role]);
          } else {
            router.replace('/login');
          }
          return;
        }

        if (pathname === '/login') {
          if (roleDashboardMap[role]) {
            router.replace(roleDashboardMap[role]);
          } else {
            router.replace('/login');
          }
          return;
        }

        for (const [r, dash] of Object.entries(roleDashboardMap)) {
          if (typeof pathname === 'string' && pathname.startsWith(dash) && role !== r) {
            console.log('DEBUG [ProtectedRoute] Reason: Dashboard route mismatch:', pathname, role);
            if (roleDashboardMap[role]) {
              router.replace(roleDashboardMap[role]);
            } else {
              router.replace('/login');
            }
            return;
          }
        }

        // Verify token with backend
        console.log('DEBUG [ProtectedRoute] About to call verify-token');
        const response = await fetch(`${BASE_API_URL}/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('DEBUG [ProtectedRoute] verify-token status:', response.status);
        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          console.log('DEBUG [ProtectedRoute] Could not parse verify-token response as JSON');
        }
        console.log('DEBUG [ProtectedRoute] verify-token response:', data);

        if (response.ok) {
          setIsValid(true);
          console.log('DEBUG [ProtectedRoute] Token verified with backend.');
          return;
        } else {
          console.log('DEBUG [ProtectedRoute] Reason: Token verification failed with backend. Logging out.');
          logout();
          router.replace('/login');
        }
      } catch (error) {
        console.log('DEBUG [ProtectedRoute] Reason: Error during auth check:', error);
        logout();
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1e3c72'
      }}>
        Loading...
      </div>
    );
  }
  return isValid ? children : null;
}