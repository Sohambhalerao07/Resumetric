/**
 * App.jsx — Root component
 *
 * Responsibility: Wires all top-level components together.
 * Owns the toast and matcher hooks and passes state down.
 * The only component that sees the complete application state.
 */

import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/utilities.css';

import Navbar             from './components/Navbar/Navbar.jsx';
import HeroSection        from './components/HeroSection/HeroSection.jsx';
import ResumeUploadCard   from './components/ResumeUploadCard/ResumeUploadCard.jsx';
import JobDescriptionCard from './components/JobDescriptionCard/JobDescriptionCard.jsx';
import AnalyzeButton      from './components/AnalyzeButton/AnalyzeButton.jsx';
import LoadingScreen      from './components/LoadingScreen/LoadingScreen.jsx';
import ResultsContainer   from './components/ResultsContainer/ResultsContainer.jsx';
import Footer             from './components/Footer/Footer.jsx';
import { ToastContainer } from './components/ToastNotification/ToastNotification.jsx';

import useToast          from './hooks/useToast.js';
import useResumeMatcher  from './hooks/useResumeMatcher.js';

function App() {
  const toast   = useToast();
  const matcher = useResumeMatcher(toast);

  return (
    <div className="page-layout">
      {/* Fixed navigation */}
      <Navbar />

      <main className="page-main" id="main-content">
        {/* Hero */}
        <HeroSection />

        {/* ── Input Section ── */}
        <section
          id="matcher-form"
          className="section section--sm"
          aria-label="Resume and job description inputs"
        >
          <div className="container">
            <div className="input-area">
              {/* Left: Resume upload */}
              <ResumeUploadCard
                file={matcher.file}
                error={matcher.fileError}
                onFileSelect={matcher.handleFileSelect}
              />

              {/* Right: Job description */}
              <JobDescriptionCard
                value={matcher.jobDescription}
                error={matcher.textError}
                onChange={matcher.handleJobDescriptionChange}
              />
            </div>

            {/* Analyze / Reset button */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <AnalyzeButton
                isAnalyzing={matcher.isAnalyzing}
                isReady={matcher.isReadyToAnalyze}
                hasAnalyzed={matcher.hasAnalyzed}
                onAnalyze={matcher.analyze}
                onReset={matcher.reset}
              />
            </div>
          </div>
        </section>

        {/* ── Results / Loading Section ── */}
        <section
          className="section section--sm"
          aria-label="Analysis results"
          aria-live="polite"
        >
          <div className="container container--narrow">
            {matcher.isAnalyzing ? (
              <LoadingScreen
                currentStep={matcher.analysisProgress}
                steps={matcher.analysisSteps}
                uploadPct={matcher.uploadProgress}
              />
            ) : (
              <ResultsContainer
                result={matcher.result}
                hasAnalyzed={matcher.hasAnalyzed}
                error={matcher.analysisError}
              />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast notifications (portal-like, fixed position) */}
      <ToastContainer
        toasts={toast.toasts}
        onRemove={toast.removeToast}
      />
    </div>
  );
}

export default App;
