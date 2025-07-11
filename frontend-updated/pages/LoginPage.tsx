
import Link from "next/link";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
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
          <span className="text-white font-medium cursor-pointer hover:underline">
            <Link href="/signup">Sign up</Link>
          </span>
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
