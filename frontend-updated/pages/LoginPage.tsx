"use client";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

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
          Don’t have an account yet?{" "}
          <Link href="/signup">
            <span className="text-white font-medium cursor-pointer hover:underline">Sign up</span>
          </Link>
        </p>

        <div className="space-y-4">
          <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
            <span className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="email address"
              className="bg-transparent outline-none text-white text-sm w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="bg-[#1c1c1c] rounded-md px-3 py-2 flex items-center gap-2">
            <span className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0-6v.01M6 10a6 6 0 0112 0v4a2 2 0 01-2 2h-1m-6 0H8a2 2 0 01-2-2v-4z"
                />
              </svg>
            </span>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none text-white text-sm w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setError("");

              const postData = {
                email,
                password,
              };

              axios
                .post("http://localhost:8000/api/login-student", postData)
                .then((res) => {
                  console.log(res);
                  router.push("/student/dashboard");
                })
                .catch((err) => {
                  console.log(err);
                  setError("Login failed. Please try again.");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
