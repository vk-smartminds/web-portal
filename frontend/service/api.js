import axios from 'axios';
import { getToken, removeToken, isTokenExpired } from '../utils/auth.js';

// You can set the baseURL as needed
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, remove it
      removeToken();
      // Redirect to login page if we're not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function deleteAccount(email) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await api.post('/user/delete', { email });
  return res.data;
}

export default api;

export const fetchVideos = async () => {
  const res = await api.get('/videos');
  return res.data;
};

export const addVideo = async (video, token) => {
  const res = await api.post('/videos', video, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateVideo = async (id, video, token) => {
  const res = await api.put(`/videos/${id}`, video, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteVideo = async (id, token) => {
  const res = await api.delete(`/videos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// Discussion API
export async function createDiscussionThread(data, token) {
  let config = { headers: { Authorization: `Bearer ${token}` } };
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    // Let browser set Content-Type for FormData
    delete config.headers['Content-Type'];
  }
  return api.post('/discussion/threads', data, config);
}

export async function fetchDiscussionThreads() {
  return api.get('/discussion/threads');
}

export async function fetchDiscussionThread(threadId) {
  return api.get(`/discussion/threads/${threadId}`);
}

export async function addDiscussionPost(threadId, data, token) {
  let config = { headers: { Authorization: `Bearer ${token}` } };
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    // Let browser set Content-Type for FormData
    delete config.headers['Content-Type'];
  }
  return api.post(`/discussion/threads/${threadId}/posts`, data, config);
}

export async function voteThread(threadId, value, token) {
  return api.post(`/discussion/threads/${threadId}/vote`, { value }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function votePost(threadId, postId, value, token) {
  return api.post(`/discussion/threads/${threadId}/posts/${postId}/vote`, { value }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function editDiscussionPost(threadId, postId, data, token) {
  let config = { headers: { Authorization: `Bearer ${token}` } };
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return api.put(`/discussion/threads/${threadId}/posts/${postId}`, data, config);
}

export async function deleteDiscussionPost(threadId, postId, token) {
  return api.delete(`/discussion/threads/${threadId}/posts/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Search discussion threads by title/heading
export async function searchDiscussionThreads(query) {
  return api.get(`/discussion/posts/search?query=${encodeURIComponent(query)}`);
}
