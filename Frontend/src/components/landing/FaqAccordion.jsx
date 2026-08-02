import React, { useState } from 'react';

export default function FaqAccordion() {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <span className="scribble">questions</span>
          <h2>The nosy section</h2>
        </div>

        <div className="fx-frames">

          <div className={`fx-qa ${activeFaq === 0 ? 'on' : ''}`}>
            <span className="fx-tab">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="1" /></svg>
              elo-grading.frame
            </span>
            <div className="fx-card">
              <span className="fx-sel"></span><span className="fx-h tl"></span><span className="fx-h tr"></span><span className="fx-h bl"></span><span className="fx-h br"></span>
              <span className="fx-dim">480 × 120</span>
              <button className="fx-head" onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}>
                <span className="fx-ix">01</span>
                <span className="fx-q">How does the Gemini Decision Matrix evaluate models?</span>
                <span className="fx-pm"></span>
              </button>
              <div className="fx-a">
                <div>
                  <div className="fx-inspect">
                    <div className="fx-prop">
                      <div className="fx-k">answer</div>
                      <div className="fx-v">
                        Gemini 2.5 Flash acts as an automated judge. It inspects both prompt replies, measuring criteria like <b>instruction matching, code correctness, error catching, and response latency</b> to score them out of 100 and output structured evaluation logs.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`fx-qa ${activeFaq === 1 ? 'on' : ''}`}>
            <span className="fx-tab">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="1" /></svg>
              rankings.frame
            </span>
            <div className="fx-card">
              <span className="fx-sel"></span><span className="fx-h tl"></span><span className="fx-h tr"></span><span className="fx-h bl"></span><span className="fx-h br"></span>
              <span className="fx-dim">480 × 120</span>
              <button className="fx-head" onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}>
                <span className="fx-ix">02</span>
                <span className="fx-q">How are ELO ratings computed?</span>
                <span className="fx-pm"></span>
              </button>
              <div className="fx-a">
                <div>
                  <div className="fx-inspect">
                    <div className="fx-prop">
                      <div className="fx-k">answer</div>
                      <div className="fx-v">
                        We use standard ELO rating mechanics (base ELO starts at 2000). When a battle completes, the judge’s score determines the winner, loser, or draw, recalculating ELO values dynamically according to the probability expectation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`fx-qa ${activeFaq === 2 ? 'on' : ''}`}>
            <span className="fx-tab">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="1" /></svg>
              custom-prompts.frame
            </span>
            <div className="fx-card">
              <span className="fx-sel"></span><span className="fx-h tl"></span><span className="fx-h tr"></span><span className="fx-h bl"></span><span className="fx-h br"></span>
              <span className="fx-dim">480 × 120</span>
              <button className="fx-head" onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}>
                <span className="fx-ix">03</span>
                <span className="fx-q">Can I test my own custom prompts?</span>
                <span className="fx-pm"></span>
              </button>
              <div className="fx-a">
                <div>
                  <div className="fx-inspect">
                    <div className="fx-prop">
                      <div className="fx-k">answer</div>
                      <div className="fx-v">
                        Yes! The combat arena has an open prompt dispatch box. Simply select any two contenders, type your custom request, and observe the streaming outputs live in the dispatch logs console.
                      </div>
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
