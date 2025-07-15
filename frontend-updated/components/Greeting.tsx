export default function Greeting() {
  return (
    <div className="bg-blue-100 p-6 rounded-2xl flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Hello Haleema,</h3>
        <p className="text-sm text-gray-600">
          You have learned 80% of your course. Keep it up and improve your grades to get scholarship
        </p>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">View Result</button>
      </div>
      <div>
        <img src="https://via.placeholder.com/100x100" alt="Illustration" />
      </div>
    </div>
  );
}