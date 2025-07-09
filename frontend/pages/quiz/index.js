// Quiz Home Page (Student)
import React from 'react';
import Link from 'next/link';

export default function QuizHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-primary mb-6">Quiz Portal</h1>
      <div className="bg-white shadow rounded p-8 w-full max-w-md">
        <Link href="/quiz/attempt">
          <button className="w-full bg-primary text-white py-2 rounded mb-4 hover:bg-blue-700 transition">Attempt Quiz</button>
        </Link>
        <Link href="/quiz/past">
          <button className="w-full border border-primary text-primary py-2 rounded hover:bg-blue-50 transition">View Past Quizzes</button>
        </Link>
      </div>
    </div>
  );
}
