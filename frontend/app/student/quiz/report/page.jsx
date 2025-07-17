"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getQuiz } from '../../../../quiz/utils/api';

export default function QuizReportStandalonePage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get('quizId');
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // FIX: Declare showSolutionArr state and effect BEFORE any early returns
  const [showSolutionArr, setShowSolutionArr] = useState([]);
  useEffect(() => {
    if (quiz && Array.isArray(quiz.questions)) {
      setShowSolutionArr(Array(quiz.questions.length).fill(false));
    }
  }, [quiz]);

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    getQuiz(quizId)
      .then(setQuiz)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId]);

  // --- UI Styles ---
  const mainStyle = {
    minHeight: '100vh',
    width: '100vw',
    background: '#f6f8fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    padding: '32px 0',
  };
  const cardStyle = {
    background: 'white',
    borderRadius: 18,
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.10)',
    padding: '40px 32px',
    minWidth: 320,
    maxWidth: 1400,
    width: '98vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e0e7ef',
  };
  const headingStyle = {
    fontSize: 44,
    fontWeight: 900,
    color: '#111',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 1.1,
  };
  const subTextStyle = {
    color: '#64748b',
    fontSize: 22,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 500,
    lineHeight: 1.2,
  };
  // --- Stats Row ---
  const statsRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16, // Reduced from 40 to 16 for closer spacing
    margin: '0 0 24px 0', // Reduced bottom margin
    width: '100%',
    fontSize: 22,
    fontWeight: 700,
  };
  const scoreStatStyle = {
    fontWeight: 900,
    fontSize: 38,
    color: '#111',
    textAlign: 'center',
    letterSpacing: 0.5,
    minWidth: 120, // reduced from 180
    marginRight: 8, // reduced from 18
  };
  const statStyle = {
    fontWeight: 700,
    fontSize: 22,
    color: '#334155',
    textAlign: 'center',
    minWidth: 80, // reduced from 140
    marginRight: 6, // reduced from 10
  };
  const statCorrect = { ...statStyle, color: '#22c55e' };
  const statIncorrect = { ...statStyle, color: '#ef4444' };
  const statUnattempted = { ...statStyle, color: '#eab308' };
  const statTime = { ...statStyle, color: '#2563eb' };
  // --- Question Block ---
  const qBlockStyle = {
    width: '100%',
    borderRadius: 18,
    border: '1.5px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.08)',
    margin: '0 auto 48px auto',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    maxWidth: 1200,
    minWidth: 0,
  };
  // --- Question Row ---
  const qRowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    gap: 32,
    marginBottom: 12,
    flexWrap: 'wrap',
  };
  const qTextStyle = {
    fontWeight: 900,
    color: '#1e293b',
    fontSize: 26,
    letterSpacing: 0.1,
    textAlign: 'left',
    lineHeight: 1.25,
    flex: 2,
    minWidth: 0,
    marginBottom: 0,
  };
  const qMetaPillStyle = {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 16,
    padding: '6px 18px',
    marginBottom: 0,
    marginTop: 0,
    letterSpacing: 0.1,
  };
  // --- Option ---
  const optionRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '420px',
    maxWidth: '100%',
    background: '#f8fafc',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    padding: '10px 18px',
    marginBottom: 10,
    fontSize: 17,
    color: '#334155',
    fontWeight: 600,
    transition: 'background 0.2s, border 0.2s',
    minHeight: 36,
    cursor: 'pointer',
    boxShadow: '0 1px 4px 0 #e0e7ef',
  };
  const optionRowHoverStyle = {
    background: '#e0e7ef',
    border: '1.5px solid #cbd5e1',
  };
  const optionTextStyle = {
    flex: 1,
    textAlign: 'left',
    color: '#334155',
    fontWeight: 600,
    fontSize: 17,
    letterSpacing: 0.1,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
  const optionLetterStyle = {
    fontWeight: 900,
    color: '#64748b',
    fontSize: 16,
    marginRight: 10,
    minWidth: 22,
    display: 'inline-block',
    textAlign: 'center',
    textTransform: 'uppercase',
  };
  const iconCircleStyle = (color) => ({
    marginLeft: 18,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: color === 'green' ? '#bbf7d0' : '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 900,
    boxShadow: '0 1px 4px 0 #e0e7ef',
  });
  const correctIcon = <span style={iconCircleStyle('green')}>✅</span>;
  const wrongIcon = <span style={iconCircleStyle('red')}>❌</span>;
  // --- Right Info ---
  const answerCardStyle = {
    width: '100%',
    background: '#f8fafc',
    borderRadius: 14,
    boxShadow: '0 2px 8px 0 #e0e7ef',
    padding: '18px 18px 12px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  };
  const answerLabelStyle = {
    fontWeight: 700,
    color: '#334155',
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'left',
  };
  const answerValueStyle = {
    fontWeight: 900,
    color: '#16a34a',
    fontSize: 18,
    marginLeft: 8,
    textAlign: 'left',
  };
  const wrongAnswerValueStyle = {
    ...answerValueStyle,
    color: '#dc2626',
  };
  const timeStyle = {
    fontSize: 15,
    color: '#64748b',
    fontWeight: 700,
    textAlign: 'left',
    marginBottom: 2,
  };
  const solutionLinkStyle = {
    color: '#2563eb',
    fontWeight: 700,
    fontSize: 15,
    marginTop: 8,
    cursor: 'pointer',
    textDecoration: 'underline',
    textAlign: 'left',
    display: 'inline-block',
    border: 'none',
    background: 'none',
    padding: 0,
  };
  const solutionBoxStyle = {
    background: '#f1f5f9',
    borderRadius: 10,
    padding: 14,
    marginTop: 0,
    fontSize: 15,
    color: '#334155',
    whiteSpace: 'pre-line',
    boxShadow: '0 2px 8px 0 #e0e7ef',
    textAlign: 'left',
    width: '100%',
  };
  // --- Explanation Label ---
  const explanationLabelStyle = {
    color: '#2563eb',
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'left',
    display: 'block',
  };

  if (loading) return <div style={mainStyle}><div style={cardStyle}>Loading...</div></div>;
  if (error) return <div style={mainStyle}><div style={cardStyle}>{error}</div></div>;
  if (!quiz) return null;

  // Calculate total time spent
  const totalTime = (quiz.responses || []).reduce((sum, r) => sum + (r.timeSpent || 0), 0);

  return (
    <div style={mainStyle}>
      <div style={cardStyle}>
        <div style={headingStyle}>Quiz Report</div>
        <div style={subTextStyle}>See your quiz results and solutions</div>
        {/* --- Stats Row --- */}
        <div style={statsRowStyle}>
          <span style={scoreStatStyle}>Score: {quiz.correct} / {quiz.questions.length}</span>
          <span style={statCorrect}>Correct: {quiz.correct}</span>
          <span style={statIncorrect}>Incorrect: {quiz.incorrect}</span>
          <span style={statUnattempted}>Unattempted: {quiz.unattempted}</span>
          <span style={statTime}>Time: {totalTime}s</span>
        </div>
        {/* --- Questions --- */}
        <div style={{ width: '100%' }}>
          {quiz.questions.map((q, i) => {
            // DO NOT declare useState or useEffect here!
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
            // For each option, determine if it's correct, selected, or wrong
            // --- Option Letters ---
            return (
              <div key={q._id} style={qBlockStyle}>
                <div style={qTextStyle}>Q{i+1}. {q.question}</div>
                {/* --- Topics and Difficulty --- */}
                <div style={{ margin: '6px 0 12px 0', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={qMetaPillStyle}>
                    <b>Topics:</b> {q.topics && q.topics.length ? q.topics.join(', ') : '-'}
                  </span>
                  <span style={qMetaPillStyle}>
                    <b>Difficulty:</b> {q.difficulty || '-'}
                  </span>
                  <span style={qMetaPillStyle}>
                    <b>Bloom's:</b> {q.bloomsTaxonomy || '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Remove 'Unattempted' badge from the left completely */}
                    {q.options.map((opt, idx) => {
                      // --- Robust, case-insensitive matching for correct option ---
                      const correct = correctOpt.some(cOpt => {
                        // If correct option is a letter (A/B/C/D), match by index
                        if (typeof cOpt === 'string' && cOpt.length === 1 && /[a-zA-Z]/.test(cOpt)) {
                          return idx === (cOpt.toLowerCase().charCodeAt(0) - 97);
                        }
                        // Otherwise, match by value (case-insensitive)
                        return String(cOpt).toLowerCase() === String(opt).toLowerCase();
                      });
                      const optLetterLower = String.fromCharCode(97 + idx);
                      const optionLetter = String.fromCharCode(65 + idx);
                      // selectedOpt may contain letters or values, so check all possibilities
                      const selected = selectedOpt.some(sel => {
                        if (typeof sel === 'string' && sel.length === 1 && /[a-zA-Z]/.test(sel)) {
                          // Letter match
                          return sel.toLowerCase() === optLetterLower;
                        }
                        // Value match (case-insensitive)
                        return String(sel).toLowerCase() === String(opt).toLowerCase();
                      });
                      // --- VK Portal coloring logic (final fix) ---
                      let style = {
                        display: 'inline-block',
                        width: '420px',
                        maxWidth: '100%',
                        padding: '10px 18px',
                        borderRadius: 16,
                        border: '2px solid #e0e7ef',
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: 500,
                        fontSize: 16,
                        marginRight: 8,
                        marginBottom: 10,
                        transition: 'background 0.2s, border 0.2s',
                      };
                      if (correct) {
                        // Correct is always green, even if selected or unattempted
                        style.background = '#e6fbe8';
                        style.color = '#15803d';
                        style.border = '2px solid #22c55e';
                      } else if (selected) {
                        // Only non-correct selected is red
                        style.background = '#fde8e8';
                        style.color = '#b91c1c';
                        style.border = '2px solid #ef4444';
                      }
                      return (
                        <span key={idx} style={style}>
                          <span style={{ fontWeight: 900, color: '#64748b', fontSize: 15, marginRight: 10, minWidth: 22, display: 'inline-block', textAlign: 'center', textTransform: 'uppercase' }}>{optionLetter}</span>
                          {opt}
                          {correct && (
                            <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 18, marginLeft: 8 }}>✔</span>
                          )}
                          {!correct && selected && (
                            <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 18, marginLeft: 8 }}>✖</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ flex: 1, minWidth: 220, maxWidth: 400, marginLeft: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%', background: '#fff', boxShadow: 'none', border: 'none', padding: 0 }}>
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', padding: 0 }}>
                      <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>
                        <span style={{ color: '#222', fontWeight: 600 }}>Your Answer: </span>
                        <span
                          style={
                            (!resp ||
                              !selectedOpt.length ||
                              selectedOpt.every(
                                sel =>
                                  sel === undefined ||
                                  sel === null ||
                                  sel === '' ||
                                  sel === false ||
                                  (typeof sel === 'number' && sel === 0)
                              ))
                              ? {
                                  color: '#b45309', // Mustard yellow
                                  background: '#fef9c3',
                                  borderRadius: 8,
                                  padding: '2px 10px',
                                  fontWeight: 600,
                                  fontSize: 16,
                                  minWidth: 100,
                                  display: 'inline-block',
                                }
                              : {
                                  color: isCorrect ? '#22c55e' : '#ef4444',
                                  fontWeight: 600,
                                  fontSize: 16,
                                  minWidth: 100,
                                  display: 'inline-block',
                                }
                          }
                        >
                          {(!resp ||
                            !selectedOpt.length ||
                            selectedOpt.every(
                              sel =>
                                sel === undefined ||
                                sel === null ||
                                sel === '' ||
                                sel === false ||
                                (typeof sel === 'number' && sel === 0)
                            ))
                            ? 'Unattempted'
                            : selectedOpt
                                .map(sel => {
                                  let idx = -1;
                                  if (typeof sel === 'string' && sel.length === 1 && /[a-zA-Z]/.test(sel)) {
                                    idx = sel.toLowerCase().charCodeAt(0) - 97;
                                  } else {
                                    idx = q.options.findIndex(o => String(o).toLowerCase() === String(sel).toLowerCase());
                                  }
                                  if (idx >= 0 && q.options[idx]) {
                                    return String.fromCharCode(65 + idx); // Only show the letter
                                  } else if (typeof sel === 'string' && sel.length === 1 && /[a-zA-Z]/.test(sel)) {
                                    return sel.toUpperCase();
                                  } else {
                                    return '';
                                  }
                                })
                                .filter(Boolean)
                                .join(', ')}
                          {selectedOpt.length && isCorrect && !(
                            !resp ||
                            !selectedOpt.length ||
                            selectedOpt.every(
                              sel =>
                                sel === undefined ||
                                sel === null ||
                                sel === '' ||
                                sel === false ||
                                (typeof sel === 'number' && sel === 0)
                            )
                          ) && <span style={{ color: '#22c55e', fontWeight: 900, marginLeft: 6 }}>✔</span>}
                        </span>
                      </div>
                      <div style={{ ...timeStyle, marginBottom: 16 }}>Time Spent: {resp?.timeSpent ? `${resp.timeSpent}s` : 'N/A'}</div>
                      {/* Remove Solution/Explanation heading and box, just show solution link */}
                      <button
                        style={{
                          color: '#2563eb',
                          background: 'none',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: 'pointer',
                          padding: 0,
                          marginBottom: 8,
                          textAlign: 'left',
                        }}
                        onClick={() => setShowSolutionArr(arr => arr.map((v, idx) => idx === i ? !v : v))}
                      >
                        {showSolutionArr[i] ? 'Hide Solution' : 'Show Solution'}
                      </button>
                      {showSolutionArr[i] && (
                        <div style={{ ...solutionBoxStyle, background: '#f6f8fa', border: 'none', boxShadow: 'none' }}>{q.solution || q.answer}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 