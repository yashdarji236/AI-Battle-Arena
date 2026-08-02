import React, { useEffect, useRef } from 'react';

export default function FeaturesTrack() {
  const servicesSecRef = useRef(null);
  const servicesTrackRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sec = servicesSecRef.current;
      const track = servicesTrackRef.current;
      if (sec && track) {
        const rect = sec.getBoundingClientRect();
        const travel = sec.offsetHeight - window.innerHeight;
        const pr = travel > 0 ? Math.max(0, Math.min(1, -rect.top / travel)) : 0;
        const trackMax = track.scrollWidth - window.innerWidth;
        const translateVal = -(pr * trackMax);
        track.style.transform = `translateX(${translateVal}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Initial draw
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section className="services" id="services" ref={servicesSecRef}>
      <div className="wrap">
        <div className="sec-head">
          <span className="scribble">features</span>
          <h2>How it works</h2>
          <span className="note">Scroll down to inspect our combat pipeline</span>
        </div>
      </div>

      <div className="sv-story">
        <div className="sv-pin">
          <div
            className="sv-track"
            ref={servicesTrackRef}
            style={{ transform: 'translateX(0px)' }}
          >
            {/* Card 1 */}
            <div className="sv-panel">
              <div className="sv-card">
                <div className="sv-tab">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="1" />
                  </svg>
                  01 Side-by-Side Duel
                </div>
                <span className="sv-hd tl"></span><span className="sv-hd tr"></span><span className="sv-hd bl"></span><span className="sv-hd br"></span>
                <div className="sv-top">
                  <div className="sv-left">
                    <div className="sv-numtile"><span>01</span></div>
                    <div className="sv-htext">
                      <h3><span className="l1">Parallel Prompt</span><span className="l2">Execution.</span></h3>
                      <p>Witness parallel responses from any two LLMs, eliminating prompt variance bias.</p>
                    </div>
                  </div>
                  <div className="sv-shot">
                    <div className="sv-bar"><b></b><b></b><b></b><span className="u"></span></div>
                    <div className="sv-imgwrap">
                      {/* SVG: Side-by-side dual panel */}
                      <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="sv-svg">
                        {/* BG */}
                        <rect width="520" height="280" rx="10" fill="#0a0d12"/>
                        {/* Left panel */}
                        <rect x="16" y="16" width="234" height="248" rx="8" fill="#111520" stroke="#1e2535" strokeWidth="1"/>
                        <rect x="28" y="28" width="60" height="20" rx="4" fill="#F0531C" opacity="0.9"/>
                        <text x="33" y="42" fontFamily="monospace" fontSize="9" fill="#fff" fontWeight="700">ASSISTANT A</text>
                        <rect x="28" y="58" width="200" height="8" rx="3" fill="#1e2535"/>
                        <rect x="28" y="72" width="180" height="8" rx="3" fill="#1e2535"/>
                        <rect x="28" y="86" width="195" height="8" rx="3" fill="#1e2535"/>
                        <rect x="28" y="100" width="160" height="8" rx="3" fill="#1e2535"/>
                        <rect x="28" y="120" width="140" height="8" rx="3" fill="#1e2535"/>
                        <rect x="28" y="134" width="170" height="8" rx="3" fill="#1e2535"/>
                        {/* Score badge */}
                        <rect x="28" y="220" width="80" height="26" rx="5" fill="#1e2535" stroke="#2a3245" strokeWidth="1"/>
                        <text x="36" y="237" fontFamily="monospace" fontSize="10" fill="#888">SCORE</text>
                        <text x="90" y="237" fontFamily="monospace" fontSize="11" fill="#F0531C" fontWeight="700">8.5</text>
                        {/* Right panel */}
                        <rect x="270" y="16" width="234" height="248" rx="8" fill="#111520" stroke="#0D99FF" strokeWidth="1.5" opacity="0.7"/>
                        <rect x="282" y="28" width="60" height="20" rx="4" fill="#0D99FF" opacity="0.9"/>
                        <text x="287" y="42" fontFamily="monospace" fontSize="9" fill="#fff" fontWeight="700">ASSISTANT B</text>
                        {/* Winner badge */}
                        <rect x="370" y="26" width="116" height="20" rx="4" fill="#d4b483" opacity="0.15"/>
                        <rect x="370" y="26" width="116" height="20" rx="4" stroke="#d4b483" strokeWidth="1" opacity="0.4"/>
                        <text x="380" y="40" fontFamily="monospace" fontSize="8" fill="#d4b483" fontWeight="700">WINNER →</text>
                        <rect x="282" y="58" width="200" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="72" width="185" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="86" width="200" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="100" width="175" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="120" width="155" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="134" width="190" height="8" rx="3" fill="#1e2535"/>
                        <rect x="282" y="220" width="80" height="26" rx="5" fill="#1e2535" stroke="#0D99FF" strokeWidth="1" opacity="0.6"/>
                        <text x="290" y="237" fontFamily="monospace" fontSize="10" fill="#888">SCORE</text>
                        <text x="344" y="237" fontFamily="monospace" fontSize="11" fill="#0D99FF" fontWeight="700">9.5</text>
                        {/* VS divider */}
                        <circle cx="260" cy="140" r="16" fill="#16202e" stroke="#2a3245" strokeWidth="1"/>
                        <text x="260" y="145" fontFamily="monospace" fontSize="9" fill="#888" fontWeight="700" textAnchor="middle">VS</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="sv-panel">
              <div className="sv-card">
                <div className="sv-tab">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="1" />
                  </svg>
                  02 Automated Judging
                </div>
                <span className="sv-hd tl"></span><span className="sv-hd tr"></span><span className="sv-hd bl"></span><span className="sv-hd br"></span>
                <div className="sv-top">
                  <div className="sv-left">
                    <div className="sv-numtile"><span>02</span></div>
                    <div className="sv-htext">
                      <h3><span className="l1">Gemini Flash</span><span className="l2">Grader.</span></h3>
                      <p>The Decision Matrix grades logical consistency, format compliance, and speed to crown a winner.</p>
                    </div>
                  </div>
                  <div className="sv-shot">
                    <div className="sv-bar"><b></b><b></b><b></b><span className="u"></span></div>
                    <div className="sv-imgwrap">
                      {/* SVG: Scoring / Judge Matrix */}
                      <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="sv-svg">
                        <rect width="520" height="280" rx="10" fill="#0a0d12"/>
                        {/* Header */}
                        <rect x="16" y="16" width="488" height="38" rx="6" fill="#111520" stroke="#1e2535" strokeWidth="1"/>
                        <circle cx="36" cy="35" r="7" fill="#F0531C" opacity="0.8"/>
                        <text x="50" y="39" fontFamily="monospace" fontSize="9" fill="#888" fontWeight="700" letterSpacing="1">⊙ GEMINI DECISIONAL MATRIX</text>
                        {/* Verdict row */}
                        <rect x="16" y="64" width="488" height="44" rx="6" fill="#0d1117" stroke="#1e2535" strokeWidth="1"/>
                        <text x="32" y="82" fontFamily="monospace" fontSize="11" fill="#fff" fontWeight="700">Verdict:</text>
                        <rect x="100" y="70" width="160" height="22" rx="4" fill="#F0531C" opacity="0.15"/>
                        <rect x="100" y="70" width="160" height="22" rx="4" stroke="#F0531C" strokeWidth="1" opacity="0.5"/>
                        <text x="110" y="85" fontFamily="monospace" fontSize="9" fill="#F0531C" fontWeight="700">LLAMA 3.3 (GROQ) WINS</text>
                        {/* Scores right */}
                        <text x="350" y="82" fontFamily="monospace" fontSize="10" fill="#555" textAnchor="middle">8.5/10</text>
                        <text x="395" y="82" fontFamily="monospace" fontSize="9" fill="#333">VS</text>
                        <text x="445" y="82" fontFamily="monospace" fontSize="13" fill="#fff" fontWeight="700" textAnchor="middle">9.5/10</text>
                        {/* Eval cards */}
                        <rect x="16" y="120" width="238" height="140" rx="6" fill="#0d1117" stroke="#1e2535" strokeWidth="1"/>
                        <text x="28" y="137" fontFamily="monospace" fontSize="8" fill="#F0531C" fontWeight="700">CLAUDE 3 HAIKU EVALUATION:</text>
                        <rect x="28" y="145" width="190" height="7" rx="2" fill="#1e2535"/>
                        <rect x="28" y="157" width="180" height="7" rx="2" fill="#1e2535"/>
                        <rect x="28" y="169" width="195" height="7" rx="2" fill="#1e2535"/>
                        <rect x="28" y="181" width="160" height="7" rx="2" fill="#1e2535"/>
                        <rect x="28" y="193" width="175" height="7" rx="2" fill="#1e2535"/>
                        <rect x="266" y="120" width="238" height="140" rx="6" fill="#0d1117" stroke="#0D99FF" strokeWidth="1" opacity="0.5"/>
                        <text x="278" y="137" fontFamily="monospace" fontSize="8" fill="#F0531C" fontWeight="700">LLAMA 3.3 EVALUATION:</text>
                        <rect x="278" y="145" width="190" height="7" rx="2" fill="#1e2535"/>
                        <rect x="278" y="157" width="185" height="7" rx="2" fill="#1e2535"/>
                        <rect x="278" y="169" width="200" height="7" rx="2" fill="#1e2535"/>
                        <rect x="278" y="181" width="165" height="7" rx="2" fill="#1e2535"/>
                        <rect x="278" y="193" width="180" height="7" rx="2" fill="#1e2535"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="sv-panel">
              <div className="sv-card">
                <div className="sv-tab">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="1" />
                  </svg>
                  03 Live Rankings
                </div>
                <span className="sv-hd tl"></span><span className="sv-hd tr"></span><span className="sv-hd bl"></span><span className="sv-hd br"></span>
                <div className="sv-top">
                  <div className="sv-left">
                    <div className="sv-numtile"><span>03</span></div>
                    <div className="sv-htext">
                      <h3><span className="l1">Automated ELO</span><span className="l2">Leaderboard.</span></h3>
                      <p>Watch model ELO ratings adjust dynamically with every battle. See who rules the leaderboard.</p>
                    </div>
                  </div>
                  <div className="sv-shot">
                    <div className="sv-bar"><b></b><b></b><b></b><span className="u"></span></div>
                    <div className="sv-imgwrap">
                      {/* SVG: ELO Leaderboard */}
                      <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="sv-svg">
                        <rect width="520" height="280" rx="10" fill="#0a0d12"/>
                        {/* Header */}
                        <rect x="16" y="16" width="488" height="32" rx="6" fill="#111520" stroke="#1e2535" strokeWidth="1"/>
                        <text x="28" y="36" fontFamily="monospace" fontSize="9" fill="#888" fontWeight="700" letterSpacing="1">🏆 ELO LEADERBOARD — LIVE</text>
                        <rect x="420" y="22" width="70" height="20" rx="4" fill="#27c06b" opacity="0.12"/>
                        <text x="433" y="36" fontFamily="monospace" fontSize="8" fill="#27c06b" fontWeight="700">● LIVE</text>
                        {/* Row 1 – Gold */}
                        <rect x="16" y="58" width="488" height="36" rx="5" fill="#d4b483" opacity="0.06"/>
                        <rect x="16" y="58" width="488" height="36" rx="5" stroke="#d4b483" strokeWidth="1" opacity="0.2"/>
                        <text x="32" y="81" fontFamily="monospace" fontSize="11" fill="#d4b483" fontWeight="700">#1</text>
                        <text x="60" y="81" fontFamily="monospace" fontSize="11" fill="#fff" fontWeight="700">Llama 3.3 (Groq)</text>
                        <rect x="290" y="67" width="160" height="8" rx="3" fill="#d4b483" opacity="0.7"/>
                        <text x="462" y="81" fontFamily="monospace" fontSize="11" fill="#d4b483" fontWeight="700">1847</text>
                        {/* Row 2 */}
                        <rect x="16" y="102" width="488" height="36" rx="5" fill="#1e2535"/>
                        <text x="32" y="125" fontFamily="monospace" fontSize="11" fill="#888" fontWeight="700">#2</text>
                        <text x="60" y="125" fontFamily="monospace" fontSize="11" fill="#ccc">GPT-4o (OpenAI)</text>
                        <rect x="290" y="111" width="130" height="8" rx="3" fill="#0D99FF" opacity="0.5"/>
                        <text x="462" y="125" fontFamily="monospace" fontSize="11" fill="#aaa">1821</text>
                        {/* Row 3 */}
                        <rect x="16" y="146" width="488" height="36" rx="5" fill="#111520"/>
                        <text x="32" y="169" fontFamily="monospace" fontSize="11" fill="#888" fontWeight="700">#3</text>
                        <text x="60" y="169" fontFamily="monospace" fontSize="11" fill="#ccc">Claude 3 Haiku</text>
                        <rect x="290" y="155" width="105" height="8" rx="3" fill="#7C3AED" opacity="0.5"/>
                        <text x="462" y="169" fontFamily="monospace" fontSize="11" fill="#aaa">1798</text>
                        {/* Row 4 */}
                        <rect x="16" y="190" width="488" height="36" rx="5" fill="#0d1117"/>
                        <text x="32" y="213" fontFamily="monospace" fontSize="11" fill="#555" fontWeight="700">#4</text>
                        <text x="60" y="213" fontFamily="monospace" fontSize="11" fill="#666">Mistral Medium</text>
                        <rect x="290" y="199" width="82" height="8" rx="3" fill="#F0531C" opacity="0.35"/>
                        <text x="462" y="213" fontFamily="monospace" fontSize="11" fill="#555">1762</text>
                        {/* Row 5 */}
                        <rect x="16" y="234" width="488" height="32" rx="5" fill="#0d1117"/>
                        <text x="32" y="254" fontFamily="monospace" fontSize="11" fill="#333" fontWeight="700">#5</text>
                        <text x="60" y="254" fontFamily="monospace" fontSize="11" fill="#444">Gemini Flash</text>
                        <rect x="290" y="242" width="62" height="8" rx="3" fill="#1e2535"/>
                        <text x="462" y="254" fontFamily="monospace" fontSize="11" fill="#333">1734</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
