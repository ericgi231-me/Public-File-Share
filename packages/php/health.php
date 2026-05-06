<?php
header("Content-Type: application/json");

try {
    // Optional: Check database connection
    require_once './database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    echo json_encode([
        "status" => "healthy",
        "service" => "backend",
        "database" => "connected"
    ]);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode([
        "status" => "unhealthy",
        "error" => $e->getMessage()
    ]);
}
?>