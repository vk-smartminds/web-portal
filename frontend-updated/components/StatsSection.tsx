export default function StatsSection() {
  const stats = [
    {
      label: "Exam categories",
      value: "60+",
      icon: (
        <div className="bg-orange-100 rounded-md p-2">
          <div className="w-4 h-4 bg-orange-400 rounded-sm" />
        </div>
      ),
    },
    {
      label: "Educators",
      value: "14k+",
      icon: (
        <div className="bg-blue-100 rounded-md p-2 flex items-center justify-center">
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
        <div className="bg-rose-100 rounded-md p-2">
          <div className="w-4 h-3 bg-rose-400 rounded" />
        </div>
      ),
    },
    {
      label: "Video lessons",
      value: "1M+",
      icon: (
        <div className="bg-yellow-100 rounded-md p-2">
          <div className="w-4 h-4 bg-yellow-400" />
        </div>
      ),
    },
    {
      label: "Mins. watched",
      value: "3.2B+",
      icon: (
        <div className="bg-gray-100 rounded-md p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#9ca3af">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Start learning with<br />Unacademy
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Get unlimited access to structured courses & doubt clearing sessions
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-md">
            Start learning
          </button>
        </div>

        {/* Right */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-lg p-4 flex flex-col gap-2 border border-gray-100"
            >
              <div>{stat.icon}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-lg font-semibold text-green-600">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
