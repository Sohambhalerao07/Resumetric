import './JobDescriptionCard.css';
import { AlignLeft, AlertCircle } from 'lucide-react';
import { VALIDATION } from '../../utils/constants.js';

/**
 * JobDescriptionCard — Job description text input
 *
 * Responsibility: Renders a labeled textarea with live character count.
 * Shows validation error inline. No business logic.
 *
 * @param {string}      value     - Current JD text
 * @param {string|null} error     - Validation error to display
 * @param {Function}    onChange  - Called with new text value
 */
function JobDescriptionCard({ value, error, onChange }) {
  const { MIN_LENGTH, MAX_LENGTH } = VALIDATION.TEXT.JOB_DESCRIPTION;
  const charCount = value.length;
  const isAtMin   = charCount >= MIN_LENGTH;
  const isAtMax   = charCount >= MAX_LENGTH;
  const hasError  = !!error;

  const charCountClass = [
    'jd-card__char-count',
    isAtMax && 'jd-card__char-count--danger',
    !isAtMin && charCount > 0 && 'jd-card__char-count--warning',
    isAtMin && !isAtMax && 'jd-card__char-count--ok',
  ].filter(Boolean).join(' ');

  return (
    <div className="jd-card card animate-fade-in-up stagger-1">
      {/* Card Header */}
      <div className="card__header">
        <div className="icon-wrap">
          <AlignLeft size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="card__title">Job Description</h2>
          <p className="card__subtitle">Paste the full job posting</p>
        </div>
      </div>

      {/* Textarea */}
      <div className="jd-card__input-wrap">
        <textarea
          id="job-description-input"
          className={`jd-card__textarea${hasError ? ' jd-card__textarea--error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste the complete job description here...\n\nInclude:\n• Job title and responsibilities\n• Required skills and experience\n• Preferred qualifications\n\nMinimum ${MIN_LENGTH} characters for accurate analysis.`}
          maxLength={MAX_LENGTH}
          aria-label="Job description"
          aria-describedby={hasError ? 'jd-error' : 'jd-hint'}
          aria-required="true"
          aria-invalid={hasError}
          spellCheck="true"
        />

        {/* Character count */}
        <div className="jd-card__footer">
          <span id="jd-hint" className="jd-card__hint">
            {!isAtMin && charCount > 0
              ? `${MIN_LENGTH - charCount} more characters needed`
              : isAtMin
              ? 'Looking good!'
              : `Minimum ${MIN_LENGTH} characters`}
          </span>
          <span className={charCountClass} aria-live="polite">
            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Inline Error */}
      {hasError && (
        <div id="jd-error" className="jd-card__error" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default JobDescriptionCard;
