"use client";
import { useEffect, useRef } from 'react';
import { BASE_API_URL } from '../utils/apiurl';
import { getToken } from '../utils/auth';

export default function ScreenTimeTracker() {
  const intervalRef = useRef();
  const syncRef = useRef();
  const timeRef = useRef(0);

  useEffect(() => {
    // Start timer
    intervalRef.current = setInterval(() => {
      timeRef.current += 1;
    }, 1000);
    // Sync with backend every 5 seconds
    syncRef.current = setInterval(() => {
      if (timeRef.current > 0) {
        fetch(`${BASE_API_URL}/screen-time/increment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({ increment: 5 })
        });
        timeRef.current = 0;
      }
    }, 5000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(syncRef.current);
    };
  }, []);
  return null;
} 