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

if (!$input || !isset($input['originalName']) || !isset($input['fileType'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields: originalName, fileType'
    ]);
    exit;
}

$originalName = $input['originalName'];
$fileType = $input['fileType'];
$newName = $input['newName'] ?? $originalName;
$special = isset($input['special']) ? (int)$input['special'] : 0;

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
    $checkStmt->bind_param("ss", $originalName, $fileType);
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

    // If renaming file, check if new name already exists
    if ($newName !== $originalName) {
        $duplicateStmt = $conn->prepare("SELECT name FROM files WHERE name = ? AND file_type = ?");
        $duplicateStmt->bind_param("ss", $newName, $fileType);
        $duplicateStmt->execute();
        $duplicateResult = $duplicateStmt->get_result();
        
        if ($duplicateResult->num_rows > 0) {
            http_response_code(409);
            echo json_encode([
                'status' => 'error',
                'message' => "File with name '{$newName}' already exists"
            ]);
            $duplicateStmt->close();
            $conn->close();
            exit;
        }
        $duplicateStmt->close();

        // Use environment-aware path resolution
        $oldPath = COLLECTION_PATH . "/{$originalName}.{$fileType}";
        $newPath = COLLECTION_PATH . "/{$newName}.{$fileType}";
        
        // Debug logging (can remove in production)
        error_log("UpdateFile: Collection path is " . COLLECTION_PATH);
        error_log("UpdateFile: Attempting to rename from {$oldPath} to {$newPath}");
        
        if (file_exists($oldPath)) {
            if (!rename($oldPath, $newPath)) {
                throw new Exception('Failed to rename physical file');
            }
            error_log("UpdateFile: Successfully renamed file");
        } else {
            // Log warning but don't fail - file might not exist physically
            error_log("UpdateFile: Warning - Physical file not found at: {$oldPath}");
        }
    }

    // Update database
    $updateStmt = $conn->prepare("UPDATE files SET name = ?, special = ? WHERE name = ? AND file_type = ?");
    $updateStmt->bind_param("siss", $newName, $special, $originalName, $fileType);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update database');
    }

    if ($updateStmt->affected_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'No rows were updated'
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'message' => 'File updated successfully',
            'data' => [
                'name' => $newName,
                'file_type' => $fileType,
                'special' => $special
            ]
        ]);
    }

    $updateStmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>