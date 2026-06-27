import './ToastNotification.css';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * ToastNotification — Single toast message
 *
 * Responsibility: Renders one toast with its icon, message, and close button.
 * Uses CSS animation for enter/exit. No business logic.
 *
 * @param {{ id, message, type }} toast  - Toast data
 * @param {Function} onRemove            - Called with toast.id to dismiss
 */
function ToastNotification({ toast, onRemove }) {
  const iconMap = {
    success: <CheckCircle size={16} aria-hidden="true" />,
    error:   <XCircle    size={16} aria-hidden="true" />,
    warning: <AlertTriangle size={16} aria-hidden="true" />,
    info:    <Info       size={16} aria-hidden="true" />,
  };

  return (
    <div
      className={`toast toast--${toast.type}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="toast__icon">{iconMap[toast.type] || iconMap.info}</span>
      <p className="toast__message">{toast.message}</p>
      <button
        type="button"
        className="toast__close"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * ToastContainer — List of all active toasts
 *
 * Renders in a fixed portal-like position (top-right).
 * Each toast animates in/out independently.
 *
 * @param {Array}    toasts    - Array of toast objects
 * @param {Function} onRemove  - Called with toast id to dismiss
 */
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default ToastNotification;
