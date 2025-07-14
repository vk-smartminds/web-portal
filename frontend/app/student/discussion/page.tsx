"use client";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import { useRouter } from "next/navigation";

const discussions = [
  {
    role: "design New Member",
    question: "How to create a design system?",
    detail:
      "I'm struggling with organizing my design assets for a project. What are the best practices for creating a design system in Figma?",
    time: "25 minutes ago",
    stats: { views: 2, replies: 5, likes: 20 },
  },
  {
    role: "ux researcher",
    question: "User testing feedback important?",
    detail:
      "Is user testing really that important in the design process? I've heard mixed opinions.",
    time: "20 minutes ago",
    stats: { views: 1, replies: 2, likes: 10 },
  },
  {
    role: "product manager",
    question: "Collaborating in Figma with remote teams?",
    detail:
      "What are some tips for working effectively in Figma with a remote design team?",
    time: "15 minutes ago",
    stats: { views: 3, replies: 4, likes: 30 },
  },
  {
    role: "graphic designer",
    question: "Best plugins for Figma?",
    detail:
      "What plugins do you recommend for enhancing productivity in Figma?",
    time: "10 minutes ago",
    stats: { views: 4, replies: 6, likes: 25 },
  },
  {
    role: "web developer",
    question: "Figma to code workflow",
    detail:
      "I'm curious about the best workflow for converting Figma designs into code. Any suggestions?",
    time: "5 minutes ago",
    stats: { views: 0, replies: 1, likes: 8 },
  },
];

const solvedTopics = [
  { title: "The color picker tool is missing from my toolbar", replies: 3 },
  { title: "How do I share my design with others?", replies: 5 },
  { title: "My components are not syncing correctly", replies: 4 },
  { title: "Is there a way to disable auto-layout?", replies: 1 },
  { title: "I'm having trouble with the prototyping feature", replies: 2 },
];

export default function DiscussionPage() {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
  return (
    <div className="flex">
      <Sidebar
        userEmail="student@example.com"
        userPhoto="/default-avatar.png"
        userName="John Doe"
        onMenuSelect={() => {}}
        selectedMenu="discussion-panel"
        renderAnnouncementBadge={() => null}
        newAnnouncementCount={0}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div
        className={`min-h-screen bg-white text-black px-6 py-4 font-sans transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Welcome to back, Ui Mahadi</h1>
          <div className="flex items-center gap-4">
            <FiSearch className="w-5 h-5" />
            <FaUserCircle className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Side */}
          <div className="w-2/3">
            <div className="flex items-center gap-4 mb-6">
              <button className="text-sm font-medium">Latest</button>
              <button className="text-sm font-medium text-gray-500">Hot</button>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-500">
                Categories <HiChevronDown className="w-4 h-4" />
              </button>
              <button className="ml-auto bg-black text-white text-sm px-4 py-1.5 rounded-md font-medium">
                + Create
              </button>
            </div>

            <div className="space-y-6">
              {discussions.map((d, idx) => (
                <div
                  key={idx}
                  className="border-b pb-4 cursor-pointer"
                  onClick={() => {
                    router.push("/student/quiz");
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">{d.role}</div>
                  <h2 className="text-md font-semibold text-black mb-1">
                    {d.question}
                  </h2>
                  <p className="text-sm text-gray-700 mb-2">{d.detail}</p>
                  <div className="flex items-center text-xs text-gray-500 gap-6">
                    <span>{d.stats.views}</span>
                    <span>{d.stats.replies}</span>
                    <span>{d.stats.likes}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {d.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="w-1/3 border-l pl-6">
            <h3 className="text-sm font-semibold mb-4">Solved topics</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {solvedTopics.map((topic, idx) => (
                <li key={idx} className="border-b pb-2">
                  {topic.title}
                  <div className="text-xs text-gray-400">
                    {topic.replies} Replies
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
