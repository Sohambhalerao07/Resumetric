import './StrengthCard.css';
import { CheckCircle } from 'lucide-react';

/**
 * StrengthCard — Individual strength display
 *
 * Responsibility: Displays a single resume strength identified by the AI.
 * Purely presentational — receives text and renders it.
 *
 * @param {string} strength - Strength text from the AI
 * @param {number} index    - Position (for stagger animation delay)
 */
function StrengthCard({ strength, index = 0 }) {
  const staggerClass = index < 6 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`strength-card animate-fade-in-up ${staggerClass}`}
      role="listitem"
    >
      <div className="strength-card__icon" aria-hidden="true">
        <CheckCircle size={16} />
      </div>
      <p className="strength-card__text">{strength}</p>
    </div>
  );
}

export default StrengthCard;
