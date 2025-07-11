'use client';

import React from "react";
import { useRouter } from "next/navigation";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RegisterModal({ open, onClose }: RegisterModalProps) {
  const router = useRouter();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] rounded-xl shadow-lg p-6 w-full max-w-xs relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
          aria-label="Close"
        >×</button>
        <div className="font-bold text-lg text-white mb-4 text-center">Register As</div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md font-medium mb-3"
          onClick={() => { onClose(); router.push("/student/register"); }}
        >
          Student
        </button>
        <button
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-md font-medium mb-3"
          onClick={() => { onClose(); router.push("/teacher/register"); }}
        >
          Teacher
        </button>
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-2 rounded-md font-medium"
          onClick={() => { onClose(); router.push("/guardian/register"); }}
        >
          Guardian
        </button>
      </div>
    </div>
  );
} 