import React, { useState } from 'react';

export default function Topbar({ onEnter, onNavigate, currentView = 'home' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoHome = (e) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoDashboard = (e) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/dashboard');
    }
  };

  const handleSectionClick = (e, sectionId) => {
    setMobileMenuOpen(false);
    e.preventDefault();
    if (currentView !== 'home' && onNavigate) {
      onNavigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <div className="topbar">
        {/* Brand Logo & Title - Shown in all responsive formats */}
        <a href="/" onClick={handleGoHome} className="topbar-brand">
          <span className="brand-dot animate-pulse"></span>
          <span className="brand-title">NEXUS <span className="brand-accent">AI ARENA</span></span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="pill nav-pill desktop-nav">
          <a
            className={`home ${currentView === 'home' ? 'active-nav-link' : ''}`}
            href="/"
            onClick={handleGoHome}
          >
            Home
          </a>
          <a
            className={`dashboard-nav-link ${currentView === 'dashboard' ? 'active-nav-link' : ''}`}
            href="/dashboard"
            onClick={handleGoDashboard}
          >
            Dashboard & Wins
          </a>
          <a href="#about" onClick={(e) => handleSectionClick(e, 'about')}>About</a>
          <a href="#process" onClick={(e) => handleSectionClick(e, 'process')}>Combat Log</a>
          <a href="#services" onClick={(e) => handleSectionClick(e, 'services')}>Features</a>

          <button onClick={onEnter} className="cta">Enter Arena</button>
        </nav>

        {/* Desktop Right CTA */}
        <button onClick={onEnter} className="pill mail-pill desktop-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <span>launch_arena.exe</span>
        </button>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="topbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Navigation Modal */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="brand-title">NEXUS <span className="brand-accent">AI ARENA</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className="mobile-close-btn">✕</button>
            </div>

            <div className="mobile-nav-links">
              <a
                href="/"
                className={currentView === 'home' ? 'active-nav-link' : ''}
                onClick={handleGoHome}
              >
                Home
              </a>
              <a
                href="/dashboard"
                className={currentView === 'dashboard' ? 'active-nav-link' : ''}
                onClick={handleGoDashboard}
              >
                Dashboard & Wins
              </a>
              <a href="#about" onClick={(e) => handleSectionClick(e, 'about')}> About</a>
              <a href="#process" onClick={(e) => handleSectionClick(e, 'process')}>Combat Log</a>
              <a href="#services" onClick={(e) => handleSectionClick(e, 'services')}>Features</a>
            </div>

            <button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="mobile-enter-cta">
              Enter AI Arena
            </button>
          </div>
        </div>
      )}
    </>
  );
}
