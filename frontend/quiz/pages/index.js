// Quiz Home Page (Student)

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';

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
  padding: '48px 40px',
  minWidth: 380,
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #e0e7ef',
};

const headingStyle = {
  fontSize: 32,
  fontWeight: 800,
  color: '#1e293b',
  marginBottom: 8,
  textAlign: 'center',
  letterSpacing: 0.5,
};

const subTextStyle = {
  color: '#64748b',
  fontSize: 16,
  marginBottom: 32,
  textAlign: 'center',
};

const buttonStyle = {
  width: '100%',
  padding: '14px 0',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 18,
  marginBottom: 18,
  border: 'none',
  background: '#3b82f6',
  color: 'white',
  boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const outlineButtonStyle = {
  ...buttonStyle,
  background: 'white',
  color: '#3b82f6',
  border: '2px solid #3b82f6',
  marginBottom: 0,
};

function QuizHome() {
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
          <div style={headingStyle}>Sign in to VK Portal</div>
          <div style={subTextStyle}>Welcome! Choose an action below</div>
          <Link href="/attempt" legacyBehavior>
            <button style={buttonStyle}>Attempt Quiz</button>
          </Link>
          <Link href="/past" legacyBehavior>
            <button style={outlineButtonStyle}>View Past Quizzes</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuizHomeProtected() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <QuizHome />
    </ProtectedRoute>
  );
}

export default QuizHomeProtected;
