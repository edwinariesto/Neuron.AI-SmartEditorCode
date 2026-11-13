/**
 * Neuron.AI — Intelligent Automatic Language Detector
 * File: _manage/editor/editor-detector.js
 * 
 * Auto-detects programming & markup languages in real-time from syntax cues,
 * keywords, structure, and AI verification, without forcing dropdown selection.
 */

(function (window) {
  'use strict';

  const LANGUAGE_CONFIGS = {
    php: {
      id: 'php',
      name: 'PHP',
      aceMode: 'ace/mode/php',
      icon: 'bi-filetype-php',
      color: '#8993be',
      patterns: [
        /<\?php/i,
        /<\?=/i,
        /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
        /\becho\b/,
        /\bprint_r\s*\(/,
        /\bvar_dump\s*\(/,
        /\bforeach\s*\(\s*\$/,
        /->[a-zA-Z_]/,
        /::[a-zA-Z_]/,
        /\bfunction\s+[a-zA-Z_0-9]+\s*\(\s*\$/
      ],
      scoreWeight: 2.5
    },
    python: {
      id: 'python',
      name: 'Python',
      aceMode: 'ace/mode/python',
      icon: 'bi-filetype-py',
      color: '#38bdf8',
      patterns: [
        /\bdef\s+[a-zA-Z_0-9]+\s*\([^)]*\)\s*:/,
        /\belif\s+.*:/,
        /\bimport\s+[a-zA-Z0-9_]+/,
        /\bfrom\s+[a-zA-Z0-9_.]+\s+import\b/,
        /\bprint\s*\(/,
        /\bif\s+__name__\s*==\s*['"]__main__['"]\s*:/,
        /\bself\.[a-zA-Z_]/,
        /\bclass\s+[a-zA-Z0-9_]+(\s*\([^)]*\))?\s*:/,
        /:\s*[\r\n]+\s+[a-zA-Z_]/
      ],
      scoreWeight: 2.2
    },
    javascript: {
      id: 'javascript',
      name: 'JavaScript',
      aceMode: 'ace/mode/javascript',
      icon: 'bi-filetype-js',
      color: '#facc15',
      patterns: [
        /\bconsole\.(log|warn|error|info|debug)\s*\(/,
        /\bconst\s+[a-zA-Z_0-9]+\s*=/,
        /\blet\s+[a-zA-Z_0-9]+\s*=/,
        /\bvar\s+[a-zA-Z_0-9]+\s*=/,
        /\bdocument\.(getElementById|querySelector|createElement)/,
        /\bwindow\.[a-zA-Z_]/,
        /=>\s*[\{a-zA-Z0-9_]/,
        /\bfunction\s*\(/,
        /\baddEventListener\s*\(/,
        /\bJSON\.(parse|stringify)\s*\(/
      ],
      scoreWeight: 2.0
    },
    typescript: {
      id: 'typescript',
      name: 'TypeScript',
      aceMode: 'ace/mode/typescript',
      icon: 'bi-filetype-ts',
      color: '#3b82f6',
      patterns: [
        /\binterface\s+[A-Z][a-zA-Z0-9_]*\s*\{/,
        /\btype\s+[A-Z][a-zA-Z0-9_]*\s*=/,
        /:\s*(string|number|boolean|any|void|unknown|never)\b/,
        /\bas\s+[A-Z][a-zA-Z0-9_]*/,
        /\bpublic\s+[a-zA-Z_0-9]+\s*:\s*[a-zA-Z_0-9]+/,
        /\bprivate\s+[a-zA-Z_0-9]+\s*:/
      ],
      scoreWeight: 2.8
    },
    html: {
      id: 'html',
      name: 'HTML',
      aceMode: 'ace/mode/html',
      icon: 'bi-filetype-html',
      color: '#ea580c',
      patterns: [
        /<!doctype\s+html>/i,
        /<html\b/i,
        /<head\b/i,
        /<body\b/i,
        /<div\b[^>]*>/i,
        /<script\b[^>]*>/i,
        /<style\b[^>]*>/i,
        /<table\b[^>]*>/i,
        /<\/?[a-z][a-z0-9]*\b[^>]*>/i
      ],
      scoreWeight: 2.5
    },
    sql: {
      id: 'sql',
      name: 'SQL',
      aceMode: 'ace/mode/sql',
      icon: 'bi-database',
      color: '#06b6d4',
      patterns: [
        /\bSELECT\b[\s\S]+\bFROM\b/i,
        /\bINSERT\s+INTO\b/i,
        /\bUPDATE\s+[a-zA-Z0-9_]+\s+SET\b/i,
        /\bDELETE\s+FROM\b/i,
        /\bCREATE\s+TABLE\b/i,
        /\bALTER\s+TABLE\b/i,
        /\bWHERE\b[\s\S]+(=|>|<|LIKE|IN)/i,
        /\bGROUP\s+BY\b/i,
        /\bORDER\s+BY\b/i
      ],
      scoreWeight: 3.0
    },
    cpp: {
      id: 'cpp',
      name: 'C / C++',
      aceMode: 'ace/mode/c_cpp',
      icon: 'bi-cpu',
      color: '#6366f1',
      patterns: [
        /#include\s*<[a-zA-Z0-9_.]+>/,
        /\busing\s+namespace\s+std\s*;/,
        /\bstd::(cout|cin|vector|string|endl)/,
        /\bint\s+main\s*\(\s*(void|[^\)]*)?\s*\)/,
        /\bcout\s*<</,
        /\bcin\s*>>/,
        /\bprintf\s*\(/
      ],
      scoreWeight: 2.8
    },
    csharp: {
      id: 'csharp',
      name: 'C#',
      aceMode: 'ace/mode/csharp',
      icon: 'bi-hash',
      color: '#9333ea',
      patterns: [
        /\busing\s+System(\.[a-zA-Z0-9_]+)*\s*;/,
        /\bnamespace\s+[a-zA-Z0-9_.]+/,
        /\bConsole\.(WriteLine|Write|ReadLine)\s*\(/,
        /\bpublic\s+class\s+[a-zA-Z0-9_]+/,
        /\bstatic\s+void\s+Main\s*\(/
      ],
      scoreWeight: 2.8
    },
    ruby: {
      id: 'ruby',
      name: 'Ruby',
      aceMode: 'ace/mode/ruby',
      icon: 'bi-gem',
      color: '#e11d48',
      patterns: [
        /\bdef\s+[a-zA-Z_0-9]+[\s\n]/,
        /\bputs\s+/,
        /\battr_accessor\b/,
        /\brequire\s+['"][a-zA-Z0-9_]+['"]/,
        /\.each\s*\{/,
        /\bend\b/
      ],
      scoreWeight: 2.0
    },
    json: {
      id: 'json',
      name: 'JSON',
      aceMode: 'ace/mode/json',
      icon: 'bi-filetype-json',
      color: '#10b981',
      patterns: [
        /^\s*\{\s*"[a-zA-Z0-9_]+"\s*:/,
        /^\s*\[\s*\{\s*"[a-zA-Z0-9_]+"\s*:/
      ],
      scoreWeight: 3.0
    },
    matlab: {
      id: 'matlab',
      name: 'MATLAB',
      aceMode: 'ace/mode/matlab',
      icon: 'bi-calculator',
      color: '#d97706',
      patterns: [
        /^\s*%.*/m,
        /\bclc\s*;/i,
        /\bclear\s*;/i,
        /\bclearvars\b/i,
        /\bdisp\s*\(/i,
        /\bfprintf\s*\(/i,
        /\[\s*[-0-9.]+(\s*,\s*|\s+)[-0-9.]+(\s*;\s*|\s*[\r\n]+\s*)[-0-9.]+/m,
        /\b(zeros|ones|eye|linspace|rand|randn)\s*\(/i,
        /\b(det|inv|eig|rank|trace|norm|diag|fft)\s*\(/i,
        /\b(plot|subplot|xlabel|ylabel|title|figure|hold\s+on|grid\s+on)\b/i,
        /\bfunction\s+(\[[^\]]+\]|[a-zA-Z_]\w*)\s*=\s*[a-zA-Z_]\w*\s*\(/i
      ],
      scoreWeight: 3.5
    },
    java: {
      id: 'java',
      name: 'Java',
      aceMode: 'ace/mode/java',
      icon: 'bi-filetype-java',
      color: '#b07219',
      patterns: [
        /\bpublic\s+class\s+[A-Z][a-zA-Z0-9_]*/,
        /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*[a-zA-Z_0-9]+\s*\)/,
        /\bSystem\.(out|err)\.(println|print|printf)\s*\(/,
        /\bimport\s+java\.[a-zA-Z0-9_.*]+;/
      ],
      scoreWeight: 3.2
    }
  };

  class NeuronDetector {
    constructor() {
      this.currentLang = 'javascript';
      this.isManualOverride = false;
      this.listeners = [];
      this.debounceTimer = null;
      this.lastDetectedCode = '';
    }

    onLanguageChange(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }

    notifyChange(langInfo, source = 'auto') {
      this.currentLang = langInfo.id;
      this.listeners.forEach(cb => {
        try {
          cb(langInfo, source);
        } catch (err) {
          console.error('[NeuronDetector] Callback error:', err);
        }
      });
    }

    setManualOverride(langId) {
      if (!langId) {
        this.isManualOverride = false;
        return;
      }
      const target = LANGUAGE_CONFIGS[langId.toLowerCase()];
      if (target) {
        this.isManualOverride = true;
        this.notifyChange(target, 'manual');
      }
    }

    resetToAuto(code) {
      this.isManualOverride = false;
      this.analyze(code, true);
    }

    detectFast(code) {
      if (!code || typeof code !== 'string') return null;
      const trimmed = code.trim();
      if (trimmed.length < 3) return null;

      // Special check for pure JSON
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          JSON.parse(trimmed);
          return { ...LANGUAGE_CONFIGS.json, confidence: 'high', score: 100, reason: 'Valid JSON format' };
        } catch (e) {
          // not pure valid JSON, continue
        }
      }

      // Check for explicit HTML
      if (trimmed.toLowerCase().startsWith('<!doctype html') || trimmed.toLowerCase().startsWith('<html')) {
        return { ...LANGUAGE_CONFIGS.html, confidence: 'high', score: 100, reason: 'Dokumen HTML valid' };
      }

      // Check for explicit PHP tag
      if (trimmed.startsWith('<?php') || trimmed.startsWith('<?=')) {
        return { ...LANGUAGE_CONFIGS.php, confidence: 'high', score: 100, reason: 'Tag <?php eksplisit terdeteksi' };
      }

      const scores = {};

      Object.keys(LANGUAGE_CONFIGS).forEach(key => {
        const cfg = LANGUAGE_CONFIGS[key];
        let score = 0;
        cfg.patterns.forEach(regex => {
          if (regex.test(trimmed)) {
            score += cfg.scoreWeight;
          }
        });
        scores[key] = score;
      });

      // Special boosts
      if (scores.typescript > 0 && scores.typescript >= scores.javascript) {
        scores.typescript += 2;
      }

      let topLang = null;
      let maxScore = 0;
      Object.keys(scores).forEach(key => {
        if (scores[key] > maxScore) {
          maxScore = scores[key];
          topLang = key;
        }
      });

      if (topLang && maxScore >= 2.0) {
        const conf = maxScore >= 4 ? 'high' : 'medium';
        return {
          ...LANGUAGE_CONFIGS[topLang],
          confidence: conf,
          score: maxScore,
          reason: `Pola sintaks ${LANGUAGE_CONFIGS[topLang].name} terdeteksi`
        };
      }

      return null;
    }

    analyze(code, force = false) {
      if (this.isManualOverride && !force) {
        return;
      }

      const trimmed = (code || '').trim();
      if (!trimmed) {
        return;
      }

      if (trimmed === this.lastDetectedCode && !force) {
        return;
      }
      this.lastDetectedCode = trimmed;

      const fastResult = this.detectFast(trimmed);
      if (fastResult) {
        this.notifyChange(fastResult, 'auto-heuristic');
        return;
      }

      // Debounced AI detector if heuristics are uncertain and code is >= 15 chars
      if (trimmed.length >= 15) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.fetchAiDetection(trimmed);
        }, 1200);
      }
    }

    async fetchAiDetection(code) {
      if (this.isManualOverride) return;

      try {
        const currentLang = localStorage.getItem('neuron_ai_lang') || 'Indonesia';
        const resp = await fetch('execute_code.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'detect_language',
            code: code,
            bahasa: currentLang,
            availableOptions: Object.keys(LANGUAGE_CONFIGS).map(k => LANGUAGE_CONFIGS[k].name).join(',')
          })
        });

        if (!resp.ok) return;
        const data = await resp.json();

        if (data && data.status === 'ok' && data.language) {
          const matchedKey = Object.keys(LANGUAGE_CONFIGS).find(k => 
            LANGUAGE_CONFIGS[k].name.toLowerCase() === data.language.toLowerCase() ||
            k.toLowerCase() === data.language.toLowerCase()
          );

          if (matchedKey) {
            const detected = {
              ...LANGUAGE_CONFIGS[matchedKey],
              confidence: data.confidence || 'high',
              reason: data.reason || 'Diverifikasi oleh AI Gemini',
              aiModel: data.model || 'gemini-2.5-flash'
            };
            this.notifyChange(detected, 'auto-ai');
          }
        }
      } catch (err) {
        console.warn('[NeuronDetector] AI Detection fallback skipped:', err);
      }
    }

    getAllLanguages() {
      return LANGUAGE_CONFIGS;
    }
  }

  // Export singleton
  window.NeuronDetector = new NeuronDetector();
})(window);

