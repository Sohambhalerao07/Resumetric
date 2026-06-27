import './AnalyzeButton.css';
import { Cpu, RotateCcw, Loader } from 'lucide-react';

/**
 * AnalyzeButton — Primary CTA button
 *
 * Responsibility: Renders the "Analyze" or "Analyze Again" button.
 * Disabled when form isn't ready or analysis is running.
 * Shows spinner during analysis.
 *
 * @param {boolean}  isAnalyzing      - Analysis in progress
 * @param {boolean}  isReady          - Form is valid and ready
 * @param {boolean}  hasAnalyzed      - Prior analysis exists
 * @param {Function} onAnalyze        - Start analysis callback
 * @param {Function} onReset          - Reset form callback
 */
function AnalyzeButton({ isAnalyzing, isReady, hasAnalyzed, onAnalyze, onReset }) {
  if (isAnalyzing) {
    return (
      <div className="analyze-button-wrap">
        <button
          type="button"
          className="analyze-btn analyze-btn--loading"
          disabled
          aria-busy="true"
          aria-label="Analysis in progress..."
        >
          <Loader size={20} className="animate-spin" aria-hidden="true" />
          <span>Analyzing...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="analyze-button-wrap">
      <button
        id="analyze-btn"
        type="button"
        className={`analyze-btn${isReady ? ' analyze-btn--ready' : ''}`}
        onClick={onAnalyze}
        disabled={!isReady}
        aria-disabled={!isReady}
        aria-label={hasAnalyzed ? 'Analyze again' : 'Analyze match'}
      >
        <Cpu size={20} aria-hidden="true" />
        <span>{hasAnalyzed ? 'Analyze Again' : 'Analyze Match'}</span>
      </button>

      {/* Reset button — only shown after an analysis */}
      {hasAnalyzed && (
        <button
          id="reset-btn"
          type="button"
          className="reset-btn"
          onClick={onReset}
          aria-label="Reset form and start over"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Start Over</span>
        </button>
      )}
    </div>
  );
}

export default AnalyzeButton;
