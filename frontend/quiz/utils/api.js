import { BASE_API_URL } from '../../utils/apiurl';

// Get available subjects for a class
export async function getAvailableSubjects(className) {
  const params = new URLSearchParams();
  if (className) params.append('class', className);
  const res = await fetch(`${BASE_URL}/quiz/subjects?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}
// Quiz API utility
const BASE_URL = BASE_API_URL;

// Get available chapters for a class/subject
export async function getAvailableChapters(className, subject) {
  const params = new URLSearchParams();
  if (className) params.append('class', className);
  if (subject) params.append('subject', subject);
  const res = await fetch(`${BASE_URL}/quiz/chapters?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch chapters');
  return res.json();
}

export async function attemptQuiz(data) {
  const res = await fetch(`${BASE_URL}/quiz/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create quiz');
  return res.json();
}

export async function getQuiz(quizId) {
  const res = await fetch(`${BASE_URL}/quiz/report/${quizId}`);
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export async function submitQuiz(quizId, responses) {
  const res = await fetch(`${BASE_URL}/quiz/submit/${quizId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  });
  if (!res.ok) throw new Error('Failed to submit quiz');
  return res.json();
}

export async function getPastQuizzes(studentId) {
  const res = await fetch(`${BASE_URL}/quiz/my-quizzes/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch past quizzes');
  return res.json();
}
