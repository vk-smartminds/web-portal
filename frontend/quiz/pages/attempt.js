"use client";
// Quiz Attempt Page (Student)


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { attemptQuiz } from '../utils/api';
import { SUBJECTS_BY_CLASS, CHAPTERS_BY_CLASS_SUBJECT, QUESTION_TYPE_MAP, ASSERTION_REASON_OPTIONS } from '../utils/content';
import { getStudentIdFromJWT } from '../../utils/auth';
import ProtectedRoute from '../../components/ProtectedRoute';
import axios from 'axios';
import { BASE_API_URL } from '../../utils/apiurl';

const questionTypes = [
  'Multiple Choice Questions',
  'Assertion and Reason Based Questions',
  'Select Response Questions',
];

// Utility to decode JWT and extract payload
function decodeJWT(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function QuizInstructions({ quizDetails, onStart }) {
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef', padding: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Quiz Details & Instructions</h2>
      <div style={{ marginBottom: 18 }}>
        <strong>Class:</strong> {quizDetails.class}<br />
        <strong>Subjects:</strong> {quizDetails.subjects.join(', ')}<br />
        <strong>Chapters:</strong> {quizDetails.chapters.join(', ')}<br />
        <strong>Types:</strong> {quizDetails.types.join(', ')}<br />
        <strong>Time:</strong> {quizDetails.time} minutes<br />
        <strong>Total Questions:</strong> {quizDetails.totalQuestions || 'N/A'}
      </div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontWeight: 600, fontSize: 20 }}>Instructions</h3>
        <ul style={{ marginLeft: 18, fontSize: 16 }}>
          <li>Read each question carefully before answering.</li>
          <li>There is only one correct answer for MCQ, and multiple for select-all.</li>
          <li>Use the palette to navigate between questions.</li>
          <li>Click 'Mark for Review' if you want to revisit a question later.</li>
          <li>Do not refresh or close the browser during the quiz.</li>
          <li>Click 'Submit' when you have completed the quiz.</li>
        </ul>
      </div>
      <button onClick={onStart} style={{ padding: '12px 32px', fontSize: 18, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Start Quiz</button>
    </div>
  );
}

function AttemptQuiz() {
  const [studentClass, setStudentClass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [time, setTime] = useState(30);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapterLoading, setChapterLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  const router = useRouter();

  // On mount, get student class and ID robustly from JWT or userData
  useEffect(() => {
    // Get JWT and decode studentId
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('jwt_token');
    }
    let payload = decodeJWT(token);
    let id = '';
    if (payload) {
      // Use _id or userId for MongoDB student
      id = payload._id || payload.userId || '';
    }
    setStudentId(id);
    // Debug log
    if (typeof window !== 'undefined') {
      console.log('Student MongoDB _id used for class fetch:', id, payload);
    }
    // Fetch class directly from backend using studentId
    async function fetchClass() {
      if (!id) {
        setError('No student ID found in your login session. Please log out and log in again.');
        return;
      }
      try {
        console.log('Fetching class for studentId:', id);
        const res = await fetch(`${BASE_API_URL}/student/class/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Could not fetch class');
        }
        const data = await res.json();
        console.log('Class fetch response:', data);
        let classValue = data.class || data.studentClass || '';
        // Only allow 6-12 (string), JEE, NEET, CUET
        const allowed = ['6','7','8','9','10','11','12','JEE','NEET','CUET'];
        if (allowed.includes(String(classValue))) {
          setStudentClass(String(classValue));
        } else {
          setStudentClass('');
          setError('Your class is not eligible for quiz. (class: ' + classValue + ')');
        }
      } catch (err) {
        setStudentClass('');
        setError('Could not fetch your class: ' + (err.message || 'Unknown error'));
      }
    }
    fetchClass();
  }, []);

  // Fetch subjects for the student's class (from content.js only)
  useEffect(() => {
    if (!studentClass) {
      setAvailableSubjects([]);   
      setSelectedSubjects([]);
      return;
    }
    setSubjectLoading(true);
    const subjects = SUBJECTS_BY_CLASS[studentClass] || [];
    setAvailableSubjects(subjects);
    setSelectedSubjects(subjects.length ? [] : []);
    setSubjectLoading(false);
  }, [studentClass]);

  // Fetch chapters from content.js whenever selectedSubjects changes
  useEffect(() => {
    setChapterLoading(true);
    let chaptersBySubject = {};
    for (const subject of selectedSubjects) {
      const chapters = (CHAPTERS_BY_CLASS_SUBJECT[studentClass] && CHAPTERS_BY_CLASS_SUBJECT[studentClass][subject]) || [];
      chaptersBySubject[subject] = chapters;
    }
    setAvailableChapters(chaptersBySubject);
    setChapterLoading(false);
  }, [selectedSubjects, studentClass]);

  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev => prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]);
  };

  // Helper: get selected chapters for a subject
  const getSelectedChaptersForSubject = (subject) => {
    return selectedChapters.filter(sel => sel.subject === subject).map(sel => sel.number);
  };

  // Handler: select/deselect all chapters for a subject
  const handleSelectAllChapters = (subject) => {
    const chapters = availableChapters[subject] || [];
    const allNumbers = chapters.map(ch => ch.number);
    const selectedForSubject = getSelectedChaptersForSubject(subject);
    const allSelected = allNumbers.length > 0 && allNumbers.every(num => selectedForSubject.includes(num));
    if (allSelected) {
      // Deselect all for this subject
      setSelectedChapters(prev => prev.filter(sel => sel.subject !== subject));
    } else {
      // Select all for this subject
      setSelectedChapters(prev => [
        ...prev.filter(sel => sel.subject !== subject),
        ...allNumbers.map(num => ({ subject, number: num }))
      ]);
    }
  };

  // Handler: select/deselect a chapter
  const handleChapterChange = (subject, chapterNumber) => {
    const exists = selectedChapters.some(sel => sel.subject === subject && sel.number === chapterNumber);
    if (exists) {
      setSelectedChapters(prev => prev.filter(sel => !(sel.subject === subject && sel.number === chapterNumber)));
    } else {  
      setSelectedChapters(prev => [...prev, { subject, number: chapterNumber }]);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      if (!studentClass) {
        setError('Class not found. Please log in again.');
        setLoading(false);
        return;
      }
      if (!selectedSubjects.length) {
        setError('No subjects available for your class.');
        setLoading(false);
        return;
      }
      if (!selectedChapters.length) {
        setError('Please select at least one chapter.');
        setLoading(false);
        return;
      }
      if (!selectedTypes.length) {
        setError('Please select at least one question type.');
        setLoading(false);
        return;
      }
      const data = {
        class: studentClass,
        subjects: selectedSubjects,
        chapters: selectedChapters
          .filter(sel => selectedSubjects.includes(sel.subject))
          .map(sel => sel.number),
        topics: [],
        types: selectedTypes.map(t => QUESTION_TYPE_MAP[t]),
        time: Number(time),
        studentId,
      };
      console.log('Quiz attempt payload:', data);
      // Extra check for empty fields
      if (
        !data.class ||
        !data.subjects.length ||
        !data.chapters.length ||
        !data.types.length ||
        !data.time ||
        !data.studentId
      ) {
        setError('Please fill all quiz selection fields.');
        setLoading(false);
        return;
      }
      const res = await attemptQuiz(data);
      console.log('Quiz attempt response:', res);
      if (res.quizId) {
        router.push(`/quiz/${res.quizId}`);
      } else {
        setError(res.error || 'Could not create quiz.');
      }
    } catch (err) {
      console.error('Quiz attempt error:', err);
      setError(err.message || 'No questions available for the selected filters.');
    } finally {
      setLoading(false);
    }
  };

  // --- Inline styles for VK Portal look ---
  // Modern, production-level centered card design
  const pageBg = {
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
    borderRadius: 24,
    boxShadow: '0 8px 40px 0 rgba(30,41,59,0.13)',
    padding: '44px 40px 36px 40px',
    minWidth: 600,
    maxWidth: 900,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: 'none',
    transition: 'box-shadow 0.2s',
  };
  const headingStyle = {
    fontSize: 26,
    fontWeight: 800,
    color: '#22223b',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'inherit',
  };
  const subTextStyle = {
    color: '#6c7280',
    fontSize: 15,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: 500,
    fontFamily: 'inherit',
  };
  const labelStyle = {
    fontWeight: 600,
    color: '#22223b',
    marginBottom: 4,
    fontSize: 15,
    fontFamily: 'inherit',
  };
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 16,
    marginBottom: 18,
    outline: 'none',
    background: '#f4f6fb',
    fontFamily: 'inherit',
    transition: 'border 0.2s',
  };
  const checkboxStyle = {
    marginRight: 8,
    accentColor: '#3b82f6',
    width: 16,
    height: 16,
    verticalAlign: 'middle',
    cursor: 'pointer',
  };
  const buttonStyle = {
    width: '100%',
    padding: '14px 0',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 18,
    marginTop: 18,
    border: 'none',
    background: 'linear-gradient(90deg, #3b82f6 60%, #6366f1 100%)',
    color: 'white',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
    letterSpacing: 0.2,
  };
  const errorStyle = {
    color: '#ef4444',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'inherit',
  };

  // Option rendering logic for MCQ and select-all
  function OptionButton({ type, checked, onClick, children }) {
    if (type === 'mcq') {
      return (
        <button
          type="button"
          className={`option-btn mcq ${checked ? 'selected' : ''}`}
          style={{
            borderRadius: '50%',
            border: checked ? '2px solid #0070f3' : '1px solid #ccc',
            width: 32,
            height: 32,
            marginRight: 12,
            background: checked ? '#e6f0fa' : '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: checked ? 'bold' : 'normal',
          }}
          onClick={onClick}
        >
          {children}
        </button>
      );
    }
    // select-all
    return (
      <button
        type="button"
        className={`option-btn select-all ${checked ? 'selected' : ''}`}
        style={{
          borderRadius: 6,
          border: checked ? '2px solid #0070f3' : '1px solid #ccc',
          width: 32,
          height: 32,
          marginRight: 12,
          background: checked ? '#e6f0fa' : '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: checked ? 'bold' : 'normal',
        }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (showInstructions && quizDetails) {
    return <QuizInstructions quizDetails={quizDetails} onStart={() => setShowInstructions(false)} />;
  }

  return (
    <div style={pageBg}>
      <div style={cardStyle}>
        <div style={headingStyle}>Attempt a Quiz</div>
        <div style={subTextStyle}>Select your preferences and start a new quiz</div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>Subjects</div>
            {subjectLoading ? (
              <div style={{ color: '#3b82f6', fontWeight: 500, fontSize: 15 }}>Loading subjects...</div>
            ) : (
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                {availableSubjects.length === 0 && (
                  <span style={{ color: '#64748b', fontSize: 15 }}>No subjects available for your class.</span>
                )}
                {availableSubjects.map(subject => (
                  <div key={subject} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject)}
                      onChange={() => handleSubjectChange(subject)}
                      id={`subject-${subject}`}
                    />
                    <label htmlFor={`subject-${subject}`} style={{ marginRight: 4 }}>{subject}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>Chapters</div>
            {/* Chapters: One card/column per selected subject, horizontally scrollable, with persistent selections */}
            {selectedSubjects.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 24,
                  marginBottom: 24,
                  overflowX: 'auto',
                  paddingBottom: 8,
                  borderBottom: '1px solid #e0e7ef',
                  maxWidth: '100%',
                }}
              >
                {selectedSubjects.map(subject => (
                  <div
                    key={subject}
                    style={{
                      minWidth: 220,
                      maxWidth: 260,
                      background: '#f8fafc',
                      borderRadius: 12,
                      padding: '16px 18px',
                      boxShadow: '0 2px 8px 0 #e0e7ff',
                      border: '1px solid #e0e7ef',
                      flex: '0 0 240px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 10, fontSize: 17, letterSpacing: 0.2 }}>
                      {subject}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={
                          (availableChapters[subject] || []).length > 0 &&
                          (availableChapters[subject] || []).every(ch => getSelectedChaptersForSubject(subject).includes(ch.number))
                        }
                        onChange={() => handleSelectAllChapters(subject)}
                        id={`selectAllChapters-${subject}`}
                      />
                      <label htmlFor={`selectAllChapters-${subject}`} style={{ marginLeft: 8, fontWeight: 600, fontSize: 14 }}>
                        Select All Chapters
                      </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(availableChapters[subject] || []).map(ch => (
                        <label key={ch.number} style={{ display: 'flex', alignItems: 'center', fontSize: 15 }}>
                          <input
                            type="checkbox"
                            checked={getSelectedChaptersForSubject(subject).includes(ch.number)}
                            onChange={() => handleChapterChange(subject, ch.number)}
                          />
                          <span style={{ marginLeft: 8 }}>{ch.number}. {ch.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>Question Types</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {questionTypes.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', fontWeight: 500, fontSize: 15, cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    style={checkboxStyle}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>Time (minutes)</div>
            <input
              type="number"
              min={5}
              max={120}
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ ...inputStyle, width: 120, display: 'inline-block' }}
            />
          </div>
          {error && <div style={errorStyle}>{error}</div>}
          <button
            type="submit"
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AttemptQuizProtected() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <AttemptQuiz />
    </ProtectedRoute>
  );
}

export default AttemptQuizProtected;
