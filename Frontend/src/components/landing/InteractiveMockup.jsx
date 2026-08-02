import React, { useState, useEffect } from 'react';

export default function InteractiveMockup() {
  const [figmaDraftState, setFigmaDraftState] = useState({
    width: '0%',
    height: '0%',
    showEyeb: false,
    showLn1: false,
    showLn2: false,
    showCta: false,
    showGuide: false,
    showDim: false,
    showRip: false,
    ripClass: '',
    curX: '11%',
    curY: '16%',
    curPress: false,
    curLeft: false,
    selActive: false,
    dimText: '40 × 30'
  });

  useEffect(() => {
    const timerIds = [];
    let activeToken = 0;

    const runFigmaDraftLoop = () => {
      activeToken++;
      const currentToken = activeToken;

      const clearState = () => {
        setFigmaDraftState({
          width: '0%',
          height: '0%',
          showEyeb: false,
          showLn1: false,
          showLn2: false,
          showCta: false,
          showGuide: false,
          showDim: false,
          showRip: false,
          ripClass: '',
          curX: '11%',
          curY: '16%',
          curPress: false,
          curLeft: false,
          selActive: false,
          dimText: '40 × 30'
        });
      };

      const delayAction = (ms, callback) => {
        timerIds.push(setTimeout(() => {
          if (activeToken === currentToken) callback();
        }, ms));
      };

      clearState();

      // Step 1: Cursor moves to corner
      delayAction(420, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          curX: '8%',
          curY: '12%',
          curPress: true
        }));
      });

      // Step 2: Resizing card box (drag cursor to bottom right)
      delayAction(650, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          curPress: false,
          curX: '92%',
          curY: '84%',
          width: '84%',
          height: '72%',
          showDim: true,
          curLeft: true
        }));

        // Custom count-up resizing dimension text
        const t0 = performance.now();
        const countDim = (t) => {
          if (activeToken !== currentToken) return;
          const p = Math.min(1, (t - t0) / 980);
          const e = 1 - Math.pow(1 - p, 3);
          const wText = Math.round(40 + e * 320);
          const hText = Math.round(30 + e * 210);
          setFigmaDraftState(prev => ({
            ...prev,
            dimText: `${wText} × ${hText}`
          }));
          if (p < 1) requestAnimationFrame(countDim);
        };
        requestAnimationFrame(countDim);
      });

      // Step 3: Elements appear cascading
      delayAction(1950, () => {
        setFigmaDraftState(prev => ({ ...prev, showEyeb: true }));
      });

      delayAction(2200, () => {
        setFigmaDraftState(prev => ({ ...prev, showLn1: true }));
      });

      delayAction(2380, () => {
        setFigmaDraftState(prev => ({ ...prev, showLn2: true }));
      });

      delayAction(2750, () => {
        setFigmaDraftState(prev => ({ ...prev, showCta: true }));
      });

      // Step 4: Show guides and click button
      delayAction(2950, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          showGuide: true,
          curLeft: false,
          curX: '28%',
          curY: '78%'
        }));
      });

      delayAction(3350, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          curPress: true,
          showRip: true,
          ripClass: 'go'
        }));
      });

      // Step 5: Release and highlights selection frame ELO
      delayAction(3550, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          curPress: false,
          showGuide: false
        }));
      });

      delayAction(3850, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          selActive: true,
          curX: '48%',
          curY: '46%'
        }));
      });

      // Restart loop
      delayAction(6000, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          selActive: false,
          showDim: false
        }));
      });

      delayAction(6500, () => {
        setFigmaDraftState(prev => ({
          ...prev,
          width: '0%',
          height: '0%'
        }));
      });

      delayAction(7300, runFigmaDraftLoop);
    };

    runFigmaDraftLoop();

    return () => {
      timerIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fd-stage">
      <span className="fd-flab" style={{ opacity: figmaDraftState.showEyeb ? 1 : 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
        battle.dispatch
      </span>

      <div
        className={`fd-art ${figmaDraftState.selActive ? 'sel' : ''}`}
        style={{ width: figmaDraftState.width, height: figmaDraftState.height }}
      >
        <div className="fd-inner">
          <div className="fd-eyeb" style={{ opacity: figmaDraftState.showEyeb ? 1 : 0, transform: figmaDraftState.showEyeb ? 'none' : 'translateY(6px)' }}>
            <span className="fd-m">●</span> PROV_GROUND
          </div>
          <div className="fd-hl">
            <span className="fd-ln" style={{ clipPath: figmaDraftState.showLn1 ? 'inset(0 0 -14% 0)' : 'inset(0 100% -14% 0)', transition: 'clip-path .6s ease' }}>Invoke</span>
            <br />
            <span className="fd-ln fd-o" style={{ clipPath: figmaDraftState.showLn2 ? 'inset(0 0 -14% 0)' : 'inset(0 100% -14% 0)', transition: 'clip-path .6s ease' }}>Gemini.</span>
          </div>
          <button className="fd-cta" style={{ opacity: figmaDraftState.showCta ? 1 : 0, transform: figmaDraftState.showCta ? 'none' : 'translateY(7px) scale(.94)' }}>
            Run Battle
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {figmaDraftState.selActive && (
        <span className="fd-sel" style={{ width: figmaDraftState.width, height: figmaDraftState.height }}>
          <b></b><b></b><b></b><b></b>
        </span>
      )}

      {figmaDraftState.showDim && (
        <span className="fd-dim" style={{ left: figmaDraftState.curLeft ? 'calc(8% + 84% - 74px)' : 'calc(28% + 14px)', top: figmaDraftState.curLeft ? 'calc(12% + 72% + 6px)' : 'calc(78% + 10px)' }}>
          {figmaDraftState.dimText}
        </span>
      )}

      {figmaDraftState.showGuide && (
        <span className="fd-guide" style={{ left: '28%', top: '68%', height: '14%' }}></span>
      )}

      <span className={`fd-rip ${figmaDraftState.ripClass}`}></span>

      <div
        className="fd-curs"
        style={{ left: figmaDraftState.curX, top: figmaDraftState.curY, transform: figmaDraftState.curPress ? 'scale(0.8)' : 'none' }}
      >
        <svg viewBox="0 0 24 24">
          <path d="M5 3l14 7-6 2-2 6z" fill="#F0531C" stroke="#0E1622" strokeWidth="1.1" />
        </svg>
        <span className="fd-nm">NexusAutomator</span>
      </div>

      <span className="cap">grading pipeline</span>
    </div>
  );
}
