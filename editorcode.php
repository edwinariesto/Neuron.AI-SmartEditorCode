<?php /* Neuron.AI — Soft Light Glassmorphism Editor & AI Debugger */ ?>
<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="./_manage/img/logo-neuron2.png" type="image/x-icon">
  <link rel="shortcut icon" href="./_manage/img/logo-neuron2.png" type="image/x-icon">
  <title>Neuron.AI : Interactive Code Editor & AI Debugger</title>

  <!-- Bootstrap 5 & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

  <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

  <!-- Ace Editor -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.9/ace.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

  <!-- Ambient Background & Glass Stylesheets -->
  <link rel="stylesheet" href="./_manage/css/animasi-neuron.css?v=<?= time() ?>">
  <link rel="stylesheet" href="./_manage/css/card-tranparan.css?v=<?= time() ?>">
  <link rel="stylesheet" href="./_manage/editor/editor-ui.css?v=<?= time() ?>">
</head>

<body class="editor-page" id="top">
  <!-- Animated Background Canvas & Floating Ambient Orbs -->
  <canvas id="neuron-bg"></canvas>
  <div class="bg-ambient-orb bg-ambient-orb-1"></div>
  <div class="bg-ambient-orb bg-ambient-orb-2"></div>
  <div class="bg-ambient-tube bg-ambient-tube-1"></div>

  <!-- MAIN CENTERED CONTAINER (SYMMETRICAL & PROPORTIONAL) -->
  <div class="editor-container">

    <!-- 1. TOP HEADER BRAND & SETTINGS BAR (STICKY, SYMMETRICAL, ICONS ON MOBILE) -->
    <header class="header-glass-card neuron-glass-card d-flex align-items-center justify-content-between flex-nowrap gap-2">
      <!-- Left: Logo & Brand Name (Simetris & Bersih) -->
      <div class="brand-header-left d-flex align-items-center gap-2 gap-sm-3">
        <div class="glass-icon-box glass-icon-box-orange rounded-circle shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5C5 7.3 5.2 8 5.6 8.6A4 4 0 0 0 4 12a4 4 0 0 0 1.2 2.8A4.5 4.5 0 0 0 9.5 19H10V2H9.5z"/>
            <path d="M7.5 6c.8.8.8 1.8 0 2.5"/>
            <path d="M6.2 12c1.2.4 1.2 1.6 0 2"/>
            <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .8-.2 1.5-.6 2.1A4 4 0 0 1 20 12a4 4 0 0 1-1.2 2.8A4.5 4.5 0 0 1 14.5 19H14V2h.5z"/>
            <path d="M16.5 6c-.8.8-.8 1.8 0 2.5"/>
            <path d="M17.8 12c-1.2.4-1.2 1.6 0 2"/>
            <path d="M10.5 19v2.5h3V19"/>
          </svg>
        </div>
        <div class="brand-text-block">
          <h1 class="brand-title m-0 tracking-wide">NEURON<span>.AI</span></h1>
          <small class="fw-medium d-none d-md-block mt-0.5" id="brandSubtitle">Tutor Coding & Peningkat Beban Kognitif berbasis Generative A.I</small>
        </div>
      </div>

      <!-- Right: Auto-Detect Dropdown Pill, Circular Flag Switchers, Theme Toggle (Never wrapping) -->
      <div class="header-controls-group d-flex align-items-center gap-1 gap-sm-2 flex-nowrap">
        <!-- Intelligent Auto-Detection Pill (Menu TIDAK terhalang, z-index 1065) -->
        <div class="dropdown detection-pill-wrapper">
          <div class="detection-pill dropdown-toggle" id="detectorPill" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" title="Bahasa terdeteksi otomatis. Klik untuk mengganti secara manual jika perlu.">
            <span class="pulse-dot"></span>
            <span class="text-secondary small d-none d-md-inline" id="autoDetectLabel">Deteksi Otomatis:</span>
            <span class="fw-bold d-flex align-items-center" id="detectedLangBadge">
              <i class="bi bi-filetype-php me-1" id="detectedLangIcon" style="color: #f97316;"></i>
              <span id="detectedLangText">PHP</span>
            </span>
          </div>
          <ul class="dropdown-menu dropdown-menu-end detection-dropdown-menu" aria-labelledby="detectorPill">
            <li><h6 class="dropdown-header">MODE DETEKSI</h6></li>
            <li><a class="dropdown-item active" href="javascript:void(0)" onclick="NeuronDetector.resetToAuto(editor.getValue())"><i class="bi bi-magic me-2 text-warning"></i> Otomatis (Rekomendasi)</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            <li><h6 class="dropdown-header">PILIH MANUAL</h6></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('matlab')"><i class="bi bi-calculator me-2 text-warning"></i> MATLAB</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('php')"><i class="bi bi-filetype-php me-2 text-primary"></i> PHP</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('python')"><i class="bi bi-filetype-py me-2 text-info"></i> Python</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('javascript')"><i class="bi bi-filetype-js me-2 text-warning"></i> JavaScript</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('typescript')"><i class="bi bi-filetype-ts me-2 text-primary"></i> TypeScript</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('html')"><i class="bi bi-filetype-html me-2 text-danger"></i> HTML / SVG</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('sql')"><i class="bi bi-database me-2 text-cyan"></i> SQL</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('cpp')"><i class="bi bi-cpu me-2 text-secondary"></i> C / C++</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('java')"><i class="bi bi-filetype-java me-2 text-danger"></i> Java</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('csharp')"><i class="bi bi-hash me-2 text-purple"></i> C#</a></li>
            <li><a class="dropdown-item" href="javascript:void(0)" onclick="NeuronDetector.setManualOverride('json')"><i class="bi bi-filetype-json me-2 text-success"></i> JSON</a></li>
          </ul>
        </div>

        <!-- Circular Flag Switchers: Indonesia & UK (English) -->
        <div class="flag-group-container">
          <!-- Flag Indonesia (Circular SVG) -->
          <button type="button" class="lang-flag-btn active" id="flagBtnId" onclick="setEditorLanguage('Indonesia')" title="Bahasa Indonesia">
            <svg class="flag-icon-svg" width="22" height="22" viewBox="0 0 24 24" style="border-radius: 50%;">
              <rect width="24" height="12" fill="#e70011"/>
              <rect y="12" width="24" height="12" fill="#ffffff"/>
            </svg>
          </button>

          <!-- Flag UK / English (Circular SVG) -->
          <button type="button" class="lang-flag-btn" id="flagBtnEn" onclick="setEditorLanguage('English')" title="English">
            <svg class="flag-icon-svg" width="22" height="22" viewBox="0 0 24 24" style="border-radius: 50%;">
              <clipPath id="circleUkEditor"><circle cx="12" cy="12" r="12"/></clipPath>
              <g clip-path="url(#circleUkEditor)">
                <rect width="24" height="24" fill="#00247d"/>
                <path d="M0,0 L24,24 M24,0 L0,24" stroke="#ffffff" stroke-width="4"/>
                <path d="M0,0 L24,24 M24,0 L0,24" stroke="#cf142b" stroke-width="2"/>
                <path d="M12,0 V24 M0,12 H24" stroke="#ffffff" stroke-width="6"/>
                <path d="M12,0 V24 M0,12 H24" stroke="#cf142b" stroke-width="3.5"/>
              </g>
            </svg>
          </button>
        </div>

        <!-- Light / Dark Theme Switcher -->
        <button type="button" class="btn-theme-toggle" id="themeToggleBtn" title="Ganti Tema Editor (Gelap / Terang)">
          <i class="bi bi-moon-stars-fill text-info" id="themeToggleIcon"></i>
        </button>
      </div>
    </header>

    <!-- 2. ACTION TOOLBAR (SEPARATED LEFT & RIGHT, NO SCROLLBAR, ICONS ONLY ON MOBILE, RESPONSIVE DYNAMIC SIZING) -->
    <div class="toolbar-glass-card neuron-glass-card mb-3 mb-md-4">
      <div class="d-flex align-items-center justify-content-between flex-nowrap w-100">
        <!-- Left Group: Execution & AI Actions -->
        <div class="toolbar-action-group toolbar-group-left d-flex align-items-center flex-nowrap">
          <!-- 1. Jalankan Kode -->
          <button id="execBtn" type="button" class="toolbar-item-btn btn-action-run" title="Jalankan Kode (Ctrl+Enter)">
            <i class="bi bi-play-fill text-warning fs-5"></i>
            <span class="toolbar-btn-label" id="btnExecuteText">Jalankan Kode</span>
          </button>

          <span class="toolbar-separator"></span>

          <!-- 2. AI Debug & Periksa -->
          <button id="aiDebugBtn" type="button" class="toolbar-item-btn btn-action-debug" title="AI Debug & Periksa Kode">
            <i class="bi bi-robot" style="color: #ea580c;"></i>
            <span class="toolbar-btn-label" id="btnAiDebugText">AI Debug & Periksa</span>
          </button>

          <span class="toolbar-separator"></span>

          <!-- 3. Template & Contoh -->
          <button type="button" class="toolbar-item-btn btn-action-template" data-bs-toggle="modal" data-bs-target="#snippetModal" title="Template & Contoh Kode">
            <i class="bi bi-file-earmark-code text-warning"></i>
            <span class="toolbar-btn-label" id="btnSnippetsText">Template & Contoh</span>
          </button>
        </div>

        <!-- Right Group: Utilities (Salin, Unduh, Bersihkan, API Key) -->
        <div class="toolbar-action-group toolbar-group-right d-flex align-items-center flex-nowrap ms-auto">
          <!-- 4. Salin -->
          <button id="copyBtn" type="button" class="toolbar-item-btn" title="Salin Kode ke Clipboard">
            <i class="bi bi-clipboard text-secondary"></i>
            <span class="toolbar-btn-label" id="btnCopyText">Salin</span>
          </button>

          <span class="toolbar-separator"></span>

          <!-- 5. Unduh -->
          <button id="dlBtn" type="button" class="toolbar-item-btn" title="Unduh File Kode">
            <i class="bi bi-download text-secondary"></i>
            <span class="toolbar-btn-label" id="btnDownloadText">Unduh</span>
          </button>

          <span class="toolbar-separator"></span>

          <!-- 6. Bersihkan -->
          <button id="clearBtn" type="button" class="toolbar-item-btn text-danger" title="Bersihkan Editor">
            <i class="bi bi-trash3 text-danger"></i>
            <span class="toolbar-btn-label" id="btnClearText">Bersihkan</span>
          </button>

          <span class="toolbar-separator"></span>

          <!-- 7. API Key -->
          <button type="button" class="toolbar-item-btn" data-bs-toggle="modal" data-bs-target="#apiKeyModal" title="Pengaturan AI Provider & API Key">
            <i class="bi bi-key-fill text-warning"></i>
            <span class="toolbar-btn-label">API Key</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. TWO-COLUMN WORKSPACE: LEFT EDITOR & RIGHT MULTI-OUTPUT -->
    <div class="row g-4">

      <!-- LEFT COLUMN: ACE CODE EDITOR -->
      <div class="col-12 col-lg-6">
        <div class="workspace-card neuron-glass-card d-flex flex-column">
          <!-- Editor Card Header (Simetris & Rapi Tanpa Tumpang Tindih) -->
          <div class="workspace-card-header d-flex align-items-center justify-content-between flex-nowrap gap-2">
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
              <span class="badge rounded-circle p-2 d-flex align-items-center justify-content-center" style="background: #ffedd5; color: #ea580c; width: 34px; height: 34px;">
                <i class="bi bi-code-slash fs-6"></i>
              </span>
              <span class="fw-bold text-dark small" id="editorHeaderTitle">Editor Kode</span>
            </div>
            <div class="d-flex align-items-center gap-1.5 gap-sm-2 flex-nowrap ms-auto flex-shrink-0">
              <span class="editor-header-badge" id="charCountInfo">
                <i class="bi bi-fonts text-secondary flex-shrink-0"></i> <span id="charCountNum">0</span><span class="badge-unit d-none d-sm-inline ms-1">Karakter</span>
              </span>
              <span class="editor-header-badge" id="cursorPosInfo">
                <i class="bi bi-cursor-fill text-secondary flex-shrink-0"></i> <span class="d-none d-sm-inline">Baris </span><span id="cursorLineNum">1</span><span class="d-none d-sm-inline">, Kolom </span><span class="d-inline d-sm-none">:</span><span id="cursorColNum">1</span>
              </span>
            </div>
          </div>

          <!-- Ace Editor Stage -->
          <div class="flex-grow-1 position-relative">
            <div id="editor"></div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: MULTI-TAB OUTPUT & VISUALIZER -->
      <div class="col-12 col-lg-6">
        <div class="workspace-card neuron-glass-card d-flex flex-column">
          <!-- Output Tab Navigation Header: ALL 3 TABS ALWAYS VISIBLE (TOTAL 3 TABS, 100% RESPONSIVE) -->
          <div class="workspace-card-header p-2 px-2 px-sm-3">
            <ul class="nav nav-tabs output-nav-tabs d-flex w-100 flex-nowrap" id="outputTabNav" role="tablist">
              <!-- Tab 1: Terminal Console -->
              <li class="nav-item flex-fill text-center" role="presentation" style="flex: 1 1 0; min-width: 0; max-width: 33.333%;">
                <button class="nav-link w-100 justify-content-center active text-truncate" id="tab-terminal-btn" data-bs-toggle="tab" data-bs-target="#tab-terminal" type="button" role="tab" title="Konsol Terminal">
                  <i class="bi bi-terminal me-1 text-success flex-shrink-0"></i>
                  <span class="d-none d-md-inline" id="tabTerminalText">Konsol Terminal</span>
                  <span class="d-inline d-md-none">Konsol</span>
                </button>
              </li>

              <!-- Tab 2: Visualisasi (Media & Data) -->
              <li class="nav-item flex-fill text-center" role="presentation" style="flex: 1 1 0; min-width: 0; max-width: 33.333%;">
                <button class="nav-link w-100 justify-content-center position-relative text-truncate" id="tab-visual-btn" data-bs-toggle="tab" data-bs-target="#tab-visual" type="button" role="tab" title="Visualisasi & Media">
                  <i class="bi bi-bar-chart-steps me-1 text-info flex-shrink-0"></i>
                  <span class="d-none d-md-inline" id="tabVisualText">Visualisasi & Media</span>
                  <span class="d-inline d-md-none">Visual</span>
                  <span class="badge rounded-circle bg-danger ms-1 d-none" id="visualTabBadge" style="width: 7px; height: 7px; padding: 0; display: inline-block; vertical-align: middle;"></span>
                </button>
              </li>

              <!-- Tab 3: Hasil Evaluasi AI -->
              <li class="nav-item flex-fill text-center" role="presentation" style="flex: 1 1 0; min-width: 0; max-width: 33.333%;">
                <button class="nav-link w-100 justify-content-center text-truncate" id="tab-aidebug-btn" data-bs-toggle="tab" data-bs-target="#tab-aidebug" type="button" role="tab" title="Hasil Evaluasi AI">
                  <i class="bi bi-cpu me-1 text-purple flex-shrink-0" style="color: #9333ea;"></i>
                  <span class="d-none d-md-inline" id="tabAiDebugText">Hasil Evaluasi AI</span>
                  <span class="d-inline d-md-none">Evaluasi AI</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Tab Content Panes -->
          <div class="tab-content flex-grow-1 position-relative" id="outputTabContent">

            <!-- TAB PANE 1: TERMINAL CONSOLE -->
            <div class="tab-pane fade show active h-100" id="tab-terminal" role="tabpanel">
              <div class="terminal-window" id="terminalOutput">
                <div class="terminal-line out-meta" id="terminalReadyLine">[Neuron.AI Runner Siap] Tulis kode Anda di sebelah kiri, lalu klik "Jalankan Kode" untuk melihat output.</div>
              </div>
            </div>

            <!-- TAB PANE 2: MULTI-MEDIA & 3D VISUALIZER -->
            <div class="tab-pane fade h-100" id="tab-visual" role="tabpanel">
              <div class="visualizer-window d-flex flex-column h-100" id="visualizerContainer">
                <div class="p-4 text-center text-secondary d-flex flex-column align-items-center justify-content-center h-100">
                  <i class="bi bi-boxes display-4 text-secondary opacity-50 mb-3"></i>
                  <h6 class="fw-bold text-dark mb-1">Visualisasi Gambar, Tabel, 2D & 3D</h6>
                  <p class="small text-secondary m-0" style="max-width: 380px;">
                    Panel ini secara otomatis menampilkan hasil eksekusi dalam bentuk citra/gambar (Base64/SVG), tabel data interaktif, visual grafis 2D Canvas, 3D WebGL (Three.js), atau pratinjau halaman web HTML live.
                  </p>
                </div>
              </div>
            </div>

            <!-- TAB PANE 3: AI DEBUGGER & ERROR BREAKDOWN -->
            <div class="tab-pane fade h-100" id="tab-aidebug" role="tabpanel">
              <div id="aiDebugOutput" class="ai-debug-window h-100">
                <div class="p-4 text-center text-secondary d-flex flex-column align-items-center justify-content-center h-100">
                  <i class="bi bi-robot display-4 text-secondary opacity-50 mb-3"></i>
                  <h6 class="fw-bold text-dark mb-1">Deteksi Error & Audit Baris demi Baris</h6>
                  <p class="small text-secondary m-0" style="max-width: 380px;">
                    Klik tombol <strong>"AI Debug & Periksa"</strong> di atas. AI akan membaca kode Anda baris demi baris, menemukan kesalahan sintaks/logika, dan memberikan saran perbaikan dalam bahasa awam.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- FOOTER -->
    <footer class="mt-4 pt-3 pb-3 text-center text-secondary small">
      © 2025-2026 <strong class="text-dark">Neuron.AI</strong> · Soft Glassmorphic Code Intelligence Engine · Developed by <strong class="text-dark">Edwin Al-Syatrie</strong> | S3 UAJY
    </footer>

  </div>

  <!-- QUICK SNIPPETS / TEMPLATES MODAL -->
  <div class="modal fade" id="snippetModal" tabindex="-1" aria-labelledby="snippetModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content neuron-glass-card border-secondary border-opacity-25 shadow-lg">
        <div class="modal-header border-bottom border-secondary border-opacity-25 pb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="badge rounded-circle p-2" style="background: #ffedd5; color: #ea580c;">
              <i class="bi bi-lightning-fill"></i>
            </span>
            <h5 class="modal-title fw-bold text-dark fs-6" id="snippetModalLabel">Template & Contoh Kode Siap Pakai</h5>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-3 p-md-4" style="max-height: 480px; overflow-y: auto;">
          <p class="text-secondary small mb-3">Pilih salah satu contoh program di bawah ini untuk langsung dimuat ke dalam editor. Bahasa akan terdeteksi otomatis!</p>
          <div id="snippetsListContainer"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- API KEY MODAL (MULTI-PROVIDER: GEMINI, CHATGPT, CLAUDE, DEEPSEEK) -->
  <div class="modal fade" id="apiKeyModal" tabindex="-1" aria-labelledby="apiKeyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content neuron-glass-card border-secondary border-opacity-25 shadow-lg">
        <div class="modal-header border-bottom border-secondary border-opacity-25 pb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="glass-icon-box-orange rounded-circle" style="width: 36px; height: 36px; min-width: 36px; max-width: 36px; min-height: 36px; max-height: 36px; aspect-ratio: 1/1; border-radius: 50% !important;">
              <i class="bi bi-key-fill" style="color: #ea580c;"></i>
            </span>
            <h5 class="modal-title fw-bold fs-6 mb-0" id="apiKeyModalLabel" style="color: var(--neuron-text-primary);">Konfigurasi AI Provider & API Key</h5>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-3 p-md-4">
          <p class="small mb-3" id="apiKeyModalDesc" style="color: var(--neuron-text-secondary); line-height: 1.55;">
            Pilih model AI dan tempelkan API Key Anda untuk mengaktifkan <strong>AI Runtime Simulation</strong> (menjalankan segala bahasa seperti MATLAB, Java, C++) dan audit kode online. Jika belum diisi, sistem otomatis menggunakan <strong>Audit Koding Lokal Cerdas</strong>.
          </p>

          <!-- 1. AI Provider Selection Combobox with Search & Rich Icons -->
          <div class="mb-3">
            <label class="form-label small fw-bold" id="lblAiProvider" style="color: var(--neuron-text-secondary);">PILIH PROVIDER / MODEL AI</label>
            
            <!-- Hidden native select for form/state compatibility -->
            <select id="aiProviderSelect" class="d-none">
              <option value="gemini-2.5-flash">Google Gemini (Gemini 2.5 Flash — Tercepat & Rekomendasi)</option>
              <option value="gemini-1.5-pro">Google Gemini (Gemini 1.5 Pro — Analisa Mendalam)</option>
              <option value="openai-gpt-4o">OpenAI ChatGPT (GPT-4o Omni)</option>
              <option value="openai-gpt-4o-mini">OpenAI ChatGPT (GPT-4o Mini)</option>
              <option value="claude-3.5-sonet">Anthropic Claude (Claude 3.5 Sonnet)</option>
              <option value="deepseek-chat">DeepSeek AI (DeepSeek-V3 Chat)</option>
              <option value="deepseek-reasoner">DeepSeek AI (DeepSeek-R1 Reasoner)</option>
            </select>

            <!-- Custom Searchable Combobox Trigger -->
            <div class="dropdown custom-ai-select-dropdown w-100 position-relative">
              <button type="button" class="form-select custom-ai-select-btn d-flex align-items-center justify-content-between w-100 fw-semibold text-start shadow-sm" id="customAiSelectBtn" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                <div class="d-flex align-items-center gap-2 text-truncate" id="customAiSelectedDisplay">
                  <span class="ai-provider-badge-icon flex-shrink-0" id="customAiSelectedIcon" style="background: rgba(234, 88, 12, 0.15); color: #ea580c;">
                    <i class="bi bi-stars"></i>
                  </span>
                  <span class="fw-semibold small text-truncate" id="customAiSelectedText">Google Gemini (Gemini 2.5 Flash)</span>
                </div>
                <i class="bi bi-chevron-down ms-2 text-secondary flex-shrink-0" style="font-size: 0.8rem;"></i>
              </button>

              <!-- Custom Dropdown Menu with Search Box & Rich Model List -->
              <div class="dropdown-menu custom-ai-dropdown-menu w-100 p-2 shadow-lg" id="customAiDropdownMenu">
                <!-- Search Box inside Dropdown -->
                <div class="px-1 pt-1 pb-2 sticky-top" style="background: inherit;">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text border-end-0 bg-transparent" style="color: var(--neuron-orange); border-color: var(--neuron-input-border);">
                      <i class="bi bi-search"></i>
                    </span>
                    <input type="text" id="aiModelSearchInput" class="form-control border-start-0" placeholder="Cari provider atau model AI..." style="background: var(--neuron-input-bg); color: var(--neuron-text-primary); border-color: var(--neuron-input-border);" autocomplete="off" />
                  </div>
                </div>
                <div class="dropdown-divider my-1"></div>
                <!-- Model List Items with Icons -->
                <div class="ai-model-list-container" id="aiModelListContainer">
                  <!-- Option 1: Gemini 2.5 Flash -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between active" data-value="gemini-2.5-flash" data-provider="gemini" data-label="Google Gemini (Gemini 2.5 Flash)" data-icon="bi-stars" data-icon-color="#ea580c" data-icon-bg="rgba(234, 88, 12, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(234, 88, 12, 0.15); color: #ea580c;">
                        <i class="bi bi-stars"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">Google Gemini</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">Gemini 2.5 Flash — Tercepat & Rekomendasi</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2"></i>
                  </div>

                  <!-- Option 2: Gemini 1.5 Pro -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="gemini-1.5-pro" data-provider="gemini" data-label="Google Gemini (Gemini 1.5 Pro)" data-icon="bi-stars" data-icon-color="#6366f1" data-icon-bg="rgba(99, 102, 241, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">
                        <i class="bi bi-stars"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">Google Gemini</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">Gemini 1.5 Pro — Analisa Mendalam</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>

                  <!-- Option 3: OpenAI GPT-4o -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="openai-gpt-4o" data-provider="openai" data-label="OpenAI ChatGPT (GPT-4o Omni)" data-icon="bi-robot" data-icon-color="#10b981" data-icon-bg="rgba(16, 185, 129, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                        <i class="bi bi-robot"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">OpenAI ChatGPT</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">GPT-4o Omni — Multimodal Flagship</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>

                  <!-- Option 4: OpenAI GPT-4o Mini -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="openai-gpt-4o-mini" data-provider="openai" data-label="OpenAI ChatGPT (GPT-4o Mini)" data-icon="bi-lightning-charge-fill" data-icon-color="#14b8a6" data-icon-bg="rgba(20, 184, 166, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(20, 184, 166, 0.15); color: #14b8a6;">
                        <i class="bi bi-lightning-charge-fill"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">OpenAI ChatGPT</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">GPT-4o Mini — Cepat & Efisien</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>

                  <!-- Option 5: Claude 3.5 Sonnet -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="claude-3.5-sonet" data-provider="claude" data-label="Anthropic Claude (Claude 3.5 Sonnet)" data-icon="bi-chat-heart-fill" data-icon-color="#d97706" data-icon-bg="rgba(217, 119, 6, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(217, 119, 6, 0.15); color: #d97706;">
                        <i class="bi bi-chat-heart-fill"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">Anthropic Claude</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">Claude 3.5 Sonnet — Penalaran Superior</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>

                  <!-- Option 6: DeepSeek-V3 Chat -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="deepseek-chat" data-provider="deepseek" data-label="DeepSeek AI (DeepSeek-V3 Chat)" data-icon="bi-cpu-fill" data-icon-color="#0284c7" data-icon-bg="rgba(2, 132, 199, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(2, 132, 199, 0.15); color: #0284c7;">
                        <i class="bi bi-cpu-fill"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">DeepSeek AI</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">DeepSeek-V3 Chat — Hemat & Cepat</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>

                  <!-- Option 7: DeepSeek-R1 Reasoner -->
                  <div class="ai-model-item d-flex align-items-center justify-content-between" data-value="deepseek-reasoner" data-provider="deepseek" data-label="DeepSeek AI (DeepSeek-R1 Reasoner)" data-icon="bi-lightbulb-fill" data-icon-color="#38bdf8" data-icon-bg="rgba(56, 189, 248, 0.15)">
                    <div class="d-flex align-items-center gap-2 text-truncate">
                      <span class="ai-provider-badge-icon flex-shrink-0" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                        <i class="bi bi-lightbulb-fill"></i>
                      </span>
                      <div class="text-truncate">
                        <div class="fw-bold small">DeepSeek AI</div>
                        <div class="text-secondary small font-monospace text-truncate" style="font-size: 0.72rem;">DeepSeek-R1 Reasoner — Deep Thinking</div>
                      </div>
                    </div>
                    <i class="bi bi-check-circle-fill text-success fs-6 check-indicator flex-shrink-0 ms-2 d-none"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. API Key Input with Paste & Visibility Toggle -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <label class="form-label small fw-bold m-0" id="lblApiKeyInput" style="color: var(--neuron-text-secondary);">TEMPEL API KEY</label>
              <button type="button" class="btn btn-sm text-primary p-0 text-decoration-none small fw-semibold d-inline-flex align-items-center" id="pasteApiKeyBtn">
                <i class="bi bi-clipboard-plus me-1"></i> <span id="pasteApiKeyBtnText">Tempel dari Clipboard</span>
              </button>
            </div>
            <div class="input-group">
              <input type="password" id="apiKeyModalInput" class="form-control font-monospace" placeholder="Tempel API Key AIzaSy..." style="background: var(--neuron-input-bg); color: var(--neuron-text-primary); border: 1.5px solid var(--neuron-input-border); border-radius: 12px 0 0 12px; padding: 10px 14px;" />
              <button class="btn btn-outline-secondary" type="button" id="toggleApiKeyModalVisBtn" style="border-radius: 0 12px 12px 0; border: 1.5px solid var(--neuron-input-border); border-left: none;">
                <i class="bi bi-eye-slash" id="toggleApiKeyModalVisIcon"></i>
              </button>
            </div>
            <div class="form-text small mt-1.5 d-flex align-items-center justify-content-between" style="color: var(--neuron-text-secondary);">
              <span id="lblApiKeyStored"><i class="bi bi-shield-lock-fill text-success me-1"></i> Tersimpan lokal di browser (localStorage)</span>
              <span id="apiKeyStatusBadge" class="badge bg-secondary bg-opacity-25 text-secondary">Belum Terhubung</span>
            </div>
          </div>

          <!-- 3. Modal Actions -->
          <div class="d-flex align-items-center justify-content-between pt-2 flex-wrap gap-2">
            <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener noreferrer" class="small text-decoration-none fw-semibold" id="apiKeyPortalLink" style="color: #ea580c;">
              <i class="bi bi-box-arrow-up-right me-1"></i> <span id="apiKeyPortalText">Dapatkan Gemini API Key Gratis</span>
            </a>
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-danger px-3 py-1.5 rounded-pill d-none" id="clearApiKeyModalBtn" title="Hapus Kunci Tersimpan">
                <i class="bi bi-trash3 me-1"></i> <span id="clearApiKeyModalBtnText">Hapus</span>
              </button>
              <button type="button" class="btn btn-exec-action px-3.5 py-1.5 fs-6" id="saveApiKeyModalBtn">
                <i class="bi bi-check-circle me-1"></i> <span id="saveApiKeyModalBtnText">Simpan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- FLOATING CURVED BOTTOM NAVIGATION DOCK (TABLET & MOBILE < 992px) -->
  <nav class="floating-bottom-nav d-lg-none" id="editorBottomNav" aria-label="Editor Mobile Navigation">
    <!-- 1. Cek AI / Evaluasi AI -->
    <a href="javascript:void(0)" class="bottom-nav-item" id="bnavAiBtn" title="Cek AI / Evaluasi Kode">
      <i class="bi bi-robot"></i>
      <span id="bottomNavAiLabel">Cek AI</span>
    </a>

    <!-- 2. Template / Contoh Kode -->
    <a href="javascript:void(0)" class="bottom-nav-item" id="bnavSnippetsBtn" data-bs-toggle="modal" data-bs-target="#snippetModal" title="Template & Contoh Kode">
      <i class="bi bi-file-earmark-code"></i>
      <span id="bottomNavSnippetsLabel">Template</span>
    </a>

    <!-- 3. Bulatan Besar Tengah: RUN (Jalankan Kode) -->
    <div class="bottom-nav-action-wrapper">
      <button type="button" class="bottom-nav-action-btn" id="bnavRunBtn" title="Jalankan Kode (Run)">
        <i class="bi bi-play-fill" id="bnavRunIcon" style="margin-left: 2px;"></i>
      </button>
      <span class="bottom-nav-action-label" id="bottomNavRunLabel">RUN</span>
    </div>

    <!-- 4. Unduh File Kode -->
    <a href="javascript:void(0)" class="bottom-nav-item" id="bnavDlBtn" title="Unduh File Kode">
      <i class="bi bi-download"></i>
      <span id="bottomNavDlLabel">Unduh</span>
    </a>

    <!-- 5. Pengaturan API Key AI -->
    <a href="javascript:void(0)" class="bottom-nav-item" id="bnavApiKeyBtn" data-bs-toggle="modal" data-bs-target="#apiKeyModal" title="Pengaturan AI Provider & API Key">
      <i class="bi bi-key-fill"></i>
      <span id="bottomNavApiKeyLabel">API Key</span>
    </a>
  </nav>

  <!-- Background Network Animation Canvas Script (Light Mode Friendly) -->
  <script>
    (function() {
      const c = document.getElementById('neuron-bg');
      if (!c) return;
      const ctx = c.getContext('2d');

      function resize() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        init();
      }
      let P = [];

      function init() {
        const n = Math.min(75, Math.floor(c.width * c.height / 25000));
        P = Array.from({ length: n }, () => ({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          vx: (Math.random() * 2 - 1) * 0.3,
          vy: (Math.random() * 2 - 1) * 0.3,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? 'rgba(249, 115, 22, 0.65)' : 'rgba(234, 88, 12, 0.45)'
        }));
      }

      function frame() {
        ctx.clearRect(0, 0, c.width, c.height);
        for (const p of P) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > c.width) p.vx *= -1;
          if (p.y < 0 || p.y > c.height) p.vy *= -1;
          
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        for (let i = 0; i < P.length; i++) {
          for (let j = i + 1; j < P.length; j++) {
            const a = P[i], b = P[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 110) {
              ctx.strokeStyle = 'rgba(249, 115, 22, 0.12)';
              ctx.lineWidth = 0.7;
              ctx.globalAlpha = (110 - d) / 220;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(frame);
      }
      window.addEventListener('resize', resize);
      resize();
      frame();
    })();
  </script>

  <!-- Modular Scripts from Dedicated Editor Directory -->
  <script src="./_manage/editor/editor-detector.js?v=<?= time() ?>"></script>
  <script src="./_manage/editor/editor-runner.js?v=<?= time() ?>"></script>
  <script src="./_manage/editor/editor-visualizer.js?v=<?= time() ?>"></script>
  <script src="./_manage/editor/editor-debugger.js?v=<?= time() ?>"></script>
  <script src="./_manage/editor/editor-main.js?v=<?= time() ?>"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
