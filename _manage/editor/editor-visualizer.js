/**
 * Neuron.AI — Rich Media & Multi-dimensional Visualizer Engine
 * File: _manage/editor/editor-visualizer.js
 * 
 * Renders Images, Data Tables, 2D Canvas, 3D WebGL (Three.js), and Embedded Web Views.
 */

(function (window) {
  'use strict';

  class NeuronVisualizer {
    constructor() {
      this.container = null;
      this.currentMode = null;
      this.threeJsLoaded = false;
      this.threeScene = null;
      this.threeRenderer = null;
      this.threeAnimId = null;
      this.zoomLevel = 1;
    }

    init(containerEl) {
      this.container = typeof containerEl === 'string' ? document.getElementById(containerEl) : containerEl;
    }

    clear() {
      if (this.threeAnimId) {
        cancelAnimationFrame(this.threeAnimId);
        this.threeAnimId = null;
      }
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.currentMode = null;
      this.zoomLevel = 1;
    }

    processOutput(runResult) {
      if (!this.container) return { hasVisual: false };

      const outText = runResult.output || '';
      const lang = (runResult.language || '').toLowerCase();

      // 1. Check for HTML document
      if (runResult.isHtmlDoc || lang === 'html' || /<!doctype\s+html>|<html\b/i.test(outText)) {
        this.renderHtmlPreview(runResult.htmlContent || outText);
        return { hasVisual: true, type: 'html', label: 'Web Preview' };
      }

      // 2. Check for Base64 image or SVG or Image URL
      const base64ImgMatch = outText.match(/data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+/i);
      if (base64ImgMatch) {
        this.renderImage(base64ImgMatch[0], 'Base64 Image');
        return { hasVisual: true, type: 'image', label: 'Gambar' };
      }

      const svgMatch = outText.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        this.renderSvg(svgMatch[0]);
        return { hasVisual: true, type: 'svg', label: 'Vektor SVG' };
      }

      const urlImgMatch = outText.match(/https?:\/\/[^\s"'<>]+\.(png|jpg|jpeg|gif|webp|svg)/i);
      if (urlImgMatch) {
        this.renderImage(urlImgMatch[0], 'URL Image');
        return { hasVisual: true, type: 'image', label: 'Gambar' };
      }

      // 3. Check for JSON Array of Objects (Table)
      if (runResult.isJsonData && Array.isArray(runResult.jsonData)) {
        this.renderTableFromJson(runResult.jsonData);
        return { hasVisual: true, type: 'table', label: 'Tabel Data' };
      }

      const jsonArrayMatch = outText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        try {
          const parsed = JSON.parse(jsonArrayMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
            this.renderTableFromJson(parsed);
            return { hasVisual: true, type: 'table', label: 'Tabel Data' };
          }
        } catch (e) {}
      }

      // 4. Check for 3D visual request / code cue
      if (/three\.js|webgl|mesh|geometry|3d/i.test(outText) || /new\s+THREE\./i.test(runResult.rawCode || '')) {
        this.render3DScene();
        return { hasVisual: true, type: '3d', label: 'Visual 3D' };
      }

      // 5. Check for 2D Canvas cue
      if (/canvas|ctx\.beginPath|getContext\(['"]2d['"]\)/i.test(outText) || /canvas/i.test(runResult.rawCode || '')) {
        this.render2DCanvas();
        return { hasVisual: true, type: '2d', label: 'Visual 2D' };
      }

      return { hasVisual: false };
    }

    renderImage(src, caption = 'Citra Visual') {
      this.clear();
      this.currentMode = 'image';

      const wrap = document.createElement('div');
      wrap.className = 'visual-media-box p-3 text-center d-flex flex-column align-items-center justify-content-center h-100';

      wrap.innerHTML = `
        <div class="visual-toolbar mb-3 d-flex align-items-center gap-2 bg-white shadow-sm px-3 py-1.5 rounded-pill border border-secondary border-opacity-25">
          <span class="badge bg-primary bg-opacity-90 px-2.5 py-1.5 rounded-pill"><i class="bi bi-image me-1"></i> ${caption}</span>
          <button class="btn btn-sm btn-outline-secondary border-0" id="visZoomIn" title="Perbesar"><i class="bi bi-zoom-in"></i></button>
          <button class="btn btn-sm btn-outline-secondary border-0" id="visZoomOut" title="Perkecil"><i class="bi bi-zoom-out"></i></button>
          <button class="btn btn-sm btn-outline-secondary border-0" id="visZoomReset" title="Reset"><i class="bi bi-arrow-counterclockwise"></i></button>
          <a href="${src}" download="neuron-visual.png" class="btn btn-sm btn-outline-secondary border-0" title="Unduh"><i class="bi bi-download"></i></a>
        </div>
        <div class="visual-image-wrapper overflow-auto w-100 d-flex align-items-center justify-content-center p-3 bg-white rounded-4 border border-secondary border-opacity-25 shadow-sm" style="max-height: 480px;">
          <img id="visTargetImg" src="${src}" alt="Hasil Visual" class="img-fluid rounded-3 shadow-sm transition-all" style="max-height: 420px; object-fit: contain; transform: scale(1);" />
        </div>
      `;

      this.container.appendChild(wrap);

      const imgEl = wrap.querySelector('#visTargetImg');
      wrap.querySelector('#visZoomIn').onclick = () => {
        this.zoomLevel = Math.min(3, this.zoomLevel + 0.2);
        imgEl.style.transform = `scale(${this.zoomLevel})`;
      };
      wrap.querySelector('#visZoomOut').onclick = () => {
        this.zoomLevel = Math.max(0.4, this.zoomLevel - 0.2);
        imgEl.style.transform = `scale(${this.zoomLevel})`;
      };
      wrap.querySelector('#visZoomReset').onclick = () => {
        this.zoomLevel = 1;
        imgEl.style.transform = `scale(1)`;
      };
    }

    renderSvg(svgCode) {
      this.clear();
      this.currentMode = 'svg';

      const wrap = document.createElement('div');
      wrap.className = 'visual-media-box p-3 text-center d-flex flex-column align-items-center justify-content-center h-100';

      wrap.innerHTML = `
        <div class="visual-toolbar mb-3 d-flex align-items-center gap-2 bg-white shadow-sm px-3 py-1.5 rounded-pill border border-secondary border-opacity-25">
          <span class="badge bg-success bg-opacity-90 px-2.5 py-1.5 rounded-pill"><i class="bi bi-bezier2 me-1"></i> Vektor Grafis SVG</span>
          <button class="btn btn-sm btn-outline-secondary border-0" id="visSvgCopy" title="Salin SVG"><i class="bi bi-clipboard"></i></button>
        </div>
        <div class="visual-svg-stage p-3 rounded-4 bg-white border border-secondary border-opacity-25 shadow-sm w-100 d-flex align-items-center justify-content-center" style="min-height: 320px;">
          ${svgCode}
        </div>
      `;

      this.container.appendChild(wrap);

      wrap.querySelector('#visSvgCopy').onclick = () => {
        navigator.clipboard.writeText(svgCode);
        alert('Kode SVG berhasil disalin ke clipboard!');
      };
    }

    renderTableFromJson(data) {
      this.clear();
      this.currentMode = 'table';

      if (!Array.isArray(data) || data.length === 0) return;

      const keys = Object.keys(data[0] || {});
      const wrap = document.createElement('div');
      wrap.className = 'visual-table-box p-3 d-flex flex-column h-100';

      wrap.innerHTML = `
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill"><i class="bi bi-table me-1"></i> Data Terstruktur</span>
            <span class="badge bg-light text-secondary border border-secondary border-opacity-25 px-2.5 py-1.5 rounded-pill">${data.length} Baris Data</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <input type="text" id="visTableSearch" class="form-control form-control-sm bg-white text-dark border-secondary border-opacity-50 rounded-pill px-3" placeholder="Cari data..." style="max-width: 180px;" />
            <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="visExportCsv" title="Export CSV"><i class="bi bi-file-earmark-spreadsheet me-1 text-success"></i> CSV</button>
          </div>
        </div>
        <div class="table-responsive rounded-4 border border-secondary border-opacity-25 bg-white flex-grow-1 shadow-sm" style="max-height: 420px;">
          <table class="table table-hover table-sm m-0 align-middle" id="visDataTable">
            <thead class="table-light text-dark sticky-top">
              <tr>
                <th style="width: 50px;">#</th>
                ${keys.map(k => `<th>${escapeHtml(k)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, idx) => `
                <tr>
                  <td class="text-secondary small">${idx + 1}</td>
                  ${keys.map(k => `<td>${escapeHtml(String(row[k] !== undefined ? row[k] : ''))}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.container.appendChild(wrap);

      // Search functionality
      const searchInput = wrap.querySelector('#visTableSearch');
      const tableRows = wrap.querySelectorAll('#visDataTable tbody tr');
      searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        tableRows.forEach(tr => {
          tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      };

      // Export CSV
      wrap.querySelector('#visExportCsv').onclick = () => {
        const csvContent = [
          keys.join(','),
          ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neuron-data.csv';
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    renderHtmlPreview(html) {
      this.clear();
      this.currentMode = 'html';

      const wrap = document.createElement('div');
      wrap.className = 'visual-html-box d-flex flex-column h-100 p-2';

      wrap.innerHTML = `
        <div class="visual-toolbar mb-2 d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 rounded-4" style="background: var(--neuron-pill-bg); border: 1.5px solid var(--neuron-pill-border); box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-warning text-dark fw-bold px-2.5 py-1.5 rounded-pill"><i class="bi bi-browser-chrome me-1"></i> Live Web Preview</span>
            <div class="btn-group btn-group-sm rounded-pill overflow-hidden shadow-sm" role="group" aria-label="Device Switcher">
              <button class="btn btn-sm btn-primary active text-white px-2.5 py-1" id="visDevDesktop" title="Pratinjau Layar Penuh Desktop"><i class="bi bi-display me-1"></i> Desktop</button>
              <button class="btn btn-sm btn-outline-secondary px-2.5 py-1" id="visDevTablet" title="Pratinjau Tablet (768px)"><i class="bi bi-tablet me-1"></i> Tablet</button>
              <button class="btn btn-sm btn-outline-secondary px-2.5 py-1" id="visDevMobile" title="Pratinjau Ponsel Mobile (375px)"><i class="bi bi-phone me-1"></i> Mobile</button>
            </div>
            <span class="small font-monospace text-secondary d-none d-md-inline" id="visDevSizeLabel">(100% Layar Penuh)</span>
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" id="visReloadIframe" title="Muat Ulang Pratinjau"><i class="bi bi-arrow-clockwise me-1"></i> Refresh</button>
        </div>
        <div class="iframe-container flex-grow-1 d-flex align-items-center justify-content-center p-2 rounded-4 overflow-auto" style="min-height: 440px; background: rgba(15, 23, 42, 0.05);">
          <iframe id="visPreviewIframe" class="border-0 shadow-sm" sandbox="allow-scripts allow-modals allow-same-origin" style="width: 100%; height: 100%; min-height: 420px; background: #ffffff; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 12px;"></iframe>
        </div>
      `;

      this.container.appendChild(wrap);

      const iframe = wrap.querySelector('#visPreviewIframe');
      const sizeLabel = wrap.querySelector('#visDevSizeLabel');
      const setContent = () => {
        iframe.srcdoc = html;
      };
      setContent();

      wrap.querySelector('#visReloadIframe').onclick = setContent;

      const btnDesk = wrap.querySelector('#visDevDesktop');
      const btnTab = wrap.querySelector('#visDevTablet');
      const btnMob = wrap.querySelector('#visDevMobile');

      const setActiveDev = (activeBtn, mode) => {
        [btnDesk, btnTab, btnMob].forEach(b => {
          b.classList.remove('btn-primary', 'active', 'text-white');
          b.classList.add('btn-outline-secondary');
        });
        activeBtn.classList.remove('btn-outline-secondary');
        activeBtn.classList.add('btn-primary', 'active', 'text-white');

        if (mode === 'mobile') {
          iframe.style.width = '375px';
          iframe.style.maxWidth = '375px';
          iframe.style.height = '520px';
          iframe.style.border = '10px solid #0f172a';
          iframe.style.borderRadius = '32px';
          iframe.style.boxShadow = '0 16px 45px rgba(0, 0, 0, 0.35)';
          if (sizeLabel) sizeLabel.textContent = '(375px x 520px — Mobile Device)';
        } else if (mode === 'tablet') {
          iframe.style.width = '720px';
          iframe.style.maxWidth = '100%';
          iframe.style.height = '520px';
          iframe.style.border = '8px solid #1e293b';
          iframe.style.borderRadius = '20px';
          iframe.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.3)';
          if (sizeLabel) sizeLabel.textContent = '(720px x 520px — Tablet Device)';
        } else {
          // desktop
          iframe.style.width = '100%';
          iframe.style.maxWidth = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '12px';
          iframe.style.boxShadow = 'none';
          if (sizeLabel) sizeLabel.textContent = '(100% Layar Penuh Desktop)';
        }
      };

      btnDesk.onclick = () => setActiveDev(btnDesk, 'desktop');
      btnTab.onclick = () => setActiveDev(btnTab, 'tablet');
      btnMob.onclick = () => setActiveDev(btnMob, 'mobile');
    }

    async render3DScene() {
      this.clear();
      this.currentMode = '3d';

      if (!this.threeJsLoaded) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        this.threeJsLoaded = true;
      }

      const wrap = document.createElement('div');
      wrap.className = 'visual-3d-box d-flex flex-column h-100 p-2 position-relative';

      wrap.innerHTML = `
        <div class="visual-toolbar mb-2 d-flex align-items-center justify-content-between bg-dark bg-opacity-75 px-3 py-1.5 rounded border border-secondary border-opacity-25">
          <span class="badge bg-purple text-white" style="background-color: #8b5cf6;"><i class="bi bi-box me-1"></i> Interactive 3D WebGL</span>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-light border-0" id="vis3dWireframe" title="Toggle Wireframe"><i class="bi bi-grid-3x3"></i></button>
            <button class="btn btn-sm btn-outline-light border-0" id="vis3dReset" title="Reset Rotasi"><i class="bi bi-arrow-repeat"></i></button>
          </div>
        </div>
        <div id="vis3dCanvasHolder" class="flex-grow-1 rounded overflow-hidden d-flex align-items-center justify-content-center" style="min-height: 400px; background: radial-gradient(circle, #1e1b4b 0%, #09090b 100%);"></div>
      `;

      this.container.appendChild(wrap);

      const holder = wrap.querySelector('#vis3dCanvasHolder');
      const width = holder.clientWidth || 500;
      const height = 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      holder.appendChild(renderer.domElement);

      // Light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xf97316, 2, 50);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      // Dynamic Geometry (Polyhedron / Cube cluster)
      const geometry = new THREE.IcosahedronGeometry(1.5, 0);
      const material = new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        wireframe: false,
        shininess: 90,
        flatShading: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Orbit animation
      const animate = () => {
        this.threeAnimId = requestAnimationFrame(animate);
        mesh.rotation.x += 0.008;
        mesh.rotation.y += 0.012;
        renderer.render(scene, camera);
      };
      animate();

      wrap.querySelector('#vis3dWireframe').onclick = () => {
        material.wireframe = !material.wireframe;
      };
      wrap.querySelector('#vis3dReset').onclick = () => {
        mesh.rotation.set(0, 0, 0);
      };
    }

    render2DCanvas() {
      this.clear();
      this.currentMode = '2d';

      const wrap = document.createElement('div');
      wrap.className = 'visual-2d-box d-flex flex-column h-100 p-2';

      wrap.innerHTML = `
        <div class="visual-toolbar mb-2 d-flex align-items-center justify-content-between bg-dark bg-opacity-75 px-3 py-1.5 rounded border border-secondary border-opacity-25">
          <span class="badge bg-warning text-dark"><i class="bi bi-palette me-1"></i> Canvas 2D Graphics</span>
          <button class="btn btn-sm btn-outline-light border-0" id="vis2dRedraw" title="Gambar Ulang"><i class="bi bi-arrow-clockwise"></i></button>
        </div>
        <div class="flex-grow-1 rounded overflow-hidden d-flex align-items-center justify-content-center bg-dark" style="min-height: 400px;">
          <canvas id="vis2dCanvas" width="480" height="360" class="border border-secondary border-opacity-25 rounded"></canvas>
        </div>
      `;

      this.container.appendChild(wrap);

      const canvas = wrap.querySelector('#vis2dCanvas');
      const ctx = canvas.getContext('2d');

      const drawArt = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for (let i = 0; i < 36; i++) {
          const angle = (i * 10 * Math.PI) / 180;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.strokeStyle = `hsl(${i * 10}, 80%, 60%)`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.strokeRect(-60, -60, 120, 120);
          ctx.restore();
        }
      };

      drawArt();
      wrap.querySelector('#vis2dRedraw').onclick = drawArt;
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(s);
      });
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  window.NeuronVisualizer = new NeuronVisualizer();
})(window);

