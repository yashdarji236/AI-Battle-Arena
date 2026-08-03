// Model Statistics & Leaderboard Data Store for AI Battle Arena (Powered by MongoDB)

const INITIAL_MODELS = [
  {
    id: 'gemini',
    label: 'Gemini Flash',
    fullName: 'Google Gemini 2.5 Flash',
    provider: 'Google',
    tier: 'LATEST',
    category: 'Speed & Multimodal',
    elo: 2250,
    wins: 24,
    losses: 5,
    draws: 1,
    streak: 14,
    speedMs: 240,
    accuracy: 94.2,
    description: 'Blazing fast inference with top-tier instruction following and code generation capability.',
    bgGradient: 'from-blue-500 to-indigo-650',
    color: '#0D99FF',
    radar: { coding: 92, math: 90, reasoning: 95, speed: 99, creativity: 88 }
  },
  {
    id: 'deepseek',
    label: 'DeepSeek Chat',
    fullName: 'DeepSeek-V3 / R1 Chat',
    provider: 'DeepSeek',
    tier: 'OPENROUTER',
    category: 'Heavy Reasoning',
    elo: 2220,
    wins: 23,
    losses: 6,
    draws: 1,
    streak: 9,
    speedMs: 410,
    accuracy: 93.8,
    description: 'State-of-the-art open weight model excelling in complex mathematical proofs and chain-of-thought logic.',
    bgGradient: 'from-cyan-500 to-blue-600',
    color: '#00D8F6',
    radar: { coding: 98, math: 97, reasoning: 96, speed: 82, creativity: 85 }
  },
  {
    id: 'groq',
    label: 'Llama 3.3',
    fullName: 'Meta Llama 3.3 70B Versatile',
    provider: 'Meta',
    tier: '70B PARAM',
    category: 'High Throughput',
    elo: 2190,
    wins: 22,
    losses: 6,
    draws: 2,
    streak: 8,
    speedMs: 180,
    accuracy: 91.5,
    description: 'Ultra-low latency powered by Groq LPU engine with solid multi-turn conversation skills.',
    bgGradient: 'from-purple-500 to-pink-600',
    color: '#A855F7',
    radar: { coding: 89, math: 86, reasoning: 90, speed: 100, creativity: 87 }
  },
  {
    id: 'claude',
    label: 'Claude 3 Haiku',
    fullName: 'Anthropic Claude 3 Haiku',
    provider: 'Anthropic',
    tier: 'LIGHTWEIGHT',
    category: 'Precision & Code',
    elo: 2150,
    wins: 21,
    losses: 7,
    draws: 2,
    streak: 7,
    speedMs: 320,
    accuracy: 90.8,
    description: 'Lightweight contender tuned for exact formatting, markdown generation, and structural correctness.',
    bgGradient: 'from-orange-600 to-amber-500',
    color: '#F0531C',
    radar: { coding: 94, math: 85, reasoning: 91, speed: 90, creativity: 93 }
  },
  {
    id: 'mistral',
    label: 'Mistral Medium',
    fullName: 'Mistral Medium 2.0',
    provider: 'Mistral AI',
    tier: '70B PARAM',
    category: 'General & Multilingual',
    elo: 2140,
    wins: 20,
    losses: 8,
    draws: 2,
    streak: 5,
    speedMs: 380,
    accuracy: 89.4,
    description: 'Euro-designed model offering strong multilingual performance and concise natural language reasoning.',
    bgGradient: 'from-orange-500 to-red-600',
    color: '#FF6B00',
    radar: { coding: 87, math: 84, reasoning: 88, speed: 85, creativity: 90 }
  },
  {
    id: 'gpt',
    label: 'GPT-4o Mini',
    fullName: 'OpenAI GPT-4o Mini',
    provider: 'OpenAI',
    tier: 'LIGHTWEIGHT',
    category: 'General Purpose',
    elo: 2080,
    wins: 19,
    losses: 9,
    draws: 2,
    streak: 4,
    speedMs: 290,
    accuracy: 88.0,
    description: 'Efficient small-footprint GPT model with dependable JSON schema adherence and tool calling.',
    bgGradient: 'from-emerald-500 to-teal-600',
    color: '#10B981',
    radar: { coding: 86, math: 83, reasoning: 86, speed: 92, creativity: 89 }
  },
  {
    id: 'cohere',
    label: 'Cohere Command',
    fullName: 'Cohere Command R+',
    provider: 'Cohere',
    tier: 'PROPRIETARY',
    category: 'RAG & Retrieval',
    elo: 2010,
    wins: 18,
    losses: 10,
    draws: 2,
    streak: 3,
    speedMs: 450,
    accuracy: 86.5,
    description: 'Specialized enterprise model tailored for grounded document retrieval, citations, and search QA.',
    bgGradient: 'from-teal-500 to-emerald-650',
    color: '#14B8A6',
    radar: { coding: 81, math: 80, reasoning: 84, speed: 78, creativity: 82 }
  }
];

let inMemoryStats = INITIAL_MODELS.map(m => ({ ...m }));

// Clean up legacy localStorage keys if present
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('nexus_ai_battle_model_stats_v2');
    localStorage.removeItem('nexus_arena_chat_ids');
    localStorage.removeItem('nexus_arena_history');
  } catch (_) { }
}

import { API_BASE_URL } from './config.js';

export function getStoredModelStats() {
  return inMemoryStats;
}

export async function fetchMongoStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stats`);
    if (res.ok) {
      const dbStats = await res.json();
      inMemoryStats = INITIAL_MODELS.map(m => {
        const db = dbStats[m.id];
        if (db) {
          const wins = m.wins + (db.wins || 0);
          const losses = m.losses + (db.losses || 0);
          const draws = m.draws + (db.draws || 0);
          const elo = m.elo + ((db.wins || 0) * 15) - ((db.losses || 0) * 10);
          return { ...m, wins, losses, draws, elo: Math.max(1000, elo) };
        }
        return { ...m };
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nexus_stats_updated'));
      }
    }
  } catch (err) {
    console.warn('Could not sync stats from MongoDB API:', err);
  }
  return inMemoryStats;
}

export function saveModelStats(stats) {
  inMemoryStats = stats;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexus_stats_updated'));
  }
}

/**
 * Returns models sorted strictly by Win Rate Priority descending from MongoDB/Memory
 */
export function getModelRankings(sortBy = 'winrate', searchQuery = '', categoryFilter = 'all') {
  let stats = getStoredModelStats();

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    stats = stats.filter(m =>
      m.label.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }

  if (categoryFilter !== 'all') {
    stats = stats.filter(m => {
      if (categoryFilter === 'speed') return m.speedMs <= 300;
      if (categoryFilter === 'reasoning') return m.radar.reasoning >= 90;
      if (categoryFilter === 'coding') return m.radar.coding >= 90;
      return true;
    });
  }

  const processed = stats.map(m => {
    const totalBattles = m.wins + m.losses + m.draws;
    const winRate = totalBattles > 0 ? ((m.wins / totalBattles) * 100).toFixed(1) : '0.0';
    return {
      ...m,
      totalBattles,
      winRatePct: parseFloat(winRate)
    };
  });

  processed.sort((a, b) => {
    if (sortBy === 'winrate' || sortBy === 'wins') {
      if (b.winRatePct !== a.winRatePct) return b.winRatePct - a.winRatePct;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.elo - a.elo;
    }
    if (sortBy === 'elo') {
      if (b.elo !== a.elo) return b.elo - a.elo;
      return b.winRatePct - a.winRatePct;
    }
    if (sortBy === 'battles') {
      if (b.totalBattles !== a.totalBattles) return b.totalBattles - a.totalBattles;
      return b.winRatePct - a.winRatePct;
    }
    if (sortBy === 'speed') {
      return a.speedMs - b.speedMs;
    }
    return b.winRatePct - a.winRatePct;
  });

  return processed;
}

export function recordBattleResult(winnerId, loserId, isDraw = false) {
  const current = getStoredModelStats();
  const updated = current.map(m => {
    if (isDraw) {
      if (m.id === winnerId || m.id === loserId) {
        return { ...m, draws: m.draws + 1 };
      }
    } else {
      if (m.id === winnerId) {
        return {
          ...m,
          wins: m.wins + 1,
          elo: m.elo + 15,
          streak: m.streak + 1
        };
      }
      if (m.id === loserId) {
        return {
          ...m,
          losses: m.losses + 1,
          elo: Math.max(1000, m.elo - 12),
          streak: 0
        };
      }
    }
    return m;
  });
  saveModelStats(updated);
  return updated;
}

export function overwriteBattleResult(oldWinnerId, newWinnerId) {
  if (!oldWinnerId || !newWinnerId || oldWinnerId === newWinnerId) {
    if (newWinnerId && oldWinnerId !== newWinnerId) {
      return recordBattleResult(newWinnerId, oldWinnerId);
    }
    return getStoredModelStats();
  }

  const current = getStoredModelStats();
  const updated = current.map(m => {
    if (m.id === oldWinnerId) {
      return {
        ...m,
        wins: Math.max(0, m.wins - 1),
        elo: Math.max(1000, m.elo - 15),
        streak: Math.max(0, m.streak - 1)
      };
    }
    if (m.id === newWinnerId) {
      return {
        ...m,
        wins: m.wins + 1,
        elo: m.elo + 15,
        streak: m.streak + 1
      };
    }
    return m;
  });
  saveModelStats(updated);
  return updated;
}

export function resetModelStatsToDefault() {
  inMemoryStats = INITIAL_MODELS.map(m => ({ ...m }));
  saveModelStats(inMemoryStats);
  return inMemoryStats;
}
