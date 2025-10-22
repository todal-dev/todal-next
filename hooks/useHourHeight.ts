import { useState, useEffect } from 'react';

const MIN_HOUR_HEIGHT = 33;
const MAX_HOUR_HEIGHT = 200;
const DEFAULT_HOUR_HEIGHT = 40;
const STORAGE_KEY = 'calendar-hour-height';

/**
 * Calendar hour height management with zoom functionality
 * Handles Ctrl+Wheel zoom and localStorage persistence
 */
export function useHourHeight() {
  const [hourHeight, setHourHeight] = useState(DEFAULT_HOUR_HEIGHT);

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

  // Ctrl+Wheel zoom functionality
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
        wheelEvent.preventDefault();

        const target = wheelEvent.target as HTMLElement;
        const calendarGrid = document.querySelector('.calendar-grid');

        if (calendarGrid && calendarGrid.contains(target)) {
          const delta = wheelEvent.deltaY;
          const zoomFactor = delta > 0 ? 0.9 : 1.1;

          setHourHeight((prev) => {
            const newHeight = Math.round(prev * zoomFactor);
            const clampedHeight = Math.max(MIN_HOUR_HEIGHT, Math.min(MAX_HOUR_HEIGHT, newHeight));
            localStorage.setItem(STORAGE_KEY, clampedHeight.toString());
            return clampedHeight;
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return hourHeight;
}
