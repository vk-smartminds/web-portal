import { BASE_API_URL } from "../utils/apiurl";
import { setToken } from "../utils/auth";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoints = [
      { url: `${BASE_API_URL}/admin/login`, dashboard: "/admin/dashboard" },
      { url: `${BASE_API_URL}/login-student`, dashboard: "/student/dashboard" },
      { url: `${BASE_API_URL}/login-teacher`, dashboard: "/teacher/dashboard" },
      { url: `${BASE_API_URL}/login-guardian`, dashboard: "/guardian/dashboard" },
    ];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            setToken(data.token);
          }
          setLoading(false);
          router.push(ep.dashboard);
          return;
        }
      } catch {}
    }
    setLoading(false);
    setError("Invalid credentials or user not found.");
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
        <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none text-white text-sm w-full"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
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