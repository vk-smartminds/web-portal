import { useState, useEffect, useCallback } from "react";

/**
 * useOtpTimer - Custom hook for OTP countdown timer logic.
 * @param {number} initialSeconds - Number of seconds for the timer (default: 120)
 * @returns {Object} { timeLeft, expired, start, reset }
 */
export default function useOtpTimer(initialSeconds = 120) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const timerActive = timeLeft > 0 && !expired;

  // Start the timer
  const start = useCallback(() => {
    setTimeLeft(initialSeconds);
    setExpired(false);
  }, [initialSeconds]);

  // Reset the timer
  const reset = useCallback(() => {
    setTimeLeft(0);
    setExpired(false);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setExpired(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  return { timeLeft, expired, start, reset };
} 