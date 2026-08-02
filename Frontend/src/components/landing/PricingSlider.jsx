import React, { useState, useRef } from 'react';

export default function PricingSlider({ onEnter }) {
  const [sliderPos, setSliderPos] = useState(0); // 0: Sandbox, 1: Proving Ground
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [sliderDragPct, setSliderDragPct] = useState(52); // width %

  const sliderTrackRef = useRef(null);
  const sliderHandleRef = useRef(null);

  const handleSliderSelection = (tier) => {
    setSliderPos(tier);
    setSliderDragPct(tier === 1 ? 100 : 52);
  };

  const handleSliderPointerDown = (e) => {
    setIsDraggingSlider(true);
    if (sliderHandleRef.current) {
      sliderHandleRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleSliderPointerMove = (e) => {
    if (!isDraggingSlider || !sliderTrackRef.current || !sliderHandleRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const handleWidth = sliderHandleRef.current.offsetWidth;
    const maxTravel = rect.width - handleWidth - 10;
    const x = Math.max(0, Math.min(maxTravel, e.clientX - rect.left - handleWidth / 2));
    const widthPct = 52 + (x / maxTravel) * 48;
    setSliderDragPct(widthPct);
    setSliderPos(widthPct > 76 ? 1 : 0);
  };

  const handleSliderPointerUp = (e) => {
    if (!isDraggingSlider) return;
    setIsDraggingSlider(false);
    if (sliderHandleRef.current) {
      try {
        sliderHandleRef.current.releasePointerCapture(e.pointerId);
      } catch (_) { }
    }
    // Snap
    const snapTier = sliderDragPct > 76 ? 1 : 0;
    setSliderPos(snapTier);
    setSliderDragPct(snapTier === 1 ? 100 : 52);
  };

  return (
    <section className="pricing" id="pricing">
      <div className="wrap">
        <div className="sec-head">
          <span className="scribble">sandbox</span>
          <h2>Pick your plan.</h2>
        </div>

        <div id="lp-root">
          <div className="card">

            <div className="disp">
              <div className="dleft">
                <div className="gauge">
                  <span className="cur">$</span>
                  <span className="amt">{sliderPos === 0 ? '0' : '199'}</span>
                  <span className="per">/ month</span>
                </div>
                <div className="pname">
                  <span>PLAN: </span>
                  <b className="pnm">{sliderPos === 0 ? 'API Sandbox' : 'Enterprise Proving Ground'}</b>
                  {sliderPos === 1 && <span className="was">$249</span>}
                </div>
              </div>

              <div className="hero-side">
                <div className="badge">
                  <span className="ld"></span>
                  <span className="hsum-req">{sliderPos === 0 ? 'One request at a time' : 'Two requests at a time'}</span>
                </div>
                <div className="hsum">
                  <div className="hrow">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M20 6L9 17l-5-5" /></svg>
                    <span>Grade capacity: <b className="hsum-cnt">{sliderPos === 0 ? '8 things' : '14 things'}</b></span>
                  </div>
                </div>
                <div className="proof">
                  <div className="avs">
                    <span className="av">🤖</span>
                    <span className="av">🧠</span>
                    <span className="av">⚔️</span>
                  </div>
                  <span className="ptext">Unlocks <b>7 models</b></span>
                </div>
              </div>
            </div>

            {/* Slider Toggle Track */}
            <div className="ends">
              <div
                className={`a l ${sliderPos === 0 ? 'on' : ''}`}
                onClick={() => handleSliderSelection(0)}
              >
                <span className="poptag">SANDBOX</span>
                <span className="pl">VIRTUAL ACCESS</span>
                <span className="pr">$0</span>
              </div>
              <div
                className={`a r ${sliderPos === 1 ? 'on' : ''}`}
                onClick={() => handleSliderSelection(1)}
              >
                <span className="poptag" style={{ backgroundColor: '#F0531C' }}>ENTERPRISE</span>
                <span className="pl">FULL PIPELINE</span>
                <span className="pr">$199</span>
              </div>
            </div>

            <div
              ref={sliderTrackRef}
              className={`track ${sliderPos === 1 ? 'crossed' : ''}`}
              onClick={(e) => {
                if (sliderTrackRef.current) {
                  const rect = sliderTrackRef.current.getBoundingClientRect();
                  handleSliderSelection((e.clientX - rect.left) > rect.width / 2 ? 1 : 0);
                }
              }}
            >
              <div className="fill" style={{ width: `${sliderDragPct}%` }}></div>
              <span className="tdest">DRAG SLIDER TO SCALE ➔</span>
              <div
                ref={sliderHandleRef}
                className="handle"
                style={{ transform: `translateX(${sliderPos === 1 ? (sliderTrackRef.current?.clientWidth - 98) : 0}px)` }}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
              >
                <span className="ch l">◀</span>
                <span className="ch font-space font-bold text-xs text-[#14202B]">SCALE</span>
                <span className="ch r">▶</span>
              </div>
            </div>

            <div className="hint">Scale testing capacity dynamically</div>
            <hr className="pdash" />

            {/* Features List */}
            <div className="unlock open">
              <div className="ul-line"></div>
              <div className="ul-chip">
                <span className="lk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lock-closed" style={{ opacity: sliderPos === 1 ? 0 : 1 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lock-open" style={{ opacity: sliderPos === 1 ? 1 : 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                  </svg>
                </span>
                <span className="ul-txt">{sliderPos === 1 ? 'Design + Dev unlocked' : 'Unlocks with Design + Dev'}</span>
              </div>
              <div className="ul-line"></div>
            </div>

            <ul className="feats-base">
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>One ELO prompt request at a time</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Compare 7 LLM configurations</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Side-by-side prompt execution</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Decision Matrix evaluation reasoning</span>
              </li>
            </ul>

            <ul className={`feats-dev ${sliderPos === 1 ? 'unlocked' : ''}`}>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Two requests at a time parallel stream</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Open API playground keys</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Streaming JSON connection logs</span>
              </li>
              <li>
                <span className="mk">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <span>Custom ELO metrics export</span>
              </li>
            </ul>

            <div className="ctarow">
              <button onClick={onEnter} className="cta">
                <span>Start today</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              <span className="reassure">No credit card required.</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
