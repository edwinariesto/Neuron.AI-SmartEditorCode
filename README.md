# Neuron.AI Editor Code

<div align="center">

| <a href="#indonesian-version"><img src="./_manage/img/flag-id.svg" width="22" height="22" valign="middle" alt="Indonesia" /> <b>Bahasa Indonesia</b></a> | <a href="#english-version"><img src="./_manage/img/flag-en.svg" width="22" height="22" valign="middle" alt="English" /> <b>English Version</b></a> |
| :---: | :---: |

</div>

<details open id="indonesian-version">
<summary>
  <img src="./_manage/img/flag-id.svg" width="20" height="20" valign="middle" alt="ID" /> <b>Bahasa Indonesia</b> (Klik untuk Ciutkan / Buka Tab)
</summary>

<br>

Smart Programming Editor with Generative AI untuk eksekusi multibahasa cepat, deteksi kode otomatis, serta audit logika baris demi baris secara jelas.

## Visi dan Keunggulan Utama

Neuron.AI Editor Code menghadirkan lingkungan pemrograman interaktif modern yang menggabungkan kecepatan eksekusi mandiri dengan kecerdasan buatan generatif. Platform ini dirancang khusus untuk memangkas hambatan teknis yang sering dihadapi oleh pengembang pemula maupun profesional saat mengeksplorasi kode program. Melalui integrasi mesin inferensi cerdas dan antarmuka visual yang intuitif, setiap baris kode yang ditulis dapat langsung dianalisis, dijalankan, dan divisualisasikan tanpa konfigurasi lingkungan yang rumit.

## Deteksi Bahasa Pemrograman Otomatis

Salah satu keunggulan utama sistem ini adalah kemampuan pengenalan bahasa pemrograman secara otomatis tanpa mengharuskan pengguna memilih opsi secara manual.

1. Analisis Pola Sintaks Real Time
Sistem memindai struktur teks, kata kunci khusus, dan tanda baca khas dalam hitungan milidetik saat pengguna mengetik atau menempelkan potongan kode.

2. Penyesuaian Mode Editor Otomatis
Setelah jenis bahasa teridentifikasi, editor Ace secara dinamis mengaktifkan aturan pewarnaan sintaks, pelengkapan kata, dan validasi struktur yang sesuai dengan bahasa tersebut, mulai dari PHP, Python, JavaScript, TypeScript, HTML, SQL, hingga bahasa pemrograman lainnya.

3. Kesiapan Eksekusi Instan
Dengan terdeteksinya bahasa secara presisi, pengguna dapat langsung menekan tombol eksekusi dan sistem segera mengarahkan kode ke mesin pemroses yang tepat tanpa langkah peralihan manual.

## Arsitektur Kecerdasan Buatan dan Model yang Digunakan

Sistem ditenagai oleh lini model kecerdasan buatan resmi dari Google Gemini yang menawarkan perpaduan optimal antara kecepatan respon tinggi, efisiensi kuota, dan pemahaman logika kode mendalam.

1. Model Utama Google Gemini 3.5 Flash
Digunakan sebagai mesin utama untuk menganalisis kode secara cepat, menghasilkan diagnosis kesalahan baris demi baris, dan memberikan rekomendasi perbaikan dalam kalimat awam yang mudah dipahami.

2. Model Ringan Google Gemini 3.5 Flash Lite
Berfungsi sebagai varian hemat kuota dengan latensi ultra rendah untuk kebutuhan analisis cepat pada perangkat dengan bandwidth terbatas.

3. Model Tingkat Lanjut Google Gemini 3.8 Flash
Disediakan untuk menangani analisis logika kompleks, kalkulasi algoritma rumit, serta struktur data skala besar.

4. Mekanisme Failover Kuota Otomatis
Platform dilengkapi logika deteksi kuota mandiri. Apabila kuota gratis mencapai batas atau server penyedia mengalami antrean trafik tinggi, sistem secara otomatis mengalihkan permintaan ke varian model alternatif tanpa menghentikan proses kerja pengguna.

5. Kemudahan Pembaruan Model Masa Depan
Arsitektur perantara dirancang modular dan terisolasi. Ketika Google merilis generasi model Gemini terbaru di masa mendatang, pengembang dapat memperbarui daftar model pada konfigurasi sentral tanpa perlu merombak antarmuka pengguna maupun logika inti aplikasi.

## Evaluasi Fungsi Cerdas dan Fitur Utama

1. Lingkungan Eksekusi Multibahasa Terpadu
Mendukung eksekusi langsung di sisi klien untuk bahasa berbasis peramban seperti JavaScript, TypeScript dengan kompilasi otomatis, JSON, dan dokumen HTML. Untuk bahasa backend seperti PHP dan Python, pemrosesan dialihkan secara mulus ke mesin eksekusi server yang aman dan terisolasi.

2. Pemeriksaan dan Audit Kode Baris demi Baris
Berbeda dengan terminal konvensional yang kerap membingungkan karena pesan error teknis yang panjang, modul audit cerdas membaca seluruh baris kode dan menguraikan penyebab kesalahan dalam bahasa awam. Pengguna disajikan ringkasan letak baris yang bermasalah, penjelasan alasan teknis, serta tombol satu klik untuk menyalin kode solusi langsung ke editor.

3. Visualisasi Multimedia dan Grafis Interaktif
Platform menyediakan panel visualisasi terintegrasi yang mampu menampilkan berbagai format luaran:
a. Pratinjau halaman web live dengan pilihan tampilan desktop, bingkai tablet, dan bingkai ponsel.
b. Render grafis vektor SVG tajam dengan fitur penyalinan kode sumber instan.
c. Tampilan tabel data interaktif yang dilengkapi pencarian kata kunci dan fungsi ekspor ke format CSV.
d. Eksplorasi grafis dua dimensi Canvas serta simulasi tiga dimensi berbasis WebGL Three.js.

4. Antarmuka Kaca Lembut Responsif
Desain visual mengusung estetika soft glassmorphism dengan palet tiga warna utama yaitu oranye cerah, hitam elegan, dan putih bersih. Pada layar komputer meja, tata letak tersusun simetris dan lapang. Pada perangkat tablet dan ponsel, antarmuka otomatis memunculkan bilah navigasi bawah melayang berlekuk ergonomis dengan tombol bulat besar untuk menjalankan program secara nyaman menggunakan ibu jari.

5. Sistem Kontras Adaptif Tema Gelap dan Terang
Sistem pewarnaan diatur dengan kalibrasi kontras tinggi. Setiap teks judul, label, badge penunjuk baris, maupun status evaluasi dapat menyesuaikan diri secara dinamis saat tema berpindah dari gelap ke terang, menjamin keterbacaan optimal di segala kondisi pencahayaan.

6. Dialog Interaktif Modern
Seluruh notifikasi konfirmasi pembersihan editor dan peringatan sistem menggunakan kotak dialog modern yang menyatu dengan tema visual, menggantikan jendela pop up bawaan peramban yang kaku.

## Panduan Penerapan dan Deployment

Aplikasi ini dibangun dengan struktur fleksibel sehingga dapat dijalankan pada lingkungan server tradisional maupun platform komputasi awan serverless modern.

1. Penerapan pada Server Tradisional PHP
Aplikasi dapat dijalankan langsung di atas peladen Apache atau Nginx dengan runtime PHP versi delapan ke atas. Pengguna cukup menempatkan direktori proyek ke dalam folder web publik dan memastikan ekstensi curl serta json aktif.

2. Penerapan Serverless pada Vercel
Tersedia modul serverless terdedikasi pada direktori api yang memungkinkan seluruh fitur eksekusi kode dan komunikasi kecerdasan buatan berjalan mulus di atas jaringan infrastruktur Vercel tanpa memerlukan server fisik mandiri.

3. Pengelolaan Kode Sumber di GitHub
Proyek ini dikelola secara terstruktur melalui repositori GitHub resmi untuk pelacakan versi, pembaruan berkelanjutan, dan sinkronisasi berkas secara terpadu.

## Hak Cipta, Batasan Lisensi dan Peluang Kolaborasi

1. Hak Cipta Eksklusif
Seluruh kode sumber, desain visual antarmuka, arsitektur sistem, dan inovasi fungsi cerdas pada proyek Neuron.AI Editor Code merupakan hak kekayaan intelektual milik Edwin Al Syatrie. Seluruh hak cipta dilindungi undang undang.

2. Batasan Penggunaan dan Larangan Penjiplakan
Dilarang keras menduplikasi, menjiplak, mengkloning, mendistribusikan ulang, atau mengklaim kepemilikan karya ini baik sebagian maupun keseluruhan untuk tujuan komersial atau kepentingan sepihak tanpa izin tertulis resmi dari pemilik hak cipta. Sistem ini dirilis untuk tujuan demonstrasi, edukasi, dan evaluasi resmi.

3. Kemitraan dan Kolaborasi Terbuka
Pengembang menyambut baik kolaborasi penelitian akademik, integrasi edukasi, serta kontribusi teknis yang membangun. Pihak yang berminat menjalin kerja sama riset komputasi kognitif atau pengembangan bersama dapat mengajukan permohonan kolaborasi resmi melalui kanal repositori GitHub atau komunikasi langsung dengan pemilik proyek.

</details>

<details id="english-version">
<summary>
  <img src="./_manage/img/flag-en.svg" width="20" height="20" valign="middle" alt="EN" /> <b>English Version</b> (Click to Expand / Collapse Tab)
</summary>

<br>

Smart Programming Editor with Generative AI for fast multi-language execution, automated code detection, and plain line-by-line logic audit.

## Vision and Core Advantages

Neuron.AI Editor Code delivers a modern interactive programming environment combining standalone execution speed with generative artificial intelligence. The platform is purpose-built to eliminate technical friction frequently encountered by novice learners and seasoned developers while exploring codebases. Through intelligent inference engines and intuitive visual interfaces, every written line of code can be immediately analyzed, executed, and visualized without complicated local environment configurations.

## Automated Programming Language Detection

A hallmark capability of the system is real-time automated programming language recognition, freeing users from manual dropdown selections.

1. Real Time Syntax Pattern Analysis
The system scans code structure, unique syntax tokens, and punctuation fingerprints within milliseconds as users type or paste snippets.

2. Dynamic Editor Mode Adaptation
Once the language is identified, Ace editor dynamically configures appropriate syntax highlighting, auto-completion, and structural grammar rules for PHP, Python, JavaScript, TypeScript, HTML, SQL, and other languages.

3. Instant Execution Readiness
With language recognition operating instantaneously, users can press run right away, allowing the system to route code to the correct runtime engine without manual intervention.

## Artificial Intelligence Architecture and Engine Models

The platform is powered by Google Gemini official models, offering an optimal balance of fast inference speed, quota efficiency, and deep semantic code reasoning.

1. Primary Model Google Gemini 3.5 Flash
Acts as the main inference engine for rapid code evaluation, line-by-line diagnosis, and beginner-friendly remedial suggestions.

2. Lightweight Model Google Gemini 3.5 Flash Lite
Provides ultra-low latency execution and minimal token consumption for quick audits and bandwidth-constrained devices.

3. Advanced Model Google Gemini 3.8 Flash
Dedicated to complex algorithmic calculations, multi-branch control flow analysis, and large data structures.

4. Automated Quota Failover Mechanism
The system features self-monitoring response logic. If free-tier quotas are reached or upstream servers face traffic spikes, the platform seamlessly migrates requests to alternative models without disrupting active user workflows.

5. Future Model Upgrade Readiness
The backend gateway is built modularly. When future generations of Gemini models are released, developers can update configuration endpoints centrally without altering frontend code or core logic.

## Evaluation of Intelligent Capabilities and Core Features

1. Unified Multi-Language Execution Environment
Provides direct client-side execution for browser-supported stacks such as JavaScript, TypeScript with auto-transpilation, JSON, and live HTML. For server-side languages like PHP and Python, execution is securely delegated to sandboxed backend runners.

2. Comprehensive Line-by-Line Code Audit
Unlike traditional console outputs with cryptic compiler traces, the intelligent audit module parses all code lines and explains root causes in plain language. Users receive line numbers, technical rationales, and one-click code fix actions.

3. Rich Multimedia and Interactive Visualizations
The output workspace presents results in versatile interactive formats:
a. Live responsive web previews with desktop, tablet, and mobile viewport frames.
b. Crisp vector SVG rendering with instant source code copying.
c. Interactive data tables with keyword search filtering and CSV export capabilities.
d. Two-dimensional Canvas rendering and Three.js WebGL three-dimensional simulations.

4. Ergonomic Responsive Soft Glassmorphic Interface
The aesthetic incorporates soft glassmorphism with an orange, dark slate, and clean white palette. Desktop screens enjoy a wide symmetrical layout, while mobile devices feature an ergonomic floating bottom navigation bar with prominent thumb-friendly run buttons.

5. High Contrast Adaptive Dark and Light Themes
Every title, badge, indicator, and status text adapts dynamically across dark and light modes, ensuring optimal contrast and strain-free readability under all ambient conditions.

6. Modern Interactive Dialog System
Confirmation modals and system notifications use custom glassmorphic modal dialogues matching the design language, replacing rigid native browser popups.

## Deployment and Hosting Architecture

The platform architecture is built flexibly to support both traditional server environments and modern serverless cloud infrastructures.

1. Traditional PHP Server Hosting
Runs directly on Apache or Nginx with PHP 8.2 or newer with curl and json extensions enabled.

2. Serverless Cloud Deployment on Vercel
Dedicated serverless functions in the api directory allow seamless execution and AI communication on Vercel without maintaining physical servers.

3. GitHub Repository Management
Version tracking and source control are organized via the official GitHub repository for continuous integration and structured maintenance.

## Intellectual Property, Licensing Restrictions and Collaboration Opportunities

1. Exclusive Copyright Ownership
All source code, visual interfaces, system architecture, and intelligent logic in Neuron.AI Editor Code are the proprietary intellectual property of Edwin Al Syatrie. All rights reserved.

2. Usage Restrictions and Anti-Plagiarism Policy
Duplicating, copying, redistributing, or claiming unauthorized ownership of this project in whole or in part for commercial use or private gain is strictly prohibited without explicit written consent. This project is published strictly for educational demonstration and scientific peer evaluation.

3. Open Partnership and Academic Collaboration
The author warmly welcomes research collaborations, educational integrations, and constructive technical partnerships. Interested institutions and researchers may submit formal collaboration inquiries through GitHub or direct contact with the project owner.

</details>
