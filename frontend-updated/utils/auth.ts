export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}

export function getUserData(): any | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}

export function setUserData(userData: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
}

export function removeUserData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_data');
  }
}

export function setSessionId(sessionId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_id', sessionId);
  }
}

export function getSessionId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('session_id');
  }
  return null;
}

export function removeSessionId() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session_id');
  }
}

export function logout() {
  removeToken();
  removeUserData();
  removeSessionId();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSuperAdmin');
    localStorage.removeItem('parentEmail');
  }
}

export function getStudentIdFromJWT(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload.userId || payload._id || null;
    if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
      return id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ? payload.role.toLowerCase() : null;
  } catch {
    return null;
  }
} 