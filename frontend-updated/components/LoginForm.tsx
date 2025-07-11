import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BASE_API_URL } from "../utils/apiurl";
import { setToken } from "../utils/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
          <input
            type="email"
            placeholder="email address"
            className="bg-transparent outline-none text-white text-sm w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
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
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
} 