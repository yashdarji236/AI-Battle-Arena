import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import DriftingClouds from './landing/DriftingClouds';
import CustomCursor from './landing/CustomCursor';
import Topbar from './landing/Topbar';
import Footer from './landing/Footer';
import {
  getModelRankings,
  recordBattleResult,
  resetModelStatsToDefault,
  fetchMongoStats
} from '../utils/modelStats';

// Helper to draw horizontal tape measure ruler on canvas
const drawRuler = (cv, scrollY) => {
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;

  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr;
    cv.height = h * dpr;
  }

  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  ctx.font = '9px "Space Mono", ui-monospace, monospace';
  ctx.lineWidth = 1;

  const offset = -scrollY;
  const startX = Math.floor(scrollY / 10) * 10;

  for (let x = startX; x <= startX + w + 50; x += 10) {
    const drawX = x + offset;
    const maj = (x % 100 === 0);
    ctx.strokeStyle = maj ? 'rgba(241, 246, 250, 0.4)' : 'rgba(241, 246, 250, 0.18)';
    ctx.beginPath();
    ctx.moveTo(drawX + 0.5, h);
    ctx.lineTo(drawX + 0.5, maj ? h - 12 : (x % 50 === 0 ? h - 8 : h - 5));
    ctx.stroke();

    if (maj && drawX > 0 && drawX < w) {
      ctx.fillStyle = 'rgba(241, 246, 250, 0.55)';
      ctx.fillText(x, drawX + 3, h - 14);
    }
  }
  ctx.restore();
};

// SVG icons for models
const getModelSvg = (modelId) => {
  if (modelId === 'gemini') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  if (modelId === 'deepseek') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }
  if (modelId === 'groq') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  }
  if (modelId === 'claude') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (modelId === 'mistral') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polygon points="2 17 12 22 22 17" />
      </svg>
    );
  }
  if (modelId === 'gpt') {
    return (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
};

export default function Dashboard({ onEnter, onNavigate }) {
  const [currentTime, setCurrentTime] = useState('');
  const [istHour, setIstHour] = useState(12);
  const [sortBy, setSortBy] = useState('winrate'); // Default sort by Win Rate Priority!
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [inspectModel, setInspectModel] = useState(null);
  const [battleNotice, setBattleNotice] = useState('');

  const rulerTopRef = useRef(null);

  // Time Clocks (IST Clocks)
  useEffect(() => {
    const pad = (n) => (n < 10 ? '0' : '') + n;
    const updateTime = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (3600000 * 5.5));
      const hours = ist.getHours();
      const mins = ist.getMinutes();
      const secs = ist.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      setIstHour(hours);
      setCurrentTime(`${pad(displayHours)}:${pad(mins)}:${pad(secs)} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for top tape measure ruler
  useEffect(() => {
    const handleScroll = () => {
      drawRuler(rulerTopRef.current, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const [statsTick, setStatsTick] = useState(0);

  // Real-time listener & MongoDB API fetch for model victory standings
  useEffect(() => {
    fetchMongoStats();
    const handleStatsChange = () => {
      setStatsTick(prev => prev + 1);
    };
    window.addEventListener('nexus_stats_updated', handleStatsChange);
    return () => {
      window.removeEventListener('nexus_stats_updated', handleStatsChange);
    };
  }, []);

  // Fetch ranked models (sorted by wins by default)
  const models = getModelRankings(sortBy, searchQuery, categoryFilter);

  // The model with maximum wins is always rank #1
  const champion = models.length > 0 ? models[0] : null;
  const runnerUp = models.length > 1 ? models[1] : null;
  const thirdPlace = models.length > 2 ? models[2] : null;

  // Global aggregate stats
  const totalWinsAcrossArena = models.reduce((acc, m) => acc + m.wins, 0);
  const totalBattlesAcrossArena = models.reduce((acc, m) => acc + m.totalBattles, 0);
  const maxWins = champion ? champion.wins : 0;

  // Handler to simulate quick battle to test win counter increments
  const handleSimulateBattle = () => {
    if (models.length < 2) return;
    const modelA = models[Math.floor(Math.random() * models.length)];
    let modelB = models[Math.floor(Math.random() * models.length)];
    while (modelB.id === modelA.id) {
      modelB = models[Math.floor(Math.random() * models.length)];
    }

    // Higher winrate model has higher probability of winning
    const chanceA = modelA.winRatePct / (modelA.winRatePct + modelB.winRatePct);
    const isAWinner = Math.random() < chanceA;
    const winner = isAWinner ? modelA : modelB;
    const loser = isAWinner ? modelB : modelA;

    recordBattleResult(winner.id, loser.id);
    setBattleNotice(`⚡ COMBAT RESULT: ${winner.label} defeated ${loser.label}! (+1 Win Recorded)`);
    setTimeout(() => setBattleNotice(''), 4000);
  };

  const handleResetStats = () => {
    if (window.confirm('Reset all battle wins and model rankings to initial arena data?')) {
      resetModelStatsToDefault();
      setBattleNotice('🔄 Arena statistics reset to default.');
      setTimeout(() => setBattleNotice(''), 3000);
    }
  };

  return (
    <div className="om-theme-wrapper">
      <DriftingClouds />

      {/* Ticks Tape Measure Header Ruler */}

      {/* Navigation Topbar */}
      <Topbar onEnter={onEnter} onNavigate={onNavigate} currentView="dashboard" />

      {/* --- DASHBOARD HERO HEADER --- */}
      <header className="dash-hero wrap">
        <div className="dash-hero-badge">
          <span className="dot animate-pulse"></span>
          <span>MAX WIN LEADERBOARD STANDINGS</span>
        </div>

        <h1 className="dash-title">
          Model Victory <span className="dash-highlight">Dashboard</span>
        </h1>

        <p className="dash-subtitle">
          Real-time combat analytics for all 7 AI contenders. Ranked strictly by
          <strong> total victories won</strong> inhead-to-head arena battles.
        </p>

        {/* Global Stats Summary Bar */}
        <div className="dash-stats-bar">
          <div className="dash-stat-card">
            <span className="dash-stat-label">Total Arena Battles</span>
            <span className="dash-stat-val">{totalBattlesAcrossArena.toLocaleString()}</span>
            <span className="dash-stat-sub">Across all models</span>
          </div>

          <div className="dash-stat-card champ-card">
            <span className="dash-stat-label">👑 #1 Champion (Max Wins)</span>
            <span className="dash-stat-val champ-name">{champion?.label || 'N/A'}</span>
            <span className="dash-stat-sub">
              <strong>{champion?.wins.toLocaleString()} Wins</strong> ({champion?.winRatePct}% Win Rate)
            </span>
          </div>

          <div className="dash-stat-card">
            <span className="dash-stat-label">Total Victories Recorded</span>
            <span className="dash-stat-val">{totalWinsAcrossArena.toLocaleString()}</span>
            <span className="dash-stat-sub">Recorded battle outcomes</span>
          </div>

          <div className="dash-stat-card">
            <span className="dash-stat-label">Peak Win Streak</span>
            <span className="dash-stat-val">🔥 {champion?.streak || 0} Wins</span>
            <span className="dash-stat-sub">Current active streak</span>
          </div>
        </div>

        {battleNotice && (
          <div className="dash-battle-toast animate-slide-in">
            {battleNotice}
          </div>
        )}
      </header>

      {/* --- TOP 3 MAX WINS PODIUM SHOWCASE --- */}
      <section className="dash-podium-sec wrap">
        <div className="sec-head">
          <span className="scribble">championship podium</span>
          <h2>Top Contenders (Max Victory Leaders)</h2>
        </div>

        <div className="podium-container">
          {/* #2 RUNNER UP */}
          {runnerUp && (
            <div className="podium-card rank-2">
              <div className="podium-badge silver">#2 RUNNER UP</div>
              <div className={`podium-avatar bg-gradient-to-br ${runnerUp.bgGradient}`}>
                {getModelSvg(runnerUp.id)}
              </div>
              <h3 className="podium-name">{runnerUp.label}</h3>
              <span className="podium-provider">{runnerUp.provider}</span>

              <div className="podium-win-box">
                <span className="win-num">{runnerUp.wins.toLocaleString()}</span>
                <span className="win-lbl">TOTAL WINS</span>
              </div>

              <div className="podium-details">
                <span>Win Rate: <strong>{runnerUp.winRatePct}%</strong></span>
                <span>ELO: <strong>{runnerUp.elo}</strong></span>
              </div>

              <button
                onClick={() => setInspectModel(runnerUp)}
                className="podium-inspect-btn"
              >
                Inspect Stats
              </button>
            </div>
          )}

          {/* #1 REIGNING CHAMPION (MAX WINS) */}
          {champion && (
            <div className="podium-card rank-1 champion-glow">
              <div className="champ-crown-tag">
                👑 #1 MAX WINS CHAMPION
              </div>
              <div className={`podium-avatar champ-avatar bg-gradient-to-br ${champion.bgGradient}`}>
                {getModelSvg(champion.id)}
              </div>
              <h3 className="podium-name champ-title">{champion.label}</h3>
              <span className="podium-provider">{champion.provider}</span>

              <div className="podium-win-box champ-win-box">
                <span className="win-num champ-win-num">🏆 {champion.wins.toLocaleString()}</span>
                <span className="win-lbl champ-win-lbl">MAXIMUM WINS IN ARENA</span>
              </div>

              <div className="podium-details champ-details">
                <span>Win Rate: <strong>{champion.winRatePct}%</strong></span>
                <span>ELO Rating: <strong>{champion.elo}</strong></span>
                <span>Streak: <strong>🔥 {champion.streak} Wins</strong></span>
              </div>

              <div className="champ-actions">
                <button onClick={onEnter} className="podium-battle-btn">
                  Battle with Champion
                </button>
                <button onClick={() => setInspectModel(champion)} className="podium-inspect-btn">
                  Inspect Stats
                </button>
              </div>
            </div>
          )}

          {/* #3 BRONZE */}
          {thirdPlace && (
            <div className="podium-card rank-3">
              <div className="podium-badge bronze">#3 BRONZE</div>
              <div className={`podium-avatar bg-gradient-to-br ${thirdPlace.bgGradient}`}>
                {getModelSvg(thirdPlace.id)}
              </div>
              <h3 className="podium-name">{thirdPlace.label}</h3>
              <span className="podium-provider">{thirdPlace.provider}</span>

              <div className="podium-win-box">
                <span className="win-num">{thirdPlace.wins.toLocaleString()}</span>
                <span className="win-lbl">TOTAL WINS</span>
              </div>

              <div className="podium-details">
                <span>Win Rate: <strong>{thirdPlace.winRatePct}%</strong></span>
                <span>ELO: <strong>{thirdPlace.elo}</strong></span>
              </div>

              <button
                onClick={() => setInspectModel(thirdPlace)}
                className="podium-inspect-btn"
              >
                Inspect Stats
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- INTERACTIVE MODEL RANKING TABLE & WIN METERS --- */}
      <section className="dash-table-sec wrap">
        <div className="sec-head flex-between">
          <div>
            <span className="scribble">complete arena standings</span>
            <h2>Model Ranking & Victory Counters</h2>
          </div>


        </div>

        {/* Controls Toolbar: Search & Sort */}
        <div className="dash-toolbar">
          <div className="dash-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search model name, provider, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search">✕</button>
            )}
          </div>

          <div className="dash-filter-pills">
            <button
              className={`filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All Models ({models.length})
            </button>
            <button
              className={`filter-pill ${categoryFilter === 'speed' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('speed')}
            >
              High Speed (&le;300ms)
            </button>
            <button
              className={`filter-pill ${categoryFilter === 'reasoning' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('reasoning')}
            >
              Heavy Reasoning
            </button>
            <button
              className={`filter-pill ${categoryFilter === 'coding' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('coding')}
            >
              Code Specialists
            </button>
          </div>


        </div>

        {/* Model Cards List */}
        <div className="dash-model-list">
          {models.length === 0 ? (
            <div className="dash-empty-state">
              <p>No models match your current filter query "{searchQuery}".</p>
              <button onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }} className="clear-filter-btn">
                Clear Filters
              </button>
            </div>
          ) : (
            models.map((model, index) => {
              const isFirst = index === 0 && sortBy === 'wins';
              const winRatioPct = maxWins > 0 ? (model.wins / maxWins) * 100 : 0;

              return (
                <div
                  key={model.id}
                  className={`dash-model-card ${isFirst ? 'is-max-win-first' : ''}`}
                >
                  {/* Rank Badge */}
                  <div className="dash-rank-badge">
                    {index === 0 ? '👑 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                  </div>

                  {/* Avatar & Info */}
                  <div className="dash-model-main">
                    <div className={`dash-avatar bg-gradient-to-br ${model.bgGradient}`}>
                      {getModelSvg(model.id)}
                    </div>
                    <div className="dash-model-meta">
                      <div className="dash-title-row">
                        <h4 className="dash-model-name">{model.label}</h4>
                        <span className="dash-provider-tag">{model.provider}</span>
                        {isFirst && <span className="dash-champ-badge">MAX WINS</span>}
                        {model.streak >= 5 && (
                          <span className="dash-streak-badge">🔥 {model.streak} Streak</span>
                        )}
                      </div>
                      <span className="dash-model-sub">{model.fullName} • {model.category}</span>
                    </div>
                  </div>

                  {/* Wins Count Box */}
                  <div className="dash-wins-count-box">
                    <div className="wins-primary">
                      <span className="wins-trophy">🏆</span>
                      <span className="wins-number">{model.wins.toLocaleString()}</span>
                    </div>
                    <span className="wins-label">TOTAL WINS</span>
                  </div>

                  {/* Win Meter & Breakdown */}
                  <div className="dash-win-meter-box">
                    <div className="meter-header">
                      <span>Win Rate: <strong>{model.winRatePct}%</strong></span>
                      <span className="battles-count">{model.totalBattles.toLocaleString()} Matches</span>
                    </div>

                    <div className="meter-track">
                      <div
                        className="meter-fill"
                        style={{ width: `${Math.min(100, Math.max(5, model.winRatePct))}%` }}
                      ></div>
                    </div>

                    <div className="meter-breakdown">
                      <span className="w-green">W: {model.wins}</span>
                      <span className="w-red">L: {model.losses}</span>
                      <span className="w-gray">D: {model.draws}</span>
                      <span className="w-elo">ELO: {model.elo}</span>
                    </div>
                  </div>


                </div>
              );
            })
          )}
        </div>
      </section>



      {/* --- INSPECT MODEL STATS MODAL --- */}
      {inspectModel && (
        <div className="dash-modal-overlay" onClick={() => setInspectModel(null)}>
          <div className="dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center-gap">
                <div className={`dash-avatar bg-gradient-to-br ${inspectModel.bgGradient}`}>
                  {getModelSvg(inspectModel.id)}
                </div>
                <div>
                  <h3 className="modal-title">{inspectModel.fullName}</h3>
                  <span className="dash-provider-tag">{inspectModel.provider} • {inspectModel.tier}</span>
                </div>
              </div>
              <button onClick={() => setInspectModel(null)} className="modal-close-btn">✕</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">{inspectModel.description}</p>

              <div className="modal-stats-grid">
                <div className="m-stat-box">
                  <span className="m-val trophy-val">🏆 {inspectModel.wins.toLocaleString()}</span>
                  <span className="m-lbl">TOTAL WINS</span>
                </div>
                <div className="m-stat-box">
                  <span className="m-val">{inspectModel.winRatePct}%</span>
                  <span className="m-lbl">WIN RATE</span>
                </div>
                <div className="m-stat-box">
                  <span className="m-val">{inspectModel.elo}</span>
                  <span className="m-lbl">ELO RATING</span>
                </div>
                <div className="m-stat-box">
                  <span className="m-val">{inspectModel.speedMs} ms</span>
                  <span className="m-lbl">AVG LATENCY</span>
                </div>
              </div>

              {/* Radar Scores */}
              <h4 className="modal-subhead">Benchmark Skill Ratings</h4>
              <div className="skill-bars-list">
                <div className="skill-item">
                  <div className="skill-label">
                    <span>💻 Code Generation</span>
                    <span>{inspectModel.radar.coding}/100</span>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${inspectModel.radar.coding}%` }}></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-label">
                    <span>🧠 Chain-of-Thought Reasoning</span>
                    <span>{inspectModel.radar.reasoning}/100</span>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${inspectModel.radar.reasoning}%` }}></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-label">
                    <span>📐 Math & Logic</span>
                    <span>{inspectModel.radar.math}/100</span>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${inspectModel.radar.math}%` }}></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-label">
                    <span>⚡ Speed & Throughput</span>
                    <span>{inspectModel.radar.speed}/100</span>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${inspectModel.radar.speed}%` }}></div>
                  </div>
                </div>

                <div className="skill-item">
                  <div className="skill-label">
                    <span>🎨 Creative Writing</span>
                    <span>{inspectModel.radar.creativity}/100</span>
                  </div>
                  <div className="skill-track">
                    <div className="skill-fill" style={{ width: `${inspectModel.radar.creativity}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setInspectModel(null)} className="modal-cancel-btn">
                Close
              </button>
              <button onClick={onEnter} className="modal-battle-btn">
                Enter Arena with {inspectModel.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clocks Footer */}
      <Footer currentTime={currentTime} istHour={istHour} onEnter={onEnter} />

      {/* LERP custom cursor */}
      <CustomCursor />
    </div>
  );
}
