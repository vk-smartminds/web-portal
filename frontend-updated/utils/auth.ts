export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
} 