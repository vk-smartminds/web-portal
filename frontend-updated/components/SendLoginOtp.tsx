import { useState } from "react";
import { BASE_API_URL } from "../utils/apiurl";

interface SendLoginOtpProps {
  email: string;
}

export default function SendLoginOtp({ email }: SendLoginOtpProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch(`${BASE_API_URL}/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setMsg("OTP sent to your email.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-3 py-2 rounded-md font-medium"
        onClick={handleSendOtp}
        disabled={loading || !email}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
      {msg && <div className="text-green-500 text-sm">{msg}</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
} 