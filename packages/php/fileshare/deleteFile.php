<?php
require_once __DIR__ . '/constants.php';
set_time_limit(TIMEOUT_SECONDS);
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Only POST requests are allowed.'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name']) || !isset($input['fileType'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields: name, fileType'
    ]);
    exit;
}

$name = $input['name'];
$fileType = $input['fileType'];

$servername = SERVER;
$sqlUserName = DB_USER;
$sqlPassword = DB_PASS;
$dbname = DB_NAME;

try {
    $conn = new mysqli($servername, $sqlUserName, $sqlPassword, $dbname);

    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    // Check if file exists
    $checkStmt = $conn->prepare("SELECT name FROM files WHERE name = ? AND file_type = ?");
    $checkStmt->bind_param("ss", $name, $fileType);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'File not found'
        ]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Delete from database first
    $deleteStmt = $conn->prepare("DELETE FROM files WHERE name = ? AND file_type = ?");
    $deleteStmt->bind_param("ss", $name, $fileType);
    
    if (!$deleteStmt->execute()) {
        throw new Exception('Failed to delete from database');
    }

    // Use environment-aware path resolution
    $filePath = COLLECTION_PATH . "/{$name}.{$fileType}";
    
    // Debug logging (can remove in production)
    error_log("DeleteFile: Collection path is " . COLLECTION_PATH);
    error_log("DeleteFile: Attempting to delete file at {$filePath}");
    
    if (file_exists($filePath)) {
        if (!unlink($filePath)) {
            // File deleted from DB but not from filesystem - log this
            error_log("DeleteFile: Warning - File deleted from database but not from filesystem: {$filePath}");
        } else {
            error_log("DeleteFile: Successfully deleted physical file");
        }
    } else {
        error_log("DeleteFile: Warning - Physical file not found at: {$filePath}");
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'File deleted successfully'
    ]);

    $deleteStmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>