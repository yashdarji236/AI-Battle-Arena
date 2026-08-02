import React, { useEffect, useRef } from 'react';

export default function Hero({ onEnter }) {
  const canvasRef = useRef(null);

  // Text Particle Canvas physics in Hero (draws "NEXUS AI")
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let particles = [];
    const cols = ['#F0531C', '#F0531C', '#F0531C', '#FFFFFF', '#0D99FF'];
    let pSize = 2.5;
    let w = 0, h = 0, dpr = 1;
    let mouse = { x: -9999, y: -9999 };

    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // offscreen canvas to extract pixel text coordinates
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d");
      o.fillStyle = "#000";
      o.textAlign = "center";
      o.textBaseline = "middle";

      const lines = ['NEXUS AI', 'ARENA .'];
      o.font = '900 100px Anton, sans-serif';
      let w100 = 1;
      for (let i = 0; i < lines.length; i++) {
        w100 = Math.max(w100, o.measureText(lines[i]).width);
      }
      const fs = Math.min(w * 0.95 / w100 * 100, h * 0.44);
      o.font = '900 ' + fs + 'px Anton, sans-serif';

      const lh = fs * 0.92;
      o.fillText(lines[0], w / 2, h / 2 - lh / 2);
      o.fillText(lines[1], w / 2, h / 2 + lh / 2);

      const data = o.getImageData(0, 0, w, h).data;
      const targets = [];
      const step = Math.max(2, Math.min(3, Math.round(fs / 48)));
      pSize = Math.max(2.1, Math.min(2.55, fs / 70));

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 128) {
            targets.push(x + (y << 16));
          }
        }
      }

      const np = [];
      for (let k = 0; k < targets.length; k++) {
        const tx = targets[k] & 0xffff;
        const ty = targets[k] >> 16;
        const pt = particles[k] || {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          c: cols[k % cols.length]
        };
        pt.tx = tx;
        pt.ty = ty;
        np.push(pt);
      }
      particles = np;
    };

    init();

    let raf;
    const runFrame = () => {
      ctx.clearRect(0, 0, w, h);
      const repelDist = 92;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let ax = (p.tx - p.x) * 0.025;
        let ay = (p.ty - p.y) * 0.025;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < repelDist * repelDist) {
          const d = Math.sqrt(d2) || 1;
          const force = (repelDist - d) / repelDist * 4.8;
          ax += dx / d * force;
          ay += dy / d * force;
        }

        p.vx = (p.vx + ax) * 0.85;
        p.vy = (p.vy + ay) * 0.85;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, pSize, pSize);
      }
      raf = requestAnimationFrame(runFrame);
    };
    raf = requestAnimationFrame(runFrame);

    const handlePointerMove = (e) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const handlePointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    cv.addEventListener('pointermove', handlePointerMove);
    cv.addEventListener('pointerleave', handlePointerLeave);

    const handleResize = () => {
      init();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointermove', handlePointerMove);
      cv.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header id="phero" className="hero">
      <div className="ph-corner bl">
        PROVING GROUND<br />
        <span className="soft">dual-llm combat arena</span>
      </div>
      <div className="ph-corner br">
        DECISION MATRIX<br />
        <span className="soft">gemini flash automated judge</span>
      </div>

      <div className="ph-col">
        {/* Badge */}
        <div className="ph-ycw">
          <div className="ph-yc" data-cursor="drag me">
            <span className="ph-yco animate-ping"></span>
            <span className="ph-yco"></span>
            <b>judge pipeline active</b>
          </div>
        </div>

        {/* Interactive particles text canvas */}
        <canvas ref={canvasRef} id="phPc"></canvas>

        <h1 className="ph-fallback">NEXUS AI<br />ARENA .</h1>

        <div className="ph-hint">we don't do forgettable ✦</div>

        {/* Draggable tooltip card */}
        <div className="ph-sub">
          <span className="ph-move">do not drag</span>
          <span className="ph-txt">
            Most ELO benchmarks are static, outdated tables. The ones we compile pit models side-by-side in real-time, right in front of your eyes.
          </span>
          <span className="ph-sel"><b></b><b></b><b></b><b></b></span>
        </div>

        {/* CTAs */}
        <div className="ph-cta">
          <button onClick={onEnter} className="btn">
            Enter Combat Arena
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <a className="btn ghost" href="#leaderboard">See rankings</a>
        </div>
      </div>
    </header>
  );
}
