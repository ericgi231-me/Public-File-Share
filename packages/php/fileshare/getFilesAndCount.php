<?php
require_once __DIR__ . '/constants.php';
set_time_limit(TIMEOUT_SECONDS);
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$DEFAULT_START = 0;
$MAX_FILES_PER_REQUEST = 10;
$FILE_DIRECTORY = "/collection/";

// Fail non GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Only GET requests are allowed.'
    ]);
    exit;
}

// Get the base URL dynamically
$frontendHost = isset($_SERVER['HTTP_X_FRONTEND_HOST']) ? $_SERVER['HTTP_X_FRONTEND_HOST'] : $_SERVER['HTTP_HOST'];
$isHttps = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
    (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
);
$scheme = $isHttps ? 'https' : 'http';
$baseUrl = $scheme . "://" . $frontendHost;

// Get arguments
$start = $_GET['start'] ?? $DEFAULT_START;
$size = $_GET['size'] ?? $MAX_FILES_PER_REQUEST;
$random = $_GET['random'] ?? 0;
$search = $_GET['search'] ?? null;
$files = [];

if ($size > 10 || $size < 0) {
    $size = $MAX_FILES_PER_REQUEST; // Default to max if invalid size
}

$servername = SERVER;
$sqlUserName = DB_USER;
$sqlPassword = DB_PASS;
$dbname = DB_NAME;

try {
    $conn = new mysqli($servername, $sqlUserName, $sqlPassword, $dbname);

    if ($conn->connect_error) {
        die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    $sql = "SELECT COUNT(*) as count FROM files";
    if (!is_null($search)) {
        $sql .= " WHERE name LIKE '%" . $conn->real_escape_string($search) . "%'";
    }
    $result = $conn->query($sql);

    $count = 0;
    if ($result) {
        $row = $result->fetch_assoc();
        $files[] = ['total_files' => (int)$row['count']];
    }

    $sql = "SELECT name, file_type, special, created FROM files";
    if (!is_null($search)) {
        $normalizedSearch = preg_replace('/[^a-zA-Z0-9]/', '', $search);
        $sql .= " WHERE REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '') LIKE '%" . $conn->real_escape_string($normalizedSearch) . "%'";
    }
    if ($random == 1) {
        $sql .= " ORDER BY RAND()";
    } else {
        $sql .= " ORDER BY created DESC, name DESC";
    }
    $sql .= " LIMIT $size OFFSET $start";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $files[] = [
                'url' => $baseUrl.$FILE_DIRECTORY.$row['name'].".".$row['file_type'],
                'special' => (bool)$row['special'],
                'name' => $row['name'],
                'file_type' => $row['file_type'],
                'created' => $row['created']];
        }
    }

    $conn->close();
    echo json_encode($files);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>