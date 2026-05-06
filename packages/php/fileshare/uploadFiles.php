<?php
require_once __DIR__ . '/constants.php';
set_time_limit(seconds: TIMEOUT_SECONDS);
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

$servername = SERVER;
$sqlUserName = DB_USER;
$sqlPassword = DB_PASS;
$dbname = DB_NAME;

try {
    $conn = new mysqli($servername, $sqlUserName, $sqlPassword, $dbname);

    if ($conn->connect_error) {
        die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
    }

    $nsfw = isset($_POST['nsfw']) && $_POST['nsfw'] == 1 ? 1 : 0;
    
    // Use environment-aware path resolution
    $uploadDir = COLLECTION_PATH . '/';
    $results = [];

    // Debug logging
    error_log("UploadFiles: Collection path is " . COLLECTION_PATH);

    if (!empty($_FILES['files']['name'][0])) {
        foreach ($_FILES['files']['name'] as $idx => $name) {
            $size = $_FILES['files']['size'][$idx];
            if ($size > MAX_FILE_SIZE) {
                http_response_code(response_code: 413);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'File size exceeds the maximum allowed size of '.MAX_FILE_SIZE_MB.'Mb.'
                ]);
                exit;
            }

            $tmpName = $_FILES['files']['tmp_name'][$idx];
            $fileType = pathinfo($name, PATHINFO_EXTENSION);
            $baseName = pathinfo($name, PATHINFO_FILENAME);
            $targetPath = $uploadDir . basename($name);

            if (move_uploaded_file($tmpName, $targetPath)) {
                try {
                    $stmt = $conn->prepare("INSERT INTO files (name, file_type, special, created) VALUES (?, ?, ?, NOW())");
                    $stmt->bind_param("ssi", $baseName, $fileType, $nsfw);
                    $stmt->execute();
                    $results[] = ['file' => $name, 'status' => 'uploaded'];
                    $stmt->close();
                } catch (mysqli_sql_exception $e) {
                    if ($e->getCode() == 1062) {
                        http_response_code(409);
                        echo json_encode([
                            'status' => 'error',
                            'message' => "Duplicate entry: file named '{$baseName}' already exists."
                        ]);
                        $conn->close();
                        exit;
                    } else {
                        $results[] = ['file' => $name, 'status' => 'db error', 'error' => $e->getMessage()];
                    }
                }
            } else {
                $results[] = ['file' => $name, 'status' => 'failed'];
            }
        }
    }

    $conn->close();
    echo json_encode(['results' => $results]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>