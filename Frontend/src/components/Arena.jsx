import React, { useState, useEffect, useRef } from 'react';
import { recordBattleResult, overwriteBattleResult } from '../utils/modelStats';

// Custom syntax highlighter and markdown formatter for premium code styling
const whitespaceRule = { type: 'text', regex: /^\s+/ };

// JS / TS rules
const jsRules = [
  whitespaceRule,
  { type: 'comment', regex: /^\/\*\*[\s\S]*?\*\/|^\/\*[\s\S]*?\*\/|^\/\/.*/ },
  { type: 'string', regex: /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'|^`(?:\\.|[^`\\])*`/ },
  { type: 'regex', regex: /^\/(?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\/[gimuy]*/ },
  { type: 'number', regex: /^\d+(?:\.\d+)?\b/ },
  { type: 'keyword', regex: /^(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|let|await|async|null|undefined|true|false)\b/ },
  { type: 'type', regex: /^(?:document|window|console|Object|Array|String|Number|Boolean|Function|Promise|Map|Set|Symbol|Error|any|string|number|boolean|void|unknown|never)\b/ },
  { type: 'function-def', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },
  { type: 'class-name', regex: /^[A-Z][a-zA-Z0-9_$]*\b/ },
  { type: 'operator', regex: /^(?:=>|&&|\|\||[-+*/%=<>!&|^~?:])/ },
  { type: 'punctuation', regex: /^[{}[\];.,()]/ },
  { type: 'variable', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*\b/ }
];

// Python rules
const pyRules = [
  whitespaceRule,
  { type: 'comment', regex: /^"""[\s\S]*?"""|^'''[\s\S]*?'''|^#.*/ },
  { type: 'string', regex: /^f?"(?:\\.|[^"\\])*"|^f?'(?:\\.|[^'\\])*'/ },
  { type: 'number', regex: /^\d+(?:\.\d+)?\b/ },
  { type: 'keyword', regex: /^(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|@[a-zA-Z_][a-zA-Z0-9_]*)\b/ },
  { type: 'type', regex: /^(?:print|len|range|str|int|float|list|dict|set|tuple|type|abs|all|any|enumerate|zip|sum|min|max|open)\b/ },
  { type: 'function-def', regex: /^[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: 'operator', regex: /^(?:[-+*/%=<>!&|^~])/ },
  { type: 'punctuation', regex: /^[{}[\];.,()]/ },
  { type: 'variable', regex: /^[a-zA-Z_][a-zA-Z0-9_]*\b/ }
];

// CSS rules
const cssRules = [
  whitespaceRule,
  { type: 'comment', regex: /^\/\*[\s\S]*?\*\// },
  { type: 'keyword', regex: /^@\w+|^(?:active|hover|focus|visited|link|after|before)\b/ },
  { type: 'string', regex: /^#[0-9a-fA-F]{3,6}\b|^\d+(?:px|em|rem|%|s|ms|vh|vw|deg)?\b|^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
  { type: 'class-name', regex: /^[.#][a-zA-Z0-9_-]+/ },
  { type: 'type', regex: /^[a-zA-Z-]+(?=\s*:)/ },
  { type: 'operator', regex: /^[:;]/ },
  { type: 'punctuation', regex: /^[{}[\](),]/ },
  { type: 'variable', regex: /^[a-zA-Z_-]+/ }
];

// Generic fallback rules
const fallbackRules = [
  whitespaceRule,
  { type: 'comment', regex: /^\/\*[\s\S]*?\*\/|^\/\/.*/ },
  { type: 'string', regex: /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
  { type: 'number', regex: /^\d+(?:\.\d+)?\b/ },
  { type: 'keyword', regex: /^(?:class|const|def|function|if|else|for|while|return|import|from|export|new|let|var)\b/ },
  { type: 'operator', regex: /^(?:[-+*/%=<>!&|^~])/ },
  { type: 'punctuation', regex: /^[{}[\];.,()]/ },
  { type: 'variable', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*\b/ }
];

// Tokenizer & Highlighter
const highlightCode = (code, lang) => {
  if (!code) return '';

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  if (lang === 'plaintext' || lang === 'txt') {
    return escapeHtml(code);
  }

  const getRules = (language) => {
    switch (language) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'javascript':
      case 'typescript':
        return jsRules;
      case 'python':
      case 'py':
        return pyRules;
      case 'css':
        return cssRules;
      default:
        return fallbackRules;
    }
  };

  const rules = getRules(lang);
  let tokens = [];
  let remaining = code;
  let inTag = false; // State for HTML/XML parsing

  while (remaining.length > 0) {
    let matched = false;

    // Special stateful tokenizer for HTML/XML
    if (lang === 'html' || lang === 'xml' || lang === 'svg') {
      if (!inTag) {
        // Outside tag
        const commentMatch = /^<!--[\s\S]*?-->/.exec(remaining);
        if (commentMatch) {
          tokens.push({ type: 'comment', text: commentMatch[0] });
          remaining = remaining.slice(commentMatch[0].length);
          continue;
        }
        const doctypeMatch = /^<!DOCTYPE[^>]*>/i.exec(remaining);
        if (doctypeMatch) {
          tokens.push({ type: 'keyword', text: doctypeMatch[0] });
          remaining = remaining.slice(doctypeMatch[0].length);
          continue;
        }
        const tagStartMatch = /^<\/?(?:[a-zA-Z0-9:-]+)/.exec(remaining);
        if (tagStartMatch) {
          tokens.push({ type: 'type', text: tagStartMatch[0] });
          remaining = remaining.slice(tagStartMatch[0].length);
          inTag = true;
          continue;
        }
        // Match all text content up to the next tag start or end of string
        const nextTagIndex = remaining.indexOf('<');
        const textLen = nextTagIndex === -1 ? remaining.length : nextTagIndex;
        if (textLen > 0) {
          tokens.push({ type: 'text', text: remaining.slice(0, textLen) });
          remaining = remaining.slice(textLen);
          continue;
        }
      } else {
        // Inside tag
        const wsMatch = /^\s+/.exec(remaining);
        if (wsMatch) {
          tokens.push({ type: 'text', text: wsMatch[0] });
          remaining = remaining.slice(wsMatch[0].length);
          continue;
        }
        const tagEndMatch = /^[\/?>]+/.exec(remaining);
        if (tagEndMatch) {
          tokens.push({ type: 'punctuation', text: tagEndMatch[0] });
          remaining = remaining.slice(tagEndMatch[0].length);
          inTag = false;
          continue;
        }
        const strMatch = /^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/.exec(remaining);
        if (strMatch) {
          tokens.push({ type: 'string', text: strMatch[0] });
          remaining = remaining.slice(strMatch[0].length);
          continue;
        }
        const opMatch = /^=/.exec(remaining);
        if (opMatch) {
          tokens.push({ type: 'operator', text: opMatch[0] });
          remaining = remaining.slice(opMatch[0].length);
          continue;
        }
        const attrMatch = /^[a-zA-Z0-9:-]+/.exec(remaining);
        if (attrMatch) {
          tokens.push({ type: 'keyword', text: attrMatch[0] });
          remaining = remaining.slice(attrMatch[0].length);
          continue;
        }
      }
    } else {
      // Normal token match via rules
      for (const rule of rules) {
        const match = rule.regex.exec(remaining);
        if (match && match.index === 0) {
          tokens.push({ type: rule.type, text: match[0] });
          remaining = remaining.slice(match[0].length);
          matched = true;
          break;
        }
      }
    }

    if (!matched && remaining.length > 0) {
      tokens.push({ type: 'text', text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  // Generate syntax-highlighted HTML markup
  return tokens.map(token => {
    const escaped = escapeHtml(token.text);
    switch (token.type) {
      case 'comment':
        if (token.text.startsWith('/**')) {
          // Highlight JSDoc annotations & types
          const commentHtml = escaped
            .replace(/(@param|@returns|@example|@typedef|@property|@type|@template)/g, '<span style="color: #f43f5e; font-weight: 600;">$1</span>')
            .replace(/(\{[^}]+\})/g, '<span style="color: #d4b483;">$1</span>');
          return `<span style="color: #71717a; font-style: italic;">${commentHtml}</span>`;
        }
        return `<span style="color: #71717a; font-style: italic;">${escaped}</span>`;
      case 'string':
        return `<span style="color: #fbbf24;">${escaped}</span>`;
      case 'regex':
        return `<span style="color: #34d399;">${escaped}</span>`;
      case 'number':
        return `<span style="color: #60a5fa;">${escaped}</span>`;
      case 'keyword':
        return `<span style="color: #f472b6; font-weight: 600;">${escaped}</span>`;
      case 'type':
        return `<span style="color: #a78bfa;">${escaped}</span>`;
      case 'function-def':
        return `<span style="color: #818cf8; font-weight: 600;">${escaped}</span>`;
      case 'class-name':
        return `<span style="color: #fb7185;">${escaped}</span>`;
      case 'operator':
        return `<span style="color: #f472b6;">${escaped}</span>`;
      case 'punctuation':
        return `<span style="color: #9ca3af;">${escaped}</span>`;
      case 'text':
      default:
        return escaped;
    }
  }).join('');
};

const parseMarkdown = (text) => {
  if (!text) return '';

  const unescapeHtml = (escapedText) => {
    return escapedText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  };

  // 1. Escape HTML of the entire text first to prevent XSS in prose
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const codeBlocks = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;

  // 2. Extract code blocks, unescape their content, highlight, and replace with placeholders
  html = html.replace(codeBlockRegex, (match, lang, code) => {
    const placeholder = `<!--__CODE_BLOCK_${codeBlocks.length}__-->`;
    const language = lang ? lang.trim().toLowerCase() : 'plaintext';

    // Unescape code back to raw so syntax highlighting works correctly
    const rawCode = unescapeHtml(code);
    const highlighted = highlightCode(rawCode, language);
    const escapedCode = encodeURIComponent(rawCode.trim());

    const blockHtml = `
<div class="my-4 rounded-xl border border-border-subtle overflow-hidden bg-[#121214] shadow-lg max-w-full w-full">
  <div class="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle/50 bg-[#0a0a0c] text-[10px] font-space font-bold uppercase tracking-wider text-text-muted select-none">
    <span class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-warm-accent/50"></span>
      ${language}
    </span>
    <button onclick="navigator.clipboard.writeText(decodeURIComponent('${escapedCode}')).then(() => { this.innerText = 'Copied!'; this.style.color = '#d4b483'; setTimeout(() => { this.innerText = 'Copy'; this.style.color = ''; }, 2000); })" class="hover:text-text-main transition-colors duration-150 cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider">
      Copy
    </button>
  </div>
  <pre class="p-4 font-mono text-xs overflow-x-auto text-text-main leading-relaxed select-text w-full m-0"><code class="block whitespace-pre w-full">${highlighted}</code></pre>
</div>`;

    codeBlocks.push(blockHtml);
    return placeholder;
  });

  // 3. Format inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs text-warm-accent border border-border-subtle break-words">$1</code>');

  // 4. Format bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-text-main">$1</strong>');

  // 5. Format bullet points
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc my-1 text-text-muted">$1</li>');

  // 6. Convert newlines to paragraphs/breaks where appropriate
  html = html.split('\n').map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<!--__CODE_BLOCK_') || trimmed.startsWith('<li')) {
      return line;
    }
    return line ? `<p class="mb-2 leading-relaxed">${line}</p>` : '<div class="h-2"></div>';
  }).join('\n');

  // 7. Restore code blocks
  codeBlocks.forEach((codeHtml, idx) => {
    html = html.replace(`<!--__CODE_BLOCK_${idx}__-->`, codeHtml);
  });

  return html;
};

const availableModels = [
  { id: 'gemini', label: 'Gemini Flash', provider: 'Google', elo: '2,250', winrate: '84.5%', param: 'LATEST' },
  { id: 'mistral', label: 'Mistral Medium', provider: 'Mistral', elo: '2,140', winrate: '78.2%', param: '70B PARAM' },
  { id: 'cohere', label: 'Cohere Command', provider: 'Cohere', elo: '2,010', winrate: '71.5%', param: 'PROPRIETARY' },
  { id: 'groq', label: 'Llama 3.3 (Groq)', provider: 'Meta', elo: '2,190', winrate: '80.5%', param: '70B PARAM' },
  { id: 'deepseek', label: 'DeepSeek Chat (OpenRouter)', provider: 'DeepSeek', elo: '2,220', winrate: '82.1%', param: 'LATEST' },
  { id: 'claude', label: 'Claude 3 Haiku (OpenRouter)', provider: 'Anthropic', elo: '2,150', winrate: '79.2%', param: 'LIGHTWEIGHT' },
  { id: 'gpt', label: 'GPT-4o Mini (GitHub)', provider: 'OpenAI', elo: '2,080', winrate: '75.2%', param: 'LIGHTWEIGHT' }
];

const getModelInfo = (modelId) => {
  return availableModels.find(m => m.id === modelId) || { id: modelId, label: modelId, provider: modelId, elo: 'N/A', winrate: 'N/A', param: 'N/A' };
};

const getModelAvatarConfig = (modelId) => {
  let bgGradient = 'from-blue-500 to-indigo-650';

  if (modelId === 'mistral') {
    bgGradient = 'from-orange-500 to-red-600';
  } else if (modelId === 'cohere') {
    bgGradient = 'from-teal-500 to-emerald-650';
  } else if (modelId === 'groq') {
    bgGradient = 'from-purple-500 to-pink-600';
  } else if (modelId === 'deepseek') {
    bgGradient = 'from-cyan-500 to-blue-600';
  } else if (modelId === 'claude') {
    bgGradient = 'from-orange-600 to-amber-500';
  } else if (modelId === 'gpt') {
    bgGradient = 'from-emerald-500 to-teal-600';
  }

  return { bgGradient };
};

const getModelSvg = (modelId, sizeClass) => {
  if (modelId === 'gemini') {
    // Google Gemini Sparkle Star
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    );
  }
  if (modelId === 'mistral') {
    // Mistral Orange Origami M
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M4 4l8 8 8-8v16h-4V8l-4 4-4-4v12H4V4z" />
      </svg>
    );
  }
  if (modelId === 'cohere') {
    // Cohere Cellular Circle Rings
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
      </svg>
    );
  }
  if (modelId === 'groq') {
    // Meta/Llama Infinity Loop
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M17 7.5c-2.3 0-4.1 1.8-4.9 3.5-.8-1.7-2.6-3.5-4.9-3.5a5.5 5.5 0 0 0 0 11c2.3 0 4.1-1.8 4.9-3.5.8 1.7 2.6 3.5 4.9 3.5a5.5 5.5 0 0 0 0-11z" />
      </svg>
    );
  }
  if (modelId === 'deepseek') {
    // DeepSeek Blue Star
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  if (modelId === 'claude') {
    // Claude Hand/Shell curves
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M12 4.5C8 4.5 5 7.5 5 12s3 7.5 7 7.5 7-3 7-7.5-3-7.5-7-7.5zm0 13a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
      </svg>
    );
  }
  if (modelId === 'gpt') {
    // OpenAI pinwheel
    return (
      <svg viewBox="0 0 24 24" className={sizeClass} fill="currentColor">
        <path d="M19.1 9.5c.3-1.1-.3-2.2-1.3-2.5-.2-.1-.5-.1-.7-.1-.9 0-1.8.6-2.1 1.5-.7-.4-1.6-.5-2.4-.1V7.5C12.6 6 11.2 5 9.7 5.2c-1.3.2-2.3 1.2-2.5 2.5v.8C6.4 8.1 5.2 8.7 4.7 9.9c-.6 1.4.1 3 1.5 3.6.5.2 1.1.3 1.6.1v.8c0 1.5 1.2 2.7 2.7 2.7.9 0 1.8-.5 2.1-1.4.7.4 1.6.5 2.4.1v.8c.2 1.3 1.2 2.3 2.5 2.5 1.5.2 2.9-.8 3.1-2.3 0-.2.1-.5.1-.7 0-.9-.6-1.8-1.5-2.1.4-.7.5-1.6.1-2.4h.8C20.6 13.9 21.6 12.5 21.4 11c-.1-1-.8-1.7-1.7-1.9v.4z" />
      </svg>
    );
  }
  return null;
};

const renderModelAvatar = (modelId) => {
  const { bgGradient } = getModelAvatarConfig(modelId);
  return (
    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white border border-white/10 flex-shrink-0 select-none overflow-hidden p-0.5`}>
      {getModelSvg(modelId, 'w-full h-full')}
    </div>
  );
};

const renderLargeModelAvatar = (modelId) => {
  const { bgGradient } = getModelAvatarConfig(modelId);
  return (
    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white border border-white/15 relative z-10 shadow-lg p-3`}>
      {getModelSvg(modelId, 'w-full h-full')}
    </div>
  );
};

const ModelSelector = ({ label, selectedId, otherSelectedId, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = getModelInfo(selectedId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-white/[0.02] border border-border-subtle hover:border-warm-accent/40 rounded-xl text-text-main text-xs font-semibold focus:outline-hidden transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}:</span>
        {renderModelAvatar(selectedId)}
        <span>{selectedModel.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#141414] border border-border-subtle rounded-xl shadow-2xl p-1.5 z-50 animate-slide-in">
          <div className="text-[9px] font-mono text-text-muted uppercase tracking-wider px-2.5 py-1.5 border-b border-border-subtle/30 mb-1">
            Select Contender
          </div>
          <div className="max-h-[380px] overflow-y-auto space-y-0.5">
            {availableModels.map((m) => {
              const isDisabled = m.id === otherSelectedId;
              const isSelected = m.id === selectedId;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${isSelected
                    ? 'bg-warm-accent-light text-warm-accent font-semibold border border-warm-accent/20'
                    : isDisabled
                      ? 'opacity-30 cursor-not-allowed border border-transparent'
                      : 'hover:bg-white/[0.03] text-text-muted hover:text-text-main border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    {renderModelAvatar(m.id)}
                    <div>
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[9px] font-mono text-text-muted/65 leading-tight">{m.provider} • {m.param}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[9px] text-text-muted">
                    <div>ELO {m.elo}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Arena({ onBackToHome }) {
  // --- States ---
  const [history, setHistory] = useState(() => {
    try {
      const storedIds = localStorage.getItem('nexus_arena_chat_ids');
      if (storedIds) {
        const parsed = JSON.parse(storedIds);
        return parsed.map(c => ({ id: c.id, title: c.title || 'New AI Battle', messages: [] }));
      }
      const legacy = localStorage.getItem('nexus_arena_history');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed.map(c => ({ id: c.id, title: c.title || 'New AI Battle', messages: c.messages || [] }));
      }
    } catch (_) {}
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('nexus_arena_current_chat_id');
    return saved || null;
  });

  const [modelA, setModelA] = useState(() => localStorage.getItem('nexus_arena_model_a') || 'mistral');
  const [modelB, setModelB] = useState(() => localStorage.getItem('nexus_arena_model_b') || 'cohere');

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('idle');
  const [expandedReasoning, setExpandedReasoning] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [hoveredVerdict, setHoveredVerdict] = useState(null);
  const [mobileActiveSlides, setMobileActiveSlides] = useState({});

  // 1. Fetch Chat List from MongoDB on mount
  useEffect(() => {
    const fetchMongoChatList = async () => {
      try {
        const res = await fetch('/api/chats');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setHistory(prev => {
              const map = new Map();
              prev.forEach(c => map.set(c.id, c));
              list.forEach(c => {
                if (!map.has(c.id)) {
                  map.set(c.id, { id: c.id, title: c.title, messages: [] });
                } else {
                  map.set(c.id, { ...map.get(c.id), title: c.title });
                }
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        console.warn('MongoDB API offline, using local chat list:', err);
      }
    };
    fetchMongoChatList();
  }, []);

  // 2. Fetch full chat messages from MongoDB when active chat changes
  useEffect(() => {
    if (!currentChatId) return;
    const fetchChatMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${currentChatId}`);
        if (res.ok) {
          const chatData = await res.json();
          if (chatData && Array.isArray(chatData.messages)) {
            setHistory(prev => prev.map(c => {
              if (c.id === currentChatId) {
                return { ...c, title: chatData.title || c.title, messages: chatData.messages };
              }
              return c;
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load chat messages from MongoDB:', err);
      }
    };
    fetchChatMessages();
  }, [currentChatId]);

  useEffect(() => {
    localStorage.setItem('nexus_arena_model_a', modelA);
  }, [modelA]);

  useEffect(() => {
    localStorage.setItem('nexus_arena_model_b', modelB);
  }, [modelB]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 3. Store ONLY lightweight chat IDs & titles in localStorage, notify Dashboard listeners
  useEffect(() => {
    const lightweightList = history.map(c => ({ id: c.id, title: c.title }));
    localStorage.setItem('nexus_arena_chat_ids', JSON.stringify(lightweightList));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexus_stats_updated'));
    }
  }, [history]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('nexus_arena_current_chat_id', currentChatId);
    } else {
      localStorage.removeItem('nexus_arena_current_chat_id');
    }
  }, [currentChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentChatId, loading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // --- Sample Prompts ---
  const samplePrompts = [
    {
      title: "BMW M4 Price Check",
      prompt: "What is the price of BMW m4 compitition? (answer in 1 line)"
    },
    {
      title: "JS Quicksort",
      prompt: "Write a JavaScript function to perform quicksort on an array of numbers. Keep it clean and document it."
    },
    {
      title: "Explain Quantum Computing",
      prompt: "Explain quantum computing to a 10-year-old using a creative analogy in 3 bullet points."
    },
    {
      title: "CSS Glassmorphism",
      prompt: "Provide a modern CSS snippet for a premium glassmorphism card component with inline explanations."
    }
  ];

  const handleManualVerdict = (chatId, msgIndex, winnerType, customToastMsg) => {
    const targetChat = history.find(c => c.id === chatId);
    const targetMsg = targetChat?.messages?.[msgIndex];
    if (!targetMsg) return;

    const mA = targetMsg.modelA || modelA;
    const mB = targetMsg.modelB || modelB;

    // Identify previous active winner (User manual winner if set, else Judge winner)
    const prevWinnerType = targetMsg.manualWinner || targetMsg.judgeWinner || null;
    let toastText = customToastMsg;

    if (winnerType === 'A') {
      const winnerId = mA;
      let updatedStats;

      if (prevWinnerType === 'B') {
        // User selection overwrites previous winner (Judge or Model B vote)!
        const prevWinnerId = mB;
        updatedStats = overwriteBattleResult(prevWinnerId, winnerId);
        const mInfo = getModelInfo(winnerId);
        const uData = updatedStats.find(m => m.id === winnerId);
        toastText = `👑 User Priority Overwrite! ${mInfo.label} awarded +1 Win Point over Judge verdict! (Total Wins: ${uData?.wins})`;
      } else {
        updatedStats = recordBattleResult(winnerId, mB);
        const mInfo = getModelInfo(winnerId);
        const uData = updatedStats.find(m => m.id === winnerId);
        toastText = `🏆 Vote Recorded! ${mInfo.label} +1 Win Point! (Total Wins: ${uData?.wins})`;
      }
    } else if (winnerType === 'B') {
      const winnerId = mB;
      let updatedStats;

      if (prevWinnerType === 'A') {
        // User selection overwrites previous winner (Judge or Model A vote)!
        const prevWinnerId = mA;
        updatedStats = overwriteBattleResult(prevWinnerId, winnerId);
        const mInfo = getModelInfo(winnerId);
        const uData = updatedStats.find(m => m.id === winnerId);
        toastText = `👑 User Priority Overwrite! ${mInfo.label} awarded +1 Win Point over Judge verdict! (Total Wins: ${uData?.wins})`;
      } else {
        updatedStats = recordBattleResult(winnerId, mA);
        const mInfo = getModelInfo(winnerId);
        const uData = updatedStats.find(m => m.id === winnerId);
        toastText = `🏆 Vote Recorded! ${mInfo.label} +1 Win Point! (Total Wins: ${uData?.wins})`;
      }
    } else if (winnerType === 'both_good') {
      recordBattleResult(mA, mB, true);
    }

    // Sync verdict choice to MongoDB
    try {
      fetch(`/api/chats/${chatId}/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msgIndex, winnerType })
      }).catch(err => console.warn('Verdict DB sync note:', err));
    } catch (_) {}

    setHistory(prev => {
      return prev.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = chat.messages.map((m, idx) => {
            if (idx === msgIndex) {
              return { ...m, manualWinner: winnerType };
            }
            return m;
          });
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });
    });
    setToast(toastText);
  };

  // --- Handlers ---
  const activeChat = history.find(c => c.id === currentChatId);

  const handleNewBattle = () => {
    const newId = `chat_${Date.now()}`;
    const newChat = {
      id: newId,
      title: "New AI Battle",
      messages: []
    };

    // Save new chat metadata to MongoDB
    try {
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: newId, title: "New AI Battle", messages: [] })
      }).catch(err => console.warn('New chat DB sync note:', err));
    } catch (_) {}

    setHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newId);
    setInputText('');
    setSidebarOpen(false);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    try {
      fetch(`/api/chats/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (_) {}

    setHistory(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      const remaining = history.filter(c => c.id !== id);
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAll = () => {
    try {
      fetch('/api/chats', { method: 'DELETE' }).catch(() => {});
    } catch (_) {}

    setHistory([]);
    setCurrentChatId(null);
  };

  const handleSubmit = async (textToSend) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || loading) return;

    setInputText('');
    let chatId = currentChatId;

    // Create a new chat if none exists
    if (!chatId) {
      chatId = `chat_${Date.now()}`;
      const newChat = {
        id: chatId,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt,
        messages: []
      };
      setHistory(prev => [newChat, ...prev]);
      setCurrentChatId(chatId);
    } else {
      // Update title if it was default
      setHistory(prev => prev.map(c => {
        if (c.id === chatId && (c.title === "New AI Battle" || c.messages.length === 0)) {
          return { ...c, title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt };
        }
        return c;
      }));
    }

    // Add user message to state
    const userMsg = { role: 'user', content: prompt };
    setHistory(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, userMsg] };
      }
      return c;
    }));

    // Trigger loader phases
    setLoading(true);
    setLoadingPhase('sending');

    // Simulated progress indicators for immersive feel
    const phaseTimer1 = setTimeout(() => setLoadingPhase('models'), 1000);
    const phaseTimer2 = setTimeout(() => setLoadingPhase('judging'), 4000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: prompt, modelA, modelB, chatId }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || `HTTP ${response.status}: API request failed`);
      }

      const data = await response.json();

      // Clear timers and finalize
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      setLoadingPhase('final');

      const s1Score = data.judge?.solution_1_score ?? 0;
      const s2Score = data.judge?.solution_2_score ?? 0;
      const selectedModelA = data.modelA || modelA;
      const selectedModelB = data.modelB || modelB;
      let initialJudgeWinner = 'draw';

      if (s1Score > s2Score) {
        initialJudgeWinner = 'A';
        recordBattleResult(selectedModelA, selectedModelB);
      } else if (s2Score > s1Score) {
        initialJudgeWinner = 'B';
        recordBattleResult(selectedModelB, selectedModelA);
      } else {
        recordBattleResult(selectedModelA, selectedModelB, true);
      }

      const assistantMsg = {
        role: 'assistant',
        problem: data.problem || prompt,
        modelA: selectedModelA,
        modelB: selectedModelB,
        solution_1: data.solution_1 || "No solution generated.",
        solution_2: data.solution_2 || "No solution generated.",
        judgeWinner: initialJudgeWinner,
        judge: {
          solution_1_score: s1Score,
          solution_2_score: s2Score,
          solution_1_reasoing: data.judge?.solution_1_reasoing || data.judge?.solution_1_reasoning || "No evaluation reasoning provided.",
          solution_2_resoning: data.judge?.solution_2_resoning || data.judge?.solution_2_reasoning || "No evaluation reasoning provided."
        }
      };

      setHistory(prev => prev.map(c => {
        if (c.id === chatId) {
          return { ...c, messages: [...c.messages, assistantMsg] };
        }
        return c;
      }));

    } catch (error) {
      console.error("Battle failed:", error);
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);

      const errorMsg = {
        role: 'assistant',
        isError: true,
        content: `Combat interrupted. System Error: ${error.message || 'Failed to contact models. Please verify the backend is running.'}`
      };

      setHistory(prev => prev.map(c => {
        if (c.id === chatId) {
          return { ...c, messages: [...c.messages, errorMsg] };
        }
        return c;
      }));
    } finally {
      setLoading(false);
      setLoadingPhase('idle');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Helper to determine winner text/color
  const getWinnerInfo = (score1, score2, modelAId = 'mistral', modelBId = 'cohere') => {
    const labelA = getModelInfo(modelAId).label.toUpperCase();
    const labelB = getModelInfo(modelBId).label.toUpperCase();
    if (score1 > score2) return { text: `${labelA} WINS`, color: 'text-warm-accent border-warm-accent/30 bg-warm-accent-light', winner: 1 };
    if (score2 > score1) return { text: `${labelB} WINS`, color: 'text-warm-accent border-warm-accent/30 bg-warm-accent-light', winner: 2 };
    return { text: 'DRAW BATTLE', color: 'text-gray-400 border-border-subtle bg-white/5', winner: 0 };
  };

  return (
    <div className="flex h-screen w-screen bg-bg-base text-text-main font-sans overflow-hidden">

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-border-subtle bg-bg-sidebar flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Sidebar Header */}
        <div className="p-5 border-b border-border-subtle flex justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warm-accent"></div>
            <h1 className="font-space font-bold tracking-wider text-base text-text-main">
              NEXUS AI ARENA
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Battle Button */}
        <div className="p-4">
          <button
            onClick={handleNewBattle}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-bg-card border border-border-subtle rounded-xl text-text-main font-space text-xs tracking-wide font-medium uppercase transition-all duration-200 hover:border-warm-accent hover:bg-bg-card-light cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start New Battle
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-wider text-text-muted px-3 mb-2 flex justify-between items-center">
            <span>Combat History</span>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="hover:text-warm-accent font-mono text-[9px] transition-colors uppercase cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-text-muted italic border border-border-subtle rounded-lg p-4 bg-white/[0.02]">
              No historical battles recorded.
            </div>
          ) : (
            history.map(chat => {
              const isActive = chat.id === currentChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-bg-card border-warm-accent/40 shadow-xs'
                    : 'border-transparent hover:border-border-subtle hover:bg-white/[0.02]'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full pr-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-warm-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={`text-xs truncate font-medium ${isActive ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                      {chat.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1 text-text-muted cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>



      </aside>

      {/* --- MAIN CONTENT / BATTLEGROUND --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0 bg-bg-base">

        {/* Main Header - Claude Style */}
        <header className="h-16 border-b border-border-subtle bg-bg-sidebar/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-space font-bold tracking-wider text-sm text-text-main">
              NEURAL_ARENA
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-border-subtle rounded-xl text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Exit Arena</span>
            </button>
          </div>
        </header>

        {/* Chat / Messages Panel */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 relative z-10">

          {/* Welcome view when there is no current chat selected */}
          {!activeChat && !loading && (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center">

              {/* Branding element */}
              <div className="text-center mb-10 relative">
                <h2 className="font-space font-extrabold text-3xl tracking-tight mb-2 text-text-main">
                  ENTER THE ARENA
                </h2>
                <p className="text-text-muted text-sm max-w-xl mx-auto leading-relaxed">
                  A side-by-side LLM proving ground. Prompt the models, inspect the responses, and read the Gemini judge verdict on which solution prevails.
                </p>
              </div>

              {/* Battle Stage Matchup Preview (Claude / Stitch Minimalist) */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 w-full items-center mb-12">
                {/* Model Alpha (A) */}
                <div className="claude-card p-6 border-l-4 border-l-warm-accent relative group overflow-hidden">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {renderLargeModelAvatar(modelA)}
                      <div className="absolute bottom-0 right-0 bg-warm-accent text-text-dark px-1.5 py-0.5 font-mono text-[8px] font-bold rounded-sm">ALPHA_01</div>
                    </div>
                    <h3 className="font-space font-bold text-sm text-text-main mb-1">{getModelInfo(modelA).label.toUpperCase()}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="claude-badge-warm px-2 py-0.5 font-mono text-[9px] uppercase rounded-sm">{getModelInfo(modelA).provider}</span>
                      <span className="bg-white/5 text-text-muted px-2 py-0.5 font-mono text-[9px] rounded-sm">{getModelInfo(modelA).param}</span>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-1 pt-3 border-t border-border-subtle font-mono text-[9px]">
                      <div>
                        <p className="text-text-muted">WINRATE</p>
                        <p className="text-warm-accent font-bold text-xs">{getModelInfo(modelA).winrate}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">ELO</p>
                        <p className="text-text-main font-bold text-xs">{getModelInfo(modelA).elo}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">LATENCY</p>
                        <p className="text-text-main font-bold text-xs">~1.2s</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="font-space font-extrabold text-xl text-warm-accent">VS</div>
                  <div className="h-px w-10 bg-border-subtle my-2"></div>
                  <div className="font-mono text-[8px] text-text-muted tracking-widest uppercase">Combat</div>
                </div>

                {/* Model Beta (B) */}
                <div className="claude-card p-6 border-r-4 border-r-warm-accent relative group overflow-hidden">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {renderLargeModelAvatar(modelB)}
                      <div className="absolute bottom-0 left-0 bg-warm-accent text-text-dark px-1.5 py-0.5 font-mono text-[8px] font-bold rounded-sm">BETA_02</div>
                    </div>
                    <h3 className="font-space font-bold text-sm text-text-main mb-1">{getModelInfo(modelB).label.toUpperCase()}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="claude-badge-warm px-2 py-0.5 font-mono text-[9px] uppercase rounded-sm">{getModelInfo(modelB).provider}</span>
                      <span className="bg-white/5 text-text-muted px-2 py-0.5 font-mono text-[9px] rounded-sm">{getModelInfo(modelB).param}</span>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-1 pt-3 border-t border-border-subtle font-mono text-[9px]">
                      <div>
                        <p className="text-text-muted">WINRATE</p>
                        <p className="text-warm-accent font-bold text-xs">{getModelInfo(modelB).winrate}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">ELO</p>
                        <p className="text-text-main font-bold text-xs">{getModelInfo(modelB).elo}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">LATENCY</p>
                        <p className="text-text-main font-bold text-xs">~1.5s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Prompts section */}
              <div className="w-full relative z-10">
                <h4 className="font-mono text-[10px] uppercase text-text-muted tracking-wider mb-3 border-b border-border-subtle pb-1.5">
                  Combat Presets
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(sample.prompt);
                        handleSubmit(sample.prompt);
                      }}
                      className="claude-card text-left p-4 hover:border-warm-accent/40 hover:bg-white/[0.01] transition-all duration-200 flex flex-col gap-1 group cursor-pointer"
                    >
                      <span className="font-space font-bold text-xs text-warm-accent group-hover:text-text-main transition-colors">
                        {sample.title}
                      </span>
                      <span className="text-xs text-text-muted truncate w-full">
                        {sample.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Active empty chat suggestions view */}
          {activeChat && activeChat.messages.length === 0 && !loading && (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center">
              <div className="text-center mb-8 relative">
                <p className="text-text-muted text-sm max-w-xl mx-auto leading-relaxed">
                  Start a new fight by selecting a preset query below or entering a custom prompt in the input field.
                </p>
              </div>

              {/* Sample Prompts section */}
              <div className="w-full relative z-10">
                <h4 className="font-mono text-[10px] uppercase text-text-muted tracking-wider mb-3 border-b border-border-subtle pb-1.5">
                  Combat Presets
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(sample.prompt);
                        handleSubmit(sample.prompt);
                      }}
                      className="claude-card text-left p-4 hover:border-warm-accent/40 hover:bg-white/[0.01] transition-all duration-200 flex flex-col gap-1 group cursor-pointer"
                    >
                      <span className="font-space font-bold text-xs text-warm-accent group-hover:text-text-main transition-colors">
                        {sample.title}
                      </span>
                      <span className="text-xs text-text-muted truncate w-full">
                        {sample.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message log rendering */}
          {activeChat && activeChat.messages.length > 0 && (
            <div className="max-w-5xl mx-auto space-y-8">
              {activeChat?.messages.map((msg, index) => {
                if (msg.role === 'user') {
                  return (
                    <div key={index} className="flex justify-end pr-1">
                      <div className="max-w-xl bg-bg-card border border-border-subtle rounded-2xl px-4 py-2 shadow-sm text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                } else if (msg.isError) {
                  // Error card
                  return (
                    <div key={index} className="flex justify-start items-start gap-3 pr-12">
                      <div className="w-8 h-8 rounded-lg border border-red-500/20 bg-red-950/10 flex items-center justify-center flex-shrink-0 text-red-450 relative z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="max-w-2xl bg-red-950/10 border border-red-500/20 rounded-2xl rounded-tl-none px-5 py-3 relative z-10">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-red-400 block mb-1">
                          SYSTEM ANOMALY
                        </span>
                        <p className="text-sm text-red-200 font-mono leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  // Combat Response layout: Side-by-side Models Solutions + Judge Panel below
                  const verdict = getWinnerInfo(msg.judge.solution_1_score, msg.judge.solution_2_score, msg.modelA || 'mistral', msg.modelB || 'cohere');

                  const isAHovered = hoveredVerdict?.index === index && (hoveredVerdict?.type === 'A' || hoveredVerdict?.type === 'both_good');
                  const isBHovered = hoveredVerdict?.index === index && (hoveredVerdict?.type === 'B' || hoveredVerdict?.type === 'both_good');
                  const isARed = hoveredVerdict?.index === index && hoveredVerdict?.type === 'both_bad';
                  const isBRed = hoveredVerdict?.index === index && hoveredVerdict?.type === 'both_bad';

                  const activeSlide = mobileActiveSlides[index] || 'A';

                  return (
                    <div key={index} className="space-y-6 relative z-10">

                      {/* --- RESPONSIVE SOLUTIONS SLIDER CONTAINER --- */}
                      <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Model 1: Mistral (Assistant A) */}
                          <div className={`claude-card rounded-2xl p-5 flex-col relative transition-all duration-200 ${isAHovered
                            ? 'border-emerald-500/50 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20'
                            : isARed
                              ? 'border-red-500/40 bg-red-500/[0.02] ring-1 ring-red-500/10'
                              : verdict.winner === 1
                                ? 'border-warm-accent/40 bg-bg-card-light/50 ring-1 ring-warm-accent/20'
                                : 'border-border-subtle bg-bg-card'
                            } ${activeSlide === 'A' ? 'flex animate-slide-in' : 'hidden md:flex'
                            }`}>
                            {verdict.winner === 1 && (
                              <span className="absolute -top-2.5 -right-2 bg-warm-accent text-text-dark font-space font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow-xs">
                                Winner 🏆
                              </span>
                            )}

                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-subtle">
                              <div className="flex items-center gap-2.5">
                                {renderModelAvatar(msg.modelA || 'mistral')}
                                <div>
                                  <h4 className="font-space font-bold text-text-main text-xs">Assistant A</h4>
                                  <span className="font-mono text-[8px] uppercase text-text-muted tracking-wider">{getModelInfo(msg.modelA || 'mistral').label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Copy */}
                                <button
                                  onClick={() => navigator.clipboard.writeText(msg.solution_1)}
                                  className="text-text-muted hover:text-text-main p-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                                  title="Copy response"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>

                                <span className="ml-1 px-1.5 py-0.5 font-mono text-[9px] rounded border border-border-subtle bg-white/5 text-text-muted font-bold">
                                  SCORE: {msg.judge.solution_1_score}/10
                                </span>
                              </div>
                            </div>

                            <div
                              className="text-sm prose prose-invert max-w-none text-text-main flex-1 min-h-[100px]"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.solution_1) }}
                            />
                          </div>

                          {/* Model 2: Cohere (Assistant B) */}
                          <div className={`claude-card rounded-2xl p-5 flex-col relative transition-all duration-200 ${isBHovered
                            ? 'border-emerald-500/50 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20'
                            : isBRed
                              ? 'border-red-500/40 bg-red-500/[0.02] ring-1 ring-red-500/10'
                              : verdict.winner === 2
                                ? 'border-warm-accent/40 bg-bg-card-light/50 ring-1 ring-warm-accent/20'
                                : 'border-border-subtle bg-bg-card'
                            } ${activeSlide === 'B' ? 'flex animate-slide-in' : 'hidden md:flex'
                            }`}>
                            {verdict.winner === 2 && (
                              <span className="absolute -top-2.5 -right-2 bg-warm-accent text-text-dark font-space font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow-xs">
                                Winner 🏆
                              </span>
                            )}

                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-subtle">
                              <div className="flex items-center gap-2.5">
                                {renderModelAvatar(msg.modelB || 'cohere')}
                                <div>
                                  <h4 className="font-space font-bold text-text-main text-xs">Assistant B</h4>
                                  <span className="font-mono text-[8px] uppercase text-text-muted tracking-wider">{getModelInfo(msg.modelB || 'cohere').label}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Copy */}
                                <button
                                  onClick={() => navigator.clipboard.writeText(msg.solution_2)}
                                  className="text-text-muted hover:text-text-main p-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
                                  title="Copy response"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>

                                <span className="ml-1 px-1.5 py-0.5 font-mono text-[9px] rounded border border-border-subtle bg-white/5 text-text-muted font-bold">
                                  SCORE: {msg.judge.solution_2_score}/10
                                </span>
                              </div>
                            </div>

                            <div
                              className="text-sm prose prose-invert max-w-none text-text-main flex-1 min-h-[100px]"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.solution_2) }}
                            />
                          </div>

                        </div>

                        {/* Floating Mobile Slide Arrow (matches user reference image style) */}
                        <div className="md:hidden">
                          {activeSlide === 'A' ? (
                            <button
                              onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'B' }))}
                              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-[#1b1b1b] border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main shadow-lg z-30 cursor-pointer transition-all active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'A' }))}
                              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-[#1b1b1b] border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main shadow-lg z-30 cursor-pointer transition-all active:scale-95"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Mobile Pagination Dots (matches user reference image style) */}
                        <div className="flex md:hidden items-center justify-center gap-2.5 mt-4">
                          <button
                            onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'A' }))}
                            className={`transition-all duration-300 h-1.5 cursor-pointer ${activeSlide === 'A'
                              ? 'w-5 rounded-full bg-[#d4b483]'
                              : 'w-1.5 rounded-full bg-text-muted/30 hover:bg-text-muted/50'
                              }`}
                          />
                          <button
                            onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'B' }))}
                            className={`transition-all duration-300 h-1.5 cursor-pointer ${activeSlide === 'B'
                              ? 'w-5 rounded-full bg-[#d4b483]'
                              : 'w-1.5 rounded-full bg-text-muted/30 hover:bg-text-muted/50'
                              }`}
                          />
                        </div>

                      </div>

                      {/* --- JUDGE DECISION OVERVIEW (Buttons style from reference) --- */}
                      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                        {/* Option 1: Assistant A is better */}
                        <button
                          onClick={() => handleManualVerdict(activeChat.id, index, 'A', 'Assistant A marked as winner 🏆')}
                          onMouseEnter={() => setHoveredVerdict({ index, type: 'A' })}
                          onMouseLeave={() => setHoveredVerdict(null)}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-sans text-xs transition-all duration-200 cursor-pointer ${(msg.manualWinner === 'A' || (!msg.manualWinner && msg.judge.solution_1_score > msg.judge.solution_2_score))
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-450 font-semibold shadow-xs'
                            : 'border-border-subtle bg-bg-card/40 text-text-muted opacity-85 hover:border-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/5'
                            }`}
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Assistant A is better
                        </button>

                        {/* Option 2: Both are good */}
                        <button
                          onClick={() => handleManualVerdict(activeChat.id, index, 'both_good', 'Both responses marked as good! 🤝')}
                          onMouseEnter={() => setHoveredVerdict({ index, type: 'both_good' })}
                          onMouseLeave={() => setHoveredVerdict(null)}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-sans text-xs transition-all duration-200 cursor-pointer ${(msg.manualWinner === 'both_good' || (!msg.manualWinner && msg.judge.solution_1_score === msg.judge.solution_2_score && msg.judge.solution_1_score >= 7))
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-450 font-semibold shadow-xs'
                            : 'border-border-subtle bg-bg-card/40 text-text-muted opacity-85 hover:border-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/5'
                            }`}
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          Both are good
                        </button>

                        {/* Option 3: Both are bad */}
                        <button
                          onClick={() => handleManualVerdict(activeChat.id, index, 'both_bad', 'Both responses marked as bad. 👎')}
                          onMouseEnter={() => setHoveredVerdict({ index, type: 'both_bad' })}
                          onMouseLeave={() => setHoveredVerdict(null)}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-sans text-xs transition-all duration-200 cursor-pointer ${(msg.manualWinner === 'both_bad' || (!msg.manualWinner && msg.judge.solution_1_score === msg.judge.solution_2_score && msg.judge.solution_1_score < 7))
                            ? 'border-red-500/50 bg-red-500/10 text-red-400 font-semibold shadow-xs'
                            : 'border-border-subtle bg-bg-card/40 text-text-muted opacity-85 hover:border-red-500/60 hover:text-red-500 hover:bg-red-500/5'
                            }`}
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Both are bad
                        </button>

                        {/* Option 4: Assistant B is better */}
                        <button
                          onClick={() => handleManualVerdict(activeChat.id, index, 'B', 'Assistant B marked as winner 🏆')}
                          onMouseEnter={() => setHoveredVerdict({ index, type: 'B' })}
                          onMouseLeave={() => setHoveredVerdict(null)}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-sans text-xs transition-all duration-200 cursor-pointer ${(msg.manualWinner === 'B' || (!msg.manualWinner && msg.judge.solution_2_score > msg.judge.solution_1_score))
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-450 font-semibold shadow-xs'
                            : 'border-border-subtle bg-bg-card/40 text-text-muted opacity-85 hover:border-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/5'
                            }`}
                        >
                          Assistant B is better
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>

                      {/* --- JUDGE VERDICT HEADER --- */}
                      <div className="claude-card border-l-4 border-l-warm-accent rounded-2xl p-5 shadow-lg relative overflow-hidden bg-bg-card">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-border-subtle">

                          {/* Left: Judge Title & Winner */}
                          <div>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-text-muted tracking-wider mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-warm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Gemini Decisional Matrix
                            </div>
                            <h3 className="font-space font-bold text-lg text-text-main flex items-center gap-2 tracking-wide">
                              Verdict:
                              <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono uppercase tracking-widest ${verdict.color}`}>
                                {verdict.text}
                              </span>
                            </h3>
                          </div>

                          {/* Right: Scores comparison HUD */}
                          <div className="flex items-center gap-4 bg-black/10 p-2.5 rounded-xl border border-border-subtle">
                            <div className="text-center px-2">
                              <div className="font-mono text-[8px] uppercase tracking-wider text-text-muted">{getModelInfo(msg.modelA || 'mistral').label}</div>
                              <div className="font-space font-bold text-base text-warm-accent">{msg.judge.solution_1_score}/10</div>
                            </div>
                            <div className="text-sm font-bold font-mono text-text-muted">VS</div>
                            <div className="text-center px-2">
                              <div className="font-mono text-[8px] uppercase tracking-wider text-text-muted">{getModelInfo(msg.modelB || 'cohere').label}</div>
                              <div className="font-space font-bold text-base text-warm-accent">{msg.judge.solution_2_score}/10</div>
                            </div>
                          </div>

                        </div>

                        {/* Expandable detailed reasoning */}
                        <div>
                          <button
                            onClick={() => setExpandedReasoning(!expandedReasoning)}
                            className="flex items-center gap-1.5 font-mono text-xs text-warm-accent hover:underline cursor-pointer mb-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-200 ${expandedReasoning ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {expandedReasoning ? 'Collapse Judge Evaluation' : 'Expand Judge Evaluation'}
                          </button>

                          {expandedReasoning && (
                            <div className="space-y-3">
                              <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs leading-relaxed font-mono text-text-main">
                                  <div className={`p-3 bg-black/15 rounded border border-border-subtle ${activeSlide === 'A' ? 'block animate-slide-in' : 'hidden md:block'}`}>
                                    <span className="text-warm-accent font-bold block mb-1">{getModelInfo(msg.modelA || 'mistral').label.toUpperCase()} EVALUATION:</span>
                                    <p className="text-text-muted leading-relaxed">{msg.judge.solution_1_reasoing}</p>
                                  </div>
                                  <div className={`p-3 bg-black/15 rounded border border-border-subtle ${activeSlide === 'B' ? 'block animate-slide-in' : 'hidden md:block'}`}>
                                    <span className="text-warm-accent font-bold block mb-1">{getModelInfo(msg.modelB || 'cohere').label.toUpperCase()} EVALUATION:</span>
                                    <p className="text-text-muted leading-relaxed">{msg.judge.solution_2_resoning}</p>
                                  </div>
                                </div>

                                {/* Floating Mobile Slide Arrow for Judge Evaluation */}
                                <div className="md:hidden">
                                  {activeSlide === 'A' ? (
                                    <button
                                      onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'B' }))}
                                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-[#1b1b1b] border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main shadow-lg z-30 cursor-pointer transition-all active:scale-95"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'A' }))}
                                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-[#1b1b1b] border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-main shadow-lg z-30 cursor-pointer transition-all active:scale-95"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Mobile Pagination Dots for Judge Evaluation */}
                              <div className="flex md:hidden items-center justify-center gap-2.5 mt-2">
                                <button
                                  onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'A' }))}
                                  className={`transition-all duration-300 h-1.5 cursor-pointer ${activeSlide === 'A'
                                    ? 'w-5 rounded-full bg-[#d4b483]'
                                    : 'w-1.5 rounded-full bg-text-muted/30 hover:bg-text-muted/50'
                                    }`}
                                />
                                <button
                                  onClick={() => setMobileActiveSlides(prev => ({ ...prev, [index]: 'B' }))}
                                  className={`transition-all duration-300 h-1.5 cursor-pointer ${activeSlide === 'B'
                                    ? 'w-5 rounded-full bg-[#d4b483]'
                                    : 'w-1.5 rounded-full bg-text-muted/30 hover:bg-text-muted/50'
                                    }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                }
              })}
            </div>
          )}

          {/* --- IMMERSIVE CONSOLE LOADING STATE --- */}
          {loading && (
            <div className="max-w-4xl mx-auto claude-card border-warm-accent-border rounded-2xl p-5 shadow-md relative overflow-hidden bg-bg-card">

              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warm-accent animate-pulse"></span>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-warm-accent">
                    Battle Dispatch Console
                  </h4>
                </div>
                <span className="font-mono text-[9px] text-text-muted">PIPELINE ESTABLISHED</span>
              </div>

              {/* Console Logs mimicking real stages */}
              <div className="font-mono text-xs space-y-2 text-text-muted">
                <div className="flex gap-2">
                  <span className="text-warm-accent">&gt;</span>
                  <span className="text-text-main">SYS_CMD: Initiating dual LLM endpoint query...</span>
                </div>

                {/* Stage 1: Sending request to Express */}
                <div className="flex gap-2 items-center">
                  <span className={`${loadingPhase === 'sending' || loadingPhase === 'models' || loadingPhase === 'judging' ? 'text-warm-accent animate-pulse' : 'text-gray-700'}`}>
                    {loadingPhase === 'sending' ? '⚡' : '✓'}
                  </span>
                  <span className={loadingPhase === 'sending' ? 'text-text-main' : 'text-text-muted'}>
                    Contacting API route: <span className="text-warm-accent">POST /api/chat</span>
                  </span>
                </div>

                {/* Stage 2: Models running */}
                <div className="flex gap-2 items-center">
                  <span className={`${loadingPhase === 'models' ? 'text-warm-accent animate-spin' : loadingPhase === 'judging' ? 'text-warm-accent' : 'text-gray-700'}`}>
                    {loadingPhase === 'models' ? '⚙' : loadingPhase === 'judging' ? '✓' : '•'}
                  </span>
                  <span className={loadingPhase === 'models' ? 'text-text-main' : 'text-text-muted'}>
                    Running parallel runs: <span className="text-warm-accent">{getModelInfo(modelA).label}</span> &amp; <span className="text-warm-accent">{getModelInfo(modelB).label}</span>
                  </span>
                </div>

                {/* Stage 3: Judge running */}
                <div className="flex gap-2 items-center">
                  <span className={`${loadingPhase === 'judging' ? 'text-warm-accent animate-spin' : 'text-gray-700'}`}>
                    {loadingPhase === 'judging' ? '⚙' : '•'}
                  </span>
                  <span className={loadingPhase === 'judging' ? 'text-text-main font-medium' : 'text-text-muted'}>
                    Invoking Gemini-2.5-Flash Decision Matrix for evaluation...
                  </span>
                </div>

                {/* Blinking Prompt Cursor */}
                <div className="flex gap-2 pt-2 text-warm-accent font-bold animate-pulse text-xs">
                  <span>_ RUNNING COMBAT ENGINE...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- BOTTOM FLOATING INPUT CENTER (Claude UI style) --- */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-bg-base via-bg-base/90 to-transparent relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="claude-card hover:border-warm-accent/40 focus-within:border-warm-accent/60 focus-within:shadow-[0_4px_20px_rgba(204,139,69,0.06)] rounded-2xl p-3 transition-all duration-300 relative flex flex-col">

              {/* Textarea Input */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the models to battle (e.g., 'Compare python quicksort vs bubblesort')..."
                className="w-full bg-transparent border-0 outline-hidden focus:ring-0 text-text-main placeholder-text-muted text-sm leading-relaxed p-2 resize-none min-h-[44px] max-h-40"
                disabled={loading}
              />

              {/* Action Toolbar inside input box */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-2.5 mt-2 px-2">

                {/* Model Selection Custom Dropdowns */}
                <div className="flex items-center flex-wrap gap-3">
                  <ModelSelector
                    label="A"
                    selectedId={modelA}
                    otherSelectedId={modelB}
                    onChange={setModelA}
                    disabled={loading}
                  />

                  <span className="text-warm-accent font-space font-bold text-xs uppercase select-none">vs</span>

                  <ModelSelector
                    label="B"
                    selectedId={modelB}
                    otherSelectedId={modelA}
                    onChange={setModelB}
                    disabled={loading}
                  />
                </div>

                {/* Submit button and hotkeys */}
                <div className="flex items-center gap-4 ml-auto">
                  <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
                    <span>Submit:</span>
                    <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-border-subtle">Enter</kbd>
                  </div>

                  <button
                    onClick={() => handleSubmit()}
                    disabled={loading || !inputText.trim()}
                    className={`flex items-center gap-2 py-1.5 px-4 rounded-lg font-space font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer ${loading || !inputText.trim()
                      ? 'bg-bg-sidebar text-text-muted border border-border-subtle cursor-not-allowed shadow-none'
                      : 'bg-warm-accent text-text-dark hover:bg-white hover:text-black active:translate-y-0'
                      }`}
                  >
                    {loading ? 'Running...' : 'Run Battle'}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

            {/* Disclaimer subtitle */}

          </div>
        </div>

      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-bg-card border-l-4 border-l-emerald-500 border border-border-subtle rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-slide-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-text-main">{toast}</span>
        </div>
      )}

    </div>
  );
}
