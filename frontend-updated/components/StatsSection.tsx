export default function StatsSection() {
  const stats = [
    {
      label: "Exam categories",
      value: "60+",
      icon: (
        <div className="bg-orange-100 rounded-lg p-3">
          <div className="w-5 h-5 bg-orange-400 rounded-sm" />
        </div>
      ),
    },
    {
      label: "Educators",
      value: "14k+",
      icon: (
        <div className="bg-blue-100 rounded-lg p-3 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
            <circle cx="8" cy="8" r="4" />
            <circle cx="16" cy="8" r="4" fill="#60a5fa" />
          </svg>
        </div>
      ),
    },
    {
      label: "Daily live classes",
      value: "1.5k+",
      icon: (
        <div className="bg-rose-100 rounded-lg p-3">
          <div className="w-5 h-3 bg-rose-400 rounded" />
        </div>
      ),
    },
    {
      label: "Video lessons",
      value: "1M+",
      icon: (
        <div className="bg-yellow-100 rounded-lg p-3">
          <div className="w-5 h-5 bg-yellow-400" />
        </div>
      ),
    },
    {
      label: "Mins. watched",
      value: "3.2B+",
      icon: (
        <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#9ca3af">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        {/* Left Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
            Start learning with <br />
            <span className="text-[#10b981]">Smart-Minds</span>
          </h2>
          <p className="text-gray-600 text-base mb-6 max-w-md">
            Get unlimited access to structured courses and doubt clearing sessions
          </p>
          <button className="bg-green-500 hover:bg-green-600 transition text-white font-medium px-6 py-3 rounded-lg shadow-md">
            Start learning
          </button>
        </div>

        {/* Right Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all rounded-xl p-5 flex flex-col gap-3 items-start"
            >
              {stat.icon}
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-green-600">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
