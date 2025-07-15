'use client';

import React from "react";
import { useRouter } from "next/navigation";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RegisterModal({ open, onClose }: RegisterModalProps) {
  const router = useRouter();
  const [selected, setSelected] = React.useState("");
  if (!open) return null;
  const vkPrimary = "#4a69bb";
  const vkAccent = "#222f5b";
  const vkGradient = "linear-gradient(135deg, #4a69bb 0%,rgb(77, 105, 198) 100%)";
  const vkShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.18)";
  const options = [
    {
      key: "student",
      label: "Student",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#eaf1fb"/><path d="M16 7l11 5-11 5-11-5 11-5zm0 8.5c4.5 0 8.5 2.02 8.5 4.5V23H7.5v-3c0-2.48 4-4.5 8.5-4.5z" fill="#4a69bb"/></svg>
      )
    },
    {
      key: "teacher",
      label: "Teacher",
      icon: (
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#eaf1fb"/><path d="M16 8a4 4 0 110 8 4 4 0 010-8zm0 10c4.42 0 8 1.79 8 4v2H8v-2c0-2.21 3.58-4 8-4z" fill="#4a69bb"/></svg>
      )
    },
    {
      key: "guardian",
      label: "Guardian",
      icon: (
        <svg width="40" height="32" fill="none" viewBox="0 0 40 32">
          <rect width="40" height="32" rx="8" fill="#eaf1fb"/>
          <circle cx="15" cy="14" r="4" fill="#4a69bb"/>
          <rect x="12.5" y="18" width="5" height="7" rx="2.5" fill="#4a69bb"/>
          <circle cx="25" cy="15.5" r="3.2" fill="#7ea6e6"/>
          <rect x="22.5" y="18.5" width="5" height="5.5" rx="2.2" fill="#7ea6e6"/>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div style={{
        background: "#fff",
        color: vkAccent,
        borderRadius: 18,
        boxShadow: vkShadow,
        padding: 36,
        minWidth: 340,
        maxWidth: 370,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 16, background: "#eee", color: vkAccent, border: "none",
            borderRadius: "50%", width: 32, height: 32, fontSize: 20, fontWeight: 700, cursor: "pointer"
          }}
          aria-label="Close"
        >×</button>
        <div style={{ marginBottom: 18, fontWeight: 700, fontSize: "1.3rem", color: vkAccent }}>
          Register as:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", marginBottom: 18 }}>
          {options.map(opt => (
            <label key={opt.key} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 18,
              borderRadius: 12,
              border: selected === opt.key ? `2px solid ${vkPrimary}` : "1.5px solid #e0e0e0",
              background: selected === opt.key ? "#eaf1fb" : "#f7f8fa",
              boxShadow: selected === opt.key ? "0 2px 8px #4a69bb22" : "none",
              cursor: "pointer",
              transition: "all 0.18s",
              fontWeight: 600,
              fontSize: "1.08rem"
            }}>
              <input
                type="radio"
                name="register-as"
                checked={selected === opt.key}
                onChange={() => setSelected(opt.key)}
                style={{ accentColor: vkPrimary, marginRight: 8 }}
              />
              {opt.icon}
              <span style={{ flex: 1 }}>{opt.label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleContinue}
          disabled={!selected}
          style={{
            width: "100%",
            background: selected ? vkGradient : "#e0e0e0",
            color: selected ? "#fff" : "#aaa",
            border: "none",
            borderRadius: 8,
            padding: "13px 0",
            fontWeight: 700,
            fontSize: "1.08rem",
            cursor: selected ? "pointer" : "not-allowed",
            marginBottom: 10,
            boxShadow: selected ? "0 2px 8px #4a69bb22" : "none",
            transition: "all 0.18s"
          }}
        >
          Continue
        </button>
        <button
          onClick={onClose}
          style={{
            background: "#f0f0f0",
            color: vkAccent,
            border: "none",
            borderRadius: 8,
            padding: "11px 0",
            fontWeight: 600,
            fontSize: "1.05rem",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 