/**
 * useToast — Toast notification state management
 *
 * WHY: Toasts need to live at the app level so any component can trigger them.
 * This hook manages the collection of active toasts, their auto-dismiss timers,
 * and provides typed convenience methods (success, error, etc.)
 */

import { useState, useCallback, useRef } from 'react';
import { TOAST } from '../utils/constants.js';

let toastIdCounter = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);
  // Track timers so we can clear them if a toast is manually dismissed
  const timersRef = useRef({});

  /**
   * Adds a new toast notification.
   * @param {string} message  - Display text
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration - Auto-dismiss delay in ms (0 = no auto-dismiss)
   */
  const showToast = useCallback((message, type = 'info', duration = TOAST.DEFAULT_DURATION) => {
    const id = ++toastIdCounter;

    setToasts(prev => {
      // Limit max visible toasts
      const trimmed = prev.length >= TOAST.MAX_TOASTS ? prev.slice(1) : prev;
      return [...trimmed, { id, message, type, visible: true }];
    });

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Removes a specific toast by ID.
   */
  const removeToast = useCallback((id) => {
    // Clear the auto-dismiss timer if it exists
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /**
   * Dismisses all visible toasts immediately.
   */
  const clearAll = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setToasts([]);
  }, []);

  // --- Typed convenience methods ---
  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error   = useCallback((msg, duration) => showToast(msg, 'error',   duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);
  const info    = useCallback((msg, duration) => showToast(msg, 'info',    duration), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

export default useToast;
