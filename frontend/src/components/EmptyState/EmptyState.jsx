import './EmptyState.css';
import { FileSearch } from 'lucide-react';

/**
 * EmptyState — Shown before any analysis has been run
 *
 * Responsibility: Fills the results section with a helpful placeholder
 * that sets expectations and encourages the user to upload their resume.
 * Purely presentational.
 */
function EmptyState() {
  return (
    <div className="empty-state" role="region" aria-label="No analysis yet">
      <div className="empty-state__icon-wrap" aria-hidden="true">
        <FileSearch size={40} strokeWidth={1.5} />
      </div>

      <div className="empty-state__text">
        <h3 className="empty-state__title">No Analysis Yet</h3>
        <p className="empty-state__description">
          Upload your resume and paste a job description above,
          then click <strong>Analyze Match</strong> to get your AI-powered
          match score, identify skill gaps, and receive personalized recommendations.
        </p>
      </div>

      {/* Steps preview */}
      <div className="empty-state__steps" aria-label="What you'll get">
        {[
          { emoji: '🎯', label: 'Match Score' },
          { emoji: '✅', label: 'Your Strengths' },
          { emoji: '⚠️', label: 'Skill Gaps' },
          { emoji: '💡', label: 'Recommendations' },
        ].map(({ emoji, label }) => (
          <div key={label} className="empty-state__step">
            <span className="empty-state__step-emoji" aria-hidden="true">{emoji}</span>
            <span className="empty-state__step-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmptyState;
