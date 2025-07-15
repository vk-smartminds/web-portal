"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { attemptQuiz } from '../../../../quiz/utils/api';
import { SUBJECTS_BY_CLASS, CHAPTERS_BY_CLASS_SUBJECT, QUESTION_TYPE_MAP } from '../../../../quiz/utils/content';
import DashboardCommon from '../../../../pages/DashboardCommon';
import Sidebar from '../../../../components/Sidebar';
import { BASE_API_URL } from '../../../../utils/apiurl';

const questionTypes = [
  'Multiple Choice Questions',
  'Assertion and Reason Based Questions',
  'Select Response Questions',
];

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

  useEffect(() => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('jwt_token');
    }
    let payload = decodeJWT(token);
    let id = '';
    if (payload) {
      id = payload._id || payload.userId || '';
    }
    setStudentId(id);
    async function fetchClass() {
      if (!id) {
        setError('No student ID found in your login session. Please log out and log in again.');
        return;
      }
      try {
        const res = await fetch(`${BASE_API_URL}/student/class/${id}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Could not fetch class');
        }
        const data = await res.json();
        let classValue = data.class || data.studentClass || '';
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

  const getSelectedChaptersForSubject = (subject) => {
    return selectedChapters.filter(sel => sel.subject === subject).map(sel => sel.number);
  };

  const handleSelectAllChapters = (subject) => {
    const chapters = availableChapters[subject] || [];
    const allNumbers = chapters.map(ch => ch.number);
    const selectedForSubject = getSelectedChaptersForSubject(subject);
    const allSelected = allNumbers.length > 0 && allNumbers.every(num => selectedForSubject.includes(num));
    if (allSelected) {
      setSelectedChapters(prev => prev.filter(sel => sel.subject !== subject));
    } else {
      setSelectedChapters(prev => [
        ...prev.filter(sel => sel.subject !== subject),
        ...allNumbers.map(num => ({ subject, number: num }))
      ]);
    }
  };

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
      const res = await attemptQuiz(data);
      if (res.quizId) {
        router.push(`/student/quiz/attempt/${res.quizId}`);
      } else {
        setError(res.error || 'Could not create quiz.');
      }
    } catch (err) {
      setError(err.message || 'No questions available for the selected filters.');
    } finally {
      setLoading(false);
    }
  };

  // --- Inline styles for VK Portal look ---
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
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(30,41,59,0.10)',
    padding: '32px 28px',
    minWidth: 340,
    maxWidth: 820,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e0e7ef',
  };
  const headingStyle = {
    fontSize: 22,
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  };
  const subTextStyle = {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 18,
    textAlign: 'center',
  };
  const labelStyle = {
    fontWeight: 600,
    color: '#22223b',
    marginBottom: 4,
    fontSize: 14,
    fontFamily: 'inherit',
  };
  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginBottom: 14,
    outline: 'none',
    background: '#f4f6fb',
    fontFamily: 'inherit',
    transition: 'border 0.2s',
  };
  const checkboxStyle = {
    marginRight: 6,
    accentColor: '#3b82f6',
    width: 14,
    height: 14,
    verticalAlign: 'middle',
    cursor: 'pointer',
  };
  const chapterCardStyle = {
    minWidth: 160,
    maxWidth: 200,
    background: '#f8fafc',
    borderRadius: 10,
    padding: '10px 12px',
    boxShadow: '0 1px 4px 0 #e0e7ff',
    border: '1px solid #e0e7ef',
    flex: '0 0 180px',
    marginRight: 10,
    marginBottom: 8,
  };
  const chapterTitleStyle = {
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: 6,
    fontSize: 13,
    letterSpacing: 0.2,
  };
  const selectAllStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 600,
  };
  const chapterCheckboxStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    marginBottom: 4,
  };
  const buttonStyle = {
    width: 'auto',
    minWidth: 120,
    padding: '10px 24px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    marginTop: 18,
    border: 'none',
    background: 'linear-gradient(90deg, #3b82f6 60%, #6366f1 100%)',
    color: 'white',
    boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
    letterSpacing: 0.2,
    alignSelf: 'flex-end',
  };
  const errorStyle = {
    color: '#ef4444',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'inherit',
  };

  if (showInstructions && quizDetails) {
    return <QuizInstructions quizDetails={quizDetails} onStart={() => setShowInstructions(false)} />;
  }

  return (
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
            {selectedSubjects.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 16,
                  overflowX: 'auto',
                  paddingBottom: 4,
                  borderBottom: '1px solid #e0e7ef',
                  maxWidth: '100%',
                }}
              >
                {selectedSubjects.map(subject => (
                  <div
                    key={subject}
                    style={chapterCardStyle}
                  >
                    <div style={chapterTitleStyle}>{subject}</div>
                    <div style={selectAllStyle}>
                      <input
                        type="checkbox"
                        checked={
                          (availableChapters[subject] || []).length > 0 &&
                          (availableChapters[subject] || []).every(ch => getSelectedChaptersForSubject(subject).includes(ch.number))
                        }
                        onChange={() => handleSelectAllChapters(subject)}
                        id={`selectAllChapters-${subject}`}
                        style={checkboxStyle}
                      />
                      <label htmlFor={`selectAllChapters-${subject}`}>Select All</label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {(availableChapters[subject] || []).map(ch => (
                        <label key={ch.number} style={chapterCheckboxStyle}>
                          <input
                            type="checkbox"
                            checked={getSelectedChaptersForSubject(subject).includes(ch.number)}
                            onChange={() => handleChapterChange(subject, ch.number)}
                            style={checkboxStyle}
                          />
                          <span style={{ marginLeft: 6 }}>{ch.number}. {ch.name}</span>
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
            <div style={labelStyle}>Time <span style={{ fontSize: '12px', color: '#64748b' }}>(minutes)</span></div>
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
  );
}

function AttemptQuizPageWrapper() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse events (simulate via local state or context if needed)
  // For now, we assume Sidebar can accept a prop or callback to notify collapse state

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'margin 0.3s cubic-bezier(.4,0,.2,1)',
        marginLeft: sidebarCollapsed ? 80 : 260 // adjust based on sidebar width
      }}>
        <AttemptQuiz cardWide={sidebarCollapsed} />
      </div>
    </div>
  );
}

const menuItems = [
  { key: "quiz", label: "Quiz" },
];

export default AttemptQuizPageWrapper; 