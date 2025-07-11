// Quiz Home Page (Student)
import React from 'react';
import Link from 'next/link';

export default function QuizHome() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 24 }}>Quiz Portal</h1>
      <div style={{ background: 'white', boxShadow: '0 2px 16px #e0e7ef', borderRadius: 16, padding: 40, minWidth: 320, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Link href="/quiz/attempt" legacyBehavior>
          <button style={{ width: '100%', background: '#2563eb', color: 'white', padding: '12px 0', borderRadius: 8, fontWeight: 700, fontSize: 18, marginBottom: 18, border: 'none', cursor: 'pointer' }}>Attempt Quiz</button>
        </Link>
        <Link href="/quiz/past" legacyBehavior>
          <button style={{ width: '100%', background: 'white', color: '#2563eb', border: '2px solid #2563eb', padding: '12px 0', borderRadius: 8, fontWeight: 700, fontSize: 18, borderColor: '#2563eb', cursor: 'pointer' }}>View Past Quizzes</button>
        </Link>
      </div>
    </div>
  );
}
