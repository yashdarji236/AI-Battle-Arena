import React, { useState } from 'react';

export default function CombatStream() {
  const [judgeOpen, setJudgeOpen] = useState(true);

  return (
    <section className="process" id="process">
      <div className="wrap">
        <div className="sec-head">
          <span className="scribble">pipeline</span>
          <h2>No forms. No hoops. Just this.</h2>
          <span className="note">One click combat, zero delay.</span>
        </div>

        {/* Arena Battle Preview */}
        <div className="arena-preview">

          {/* Question bar */}
          <div className="ap-question">
            <span>What is the price of BMW m4 competition? (answer in 1 line)</span>
          </div>

          {/* Side-by-side response cards */}
          <div className="ap-cards">
            {/* Assistant A */}
            <div className="ap-card">
              <div className="ap-card-header">
                <div className="ap-avatar" style={{ backgroundColor: '#F0531C' }}>A</div>
                <div className="ap-card-meta">
                  <span className="ap-card-name">Assistant A</span>
                  <span className="ap-card-model">CLAUDE 3 HAIKU (OPENROUTER)</span>
                </div>
                <span className="ap-score">SCORE: 8.5/10</span>
              </div>
              <div className="ap-card-body">
                The starting price of the BMW M4 Competition is around <strong>$76,900</strong> in the United States.
              </div>
            </div>

            {/* Assistant B */}
            <div className="ap-card winner">
              <div className="ap-winner-badge">WINNER →</div>
              <div className="ap-card-header">
                <div className="ap-avatar" style={{ backgroundColor: '#7C3AED' }}>B</div>
                <div className="ap-card-meta">
                  <span className="ap-card-name">Assistant B</span>
                  <span className="ap-card-model">LLAMA 3.3 (GROQ)</span>
                </div>
                <span className="ap-score">SCORE: 9.5/10</span>
              </div>
              <div className="ap-card-body">
                The price of a BMW M4 Competition starts at around <strong>$74,700</strong> in the United States, but can vary depending on the location, trim, and features.
              </div>
            </div>
          </div>

          {/* Vote row */}
          <div className="ap-vote-row">
            <button className="ap-vote-btn">← Assistant A is better</button>
            <button className="ap-vote-btn">⇄ Both are good</button>
            <button className="ap-vote-btn">⊘ Both are bad</button>
            <button className="ap-vote-btn active">Assistant B is better →</button>
          </div>

          {/* Verdict panel */}
          <div className="ap-verdict">
            <div className="ap-verdict-top">
              <div className="ap-verdict-left">
                <span className="ap-verdict-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/></svg>
                  GEMINI DECISIONAL MATRIX
                </span>
                <div className="ap-verdict-line">
                  Verdict: <span className="ap-verdict-badge">LLAMA 3.3 (GROQ) WINS</span>
                </div>
              </div>
              <div className="ap-verdict-scores">
                <div className="ap-vs-score">
                  <span className="ap-vs-model">CLAUDE 3 HAIKU (OPENROUTER)</span>
                  <span className="ap-vs-num">8.5/10</span>
                </div>
                <span className="ap-vs-sep">VS</span>
                <div className="ap-vs-score">
                  <span className="ap-vs-model">LLAMA 3.3 (GROQ)</span>
                  <span className="ap-vs-num highlight">9.5/10</span>
                </div>
              </div>
            </div>

            <button className="ap-collapse-btn" onClick={() => setJudgeOpen(o => !o)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={judgeOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
              </svg>
              {judgeOpen ? 'Collapse' : 'Expand'} Judge Evaluation
            </button>

            {judgeOpen && (
              <div className="ap-eval-grid">
                <div className="ap-eval-card">
                  <div className="ap-eval-title">CLAUDE 3 HAIKU (OPENROUTER) EVALUATION:</div>
                  <p>Solution 1 provides a concise, one-line response that accurately estimates the starting price of the BMW M4 Competition in the US.</p>
                </div>
                <div className="ap-eval-card">
                  <div className="ap-eval-title">LLAMA 3.3 (GROQ) EVALUATION:</div>
                  <p>Solution 2 provides an accurate starting MSRP ($74,700 for the 2021 model year launch) in a single line, while also helpfully noting that prices vary by options and location.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
