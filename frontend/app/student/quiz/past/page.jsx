"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPastQuizzes } from '../../../../quiz/utils/api';
import { getStudentIdFromJWT } from '../../../../utils/auth';
import DashboardCommon from '../../../../pages/DashboardCommon';
import Sidebar from '../../../../components/Sidebar';

function PastQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const studentId = getStudentIdFromJWT();
    if (!studentId) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    getPastQuizzes(studentId)
      .then(qs => setQuizzes(qs.filter(q => q.status === 'completed')))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  const cardStyle = {
    background: 'white',
    borderRadius: 22,
    boxShadow: '0 8px 40px 0 rgba(30,41,59,0.10)',
    padding: '44px 48px',
    minWidth: 340,
    maxWidth: 1200,
    width: '96vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #e0e7ef',
  };
  const headingStyle = {
    fontSize: 36,
    fontWeight: 900,
    color: '#14532d',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  };
  const subTextStyle = {
    color: '#64748b',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
    fontWeight: 500,
  };
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 17,
    marginTop: 10,
    background: 'white',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 2px 8px 0 rgba(30,41,59,0.06)',
  };
  const thStyle = {
    padding: '16px 10px',
    fontWeight: 900,
    color: '#16a34a',
    borderBottom: '2.5px solid #e0e7ef',
    background: '#f1f5fa',
    textAlign: 'left',
    fontSize: 16,
  };
  const tdStyle = {
    padding: '14px 10px',
    borderBottom: '1.5px solid #e0e7ef',
    background: '#f8fafc',
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 600,
  };
  const linkStyle = {
    color: '#fff',
    background: '#16a34a',
    borderRadius: 16,
    padding: '8px 22px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 16,
    border: 'none',
    textDecoration: 'none',
    transition: 'background 0.2s',
    display: 'inline-block',
    margin: 0,
  };
  const errorStyle = {
    color: '#dc2626',
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
  };
  const loadingStyle = {
    color: '#16a34a',
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center">
      <div style={cardStyle}>
        <div style={headingStyle}>Past Quizzes</div>
        <div style={subTextStyle}>See your quiz history and reports</div>
        {loading ? (
          <div style={loadingStyle}>Loading...</div>
        ) : error ? (
          <div style={errorStyle}>{error}</div>
        ) : quizzes.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', fontSize: 15 }}>No past quizzes found.</div>
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
                    <td style={{...tdStyle, color: qz.status === 'completed' ? '#16a34a' : '#dc2626'}}>{qz.status}</td>
                    <td style={tdStyle}>
                      <Link href={`/student/quiz/report?quizId=${qz._id}`} style={linkStyle}>
                        View
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
  );
}

const menuItems = [
  { key: "quiz", label: "Quiz" },
];

export default function PastQuizPage() {
  return (
    <DashboardCommon
      SidebarComponent={Sidebar}
      menuItems={menuItems}
      userType="Student"
      renderContent={() => <PastQuizzes />}
    />
  );
} 