import React from 'react';

export default function Topbar({ onEnter }) {
  return (
    <div className="topbar">
      <div className="pill status-pill">
        <span className="dot animate-pulse"></span>
        <span>7 contenders operational</span>
      </div>

      <nav className="pill nav-pill">
        <a className="home" href="#top">Home</a>
        <a href="#about">About</a>
        <a href="#process">Combat Log</a>
        <a href="#services">Features</a>
        <a href="#leaderboard">Contenders</a>
        <a href="#pricing">ELO pricing</a>
        <button onClick={onEnter} className="cta">Enter Arena</button>
      </nav>

      <button onClick={onEnter} className="pill mail-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <span>launch_arena.exe</span>
      </button>
    </div>
  );
}
