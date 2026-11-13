/**
 * Neuron.AI — Unified Editor Main Orchestrator
 * File: _manage/editor/editor-main.js
 * 
 * Orchestrates Ace Editor, Auto-Detector, Runner, Visualizer, AI Debugger, and UI.
 */

(function (window) {
  'use strict';

  // Snippets library: rich interactive templates (3D, 2D, Chart, Animation, MATLAB, Python, PHP, JS, SQL, HTML)
  const SNIPPETS = {
    visual3d: [
      {
        title: 'Visualisasi 3D Torus Knot & Starfield (Three.js)',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>3D WebGL Torus Knot</title>
  <style>
    body { margin: 0; overflow: hidden; background: #030712; font-family: sans-serif; }
    #hud { position: absolute; top: 16px; left: 16px; color: #fff; background: rgba(15,23,42,0.85); padding: 12px 18px; border-radius: 14px; border: 1.5px solid rgba(234,88,12,0.45); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    #hud h4 { margin: 0 0 4px; color: #f97316; font-size: 15px; font-weight: bold; }
    #hud p { margin: 0; font-size: 12px; color: #94a3b8; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
</head>
<body>
  <div id="hud">
    <h4>Neuron 3D WebGL Engine</h4>
    <p>Gerakkan kursor mouse untuk rotasi 3D dinamis</p>
  </div>
  <script>
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Torus Knot Geometry
    const geom = new THREE.TorusKnotGeometry(2.4, 0.65, 128, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: false
    });
    const knot = new THREE.Mesh(geom, mat);
    scene.add(knot);

    // Dynamic Lighting
    const pointLight = new THREE.PointLight(0xffedd5, 2.5, 100);
    pointLight.position.set(10, 15, 20);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x38bdf8, 1.2);
    scene.add(ambientLight);

    // Starfield Background Particles
    const starGeom = new THREE.BufferGeometry();
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 90;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.25 });
    const stars = new THREE.Points(starGeom, starMat);
    scene.add(stars);

    camera.position.z = 7.5;

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);
      knot.rotation.x += 0.012;
      knot.rotation.y += 0.016;
      stars.rotation.y += 0.0015;
      knot.rotation.x += mouseY * 0.02;
      knot.rotation.y += mouseX * 0.02;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  <\/script>
</body>
</html>`
      }
    ],
    visual2d: [
      {
        title: 'Visualisasi 2D Canvas Gelombang Harmonik',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>2D Canvas Harmonic Sine Waves</title>
  <style>
    body { margin: 0; overflow: hidden; background: #0b1120; font-family: sans-serif; }
    canvas { display: block; width: 100%; height: 100vh; }
    .badge-hud { position: absolute; top: 16px; left: 16px; color: #4ade80; background: rgba(15,23,42,0.85); padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: bold; border: 1.5px solid rgba(74,222,128,0.35); box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
  </style>
</head>
<body>
  <div class="badge-hud">● Live 2D Mathematical Wave Synthesis</div>
  <canvas id="c"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let w, h, time = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function draw() {
      ctx.fillStyle = 'rgba(11, 17, 32, 0.18)';
      ctx.fillRect(0, 0, w, h);

      const waves = [
        { color: '#ea580c', freq: 0.008, amp: 55, speed: 0.03, y: h * 0.5 },
        { color: '#38bdf8', freq: 0.012, amp: 40, speed: -0.025, y: h * 0.5 },
        { color: '#facc15', freq: 0.005, amp: 65, speed: 0.015, y: h * 0.5 }
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = wave.color;
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 15;

        for (let x = 0; x < w; x += 4) {
          const y = wave.y + Math.sin(x * wave.freq + time * wave.speed) * wave.amp
                          + Math.cos((x * 0.5 + time) * 0.01) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      time += 1;
      requestAnimationFrame(draw);
    }
    draw();
  <\/script>
</body>
</html>`
      }
    ],
    chart: [
      {
        title: 'Grafik Interaktif Data Analytics (SVG & CSS)',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Grafik Interaktif Data</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; margin: 0; }
    .chart-card { background: #1e293b; border: 1.5px solid rgba(234, 88, 12, 0.4); border-radius: 20px; padding: 26px; max-width: 580px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.45); }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .chart-title { font-size: 1.2rem; font-weight: bold; color: #f97316; margin: 0; }
    .bar-group { display: flex; flex-direction: column; gap: 16px; }
    .bar-item { display: flex; align-items: center; gap: 14px; }
    .bar-label { width: 100px; font-size: 0.88rem; color: #94a3b8; font-weight: 600; }
    .bar-track { flex-grow: 1; height: 28px; background: #0f172a; border-radius: 14px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 14px; background: linear-gradient(90deg, #ea580c, #fb923c); display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; font-size: 0.8rem; font-weight: bold; color: #fff; box-shadow: 0 0 12px rgba(234,88,12,0.4); }
    .bar-fill.accent-cyan { background: linear-gradient(90deg, #0284c7, #38bdf8); box-shadow: 0 0 12px rgba(56,189,248,0.4); }
    .bar-fill.accent-green { background: linear-gradient(90deg, #16a34a, #4ade80); box-shadow: 0 0 12px rgba(74,222,128,0.4); }
    .bar-fill.accent-purple { background: linear-gradient(90deg, #7c3aed, #c084fc); box-shadow: 0 0 12px rgba(192,132,252,0.4); }
  </style>
</head>
<body>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">📊 Performa Komputasi Sistem</h3>
      <span style="font-size: 0.8rem; background: rgba(234,88,12,0.15); color: #fb923c; padding: 4px 12px; border-radius: 20px; font-weight: bold; border: 1px solid rgba(234,88,12,0.3);">Q4 2026</span>
    </div>
    <div class="bar-group">
      <div class="bar-item">
        <span class="bar-label">PHP Engine</span>
        <div class="bar-track"><div class="bar-fill" style="width: 88%;">88%</div></div>
      </div>
      <div class="bar-item">
        <span class="bar-label">Python AI</span>
        <div class="bar-track"><div class="bar-fill accent-cyan" style="width: 95%;">95%</div></div>
      </div>
      <div class="bar-item">
        <span class="bar-label">MATLAB Math</span>
        <div class="bar-track"><div class="bar-fill accent-green" style="width: 84%;">84%</div></div>
      </div>
      <div class="bar-item">
        <span class="bar-label">3D WebGL</span>
        <div class="bar-track"><div class="bar-fill accent-purple" style="width: 98%;">98%</div></div>
      </div>
    </div>
  </div>
</body>
</html>`
      }
    ],
    animation: [
      {
        title: 'Animasi UI Glassmorphism Morphing Orb',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Animasi Glassmorphic Morphing Orb</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1e1b4b, #030712); font-family: 'Segoe UI', sans-serif; overflow: hidden; }
    .glow-orb { width: 230px; height: 230px; background: linear-gradient(45deg, #ff6b00, #ec4899, #8b5cf6); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; animation: morph 6s ease-in-out infinite; filter: blur(32px); opacity: 0.85; position: absolute; }
    @keyframes morph {
      0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }
      50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg) scale(1.15); }
      100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg) scale(1); }
    }
    .glass-card { position: relative; z-index: 10; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1.5px solid rgba(255, 255, 255, 0.25); border-radius: 28px; padding: 36px 44px; text-align: center; color: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    h2 { margin: 0 0 8px; font-size: 1.6rem; color: #ffedd5; }
    p { margin: 0; font-size: 0.95rem; color: #cbd5e1; }
    .pill { display: inline-block; margin-top: 20px; padding: 6px 20px; border-radius: 50px; background: rgba(234,88,12,0.3); border: 1px solid #f97316; font-size: 0.85rem; font-weight: bold; color: #ffedd5; }
  </style>
</head>
<body>
  <div class="glow-orb"></div>
  <div class="glass-card">
    <h2>Neuron Morphic Core</h2>
    <p>Animasi CSS3 3D & Efek Glassmorphism Modern</p>
    <div class="pill">★ 60 FPS GPU-Accelerated</div>
  </div>
</body>
</html>`
      }
    ],
    matlab: [
      {
        title: 'MATLAB: Operasi Aljabar Linier & Matriks',
        code: `% Contoh Pemrograman MATLAB Dasar: Aljabar Linier & Matriks
clc; clear;
disp('=== PERHITUNGAN MATRIKS DENGAN MATLAB ===');

% Deklarasi Matriks A dan B
A = [4, 7; 2, 6];
B = [1, 3; 5, 2];

disp('Matriks A:');
disp(A);
disp('Matriks B:');
disp(B);

% Penjumlahan dan Perkalian Matriks
C_tambah = A + B;
C_kali = A * B;
disp('Hasil Penjumlahan (A + B):');
disp(C_tambah);
disp('Hasil Perkalian (A * B):');
disp(C_kali);

% Determinan dan Invers Matriks A
det_A = det(A);
inv_A = inv(A);
fprintf('Determinan Matriks A: %.2f\\n', det_A);
disp('Invers Matriks A:');
disp(inv_A);`
      },
      {
        title: 'MATLAB: Simulasi Sinyal Gelombang Sinus',
        code: `% Analisis Gelombang Harmonik & Simulasi Sinyal
clc; clear;
disp('=== SIMULASI SINYAL GELOMBANG SINUSOIDAL ===');

Fs = 100;                    % Frekuensi sampling (Hz)
t = 0:1/Fs:0.5;              % Vektor waktu 0 sampai 0.5 detik
f1 = 5;                      % Frekuensi sinyal dasar (5 Hz)
f2 = 12;                     % Frekuensi harmonik ke-2 (12 Hz)

% Sinyal komposit (sinus + harmonik)
y = sin(2*pi*f1*t) + 0.5*cos(2*pi*f2*t);

disp('Parameter Sinyal:');
fprintf('Frekuensi Sampling : %d Hz\\n', Fs);
fprintf('Frekuensi Dasar    : %d Hz\\n', f1);
fprintf('Amplitudo Maksimum : %.4f\\n', max(y));
fprintf('Amplitudo Minimum  : %.4f\\n', min(y));

% Ringkasan sampel sinyal
disp('10 Sampel Nilai Pertama:');
disp(y(1:10));`
      }
    ],
    php: [
      {
        title: 'Halo Dunia & Hitung Penjumlahan',
        code: `<?php
// Contoh Program PHP Dasar
$nama = "Mahasiswa";
echo "Halo, " . $nama . "! Selamat datang di Neuron.AI.\\n";

$angka1 = 15;
$angka2 = 25;
$hasil = $angka1 + $angka2;
echo "Hasil penjumlahan $angka1 + $angka2 = $hasil\\n";
?>`
      },
      {
        title: 'Array & Perulangan Foreach',
        code: `<?php
$buah = ["Apel", "Jeruk", "Mangga", "Pisang"];
echo "Daftar Buah Favorit:\\n";

foreach ($buah as $idx => $b) {
    echo ($idx + 1) . ". " . $b . "\\n";
}
?>`
      },
      {
        title: 'Format Tabel JSON Data (Visualisasi Otomatis)',
        code: `<?php
// Output JSON yang otomatis divisualisasikan menjadi Tabel Interaktif
$data = [
    ["id" => 1, "nama" => "Budi Santoso", "nilai" => 88, "status" => "Lulus"],
    ["id" => 2, "nama" => "Siti Aminah", "nilai" => 95, "status" => "Lulus"],
    ["id" => 3, "nama" => "Rian Pratama", "nilai" => 68, "status" => "Remedial"]
];

echo json_encode($data, JSON_PRETTY_PRINT);
?>`
      }
    ],
    python: [
      {
        title: 'Halo Dunia & Percabangan Kondisi',
        code: `# Contoh Python Dasar
nama = "Budi"
nilai = 85

print(f"Halo {nama}, nilai kamu adalah {nilai}")

if nilai >= 75:
    print("Status: Selamat, Kamu Lulus!")
else:
    print("Status: Perlu belajar lebih giat lagi.")`
      },
      {
        title: 'Fungsi & Perulangan Loop Faktorial',
        code: `# Perhitungan Deret Faktorial
def faktorial(n):
    if n <= 1:
        return 1
    return n * faktorial(n - 1)

for i in range(1, 6):
    print(f"Faktorial dari {i} adalah {faktorial(i)}")`
      },
      {
        title: 'Visualisasi Data Tabel (JSON Array)',
        code: `import json

mahasiswa = [
    {"nim": "21001", "nama": "Ahmad", "jurusan": "Informatika"},
    {"nim": "21002", "nama": "Dewi", "jurusan": "Sistem Informasi"},
    {"nim": "21003", "nama": "Eko", "jurusan": "Teknik Komputer"}
]

print(json.dumps(mahasiswa, indent=2))`
      }
    ],
    javascript: [
      {
        title: 'JavaScript Modern & Array Manipulation',
        code: `// Contoh JavaScript Modern
const angka = [10, 20, 30, 40, 50];
const total = angka.reduce((acc, curr) => acc + curr, 0);

console.log("Daftar angka:", angka);
console.log("Total penjumlahan:", total);
console.log("Rata-rata:", total / angka.length);`
      },
      {
        title: 'Data Tabel Objek JSON Interaktif',
        code: `// Data Array Objek yang otomatis dijadikan tabel interaktif
const produk = [
  { id: 101, nama: "Laptop Pro", harga: 12500000, stok: 5 },
  { id: 102, nama: "Mouse Wireless", harga: 150000, stok: 35 },
  { id: 103, nama: "Keyboard RGB", harga: 450000, stok: 12 }
];

console.log(JSON.stringify(produk, null, 2));`
      }
    ],
    html: [
      {
        title: 'Pratinjau Halaman Web Modern',
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pratinjau Web</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #0f172a; color: #fff; padding: 25px; text-align: center; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    h1 { color: #f97316; margin-bottom: 10px; }
    button { background: #f97316; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    button:hover { background: #ea580c; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Halo Dunia!</h1>
    <p>Ini adalah pratinjau live HTML interaktif dari Neuron.AI.</p>
    <button onclick="alert('Tombol berfungsi normal!')">Klik Saya</button>
  </div>
</body>
</html>`
      }
    ],
    sql: [
      {
        title: 'Query Tabel Basis Data Pengguna',
        code: `CREATE TABLE users (
  id INT PRIMARY KEY,
  nama VARCHAR(100),
  role VARCHAR(50)
);

INSERT INTO users VALUES (1, 'Admin Utama', 'Superadmin');
INSERT INTO users VALUES (2, 'Budi Santoso', 'Mahasiswa');

SELECT * FROM users;`
      }
    ]
  };

  // i18n Dictionary
  const i18n = {
    Indonesia: {
      brandSub: 'Editor & Debugger Kode Cerdas',
      btnRun: 'Jalankan Kode',
      btnAiDebug: 'AI Debug & Periksa',
      btnSnippets: 'Template & Contoh',
      btnCopy: 'Salin',
      btnDownload: 'Unduh',
      btnClear: 'Bersihkan',
      tabTerminal: 'Konsol Terminal',
      tabVisual: 'Visualisasi & Media',
      tabAiDebug: 'Hasil Evaluasi AI',
      autoDetectBadge: 'Deteksi Otomatis:',
      editorTitle: 'Editor Kode Interaktif',
      lineCol: 'Baris %l, Kolom %c',
      charCount: '%n Karakter',
      readyMsg: 'Terminal siap. Tulis kode lalu klik "Jalankan Kode" atau "AI Debug".',
      themeDark: 'Mode Gelap',
      themeLight: 'Mode Terang'
    },
    English: {
      brandSub: 'Smart Code Editor & Debugger',
      btnRun: 'Run Code',
      btnAiDebug: 'AI Debug & Audit',
      btnSnippets: 'Templates & Snippets',
      btnCopy: 'Copy',
      btnDownload: 'Download',
      btnClear: 'Clear',
      tabTerminal: 'Console Terminal',
      tabVisual: 'Visual & Media',
      tabAiDebug: 'AI Audit Results',
      autoDetectBadge: 'Auto Detected:',
      editorTitle: 'Interactive Code Editor',
      lineCol: 'Line %l, Col %c',
      charCount: '%n Characters',
      readyMsg: 'Terminal ready. Write code and click "Run Code" or "AI Debug".',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode'
    }
  };

  class EditorApp {
    constructor() {
      this.editor = null;
      this.currentLang = 'php';
      this.currentTheme = localStorage.getItem('neuron_editor_theme') || 'light';
      this.lastError = '';
    }

    init() {
      this.initAce();
      this.initSubsystems();
      this.bindEvents();
      this.applyI18n();
      this.initApiKeyModal();
      this.setTheme(this.currentTheme);
      this.loadInitialSnippet();
    }

    initAce() {
      this.editor = ace.edit("editor", {
        mode: "ace/mode/php",
        theme: "ace/theme/tomorrow_night",
        fontSize: "13.5px",
        fontFamily: "'JetBrains Mono', monospace",
        showPrintMargin: false,
        useWorker: false,
        wrap: true,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      // Update cursor position
      this.editor.selection.on('changeCursor', () => {
        const pos = this.editor.getCursorPosition();
        const el = document.getElementById('cursorPosInfo');
        if (el) {
          const dict = this.getDict();
          el.innerHTML = `<i class="bi bi-cursor-fill me-1 text-secondary"></i> ${dict.lineCol.replace('%l', pos.row + 1).replace('%c', pos.column + 1)}`;
        }
      });

      // Update char count & trigger auto-detect
      this.editor.session.on('change', () => {
        const val = this.editor.getValue();
        const charEl = document.getElementById('charCountInfo');
        if (charEl) {
          const dict = this.getDict();
          charEl.innerHTML = `<i class="bi bi-fonts me-1 text-secondary"></i> ${dict.charCount.replace('%n', val.length)}`;
        }
        NeuronDetector.analyze(val);
      });
    }

    initSubsystems() {
      // Connect Visualizer
      NeuronVisualizer.init('visualizerContainer');

      // Connect Debugger
      NeuronDebugger.init(this.editor, 'aiDebugOutput');

      // Connect Detector Listener
      NeuronDetector.onLanguageChange((langInfo, source) => {
        this.currentLang = langInfo.id;
        this.editor.session.setMode(langInfo.aceMode);
        this.updateDetectorBadge(langInfo, source);
      });
    }

    updateDetectorBadge(langInfo, source) {
      const badgeText = document.getElementById('detectedLangText');
      const badgeIcon = document.getElementById('detectedLangIcon');
      const dot = document.querySelector('.detection-pill .pulse-dot');

      if (badgeText) badgeText.textContent = langInfo.name;
      if (badgeIcon) {
        badgeIcon.className = `bi ${langInfo.icon || 'bi-code-slash'} me-1`;
        badgeIcon.style.color = langInfo.color || '#f97316';
      }
      if (dot) {
        dot.style.backgroundColor = langInfo.color || '#10b981';
        dot.style.boxShadow = `0 0 8px ${langInfo.color || '#10b981'}`;
      }
    }

    bindEvents() {
      // Execute (Run) Button
      const runBtn = document.getElementById('execBtn');
      if (runBtn) {
        runBtn.onclick = () => this.handleRun();
      }

      // AI Debug Button
      const aiBtn = document.getElementById('aiDebugBtn');
      if (aiBtn) {
        aiBtn.onclick = () => this.handleAiDebug();
      }

      // Snippet Modal / Buttons
      this.renderSnippetMenu();

      // Copy Code
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(this.editor.getValue());
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="bi bi-check2 me-1"></i> Tersalin!';
          setTimeout(() => { copyBtn.innerHTML = orig; }, 1500);
        };
      }

      // Download Code
      const dlBtn = document.getElementById('dlBtn');
      if (dlBtn) {
        dlBtn.onclick = () => this.handleDownload();
      }

      // Clear
      const clearBtn = document.getElementById('clearBtn');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (confirm('Bersihkan kode di editor dan riwayat terminal?')) {
            this.editor.setValue('', -1);
            this.clearTerminal();
            NeuronVisualizer.clear();
            NeuronDebugger.clear();
          }
        };
      }

      // Theme toggle (Dark / Light)
      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) {
        themeBtn.onclick = () => this.toggleTheme();
      }

      // Reset auto-detect when badge clicked
      const detectPill = document.getElementById('detectorPill');
      if (detectPill) {
        detectPill.onclick = () => {
          NeuronDetector.resetToAuto(this.editor.getValue());
        };
      }
    }

    async handleRun() {
      const code = this.editor.getValue().trim();
      if (!code) {
        alert('Tuliskan atau tempel kode terlebih dahulu.');
        return;
      }

      this.clearTerminal();
      this.logTerminal(`[Memulai eksekusi kode ${this.currentLang.toUpperCase()}...]`, 'meta');

      // Switch to Console tab
      this.activateTab('tab-terminal-btn');

      const runBtn = document.getElementById('execBtn');
      const origHtml = runBtn ? runBtn.innerHTML : '';
      if (runBtn) {
        runBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Menjalankan...';
        runBtn.disabled = true;
      }

      try {
        const result = await NeuronRunner.execute(code, this.currentLang);
        result.rawCode = code;

        if (result.status === 'error') {
          this.lastError = result.output;
          this.logTerminal(result.output, 'err');
          this.logTerminal(`[Gagal dieksekusi — Durasi: ${result.duration || 0} ms]`, 'meta');

          // Render one-click AI Debug suggestion card in terminal
          this.renderErrorPromptInTerminal(result.output);
        } else {
          this.lastError = '';
          this.logTerminal(result.output, 'ok');
          this.logTerminal(`[Eksekusi Berhasil — Durasi: ${result.duration || 0} ms]`, 'meta');

          // Process rich visuals (Images, Tables, 2D/3D, HTML)
          const visResult = NeuronVisualizer.processOutput(result);
          if (visResult.hasVisual) {
            this.highlightVisualTab(visResult.label);
          }
        }
      } catch (err) {
        this.logTerminal(`[Kesalahan]: ${err.message || err}`, 'err');
      } finally {
        if (runBtn) {
          runBtn.innerHTML = origHtml;
          runBtn.disabled = false;
        }
      }
    }

    async handleAiDebug() {
      const code = this.editor.getValue().trim();
      if (!code) {
        alert('Tuliskan kode terlebih dahulu untuk diaudit.');
        return;
      }

      this.activateTab('tab-aidebug-btn');
      await NeuronDebugger.auditCode(code, this.currentLang, this.lastError);
    }

    renderErrorPromptInTerminal(errorMsg) {
      const out = document.getElementById('terminalOutput');
      if (!out) return;

      const promptDiv = document.createElement('div');
      promptDiv.className = 'mt-3 p-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-50 d-flex align-items-center justify-content-between gap-2';

      promptDiv.innerHTML = `
        <div class="small text-warning">
          <i class="bi bi-lightbulb-fill me-1"></i> Ingin tahu mengapa baris kode ini error? Periksa baris demi baris secara awam.
        </div>
        <button class="btn btn-sm btn-warning text-dark fw-bold px-3 py-1 text-nowrap" id="terminalAiDebugTrigger">
          <i class="bi bi-robot me-1"></i> Periksa dengan AI
        </button>
      `;

      out.appendChild(promptDiv);

      promptDiv.querySelector('#terminalAiDebugTrigger').onclick = () => {
        this.handleAiDebug();
      };
    }

    logTerminal(text, type = 'ok') {
      const out = document.getElementById('terminalOutput');
      if (!out) return;

      const div = document.createElement('div');
      div.className = `terminal-line out-${type}`;
      div.textContent = text;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }

    clearTerminal() {
      const out = document.getElementById('terminalOutput');
      if (out) out.innerHTML = '';
    }

    highlightVisualTab(label) {
      const tabBtn = document.getElementById('tab-visual-btn');
      const badge = document.getElementById('visualTabBadge');

      if (badge) {
        badge.textContent = label || 'Tersedia';
        badge.classList.remove('d-none');
      }

      // Auto switch to visual tab
      this.activateTab('tab-visual-btn');
    }

    activateTab(tabBtnId) {
      const tabBtn = document.getElementById(tabBtnId);
      if (tabBtn) {
        const bsTab = bootstrap.Tab.getOrCreateInstance(tabBtn);
        bsTab.show();
      }
    }

    setTheme(themeName) {
      this.currentTheme = (themeName === 'dark') ? 'dark' : 'light';
      localStorage.setItem('neuron_editor_theme', this.currentTheme);

      const isDark = (this.currentTheme === 'dark');
      document.body.classList.toggle('dark-theme', isDark);

      if (this.editor) {
        if (isDark) {
          this.editor.setTheme('ace/theme/tomorrow_night');
        } else {
          this.editor.setTheme('ace/theme/chrome');
        }
      }

      const icon = document.getElementById('themeToggleIcon');
      if (icon) {
        icon.className = isDark ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill text-dark';
      }

      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) {
        const dict = this.getDict();
        themeBtn.title = isDark ? (dict.themeLight || 'Mode Terang') : (dict.themeDark || 'Mode Gelap');
      }
    }

    toggleTheme() {
      const nextTheme = (this.currentTheme === 'dark') ? 'light' : 'dark';
      this.setTheme(nextTheme);
    }

    initApiKeyModal() {
      const keyInput = document.getElementById('apiKeyModalInput');
      const providerSelect = document.getElementById('aiProviderSelect');
      const pasteBtn = document.getElementById('pasteApiKeyBtn');
      const saveBtn = document.getElementById('saveApiKeyModalBtn');
      const clearBtn = document.getElementById('clearApiKeyModalBtn');
      const toggleVisBtn = document.getElementById('toggleApiKeyModalVisBtn');
      const toggleVisIcon = document.getElementById('toggleApiKeyModalVisIcon');
      const statusBadge = document.getElementById('apiKeyStatusBadge');
      const portalLink = document.getElementById('apiKeyPortalLink');
      const portalText = document.getElementById('apiKeyPortalText');

      const savedKey = localStorage.getItem('neuron_ai_key_local') || '';
      const savedProvider = localStorage.getItem('neuron_ai_model') || 'gemini-2.5-flash';

      if (keyInput) keyInput.value = savedKey;
      if (providerSelect) providerSelect.value = savedProvider;

      const updateStatusUI = () => {
        const hasKey = Boolean(keyInput && keyInput.value.trim());
        if (statusBadge) {
          if (hasKey) {
            statusBadge.className = 'badge bg-success bg-opacity-25 text-success fw-bold';
            statusBadge.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Terhubung';
          } else {
            statusBadge.className = 'badge bg-secondary bg-opacity-25 text-secondary';
            statusBadge.textContent = 'Belum Terhubung';
          }
        }
        if (clearBtn) {
          clearBtn.classList.toggle('d-none', !hasKey);
        }
      };
      updateStatusUI();

      const updateProviderHelp = () => {
        const prov = providerSelect ? providerSelect.value : 'gemini-2.5-flash';
        if (portalLink && portalText) {
          if (prov.includes('openai')) {
            portalLink.href = 'https://platform.openai.com/api-keys';
            portalText.textContent = 'Buka OpenAI API Keys';
            if (keyInput) keyInput.placeholder = 'Tempel OpenAI Key (sk-proj-...)';
          } else if (prov.includes('claude')) {
            portalLink.href = 'https://console.anthropic.com/settings/keys';
            portalText.textContent = 'Buka Anthropic Console';
            if (keyInput) keyInput.placeholder = 'Tempel Claude Key (sk-ant-...)';
          } else if (prov.includes('deepseek')) {
            portalLink.href = 'https://platform.deepseek.com/api_keys';
            portalText.textContent = 'Buka DeepSeek Platform';
            if (keyInput) keyInput.placeholder = 'Tempel DeepSeek Key (sk-...)';
          } else {
            portalLink.href = 'https://aistudio.google.com/app/api-keys';
            portalText.textContent = 'Dapatkan Gemini API Key Gratis';
            if (keyInput) keyInput.placeholder = 'Tempel Gemini API Key (AIzaSy...)';
          }
        }
      };
      if (providerSelect) {
        providerSelect.onchange = updateProviderHelp;
        updateProviderHelp();
      }

      if (pasteBtn && keyInput) {
        pasteBtn.onclick = async () => {
          try {
            const clip = await navigator.clipboard.readText();
            if (clip) {
              keyInput.value = clip.trim();
              updateStatusUI();
            }
          } catch (_e) {
            keyInput.focus();
          }
        };
      }

      if (toggleVisBtn && keyInput && toggleVisIcon) {
        toggleVisBtn.onclick = () => {
          if (keyInput.type === 'password') {
            keyInput.type = 'text';
            toggleVisIcon.className = 'bi bi-eye';
          } else {
            keyInput.type = 'password';
            toggleVisIcon.className = 'bi bi-eye-slash';
          }
        };
      }

      if (clearBtn && keyInput) {
        clearBtn.onclick = () => {
          keyInput.value = '';
          localStorage.removeItem('neuron_ai_key_local');
          updateStatusUI();
        };
      }

      if (saveBtn && keyInput) {
        saveBtn.onclick = () => {
          const val = keyInput.value.trim();
          const prov = providerSelect ? providerSelect.value : 'gemini-2.5-flash';
          localStorage.setItem('neuron_ai_key_local', val);
          localStorage.setItem('neuron_ai_model', prov);

          updateStatusUI();
          const origHtml = saveBtn.innerHTML;
          saveBtn.innerHTML = '<i class="bi bi-check2 me-1"></i> Tersimpan!';
          saveBtn.classList.add('btn-success');
          setTimeout(() => {
            saveBtn.innerHTML = origHtml;
            saveBtn.classList.remove('btn-success');
            const modalEl = document.getElementById('apiKeyModal');
            if (modalEl) {
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
          }, 800);
        };
      }
    }

    handleDownload() {
      const code = this.editor.getValue();
      const extMap = {
        php: 'php',
        python: 'py',
        javascript: 'js',
        typescript: 'ts',
        html: 'html',
        sql: 'sql',
        cpp: 'cpp',
        csharp: 'cs',
        ruby: 'rb',
        json: 'json'
      };

      const ext = extMap[this.currentLang] || 'txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neuron-code.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }

    renderSnippetMenu() {
      const container = document.getElementById('snippetsListContainer');
      if (!container) return;

      container.innerHTML = '';

      const categoryMeta = {
        visual3d: { title: 'Visualisasi 3D WebGL (Three.js)', icon: 'bi-box', color: '#8b5cf6' },
        visual2d: { title: 'Visualisasi 2D Canvas (Matematika)', icon: 'bi-bezier2', color: '#10b981' },
        chart: { title: 'Grafik Interaktif & Data Analytics', icon: 'bi-bar-chart-line-fill', color: '#f59e0b' },
        animation: { title: 'Animasi Modern & Glassmorphism', icon: 'bi-play-circle-fill', color: '#ec4899' },
        matlab: { title: 'MATLAB (Aljabar Linier & Sinyal)', icon: 'bi-calculator', color: '#ea580c' },
        python: { title: 'Python Dasar & Struktur Data', icon: 'bi-filetype-py', color: '#0ea5e9' },
        php: { title: 'PHP Pemrograman Web Backend', icon: 'bi-filetype-php', color: '#6366f1' },
        javascript: { title: 'JavaScript Modern', icon: 'bi-filetype-js', color: '#eab308' },
        html: { title: 'HTML5 & Desain Web', icon: 'bi-filetype-html', color: '#ea580c' },
        sql: { title: 'SQL & Basis Data', icon: 'bi-database-fill', color: '#06b6d4' }
      };

      Object.keys(SNIPPETS).forEach(langKey => {
        const list = SNIPPETS[langKey];
        const meta = categoryMeta[langKey] || { title: langKey.toUpperCase(), icon: 'bi-code-square', color: '#ea580c' };
        const section = document.createElement('div');
        section.className = 'mb-4';

        section.innerHTML = `
          <div class="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-10">
            <span class="badge rounded-circle p-1.5 d-inline-flex align-items-center justify-content-center" style="background: ${meta.color}20; color: ${meta.color}; width: 28px; height: 28px;">
              <i class="bi ${meta.icon} fs-6"></i>
            </span>
            <h6 class="fw-bold small text-uppercase m-0" style="color: var(--neuron-text-primary); letter-spacing: 0.5px;">
              ${meta.title}
            </h6>
          </div>
          <div class="d-flex flex-column gap-2">
            ${list.map((it, idx) => `
              <button type="button" class="btn btn-sm text-start p-3 rounded-4 shadow-sm hover-glow-snippet" data-lang="${langKey}" data-idx="${idx}" style="background: var(--neuron-card-bg); border: 1.5px solid var(--neuron-card-border); transition: all 0.2s ease;">
                <div class="fw-bold d-flex align-items-center justify-content-between mb-1" style="color: var(--neuron-text-primary);">
                  <span>${it.title}</span>
                  <i class="bi bi-chevron-right text-secondary small"></i>
                </div>
                <div class="small font-monospace text-truncate" style="color: var(--neuron-text-secondary); font-size: 0.78rem;">${it.code.split('\n')[0].substring(0, 80)}</div>
              </button>
            `).join('')}
          </div>
        `;

        container.appendChild(section);
      });

      // Bind click
      container.querySelectorAll('.hover-glow-snippet').forEach(btn => {
        btn.onclick = () => {
          const lk = btn.getAttribute('data-lang');
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const snippet = SNIPPETS[lk][idx];
          if (snippet) {
            this.editor.setValue(snippet.code, -1);
            NeuronDetector.resetToAuto(snippet.code);
            // Close modal if open
            const modalEl = document.getElementById('snippetModal');
            if (modalEl) {
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
          }
        };
      });
    }

    loadInitialSnippet() {
      const defaultSnippet = SNIPPETS.php[0].code;
      this.editor.setValue(defaultSnippet, -1);
      NeuronDetector.analyze(defaultSnippet, true);
    }

    applyI18n() {
      const lang = localStorage.getItem('neuron_ai_lang') || 'Indonesia';
      const dict = i18n[lang] || i18n.Indonesia;

      document.documentElement.lang = (lang === 'English') ? 'en' : 'id';

      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      setText('brandSubtitle', dict.brandSub);
      setText('btnExecuteText', dict.btnRun);
      setText('btnAiDebugText', dict.btnAiDebug);
      setText('btnSnippetsText', dict.btnSnippets);
      setText('btnCopyText', dict.btnCopy);
      setText('btnDownloadText', dict.btnDownload);
      setText('btnClearText', dict.btnClear);
      setText('tabTerminalText', dict.tabTerminal);
      setText('tabVisualText', dict.tabVisual);
      setText('tabAiDebugText', dict.tabAiDebug);
      setText('autoDetectLabel', dict.autoDetectBadge);

      // Flag active states
      const idFlag = document.getElementById('flagBtnId');
      const enFlag = document.getElementById('flagBtnEn');
      if (idFlag && enFlag) {
        idFlag.classList.toggle('active', lang !== 'English');
        enFlag.classList.toggle('active', lang === 'English');
      }
    }

    getDict() {
      const lang = localStorage.getItem('neuron_ai_lang') || 'Indonesia';
      return i18n[lang] || i18n.Indonesia;
    }
  }

  window.EditorApp = new EditorApp();

  document.addEventListener('DOMContentLoaded', () => {
    window.EditorApp.init();
  });

  window.setEditorLanguage = function (lang) {
    localStorage.setItem('neuron_ai_lang', lang);
    window.EditorApp.applyI18n();
  };
})(window);

