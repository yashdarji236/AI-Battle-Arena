import React, { useState } from 'react';

export default function DiffComparison({ onEnter, onNavigate }) {
  const [hoveredDiff, setHoveredDiff] = useState(null);

  const handleGoDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <>
      {/* --- RANKINGS LEADERBOARD --- */}
      <section className="work" id="leaderboard">
        <div className="wrap">
          <div className="sec-head flex-between">
            <div>
              <span className="scribble">rankings</span>
              <h2>Top Contenders</h2>
            </div>
            <button onClick={handleGoDashboard} className="dash-view-link">
              View Full Victory Dashboard →
            </button>
          </div>

          <div className="wlist">
            <button onClick={onEnter} className="witem">
              <span className="wix">01</span>
              <span className="wnm">Gemini 2.5 Flash</span>
              <div className="wmid">
                <span className="wsub">Fastest, best instruction following</span>
                <div className="wtags">
                  <span className="ft">Google</span>
                  <span className="ft">LATEST</span>
                </div>
              </div>
              <span className="wdate">ELO 2,250</span>
              <span className="warr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button onClick={onEnter} className="witem">
              <span className="wix">02</span>
              <span className="wnm">DeepSeek Chat</span>
              <div className="wmid">
                <span className="wsub">Exceptional coding reasoning</span>
                <div className="wtags">
                  <span className="ft">DeepSeek</span>
                  <span className="ft">OPENROUTER</span>
                </div>
              </div>
              <span className="wdate">ELO 2,220</span>
              <span className="warr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button onClick={onEnter} className="witem">
              <span className="wix">03</span>
              <span className="wnm">Llama 3.3 (Groq)</span>
              <div className="wmid">
                <span className="wsub">Blazing fast token output</span>
                <div className="wtags">
                  <span className="ft">Meta</span>
                  <span className="ft">70B PARAM</span>
                </div>
              </div>
              <span className="wdate">ELO 2,190</span>
              <span className="warr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button onClick={onEnter} className="witem">
              <span className="wix">04</span>
              <span className="wnm">Claude 3 Haiku</span>
              <div className="wmid">
                <span className="wsub">Lightweight and prompt precise</span>
                <div className="wtags">
                  <span className="ft">Anthropic</span>
                  <span className="ft">OPENROUTER</span>
                </div>
              </div>
              <span className="wdate">ELO 2,150</span>
              <span className="warr">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* --- THE DIFFERENCE BOARD (FIGMA COMPARISON) --- */}
      <section className="diff">
        <div className="wrap">
          <div className="sec-head">
            <span className="diff-kick">comparison</span>
            <h2>same brief. different outcome.</h2>
          </div>

          <div className="diff-win in">
            <div className="figbar">
              <div className="lights">
                <i className="r"></i>
                <i className="y"></i>
                <i className="g"></i>
              </div>
              <span className="fname">proving_ground.fig</span>
              <div className="fright">
                <span className="zoom">100%</span>
                <span className="avs">
                  <span className="av av-logo" style={{ backgroundColor: '#F0531C' }}>N</span>
                  <span className="av" style={{ backgroundColor: '#0D99FF' }}>G</span>
                </span>
              </div>
            </div>

            <div className="diff-body">
              {/* Left Column: Them (Static Tables) */}
              <div
                className="diff-frame diff-them"
                onMouseEnter={() => setHoveredDiff(0)}
                onMouseLeave={() => setHoveredDiff(null)}
              >
                <div className="diff-fhead">
                  <span className="diff-fname">Static Benchmarks</span>
                  <span className="diff-flock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>
                <ul className="diff-list">
                  <li className={hoveredDiff === 0 ? 'struck' : ''}>
                    <span className="diff-mark x">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </span>
                    <span>Stale ELO ratings from last quarter</span>
                  </li>
                  <li className={hoveredDiff === 1 ? 'struck' : ''}>
                    <span className="diff-mark x">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </span>
                    <span>Biased manual human evaluations</span>
                  </li>
                  <li className={hoveredDiff === 2 ? 'struck' : ''}>
                    <span className="diff-mark x">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </span>
                    <span>No debugging or connection logs</span>
                  </li>
                  <li className={hoveredDiff === 3 ? 'struck' : ''}>
                    <span className="diff-mark x">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </span>
                    <span>Locked configurations, no custom inputs</span>
                  </li>
                </ul>
              </div>

              {/* Spine VS */}
              <div className="diff-spine">
                <div className="diff-vs">VS</div>
              </div>

              {/* Right Column: Us (Nexus Arena) */}
              <div
                className="diff-frame diff-us"
                onMouseEnter={() => setHoveredDiff(0)}
                onMouseLeave={() => setHoveredDiff(null)}
              >
                <div className="diff-fhead">
                  <span className="diff-fname">Nexus AI Arena</span>
                  <span className="diff-fmeta">ACTIVE</span>
                  <span className="diff-favatar">N</span>
                </div>
                <ul className="diff-list">
                  <li className={hoveredDiff === 0 ? 'hot' : ''}>
                    <span className="diff-mark c">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    <span><b>Real-time ELO updates</b> with every combat</span>
                  </li>
                  <li className={hoveredDiff === 1 ? 'hot' : ''}>
                    <span className="diff-mark c">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    <span><b>GeminiFlash matrix</b> decision graders</span>
                  </li>
                  <li className={hoveredDiff === 2 ? 'hot' : ''}>
                    <span className="diff-mark c">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    <span><b>Real-time connection console</b> streaming</span>
                  </li>
                  <li className={hoveredDiff === 3 ? 'hot' : ''}>
                    <span className="diff-mark c">
                      <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                    </span>
                    <span><b>Flexible inputs</b>, write any custom prompt</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
