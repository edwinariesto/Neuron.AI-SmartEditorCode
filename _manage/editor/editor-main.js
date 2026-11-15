/**
 * Neuron.AI — Unified Editor Main Orchestrator
 * File: _manage/editor/editor-main.js
 * 
 * Orchestrates Ace Editor, Auto-Detector, Runner, Visualizer, AI Debugger, and UI.
 */

(function (window) {
  'use strict';

  // Global SweetAlert2 Bridge for Neuron.AI Soft Glassmorphic Aesthetic
  window.NeuronSwal = {
    isDark() {
      return document.body.classList.contains('dark-theme');
    },
    baseConfig() {
      const dark = this.isDark();
      return {
        background: dark ? '#0f172a' : '#ffffff',
        color: dark ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#f97316',
        cancelButtonColor: dark ? '#334155' : '#94a3b8',
        customClass: {
          popup: 'neuron-swal-popup' + (dark ? ' neuron-swal-dark' : ''),
          title: 'neuron-swal-title',
          htmlContainer: 'neuron-swal-html',
          confirmButton: 'neuron-swal-confirm-btn',
          cancelButton: 'neuron-swal-cancel-btn'
        }
      };
    },
    alert(opts) {
      if (typeof Swal === 'undefined') {
        alert(opts.text || opts.title || '');
        return Promise.resolve();
      }
      return Swal.fire({
        ...this.baseConfig(),
        icon: opts.icon || 'info',
        title: opts.title || '',
        html: opts.html || opts.text || '',
        confirmButtonText: opts.confirmButtonText || 'OK'
      });
    },
    confirm(opts) {
      if (typeof Swal === 'undefined') {
        const ok = confirm(opts.text || opts.title || '');
        return Promise.resolve({ isConfirmed: ok });
      }
      return Swal.fire({
        ...this.baseConfig(),
        icon: opts.icon || 'warning',
        title: opts.title || '',
        html: opts.html || opts.text || '',
        showCancelButton: true,
        confirmButtonText: opts.confirmButtonText || 'Ya, Lanjutkan',
        cancelButtonText: opts.cancelButtonText || 'Batal',
        reverseButtons: true
      });
    },
    toast(opts) {
      if (typeof Swal === 'undefined') return;
      const dark = this.isDark();
      return Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: opts.timer || 2400,
        timerProgressBar: true,
        background: dark ? '#0f172a' : '#ffffff',
        color: dark ? '#f8fafc' : '#0f172a',
        icon: opts.icon || 'success',
        title: opts.title || '',
        customClass: {
          popup: 'neuron-swal-toast' + (dark ? ' neuron-swal-dark' : '')
        }
      });
    }
  };

  // Automatic AI Model Failover when Quota (429) or Server Spike (503) occurs
  window.switchGeminiFallbackModel = function(reason = 'quota') {
    const curModel = localStorage.getItem('neuron_ai_model') || 'gemini-3.5-flash';
    let nextModel = 'gemini-3.5-flash-lite';
    let nextName = 'Google Gemini 3.5 Flash-Lite';

    if (curModel === 'gemini-3.5-flash-lite') {
      nextModel = 'gemini-3.5-flash';
      nextName = 'Google Gemini 3.5 Flash';
    } else if (curModel === 'gemini-3.8-flash') {
      nextModel = 'gemini-3.5-flash';
      nextName = 'Google Gemini 3.5 Flash';
    }

    localStorage.setItem('neuron_ai_model', nextModel);

    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect) providerSelect.value = nextModel;

    if (typeof window.updateCustomAiDropdownUI === 'function') {
      window.updateCustomAiDropdownUI(nextModel);
    }

    const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
    const msg = (reason === '503' || reason === 'spike')
      ? (isEn
          ? `Google Gemini server for <code>${curModel}</code> is busy (High Demand Spike). Automatically switched to <strong>${nextName}</strong>.`
          : `Server Google untuk model <code>${curModel}</code> sedang mengalami antrean padat. Model AI otomatis dialihkan ke <strong>${nextName}</strong> agar proses Anda tetap lancar.`)
      : (isEn
          ? `Free quota limit for <code>${curModel}</code> reached (HTTP 429). Automatically switched to <strong>${nextName}</strong>.`
          : `Batas kuota gratis model <code>${curModel}</code> telah tercapai (HTTP 429). Sistem otomatis mengalihkan model ke <strong>${nextName}</strong>.`);

    if (window.NeuronSwal) {
      window.NeuronSwal.alert({
        icon: 'warning',
        title: isEn ? 'AI Model Switched' : 'Peralihan Model AI Otomatis',
        html: msg
      });
    }
    return nextModel;
  };

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

  // i18n Dictionary (Comprehensive Indonesian & English support)
  const i18n = {
    Indonesia: {
      brandSub: 'Tutor Coding & Peningkat Beban Kognitif berbasis Generative A.I',
      btnRun: 'Jalankan Kode',
      btnAiDebug: 'AI Debug & Periksa',
      btnSnippets: 'Template & Contoh',
      btnCopy: 'Salin',
      btnDownload: 'Unduh',
      btnClear: 'Bersihkan',
      btnApiKey: 'API Key',
      tabTerminal: 'Konsol Terminal',
      tabTerminalMobile: 'Konsol',
      tabVisual: 'Visualisasi & Media',
      tabVisualMobile: 'Visual',
      tabAiDebug: 'Hasil Evaluasi AI',
      tabAiDebugMobile: 'Evaluasi AI',
      autoDetectBadge: 'Deteksi Otomatis:',
      autoDetectTitle: 'Bahasa terdeteksi otomatis. Klik untuk mengganti secara manual jika perlu.',
      detectModeHeader: 'MODE DETEKSI',
      autoDetectMenuItem: 'Otomatis (Rekomendasi)',
      manualSelectHeader: 'PILIH MANUAL',
      editorHeaderTitle: 'Editor Kode',
      charUnit: 'Karakter',
      cursorLineLabel: 'Baris ',
      cursorColLabel: ', Kolom ',
      readyMsg: 'Terminal siap. Tulis kode lalu klik "Jalankan Kode" atau "AI Debug".',
      themeToggleTitle: 'Ganti Tema Editor (Gelap / Terang)',
      themeDark: 'Mode Gelap',
      themeLight: 'Mode Terang',
      
      // Toolbar Tooltips
      titleRun: 'Jalankan Kode (Ctrl+Enter)',
      titleAiDebug: 'AI Debug & Periksa Kode',
      titleSnippets: 'Template & Contoh Kode',
      titleCopy: 'Salin Kode ke Clipboard',
      titleDownload: 'Unduh File Kode',
      titleClear: 'Bersihkan Editor dan Terminal',
      titleApiKey: 'Pengaturan AI Provider & API Key',

      // Terminal & Placeholders
      terminalReadyMsg: '[Neuron.AI Runner Siap] Tulis kode Anda di sebelah kiri, lalu klik "Jalankan Kode" untuk melihat output.',
      terminalErrorPrompt: 'Ingin tahu mengapa baris kode ini error? Periksa baris demi baris secara awam.',
      terminalErrorBtn: 'Periksa dengan AI',
      visPlaceholderTitle: 'Visualisasi Gambar, Tabel, 2D & 3D',
      visPlaceholderDesc: 'Panel ini secara otomatis menampilkan hasil eksekusi dalam bentuk citra/gambar (Base64/SVG), tabel data interaktif, visual grafis 2D Canvas, 3D WebGL (Three.js), atau pratinjau halaman web HTML live.',
      aiDebugPlaceholderTitle: 'Deteksi Error & Audit Baris demi Baris',
      aiDebugPlaceholderDesc: 'Klik tombol <strong>"AI Debug & Periksa"</strong> di atas. AI akan membaca kode Anda baris demi baris, menemukan kesalahan sintaks/logika, dan memberikan saran perbaikan dalam bahasa awam.',

      // Snippets Modal
      snippetModalTitle: 'Template & Contoh Kode Siap Pakai',
      snippetModalDesc: 'Pilih salah satu contoh program di bawah ini untuk langsung dimuat ke dalam editor. Bahasa akan terdeteksi otomatis!',

      // API Key Modal
      modalApiKeyTitle: 'Konfigurasi AI Provider & API Key',
      modalApiKeyDesc: 'Pilih model AI dan tempelkan API Key Anda untuk mengaktifkan AI Runtime Simulation (menjalankan segala bahasa seperti MATLAB, Java, C++) dan audit kode online. Jika belum diisi, sistem otomatis menggunakan Audit Koding Lokal Cerdas.',
      lblAiProvider: 'PILIH PROVIDER / MODEL AI',
      aiModelSearchPlaceholder: 'Cari provider atau model AI...',
      lblApiKeyInput: 'TEMPEL API KEY',
      pasteApiKeyBtnText: 'Tempel dari Clipboard',
      lblApiKeyStored: 'Tersimpan lokal di browser (localStorage)',
      statusConnected: 'Terhubung',
      statusNotConnected: 'Belum Terhubung',
      clearApiKeyBtnText: 'Hapus',
      saveApiKeyBtnText: 'Simpan',
      portalGemini: 'Dapatkan Gemini API Key Gratis',
      placeholderGemini: 'Tempel Gemini API Key (AQ... atau AIzaSy...)',
      modelDescGeminiFlash: 'Gemini 3.5 Flash — Tercepat & Rekomendasi Utama',
      modelDescGeminiLite: 'Gemini 3.5 Flash-Lite — Super Cepat & Hemat Kuota',
      modelDescGeminiPro: 'Gemini 3.8 Flash — Generasi Terkini',

      // Dialogs & Toasts
      clearConfirmTitle: 'Bersihkan Editor & Terminal?',
      clearConfirmHtml: 'Semua kode yang Anda tulis dan riwayat log terminal akan dikosongkan. Anda yakin ingin melanjutkan?',
      clearConfirmBtn: 'Ya, Bersihkan',
      clearCancelBtn: 'Batal',
      clearToast: 'Editor & Terminal telah dibersihkan!',
      copyToast: 'Kode berhasil disalin ke clipboard!',
      keySavedToast: 'API Key berhasil disimpan!',
      keyRemovedToast: 'API Key berhasil dihapus!',
      emptyCodeTitle: 'Kode Masih Kosong',
      emptyCodeRunHtml: 'Tuliskan kode program terlebih dahulu di editor sebelum dijalankan.',
      emptyCodeDebugHtml: 'Tuliskan kode terlebih dahulu untuk diaudit dan diperiksa oleh AI.',

      // Floating Bottom Navigation Labels & Tooltips
      bnavAiDebug: 'Cek AI',
      bnavSnippets: 'Template',
      bnavRun: 'RUN',
      bnavDownload: 'Unduh',
      bnavApiKey: 'API Key',
      bnavAiTitle: 'Cek AI / Evaluasi Kode',
      bnavSnippetsTitle: 'Template & Contoh Kode',
      bnavRunTitle: 'Jalankan Kode (Run)',
      bnavDlTitle: 'Unduh File Kode',
      bnavApiKeyTitle: 'Pengaturan AI Provider & API Key'
    },
    English: {
      brandSub: 'Coding Tutor & Cognitive Load Booster powered by Generative A.I',
      btnRun: 'Run Code',
      btnAiDebug: 'AI Debug & Audit',
      btnSnippets: 'Templates & Snippets',
      btnCopy: 'Copy',
      btnDownload: 'Download',
      btnClear: 'Clear',
      btnApiKey: 'API Key',
      tabTerminal: 'Console Terminal',
      tabTerminalMobile: 'Console',
      tabVisual: 'Visual & Media',
      tabVisualMobile: 'Visual',
      tabAiDebug: 'AI Audit Results',
      tabAiDebugMobile: 'AI Audit',
      autoDetectBadge: 'Auto Detected:',
      autoDetectTitle: 'Language detected automatically. Click to select manually if needed.',
      detectModeHeader: 'DETECTION MODE',
      autoDetectMenuItem: 'Automatic (Recommended)',
      manualSelectHeader: 'SELECT MANUALLY',
      editorHeaderTitle: 'Code Editor',
      charUnit: 'Characters',
      cursorLineLabel: 'Line ',
      cursorColLabel: ', Col ',
      readyMsg: 'Terminal ready. Write code and click "Run Code" or "AI Debug".',
      themeToggleTitle: 'Switch Editor Theme (Dark / Light)',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',

      // Toolbar Tooltips
      titleRun: 'Run Code (Ctrl+Enter)',
      titleAiDebug: 'AI Debug & Audit Code',
      titleSnippets: 'Templates & Code Examples',
      titleCopy: 'Copy Code to Clipboard',
      titleDownload: 'Download Code File',
      titleClear: 'Clear Editor and Terminal',
      titleApiKey: 'AI Provider & API Key Settings',

      // Terminal & Placeholders
      terminalReadyMsg: '[Neuron.AI Runner Ready] Write your code on the left, then click "Run Code" to view execution output.',
      terminalErrorPrompt: 'Want to know why this line failed? Inspect line by line in plain language.',
      terminalErrorBtn: 'Inspect with AI',
      visPlaceholderTitle: 'Image, Table, 2D & 3D Visualization',
      visPlaceholderDesc: 'This panel automatically presents runtime output as images (Base64/SVG), interactive data tables, 2D Canvas graphics, 3D WebGL (Three.js), or live HTML web previews.',
      aiDebugPlaceholderTitle: 'Error Detection & Line-by-Line Code Audit',
      aiDebugPlaceholderDesc: 'Click the <strong>"AI Debug & Audit"</strong> button above. AI will inspect your code line by line, detect syntax and logic bugs, and provide plain-language suggestions.',

      // Snippets Modal
      snippetModalTitle: 'Templates & Ready-to-Use Code Snippets',
      snippetModalDesc: 'Select any sample program below to load it into the editor. The language will be auto-detected!',

      // API Key Modal
      modalApiKeyTitle: 'AI Provider & API Key Configuration',
      modalApiKeyDesc: 'Select an AI model and paste your API Key to enable AI Runtime Simulation (running any languages like MATLAB, Java, C++) and online code audit. If empty, system automatically uses Smart Local Code Auditor.',
      lblAiProvider: 'SELECT AI PROVIDER / MODEL',
      aiModelSearchPlaceholder: 'Search AI provider or model...',
      lblApiKeyInput: 'PASTE API KEY',
      pasteApiKeyBtnText: 'Paste from Clipboard',
      lblApiKeyStored: 'Stored locally in browser (localStorage)',
      statusConnected: 'Connected',
      statusNotConnected: 'Not Connected',
      clearApiKeyBtnText: 'Remove',
      saveApiKeyBtnText: 'Save',
      portalGemini: 'Get Free Gemini API Key',
      placeholderGemini: 'Paste Gemini API Key (AQ... or AIzaSy...)',
      modelDescGeminiFlash: 'Gemini 3.5 Flash — Fastest & Recommended',
      modelDescGeminiLite: 'Gemini 3.5 Flash-Lite — Ultra Fast & Quota Efficient',
      modelDescGeminiPro: 'Gemini 3.8 Flash — Latest Generation',

      // Dialogs & Toasts
      clearConfirmTitle: 'Clear Editor & Terminal?',
      clearConfirmHtml: 'All code in the editor and terminal output history will be wiped. Do you want to proceed?',
      clearConfirmBtn: 'Yes, Clear All',
      clearCancelBtn: 'Cancel',
      clearToast: 'Editor & Terminal cleared!',
      copyToast: 'Code copied to clipboard!',
      keySavedToast: 'API Key saved successfully!',
      keyRemovedToast: 'API Key removed!',
      emptyCodeTitle: 'Editor is Empty',
      emptyCodeRunHtml: 'Please write or paste code in the editor first to run.',
      emptyCodeDebugHtml: 'Please write or paste code in the editor first to inspect errors.',

      // Floating Bottom Navigation Labels & Tooltips
      bnavAiDebug: 'AI Audit',
      bnavSnippets: 'Templates',
      bnavRun: 'RUN',
      bnavDownload: 'Download',
      bnavApiKey: 'API Key',
      bnavAiTitle: 'AI Audit / Inspect Code',
      bnavSnippetsTitle: 'Templates & Code Examples',
      bnavRunTitle: 'Run Code',
      bnavDlTitle: 'Download Code File',
      bnavApiKeyTitle: 'AI Provider & API Key Settings'
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

      // Update cursor position (Rapi, Sejajar, & Anti-Tumpang-Tindih pada Mobile)
      this.editor.selection.on('changeCursor', () => {
        const pos = this.editor.getCursorPosition();
        const el = document.getElementById('cursorPosInfo');
        if (el) {
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          el.innerHTML = `<i class="bi bi-cursor-fill me-1 text-secondary flex-shrink-0"></i><span class="d-none d-sm-inline">${isEn ? 'Line ' : 'Baris '}</span><span>${pos.row + 1}</span><span class="d-none d-sm-inline">, ${isEn ? 'Col ' : 'Kolom '}</span><span class="d-inline d-sm-none">:</span><span>${pos.column + 1}</span>`;
        }
      });

      // Update char count & trigger auto-detect (Rapi, Sejajar, & Anti-Tumpang-Tindih pada Mobile)
      this.editor.session.on('change', () => {
        const val = this.editor.getValue();
        const charEl = document.getElementById('charCountInfo');
        if (charEl) {
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          charEl.innerHTML = `<i class="bi bi-fonts me-1 text-secondary flex-shrink-0"></i><span>${val.length}</span><span class="badge-unit d-none d-sm-inline ms-1">${isEn ? 'Chars' : 'Karakter'}</span>`;
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

      // Hide visual dot badge when tab is activated
      const visualTabBtn = document.getElementById('tab-visual-btn');
      if (visualTabBtn) {
        visualTabBtn.addEventListener('shown.bs.tab', () => {
          const badge = document.getElementById('visualTabBadge');
          if (badge) badge.classList.add('d-none');
        });
      }
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
        copyBtn.onclick = async () => {
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          const code = this.editor.getValue();
          if (!code.trim()) {
            NeuronSwal.alert({
              icon: 'info',
              title: isEn ? 'Editor is Empty' : 'Kode Masih Kosong',
              html: isEn ? 'There is no code in the editor to copy.' : 'Belum ada kode di editor yang bisa disalin.'
            });
            return;
          }
          await navigator.clipboard.writeText(code);
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="bi bi-check2 text-success me-1"></i> ' + (isEn ? 'Copied!' : 'Tersalin!');
          NeuronSwal.toast({
            icon: 'success',
            title: isEn ? 'Code copied to clipboard!' : 'Kode berhasil disalin ke clipboard!'
          });
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
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          NeuronSwal.confirm({
            title: isEn ? 'Clear Editor & Terminal?' : 'Bersihkan Editor & Terminal?',
            html: isEn
              ? 'All code in the editor and terminal output history will be wiped. Do you want to proceed?'
              : 'Kode di editor dan riwayat output terminal akan dihapus bersih. Anda yakin ingin melanjutkan?',
            confirmButtonText: isEn ? 'Yes, Clear All' : 'Ya, Bersihkan',
            cancelButtonText: isEn ? 'Cancel' : 'Batal',
            icon: 'warning'
          }).then((res) => {
            if (res && res.isConfirmed) {
              this.editor.setValue('', -1);
              this.clearTerminal();
              NeuronVisualizer.clear();
              NeuronDebugger.clear();
              NeuronSwal.toast({
                icon: 'success',
                title: isEn ? 'Editor & Terminal Cleared' : 'Editor & Terminal Dibersihkan'
              });
            }
          });
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

      // Floating Bottom Navigation Actions (Tablet & Mobile < 992px)
      const bnavRunBtn = document.getElementById('bnavRunBtn');
      if (bnavRunBtn) {
        bnavRunBtn.onclick = () => this.handleRun();
      }

      const bnavAiBtn = document.getElementById('bnavAiBtn');
      if (bnavAiBtn) {
        bnavAiBtn.onclick = () => this.handleAiDebug();
      }

      const bnavDlBtn = document.getElementById('bnavDlBtn');
      if (bnavDlBtn) {
        bnavDlBtn.onclick = () => this.handleDownload();
      }

      // Sync active tab to bottom nav
      ['tab-terminal-btn', 'tab-visual-btn', 'tab-aidebug-btn'].forEach(id => {
        const tabEl = document.getElementById(id);
        if (tabEl) {
          tabEl.addEventListener('shown.bs.tab', () => {
            const bAi = document.getElementById('bnavAiBtn');
            if (bAi) bAi.classList.toggle('active', id === 'tab-aidebug-btn');
          });
        }
      });
    }

    async handleRun() {
      const code = this.editor.getValue().trim();
      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
      if (!code) {
        NeuronSwal.alert({
          icon: 'warning',
          title: isEn ? 'Editor is Empty' : 'Kode Masih Kosong',
          html: isEn ? 'Please write or paste code in the editor before running.' : 'Tuliskan atau tempel kode di editor terlebih dahulu sebelum dijalankan.'
        });
        return;
      }

      this.clearTerminal();
      this.logTerminal(isEn ? `[Starting execution of ${this.currentLang.toUpperCase()} code...]` : `[Memulai eksekusi kode ${this.currentLang.toUpperCase()}...]`, 'meta');

      // Switch to Console tab
      this.activateTab('tab-terminal-btn');

      const runBtn = document.getElementById('execBtn');
      const origHtml = runBtn ? runBtn.innerHTML : '';
      if (runBtn) {
        runBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> ${isEn ? 'Running...' : 'Menjalankan...'}`;
        runBtn.disabled = true;
      }

      // Update Floating Bottom Nav Run Button
      const bnavRunBtn = document.getElementById('bnavRunBtn');
      const bnavRunIcon = document.getElementById('bnavRunIcon');
      if (bnavRunBtn) {
        bnavRunBtn.disabled = true;
        if (bnavRunIcon) {
          bnavRunIcon.className = 'spinner-border spinner-border-sm text-light';
          bnavRunIcon.style.margin = '0';
        }
      }

      try {
        const result = await NeuronRunner.execute(code, this.currentLang);
        result.rawCode = code;

        if (result.status === 'error') {
          this.lastError = result.output;
          this.logTerminal(result.output, 'err');
          this.logTerminal(isEn ? `[Execution Failed — Duration: ${result.duration || 0} ms]` : `[Gagal dieksekusi — Durasi: ${result.duration || 0} ms]`, 'meta');

          // Render one-click AI Debug suggestion card in terminal
          this.renderErrorPromptInTerminal(result.output);
        } else {
          this.lastError = '';
          this.logTerminal(result.output, 'ok');
          this.logTerminal(isEn ? `[Execution Successful — Duration: ${result.duration || 0} ms]` : `[Eksekusi Berhasil — Durasi: ${result.duration || 0} ms]`, 'meta');

          // Process rich visuals (Images, Tables, 2D/3D, HTML)
          const visResult = NeuronVisualizer.processOutput(result);
          if (visResult.hasVisual) {
            this.highlightVisualTab(visResult.label);
          }
        }
      } catch (err) {
        this.logTerminal(isEn ? `[Error]: ${err.message || err}` : `[Kesalahan]: ${err.message || err}`, 'err');
      } finally {
        if (runBtn) {
          runBtn.innerHTML = origHtml;
          runBtn.disabled = false;
        }
        if (bnavRunBtn) {
          bnavRunBtn.disabled = false;
          if (bnavRunIcon) {
            bnavRunIcon.className = 'bi bi-play-fill';
            bnavRunIcon.style.marginLeft = '2px';
          }
        }
      }
    }

    async handleAiDebug() {
      const code = this.editor.getValue().trim();
      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
      if (!code) {
        NeuronSwal.alert({
          icon: 'warning',
          title: isEn ? 'Editor is Empty' : 'Kode Masih Kosong',
          html: isEn ? 'Please write or paste code in the editor first to inspect errors.' : 'Tuliskan kode terlebih dahulu untuk diaudit dan diperiksa oleh AI.'
        });
        return;
      }

      this.activateTab('tab-aidebug-btn');
      await NeuronDebugger.auditCode(code, this.currentLang, this.lastError);
    }

    renderErrorPromptInTerminal(errorMsg) {
      const out = document.getElementById('terminalOutput');
      if (!out) return;

      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
      const promptDiv = document.createElement('div');
      promptDiv.className = 'mt-3 p-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-50 d-flex align-items-center justify-content-between gap-2';

      promptDiv.innerHTML = `
        <div class="small text-warning">
          <i class="bi bi-lightbulb-fill me-1"></i> ${isEn ? 'Want to know why this line failed? Inspect line by line in plain language.' : 'Ingin tahu mengapa baris kode ini error? Periksa baris demi baris secara awam.'}
        </div>
        <button class="btn btn-sm btn-warning text-dark fw-bold px-3 py-1 text-nowrap" id="terminalAiDebugTrigger">
          <i class="bi bi-robot me-1"></i> ${isEn ? 'Inspect with AI' : 'Periksa dengan AI'}
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
        badge.title = label || 'Visualisasi Tersedia';
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
      const bAi = document.getElementById('bnavAiBtn');
      if (bAi) bAi.classList.toggle('active', tabBtnId === 'tab-aidebug-btn');
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
        icon.className = isDark ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill text-info';
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
      const savedProvider = localStorage.getItem('neuron_ai_model') || 'gemini-3.5-flash';

      if (keyInput) keyInput.value = savedKey;
      if (providerSelect) providerSelect.value = savedProvider;

      const updateStatusUI = () => {
        const dict = this.getDict();
        const hasKey = Boolean(keyInput && keyInput.value.trim());
        if (statusBadge) {
          if (hasKey) {
            statusBadge.className = 'badge bg-success bg-opacity-25 text-success fw-bold';
            statusBadge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ${dict.statusConnected || 'Terhubung'}`;
          } else {
            statusBadge.className = 'badge bg-secondary bg-opacity-25 text-secondary';
            statusBadge.textContent = dict.statusNotConnected || 'Belum Terhubung';
          }
        }
        if (clearBtn) {
          clearBtn.classList.toggle('d-none', !hasKey);
        }
      };
      updateStatusUI();

      const updateProviderHelp = () => {
        const dict = this.getDict();
        const prov = providerSelect ? providerSelect.value : 'gemini-3.5-flash';
        if (portalLink && portalText) {
          portalLink.href = 'https://aistudio.google.com/app/api-keys';
          portalText.textContent = dict.portalGemini || 'Dapatkan Gemini API Key Gratis';
          if (keyInput) keyInput.placeholder = dict.placeholderGemini || 'Tempel Gemini API Key (AQ... atau AIzaSy...)';
        }
      };
      if (providerSelect) {
        providerSelect.onchange = updateProviderHelp;
        updateProviderHelp();
      }

      this.updateApiKeyModalUI = () => {
        updateStatusUI();
        updateProviderHelp();
      };

      // Custom Searchable Combobox with Rich Icons
      const searchInput = document.getElementById('aiModelSearchInput');
      const modelListContainer = document.getElementById('aiModelListContainer');
      const customAiDropdown = document.getElementById('customAiSelectDropdown');

      const updateCustomSelectUI = (val) => {
        const items = document.querySelectorAll('.ai-model-item');
        items.forEach((item) => {
          const isMatch = (item.dataset.value === val);
          item.classList.toggle('active', isMatch);
          const check = item.querySelector('.check-indicator');
          if (check) check.classList.toggle('d-none', !isMatch);
          if (isMatch) {
            const iconEl = document.getElementById('customAiSelectedIcon');
            const textEl = document.getElementById('customAiSelectedText');
            if (iconEl) {
              iconEl.style.background = item.dataset.iconBg || 'rgba(234, 88, 12, 0.15)';
              iconEl.style.color = item.dataset.iconColor || '#ea580c';
              iconEl.innerHTML = `<i class="bi ${item.dataset.icon || 'bi-stars'}"></i>`;
            }
            if (textEl) {
              textEl.textContent = item.dataset.label || val;
            }
          }
        });
      };
      window.updateCustomAiDropdownUI = updateCustomSelectUI;

      // Handle item click in custom combobox
      document.querySelectorAll('.ai-model-item').forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const val = item.dataset.value;
          if (providerSelect) {
            providerSelect.value = val;
            updateProviderHelp();
          }
          updateCustomSelectUI(val);
          localStorage.setItem('neuron_ai_model', val);

          const btn = document.getElementById('customAiSelectBtn');
          if (btn && window.bootstrap && window.bootstrap.Dropdown) {
            const dd = bootstrap.Dropdown.getInstance(btn) || new bootstrap.Dropdown(btn);
            if (dd) dd.hide();
          }
        });
      });

      // Real-time search filter for AI models
      if (searchInput && modelListContainer) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase().trim();
          const items = modelListContainer.querySelectorAll('.ai-model-item');
          let count = 0;
          items.forEach((item) => {
            const text = (item.textContent || '').toLowerCase();
            const val = (item.dataset.value || '').toLowerCase();
            const match = text.includes(q) || val.includes(q);
            item.style.setProperty('display', match ? 'flex' : 'none', 'important');
            if (match) count++;
          });
          let noRes = modelListContainer.querySelector('.no-models-msg');
          if (count === 0) {
            if (!noRes) {
              noRes = document.createElement('div');
              noRes.className = 'no-models-msg text-center text-secondary small py-3 font-monospace';
              modelListContainer.appendChild(noRes);
            }
            const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
            noRes.textContent = isEn ? 'No models match your search.' : 'Tidak ada model yang cocok.';
          } else if (noRes) {
            noRes.remove();
          }
        });
      }

      // Auto-focus search input when dropdown opens
      if (customAiDropdown && searchInput) {
        customAiDropdown.addEventListener('shown.bs.dropdown', () => {
          searchInput.focus();
        });
      }

      // Sync initial selection
      updateCustomSelectUI(savedProvider);

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
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          NeuronSwal.toast({
            icon: 'info',
            title: isEn ? 'API Key removed' : 'API Key berhasil dihapus'
          });
        };
      }

      if (saveBtn && keyInput) {
        saveBtn.onclick = () => {
          const val = keyInput.value.trim();
          const prov = providerSelect ? providerSelect.value : 'gemini-3.5-flash';
          localStorage.setItem('neuron_ai_key_local', val);
          localStorage.setItem('neuron_ai_model', prov);

          updateStatusUI();
          const origHtml = saveBtn.innerHTML;
          const dict = this.getDict();
          const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');
          saveBtn.innerHTML = `<i class="bi bi-check2 me-1"></i> ${dict.statusConnected ? 'Tersimpan!' : 'Saved!'}`;
          saveBtn.classList.add('btn-success');
          NeuronSwal.toast({
            icon: 'success',
            title: isEn ? 'AI Settings & Model Saved!' : 'Pengaturan API & Model AI Berhasil Disimpan!'
          });
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
      const isEn = (localStorage.getItem('neuron_ai_lang') === 'English');

      const categoryMeta = {
        visual3d: { title: isEn ? '3D WebGL Visualization (Three.js)' : 'Visualisasi 3D WebGL (Three.js)', icon: 'bi-box', color: '#8b5cf6' },
        visual2d: { title: isEn ? '2D Canvas Graphics (Math & Geometry)' : 'Visualisasi 2D Canvas (Matematika)', icon: 'bi-bezier2', color: '#10b981' },
        chart: { title: isEn ? 'Interactive Charts & Data Analytics' : 'Grafik Interaktif & Data Analytics', icon: 'bi-bar-chart-line-fill', color: '#f59e0b' },
        animation: { title: isEn ? 'Modern Animations & Glassmorphism' : 'Animasi Modern & Glassmorphism', icon: 'bi-play-circle-fill', color: '#ec4899' },
        matlab: { title: isEn ? 'MATLAB (Linear Algebra & Signals)' : 'MATLAB (Aljabar Linier & Sinyal)', icon: 'bi-calculator', color: '#ea580c' },
        python: { title: isEn ? 'Python Basics & Data Structures' : 'Python Dasar & Struktur Data', icon: 'bi-filetype-py', color: '#0ea5e9' },
        php: { title: isEn ? 'PHP Web Backend Programming' : 'PHP Pemrograman Web Backend', icon: 'bi-filetype-php', color: '#6366f1' },
        javascript: { title: isEn ? 'Modern JavaScript' : 'JavaScript Modern', icon: 'bi-filetype-js', color: '#eab308' },
        html: { title: isEn ? 'HTML5 & Web Layouts' : 'HTML5 & Desain Web', icon: 'bi-filetype-html', color: '#ea580c' },
        sql: { title: isEn ? 'SQL & Database Queries' : 'SQL & Basis Data', icon: 'bi-database-fill', color: '#06b6d4' }
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
      const isEn = (lang === 'English');

      document.documentElement.lang = isEn ? 'en' : 'id';

      const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el && text !== undefined) el.textContent = text;
      };

      const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el && html !== undefined) el.innerHTML = html;
      };

      const setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.setAttribute(attr, val);
      };

      // Header Brand & Subtitle
      setText('brandSubtitle', dict.brandSub);
      setText('editorHeaderTitle', dict.editorHeaderTitle);

      // Main Toolbar Buttons & Labels
      setText('btnExecuteText', dict.btnRun);
      setText('btnAiDebugText', dict.btnAiDebug);
      setText('btnSnippetsText', dict.btnSnippets);
      setText('btnCopyText', dict.btnCopy);
      setText('btnDownloadText', dict.btnDownload);
      setText('btnClearText', dict.btnClear);
      setText('btnApiKeyText', dict.btnApiKey);

      // Toolbar Tooltips / Titles
      setAttr('detectorPill', 'title', dict.autoDetectTitle);
      setAttr('execBtn', 'title', dict.titleRun);
      setAttr('aiDebugBtn', 'title', dict.titleAiDebug);
      setAttr('snippetsBtn', 'title', dict.titleSnippets);
      setAttr('copyBtn', 'title', dict.titleCopy);
      setAttr('dlBtn', 'title', dict.titleDownload);
      setAttr('clearBtn', 'title', dict.titleClear);
      setAttr('btnApiKeyToolbar', 'title', dict.titleApiKey);
      const isDark = (this.currentTheme === 'dark');
      setAttr('themeToggleBtn', 'title', isDark ? dict.themeLight : dict.themeDark);

      // Detection Menu Headers & Items
      setText('autoDetectLabel', dict.autoDetectBadge);
      setText('detectModeHeader', dict.detectModeHeader);
      setHtml('autoDetectMenuItem', `<i class="bi bi-magic me-2 text-warning"></i> ${dict.autoDetectMenuItem}`);
      setText('manualSelectHeader', dict.manualSelectHeader);

      // Editor Header Stats (Char count, Cursor line/col)
      setText('charCountUnit', dict.charUnit);
      setText('cursorLineLabel', dict.cursorLineLabel);
      setText('cursorColLabel', dict.cursorColLabel);

      // Tabs (Desktop & Mobile)
      setText('tabTerminalText', dict.tabTerminal);
      setText('tabTerminalMobile', dict.tabTerminalMobile);
      setAttr('tab-terminal-btn', 'title', dict.tabTerminal);

      setText('tabVisualText', dict.tabVisual);
      setText('tabVisualMobile', dict.tabVisualMobile);
      setAttr('tab-visual-btn', 'title', dict.tabVisual);

      setText('tabAiDebugText', dict.tabAiDebug);
      setText('tabAiDebugMobile', dict.tabAiDebugMobile);
      setAttr('tab-aidebug-btn', 'title', dict.tabAiDebug);

      // Terminal & Output Placeholders
      setText('terminalReadyLine', dict.terminalReadyMsg);
      setText('visPlaceholderTitle', dict.visPlaceholderTitle);
      setText('visPlaceholderDesc', dict.visPlaceholderDesc);
      setText('aiDebugPlaceholderTitle', dict.aiDebugPlaceholderTitle);
      setHtml('aiDebugPlaceholderDesc', dict.aiDebugPlaceholderDesc);

      // Snippets Modal
      setText('snippetModalLabel', dict.snippetModalTitle);
      setText('snippetModalDesc', dict.snippetModalDesc);

      // Modal API Key Elements
      setText('apiKeyModalLabel', dict.modalApiKeyTitle);
      setText('apiKeyModalDesc', dict.modalApiKeyDesc);
      setText('lblAiProvider', dict.lblAiProvider);
      const searchBox = document.getElementById('aiModelSearchInput');
      if (searchBox) searchBox.placeholder = dict.aiModelSearchPlaceholder;
      setText('lblApiKeyInput', dict.lblApiKeyInput);
      setText('pasteApiKeyBtnText', dict.pasteApiKeyBtnText);
      const storedBox = document.getElementById('lblApiKeyStored');
      if (storedBox) storedBox.innerHTML = `<i class="bi bi-shield-lock-fill text-success me-1"></i> ${dict.lblApiKeyStored}`;
      setText('clearApiKeyModalBtnText', dict.clearApiKeyBtnText);
      setText('saveApiKeyModalBtnText', dict.saveApiKeyBtnText);

      // Model Descriptions in Custom Combobox
      setText('modelDescGeminiFlash', dict.modelDescGeminiFlash);
      setText('modelDescGeminiLite', dict.modelDescGeminiLite);
      setText('modelDescGeminiPro', dict.modelDescGeminiPro);

      // Floating Bottom Navigation Labels & Titles
      setText('bottomNavAiLabel', dict.bnavAiDebug);
      setText('bottomNavSnippetsLabel', dict.bnavSnippets);
      setText('bottomNavRunLabel', dict.bnavRun);
      setText('bottomNavDlLabel', dict.bnavDownload);
      setText('bottomNavApiKeyLabel', dict.bnavApiKey);

      setAttr('bnavAiBtn', 'title', dict.titleAiDebug);
      setAttr('bnavSnippetsBtn', 'title', dict.titleSnippets);
      setAttr('bnavRunBtn', 'title', dict.titleRun);
      setAttr('bnavDlBtn', 'title', dict.titleDownload);
      setAttr('bnavKeyBtn', 'title', dict.titleApiKey);

      // Update provider portal & status
      if (typeof this.updateApiKeyModalUI === 'function') {
        this.updateApiKeyModalUI();
      }

      // Re-render snippets menu with localized titles
      this.renderSnippetMenu();

      // If AI debugger is in empty state, re-render its placeholder
      if (window.NeuronDebugger && (!window.NeuronDebugger.lastResult || document.getElementById('aiDebugOutput')?.querySelector('.display-4'))) {
        window.NeuronDebugger.renderEmptyState();
      }

      // Flag active states
      const idFlag = document.getElementById('flagBtnId');
      const enFlag = document.getElementById('flagBtnEn');
      if (idFlag && enFlag) {
        idFlag.classList.toggle('active', !isEn);
        enFlag.classList.toggle('active', isEn);
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

