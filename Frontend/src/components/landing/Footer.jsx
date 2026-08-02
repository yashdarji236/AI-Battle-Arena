import React from 'react';

export default function Footer({ currentTime, istHour, onEnter }) {
  const getFooterState = () => {
    if (istHour >= 5 && istHour < 8) {
      return {
        hl: 'First coffee, <span class="o">then battle.</span>',
        tape: "sunrise in india",
        sub: `It's <b>${currentTime.slice(0, 5)}</b> at the arena. Clocks are ticking, and combat is starting up.`,
        cta: "Enter Arena"
      };
    }
    if (istHour >= 8 && istHour < 17) {
      return {
        hl: 'Perfect light for <span class="o">combat.</span>',
        tape: "the sun's up in india",
        sub: `It's <b>${currentTime.slice(0, 5)}</b> at the arena. All endpoints compile. Send your prompts.`,
        cta: "Enter Arena"
      };
    }
    if (istHour >= 17 && istHour < 20) {
      return {
        hl: 'Golden hour <span class="o">battles.</span>',
        tape: "golden hour in india",
        sub: `It's <b>${currentTime.slice(0, 5)}</b> at the arena. The best reasoning parameters always land now.`,
        cta: "Enter Arena"
      };
    }
    return {
      hl: 'Engines never <span class="o">sleep.</span>',
      tape: "it's late in india",
      sub: `It's <b>${currentTime.slice(0, 5)}</b> at the arena. Standby mode online. Launch ELO combats at will.`,
      cta: "Enter Arena"
    };
  };

  const footerState = getFooterState();

  return (
    <footer className="foot">
      <div className="foot-horizon"></div>
      <span className="foot-flabel"><span className="ff-mark"></span> footer.frame</span>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="foot-totop"
        aria-label="Back to top"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>

      <div className="wrap">
        <div className="foot-top">
          <div className="foot-cta">
            <div className="foot-eyebrow">have a prompt worth testing?</div>
            <button onClick={onEnter} className="foot-mail">
              launch_arena.exe
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </button>
            <div className="foot-row">
              <button onClick={onEnter} className="foot-book">
                Enter Combat Arena
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <span className="foot-live">
                <span className="foot-dot"></span>
                <span id="dnTape">{footerState.tape}</span>
              </span>
            </div>
          </div>

          <div className="foot-nav">
            <div className="fcol">
              <h4>Arena</h4>
              <a href="#about">About</a>
              <a href="#services">Features</a>
              <a href="#leaderboard">Contenders</a>
              <a href="#pricing">ELO Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="fcol">
              <h4>System</h4>
              <button onClick={onEnter}>API Console</button>
              <button onClick={onEnter}>Dispatch log</button>
              <button onClick={onEnter}>Leaderboards</button>
            </div>
          </div>
        </div>
      </div>

      <div className="foot-stage reveal in">
        <div className="foot-word" aria-label="NEXUS AI">
          <span className="o">N</span><span>e</span><span>x</span><span>u</span><span>s</span><span>A</span><span>I</span>
        </div>
      </div>

      <div className="foot-rule"></div>

      <div className="wrap">
        <div className="foot-bar">
          <span className="fbar-l"><b></b> nexus_proving_ground.fig</span>
          <span className="fbar-c">
            <span className="foot-dot"></span>
            <span>7 contenders active &middot; {currentTime.slice(0, 8)} IST</span>
          </span>
          <span className="fbar-r">&copy; 2026 &middot; Nexus AI Benchmarking Arena</span>
        </div>
      </div>
    </footer>
  );
}
