import './Footer.css';
import { Aperture, ExternalLink } from 'lucide-react';
import { APP } from '../../utils/constants.js';

/**
 * Footer — Bottom navigation and attribution
 *
 * Responsibility: Renders the app footer with copyright,
 * tech stack credits, and links. Purely presentational.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <span className="footer__logo-icon" aria-hidden="true">
            <Aperture size={14} strokeWidth={2.5} />
          </span>
          <span className="footer__logo-text">{APP.NAME}</span>
        </div>

        {/* Center text */}
        <p className="footer__copy">
          &copy; {year} &mdash; Built with React, Vite &amp; OpenRouter AI
        </p>

        {/* Links */}
        <nav className="footer__links" aria-label="Footer links">
          <a
            href="https://github.com"
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in new tab)"
          >
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
