<?php
header("Content-Type: application/json");

echo json_encode([
    "message" => "Guestbook API",
    "endpoints" => [
        "GET /api/read.php" => "Get all entries",
        "GET /api/read.php?id=1" => "Get single entry",
        "POST /api/create.php" => "Create entry (JSON: {name, message})",
        "PUT /api/update.php" => "Update entry (JSON: {id, name, message})",
        "DELETE /api/delete.php" => "Delete entry (JSON: {id})"
    ]
]);
?>