import { useState, useRef, useCallback } from "react";

export function useTimer(initialDuration) {
  const [timeLeft, setTimeLeft] = useState(initialDuration * 60); // em segundos
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(initialDuration * 60);
  }, [initialDuration]);

  return { timeLeft, isRunning, start, pause, stop };
}
