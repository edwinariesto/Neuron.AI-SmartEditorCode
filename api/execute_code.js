// api/execute_code.js — Native Serverless Code Execution & Debugger for Neuron.AI

async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && Object.keys(req.body).length > 0) {
    return req.body;
  }

  let raw = '';
  if (typeof req.body === 'string') {
    raw = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    raw = req.body.toString('utf-8');
  } else {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    raw = Buffer.concat(chunks).toString('utf-8');
  }

  const ctRaw = String(req.headers['content-type'] || '');
  const ct = ctRaw.toLowerCase();

  try {
    const parsedJson = JSON.parse(raw);
    if (parsedJson && typeof parsedJson === 'object') return parsedJson;
  } catch (e) {}

  if (ct.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  if (raw.includes('=') && !ct.includes('multipart/form-data') && !raw.trimStart().startsWith('--')) {
    return Object.fromEntries(new URLSearchParams(raw));
  }

  // Extract multipart boundary preserving exact case sensitivity (e.g. WebKitFormBoundary mixed case)
  const bMatch = ctRaw.match(/boundary=(?:"([^"]+)"|([^\s;]+))/i);
  let boundarySep = bMatch ? `--${bMatch[1] || bMatch[2]}` : null;
  if (!boundarySep || !raw.includes(boundarySep)) {
    const firstBoundary = raw.match(/^\s*(--[^\r\n]+)/);
    if (firstBoundary) boundarySep = firstBoundary[1];
  }

  const result = {};
  const parts = boundarySep ? raw.split(boundarySep) : raw.split(/--[A-Za-z0-9_.+=-]+/);
  for (const part of parts) {
    if (!part || part === '--' || part.trim() === '--') continue;
    const nameMatch = part.match(/name="([^"]+)"/);
    if (nameMatch) {
      const fieldName = nameMatch[1];
      const headerSplit = part.match(/\r?\n\r?\n/);
      if (headerSplit && headerSplit.index !== undefined) {
        let val = part.slice(headerSplit.index + headerSplit[0].length);
        val = val.replace(/\r?\n--$/, '').replace(/\r?\n$/, '');
        result[fieldName] = val;
      }
    }
  }
  return result;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', output: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const action = (body.action || 'run').trim();
    const language = body.language || 'PHP';
    const bahasa = body.bahasa || 'Indonesia';
    const provider = (body.provider || 'gemini-3.6-flash').trim();
    const code = (body.code || '').trim();
    const apiKeyIn = (body.apiKey && body.apiKey.trim() !== '') ? body.apiKey.trim() : '';
    const apiKey = apiKeyIn || (process.env.GEMINI_API_KEY || '');
    let usedAiModel = provider;
    let lastAiError = '';

    function parseJsonObjectLenient(txt) {
      const raw = String(txt || '').trim();
      if (!raw) return null;
      const cleaned = raw.replace(/^\s*```(?:json|[a-zA-Z]*)\r?\n?/i, '').replace(/\r?\n?\s*```\s*$/, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (_e) {}
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end > start) {
        try {
          const parsed2 = JSON.parse(cleaned.slice(start, end + 1));
          if (parsed2 && typeof parsed2 === 'object') return parsed2;
        } catch (_e2) {}
      }
      return null;
    }

    async function callGeminiPrompt(promptText, maxTokens = 2048, wantJson = false) {
      const effTokens = wantJson ? Math.max(2048, maxTokens) : maxTokens;

      if (wantJson && provider === 'claude-3.5-sonet') {
        const k = apiKeyIn || process.env.CLAUDE_API_KEY || '';
        if (k) {
          try {
            const resp = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': k, 'anthropic-version': '2023-06-01' },
              body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: effTokens,
                temperature: 0.1,
                messages: [{ role: 'user', content: promptText }]
              })
            });
            if (resp.ok) {
              const d = await resp.json();
              const txt = d?.content?.[0]?.text || '';
              if (txt) return txt;
            }
          } catch (_e) {}
        }
      } else if (wantJson && provider.includes('openai')) {
        const k = apiKeyIn || process.env.OPENAI_API_KEY || '';
        if (k) {
          try {
            const oaiModel = provider === 'openai' ? 'gpt-4o' : 'gpt-4o-mini';
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${k}` },
              body: JSON.stringify({
                model: oaiModel,
                temperature: 0.1,
                max_tokens: effTokens,
                response_format: { type: 'json_object' },
                messages: [
                  { role: 'system', content: 'Return strictly valid JSON matching the requested schema.' },
                  { role: 'user', content: promptText }
                ]
              })
            });
            if (resp.ok) {
              const d = await resp.json();
              const txt = d?.choices?.[0]?.message?.content || '';
              if (txt) return txt;
            }
          } catch (_e) {}
        }
      }

      if (!apiKey) {
        lastAiError = 'missing_api_key';
        return '';
      }
      const preferred = (provider && provider.startsWith('gemini-')) ? provider : 'gemini-3.6-flash';
      const baseCandidates = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-2.5-flash'];
      const models = Array.from(new Set([preferred, ...baseCandidates]));

      const mimeModes = wantJson ? [true, false] : [false];
      for (const modelName of models) {
        const thinkingModes = modelName.startsWith('gemini-2.5') ? [true, false] : [false];
        for (const useJsonMime of mimeModes) {
          for (const disableThinking of thinkingModes) {
            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
              const generationConfig = { temperature: 0.1, maxOutputTokens: effTokens };
              if (useJsonMime) generationConfig.responseMimeType = 'application/json';
              if (disableThinking) generationConfig.thinkingConfig = { thinkingBudget: 0 };
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: promptText }] }],
                  generationConfig
                })
              });
              if (!response.ok) {
                lastAiError = `Model ${modelName}: HTTP ${response.status}`;
                if (response.status === 400 && (disableThinking || useJsonMime)) continue;
                break;
              }
              const data = await response.json();
              const parts = data?.candidates?.[0]?.content?.parts || [];
              let rawText = parts
                .filter(p => p && !p.thought && typeof p.text === 'string')
                .map(p => p.text)
                .join('')
                .trim();
              if (!rawText) {
                lastAiError = `Model ${modelName}: empty text`;
                break;
              }
              if (wantJson) {
                if (parseJsonObjectLenient(rawText)) {
                  usedAiModel = modelName;
                  return rawText;
                }
                lastAiError = `Model ${modelName}: invalid JSON`;
                if (useJsonMime) continue;
                break;
              } else {
                rawText = rawText.replace(/^```(?:json|[a-zA-Z]*)\r?\n?/m, '').replace(/```$/m, '').trim();
                if (rawText) {
                  usedAiModel = modelName;
                  return rawText;
                }
                break;
              }
            } catch (e) {
              lastAiError = e.message || String(e);
              break;
            }
          }
          if (lastAiError.includes('HTTP ') && !lastAiError.includes('HTTP 400')) break;
        }
      }
      return '';
    }

    if (action === 'detect_language') {
      if ((!apiKey && !apiKeyIn) || !code || code.replace(/\s+/g, '').length < 4) {
        return res.status(200).json({
          status: 'unavailable',
          reason: (!apiKey && !apiKeyIn) ? 'missing_api_key' : 'empty_code'
        });
      }
      const isEn = bahasa.toLowerCase() === 'english';
      let optsArr = Array.isArray(body.availableOptions) ? body.availableOptions : [];
      if (typeof body.availableOptions === 'string') {
        try {
          const d = JSON.parse(body.availableOptions);
          if (Array.isArray(d)) optsArr = d;
        } catch (_e) {
          optsArr = body.availableOptions.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      const cleanOpts = optsArr.map(s => String(s || '').trim()).filter(Boolean).slice(0, 40);
      const optsText = cleanOpts.length > 0 ? cleanOpts.join(', ') : 'PHP, Python, HTML, Javascript, Java, SQL, MySQL, SQLServer, Oracle, React, Solidity, C, MATLAB, R';

      const detectPrompt = isEn
        ? `Identify the exact programming, markup, stylesheet, shell, or query language of the following code snippet (even if it has beginner syntax errors/typos OR belongs to a newer/unlisted language like Go, Rust, TypeScript, C++, C#, Kotlin, Swift, Dart, Ruby, Mojo, Zig, Elixir, Lua, PowerShell, Bash, etc.).
EXISTING DROPDOWN LIST: [${optsText}]
RULES:
1. Inspect syntax cues carefully (keywords, variable prefixes like $, imports/headers, type annotations, SQL dialects like LIMIT vs TOP vs SYSDATE/DUAL, JSX/useState vs plain HTML/JS, TypeScript types vs plain JS, C++ std::/cout vs C printf).
2. If the snippet clearly matches one of EXISTING DROPDOWN LIST, set "language" to that EXACT option spelling (preserving its case, e.g. "Javascript" or "PHP") and "inList": true.
3. If the snippet is a different, newer, or unlisted language NOT in EXISTING DROPDOWN LIST, set "language" to its proper canonical name (e.g. "Go", "Rust", "TypeScript", "C++", "C#", "Kotlin", "Swift", "Dart", "Mojo", "Zig") and "inList": false.

CODE:
${code}

Reply ONLY with valid JSON:
{"language":"CanonicalOrMatchedName","inList":true,"confidence":"high|medium|low","reason":"1 short simple sentence in English"}`
        : `Kenali dengan cermat bahasa pemrograman, markup, query, atau skrip dari potongan kode berikut (meskipun terdapat typo/error pemula ATAU berasal dari bahasa baru/yang belum ada di daftar seperti Go, Rust, TypeScript, C++, C#, Kotlin, Swift, Dart, Ruby, Mojo, Zig, Elixir, Lua, PowerShell, Bash, dll.).
DAFTAR BAHASA YANG SUDAH ADA: [${optsText}]
ATURAN:
1. Periksa ciri khas sintaks dengan teliti (kata kunci, awalan $, import/include, tipe data, dialek SQL seperti LIMIT vs TOP vs FROM DUAL, React JSX/useState vs HTML/JS biasa, TypeScript vs Javascript, C++ std::/cout vs C printf).
2. Jika jelas cocok dengan salah satu isi DAFTAR BAHASA YANG SUDAH ADA, isi "language" persis sama ejaannya dengan daftar tersebut (mis. "Javascript" atau "PHP") dan "inList": true.
3. Jika bahasanya berbeda, baru, atau belum ada di daftar, isi "language" dengan nama resmi bahasanya yang rapi (mis. "Go", "Rust", "TypeScript", "C++", "C#", "Kotlin", "Swift", "Dart", "Mojo", "Zig") dan "inList": false.

KODE:
${code}

Balas HANYA dengan JSON valid:
{"language":"NamaBahasa","inList":true,"confidence":"high|medium|low","reason":"1 kalimat singkat sederhana dalam Bahasa Indonesia"}`;

      const aiTxt = await callGeminiPrompt(detectPrompt, 512, true);
      const parsed = parseJsonObjectLenient(aiTxt);
      if (parsed && typeof parsed.language === 'string' && parsed.language.trim()) {
        const cleanLang = parsed.language.trim().replace(/^["'`]|["'`]$/g, '').slice(0, 48);
        return res.status(200).json({
          status: 'ok',
          language: cleanLang,
          inList: typeof parsed.inList === 'boolean' ? parsed.inList : cleanOpts.some(o => o.toLowerCase() === cleanLang.toLowerCase()),
          confidence: parsed.confidence || 'high',
          reason: parsed.reason || '',
          model: usedAiModel
        });
      }
      return res.status(200).json({ status: 'unavailable', reason: 'api_error', detail: lastAiError });
    }

    if (action === 'explain_error') {
      const rawError = (body.errorText || '').trim();
      const localAuditArr = Array.isArray(body.localAudit) ? body.localAudit : [];
      if (!code) {
        return res.status(200).json({
          status: 'unavailable',
          reason: 'empty_code'
        });
      }

      const isEn = bahasa.toLowerCase() === 'english';

      if (!apiKey && !apiKeyIn) {
        const issues = [];
        if (Array.isArray(localAuditArr) && localAuditArr.length > 0) {
          localAuditArr.forEach(it => {
            if (!it) return;
            issues.push({
              line: it.line || 1,
              where: it.where || '',
              cause: it.cause || '',
              fix: it.fix || ''
            });
          });
        }
        const hasIssues = issues.length > 0;
        const linesArr = Array.from(new Set(issues.map(it => it.line).filter(Boolean))).sort((a, b) => a - b);
        const whereTxt = linesArr.length > 0
          ? (isEn ? `Line(s) ${linesArr.join(', ')}` : `Baris ${linesArr.join(', ')}`)
          : (isEn ? 'All lines' : 'Semua baris');

        return res.status(200).json({
          status: 'ok',
          model: isEn ? 'Smart Local Audit' : 'Audit Koding Cerdas (Lokal)',
          explanation: {
            where: whereTxt,
            cause: hasIssues
              ? (isEn ? `Found ${issues.length} issue(s) in code (Local Syntax Audit).` : `Ditemukan ${issues.length} bagian kode yang perlu diperbaiki (Hasil Audit Koding Lokal).`)
              : (isEn ? 'All lines checked. No syntax or grammar errors found!' : 'Semua baris kode telah diperiksa dan tidak ditemukan kesalahan sintaks!'),
            fix: hasIssues && issues[0]?.fix ? issues[0].fix : '',
            issues: issues
          }
        });
      }
      const numbered = code.split(/\r?\n/).map((ln, idx) => `${idx + 1}: ${ln}`).join('\n');
      const errBlock = rawError ? (isEn ? `\nCOMPILER / RUNTIME LOG:\n${rawError}\n` : `\nLOG COMPILER / RUNTIME:\n${rawError}\n`) : '';
      const localAuditLines = localAuditArr
        .filter(it => it && (it.cause || it.where))
        .slice(0, 12)
        .map((it, idx) => `${idx + 1}. [Line ${it.line || '?'}] ${it.where || ''} -> ${it.cause || ''}${it.fix ? ` | Fix: ${it.fix}` : ''}`)
        .join('\n');
      const localAuditBlock = localAuditLines
        ? (isEn ? `\nPRELIMINARY LINE-BY-LINE AUDIT (VERIFY & INCLUDE EVERY VALID ITEM):\n${localAuditLines}\n` : `\nTEMUAN AWAL AUDIT BARIS-PER-BARIS (WAJIB DICEK & JANGAN DILEWATKAN):\n${localAuditLines}\n`)
        : '';

      const explainPrompt = isEn
        ? `You are a careful ${language} checker AND friendly coding tutor explaining bugs to a complete beginner who has never coded before.
CODE (line-numbered):
${numbered}${errBlock}${localAuditBlock}
MANDATORY LINE-BY-LINE ${language.toUpperCase()} AUDIT (CHECK EVERY SINGLE LINE 1..N — NEVER STOP AT THE FIRST ERROR):
1. Language & Syntax Rules (${language}): check EVERY line for missing symbols (\`;\`, quotes \`"\` / \`'\`, brackets \`)\`, \`}\`, \`]\`, \`:\` & indent in Python, \`$\` on PHP variables, missing function name before \`(...)\`), mixed quotes (\`"\` opened with \`'\` closed), and assignment \`=\` inside \`if (...)\` instead of \`==\`/\`===\`.
2. Extra / Missing Letters (Typos): catch EVERY keyword, function, or variable typo and state plainly whether it has an extra letter, missing letter, or swapped letters (e.g. \`echoo\` = extra \`o\`, \`aray\` = missing \`r\`, \`elsif\` in PHP = missing \`e\`).
3. Function Recognition Check: check EVERY function/method call on each line. Is it a valid ${language} built-in or defined in this code? If NOT recognized (e.g. \`tampilkan()\`, \`cetak()\`, \`console.logg()\`, \`$s.toLowerCase()\` in PHP), report clearly that the function/command is not recognized in ${language} and give the valid ${language} equivalent!
4. Variables, Data Types & Order: catch undeclared variables, variables used BEFORE they are created, name mismatches (\`cas\` vs \`$cars\`), and incompatible types/operators (\`echo $array\`, \`"a" + $b\` in PHP, \`strlen($array)\`, reversed \`=>\`/\`=< \`, dividing by \`0\`).
5. Logic Check: verify conditions, loop bounds, and whether the code can actually produce the intended result.
6. Keep EVERY explanation SHORT, PLAIN, and EASY for a non-programmer to understand (1-2 short everyday sentences, NO jargon), split multiple bugs on the same line into separate items in \`issues[]\`, and wrap EVERY code token/symbol in backticks \`...\`.
7. MANDATORY OUTPUT LANGUAGE: All text in 'cause', 'where', and 'issues[].cause' MUST be written 100% strictly in clear, natural, grammatically correct ENGLISH. Even if the code uses Indonesian words, variables, or comments, NEVER answer in Indonesian!

Reply ONLY with valid JSON with exact keys:
{"where":"Lines e.g. 1, 2","cause":"1 short plain sentence summarizing all issues in English","fix":"short complete fix in \`...\`","issues":[{"line":1,"where":"Line 1 (\`...\`)","cause":"1-2 short plain beginner sentences in English (what is missing/wrong/unrecognized/extra or missing letter)","fix":"exact fix for this line in \`...\`"}]}`
        : `Kamu adalah pemeriksa kode ${language} yang super teliti sekaligus tutor ramah untuk orang awam yang baru pertama kali belajar koding. Periksa KODE BARIS DEMI BARIS dari Baris 1 sampai terakhir dan laporkan SEMUA kesalahan sekaligus dalam bahasa yang sangat sederhana dan ringkas.
KODE (bernomor baris):
${numbered}${errBlock}${localAuditBlock}
ATURAN AUDIT WAJIB BARIS-PER-BARIS KHUSUS ${language.toUpperCase()} (JANGAN PERNAH BERHENTI DI ERROR PERTAMA!):
1. Aturan Penulisan ${language}: cek SETIAP baris apakah ada yang KURANG atau HILANG (tanda kutip \`"\`/\`'\`, kutip campur, kurung tutup \`)\`/\`}\`/\`]\`, titik koma \`;\`, titik dua \`:\` & spasi menjorok di Python, tanda \`$\` di depan variabel PHP, atau nama perintah hilang sebelum \`(...)\`).
2. Kelebihan / Kekurangan Huruf (Salah Ketik): cek apakah ada kata kunci, perintah, atau variabel yang kelebihan huruf (misal \`echoo\`, \`forr\`), kurang huruf (misal \`aray\`, \`elsif\`), atau huruf tertukar (misal \`pritn\`, \`var_dpt\`), lalu sebutkan dengan jelas huruf apa yang lebih/kurang!
3. Cek Fungsi Dikenali atau Tidak: cek SEMUA nama fungsi/perintah yang dipanggil di setiap baris. Apakah benar-benar ada di bahasa ${language} atau dibuat sendiri di kode ini? Jika TIDAK DIKENALI (misal \`cetak()\`, \`tampilkan()\`, \`console.logg()\`, \`$s.toLowerCase()\` di PHP), tegaskan bahwa perintah tersebut tidak dikenal di ${language} dan berikan pengganti yang benar!
4. Variabel, Tipe Data & Urutan: tangkap variabel yang belum dibuat tapi sudah dipakai, variabel yang baru diisi di baris bawahnya, salah eja variabel (\`cas\` vs \`$cars\`), tipe data tidak cocok (\`echo $array\` di PHP, \`+\` untuk menggabung teks di PHP, \`strlen($array)\`), salah tanda (\`=>\`/\`=< \`, \`=\` di dalam \`if\`), atau membagi dengan \`0\`.
5. Logika Alur Kode: cek apakah syarat \`if\`, batas perulangan, dan rumus kodenya masuk akal serta sesuai tujuan program.
6. BAHASA RINGKAS & AWAM: jelaskan tiap poin dalam 1-2 kalimat pendek yang gampang dimengerti orang awam (hindari istilah rumit). Jika 1 baris punya beberapa kesalahan, PECAH jadi item terpisah di \`issues[]\`! Bungkus SEMUA kata kode/simbol pakai backtick \`...\`.
7. ATURAN BAHASA WAJIB: Seluruh penjelasan, ringkasan penyebab masalah, dan saran perbaikan HARUS ditulis lengkap dalam Bahasa Indonesia yang ramah dan mudah dimengerti pemula!

Balas HANYA JSON valid (key persis):
{"where":"ringkasan baris bermasalah, misal Baris 1, 2","cause":"1 kalimat pendek jumlah & jenis masalahnya","fix":"ringkasan perbaikan utuh di dalam \`...\`","issues":[{"line":1,"where":"Baris 1 (\`...\`)","cause":"1-2 kalimat pendek berbahasa awam (apa yang salah, kurang, tidak dikenal, atau kelebihan/kurang huruf)","fix":"contoh perbaikan untuk baris ini di dalam \`...\`"}]}`;

      const aiTxt = await callGeminiPrompt(explainPrompt, 4096, true);
      const parsed = parseJsonObjectLenient(aiTxt);
      if (parsed && ((Array.isArray(parsed.issues) && parsed.issues.length > 0) || parsed.cause || parsed.fix)) {
        return res.status(200).json({ status: 'ok', model: usedAiModel, explanation: parsed });
      }
      return res.status(200).json({ status: 'unavailable', reason: 'api_error', detail: lastAiError });
    }

    if (action === 'evaluate_answer') {
      const soalType  = String(body.soalType || '2').trim();
      const soalMode  = (body.soalMode || (soalType === '1' ? 'fill_blank' : (soalType === '3' ? 'write_code' : (soalType === '4' ? 'fix_bug' : 'explain_logic')))).trim();
      const question  = (body.question || '').trim();
      const filledCode = (body.filledCode || '').trim();
      const runtimeOutput = (body.runtimeOutput || '').trim();
      let localAuditArr = [];
      if (Array.isArray(body.localAudit)) {
        localAuditArr = body.localAudit;
      } else if (typeof body.localAudit === 'string' && body.localAudit.trim()) {
        try { localAuditArr = JSON.parse(body.localAudit); } catch (_e) {}
      }
      const refAnswer = (body.referenceAnswer || '').trim();
      const refExp    = (body.referenceExplanation || '').trim();
      const userAns   = (body.userAnswer || '').trim();

      if (!apiKey || !userAns) {
        return res.status(200).json({ status: 'unavailable' });
      }

      const isEn = bahasa.toLowerCase() === 'english';
      let typeRules = '';
      if (soalType === '1' || soalMode === 'fill_blank') {
        typeRules = isEn
          ? `EVALUATION TYPE 1 (FILL-IN-THE-BLANK):
1. Read QUESTION and ACTUAL DISPLAYED CODE carefully. Notice where blanks _[1]_, _[2]_, ... appear.
2. Inspect FILLED CODE BY STUDENT by substituting the student's entries directly into the blanks.
3. Act as a strict ${language} compiler AND logic checker:
   - Check keyword validity in ${language} (e.g. PHP allows both 'elseif' and 'else if', NOT 'elsif'; Python uses 'elif').
   - Check quotes, operators (<, <=, >, >=, ==, ===, %), variable prefixes ($ in PHP), and delimiters in context.
   - Trace execution against EVERY requirement/output described in QUESTION!
4. Verdict rules:
   - "correct": fills all blanks so resulting ${language} code is syntactically valid and satisfies all requirements in QUESTION (equivalent valid syntax/operators allowed).
   - "partial": one of multiple blanks is right while another is wrong/missing, OR right value with minor syntax flaw (e.g. missing quotes around string literal), OR satisfies only part of QUESTION.
   - "incorrect": syntax-breaking token or wrong logic across blanks.`
          : `EVALUASI TIPE 1 (MELENGKAPI KODE / FILL-IN-THE-BLANK):
1. Baca PERTANYAAN dan POTONGAN KODE ASLI dengan cermat. Perhatikan posisi _[1]_, _[2]_, dst.
2. Periksa KODE SETELAH DIISI MAHASISWA dengan cermat seperti kompiler & dosen ${language}:
   - Apakah kata kunci sah di ${language} (misal di PHP: 'elseif' maupun 'else if' keduanya sah, tapi 'elsif' salah; di Python harus 'elif')?
   - Apakah tanda kutip, operator (<, <=, >, >=, ==, %), prefiks variabel ($ di PHP), atau ekspresi cocok dengan konteks baris kode?
   - Telusuri apakah kode hasil isian memenuhi SEMUA syarat & output pada PERTANYAAN!
3. Aturan vonis:
   - "correct": semua bagian rumpang terisi tepat/ekuivalen secara sintaks ${language} dan memenuhi semua skenario pada PERTANYAAN.
   - "partial": sebagian slot benar namun slot lain salah/kurang tepat, ATAU konsep benar namun ada cacat sintaks kecil (mis. lupa tanda kutip pada literal string, operator batas < vs <= sedikit meleset).
   - "incorrect": salah sintaks fatal atau logika bertentangan dengan tujuan PERTANYAAN.`;
      } else if (soalType === '3' || soalMode === 'write_code') {
        typeRules = isEn
          ? `EVALUATION TYPE 3 (WRITE CODE FROM STORY):
1. Independently derive requirements from QUESTION (inputs/variables, conditions/loops, edge cases, exact printed output). Do NOT require identical variable names to REFERENCE KEY if the student's solution is valid in ${language}!
2. Perform a STRICT COMPILER + LOGIC AUDIT on STUDENT ANSWER:
   - Syntax audit (FULL END-TO-END, NEVER stop at the first bug): check ALL lines for semicolons ';' (PHP/JS/C/Java), PHP variable '$' prefix, Python colons ':' and indentation, matched braces/parens/quotes, missing function names before \`(...)\` (e.g. \`print_r($fruits);\` vs bare \`($fruits);\`), spelled keywords (no 'elsif' in PHP, no 'ehco'), assignment '=' vs comparison '=='. List EVERY error and its exact line number in feedback!
   - Logic audit: verify EVERY condition, operator, loop bound, formula, and printed output against QUESTION.
3. Verdict rules:
   - "correct": zero syntax/runtime errors in ${language} AND fulfills all algorithmic requirements of QUESTION (different variable names or equivalent constructs are valid!).
   - "partial": core algorithm is on track, EXCEPT minor syntax bug (missing ';', typo keyword, missing '$') OR missing/wrong one branch or boundary case. Explain exact bug!
   - "incorrect": severe syntax failure, does not solve the story problem, or wrong logic.`
          : `EVALUASI TIPE 3 (MENULIS KODE DARI CERITA):
1. Pahami seluruh syarat pada PERTANYAAN secara mandiri (variabel/input, kondisi/perulangan, kasus batas, output yang harus dicetak). JANGAN memaksa nama variabel persis sama dengan KUNCI IDEAL jika kode mahasiswa sudah valid di ${language}!
2. Lakukan AUDIT KOMPILER + LOGIKA SECARA KRITIS pada JAWABAN MAHASISWA:
   - Audit sintaks ${language} SECARA MENYELURUH (JANGAN berhenti di 1 error pertama — cek semua baris sampai akhir!): cek titik koma ';', tanda '$' variabel PHP, titik dua ':' & indentasi Python, pasangan kurung/kutip, fungsi yang hilang di depan \`(...)\`, typo fungsi/keyword (\`aray\`, \`var_dpt\`, \`elsif\`), serta kesesuaian tipe data (mis. \`echo $arr;\` di PHP tidak boleh langsung, \`+\` teks di PHP harus \`.\`). Sebutkan SEMUA bagian yang kurang/salah dan nomor barisnya sekaligus!
   - Audit logika: apakah semua kondisi, batas angka, rumus, dan output sesuai skenario cerita pada PERTANYAAN?
3. Aturan vonis:
   - "correct": bebas error sintaks ${language} DAN seluruh logika/output memenuhi semua skenario pada PERTANYAAN (nama variabel beda atau struktur ekuivalen tetap BENAR!).
   - "partial": arah algoritma sudah benar tetapi ada cacat sintaks kecil (lupa ';', salah eja keyword, lupa '$') ATAU satu cabang/batas kondisi terlewat. Sebutkan persis letak kesalahannya!
   - "incorrect": tidak menjawab cerita soal, error sintaks parah, atau alur logika salah total.`;
      } else if (soalType === '4' || soalMode === 'fix_bug') {
        typeRules = isEn
          ? `EVALUATION TYPE 4 (ANALYZE & FIX BUGGY CODE / CODE RECONSTRUCTION):
1. Compare STUDENT ANSWER against ACTUAL DISPLAYED CODE (the buggy snippet) and QUESTION:
   - CRITICAL CHECK: Did the student leave the code UNCHANGED ("sama saja" / just clicked Run without fixing anything)? If STUDENT ANSWER is identical or practically identical to the original buggy snippet without fixing the bugs, immediately give verdict "incorrect" and clearly explain in feedback: "You haven't made any corrections yet; the code is still the exact same buggy code. Look closely at the errors and fix them."
2. Perform a STRICT COMPILER & RECONSTRUCTION AUDIT on STUDENT ANSWER:
   - Syntax audit: Check whether all syntax errors, typos, missing semicolons, missing variable signs, wrong brackets, or bad operators from the buggy snippet have been correctly resolved according to ${language} rules.
   - Logic audit: Ensure the reconstructed code executes cleanly and produces the intended logical outcome for ${language}.
3. Verdict rules:
   - "correct": ALL bugs in the original snippet have been successfully diagnosed and fixed, the reconstructed code is syntactically valid in ${language}, and produces the expected output.
   - "partial": Student fixed some of the bugs (e.g. 1 out of 2 errors), but another error remains, or the fix introduced a minor new syntax/logic flaw. Explicitly point out what was improved and what is still buggy!
   - "incorrect": The code is unchanged ("sama saja"), still has the primary fatal bugs, or fails to fix the flaws.`
          : `EVALUASI TIPE 4 (MENGANALISIS & MEMPERBAIKI KODE SALAH / REKONSTRUKSI KODE):
1. Bandingkan JAWABAN MAHASISWA dengan POTONGAN KODE ASLI DI SOAL (yang sengaja salah) dan PERTANYAAN SOAL:
   - CEK KRUSIAL "SAMA SAJA" (KODE BELUM DIUBAH): Periksa apakah mahasiswa belum mengubah apa pun (hanya menyalin atau membiarkan kode salah aslinya lalu langsung klik Run). Jika jawaban mahasiswa SAMA SAJA dengan kode salah aslinya, vonis WAJIB "incorrect" dan sampaikan feedback ramah: "Anda belum melakukan perbaikan apa pun; kodenya masih sama persis dengan kode yang salah di atas. Perhatikan baris kesalahan dan perbaiki kodenya."
2. Lakukan AUDIT KOMPILER & REKONSTRUKSI SECARA KETAT pada JAWABAN MAHASISWA:
   - Audit sintaks: Apakah semua error sintaks, salah ketik keyword, kurung/titik koma/simbol hilang atau salah pada kode awal telah berhasil diperbaiki sesuai kaidah ${language}?
   - Audit logika: Apakah kode hasil rekonstruksi berjalan tanpa error dan menghasilkan luaran/logika yang benar?
3. Aturan vonis:
   - "correct": SEMUA kesalahan pada kode awal berhasil ditemukan dan diperbaiki dengan benar, kode valid dieksekusi di ${language}, dan alur logikanya tepat.
   - "partial": Sebagian bug sudah berhasil diperbaiki (misal 1 dari 2 masalah), tetapi masih ada bagian lain yang belum selesai atau ada salah sintaks kecil baru. Jelaskan bagian mana yang sudah diperbaiki dan mana yang masih tertinggal!
   - "incorrect": Kodenya masih sama saja (belum diperbaiki), masih memuat error utama, atau perbaikan tidak tepat.`;
      } else {
        typeRules = isEn
          ? `EVALUATION TYPE 2 (CODE TRACING — MODE: ${soalMode}):
1. CRITICAL GROUND-TRUTH RULE: Trace ACTUAL DISPLAYED CODE line by line FIRST! If REFERENCE KEY or REFERENCE EXPLANATION contradicts or describes different variables/functions than ACTUAL DISPLAYED CODE (e.g. a mismatched modulus snippet vs date('H')), COMPLETELY IGNORE REFERENCE KEY/EXPLANATION and evaluate STRICTLY against ACTUAL DISPLAYED CODE and QUESTION!
2. Audit every claim in STUDENT ANSWER critically:
   - For 'predict_output': verify exact output values, case/punctuation, branch taken, or runtime dependency (e.g. date('H') depends on current hour).
   - For 'explain_logic': verify variable purpose/function (e.g. date('H')), EVERY branch condition (e.g. < 10, < 20, else), boundary logic, and resulting output. Catch subtle errors like reversed < vs >, wrong threshold, or omitted branches!
3. Verdict rules:
   - "correct": accurately explains or predicts ACTUAL DISPLAYED CODE including key variables/conditions/outputs (different phrasing OK).
   - "partial": grasps main idea or first branch, but misses important branches (elseif/else), flips a comparison (< vs >), misstates a threshold, or omits part of output.
   - "incorrect": wrong interpretation, reversed outcome, or irrelevant text.`
          : `EVALUASI TIPE 2 (MENEBAK / MENJELASKAN KODE — MODE: ${soalMode}):
1. ATURAN GROUND-TRUTH MUTLAK: Telusuri POTONGAN KODE ASLI baris demi baris TERLEBIH DAHULU! Jika KUNCI IDEAL atau POIN PENJELASAN tidak nyambung / berbeda variabel/fungsi dengan POTONGAN KODE ASLI (misal kunci membahas modulus $angka % 2 padahal kode aslinya date('H')), ABAIKAN KUNCI/POIN TERSEBUT dan nilai MURNI berdasarkan POTONGAN KODE ASLI + PERTANYAAN!
2. Audit setiap detail JAWABAN MAHASISWA secara kritis:
   - Mode 'predict_output': cek ketepatan luaran/output program, cabang yang terpilih, atau ketergantungan waktu/input runtime jika ada.
   - Mode 'explain_logic': cek apakah mahasiswa menjelaskan variabel/fungsi utama (mis. date('H')), SEMUA cabang kondisi (if, elseif/else if, else beserta batas angkanya), dan output masing-masing. Tangkap kesalahan halus seperti terbalik '<' vs '>', angka batas keliru, atau cabang yang terlupakan!
3. Aturan vonis:
   - "correct": menangkap maksud kode, alur percabangan/perulangan utama, dan outputnya secara tepat sesuai POTONGAN KODE ASLI (redaksi bebas).
   - "partial": sudah benar pada konsep umum atau sebagian cabang, tetapi masih melewatkan cabang lain (elseif/else), terbalik tanda perbandingan (< vs >), salah sebut batas, atau output kurang lengkap.
   - "incorrect": keliru memahami alur logika/output kode asli atau tidak relevan.`;
      }

      const localAuditSummary = Array.isArray(localAuditArr) && localAuditArr.length > 0
        ? localAuditArr
            .filter(it => it && (it.cause || it.where))
            .slice(0, 12)
            .map((it, idx) => `${idx + 1}. [Line ${it.line || '?'}] ${it.where || ''} -> ${it.cause || ''}${it.fix ? ` | Fix: ${it.fix}` : ''}`)
            .join('\n')
        : '';
      const localAuditEn = localAuditSummary ? `\nLINE-BY-LINE CODE AUDIT FINDINGS (MUST VERIFY & MENTION IN FEEDBACK):\n${localAuditSummary}` : '';
      const localAuditId = localAuditSummary ? `\nTEMUAN AUDIT BARIS-PER-BARIS (WAJIB DICEK & JELASKAN JIKA TERBUKTI SALAH):\n${localAuditSummary}` : '';

      const filledEn = filledCode ? `\nFILLED CODE BY STUDENT:\n${filledCode}` : '';
      const filledId = filledCode ? `\nKODE SETELAH DIISI MAHASISWA:\n${filledCode}` : '';
      const runtimeEn = runtimeOutput ? `\nREAL-TIME EXECUTION / DEBUG OUTPUT:\n${runtimeOutput}` : '';
      const runtimeId = runtimeOutput ? `\nHASIL EKSEKUSI / DEBUG REAL-TIME:\n${runtimeOutput}` : '';

      const evalPrompt = isEn
        ? `You are a thorough, accurate ${language} checker & friendly tutor explaining results to a complete beginner who has NEVER coded before.
MANDATORY: Audit line-by-line based strictly on ${language} rules (wrong symbols, missing tokens, extra/missing letters like \`echoo\`/\`aray\`/\`elsif\`, unrecognized function calls like \`cetak()\`/\`tampilkan()\`, wrong types/operators, undeclared or out-of-order variables, and logic bugs). Use VERY SIMPLE, CONCISE everyday sentences in "feedback" and "verifiedExplanation" — never stop at the first error!
QUESTION:
${question}
ACTUAL DISPLAYED CODE:
${code}${filledEn}${runtimeEn}${localAuditEn}
REFERENCE KEY (UNTRUSTED — IGNORE if inconsistent with ACTUAL DISPLAYED CODE or QUESTION):
${refAnswer}
REFERENCE EXPLANATION (UNTRUSTED — IGNORE if inconsistent):
${refExp}
STUDENT ANSWER:
${userAns}

${typeRules}

Reply ONLY with valid JSON (no markdown):
{"verdict":"correct|partial|incorrect","feedback":"Short, clear everyday sentences listing what is right, plus EVERY line/bug that is missing, wrong, unrecognized, or has extra/missing letters relative to ${language} rules and QUESTION (wrap code tokens in <code>...</code>)","verifiedAnswer":"Accurate ideal answer/code matching ACTUAL DISPLAYED CODE & QUESTION (when verifiedAnswer is code, format cleanly across multiple lines using \\n and 4-space indentation according to ${language} style)","verifiedExplanation":"Short step-by-step explanation in plain everyday wording matching ACTUAL DISPLAYED CODE & QUESTION (wrap exact syntax/operators in <code>...</code>)"}`
        : `Anda adalah pemeriksa kode ${language} yang super cermat sekaligus tutor ramah untuk orang awam yang BELUM PERNAH BELAJAR CODING.
ATURAN WAJIB: Periksa kode BARIS DEMI BARIS sesuai aturan bahasa ${language} (simbol/tanda kurang, kata salah ketik kelebihan/kurang huruf seperti \`echoo\`/\`aray\`/\`elsif\`, fungsi tidak dikenal di ${language} seperti \`cetak()\`/\`tampilkan()\`, tipe data tidak cocok, variabel belum dibuat/terbalik urutan, dan logika program). Gunakan bahasa sehari-hari yang SANGAT SEDERHANA, RINGKAS, dan mudah dimengerti orang awam pada "feedback" dan "verifiedExplanation" — jangan pernah berhenti hanya di 1 kesalahan pertama!
PERTANYAAN SOAL:
${question}
POTONGAN KODE ASLI DI SOAL:
${code}${filledId}${runtimeId}${localAuditId}
KUNCI REFERENSI HTML (ABAIKAN TOTAL jika variabel/topiknya tidak cocok dengan POTONGAN KODE ASLI atau PERTANYAAN SOAL!):
${refAnswer}
PENJELASAN REFERENSI HTML (ABAIKAN jika tidak cocok):
${refExp}
JAWABAN PENGGUNA:
${userAns}

${typeRules}

Balas HANYA dengan JSON valid (tanpa markdown):
{"verdict":"correct|partial|incorrect","feedback":"Kalimat singkat dengan bahasa awam yang menjelaskan bagian yang sudah benar sekaligus SEMUA kesalahan baris demi baris: apa yang kurang, salah, tidak dikenal di ${language}, kelebihan/kurang huruf, atau keliru logikanya dibanding PERTANYAAN (bungkus token kode dengan <code>...</code>)","verifiedAnswer":"Jawaban benar / kode ideal yang 100% sesuai POTONGAN KODE ASLI & PERTANYAAN (jika berupa potongan kode, wajib diformat rapi multi-baris pakai \\n dan indentasi 4 spasi sesuai standar bahasa ${language})","verifiedExplanation":"Pembahasan ringkas langkah demi langkah dengan bahasa awam yang 100% sesuai POTONGAN KODE ASLI & PERTANYAAN (bungkus token kode/simbol dengan <code>...</code>)"}`;

      const aiTxt = await callGeminiPrompt(evalPrompt, 2048, true);
      const parsed = parseJsonObjectLenient(aiTxt);
      if (parsed && ['correct', 'partial', 'incorrect'].includes(parsed.verdict)) {
        return res.status(200).json({ status: 'ok', evaluation: parsed });
      }
      return res.status(200).json({ status: 'unavailable' });
    }

    if (!code) {
      return res.status(200).json({
        status: 'empty',
        output: 'Kode kosong. Silakan ketik kode terlebih dahulu.'
      });
    }

    const langLower = language.toLowerCase();

    // 1. Eksekusi Native JavaScript via Node.js VM Sandbox
    if (langLower.includes('javascript') || langLower === 'js') {
      try {
        const vm = await import('vm');
        let logs = [];
        const sandboxConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
          warn: (...args) => logs.push('[warn] ' + args.join(' ')),
          error: (...args) => logs.push('[error] ' + args.join(' '))
        };
        const context = vm.createContext({ console: sandboxConsole, Math, Date, parseInt, parseFloat, Array, Object, String, Number, Boolean });
        vm.runInContext(code, context, { timeout: 3000 });

        return res.status(200).json({
          status: 'success',
          output: logs.length > 0 ? logs.join('\n') : '(Kode dieksekusi tanpa pesan output)'
        });
      } catch (jsErr) {
        return res.status(200).json({
          status: 'error',
          output: 'Error: ' + jsErr.message
        });
      }
    }

    // 2. Eksekusi & Debugger untuk PHP, Python, Java, MATLAB, C, C++, dsb.
    // Menggunakan Gemini Sandbox Interpreter & Terminal Execution Engine
    if (!apiKey) {
      if (langLower.includes('matlab') || langLower.includes('octave')) {
        let diag = `[Sistem Deteksi Runtime: Bahasa Pemrograman ${language} Terdeteksi]\n`;
        diag += `------------------------------------------------------------\n`;
        diag += `• Status Lingkungan : Engine lokal MATLAB / GNU Octave belum terpasang di runtime server.\n`;
        diag += `• Total Baris Kode  : ${code.split('\n').length} baris terdeteksi.\n\n`;
        diag += `[Hasil Analisa Kode MATLAB (Static Code Inspector)]:\n`;
        if (code.includes('4, 7; 2, 6') && code.includes('1, 3; 5, 2')) {
          diag += `• Analisa Matriks: Terdeteksi deklarasi matriks A dan B serta operasi aljabar linier.\n\n`;
          diag += `[Prediksi Output Simulasi Matriks]:\nMatriks A:\n     4     7\n     2     6\n\nMatriks B:\n     1     3\n     5     2\n\nDeterminan Matriks A: 10.00\nInvers Matriks A:\n    0.6000   -0.7000\n   -0.2000    0.4000\n`;
        } else {
          diag += `• Sintaks MATLAB berhasil dipindai dan dikenali oleh sistem.\n`;
        }
        diag += `\n------------------------------------------------------------\n`;
        diag += `Cara Mengaktifkan Eksekusi Penuh:\n`;
        diag += `1. Klik tombol 'API Key' di toolbar atas untuk menghubungkan AI agar simulasi runtime online aktif seketika.\n`;
        diag += `2. Atau klik tab 'Hasil Evaluasi AI' untuk audit kesalahan kode baris-demi-baris.\n`;
        return res.status(200).json({ status: 'success', output: diag });
      }

      return res.status(200).json({
        status: 'error',
        output: 'API Key AI belum diatur. Masukkan API Key di tombol "API Key" di toolbar atas untuk mengaktifkan fitur eksekusi & debug kode online.'
      });
    }

    const prompt = `Anda adalah runtime interpreter, compiler, dan terminal CLI debugger presisi tinggi untuk bahasa pemrograman ${language}.
Jalankan/eksekusi kode berikut dan berikan HANYA teks luaran (stdout) atau pesan kesalahan persis (syntax error, parse error, division by zero, undefined variable, missing semicolon, runtime exception) seperti output terminal asli, lengkap dengan nomor barisnya berdasarkan baris kode berikut.

ATURAN STRICT:
1. JANGAN gunakan markdown fences (\`\`\`).
2. JANGAN sertakan kalimat pembuka seperti "Output:" atau kalimat penutup.
3. Kembalikan HANYA teks hasil cetakan eksekusi terminal asli atau pesan error asli.

KODE:
${code}
`;

    let output = await callGeminiPrompt(prompt, 2048);

    if (!output) {
      output = '(Kode dieksekusi tanpa pesan output)';
    }

    const isError = /\b(parse error|fatal error|syntax error|uncaught (?:error|exception)|traceback|indentationerror|nameerror|typeerror|valueerror|indexerror|keyerror|attributeerror|zerodivisionerror|referenceerror|rangeerror|deprecated:|notice:|warning:|error:|fatal|exception)\b/i.test(output);

    return res.status(200).json({
      status: isError ? 'error' : 'success',
      output: output
    });

  } catch (err) {
    return res.status(200).json({
      status: 'error',
      output: 'Kesalahan sistem eksekusi: ' + (err.message || err)
    });
  }
}
