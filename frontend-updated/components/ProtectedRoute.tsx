"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, isTokenExpired, getToken, logout } from "../utils/auth";
import { BASE_API_URL } from "../utils/apiurl";

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ? payload.role.toLowerCase() : null;
  } catch {
    return null;
  }
}

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const roleDashboardMap: Record<string, string> = {
  admin: "/admin/dashboard",
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  guardian: "/guardian/dashboard",
};

function isString(val: any): val is string {
  return typeof val === "string";
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        if (!token || !isAuthenticated() || isTokenExpired(token || "")) {
          logout();
          router.replace("/login");
          return;
        }
        const role = getRoleFromToken(token);
        if (
          allowedRoles &&
          Array.isArray(allowedRoles) &&
          (!role || !allowedRoles.includes(role))
        ) {
          if (role && roleDashboardMap[role]) {
            router.replace(roleDashboardMap[role]);
          } else {
            router.replace("/login");
          }
          return;
        }
        if (pathname === "/login") {
          if (role && roleDashboardMap[role]) {
            router.replace(roleDashboardMap[role]);
          } else {
            router.replace("/login");
          }
          return;
        }
        for (const [r, dash] of Object.entries(roleDashboardMap)) {
          if (typeof pathname === 'string' && pathname.startsWith(dash) && role !== r) {
            if (role && roleDashboardMap[role]) {
              router.replace(roleDashboardMap[role]);
            } else {
              router.replace("/login");
            }
            return;
          }
        }
        // Verify token with backend
        const response = await fetch(`${BASE_API_URL}/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          setIsValid(true);
          return;
        } else {
          logout();
          router.replace("/login");
        }
      } catch (error) {
        logout();
        router.replace("/login");
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
  return isValid ? <>{children}</> : null;
} 