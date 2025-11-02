import { useState, useEffect, useRef } from 'react';

const MIN_HOUR_HEIGHT = 33;
const MAX_HOUR_HEIGHT = 200;
const DEFAULT_HOUR_HEIGHT = 41;
const STORAGE_KEY = 'calendar-hour-height';
const SAVE_DEBOUNCE_MS = 500;
const ZOOM_STEP = 8; // Fixed pixel step for faster, more responsive zooming

/**
 * Calendar hour height management with zoom functionality
 * Handles Ctrl+Wheel zoom and localStorage persistence
 * Optimized with debounced localStorage saves for instant feedback
 */
export function useHourHeight() {
  const [hourHeight, setHourHeight] = useState(DEFAULT_HOUR_HEIGHT);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedHeight = parseInt(saved, 10);
        if (!isNaN(parsedHeight)) {
          setHourHeight(Math.max(MIN_HOUR_HEIGHT, Math.min(MAX_HOUR_HEIGHT, parsedHeight)));
        }
      }
    }
  }, []);

  // Ctrl+Wheel zoom functionality with debounced localStorage save
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
        wheelEvent.preventDefault();

        const target = wheelEvent.target as HTMLElement;
        const calendarGrid = document.querySelector('.calendar-grid');

        if (calendarGrid && calendarGrid.contains(target)) {
          const delta = wheelEvent.deltaY;
          // Use fixed pixel step for more responsive and predictable zooming
          const adjustment = delta > 0 ? -ZOOM_STEP : ZOOM_STEP;

          setHourHeight((prev) => {
            const newHeight = prev + adjustment;
            const clampedHeight = Math.max(MIN_HOUR_HEIGHT, Math.min(MAX_HOUR_HEIGHT, newHeight));

            // Clear previous timer and schedule new save
            if (saveTimerRef.current) {
              clearTimeout(saveTimerRef.current);
            }

            // Debounce localStorage save for performance
            saveTimerRef.current = setTimeout(() => {
              localStorage.setItem(STORAGE_KEY, clampedHeight.toString());
            }, SAVE_DEBOUNCE_MS);

            return clampedHeight;
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      // Save immediately on unmount if there's a pending save
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        localStorage.setItem(STORAGE_KEY, hourHeight.toString());
      }
    };
  }, [hourHeight]);

  return hourHeight;
}
