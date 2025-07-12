'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function RegisterModal({ open, onClose }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState("");

  if (!open) return null;

  const options = [
    {
      key: "student",
      label: "Student",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#eaf1fb" />
          <path d="M16 7l11 5-11 5-11-5 11-5zm0 8.5c4.5 0 8.5 2.02 8.5 4.5V23H7.5v-3c0-2.48 4-4.5 8.5-4.5z" fill="#4a69bb" />
        </svg>
      )
    },
    {
      key: "teacher",
      label: "Teacher",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#eaf1fb" />
          <path d="M16 8a4 4 0 110 8 4 4 0 010-8zm0 10c4.42 0 8 1.79 8 4v2H8v-2c0-2.21 3.58-4 8-4z" fill="#4a69bb" />
        </svg>
      )
    },
    {
      key: "guardian",
      label: "Guardian",
      icon: (
        <svg width="40" height="32" fill="none" viewBox="0 0 40 32">
          <rect width="40" height="32" rx="8" fill="#eaf1fb" />
          <circle cx="15" cy="14" r="4" fill="#4a69bb" />
          <rect x="12.5" y="18" width="5" height="7" rx="2.5" fill="#4a69bb" />
          <circle cx="25" cy="15.5" r="3.2" fill="#7ea6e6" />
          <rect x="22.5" y="18.5" width="5" height="5.5" rx="2.2" fill="#7ea6e6" />
        </svg>
      )
    }
  ];

  const handleContinue = () => {
    if (selected === "student") router.push("/student/register");
    else if (selected === "teacher") router.push("/teacher/register");
    else if (selected === "guardian") router.push("/guardian/register");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative bg-[#1e293b] text-white rounded-[18px] shadow-xl px-9 py-9 w-[90%] max-w-[370px] text-center flex flex-col items-center">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 bg-slate-600 text-white w-8 h-8 rounded-full text-lg font-bold hover:bg-slate-500 transition"
        >
          ×
        </button>

        <div className="mb-5 font-bold text-xl text-white">Register as:</div>

        <div className="flex flex-col gap-4 w-full mb-5">
          {options.map(opt => (
            <label
              key={opt.key}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all cursor-pointer font-semibold text-[1.08rem]
              ${selected === opt.key
                  ? "border-blue-400 bg-blue-950/30 shadow-md shadow-blue-600/20"
                  : "border-slate-600 bg-slate-800"
                }`}
            >
              <input
                type="radio"
                name="register-as"
                checked={selected === opt.key}
                onChange={() => setSelected(opt.key)}
                className="accent-blue-500 mr-2"
              />
              {opt.icon}
              <span className="flex-1 text-white">{opt.label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full rounded-md py-3 font-bold text-[1.08rem] transition-all mb-2
            ${selected
              ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md shadow-blue-400/30 hover:opacity-95"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
        >
          Continue
        </button>

        <button
          onClick={onClose}
          className="w-full bg-slate-700 text-white rounded-md py-3 font-semibold text-[1.05rem] hover:bg-slate-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
