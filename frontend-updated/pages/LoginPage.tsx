'use client';
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterModal from "../components/RegisterModal";

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm bg-[#111111] rounded-2xl p-6 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            <span>VK</span>
          </div>
        </div>
        <h2 className="text-white text-center text-xl font-semibold mb-1">Welcome Back</h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Don’t have an account yet? 
          <span className="text-white font-medium cursor-pointer hover:underline" onClick={() => setShowRegister(true)}>
            Sign up
          </span>
        </p>
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-l-md ${mode === "password" ? "bg-blue-600 text-white" : "bg-[#1c1c1c] text-gray-400"}`}
            onClick={() => setMode("password")}
          >
            Password
          </button>
          <button
            className={`flex-1 py-2 rounded-r-md ${mode === "otp" ? "bg-blue-600 text-white" : "bg-[#1c1c1c] text-gray-400"}`}
            onClick={() => setMode("otp")}
          >
            OTP
          </button>
        </div>
        <LoginForm
          mode={mode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          otp={otp}
          setOtp={setOtp}
          error={error}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
        />
        <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
      </div>
    </div>
  );
}