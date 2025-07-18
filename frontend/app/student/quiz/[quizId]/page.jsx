"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getQuiz, submitQuiz } from '../../../../quiz/utils/api';
import { getStudentIdFromJWT, getToken } from '../../../../utils/auth';
import { BASE_API_URL } from '../../../../utils/apiurl';
import { latex2Html } from '../../../../quiz/utils/latex/latex2html';

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

export default function QuizAttemptStandalonePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params?.quizId || searchParams.get('quizId');
  const [isReady, setIsReady] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [palette, setPalette] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [isQuizActive, setIsQuizActive] = useState(true);

  const LS_KEY = quizId ? `quiz_attempt_${quizId}` : null;

  function saveAttemptState(state) {
    if (typeof window !== 'undefined' && LS_KEY) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }
  function loadAttemptState() {
    if (typeof window !== 'undefined' && LS_KEY) {
      try {
        return JSON.parse(localStorage.getItem(LS_KEY));
      } catch {}
    }
    return null;
  }

  useEffect(() => { if (quizId) setIsReady(true); }, [quizId]);
  useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getQuiz(quizId)
      .then(q => {
        if (q.status === 'completed') {
          if (typeof window !== 'undefined' && LS_KEY) localStorage.removeItem(LS_KEY);
          router.replace(`/student/quiz/report?quizId=${quizId}`);
          return;
        }
        let saved = loadAttemptState();
        let initialResponses = q.questions.map(q => ({ question: q._id, selectedOption: isSelectAllType(q) ? [] : '', timeSpent: 0, markedForReview: false }));
        let initialCurrent = 0;
        let initialPalette = q.questions.map(() => 'unattempted');
        let initialTimer = q.time * 60;
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
  }, [loading, timer, quiz]);

  useEffect(() => {
    if (!quiz) return;
    saveAttemptState({ responses, current, palette, timer, questionStartTime });
  }, [responses, current, palette, timer, questionStartTime, quiz]);

  useEffect(() => {
    if (!isQuizActive) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an ongoing quiz. If you refresh or close, your progress will be saved, but you may lose unsaved changes.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
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

  if (!isReady) return <div>Loading...</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!quiz) return null;
  if (showInfo) return <QuizInfoPage quiz={quiz} onStart={() => setShowInfo(false)} />;

  const q = quiz.questions[current];
  const resp = responses[current];
  function isSelectAllType(q) { return q.type && q.type.toLowerCase().includes('select'); }
  function updateTimeSpent(nextIdx) {
    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTime) / 1000);
    setResponses(prev => {
      const updated = [...prev];
      updated[current] = { ...updated[current], timeSpent: (updated[current].timeSpent || 0) + elapsed };
      return updated;
    });
    setQuestionStartTime(now);
    if (typeof nextIdx === 'number') setCurrent(nextIdx);
  }
  function handleOption(opt) {
    updateTimeSpent();
    setResponses(prev => {
      const updated = [...prev];
      if (isSelectAllType(q)) {
        const arr = Array.isArray(updated[current].selectedOption) ? updated[current].selectedOption : [];
        if (arr.includes(opt)) {
          updated[current].selectedOption = arr.filter(o => o !== opt);
        } else {
          updated[current].selectedOption = [...arr, opt];
        }
      } else {
        updated[current].selectedOption = opt;
      }
      return updated;
    });
    updatePalette(current, 'attempted');
  }
  function handleMarkReview() {
    setResponses(prev => {
      const updated = [...prev];
      updated[current].markedForReview = !updated[current].markedForReview;
      return updated;
    });
    updatePalette(current, 'review');
  }
  function updatePalette(idx, status) {
    setPalette(prev => {
      const updated = [...prev];
      updated[idx] = status;
      return updated;
    });
  }
  function handleNav(idx) { updateTimeSpent(idx); }
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const studentId = getStudentIdFromJWT();
      const token = getToken();
      const payload = {
        quizId,
        studentId,
        responses,
        timeSpent: quiz.time * 60 - timer,
      };
      await submitQuiz(payload, token);
      if (typeof window !== 'undefined' && LS_KEY) localStorage.removeItem(LS_KEY);
      router.replace(`/student/quiz/report?quizId=${quizId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  // --- UI Styles ---
  const mainStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  };
  const cardStyle = {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.10)',
    padding: '32px 28px',
    minWidth: 340,
    maxWidth: 900,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e0e7ef',
  };

  // Render quiz UI as before (palette, question, options, navigation, submit, etc.)
  return (
    <div style={mainStyle}>
      <div style={cardStyle}>
        {/* Render quiz UI here: palette, question, options, navigation, submit, etc. */}
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>Quiz Attempt</h1>
        {/* TODO: Render palette, question, options, navigation, submit, etc. */}
        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 16, fontSize: 20, lineHeight: 1.4 }}>
          {quiz && quiz.questions && quiz.questions[current] && (
            (() => { const html = latex2Html(quiz.questions[current].question); console.log('Rendered HTML:', html); return <span dangerouslySetInnerHTML={{ __html: html }} />; })()
          )}
        </div>
      </div>
    </div>
  );
} 