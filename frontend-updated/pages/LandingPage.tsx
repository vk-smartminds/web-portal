export default function Home() {
  return (
    // <main className="min-h-screen bg-[#7f93f8] flex items-center justify-center px-4 py-10">
      <div className="max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 relative">
        {/* Left Section */}
        <div className="p-10 flex flex-col justify-center">
          <img src="/logo.svg" alt="Logo" className="h-8 mb-8" />

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            A good <span className="text-[#7f93f8]">education</span><br />
            is a foundation for <br />
            better future
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            A community with high expectation and high academic achievement
          </p>

          <button className="bg-[#7f93f8] text-white px-5 py-2 rounded-md w-max hover:bg-[#6c84ea] transition">
            Get Started
          </button>
        </div>

        {/* Right Section */}
        <div className="relative bg-[#7f93f8] flex flex-col items-center justify-center px-8 pt-10 pb-16">
          <nav className="absolute top-6 right-8 flex items-center gap-6 text-white text-sm">
            <a href="#">Home</a>
            <a href="#">Courses</a>
            <a href="#">About us</a>
            <button className="bg-white text-[#7f93f8] px-4 py-1 rounded-md hover:bg-gray-100 transition">Contact us</button>
          </nav>

          <div className="relative mt-16">
            <div className="bg-white w-36 h-48 rounded-[2.5rem]"></div>
            <img
              src="/student.png"
              alt="Student"
              className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 h-60 object-cover z-10"
            />

            {/* Get 20% Offer */}
            <div className="absolute left-[-60px] top-16 bg-white px-3 py-1 rounded-md shadow text-sm text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#fbbf24" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Get 20% offer
            </div>

            {/* Admission Completed */}
            <div className="absolute right-[-40px] top-6 bg-white px-4 py-2 rounded-md shadow flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" width="16" height="16">
                <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z" />
              </svg>
              <div>
                <p className="font-semibold text-green-600">Congratulation</p>
                <p className="text-gray-500 text-xs">Your admission completed</p>
              </div>
            </div>

            {/* Skills Badge */}
            <div className="absolute bottom-[-20px] right-2 bg-white px-3 py-1 rounded-md shadow text-sm">
              Skills
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-[#0e144b] text-white flex justify-around text-center py-4 text-sm rounded-b-3xl">
          <div>
            <p className="text-lg font-bold">250+</p>
            <p>Total Courses</p>
          </div>
          <div>
            <p className="text-lg font-bold">300+</p>
            <p>Total Instructor</p>
          </div>
          <div>
            <p className="text-lg font-bold">35k+</p>
            <p>Total Students</p>
          </div>
          <div>
            <p className="text-lg font-bold">42k+</p>
            <p>Total Seat</p>
          </div>
        </div>
      </div>
    // </main>
  );
}
