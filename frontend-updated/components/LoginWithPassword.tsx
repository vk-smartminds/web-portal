"use client";
import { BASE_API_URL } from "../utils/apiurl";
import { setToken } from "../utils/auth";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { useState } from "react";

interface Props {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function LoginWithPassword({
  email,
  setEmail,
  password,
  setPassword,
  error,
  setError,
  loading,
  setLoading,
}: Props) {
  const router = useRouter();
  const [showForgot, setShowForgot] = useState(false);
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    // Try admin first
    try {
      const adminRes = await fetch(`${BASE_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (adminRes.ok) {
        const data = await adminRes.json();
        if (data.token) setToken(data.token);
        setLoading(false);
        router.push("/admin/dashboard");
        return;
      }
      if (adminRes.status === 401) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }
    } catch {}
    // Try student
    try {
      const studentRes = await fetch(`${BASE_API_URL}/login-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (studentRes.ok) {
        const data = await studentRes.json();
        if (data.token) setToken(data.token);
        setLoading(false);
        router.push("/student/dashboard");
        return;
      }
      if (studentRes.status === 401) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }
    } catch {}
    // Try teacher
    try {
      const teacherRes = await fetch(`${BASE_API_URL}/login-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (teacherRes.ok) {
        const data = await teacherRes.json();
        if (data.token) setToken(data.token);
        setLoading(false);
        router.push("/teacher/dashboard");
        return;
      }
      if (teacherRes.status === 401) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }
    } catch {}
    // Try guardian
    try {
      const guardianRes = await fetch(`${BASE_API_URL}/login-guardian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      if (guardianRes.ok) {
        const data = await guardianRes.json();
        if (data.token) setToken(data.token);
        setLoading(false);
        router.push("/guardian/dashboard");
        return;
      }
      if (guardianRes.status === 401) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }
    } catch {}
    setError("User not found.");
    setLoading(false);
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleLogin} autoComplete="off">
        <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
          <input
            type="email"
            placeholder="email address"
            className="bg-transparent outline-none text-white text-sm w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-transparent outline-none text-white text-sm w-full pr-8"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye with slash SVG
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L21 21" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 5C6 5 2.73 9.11 2.09 10C2.03 10.08 2 10.17 2 10.25C2 10.33 2.03 10.42 2.09 10.5C2.73 11.39 6 15.5 11 15.5C13.13 15.5 15.01 14.5 16.37 13.25M18.5 10.5C18.5 10.5 17.5 8.5 15.5 7.25M8.5 8.5C9.03 8.18 9.66 8 10.33 8C12.06 8 13.5 9.44 13.5 11.17C13.5 11.84 13.32 12.47 13 13" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              // Open eye SVG
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="11" cy="11" rx="9" ry="5.5" stroke="#a1a1aa" strokeWidth="2"/>
                <circle cx="11" cy="11" r="2.5" stroke="#a1a1aa" strokeWidth="2"/>
              </svg>
            )}
          </span>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && (
          <div className="text-red-400 text-sm text-center mt-2">
            {error}
            <div className="mt-1">
              <button
                type="button"
                className="text-blue-400 hover:underline text-xs font-medium"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        )}
      </form>
      <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} onSuccess={() => setShowForgot(false)} />
    </>
  );
} 