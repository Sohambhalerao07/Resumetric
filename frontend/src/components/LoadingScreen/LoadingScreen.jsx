import './LoadingScreen.css';
import { CheckCircle, Loader } from 'lucide-react';

/**
 * LoadingScreen — Multi-step progress indicator
 *
 * Responsibility: Shown while AI analysis is running.
 * Displays step-by-step progress to reduce perceived wait time.
 * The spinner and step list communicate real progress.
 *
 * @param {number}   currentStep  - Index of the active step (0-based)
 * @param {Array}    steps        - Array of { id, label, icon } step objects
 * @param {number}   uploadPct    - Upload progress (0-100)
 */
function LoadingScreen({ currentStep, steps, uploadPct }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label="Analysis in progress">
      {/* Central spinner */}
      <div className="loading-screen__spinner-wrap" aria-hidden="true">
        <div className="loading-screen__spinner-ring loading-screen__spinner-ring--outer" />
        <div className="loading-screen__spinner-ring loading-screen__spinner-ring--inner" />
        <div className="loading-screen__spinner-icon">
          <Loader size={24} className="animate-spin" />
        </div>
      </div>

      {/* Heading */}
      <div className="loading-screen__heading">
        <h2 className="loading-screen__title">Analyzing your resume</h2>
        <p className="loading-screen__subtitle">
          {steps[currentStep]?.label || 'Processing...'}
        </p>
      </div>

      {/* Upload progress bar */}
      {uploadPct > 0 && uploadPct < 100 && (
        <div className="loading-screen__upload-progress" aria-label={`Upload progress: ${uploadPct}%`}>
          <div className="loading-screen__progress-bar">
            <div
              className="loading-screen__progress-fill"
              style={{ width: `${uploadPct}%` }}
              role="progressbar"
              aria-valuenow={uploadPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="loading-screen__progress-label">Uploading: {uploadPct}%</span>
        </div>
      )}

      {/* Step list */}
      <ol className="loading-screen__steps" aria-label="Analysis steps">
        {steps.map((step, index) => {
          const isDone    = index < currentStep;
          const isActive  = index === currentStep;
          const isPending = index > currentStep;

          const stepClass = [
            'loading-screen__step',
            isDone   && 'loading-screen__step--done',
            isActive && 'loading-screen__step--active',
            isPending && 'loading-screen__step--pending',
          ].filter(Boolean).join(' ');

          return (
            <li key={step.id} className={stepClass}>
              <span className="loading-screen__step-dot" aria-hidden="true">
                {isDone && <CheckCircle size={14} />}
                {isActive && <span className="loading-screen__step-pulse" />}
              </span>
              <span className="loading-screen__step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      {/* Reassurance text */}
      <p className="loading-screen__reassurance">
        This may take 15–30 seconds. We&rsquo;re using Google Gemini AI for a thorough analysis.
      </p>
    </div>
  );
}

export default LoadingScreen;
