// Quiz Report Page (Student)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getQuiz } from '../utils/api';
import ProtectedRoute from '../../components/ProtectedRoute';

function QuizReport() {
  const router = useRouter();
  const { quizId } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    getQuiz(quizId)
      .then(setQuiz)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  // --- Inline styles for VK Portal look ---
  const leftPanelStyle = {
    flex: 1,
    background: 'linear-gradient(135deg, #3b5998 60%, #1e293b 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    position: 'relative',
    padding: 0,
  };
  const logoStyle = {
    width: 70,
    height: 70,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: 2,
    color: '#ff2d55',
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
  };
  const brandTextStyle = {
    fontSize: 28,
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 1.2,
    textShadow: '0 2px 8px rgba(0,0,0,0.10)',
  };
  const rightPanelStyle = {
    flex: 1.5,
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const cardStyle = {
    background: 'white',
    borderRadius: 20,
    boxShadow: '0 8px 40px 0 rgba(30,41,59,0.10)',
    padding: '40px 36px',
    minWidth: 400,
    maxWidth: 700,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e0e7ef',
  };
  const headingStyle = {
    fontSize: 28,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  };
  const subTextStyle = {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  };
  const scoreStyle = {
    fontWeight: 700,
    fontSize: 20,
    color: '#2563eb',
    marginBottom: 8,
  };
  const statsStyle = {
    display: 'flex',
    gap: 16,
    fontSize: 15,
    color: '#64748b',
    marginBottom: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  };
  const qBlockStyle = {
    padding: '28px 0',
    borderBottom: '1px solid #e0e7ef',
    display: 'flex',
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
  };
  const qTextStyle = {
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 6,
    fontSize: 17,
  };
  const qMetaStyle = {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
  };
  const optStyle = (isCorrect, isSelected) => ({
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 16,
    border: `2px solid ${isCorrect ? '#22c55e' : isSelected ? '#3b82f6' : '#e0e7ef'}`,
    background: isCorrect ? '#dcfce7' : isSelected ? '#dbeafe' : '#f1f5f9',
    color: isCorrect ? '#15803d' : isSelected ? '#1d4ed8' : '#334155',
    fontWeight: 500,
    fontSize: 15,
    marginRight: 8,
    marginBottom: 6,
  });
  const answerStyle = (isCorrect, isSelected) => ({
    fontWeight: 700,
    color: isCorrect ? '#22c55e' : isSelected ? '#ef4444' : '#eab308',
    marginLeft: 6,
  });
  const solutionStyle = {
    background: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontSize: 14,
    color: '#334155',
    whiteSpace: 'pre-line',
  };
  const loadingStyle = {
    color: '#2563eb',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const errorStyle = {
    color: '#ef4444',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (loading) return <div style={loadingStyle}>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;
  if (!quiz) return null;

  // Calculate total time spent
  const totalTime = (quiz.responses || []).reduce((sum, r) => sum + (r.timeSpent || 0), 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <div style={leftPanelStyle}>
        <div style={logoStyle}>
          <span style={{fontFamily: 'monospace'}}>VK</span>
        </div>
        <div style={brandTextStyle}>
          THE BRAND YOU TRUST,<br />REIMAGINED FOR TODAY
        </div>
      </div>
      <div style={rightPanelStyle}>
        <div style={cardStyle}>
          <div style={headingStyle}>Quiz Report</div>
          <div style={subTextStyle}>See your quiz results and solutions</div>
          <div style={scoreStyle}>Score: {quiz.correct} / {quiz.questions.length}</div>
          <div style={statsStyle}>
            <span>Correct: <span style={{ color: '#22c55e', fontWeight: 700 }}>{quiz.correct}</span></span>
            <span>Incorrect: <span style={{ color: '#ef4444', fontWeight: 700 }}>{quiz.incorrect}</span></span>
            <span>Unattempted: <span style={{ color: '#eab308', fontWeight: 700 }}>{quiz.unattempted}</span></span>
            <span>Total Time: <span style={{ color: '#2563eb', fontWeight: 700 }}>{totalTime}s</span></span>
          </div>
          <div style={{ width: '100%' }}>
            {quiz.questions.map((q, i) => {
              const resp = quiz.responses?.find(r =>
                String(r.question) === String(q._id) ||
                (r.question && r.question._id && String(r.question._id) === String(q._id))
              );
              // Normalize correct_option and selectedOption to arrays
              const correctOpt = Array.isArray(q.correct_option) ? q.correct_option : [q.correct_option];
              const selectedOpt = resp && Array.isArray(resp.selectedOption) ? resp.selectedOption : resp && resp.selectedOption ? [resp.selectedOption] : [];
              // Compare arrays (order-insensitive)
              const isCorrect =
                selectedOpt.length === correctOpt.length &&
                correctOpt.every(opt => selectedOpt.includes(opt)) &&
                selectedOpt.every(opt => correctOpt.includes(opt));
              return (
                <div key={q._id} style={qBlockStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={qTextStyle}>Q{i+1}. {q.question}</div>
                    <div style={qMetaStyle}>Topic: {q.topics?.join(', ') || 'N/A'} | Difficulty: {q.difficulty || 'Medium'}</div>
                    <div style={{ marginBottom: 8 }}>
                      {q.options.map((opt, idx) => {
                        const correct = correctOpt.includes(opt);
                        const selected = selectedOpt.includes(opt);
                        return (
                          <span key={idx} style={optStyle(correct, selected)}>{opt}</span>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ minWidth: 180, marginTop: 8 }}>
                    <div style={{ fontSize: 15 }}>
                      <span style={{ fontWeight: 600 }}>Your Answer:</span>
                      <span style={answerStyle(isCorrect, selectedOpt.length && !isCorrect)}>
                        {selectedOpt.length ? selectedOpt.join(', ') : 'Unattempted'}
                        {isCorrect && <span style={{ marginLeft: 6 }}>✔</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Time Spent: {resp?.timeSpent ? `${resp.timeSpent}s` : 'N/A'}</div>
                    <details style={{ fontSize: 13, marginTop: 6 }}>
                      <summary style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}>View Solution</summary>
                      <div style={solutionStyle}>{q.answer}</div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizReportProtected() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <QuizReport />
    </ProtectedRoute>
  );
}

export default QuizReportProtected;
