import React, { useEffect, useState } from 'react';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../utils/adminApi';
import { SUBJECTS_BY_CLASS, CHAPTERS_BY_CLASS_SUBJECT, ASSERTION_REASON_OPTIONS } from '../utils/content';

// Map display class values to DB values (if needed, otherwise identity)
const classDisplayToValue = {
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  '11': '11',
  '12': '12',
  'JEE': 'JEE',
  'NEET': 'NEET',
  'CUET': 'CUET',
};

export default function AdminQuizPage() {
  // Use centralized content file for class/subject options
  const classOptions = Object.keys(SUBJECTS_BY_CLASS);
  const subjectOptions = SUBJECTS_BY_CLASS;

  // For options input as separate fields
  const [optionInputs, setOptionInputs] = useState(['', '', '', '']);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({ class: '', subject: '', chapter: '' });
  const [form, setForm] = useState({
    class: '',
    subject: '',
    chapter: '',
    topics: '',
    type: '',
    question: '',
    answer: '',
    correct_option: '',
    difficulty: 'Medium',
    marks: 1,
  });
  const [editing, setEditing] = useState(null);

  // Fetch questions (only when search changes)
  useEffect(() => {
    if (!search.class && !search.subject && !search.chapter) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    getQuestions(search)
      .then(setQuestions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    // If type is changed to AssertionReason, auto-load default options
    if (e.target.name === 'type' && e.target.value === 'AssertionReason') {
      setOptionInputs([...ASSERTION_REASON_OPTIONS]);
    }
    // If type is changed away from AssertionReason, clear options
    if (e.target.name === 'type' && e.target.value !== 'AssertionReason') {
      setOptionInputs(['', '', '', '']);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Map display class to DB value before sending
      const dbClass = classDisplayToValue[form.class] || form.class;
      const data = {
        ...form,
        class: dbClass,
        topics: form.topics.split(',').map(t => t.trim()).filter(Boolean),
        options: optionInputs.map(o => o.trim()).filter(Boolean),
      };
      if (editing) {
        await updateQuestion(editing, data);
      } else {
        await addQuestion(data);
      }
      // Only clear question, options, answer, correct_option
      setForm(f => ({
        ...f,
        question: '',
        answer: '',
        correct_option: ''
      }));
      setOptionInputs(['', '', '', '']);
      setEditing(null);
      setLoading(true);
      setQuestions(await getQuestions());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = q => {
    setForm({
      ...form,
      ...q,
      topics: q.topics?.join(', ') || ''
    });
    setOptionInputs(q.options && Array.isArray(q.options) ? q.options.concat(['', '', '', '']).slice(0, 4) : ['', '', '', '']);
    setEditing(q._id);
  };

  // Search handlers
  const handleSearchChange = e => {
    const { name, value } = e.target;
    setSearch(s => ({ ...s, [name]: value }));
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      setQuestions(await getQuestions());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #e0e7ff 0%, #f1f5fe 100%)', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 10 }}>
        <img src="/vk-logo.png" alt="VK Publications" style={{ height: 96, width: 'auto', marginBottom: 8 }} />
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: '#1e293b', marginBottom: 4 }}>Admin Quiz Management</h2>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#64748b' }}>VK Publications</span>
      </header>
      <main style={{ flex: 1, width: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: 16, maxWidth: '100vw', margin: '0 auto' }}>
        {/* Search/Filter Panel (full-width, at top) */}
        <section style={{ width: '100%', maxWidth: 1300, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 #e0e7ff', padding: 32, marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #dbeafe' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Class</label>
              <select name="class" value={search.class} onChange={handleSearchChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', background: '#f1f5fe', outline: 'none', fontSize: 16 }}>
                <option value="">All</option>
                {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Subject</label>
              <select name="subject" value={search.subject} onChange={handleSearchChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', background: '#f1f5fe', outline: 'none', fontSize: 16 }}>
                <option value="">All</option>
                {(subjectOptions[search.class] || Object.values(subjectOptions).flat()).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Chapter</label>
              <input name="chapter" value={search.chapter} onChange={handleSearchChange} placeholder="Chapter" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', background: '#f1f5fe', outline: 'none', fontSize: 16 }} />
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', gap: 16 }}>
            <button style={{ flex: 1, background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)', color: '#fff', padding: '12px 0', borderRadius: 8, fontWeight: 700, border: 'none', boxShadow: '0 2px 8px #e0e7ff', cursor: 'pointer', fontSize: 16, transition: 'background 0.2s' }} onClick={() => setSearch({ class: '', subject: '', chapter: '' })} type="button">Clear</button>
          </div>
        </section>
        {/* Add Question Panel (full-width, below search) */}
        <section style={{ width: '100%', maxWidth: 1300, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 #e0e7ff', padding: 32, border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 8, height: 24, background: '#2563eb', borderRadius: 4, marginRight: 8 }}></span>Add / Edit Question</h3>
          <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit} autoComplete="off">
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Class</label>
                <select
                  name="class"
                  value={form.class}
                  onChange={e => {
                    setForm(f => ({ ...f, class: e.target.value, subject: '' }));
                  }}
                  style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}
                >
                  <option value="">Select Class</option>
                  {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value, chapter: '' }))}
                  style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}
                >
                  <option value="">Select Subject</option>
                  {(subjectOptions[form.class] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Chapter</label>
                <select
                  name="chapter"
                  value={form.chapter}
                  onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}
                  disabled={!form.class || !form.subject}
                >
                  <option value="">Select Chapter</option>
                  {(CHAPTERS_BY_CLASS_SUBJECT[form.class] && CHAPTERS_BY_CLASS_SUBJECT[form.class][form.subject])
                    ? CHAPTERS_BY_CLASS_SUBJECT[form.class][form.subject].map(ch => (
                        <option key={ch.number} value={ch.number}>{ch.number}. {ch.name}</option>
                      ))
                    : null}
                </select>
              </div>
            </div>
            {/* Horizontal line for subject/chapter separation */}
            <hr className="my-2 border-blue-200" />
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Topics <span style={{ fontSize: 12, color: '#64748b' }}>(comma separated)</span></label>
                <input name="topics" value={form.topics} onChange={handleChange} placeholder="Topics (comma separated)" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Type of Question</label>
              <select name="type" value={form.type} onChange={handleChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}>
                <option value="">Select Type</option>
                <option value="MCQ">Multiple Choice Questions</option>
                <option value="AssertionReason">Assertion Reason Type</option>
                <option value="SelectResponse">Select Response Type (Multiple correct)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Question</label>
              <textarea name="question" value={form.question} onChange={handleChange} placeholder="Question" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none', minHeight: 48 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {optionInputs.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    placeholder={`Option ${idx + 1}`}
                    onChange={e => {
                      const newOpts = [...optionInputs];
                      newOpts[idx] = e.target.value;
                      setOptionInputs(newOpts);
                    }}
                    style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Correct Option(s)</label>
                <input name="correct_option" value={form.correct_option} onChange={handleChange} placeholder="Correct Option(s) (comma separated for multiple)" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Solution/Answer Explanation</label>
                <textarea name="answer" value={form.answer} onChange={handleChange} placeholder="Solution/Answer Explanation" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none', minHeight: 40 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Difficulty</label>
                <select name="difficulty" value={form.difficulty} onChange={handleChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Marks</label>
                <input name="marks" type="number" min={1} value={form.marks} onChange={handleChange} placeholder="Marks" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)', color: '#fff', padding: '12px 0', borderRadius: 8, fontWeight: 700, border: 'none', boxShadow: '0 2px 8px #e0e7ff', cursor: 'pointer', fontSize: 16, transition: 'background 0.2s' }}>{editing ? 'Update' : 'Add'} Question</button>
              {editing && <button type="button" style={{ fontSize: 14, color: '#64748b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }} onClick={()=>{setEditing(null);setForm(f => ({ ...f, question: '', answer: '', correct_option: '', category: '', type: '', difficulty: 'Medium', marks: 1 })); setOptionInputs(['', '', '', '']);}}>Cancel</button>}
            </div>
          </form>
          {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
        </section>
        {/* Questions Table (full-width, below add panel, only after search) */}
        {search.class || search.subject || search.chapter ? (
          <section style={{ width: '100%', maxWidth: 1300, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 #e0e7ff', padding: 32, marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 8, height: 24, background: '#2563eb', borderRadius: 4, marginRight: 8 }}></span>Questions</h3>
              <span style={{ fontSize: 13, color: '#64748b' }}>Total: {questions.length}</span>
            </div>
            {loading ? <div style={{ color: '#2563eb', fontWeight: 600, animation: 'pulse 1s infinite alternate' }}>Loading...</div> : questions.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No questions found. Add your first question!</div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #c7d2fe', background: '#f8fafc', width: '100%' }}>
                <table style={{ width: '100%', fontSize: 15, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#334155', background: '#e0e7ff', fontWeight: 700 }}> 
                      <th style={{ padding: 10 }}>Class</th>
                      <th style={{ padding: 10 }}>Subject</th>
                      <th style={{ padding: 10 }}>Chapter</th>
                      <th style={{ padding: 10 }}>Type</th>
                      <th style={{ padding: 10 }}>Question</th>
                      <th style={{ padding: 10 }}>Options</th>
                      <th style={{ padding: 10 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map(q => (
                      <tr key={q._id} style={{ borderTop: '1px solid #e0e7ff', background: '#fff', transition: 'background 0.2s' }}>
                        <td style={{ padding: 10, fontWeight: 600, color: '#2563eb' }}>{q.class}</td>
                        <td style={{ padding: 10 }}>{q.subject}</td>
                        <td style={{ padding: 10 }}>{q.chapter}</td>
                        <td style={{ padding: 10 }}>{q.type || '-'}</td>
                        <td style={{ padding: 10, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={q.question}>{q.question}</td>
                        <td style={{ padding: 10, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{Array.isArray(q.options) ? q.options.join(', ') : ''}</td>
                        <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                          <button style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600, marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }} onClick={()=>handleEdit(q)}>Edit</button>
                          <button style={{ color: '#dc2626', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={()=>handleDelete(q._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </main>
      <footer className="w-full bg-blue-950 text-white text-center py-3 text-xs mt-auto shadow-inner">&copy; {new Date().getFullYear()} VK Publications. All rights reserved.</footer>
    </div>
  );
}