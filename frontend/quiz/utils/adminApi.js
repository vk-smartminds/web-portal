// Admin Quiz API utility
// Use main backend server port (default 8000)
const BASE_URL = 'http://localhost:8000/api/admin/quiz';

export async function getQuestions(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/questions?${params}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function addQuestion(data) {
  const res = await fetch(`${BASE_URL}/question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add question');
  return res.json();
}

export async function updateQuestion(id, data) {
  const res = await fetch(`${BASE_URL}/question/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update question');
  return res.json();
}

export async function deleteQuestion(id) {
  const res = await fetch(`${BASE_URL}/question/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete question');
  return res.json();
}
