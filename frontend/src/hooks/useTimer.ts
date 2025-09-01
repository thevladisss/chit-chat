import { useState, useRef, useCallback, useEffect } from "react";

interface UseTimerReturn {
  isRunning: boolean;
  elapsedTime: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimer = (): UseTimerReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - (startTimeRef.current || 0));
      }, 100);
    }
  }, [isRunning, elapsedTime]);

  const stopTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setElapsedTime(0);
    startTimeRef.current = null;
  }, [stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
