import React, { useEffect, useRef } from 'react';

export default function SandboxStage({ matterLoaded }) {
  const dropStageRef = useRef(null);

  // Matter.js Drop Fun Physics Emojis Engine Sandbox
  useEffect(() => {
    if (!matterLoaded) return;
    const M = window.Matter;
    if (!M) return;

    const stage = dropStageRef.current;
    if (!stage) return;

    let W = stage.clientWidth;
    let H = stage.clientHeight;

    const engine = M.Engine.create();
    engine.world.gravity.y = 1;

    const render = M.Render.create({
      element: stage,
      engine: engine,
      options: {
        width: W,
        height: H,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    // Create bounds walls
    const thick = 140;
    let ground = M.Bodies.rectangle(W / 2, H + thick / 2, W + 400, thick, { isStatic: true });
    let leftWall = M.Bodies.rectangle(-thick / 2, H / 2, thick, H * 3, { isStatic: true });
    let rightWall = M.Bodies.rectangle(W + thick / 2, H / 2, thick, H * 3, { isStatic: true });

    M.World.add(engine.world, [ground, leftWall, rightWall]);

    const runner = M.Runner.create();
    M.Runner.run(runner, engine);
    M.Render.run(render);

    const bodies = [];
    const maxBodies = 60;
    const EMOJIS = ['🤖', '⚔️', '🧠', '🏆', '🔥', '📊', '⚡', '💡', '🎓', '🥇', '👑', '☄️'];
    const CHIP_WORDS = ['Gemini Flash', 'Llama 3.3', 'Claude 3', 'Mistral Medium', 'GPT-4o', 'ELO +30', 'Winner!', 'Combat', 'Decision Log', 'API Stream'];
    const CHIP_BGS = ['#F0531C', '#0D99FF', '#14202B', '#FFFFFF'];

    const getSvgDataUri = (svgStr) => {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr);
    };

    const spawnPhysicsItem = (e) => {
      const r = stage.getBoundingClientRect();
      const clickX = e.clientX - r.left;
      const clickY = e.clientY - r.top;

      // Toggle between Emojis and Word Chips
      const isEmoji = Math.random() < 0.5;
      let body;

      if (isEmoji) {
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const size = 38;
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><text x='50' y='50' font-size='50' dominant-baseline='central' text-anchor='middle'>${emoji}</text></svg>`;

        body = M.Bodies.circle(clickX, clickY, size / 2, {
          restitution: 0.55,
          friction: 0.35,
          frictionAir: 0.005
        });
        body.render.sprite.texture = getSvgDataUri(svg);
        const scale = size / 100;
        body.render.sprite.xScale = scale;
        body.render.sprite.yScale = scale;
      } else {
        const word = CHIP_WORDS[Math.floor(Math.random() * CHIP_WORDS.length)];
        const bg = CHIP_BGS[Math.floor(Math.random() * CHIP_BGS.length)];
        const fg = (bg === '#FFFFFF') ? '#14202B' : '#FFFFFF';
        const height = 34;
        const width = Math.max(70, Math.round(word.length * 8.6 + 24));
        const stroke = (bg === '#FFFFFF') ? 'rgba(20,32,43,0.18)' : 'rgba(255,255,255,0.16)';

        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width * 2}' height='${height * 2}' viewBox='0 0 ${width} ${height}'><rect x='0.75' y='0.75' width='${width - 1.5}' height='${height - 1.5}' rx='${height / 2}' fill='${bg}' stroke='${stroke}'/><text x='${width / 2}' y='${height / 2 + 1}' font-family='Outfit,Arial,sans-serif' font-size='14' font-weight='700' fill='${fg}' text-anchor='middle' dominant-baseline='central'>${word}</text></svg>`;

        body = M.Bodies.rectangle(clickX, clickY, width, height, {
          restitution: 0.5,
          friction: 0.35,
          frictionAir: 0.004,
          chamfer: { radius: height / 2 }
        });
        body.render.sprite.texture = getSvgDataUri(svg);
        body.render.sprite.xScale = 0.5;
        body.render.sprite.yScale = 0.5;
      }

      body._born = Date.now();
      M.World.add(engine.world, body);
      bodies.push(body);

      // Keep pool capped
      if (bodies.length > maxBodies) {
        const oldest = bodies.shift();
        M.World.remove(engine.world, oldest);
      }
    };

    // Fade out physics objects after a few seconds
    const fadeInterval = setInterval(() => {
      const now = Date.now();
      const life = 6000;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i];
        if (now - b._born > life) {
          const currentOpacity = b.render.opacity ?? 1;
          const nextOpacity = currentOpacity - 0.05;
          b.render.opacity = nextOpacity;
          if (nextOpacity <= 0.05) {
            M.World.remove(engine.world, b);
            bodies.splice(i, 1);
          }
        }
      }
    }, 150);

    const section = document.getElementById('dropfun');
    const handlePokeClick = (e) => {
      spawnPhysicsItem(e);
      if (Math.random() < 0.4) {
        setTimeout(() => spawnPhysicsItem(e), 200);
      }
    };

    if (section) {
      section.addEventListener('click', handlePokeClick);
    }

    const buildWalls = () => {
      M.World.remove(engine.world, [ground, leftWall, rightWall]);
      W = stage.clientWidth;
      H = stage.clientHeight;
      ground = M.Bodies.rectangle(W / 2, H + thick / 2, W + 400, thick, { isStatic: true });
      leftWall = M.Bodies.rectangle(-thick / 2, H / 2, thick, H * 3, { isStatic: true });
      rightWall = M.Bodies.rectangle(W + thick / 2, H / 2, thick, H * 3, { isStatic: true });
      M.World.add(engine.world, [ground, leftWall, rightWall]);
    };

    const handleResize = () => {
      const nextW = stage.clientWidth;
      const nextH = stage.clientHeight;
      render.options.width = nextW;
      render.options.height = nextH;
      render.canvas.width = nextW * (window.devicePixelRatio || 1);
      render.canvas.height = nextH * (window.devicePixelRatio || 1);
      M.Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: nextW, y: nextH } });
      buildWalls();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(fadeInterval);
      if (section) section.removeEventListener('click', handlePokeClick);
      window.removeEventListener('resize', handleResize);
      M.Render.stop(render);
      M.Runner.stop(runner);
      M.World.clear(engine.world);
      M.Engine.clear(engine);
    };
  }, [matterLoaded]);

  return (
    <section className="dropfun" id="dropfun">
      <span className="df-glow"></span>
      <div className="wrap">
        <span className="df-lab">sandbox play</span>
        <h2 className="df-h2">This canvas does<br />absolutely <span className="o">nothing</span></h2>
        <p className="df-p">Don't click the canvas too many times. Emojis and code blocks will rain down and crash.</p>
        <button className="btn ghost" type="button">Poke it anyway ➔</button>
      </div>
      <div id="dropStage" ref={dropStageRef}></div>
    </section>
  );
}
