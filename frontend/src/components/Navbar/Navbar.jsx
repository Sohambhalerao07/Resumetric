import './Navbar.css';
import { Aperture } from 'lucide-react';
import { APP } from '../../utils/constants.js';

/**
 * Navbar — Top navigation bar
 *
 * Responsibility: Renders the app logo/name and top-level nav links.
 * Stays minimal to not distract from the main content.
 */
function Navbar() {
  return (
    <header className="navbar" role="banner">
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="/" className="navbar__logo" aria-label="ResumeMatch AI - Home">
          <span className="navbar__logo-icon" aria-hidden="true">
            <Aperture size={18} strokeWidth={2.5} />
          </span>
          <span className="navbar__logo-text">{APP.NAME}</span>
        </a>

        {/* Right side */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <span className="navbar__badge">Powered by OpenRouter AI</span>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
