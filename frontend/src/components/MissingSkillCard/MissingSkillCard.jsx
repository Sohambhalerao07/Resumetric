import './MissingSkillCard.css';
import { AlertTriangle } from 'lucide-react';

/**
 * MissingSkillCard — Individual skill gap display
 *
 * Responsibility: Shows a single missing skill with a warning indicator.
 * Purely presentational.
 *
 * @param {string} skill  - Missing skill text from the AI
 * @param {number} index  - Position for stagger animation
 */
function MissingSkillCard({ skill, index = 0 }) {
  const staggerClass = index < 6 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`missing-skill-card animate-fade-in-up ${staggerClass}`}
      role="listitem"
    >
      <div className="missing-skill-card__icon" aria-hidden="true">
        <AlertTriangle size={14} />
      </div>
      <p className="missing-skill-card__text">{skill}</p>
    </div>
  );
}

export default MissingSkillCard;
