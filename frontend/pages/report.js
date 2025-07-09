// Quiz Report Page (Student)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getQuiz } from '../quiz/utils/api';
import ProtectedRoute from '../components/ProtectedRoute';

function QuizReport(props) {
  const router = useRouter();
  const { quizId } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Retry fetch logic
  useEffect(() => {
    if (!quizId) return;
    let attempts = 0;
    let cancelled = false;
    setLoading(true);
    async function fetchQuizWithRetry() {
      try {
        const q = await getQuiz(quizId);
        // If not completed or score fields missing, retry
        if ((q.status !== 'completed' || typeof q.correct !== 'number') && attempts < 6) {
          attempts++;
          setTimeout(fetchQuizWithRetry, 500);
        } else {
          if (!cancelled) setQuiz(q);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchQuizWithRetry();
    return () => { cancelled = true; };
  }, [quizId]);

  // --- Modern, full-width styles ---
  const pageStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: '#f8fafc',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    padding: '0 0 48px 0',
  };
  const headerStyle = {
    width: '100%',
    background: '#fff',
    boxShadow: '0 2px 12px 0 rgba(30,41,59,0.06)',
    padding: '32px 0 18px 0',
    marginBottom: 32,
    textAlign: 'center',
  };
  const headingStyle = {
    fontSize: 32,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: 0.5,
  };
  const subTextStyle = {
    color: '#64748b',
    fontSize: 17,
    marginBottom: 18,
    textAlign: 'center',
  };
  const scoreStyle = {
    fontWeight: 700,
    fontSize: 22,
    color: '#2563eb',
    marginBottom: 8,
  };
  const statsStyle = {
    display: 'flex',
    gap: 24,
    fontSize: 16,
    color: '#64748b',
    marginBottom: 0,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const questionsContainer = {
    maxWidth: 1200,
    margin: '0 auto',
    background: '#fff',
    borderRadius: 18,
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.07)',
    padding: '32px 32px 24px 32px',
    width: '100%',
  };
  const qBlockStyle = {
    padding: '28px 0',
    borderBottom: '1px solid #e0e7ef',
    width: '100%',
    background: 'none',
    marginBottom: 0,
  };
  const qTextStyle = {
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 10,
    fontSize: 22,
    lineHeight: 1.4,
    width: '100%',
    textAlign: 'left',
  };
  const qMetaStyle = {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
  };
  const optionListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 18,
    width: 400,
    minWidth: 260,
    maxWidth: 480,
    alignItems: 'flex-start',
  };
  const optStyle = (isCorrect, isUserSelected, isMissedCorrect) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    borderRadius: 10,
    border: isCorrect ? '2px solid #22c55e' : isUserSelected ? '2px solid #ef4444' : isMissedCorrect ? '2px dashed #22c55e' : '2px solid #e0e7ef',
    background: isCorrect ? '#dcfce7' : isUserSelected ? '#fee2e2' : isMissedCorrect ? '#f0fdf4' : '#f1f5f9',
    color: isCorrect ? '#15803d' : isUserSelected ? '#b91c1c' : isMissedCorrect ? '#15803d' : '#334155',
    fontWeight: 500,
    fontSize: 16,
    width: '100%',
    maxWidth: 480,
    margin: 0,
    transition: 'all 0.15s',
    position: 'relative',
    minHeight: 40,
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    whiteSpace: 'pre-line',
  });
  const checkmarkStyle = {
    marginLeft: 10,
    color: '#22c55e',
    fontWeight: 700,
    fontSize: 18,
  };
  const answerStyle = (isCorrect, isSelected) => ({
    fontWeight: 700,
    color: isCorrect ? '#22c55e' : isSelected ? '#ef4444' : '#eab308',
    marginLeft: 0,
    fontSize: 16,
    display: 'inline',
    textAlign: 'left',
  });
  const solutionStyle = {
    background: '#f1f5f9',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    fontSize: 15,
    color: '#334155',
    whiteSpace: 'pre-line',
    width: 500,
    maxWidth: '100%',
    minHeight: 36,
    boxSizing: 'border-box',
    textAlign: 'left',
    border: '1px solid #e0e7ef',
    fontWeight: 400,
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
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={headingStyle}>Quiz Report</div>
        <div style={subTextStyle}>See your quiz results and solutions</div>
        <div style={scoreStyle}>Score: {quiz.correct} / {quiz.questions.length}</div>
        <div style={statsStyle}>
          <span>Correct: <span style={{ color: '#22c55e', fontWeight: 700 }}>{quiz.correct}</span></span>
          <span>Incorrect: <span style={{ color: '#ef4444', fontWeight: 700 }}>{quiz.incorrect}</span></span>
          <span>Unattempted: <span style={{ color: '#eab308', fontWeight: 700 }}>{quiz.unattempted}</span></span>
          <span>Total Time: <span style={{ color: '#2563eb', fontWeight: 700 }}>{totalTime}s</span></span>
        </div>
      </div>
      <div style={questionsContainer}>
        {quiz.questions.map((q, i) => {
          const resp = quiz.responses?.find(r =>
            String(r.question) === String(q._id) ||
            (r.question && r.question._id && String(r.question._id) === String(q._id))
          );
          // Robustly get correct options as indices (a/b/c/d to 0/1/2/3)
          let correctOptRaw = [];
          if (Array.isArray(q.correct_option)) correctOptRaw = q.correct_option;
          else if (Array.isArray(q.correctOption)) correctOptRaw = q.correctOption;
          else if (Array.isArray(q.correct)) correctOptRaw = q.correct;
          else if (q.correct_option) correctOptRaw = [q.correct_option];
          else if (q.correctOption) correctOptRaw = [q.correctOption];
          else if (q.correct) correctOptRaw = [q.correct];
          // Map 'a'/'b'/'c'/'d' to indices
          const letterToIndex = l => {
            if (typeof l !== 'string') return -1;
            const idx = l.trim().toLowerCase().charCodeAt(0) - 97;
            return idx >= 0 && idx < q.options.length ? idx : -1;
          };
          const correctOptIdx = correctOptRaw.map(letterToIndex).filter(idx => idx !== -1);
          // User's selected indices (if user selected by letter, map; else fallback to text match)
          let selectedOptIdx = [];
          if (resp && Array.isArray(resp.selectedOption) && resp.selectedOption.length && typeof resp.selectedOption[0] === 'string' && resp.selectedOption[0].length === 1 && /^[a-d]$/i.test(resp.selectedOption[0])) {
            selectedOptIdx = resp.selectedOption.map(letterToIndex).filter(idx => idx !== -1);
          } else if (resp && Array.isArray(resp.selectedOption)) {
            selectedOptIdx = resp.selectedOption.map(sel => q.options.indexOf(sel)).filter(idx => idx !== -1);
          } else if (resp && resp.selectedOption) {
            if (typeof resp.selectedOption === 'string' && resp.selectedOption.length === 1 && /^[a-d]$/i.test(resp.selectedOption)) {
              selectedOptIdx = [letterToIndex(resp.selectedOption)];
            } else {
              const idx = q.options.indexOf(resp.selectedOption);
              if (idx !== -1) selectedOptIdx = [idx];
            }
          }
          // Determine if answer is correct (all and only correct indices selected)
          const isCorrect =
            selectedOptIdx.length === correctOptIdx.length &&
            correctOptIdx.every(idx => selectedOptIdx.includes(idx)) &&
            selectedOptIdx.every(idx => correctOptIdx.includes(idx));
          return (
            <div key={q._id} style={qBlockStyle}>
              <div style={qTextStyle}>Q{i+1}. {q.question}</div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32, width: '100%' }}>
                <div style={optionListStyle}>
                  {q.options.map((opt, idx) => {
                    const isUserSelected = selectedOptIdx.includes(idx);
                    const isActuallyCorrect = correctOptIdx.includes(idx);
                    const isMissedCorrect = isActuallyCorrect && !isUserSelected;
                    // Always show correct options in green (with checkmark), even if not selected
                    let style = { ...optStyle(false, false, false) };
                    let showCheck = false;
                    if (isActuallyCorrect && isUserSelected) {
                      style = { ...optStyle(true, true, false), background: '#dcfce7', border: '2px solid #22c55e', color: '#15803d' };
                      showCheck = true;
                    } else if (isUserSelected && !isActuallyCorrect) {
                      style = { ...optStyle(false, true, false), background: '#fee2e2', border: '2px solid #ef4444', color: '#b91c1c' };
                    } else if (isMissedCorrect) {
                      style = { ...optStyle(true, false, true) };
                      showCheck = true;
                    } else if (isActuallyCorrect) {
                      style = { ...optStyle(true, false, false), background: '#dcfce7', border: '2px solid #22c55e', color: '#15803d' };
                      showCheck = true;
                    }
                    return (
                      <div key={idx} style={style}>
                        {opt}
                        {showCheck && <span style={checkmarkStyle}>✔</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>Your Answer:</span>
                    <span style={answerStyle(isCorrect, selectedOptIdx.length && !isCorrect)}>
                      {selectedOptIdx.length ? selectedOptIdx.map(idx => q.options[idx]).join(', ') : 'Unattempted'}
                      {isCorrect && <span style={{ marginLeft: 6 }}>✔</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Time Spent: {resp?.timeSpent ? `${resp.timeSpent}s` : 'N/A'}</div>
                  <details style={{ fontSize: 13, marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}>View Solution</summary>
                    <div style={solutionStyle}>{q.answer}</div>
                  </details>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizReportProtected(props) {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <QuizReport {...props} />
    </ProtectedRoute>
  );
}

export default QuizReportProtected; 