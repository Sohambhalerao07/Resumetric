import './RecommendationCard.css';
import { Lightbulb } from 'lucide-react';

/**
 * RecommendationCard — Individual recommendation display
 *
 * Responsibility: Renders a single AI-generated recommendation.
 * Shows a numbered index and the recommendation text.
 * Purely presentational.
 *
 * @param {string} recommendation - Recommendation text from the AI
 * @param {number} index          - Position (0-based, for number + stagger)
 */
function RecommendationCard({ recommendation, index = 0 }) {
  const staggerClass = index < 6 ? `stagger-${index + 1}` : '';

  return (
    <div
      className={`rec-card animate-fade-in-up ${staggerClass}`}
      role="listitem"
    >
      <div className="rec-card__header">
        <div className="rec-card__icon" aria-hidden="true">
          <Lightbulb size={15} />
        </div>
        <span className="rec-card__number" aria-hidden="true">
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="rec-card__text">{recommendation}</p>
    </div>
  );
}

export default RecommendationCard;
