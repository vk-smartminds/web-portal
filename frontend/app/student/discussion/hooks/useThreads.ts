import { useEffect, useState, useCallback } from 'react';
import { fetchDiscussionThreads } from '../api/discussionApi';
import { DiscussionThread } from '../types';

export function useThreads() {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDiscussionThreads();
      setThreads(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch threads');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { threads, loading, error, refetch: fetchThreads };
} 