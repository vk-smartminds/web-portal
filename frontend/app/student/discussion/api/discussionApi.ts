import axios from 'axios';
import { DiscussionThread, DiscussionPost } from '../types';
import { getToken, removeToken, isTokenExpired } from '../../../../utils/auth.js';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function createDiscussionThread(data: FormData) {
  return api.post<DiscussionThread>('/discussion/threads', data);
}

export async function fetchDiscussionThreads() {
  return api.get<DiscussionThread[]>('/discussion/threads');
}

export async function fetchDiscussionThread(threadId: string) {
  return api.get<DiscussionThread>(`/discussion/threads/${threadId}`);
}

export async function addDiscussionPost(threadId: string, data: FormData) {
  return api.post<DiscussionPost>(`/discussion/threads/${threadId}/posts`, data);
}

export async function voteThread(threadId: string, value: 1 | -1) {
  return api.post(`/discussion/threads/${threadId}/vote`, { value });
}

export async function votePost(threadId: string, postId: string, value: 1 | -1) {
  return api.post(`/discussion/threads/${threadId}/posts/${postId}/vote`, { value });
}

export async function editDiscussionPost(threadId: string, postId: string, data: FormData) {
  return api.put(`/discussion/threads/${threadId}/posts/${postId}`, data);
}

export async function deleteDiscussionPost(threadId: string, postId: string) {
  return api.delete(`/discussion/threads/${threadId}/posts/${postId}`);
}

export async function searchDiscussionThreads(query: string) {
  return api.get(`/discussion/posts/search?query=${encodeURIComponent(query)}`);
} 