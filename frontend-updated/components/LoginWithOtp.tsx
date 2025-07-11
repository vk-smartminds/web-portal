"use client";
import { BASE_API_URL } from "../utils/apiurl";
import { setToken } from "../utils/auth";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import SendLoginOtp from "./SendLoginOtp";

interface Props {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function LoginWithOtp({
  email,
  setEmail,
  otp,
  setOtp,
  error,
  setError,
  loading,
  setLoading,
}: Props) {
  const router = useRouter();

  const handleOtpLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        }
        // Try to detect user type from response and redirect
        let role = null;
        if (data.user && data.user.role) role = data.user.role.toLowerCase();
        else if (data.role) role = data.role.toLowerCase();
        if (role === 'admin') router.push('/admin/dashboard');
        else if (role === 'student') router.push('/student/dashboard');
        else if (role === 'teacher') router.push('/teacher/dashboard');
        else if (role === 'guardian' || role === 'parent') router.push('/guardian/dashboard');
        else router.push('/');
        setLoading(false);
        return;
      } else {
        const data = await res.json();
        setError(data.message || "Invalid OTP or user not found.");
      }
    } catch {
      setError("OTP login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleOtpLogin} autoComplete="off">
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
      <SendLoginOtp email={email} />
      <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter OTP"
          className="bg-transparent outline-none text-white text-sm w-full"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
          autoComplete="off"
          maxLength={6}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login with OTP"}
      </button>
    </form>
  );
} 