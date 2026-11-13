<?php
// config.php — Konfigurasi API Keys, Deteksi Lingkungan (Localhost / Vercel / Hosting) & Database MySQL

// 1. Google Gemini API Key (Mendukung Environment Variables Vercel / Hosting)
$apiKeyGemini = getenv('GEMINI_API_KEY') ?: ""; // Isi key manual atau set di Vercel Environment Variables

// 2. OpenAI API Key (ChatGPT)
$apiKeyOpenAI = getenv('OPENAI_API_KEY') ?: "";

// 3. Anthropic API Key (Claude)
$apiKeyClaude = getenv('CLAUDE_API_KEY') ?: "";

// 4. Deteksi Lingkungan Otomatis (Localhost vs Vercel vs Live Hosting)
function isVercel() {
    if (getenv('VERCEL') || isset($_ENV['VERCEL'])) return true;
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    return (strpos($host, 'vercel.app') !== false);
}

function isLocalhost() {
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    return ($host === 'localhost' || strpos($host, '127.0.0.1') !== false || $host === '::1');
}

// 5. Konfigurasi Database MySQL (Otomatis menyesuaikan Localhost / Hosting / Vercel)
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
$dbName = 'db_neuronai';

/**
 * Fungsi Pembantu Koneksi Database MySQLi db_neuronai
 * - Di Localhost: Berjalan normal ke MySQL XAMPP
 * - Di Vercel: Mematikan koneksi secara aman (return null) tanpa error/timeout
 * - Di Live Hosting: Berjalan normal sesuai konfigurasi hosting / environment variables
 */
function getDbConnection() {
    global $dbHost, $dbUser, $dbPass, $dbName;

    // Jika berjalan di platform Vercel, matikan sementara koneksi database
    if (isVercel()) {
        return null;
    }

    // Ambil kredensial database (Mendukung Environment Variables untuk Live Hosting)
    $host = getenv('DB_HOST') ?: $dbHost;
    $user = getenv('DB_USER') ?: $dbUser;
    $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : $dbPass;
    $name = getenv('DB_NAME') ?: $dbName;
    $port = getenv('DB_PORT') ? (int)getenv('DB_PORT') : 3306;

    try {
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = mysqli_init();
        if (!$conn) return null;
        
        // Timeout koneksi 2 detik agar tidak menggantung jika server MySQL offline
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 2);

        $connected = @$conn->real_connect($host, $user, $pass, $name, $port);
        if (!$connected || $conn->connect_error) {
            return null;
        }

        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Throwable $e) {
        return null;
    }
}