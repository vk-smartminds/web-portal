export default function Results() {
  return (<div className="bg-gray-50 p-6 rounded-2xl shadow">
              <h4 className="text-md font-semibold mb-4">Recent Results</h4>
              <div className="space-y-3">
                {[
                  { title: 'English - Quiz 01', score: 37, color: 'bg-red-500' },
                  { title: 'English - Quiz 02', score: 87, color: 'bg-green-400' },
                  { title: 'Science - Quiz 02', score: 90, color: 'bg-black' },
                  { title: 'English - Quiz 04', score: 57, color: 'bg-red-400' },
                  { title: 'English - Quiz 06', score: 100, color: 'bg-blue-600' },
                ].map((result, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex justify-between">
                      <span>{result.title}</span>
                      <span>{result.score}%</span>
                    </div>
                    <div className="w-full h-2 mt-1 rounded-full bg-gray-200">
                      <div
                        className={`${result.color} h-2 rounded-full`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <button className="w-full text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg text-left">
                  🗓️ Wants to take a Leave?
                </button>
                <button className="w-full text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg text-left">
                  ❗ Wants to complain against someone?
                </button>
              </div>
            </div>
  );
}