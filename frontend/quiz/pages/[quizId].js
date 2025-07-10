// Quiz Attempt Page (per quiz)
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getQuiz, submitQuiz } from '../utils/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getStudentIdFromJWT } from '../../utils/auth';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { BASE_API_URL } from '../../utils/apiurl';

// --- Palette Color Helpers ---
const paletteColor = s => s === 'attempted' ? '#22c55e' : s === 'review' ? '#eab308' : '#cbd5e1';
const paletteBorder = s => s === 'attempted' ? '#22c55e' : s === 'review' ? '#eab308' : '#cbd5e1';
const paletteText = s => s === 'attempted' ? '#fff' : s === 'review' ? '#fff' : '#64748b';

function QuizInfoPage({ quiz, onStart }) {
  if (!quiz) return null;
  const subjects = Array.isArray(quiz.subjects) ? quiz.subjects : [];
  const chaptersBySubject = quiz.chaptersBySubject || {};
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Quiz Details & Instructions</h2>
      <div style={{ marginBottom: 18 }}>
        <strong>Title:</strong> {quiz.title || 'Quiz'}<br />
        <strong>Class:</strong> {quiz.class}<br />
        <strong>Subjects & Chapters:</strong>
        <ul style={{ marginLeft: 18, fontSize: 16 }}>
          {subjects.map(subj => (
            <li key={subj}><b>{subj}:</b> {Array.isArray(chaptersBySubject[subj]) && chaptersBySubject[subj].length ? chaptersBySubject[subj].join(', ') : 'N/A'}</li>
          ))}
        </ul>
        <strong>Time:</strong> {quiz.time} minutes<br />
        <strong>Total Questions:</strong> {quiz.questions?.length || 'N/A'}
      </div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontWeight: 600, fontSize: 20 }}>Instructions</h3>
        <ul style={{ marginLeft: 18, fontSize: 16 }}>
          <li>Read each question carefully before answering.</li>
          <li>There is only one correct answer for MCQ, and multiple for select-all.</li>
          <li>Use the palette to navigate between questions.</li>
          <li>Click 'Mark for Review' if you want to revisit a question later.</li>
          <li>Do not refresh or close the browser during the quiz.</li>
          <li>Click 'Finish Quiz' when you have completed the quiz.</li>
        </ul>
      </div>
      <button onClick={onStart} style={{ padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Start Quiz</button>
    </div>
  );
}

function QuizAttemptPage() {
  const router = useRouter();
  const { quizId } = router.query;
  const [isReady, setIsReady] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [palette, setPalette] = useState([]); // attempted, review, unattempted
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [isQuizActive, setIsQuizActive] = useState(true); // Track if quiz is still active
  const [jwt, setJwt] = useState(null);

  // --- Local Storage Key ---
  const LS_KEY = quizId ? `quiz_attempt_${quizId}` : null;

  // Helper to save all relevant state to localStorage
  function saveAttemptState(state) {
    if (typeof window !== 'undefined' && LS_KEY) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }

  // Helper to load all relevant state from localStorage
  function loadAttemptState() {
    if (typeof window !== 'undefined' && LS_KEY) {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY));
      } catch {}
    }
    return null;
  }

  useEffect(() => {
    if (router.isReady && quizId) {
      setIsReady(true);
    }
  }, [router.isReady, quizId]);

  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getQuiz(quizId)
      .then(q => {
        // If quiz is already completed, redirect to report and clear localStorage
        if (q.status === 'completed') {
          if (typeof window !== 'undefined' && LS_KEY) {
            localStorage.removeItem(LS_KEY);
          }
          router.replace(`/report?quizId=${quizId}`);
          return;
        }
        // Try to load all state from localStorage
        let saved = loadAttemptState();
        let initialResponses = q.questions.map(q => ({ question: q._id, selectedOption: isSelectAllType(q) ? [] : '', timeSpent: 0, markedForReview: false }));
        let initialCurrent = 0;
        let initialPalette = q.questions.map(() => 'unattempted');
        let initialTimer = q.time * 60; // seconds
        let initialQuestionStartTime = Date.now();
        if (saved && Array.isArray(saved.responses) && saved.responses.length === q.questions.length) {
          initialResponses = saved.responses;
          initialCurrent = typeof saved.current === 'number' ? saved.current : 0;
          initialPalette = Array.isArray(saved.palette) && saved.palette.length === q.questions.length ? saved.palette : initialPalette;
          initialTimer = typeof saved.timer === 'number' ? saved.timer : initialTimer;
          initialQuestionStartTime = typeof saved.questionStartTime === 'number' ? saved.questionStartTime : Date.now();
        }
        setQuiz(q);
        setResponses(initialResponses);
        setCurrent(initialCurrent);
        setPalette(initialPalette);
        setTimer(initialTimer);
        setQuestionStartTime(initialQuestionStartTime);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isReady, quizId]);

  useEffect(() => {
    if (!isReady) return;
    const id = getStudentIdFromJWT();
    if (!id) return;
    // Debug: Log student ID and JWT payload
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      console.log('DEBUG [quizId].js] Student ID:', id, 'JWT payload:', payload);
    }
    axios.get(`${BASE_API_URL}/student/${id}`)
      .then(res => setStudentProfile(res.data))
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setStudentProfile({ error: true, message: 'Student profile not found. Please log out and register/login again.' });
        } else {
          setStudentProfile({ error: true, message: 'Failed to fetch student profile.' });
        }
      });
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    setJwt(getToken());
    console.log('DEBUG [quizId].js] JWT token on mount (useEffect):', getToken());
  }, [isReady]);

  // Timer countdown
  useEffect(() => {
    if (loading || !timer || quiz?.status === 'completed') return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [loading, timer, quiz]);

  // Save all relevant state to localStorage on every change
  useEffect(() => {
    if (!quiz) return;
    saveAttemptState({
      responses,
      current,
      palette,
      timer,
      questionStartTime,
    });
  }, [responses, current, palette, timer, questionStartTime, quiz]);

  // Block browser navigation (back/forward) during quiz attempt, but allow refresh/close with warning
  useEffect(() => {
    if (!isQuizActive) return;
    const handleBeforeUnload = (e) => {
      // Show a warning, but allow refresh/close
      e.preventDefault();
      e.returnValue = 'You have an ongoing quiz. If you refresh or close, your progress will be saved, but you may lose unsaved changes.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Block browser back/forward navigation
    const handlePopState = (e) => {
      const confirmLeave = window.confirm('You have an ongoing quiz. Please submit or finish the quiz before leaving.\n\nAre you sure you want to leave? Your progress may be lost.');
      if (!confirmLeave) {
        window.history.pushState(null, '', window.location.href);
      } else {
        setIsQuizActive(false);
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isQuizActive]);

  if (!isReady) {
    return <div>Loading...</div>;
  }
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!quiz) return null;

  if (showInfo) {
    return <QuizInfoPage quiz={quiz} onStart={() => setShowInfo(false)} />;
  }

  const q = quiz.questions[current];
  const resp = responses[current];

  function updateTimeSpent(nextIdx) {
    // Calculate time spent on current question
    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTime) / 1000); // seconds
    setResponses(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], timeSpent: (updated[current].timeSpent || 0) + elapsed };
      return updated;
    });
    setQuestionStartTime(now);
    if (typeof nextIdx === 'number') setCurrent(nextIdx);
  }

  function isSelectAllType(q) {
    // Adjust this check as per your type naming
    return q.type && q.type.toLowerCase().includes('select');
  }

  function handleOption(opt) {
    updateTimeSpent();
    setResponses(prev => {
      const newResp = [...prev];
      // Map option text to letter
      const optIdx = q.options.indexOf(opt);
      const optLetter = String.fromCharCode(97 + optIdx); // 0 -> 'a', 1 -> 'b', etc.
      if (isSelectAllType(q)) {
        // Toggle option in array
        let arr = Array.isArray(newResp[current].selectedOption) ? [...newResp[current].selectedOption] : [];
        if (arr.includes(optLetter)) {
          arr = arr.filter(o => o !== optLetter);
        } else {
          arr = [...arr, optLetter];
        }
        newResp[current] = { ...newResp[current], selectedOption: arr };
      } else {
        newResp[current] = { ...newResp[current], selectedOption: [optLetter] };
      }
      return newResp;
    });
    updatePalette(current, 'attempted');
  }

  function handleMarkReview() {
    updateTimeSpent();
    setResponses(prev => {
      const newResp = [...prev];
      newResp[current] = { ...newResp[current], markedForReview: !newResp[current].markedForReview };
      return newResp;
    });
    updatePalette(current, responses[current].markedForReview ? (responses[current].selectedOption ? 'attempted' : 'unattempted') : 'review');
  }

  function updatePalette(idx, status) {
    setPalette(prev => {
      const newPalette = [...prev];
      newPalette[idx] = status;
      return newPalette;
    });
  }

  function handleNav(idx) {
    updateTimeSpent(idx);
  }

  async function handleSubmit() {
    if (submitting) return;
    updateTimeSpent();
    setSubmitting(true);
    try {
      await submitQuiz(quizId, responses);
      if (typeof window !== 'undefined' && LS_KEY) {
        localStorage.removeItem(LS_KEY);
      }
      setIsQuizActive(false); // Allow navigation after submit
      router.replace(`/report?quizId=${quizId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // --- UI/UX Styles ---
  const mainAreaStyle = {
    flex: 1,
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '48px 0 32px 0',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  };
  const questionBlockStyle = {
    width: '100%',
    maxWidth: 700,
    margin: '0 auto',
    background: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    padding: '0 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  };
  const qTextStyle = {
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 16,
    fontSize: 20,
    lineHeight: 1.4,
  };
  const optButtonStyle = (selected) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '14px 18px',
    borderRadius: 10,
    border: `2px solid ${selected ? '#3b82f6' : '#e0e7ef'}`,
    background: selected ? '#dbeafe' : '#f1f5f9',
    color: selected ? '#1d4ed8' : '#334155',
    fontWeight: 500,
    fontSize: 16,
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });
  const navButtonStyle = (active) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: paletteColor(active),
    color: paletteText(active),
    border: `2px solid ${paletteBorder(active)}`,
    fontWeight: 700,
    fontSize: 15,
    marginRight: 8,
    marginBottom: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });
  const markButtonStyle = (marked) => ({
    padding: '8px 18px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    background: marked ? '#eab308' : 'white',
    color: marked ? 'white' : '#eab308',
    border: `2px solid #eab308`,
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });
  const prevButtonStyle = {
    padding: '10px 24px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    background: '#e0e7ef',
    color: '#334155',
    border: 'none',
    marginRight: 8,
    cursor: 'pointer',
  };
  const nextButtonStyle = {
    padding: '10px 24px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    marginLeft: 8,
    cursor: 'pointer',
  };
  const finishButtonStyle = {
    ...nextButtonStyle,
    background: '#22c55e',
    marginLeft: 8,
  };
  // --- Right Panel ---
  const rightPanelStyle = {
    width: 320,
    minWidth: 260,
    maxWidth: 340,
    background: '#fff',
    borderLeft: '1px solid #e0e7ef',
    boxShadow: '0 0 24px 0 rgba(30,41,59,0.06)',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  };
  const statLabel = { fontSize: 14, color: '#64748b', fontWeight: 500 };
  const statValue = { fontSize: 18, fontWeight: 700, color: '#22223b', marginBottom: 8 };
  // --- Main Layout ---
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 600 }}>Loading...</div>;
  if (error) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 600 }}>{error}</div>;
  if (!quiz) return null;

  // --- Quiz Stats ---
  const total = quiz.questions.length;
  const attempted = responses.filter(r => (Array.isArray(r.selectedOption) ? r.selectedOption.length > 0 : !!r.selectedOption)).length;
  const marked = responses.filter(r => r.markedForReview).length;
  const unanswered = total - attempted;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: '#f8fafc' }}>
      {/* Main Question Area */}
      <div style={mainAreaStyle}>
        <div style={questionBlockStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#22223b', letterSpacing: 0.2 }}>Quiz In Progress</div>
            <div style={{ ...statValue, background: '#e0e7ef', borderRadius: 8, padding: '4px 16px', fontFamily: 'monospace', fontSize: 20 }}>{Math.floor(timer/60).toString().padStart(2,'0')}:{(timer%60).toString().padStart(2,'0')}</div>
          </div>
          <div style={{ ...qTextStyle, marginBottom: 18 }}>Q{current+1}. {q.question}</div>
          <div style={{ marginBottom: 18 }}>
            {q.options.map((opt, i) => {
              // Map index to letter
              const optLetter = String.fromCharCode(97 + i);
              const isSelected = isSelectAllType(q)
                ? Array.isArray(resp.selectedOption) && resp.selectedOption.includes(optLetter)
                : Array.isArray(resp.selectedOption) && resp.selectedOption[0] === optLetter;
              return (
                <button
                  key={i}
                  style={optButtonStyle(isSelected)}
                  onClick={() => handleOption(opt)}
                >
                  {opt}
                  {isSelectAllType(q) && (
                    <span style={{ marginLeft: 8, fontSize: 13, color: '#64748b' }}>
                      {isSelected ? '✓' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button type="button" style={markButtonStyle(resp.markedForReview)} onClick={handleMarkReview}>{resp.markedForReview?'Unmark Review':'Mark for Review'}</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button type="button" style={prevButtonStyle} disabled={current===0} onClick={()=>setCurrent(c=>c-1)}>Previous</button>
            {current < quiz.questions.length-1 ? (
              <button type="button" style={nextButtonStyle} onClick={()=>setCurrent(c=>c+1)}>Next</button>
            ) : (
              <button type="button" style={finishButtonStyle} onClick={handleSubmit} disabled={submitting}>{submitting?'Submitting...':'Finish Quiz'}</button>
            )}
          </div>
        </div>
      </div>
      {/* Right Info Panel */}
      <div style={rightPanelStyle}>
        {/* Student Info */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#2563eb', marginBottom: 2 }}>Student Info</div>
          {studentProfile && studentProfile.error ? (
            <div style={{ color: 'red', fontWeight: 600, marginBottom: 16 }}>{studentProfile.message}</div>
          ) : studentProfile ? (
            <>
              <img
                src={studentProfile.profilePhotoUrl || '/default-avatar.png'}
                alt="Profile"
                style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 8, border: '2px solid #eee' }}
              />
              <div style={{ fontSize: 15, color: '#22223b', fontWeight: 600 }}>{studentProfile.name || 'Student Name'}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }}>Class: {studentProfile.class || quiz.class}</div>
            </>
          ) : (
            <div>Loading profile...</div>
          )}
        </div>
        {/* Quiz Stats */}
        <div style={{ marginBottom: 24 }}>
          <div style={statLabel}>Total Questions</div>
          <div style={statValue}>{total}</div>
          <div style={statLabel}>Attempted</div>
          <div style={statValue}>{attempted}</div>
          <div style={statLabel}>Unanswered</div>
          <div style={statValue}>{unanswered}</div>
          <div style={statLabel}>Marked for Review</div>
          <div style={statValue}>{marked}</div>
        </div>
        {/* Palette */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#22223b', marginBottom: 8 }}>Question Palette</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {palette.map((s, i) => (
              <button
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: paletteColor(s),
                  color: paletteText(s),
                  border: `2px solid ${paletteBorder(s)}`,
                  fontWeight: 700,
                  fontSize: 15,
                  margin: 0,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => handleNav(i)}
              >
                {i+1}
              </button>
            ))}
          </div>
          {/* Palette Legend */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 13, color: '#64748b', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e', display: 'inline-block', border: '2px solid #22c55e' }}></span>Attempted</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#eab308', display: 'inline-block', border: '2px solid #eab308' }}></span>Review</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 14, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block', border: '2px solid #cbd5e1' }}></span>Unvisited</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizAttemptPageProtected() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <QuizAttemptPage />
    </ProtectedRoute>
  );
}

export default QuizAttemptPageProtected;
