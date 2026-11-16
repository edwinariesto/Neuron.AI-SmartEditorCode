/**
 * Neuron.AI — Unified Execution Runner
 * File: _manage/editor/editor-runner.js
 * 
 * Executes code cleanly across runtimes (PHP via server CLI runner, Python, JS, HTML, SQL, etc.)
 * Eliminates failing client-side WASM bugs (e.g. php-wasm errors) with reliable local fallback.
 */

(function (window) {
  'use strict';

  class NeuronRunner {
    constructor() {
      this.isRunning = false;
      this.tsLoaded = false;
    }

    async execute(code, langId) {
      if (this.isRunning) {
        return { status: 'error', output: 'Eksekusi sedang berjalan, mohon tunggu sebentar.' };
      }

      this.isRunning = true;
      const t0 = performance.now();
      const lang = (langId || 'javascript').toLowerCase();

      try {
        let result;
        if (lang === 'javascript') {
          result = await this.runJavaScript(code);
        } else if (lang === 'typescript') {
          result = await this.runTypeScript(code);
        } else if (lang === 'html') {
          result = await this.runHTML(code);
        } else if (lang === 'json') {
          result = await this.runJSON(code);
        } else {
          // PHP, Python, SQL, C++, C#, Ruby, etc. dispatched directly to backend runner
          result = await this.runBackend(code, lang);
        }

        const duration = (performance.now() - t0).toFixed(1);
        result.duration = duration;
        result.language = lang;

        return result;
      } catch (err) {
        return {
          status: 'error',
          output: `Kesalahan runtime: ${err.message || err}`,
          duration: (performance.now() - t0).toFixed(1),
          language: lang,
          error: err
        };
      } finally {
        this.isRunning = false;
      }
    }

    runJavaScript(code) {
      return new Promise((resolve) => {
        const logs = [];
        let errorMsg = null;
        let returnVal = undefined;

        const workerBlob = new Blob([`
          self.console = {
            log: (...args) => self.postMessage({ type: 'log', data: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
            warn: (...args) => self.postMessage({ type: 'warn', data: '[Peringatan] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
            error: (...args) => self.postMessage({ type: 'error', data: '[Error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') })
          };

          self.onmessage = function(e) {
            try {
              const fn = new Function(e.data.code);
              const ret = fn();
              self.postMessage({ type: 'done', returnVal: ret !== undefined ? (typeof ret === 'object' ? JSON.stringify(ret, null, 2) : String(ret)) : null });
            } catch (err) {
              self.postMessage({ type: 'fatal', error: String(err.stack || err) });
            }
          };
        `], { type: 'application/javascript' });

        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);

        const timeout = setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            status: 'error',
            output: 'Waktu eksekusi habis (Time-out 5 detik). Kemungkinan terdapat perulangan tak hingga (infinite loop).'
          });
        }, 5000);

        worker.onmessage = (e) => {
          const m = e.data;
          if (m.type === 'log' || m.type === 'warn') {
            logs.push(m.data);
          } else if (m.type === 'error') {
            logs.push(m.data);
          } else if (m.type === 'fatal') {
            errorMsg = m.error;
          } else if (m.type === 'done') {
            clearTimeout(timeout);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);

            let outText = logs.join('\n');
            if (m.returnVal !== null) {
              outText += (outText ? '\n\n' : '') + `[Nilai Kembalian]: ${m.returnVal}`;
            }

            resolve({
              status: errorMsg ? 'error' : 'success',
              output: errorMsg ? `${outText ? outText + '\n' : ''}${errorMsg}` : (outText || '(Kode selesai dijalankan tanpa output)')
            });
          }
        };

        worker.postMessage({ code });
      });
    }

    async runTypeScript(code) {
      if (!this.tsLoaded) {
        await this.loadExternalScript('https://cdn.jsdelivr.net/npm/typescript@5.4.5/lib/typescript.js');
        this.tsLoaded = true;
      }
      try {
        const js = window.ts.transpileModule(code, {
          compilerOptions: {
            target: window.ts.ScriptTarget.ES2020,
            module: window.ts.ModuleKind.None
          }
        }).outputText;
        return this.runJavaScript(js);
      } catch (e) {
        return {
          status: 'error',
          output: `Kesalahan transpilasi TypeScript:\n${e.message || e}`
        };
      }
    }

    runHTML(code) {
      return Promise.resolve({
        status: 'success',
        output: '(Pratinjau HTML telah dimuat pada panel Visualisasi & Media)',
        isHtmlDoc: true,
        htmlContent: code
      });
    }

    runJSON(code) {
      return new Promise((resolve) => {
        try {
          const obj = JSON.parse(code);
          resolve({
            status: 'success',
            output: JSON.stringify(obj, null, 2),
            isJsonData: true,
            jsonData: obj
          });
        } catch (e) {
          resolve({
            status: 'error',
            output: `Format JSON tidak valid:\n${e.message}`
          });
        }
      });
    }

    async runBackend(code, lang) {
      const currentLang = localStorage.getItem('neuron_ai_lang') || 'Indonesia';
      const cleanLang = lang.toUpperCase();
      const apiKey = localStorage.getItem('neuron_ai_key_local') || '';
      const provider = localStorage.getItem('neuron_ai_model') || 'gemini-3.6-flash';

      const resp = await fetch('execute_code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'run',
          language: cleanLang,
          code: code,
          bahasa: currentLang,
          apiKey: apiKey,
          provider: provider
        })
      });

      if (!resp.ok) {
        if (resp.status === 429 || resp.status === 503) {
          if (typeof window.switchGeminiFallbackModel === 'function') {
            window.switchGeminiFallbackModel('quota');
          }
        }
        throw new Error(`Server runner HTTP ${resp.status}`);
      }

      const res = await resp.json();
      if (res && res.error && (String(res.error).includes('429') || String(res.error).toLowerCase().includes('quota') || String(res.error).includes('RESOURCE_EXHAUSTED'))) {
        if (typeof window.switchGeminiFallbackModel === 'function') {
          window.switchGeminiFallbackModel('quota');
        }
      }
      return {
        status: res.status || (res.error ? 'error' : 'success'),
        output: res.output || res.message || '(Eksekusi selesai tanpa output)',
        lineOffset: res.lineOffset || 0
      };
    }

    loadExternalScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Gagal memuat skrip: ${src}`));
        document.head.appendChild(s);
      });
    }
  }

  window.NeuronRunner = new NeuronRunner();
})(window);

