import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  onError?: (error: Error) => void;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
): void {
  const { enabled = true, interval = 5000, onError } = options;
  const callbackRef = useRef(callback);
  const onErrorRef = useRef(onError);

  // Update refs
  useEffect(() => {
    callbackRef.current = callback;
    onErrorRef.current = onError;
  }, [callback, onError]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const poll = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error as Error);
        } else {
          console.error('Polling error:', error);
        }
      }
    };

    // Run immediately
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval]);
}

