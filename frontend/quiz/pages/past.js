// Past Quizzes Page (Student)
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPastQuizzes } from '../utils/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getStudentIdFromJWT } from '../../utils/auth';

function PastQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Use actual studentId from JWT
    const studentId = getStudentIdFromJWT();
    if (!studentId) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    getPastQuizzes(studentId)
      .then(qs => setQuizzes(qs.filter(q => q.status === 'completed')))
      .catch(() => setQuizzes([])) // treat error as no quizzes
      .finally(() => setLoading(false));
  }, []);

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
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 16,
    marginTop: 10,
    background: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(30,41,59,0.06)',
  };
  const thStyle = {
    padding: '14px 8px',
    fontWeight: 700,
    color: '#2563eb',
    borderBottom: '2px solid #e0e7ef',
    background: '#f1f5fa',
    textAlign: 'left',
  };
  const tdStyle = {
    padding: '12px 8px',
    borderBottom: '1px solid #e0e7ef',
    background: '#f8fafc',
    color: '#1e293b',
  };
  const linkStyle = {
    color: '#3b82f6',
    textDecoration: 'underline',
    fontWeight: 600,
    cursor: 'pointer',
  };
  const errorStyle = {
    color: '#ef4444',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
  };
  const loadingStyle = {
    color: '#2563eb',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
  };

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
          <div style={headingStyle}>Past Quizzes</div>
          <div style={subTextStyle}>See your quiz history and reports</div>
          {loading ? (
            <div style={loadingStyle}>Loading...</div>
          ) : error ? (
            <div style={errorStyle}>{error}</div>
          ) : quizzes.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', fontSize: 18 }}>No past quizzes found.</div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Chapter</th>
                    <th style={thStyle}>Score</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(qz => (
                    <tr key={qz._id} style={{ background: '#f8fafc', transition: 'background 0.2s' }}>
                      <td style={tdStyle}>{qz.createdAt ? new Date(qz.createdAt).toLocaleString() : '-'}</td>
                      <td style={tdStyle}>{qz.subjects?.[0] || '-'}</td>
                      <td style={tdStyle}>{qz.chapters?.[0] || '-'}</td>
                      <td style={tdStyle}>{qz.correct ?? 0} / {qz.questions?.length ?? 0}</td>
                      <td style={tdStyle}>{qz.status}</td>
                      <td style={tdStyle}>
                        <Link href={`/report?quizId=${qz._id}`} legacyBehavior>
                          <a style={linkStyle}>View</a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastQuizzesProtected() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <PastQuizzes />
    </ProtectedRoute>
  );
}

export default PastQuizzesProtected;
