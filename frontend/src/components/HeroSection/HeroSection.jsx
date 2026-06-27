import './HeroSection.css';
import { Sparkles, ArrowDown } from 'lucide-react';

/**
 * HeroSection — Welcome message and value proposition
 *
 * Responsibility: First thing the user sees. Sets the tone, explains the app,
 * and guides them to start. No state or logic — purely presentational.
 */
function HeroSection() {
  const scrollToForm = () => {
    document.getElementById('matcher-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* Background decoration */}
      <div className="hero__bg-decoration" aria-hidden="true">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />
      </div>

      <div className="container hero__content">
        {/* Eyebrow label */}
        <div className="hero__eyebrow animate-fade-in-up">
          <Sparkles size={14} aria-hidden="true" />
          <span>AI-Powered Resume Analysis</span>
        </div>

        {/* Headline */}
        <h1 id="hero-title" className="hero__title animate-fade-in-up stagger-1">
          Match Your Resume to
          <span className="hero__title-accent"> Any Job</span>
        </h1>

        {/* Subtext */}
        <p className="hero__description animate-fade-in-up stagger-2">
          Upload your resume and paste a job description. Our AI analyzes the match,
          identifies skill gaps, and gives you actionable recommendations to land the role.
        </p>

        {/* Feature pills */}
        <div className="hero__features animate-fade-in-up stagger-3" aria-label="Key features">
          {[
            'Match Score',
            'Skill Gap Analysis',
            'Smart Recommendations',
            'Instant Results',
          ].map(feature => (
            <span key={feature} className="hero__feature-pill">
              {feature}
            </span>
          ))}
        </div>

        {/* Scroll CTA */}
        <button
          className="hero__scroll-btn animate-fade-in-up stagger-4"
          onClick={scrollToForm}
          aria-label="Scroll to analysis form"
          type="button"
        >
          <span>Start Analyzing</span>
          <ArrowDown size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
