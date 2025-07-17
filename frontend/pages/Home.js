"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/auth";
import Link from "next/link";
function TopSection() {
  return (
    <div>
      {/* Hero Section */}
      <section className="px-6 md:px-10 py-10 grid grid-cols-1 md:grid-cols-2 items-center max-w-7xl mx-auto gap-10">
        {/* Left Content */}
        <div className="space-y-6 text-center md:text-left">
          <span className="text-xs font-medium text-[#8b5cf6] bg-[#f3e8ff] px-4 py-1 rounded-full inline-block w-max mx-auto md:mx-0">
            AI-POWERED ONLINE LEARNING PLATFORM
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Unlock Learning
            <br />
            with Expert-Led
            <br />
            Courses{" "}
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto md:mx-0">
            Join thousands of learners gaining new skills through engaging,
            flexible online courses.
          </p>
          <Link href="/login">
            <span className="mt-5 inline-block bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium px-6 py-2 rounded-md text-sm cursor-pointer">
              Start Learning <svg style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>

        {/* Right Content */}
        <div className="flex justify-center md:justify-end mt-8 md:mt-0">
          <div className="w-72 sm:w-80 h-96 bg-[#f3f4f6] rounded-3xl overflow-hidden">
            <img
              src="https://static.vecteezy.com/system/resources/previews/031/610/037/non_2x/a-of-a-3d-cartoon-little-boy-in-class-world-students-day-images-ai-generative-photo.jpg"
              alt="Student"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Interactive Learning",
      desc: "Engage in daily live classes with real-time interaction — chat with educators, ask questions, participate in live polls, and get instant doubt resolution as you learn.",
      bgColor: "bg-blue-500",
      img: "/vk-logo.png",
    },
    {
      title: "Practice and revise",
      desc: "Learning isn't just limited to classes with our practice section, mock tests and lecture notes shared as PDFs for your revision",
      bgColor: "bg-rose-400",
      img: "/vk-logo.png",
    },
    {
      title: "Learn anytime, anywhere",
      desc: "One subscription gets you access to all our live and recorded classes to watch from the comfort of any of your devices",
      bgColor: "bg-orange-300",
      img: "/vk-logo.png",
    },
  ];

  return (
    <section className="px-6 md:px-10 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <div key={i} className={`rounded-xl shadow-sm p-6 text-white ${feature.bgColor} flex flex-col sm:flex-row items-center gap-4`}>
            <img
              src={feature.img}
              alt={feature.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-white/90 mt-1">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    {
      label: "Exam Categories",
      value: "60+",
      icon: (
        <svg
          className="w-6 h-6 text-orange-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2z" />
          <path d="M11 12.83L3.44 9.07 2 9.8V11l9 4.18 9-4.18V9.8l-1.44-.73L13 12.83V22h-2v-9.17z" />
        </svg>
      ),
      bg: "bg-orange-100",
    },
    {
      label: "Educators",
      value: "14k+",
      icon: (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.01 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
      bg: "bg-blue-100",
    },
    {
      label: "Daily Live Classes",
      value: "1.5k+",
      icon: (
        <svg
          className="w-6 h-6 text-rose-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M10 16.5l6-4.5-6-4.5v9z" />
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm0 10H3V8h18v8z" />
        </svg>
      ),
      bg: "bg-rose-100",
    },
    {
      label: "Video Lessons",
      value: "1M+",
      icon: (
        <svg
          className="w-6 h-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 4h16v12H4z" opacity=".3" />
          <path d="M20 18H4v-1h16v1zM4 20h16v1H4zM2 2v16h20V2H2zm2 14V4h16v12H4z" />
        </svg>
      ),
      bg: "bg-yellow-100",
    },
    {
      label: "Mins. Watched",
      value: "3.2B+",
      icon: (
        <svg
          className="w-6 h-6 text-gray-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm1 9h3v2h-5V7h2v6z" />
        </svg>
      ),
      bg: "bg-gray-100",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        {/* Left Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
            Start learning with <br />
            <span className="text-green-500">Smart-Minds</span>
          </h2>
          <p className="text-gray-600 text-base mb-6 max-w-md">
            Get unlimited access to structured courses and doubt clearing
            sessions
          </p>
          <Link href="/login">
            <span className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-6 py-3 rounded-lg shadow-md">
              Start learning <svg style={{display:'inline',verticalAlign:'middle',marginLeft:'4px'}} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-white border border-gray-100 shadow hover:shadow-md transition-all rounded-xl p-5 flex flex-col gap-3 items-start`}>
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-green-600">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/student/dashboard"); // redirect if already logged in
    }
  }, []);
  return (
    <div className="min-h-screen w-full bg-gray-50 font-serif max-w-full m-0 box-border">
      <TopSection />
      <FeatureSection />
      <StatsSection />
    </div>
  );
}