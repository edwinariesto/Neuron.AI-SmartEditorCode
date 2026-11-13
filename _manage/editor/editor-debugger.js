/**
 * Neuron.AI — AI-Powered Line-by-Line Code Auditor & Debugger
 * File: _manage/editor/editor-debugger.js
 * 
 * Performs line-by-line syntax & logic analysis via Gemini AI and built-in Local Code Auditor,
 * places Ace Editor gutter annotations, and provides simple layman fix suggestions.
 */

(function (window) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Built-in Client-Side Layman Code Auditor
   * Inspects syntax rules, typos, missing symbols, and runtime compiler logs.
   */
  function auditCodeLocally(code, language, isEn, errorText = '') {
    const lang = (language || 'PHP').toUpperCase();
    const isPhp = lang.includes('PHP');
    const isPy = lang.includes('PYTHON') || lang === 'PY';
    const isJs = lang.includes('JAVASCRIPT') || lang === 'JS' || lang.includes('TYPESCRIPT') || lang === 'TS';
    const isC = lang.includes('C++') || lang === 'C' || lang.includes('CSHARP') || lang === 'CS';
    const isMatlab = lang.includes('MATLAB') || lang.includes('OCTAVE');
    const isCStyle = isPhp || isJs || isC;

    const lines = String(code || '').split(/\r?\n/);
    const issues = [];
    const seenLines = new Set();

    const addIssue = (lineNo, cause, fix, whereText = '') => {
      if (seenLines.has(`${lineNo}:${cause}`)) return;
      seenLines.add(`${lineNo}:${cause}`);
      const rawLine = (lines[lineNo - 1] || '').trim();
      issues.push({
        line: lineNo,
        where: whereText || (isEn ? `Line ${lineNo} (\`${rawLine}\`)` : `Baris ${lineNo} (\`${rawLine}\`)`),
        cause,
        fix
      });
    };

    // 1. Parse compiler / interpreter runtime error if provided
    if (errorText && errorText.trim()) {
      const errStr = errorText.trim();
      let m;

      // PHP: Parse error: syntax error ... on line X
      if ((m = errStr.match(/syntax error,?\s*(.+?)\s+in\s+.+?\s+on line\s+(\d+)/i))) {
        const lineNo = parseInt(m[2], 10);
        const detail = m[1];
        let laymanCause = isEn ? 'Syntax error on this line.' : 'Kesalahan penulisan aturan sintaks pada baris ini.';
        let laymanFix = isEn ? 'Check for missing semicolon (;), unmatched quotes, or spelling.' : 'Periksa kemungkinan lupa titik koma (;), tanda kutip belum ditutup, atau salah ketik.';

        if (/unexpected end of file/i.test(detail)) {
          laymanCause = isEn ? 'Unexpected end of code. A quote, bracket, or curly brace was opened but never closed.' : 'Kode terputus sebelum selesai. Kemungkinan ada tanda kurung atau tanda kutip yang belum ditutup.';
          laymanFix = isEn ? 'Close all opened brackets `)` `}` `]` or quotes `"` before line ends.' : 'Pastikan seluruh kurung `)` `}` `]` atau tanda kutip `"` sudah ditutup dengan benar.';
        } else if (/unexpected token/i.test(detail) || /unexpected '(.+?)'/i.test(detail)) {
          laymanCause = isEn ? `Unexpected character or symbol near this line.` : `Ada tanda atau karakter yang tidak cocok pada posisi ini.`;
          laymanFix = isEn ? `Check if the preceding line is missing a semicolon (;) or closed bracket.` : `Periksa apakah baris di atasnya lupa diakhiri titik koma (;) atau kurung tutup.`;
        }
        addIssue(lineNo, laymanCause, laymanFix);
      }

      // Python: File "...", line X \n ... SyntaxError: ...
      if ((m = errStr.match(/line\s+(\d+)(?:,\s*in\s+.+)?\s*\n.*?(SyntaxError|IndentationError|NameError):\s*(.+)/i))) {
        const lineNo = parseInt(m[1], 10);
        const errType = m[2];
        const detail = m[3];
        let laymanCause = isEn ? `Python reported ${errType}: ${detail}` : `Python mendeteksi kesalahan ${errType}: ${detail}`;
        let laymanFix = isEn ? 'Check Python syntax on this line.' : 'Periksa susunan sintaks Python pada baris ini.';

        if (/IndentationError/i.test(errType)) {
          laymanCause = isEn ? 'Indentation error: spaces or tabs are misaligned.' : 'Jarak spasi menjorok ke dalam tidak sejajar sesuai aturan blok Python.';
          laymanFix = isEn ? 'Align indentation with 4 spaces under the statement header.' : 'Sejajarkan spasi menjorok (gunakan 4 spasi) di bawah perintah kepala.';
        } else if (/invalid syntax/i.test(detail)) {
          laymanCause = isEn ? 'Invalid syntax: missing colon (`:`) or mismatched symbol.' : 'Aturan penulisan tidak valid: kemungkinan lupa titik dua (`:`) atau salah ketik.';
          laymanFix = isEn ? 'Ensure statements like `if`, `for`, `def` end with a colon (`:`).' : 'Pastikan baris `if`, `for`, `def`, atau `else` diakhiri tanda titik dua (`:`).';
        }
        addIssue(lineNo, laymanCause, laymanFix);
      }
    }

    // 2. Bracket, Parentheses, and Braces Matching Check
    const bracketStack = [];
    const openChars = { '(': ')', '{': '}', '[': ']' };
    const closeChars = { ')': '(', '}': '{', ']': '[' };

    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      const stripped = isMatlab
        ? line.replace(/%.*$/g, '')
        : line.replace(/\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/g, ''); // strip single line comments

      for (let cIdx = 0; cIdx < stripped.length; cIdx++) {
        const ch = stripped[cIdx];
        if (openChars[ch]) {
          bracketStack.push({ ch, lineNo, expected: openChars[ch] });
        } else if (closeChars[ch]) {
          if (bracketStack.length === 0) {
            addIssue(
              lineNo,
              isEn ? `Unmatched closing bracket \`${ch}\` found without opening bracket.` : `Ditemukan tanda kurung tutup \`${ch}\` tanpa kurung buka pasangannya.`,
              isEn ? `Remove this excess \`${ch}\` or add the matching open bracket before it.` : `Hapus kurung penutup berlebih ini atau tambahkan kurung buka di depannya.`
            );
          } else {
            const last = bracketStack.pop();
            if (last.expected !== ch) {
              addIssue(
                lineNo,
                isEn ? `Mismatched bracket: expected \`${last.expected}\` (opened on line ${last.lineNo}), but got \`${ch}\`.` : `Pasangan kurung tertukar: seharusnya ditutup \`${last.expected}\` (yang dibuka di baris ${last.lineNo}), bukan \`${ch}\`.`,
                isEn ? `Change \`${ch}\` to \`${last.expected}\` or fix bracket nesting.` : `Ganti \`${ch}\` menjadi \`${last.expected}\` agar pasangannya sesuai.`
              );
            }
          }
        }
      }
    });

    // Unclosed brackets remaining at end of file
    if (bracketStack.length > 0) {
      bracketStack.forEach(b => {
        addIssue(
          b.lineNo,
          isEn ? `Bracket \`${b.ch}\` opened here is never closed.` : `Tanda kurung \`${b.ch}\` yang dibuka di sini belum ditutup pasangannya (\`${b.expected}\`).`,
          isEn ? `Add closing bracket \`${b.expected}\` where the block finishes.` : `Tambahkan kurung tutup \`${b.expected}\` di akhir blok perintah.`
        );
      });
    }

    // 3. Line-by-Line Heuristic Syntax Checks
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      const trimmed = line.trim();
      if (!trimmed) return;
      if (isMatlab && trimmed.startsWith('%')) return;
      if (!isMatlab && (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*'))) return;

      // MATLAB Specific Syntax Checks
      if (isMatlab) {
        if (/^(\/\/|#)/.test(trimmed)) {
          addIssue(
            lineNo,
            isEn ? 'In MATLAB, comments must start with `%`, not `//` or `#`.' : 'Di MATLAB, baris komentar wajib diawali tanda persen (`%`), bukan `//` atau `#`.',
            isEn ? `Replace with: \`% ${trimmed.replace(/^(\/\/|#)\s*/, '')}\`` : `Ganti dengan: \`% ${trimmed.replace(/^(\/\/|#)\s*/, '')}\``
          );
        }
        if (/\*\*/.test(trimmed)) {
          addIssue(
            lineNo,
            isEn ? 'In MATLAB, power operator is `^` or `.^`, not `**`.' : 'Di MATLAB, operator pemangkatan menggunakan tanda pangkat (`^`) atau (`.^`), bukan `**`.',
            isEn ? 'Use `^` for matrix or `.^` for element-wise power.' : 'Gunakan tanda `^` untuk matriks atau `.^` untuk pemangkatan elemen.'
          );
        }
      }

      // Unclosed quotes check
      const dQuotes = (trimmed.match(/(?<!\\)"/g) || []).length;
      const sQuotes = (trimmed.match(/(?<!\\)'/g) || []).length;
      if (dQuotes % 2 !== 0 && sQuotes % 2 === 0) {
        addIssue(
          lineNo,
          isEn ? 'Unclosed double quote (`"`) on this line.' : 'Tanda kutip dua (`"`) belum ditutup secara berpasangan pada baris ini.',
          isEn ? 'Ensure every string literal is enclosed with matching quotes.' : 'Pastikan setiap teks diapit sepasang tanda kutip pembuka dan penutup yang sama.'
        );
      } else if (sQuotes % 2 !== 0 && dQuotes % 2 === 0) {
        addIssue(
          lineNo,
          isEn ? 'Unclosed single quote (`\'`) on this line.' : 'Tanda kutip satu (`\'`) belum ditutup secara berpasangan pada baris ini.',
          isEn ? 'Ensure every string literal is enclosed with matching quotes.' : 'Pastikan setiap teks diapit sepasang tanda kutip pembuka dan penutup yang sama.'
        );
      }

      // Python Missing Colons (:) on block headers
      if (isPy) {
        const pyHeaderMatch = trimmed.match(/^(?:if|elif|else|for|while|def|class|try|except|finally|with)\b(.*)$/);
        if (pyHeaderMatch) {
          const rest = pyHeaderMatch[1].trim();
          if (!trimmed.endsWith(':')) {
            addIssue(
              lineNo,
              isEn ? 'Python block header must end with a colon (`:`).' : 'Kepala perintah Python ini wajib diakhiri tanda titik dua (`:`).',
              isEn ? `Add \`:\` at the end of the line: \`${trimmed}:\`` : `Tambahkan titik dua di akhir baris: \`${trimmed}:\``
            );
          }
        }
      }

      // PHP Missing Dollar Sign ($) on variable declarations
      if (isPhp) {
        const phpNoDollarMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*[^=]/);
        if (phpNoDollarMatch) {
          const word = phpNoDollarMatch[1];
          const skipWords = new Set(['const', 'define', 'static', 'global', 'var', 'public', 'private', 'protected', 'let', 'function', 'class', 'return', 'echo', 'print', 'case', 'default']);
          if (!skipWords.has(word.toLowerCase())) {
            addIssue(
              lineNo,
              isEn ? `PHP variable \`${word}\` is missing the dollar sign prefix (\`$\`).` : `Nama wadah data (variabel) PHP \`${word}\` wajib diawali tanda dollar (\`$\`).`,
              isEn ? `Change \`${word} =\` to \`$${word} =\`` : `Ubah penulisan menjadi \`$${word} =\``
            );
          }
        }
      }

      // Missing Semicolon (;) in C-style languages (PHP, JS, TS, C++)
      if (isCStyle) {
        const shouldHaveSemicolon =
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          !trimmed.endsWith(',') &&
          !trimmed.endsWith('(') &&
          !trimmed.endsWith(':') &&
          !trimmed.startsWith('<?php') &&
          !trimmed.startsWith('?>') &&
          !/^(?:if|for|while|foreach|switch|class|function|def|interface|try|catch|else|do)\b/.test(trimmed) &&
          /(?:=|\+\+|\-\-|\b(?:echo|print|return|break|continue|throw)\b|\bconsole\.log|\b\w+\([^)]*\)$)/.test(trimmed);

        if (shouldHaveSemicolon) {
          addIssue(
            lineNo,
            isEn ? 'Missing semicolon (`;`) at the end of this statement.' : 'Tanda penutup perintah (`;`) belum ditulis di akhir baris ini.',
            isEn ? `Add a semicolon at the end: \`${trimmed};\`` : `Tambahkan tanda titik koma di akhir: \`${trimmed};\``
          );
        }
      }

      // Keyword typos check
      const typos = [
        { regex: /\bechoo\b/i, correct: 'echo', note: 'kelebihan huruf o' },
        { regex: /\bech\b(?!\w)/i, correct: 'echo', note: 'kurang huruf o' },
        { regex: /\bprnt\b/i, correct: 'print', note: 'kurang huruf i' },
        { regex: /\bpritn\b/i, correct: 'print', note: 'huruf t dan n tertukar' },
        { regex: /\bfuncton\b/i, correct: 'function', note: 'kurang huruf i' },
        { regex: /\bfuntion\b/i, correct: 'function', note: 'kurang huruf c' },
        { regex: /\bretrun\b/i, correct: 'return', note: 'huruf r dan u tertukar' },
        { regex: /\bwhle\b/i, correct: 'while', note: 'kurang huruf i' },
        { regex: /\bfoor\b/i, correct: 'for', note: 'kelebihan huruf o' },
        { regex: /\belsif\b/i, correct: isPhp ? 'elseif' : 'elif', note: 'salah ketik kata kunci' },
        { regex: /\bimprot\b/i, correct: 'import', note: 'huruf r dan o tertukar' }
      ];

      typos.forEach(t => {
        if (t.regex.test(trimmed)) {
          addIssue(
            lineNo,
            isEn ? `Typo in keyword: should be \`${t.correct}\`.` : `Salah ketik pada kata kunci perintah: seharusnya \`${t.correct}\` (${t.note}).`,
            isEn ? `Replace with \`${t.correct}\`` : `Ganti kata tersebut dengan \`${t.correct}\``
          );
        }
      });
    });

    const hasIssues = issues.length > 0;
    const linesList = Array.from(new Set(issues.map(it => it.line))).sort((a, b) => a - b);
    const whereSummary = linesList.length > 0
      ? (isEn ? `Line(s) ${linesList.join(', ')}` : `Baris ${linesList.join(', ')}`)
      : (isEn ? 'All lines' : 'Semua baris');

    return {
      hasIssues,
      where: whereSummary,
      cause: hasIssues
        ? (isEn ? `Found ${issues.length} issue(s) in code (Layman Syntax Audit).` : `Ditemukan ${issues.length} bagian kode yang perlu diperbaiki (Hasil Audit Koding).`)
        : (isEn ? 'All lines checked. No syntax or grammar errors found!' : 'Semua baris kode telah diperiksa dan tidak ditemukan kesalahan sintaks!'),
      fix: hasIssues && issues[0] ? issues[0].fix : '',
      issues
    };
  }

  class NeuronDebugger {
    constructor() {
      this.isDebugging = false;
      this.currentAnnotations = [];
      this.editorInstance = null;
      this.container = null;
    }

    init(editorInstance, containerEl) {
      this.editorInstance = editorInstance;
      this.container = typeof containerEl === 'string' ? document.getElementById(containerEl) : containerEl;
    }

    clear() {
      if (this.editorInstance) {
        this.editorInstance.session.clearAnnotations();
      }
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.currentAnnotations = [];
    }

    async auditCode(code, language, errorText = '') {
      if (!this.container) return;

      const trimmedCode = (code || '').trim();
      if (!trimmedCode) {
        this.renderEmptyState();
        return;
      }

      this.isDebugging = true;
      this.renderLoadingState();

      const currentLang = localStorage.getItem('neuron_ai_lang') || 'Indonesia';
      const isEn = (currentLang === 'English');

      // 1. Run Built-In Local Code Auditor First (Guaranteed Instant Results)
      const localResult = auditCodeLocally(trimmedCode, language, isEn, errorText);

      // 2. Prepare API Key & Provider from Local Storage
      const apiKey = localStorage.getItem('neuron_ai_key_local') || '';
      const provider = localStorage.getItem('neuron_ai_model') || 'gemini-2.5-flash';

      try {
        const resp = await fetch('execute_code.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'explain_error',
            code: trimmedCode,
            language: language || 'PHP',
            errorText: errorText,
            bahasa: currentLang,
            apiKey: apiKey,
            provider: provider,
            localAudit: JSON.stringify(localResult.issues)
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data && data.status === 'ok' && data.explanation) {
            this.renderResults(data.explanation, data.model || 'Gemini AI', isEn, true);
            return;
          }
        }
      } catch (_e) {
        // Network or server issue: continue to local fallback
      } finally {
        this.isDebugging = false;
      }

      // 3. Fallback: Render Local Code Auditor results (Never show dead-end error!)
      this.renderResults(localResult, isEn ? 'Smart Local Audit' : 'Audit Koding Cerdas (Lokal)', isEn, false);
    }

    renderLoadingState() {
      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
      this.container.innerHTML = `
        <div class="p-4 text-center d-flex flex-column align-items-center justify-content-center" style="min-height: 320px;">
          <div class="spinner-border mb-3" style="width: 3rem; height: 3rem; color: #ea580c;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h6 class="fw-bold mb-1" style="color: var(--neuron-text-primary);">
            <i class="bi bi-robot me-1" style="color: #ea580c;"></i> ${isEn ? 'AI is inspecting code line-by-line...' : 'AI sedang memeriksa kode baris demi baris...'}
          </h6>
          <p class="small m-0" style="color: var(--neuron-text-secondary); max-width: 360px;">
            ${isEn ? 'Checking syntax, typos, missing symbols, and logical flow in plain language.' : 'Mengecek tata bahasa, salah ketik, tanda yang kurang, dan alur logika secara awam.'}
          </p>
        </div>
      `;
    }

    renderResults(explanation, model, isEn, isOnlineAi = false) {
      this.clear();

      const issues = Array.isArray(explanation.issues) ? explanation.issues : [];
      const hasIssues = issues.length > 0 || (explanation.cause && !/tidak ada kesalahan|sempurna|correct|clean|valid|no error/i.test(explanation.cause));

      // 1. Set Ace Editor Annotations
      if (this.editorInstance && issues.length > 0) {
        const annotations = issues.map(it => ({
          row: Math.max(0, (parseInt(it.line, 10) || 1) - 1),
          column: 0,
          text: it.cause || (isEn ? 'Check this line' : 'Periksa baris ini'),
          type: 'error'
        }));
        this.editorInstance.session.setAnnotations(annotations);
      }

      const wrap = document.createElement('div');
      wrap.className = 'debug-results-box p-3 p-md-4 d-flex flex-column gap-3';

      // Header summary badge
      const headerCard = document.createElement('div');
      headerCard.className = `p-3.5 p-md-4 rounded-4 border ${hasIssues ? 'border-danger-subtle bg-danger bg-opacity-10' : 'border-success-subtle bg-success bg-opacity-10'}`;

      const modelBadgeHtml = isOnlineAi
        ? `<span class="badge bg-white text-dark border border-secondary border-opacity-25 shadow-sm px-3 py-1.5 rounded-pill"><i class="bi bi-stars me-1" style="color: #ea580c;"></i> ${escapeHtml(model)} (Online AI)</span>`
        : `<span class="badge bg-white text-dark border border-secondary border-opacity-25 shadow-sm px-3 py-1.5 rounded-pill"><i class="bi bi-shield-check me-1" style="color: #ea580c;"></i> ${escapeHtml(model)}</span>`;

      headerCard.innerHTML = `
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${hasIssues ? 'bg-danger' : 'bg-success'} fs-6 py-2 px-3.5 rounded-pill">
              <i class="bi ${hasIssues ? 'bi-exclamation-octagon-fill' : 'bi-check-circle-fill'} me-1"></i>
              ${hasIssues ? (isEn ? `${issues.length || 1} Issue(s) Detected` : `${issues.length || 1} Bagian Perlu Diperbaiki`) : (isEn ? 'Code is Clean & Valid' : 'Kode Bersih & Benar')}
            </span>
            ${explanation.where ? `<span class="badge bg-white text-dark border border-secondary border-opacity-25 px-2.5 py-1.5 rounded-pill font-monospace">${escapeHtml(explanation.where)}</span>` : ''}
          </div>
          ${modelBadgeHtml}
        </div>
        <p class="mb-1 fw-semibold small" style="color: var(--neuron-text-primary); line-height: 1.6; padding: 2px 4px;">
          ${escapeHtml(explanation.cause || (hasIssues ? 'Ditemukan beberapa bagian kode yang perlu diperbaiki.' : 'Semua baris kode telah diperiksa dan tidak ditemukan kesalahan fatal.'))}
        </p>
        ${explanation.fix ? `
          <div class="mt-3 pt-3 border-top border-secondary border-opacity-25">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-lightbulb-fill text-warning"></i>
              <strong style="color: #ea580c; font-size: 0.9rem;">${isEn ? 'Key Fix Suggestion:' : 'Saran Perbaikan Utama:'}</strong>
            </div>
            <div class="fix-code-box p-3 p-md-3.5 rounded-4" style="background: #090d16; border: 1.5px solid rgba(234, 88, 12, 0.45); box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
              <code class="d-block font-monospace" style="color: #fde047; font-size: 0.9rem; line-height: 1.65; white-space: pre-wrap; word-break: break-word; padding: 4px 8px;">${escapeHtml(explanation.fix)}</code>
            </div>
          </div>
        ` : ''}
      `;
      wrap.appendChild(headerCard);

      // 2. Itemized issues list
      if (issues.length > 0) {
        const listHeader = document.createElement('div');
        listHeader.className = 'd-flex align-items-center justify-content-between flex-wrap gap-2 text-secondary small fw-bold text-uppercase mt-2';
        listHeader.innerHTML = `
          <span><i class="bi bi-list-check me-1" style="color: #ea580c;"></i> ${isEn ? 'Line-by-Line Breakdown' : 'Rincian Kesalahan Per Baris'}</span>
          ${!isOnlineAi ? `<button class="btn btn-sm btn-outline-warning py-1 px-3 rounded-pill" data-bs-toggle="modal" data-bs-target="#apiKeyModal"><i class="bi bi-key-fill me-1"></i> ${isEn ? 'Connect AI Key' : 'Hubungkan API Key AI'}</button>` : ''}
        `;
        wrap.appendChild(listHeader);

        issues.forEach((it, idx) => {
          const itemCard = document.createElement('div');
          itemCard.className = 'issue-item-card p-3.5 p-md-4 rounded-4 shadow-sm mb-3';

          const lineNo = it.line || (idx + 1);

          itemCard.innerHTML = `
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <button type="button" class="btn btn-sm btn-outline-danger py-1 px-3 rounded-pill font-monospace fw-bold line-jump-btn" data-line="${lineNo}" title="${isEn ? 'Jump to Line' : 'Lompat ke Baris ini'}">
                <i class="bi bi-arrow-right-circle me-1"></i> ${isEn ? `Line ${lineNo}` : `Baris ${lineNo}`}
              </button>
              ${it.where ? `<span class="small font-monospace px-2 py-1 rounded bg-secondary bg-opacity-10" style="color: var(--neuron-text-secondary);">${escapeHtml(it.where)}</span>` : ''}
            </div>
            <div class="small my-2" style="color: var(--neuron-text-primary); line-height: 1.6; padding: 0 2px;">
              <i class="bi bi-info-circle-fill text-danger me-1"></i> ${escapeHtml(it.cause || '')}
            </div>
            ${it.fix ? `
              <div class="item-fix-box p-3 rounded-4 d-flex align-items-center justify-content-between gap-3 mt-2" style="background: #090d16; border: 1.5px solid rgba(234, 88, 12, 0.4); box-shadow: 0 3px 10px rgba(0,0,0,0.2);">
                <code class="small font-monospace flex-grow-1" style="color: #4ade80; font-size: 0.88rem; line-height: 1.65; white-space: pre-wrap; word-break: break-word; padding: 4px 8px;">${escapeHtml(it.fix)}</code>
                <button type="button" class="btn btn-sm btn-outline-success px-3 py-1.5 rounded-pill copy-fix-btn flex-shrink-0 d-flex align-items-center gap-1.5" data-fix="${escapeHtml(it.fix)}" title="${isEn ? 'Copy Fix' : 'Salin Perbaikan'}">
                  <i class="bi bi-clipboard"></i> <span class="d-none d-sm-inline small">${isEn ? 'Copy' : 'Salin'}</span>
                </button>
              </div>
            ` : ''}
          `;

          // Handle Jump to line in Ace
          const jumpBtn = itemCard.querySelector('.line-jump-btn');
          if (jumpBtn && this.editorInstance) {
            jumpBtn.onclick = () => {
              const targetRow = Math.max(0, parseInt(lineNo, 10) - 1);
              this.editorInstance.gotoLine(targetRow + 1, 0, true);
              this.editorInstance.focus();
            };
          }

          // Handle Copy fix
          const copyBtn = itemCard.querySelector('.copy-fix-btn');
          if (copyBtn) {
            copyBtn.onclick = () => {
              const fixCode = copyBtn.getAttribute('data-fix');
              navigator.clipboard.writeText(fixCode);
              copyBtn.innerHTML = '<i class="bi bi-check2"></i>';
              setTimeout(() => { copyBtn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
            };
          }

          wrap.appendChild(itemCard);
        });
      } else if (!hasIssues) {
        const successBox = document.createElement('div');
        successBox.className = 'text-center p-4 text-success';
        successBox.innerHTML = `
          <i class="bi bi-shield-check display-4 mb-2 d-inline-block" style="color: #10b981;"></i>
          <h6 class="fw-bold mb-1">${isEn ? 'Excellent! No Syntax Bugs Found.' : 'Luar Biasa! Tidak Ditemukan Bug Sintaks.'}</h6>
          <p class="small m-0" style="color: var(--neuron-text-secondary);">${isEn ? 'The code follows standard grammar rules and is ready to run.' : 'Kode sudah sesuai kaidah penulisan dan siap dijalankan dengan lancar.'}</p>
        `;
        wrap.appendChild(successBox);
      }

      this.container.appendChild(wrap);
    }

    renderEmptyState() {
      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
      this.container.innerHTML = `
        <div class="p-4 text-center d-flex flex-column align-items-center justify-content-center" style="min-height: 280px;">
          <i class="bi bi-robot fs-1 opacity-50 mb-2" style="color: var(--neuron-text-secondary);"></i>
          <h6 class="fw-semibold" style="color: var(--neuron-text-primary);">${isEn ? 'AI Debugger Ready' : 'AI Debugger Siap Digunakan'}</h6>
          <p class="small m-0" style="color: var(--neuron-text-secondary); max-width: 340px;">
            ${isEn ? 'Write or paste code on the left, then click "AI Debug & Audit" to inspect errors line-by-line.' : 'Tulis atau tempel kode di sebelah kiri, lalu klik "AI Debug & Periksa" untuk memeriksa baris demi baris.'}
          </p>
        </div>
      `;
    }
  }

  window.NeuronDebugger = new NeuronDebugger();
})(window);
