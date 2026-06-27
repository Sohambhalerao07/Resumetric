import './ResultsContainer.css';
import ScoreCircle from '../ScoreCircle/ScoreCircle.jsx';
import StrengthCard from '../StrengthCard/StrengthCard.jsx';
import MissingSkillCard from '../MissingSkillCard/MissingSkillCard.jsx';
import RecommendationCard from '../RecommendationCard/RecommendationCard.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import { Trophy, AlertOctagon, Lightbulb, Star } from 'lucide-react';

/**
 * ResultsContainer — Results layout orchestrator
 *
 * Responsibility: Arranges the score, strengths, skill gaps, and
 * recommendations sections. Composes smaller result cards.
 * Shows EmptyState when no analysis has run.
 *
 * @param {object|null} result      - Formatted MatchResult object (or null)
 * @param {boolean}     hasAnalyzed - Whether analysis has completed
 * @param {string|null} error       - Analysis error message
 */
function ResultsContainer({ result, hasAnalyzed, error }) {
  // Error state
  if (error && !hasAnalyzed) {
    return (
      <section className="results-container results-container--error" aria-label="Analysis error">
        <div className="results-error">
          <AlertOctagon size={40} strokeWidth={1.5} aria-hidden="true" />
          <h2 className="results-error__title">Analysis Failed</h2>
          <p className="results-error__message">{error}</p>
        </div>
      </section>
    );
  }

  // Empty state (no analysis yet)
  if (!hasAnalyzed || !result) {
    return (
      <section className="results-container results-container--empty" aria-label="Analysis results">
        <EmptyState />
      </section>
    );
  }

  const { score, color, label, summary, strengths, missingSkills, recommendations } = result;

  return (
    <section
      className="results-container animate-fade-in-up"
      aria-label="Analysis results"
      id="results"
    >
      {/* Score Hero */}
      <div className="results-score-hero">
        <div className="results-score-hero__circle">
          <ScoreCircle score={score} color={color} label={label} />
        </div>
        <div className="results-score-hero__info">
          <h2 className="results-score-hero__title">
            Your Resume Match
          </h2>
          {summary && (
            <p className="results-score-hero__summary">{summary}</p>
          )}
          <div className="results-score-hero__meta">
            <span className={`results-score-badge results-score-badge--${color}`}>
              {label}
            </span>
            <span className="results-score-hero__tip">
              {score >= 80
                ? '🎉 Strong match — apply with confidence!'
                : score >= 60
                ? '👍 Good match — a few tweaks will help'
                : score >= 40
                ? '📝 Fair match — consider upskilling first'
                : '🔧 Needs work — focus on the recommendations'}
            </span>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="results-sections">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="results-section">
            <h3 className="results-section__title">
              <Star size={18} aria-hidden="true" className="results-section__icon results-section__icon--success" />
              Strengths
              <span className="results-section__count">{strengths.length}</span>
            </h3>
            <ul className="results-section__list" aria-label="Your strengths">
              {strengths.map((strength, i) => (
                <StrengthCard key={i} strength={strength} index={i} />
              ))}
            </ul>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="results-section">
            <h3 className="results-section__title">
              <AlertOctagon size={18} aria-hidden="true" className="results-section__icon results-section__icon--warning" />
              Skill Gaps
              <span className="results-section__count results-section__count--warning">{missingSkills.length}</span>
            </h3>
            <ul className="results-section__list" aria-label="Missing skills">
              {missingSkills.map((skill, i) => (
                <MissingSkillCard key={i} skill={skill} index={i} />
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="results-section results-section--full">
            <h3 className="results-section__title">
              <Lightbulb size={18} aria-hidden="true" className="results-section__icon results-section__icon--primary" />
              Recommendations
              <span className="results-section__count">{recommendations.length}</span>
            </h3>
            <ul className="results-section__list results-section__list--grid" aria-label="Recommendations">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} index={i} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default ResultsContainer;
