import React, { useEffect, useState, useRef } from 'react';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../utils/adminApi';
import { SUBJECTS_BY_CLASS, CHAPTERS_BY_CLASS_SUBJECT, ASSERTION_REASON_OPTIONS } from '../utils/content';
import LatexPreviewer from '../components/LatexPreviewer';
import Script from 'next/script';
// REMOVE: import AdminDashboardSidebar from '../../components/AdminDashboard/AdminDashboardSidebar';
import { getUserData } from '../../utils/auth.js';
import { BASE_API_URL } from '../../utils/apiurl';

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

// Helper to get unique values from an array
function unique(arr) {
  return Array.from(new Set(arr));
}

// Add this helper component inside AdminQuizPage (or as a function in the file)
function ImageUploadLatexButton({ value, onChange, textareaRef }) {
  const [uploading, setUploading] = useState(false);
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${BASE_API_URL}/images/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const imageUrl = data.url;
      const latexToInsert = `\\includegraphics[width=4cm]{${imageUrl}}`;
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + latexToInsert + value.substring(end);
        onChange(newValue);
        // Move cursor after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = start + latexToInsert.length;
        }, 0);
      } else {
        onChange(value + latexToInsert);
      }
    } catch (err) {
      alert('Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  return (
    <div style={{ marginTop: 8 }}>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span style={{ marginLeft: 8, color: '#2563eb' }}>Uploading...</span>}
    </div>
  );
}

// Add a reusable image upload button for options and solution, with icon inside the box
function ImageUploadLatexButtonForField({ value, onChange, inputRef, id }) {
  const [uploading, setUploading] = useState(false);
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${BASE_API_URL}/images/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const imageUrl = data.url;
      const latexToInsert = `\\includegraphics[width=4cm]{${imageUrl}}`;
      const input = inputRef.current;
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newValue = value.substring(0, start) + latexToInsert + value.substring(end);
        onChange(newValue);
        setTimeout(() => {
          input.focus();
          input.selectionStart = input.selectionEnd = start + latexToInsert.length;
        }, 0);
      } else {
        onChange(value + latexToInsert);
      }
    } catch (err) {
      alert('Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  // SVG paperclip icon
  const icon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 10.8333L12.5 5.83333M12.5 5.83333C13.8807 7.21405 13.8807 9.45262 12.5 10.8333C11.1193 12.2141 8.88074 12.2141 7.5 10.8333C6.11926 9.45262 6.11926 7.21405 7.5 5.83333C8.88074 4.45262 11.1193 4.45262 12.5 5.83333Z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <>
      <input type="file" accept="image/*" style={{ display: 'none' }} id={id} onChange={handleFileChange} disabled={uploading} />
      <label htmlFor={id} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1, zIndex: 2 }}>
        {icon}
      </label>
    </>
  );
}

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
    bloomsTaxonomy: 'Remember',
  });
  const [editing, setEditing] = useState(null);
  // Add preview state for question, options, and answer
  const previewRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const questionTextareaRef = useRef();
  // In AdminQuizPage, add refs for each option and the answer
  const optionRefs = [useRef(), useRef(), useRef(), useRef()];
  const answerRef = useRef();

  useEffect(() => {
    const u = getUserData();
    setUserEmail(u?.email || "");
    setUserPhoto(u?.photo || "");
  }, []);

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

  useEffect(() => {
    function typeset() {
      if (window.MathJax && window.MathJax.typesetPromise && previewRef.current) {
        window.MathJax.typesetPromise([previewRef.current]);
      }
    }
    const timer = setTimeout(typeset, 500);
    const script = document.querySelector('script[src*="mathjax"]');
    if (script) {
      script.addEventListener('load', typeset);
    }
    return () => {
      clearTimeout(timer);
      if (script) script.removeEventListener('load', typeset);
    };
  }, [showPreview, form, optionInputs]);

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
        bloomsTaxonomy: form.bloomsTaxonomy,
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
      topics: q.topics?.join(', ') || '',
      bloomsTaxonomy: q.bloomsTaxonomy || 'Remember',
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
    <>
      <Script id="mathjax-config" strategy="beforeInteractive">
        {`
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
            },
            svg: { fontCache: 'global' },
          };
        `}
      </Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.min.js"
        strategy="afterInteractive"
      />
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
                {unique(subjectOptions[search.class] || Object.values(subjectOptions).flat()).map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
        <section style={{ width: '100%', maxWidth: 1300, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px 0 #e0e7ff', padding: 32, border: '1px solid #dbeafe', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ display: 'inline-block', width: 8, height: 24, background: '#2563eb', borderRadius: 4, marginRight: 8 }}></span>Add / Edit Question</h3>
          <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 0 }} onSubmit={handleSubmit} autoComplete="off">
            <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 8 }}>
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
                  {unique(subjectOptions[form.class] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                        <option key={`${form.class}-${form.subject}-${ch.number}`} value={ch.number}>{ch.number}. {ch.name}</option>
                      ))
                    : null}
                </select>
              </div>
            </div>
            {/* Horizontal line for subject/chapter separation */}
            <hr className="my-2 border-blue-200" />
            <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Topics <span style={{ fontSize: 12, color: '#64748b' }}>(comma separated)</span></label>
                <input name="topics" value={form.topics} onChange={handleChange} placeholder="Topics (comma separated)" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }} />
              </div>
            </div>
            <div style={{ width: '100%', marginBottom: 8 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Type of Question</label>
              <select name="type" value={form.type} onChange={handleChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}>
                <option value="">Select Type</option>
                <option value="MCQ">Multiple Choice Questions</option>
                <option value="AssertionReason">Assertion Reason Type</option>
                <option value="SelectResponse">Select Response Type (Multiple correct)</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Question (LaTeX supported)</label>
              <textarea
                ref={questionTextareaRef}
                name="question"
                value={form.question}
                onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                rows={4}
                style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 16, background: '#f1f5fe', outline: 'none' }}
              />
              <ImageUploadLatexButton value={form.question} onChange={val => setForm(f => ({ ...f, question: val }))} textareaRef={questionTextareaRef} />
            </div>
            <div style={{ width: '100%', marginBottom: 8 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {optionInputs.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        ref={optionRefs[idx]}
                        name={`option${idx}`}
                        type="text"
                        value={opt}
                        placeholder={`Option ${idx + 1}`}
                        onChange={e => {
                          const newOpts = [...optionInputs];
                          newOpts[idx] = e.target.value;
                          setOptionInputs(newOpts);
                        }}
                        style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 36px 8px 12px', background: '#f1f5fe', outline: 'none' }}
                      />
                      <ImageUploadLatexButtonForField value={opt} onChange={val => {
                        const newOpts = [...optionInputs];
                        newOpts[idx] = val;
                        setOptionInputs(newOpts);
                      }} inputRef={optionRefs[idx]} id={`option-img-upload-${idx}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Correct Option(s)</label>
                <input name="correct_option" value={form.correct_option} onChange={handleChange} placeholder="Correct Option(s) (comma separated for multiple)" style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Solution/Answer Explanation</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <textarea
                    ref={answerRef}
                    name="answer"
                    value={form.answer}
                    onChange={handleChange}
                    placeholder="Solution/Answer Explanation"
                    style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 36px 8px 12px', background: '#f1f5fe', outline: 'none', minHeight: 40 }}
                  />
                  <ImageUploadLatexButtonForField value={form.answer} onChange={val => setForm(f => ({ ...f, answer: val }))} inputRef={answerRef} id="answer-img-upload" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, width: '100%', marginBottom: 8 }}>
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
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#2563eb', marginBottom: 4 }}>Bloom's Taxonomy</label>
                <select name="bloomsTaxonomy" value={form.bloomsTaxonomy} onChange={handleChange} style={{ width: '100%', border: '1px solid #c7d2fe', borderRadius: 8, padding: '8px 12px', background: '#f1f5fe', outline: 'none' }}>
                  <option value="Remember">Remember</option>
                  <option value="Understand">Understand</option>
                  <option value="Apply">Apply</option>
                  <option value="Analyze">Analyze</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Create">Create</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)', color: '#fff', padding: '12px 0', borderRadius: 8, fontWeight: 700, border: 'none', boxShadow: '0 2px 8px #e0e7ff', cursor: 'pointer', fontSize: 16, transition: 'background 0.2s' }}>{editing ? 'Update' : 'Add'} Question</button>
              {editing && <button type="button" style={{ fontSize: 14, color: '#64748b', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }} onClick={()=>{setEditing(null);setForm(f => ({ ...f, question: '', answer: '', correct_option: '', category: '', type: '', difficulty: 'Medium', marks: 1 })); setOptionInputs(['', '', '', '']);}}>Cancel</button>}
            </div>
          </form>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button
              type="button"
              style={{
                background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: 8,
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 2px 8px #e0e7ff',
                cursor: 'pointer',
                fontSize: 18,
                marginBottom: 12
              }}
              onClick={() => setShowPreview(p => !p)}
            >
              {showPreview ? 'Hide LaTeX Preview' : 'Preview LaTeX'}
            </button>
          </div>
          {showPreview && (
            <div
              ref={previewRef}
              key={form.question + form.answer + optionInputs.join(',')}
              style={{ width: '100%', maxWidth: 1300, background: '#f8fafc', borderRadius: 18, padding: 16, margin: '24px auto 0 auto', fontSize: 18, boxShadow: '0 4px 24px 0 #e0e7ff', border: '1px solid #dbeafe' }}
            >
              <div><strong>Question:</strong><br /><LatexPreviewer value={form.question} /></div>
              <div style={{ marginTop: 8 }}><strong>Options:</strong>
                <ul style={{ marginLeft: 16 }}>
                  {optionInputs.map((opt, idx) => opt && <li key={idx} style={{ listStyle: 'none', marginBottom: 12 }}><LatexPreviewer value={opt} /></li>)}
                </ul>
              </div>
              <div style={{ marginTop: 8 }}><strong>Answer/Solution:</strong><br /><LatexPreviewer value={form.answer} /></div>
            </div>
          )}
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
    </>
  );
}