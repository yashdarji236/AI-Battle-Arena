import React, { useState, useEffect } from 'react';
import InteractiveMockup from './InteractiveMockup';

export default function BentoGrid() {
  const [metricBattles, setMetricBattles] = useState(0);
  const [metricElo, setMetricElo] = useState(0);
  const [metricLatency, setMetricLatency] = useState(0);

  // Count-up metrics intersection observer
  useEffect(() => {
    let triggered = false;
    
    function animateValue(start, end, duration, setter) {
      const s = performance.now();
      const step = (now) => {
        const p = Math.min((now - s) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setter(Math.round(start + e * (end - start)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        // animate counters
        animateValue(0, 120, 1100, setMetricBattles);
        animateValue(0, 2250, 1300, setMetricElo);
        animateValue(120, 48, 1100, setMetricLatency);
      }
    }, { threshold: 0.25 });

    const el = document.querySelector('.c-stats');
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <>
      {/* --- CONTENDERS MARQUEE --- */}
      <section className="marquee">
        <div className="track">
          <div className="item">GEMINI 2.5 FLASH</div>
          <div className="item">MISTRAL MEDIUM</div>
          <div className="item">DEEPSEEK CHAT</div>
          <div className="item">LLAMA 3.3 (GROQ)</div>
          <div className="item">CLAUDE 3 HAIKU</div>
          <div className="item">GPT-4O MINI</div>
          <div className="item">COHERE COMMAND</div>
          {/* Duplicate loop */}
          <div className="item">GEMINI 2.5 FLASH</div>
          <div className="item">MISTRAL MEDIUM</div>
          <div className="item">DEEPSEEK CHAT</div>
          <div className="item">LLAMA 3.3 (GROQ)</div>
          <div className="item">CLAUDE 3 HAIKU</div>
          <div className="item">GPT-4O MINI</div>
          <div className="item">COHERE COMMAND</div>
        </div>
        <span className="lbl">contenders</span>
      </section>

      {/* --- ABOUT (BENTO GRID) --- */}
      <section className="about" id="about">
        <div className="wrap">
          <div className="sec-head">
            <span className="scribble">benchmarks</span>
            <h2>What's up</h2>
          </div>

          <div className="bento">
            {/* Card 1: Statement */}
            <div className="cell c-stmt sel">
              <span className="clbl">STATEMENT.TXT</span>
              <div className="stmt-quote">
                <span className="stmt-qm">
                  <svg viewBox="0 0 64 48" fill="#F0531C">
                    <path d="M0 48V27C0 12 9 3 26 0l2 8C17 11 13 16 13 24h13v24H0zm35 0V27C35 12 44 3 61 0l2 8c-11 3-15 8-15 16h13v24H35z" />
                  </svg>
                </span>
                <h2 className="stmt-head">We make models stop and yield, <span className="stmt-em">who is smarter?</span></h2>
                <p className="stmt-sub">
                  That evaluation is the whole job. <b>Automated graders</b> measuring speed, logic, and code. No human bias, ever.
                </p>
              </div>
              <div className="stmt-foot2">
                <span className="stmt-sign2">NEXUS ARENA, since 2026</span>
                <span className="stmt-avail2"><i></i>matrix running</span>
              </div>
            </div>

            {/* Card 2: Metrics */}
            <div className="cell c-stats">
              <span className="clbl">METRICS</span>
              <div className="stat-row">
                <span className="num">{metricBattles}</span>
                <span className="cap">battles run</span>
              </div>
              <div className="stat-row">
                <span className="num">
                  {metricElo.toLocaleString()}
                  <span className="u star">★</span>
                </span>
                <span className="cap">top ELO score</span>
              </div>
              <div className="stat-row">
                <span className="num">
                  {metricLatency}
                  <span className="u">ms</span>
                </span>
                <span className="cap">avg API Latency</span>
              </div>
            </div>

            {/* Card 3: Capabilities */}
            <div className="cell c-skills">
              <span className="clbl">EVALS</span>
              <div className="chips">
                <span className="chip">UI formatting</span>
                <span className="chip">Code efficiency</span>
                <span className="chip">Logical reasoning</span>
                <span className="chip">Token velocity</span>
                <span className="chip">Error handling</span>
                <span className="chip">Unbiased grading</span>
              </div>
            </div>

            {/* Card 4: Craft / Figma auto-design simulation */}
            <div className="cell c-photo">
              <InteractiveMockup />
            </div>

            {/* Card 5: Now playing / currently building */}
            <div className="cell c-now">
              <span className="label">▶ active battle streams</span>
              <div className="nbig">Mistral Medium vs Cohere Command</div>
              <div className="tools">
                <span className="tchip">Llama 3.3</span>
                <span className="tchip">GPT-4o</span>
                <span className="tchip">Gemini</span>
              </div>
              <div className="eq">
                <span className="animate"></span>
                <span className="animate"></span>
                <span className="animate"></span>
                <span className="animate"></span>
                <span className="animate"></span>
              </div>
            </div>

            {/* Card 6: Quote */}
            <div className="cell c-quote">
              <span className="clbl">EVAL_09</span>
              <div className="stars">★★★★★</div>
              <div className="q">
                "Pitting Mistral vs Claude has never been this transparent. Automated evaluation is completely unbiased."
              </div>
              <div className="by">
                <span className="av">Y</span>
                <span className="bn">YASH D. • AI ENGINEER</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
