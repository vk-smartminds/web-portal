"use client";
export default function TopSection() {


  return (
    <div>
      {/* Hero Section */}
      <section className="px-10 py-10 grid grid-cols-1 md:grid-cols-2 items-center max-w-7xl mx-auto">
        {/* Left Content */}
        <div className="space-y-6 relative z-10">
          <span className="text-xs font-medium text-[#8b5cf6] bg-[#f3e8ff] px-4 py-1 rounded-full inline-block w-max">
            AI-POWERED ONLINE LEARNING PLATFORM
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Unlock Learning<br />
            with Expert-Led<br />
            Courses <span className="inline-flex items-center ml-2">
              <img src="/avatar1.png" alt="user" className="w-6 h-6 rounded-full" />
              <img src="/avatar2.png" alt="user" className="w-6 h-6 rounded-full -ml-2" />
              <svg className="w-5 h-5 text-white bg-[#8b5cf6] rounded-full ml-2 p-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.293 9.293a1 1 0 011.414 1.414L9.414 15H14a1 1 0 110 2H6a1 1 0 01-1-1v-8a1 1 0 112 0v4.586l4.293-4.293z" />
              </svg>
            </span>
          </h1>
          <p className="text-gray-600 text-sm max-w-md">
            Join thousands of learners gaining new skills through engaging, flexible online courses.
          </p>
          <button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-medium px-6 py-2 rounded-md text-sm">
            Start Learning
          </button>
        </div>

        {/* Right Content */}
        <div className="relative mt-10 md:mt-0">
          <div className="w-80 h-96 bg-[#f3f4f6] rounded-3xl relative overflow-hidden mx-auto">
            <img
              src="https://static.vecteezy.com/system/resources/previews/031/610/037/non_2x/a-of-a-3d-cartoon-little-boy-in-class-world-students-day-images-ai-generative-photo.jpg"
              alt="Student"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
}