export default function FeatureSection() {
  const features = [
    {
      title: "Daily live classes",
      desc: "Chat with educators, ask questions, answer live polls, and get your doubts cleared – all while the class is going on",
      bgColor: "bg-blue-500",
      img: "/live-class.png",
    },
    {
      title: "Practice and revise",
      desc: "Learning isn’t just limited to classes with our practice section, mock tests and lecture notes shared as PDFs for your revision",
      bgColor: "bg-rose-400",
      img: "/practice-revise.png",
    },
    {
      title: "Learn anytime, anywhere",
      desc: "One subscription gets you access to all our live and recorded classes to watch from the comfort of any of your devices",
      bgColor: "bg-orange-300",
      img: "/learn-anywhere.png",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-start">
            <div className={`w-full h-40 rounded-xl mb-6 flex items-center justify-center ${feature.bgColor}`}>
              <img src={feature.img} alt={feature.title} className="max-h-32 object-contain" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
