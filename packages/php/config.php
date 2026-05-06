<?php
function getConfig() {
    if (file_exists(__DIR__ . '/../config/php-dev.php')) {
        return require __DIR__ . '/../config/php-dev.php';
    }

    $dbHost = getenv('DB_HOST') ?: 'database';
    $dbName = getenv('DB_NAME') ?: (getenv('DB_NAME_ENV') ?: 'portfolio');
    $dbUser = getenv('DB_USER') ?: (getenv('DB_USER_ENV') ?: 'portfolio_user');
    $dbPass = getenv('DB_PASSWORD') ?: (getenv('DB_PASS_ENV') ?: 'test_password');
    $collectionPath = getenv('COLLECTION_PATH') ?: (getenv('COLLECTION_PATH_ENV') ?: './collection');

    return [
        'DB_HOST' => $dbHost,
        'DB_NAME' => $dbName,
        'DB_USER' => $dbUser,
        'DB_PASS' => $dbPass,
        'COLLECTION_PATH' => $collectionPath,
        // Legacy keys retained for compatibility with older includes.
        'DB_NAME_ENV' => $dbName,
        'DB_USER_ENV' => $dbUser,
        'DB_PASS_ENV' => $dbPass,
        'COLLECTION_PATH_ENV' => $collectionPath,
        'DEBUG' => false
    ];
}
$config = getConfig();
?>