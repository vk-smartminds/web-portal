import { useEffect, useState, useCallback } from 'react';
import { fetchDiscussionThread } from '../api/discussionApi';
import { DiscussionThread } from '../types';

export function useThread(threadId: string) {
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDiscussionThread(threadId);
      setThread(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch thread');
    }
    setLoading(false);
  }, [threadId]);

  useEffect(() => {
    if (threadId) fetchThread();
  }, [threadId, fetchThread]);

  return { thread, loading, error, refetch: fetchThread };
} 