<?php
require_once __DIR__ . '/../config.php';

define('SERVER', $config['DB_HOST'] ?? 'database');
define('DB_NAME', $config['DB_NAME'] ?? ($config['DB_NAME_ENV'] ?? 'portfolio'));
define('DB_USER', $config['DB_USER'] ?? ($config['DB_USER_ENV'] ?? 'portfolio_user'));
define('DB_PASS', $config['DB_PASS'] ?? ($config['DB_PASS_ENV'] ?? 'test_password'));
define('COLLECTION_PATH', $config['COLLECTION_PATH'] ?? ($config['COLLECTION_PATH_ENV'] ?? '/var/www/html/collection'));
define('MAX_FILE_SIZE', 150 * 1024 * 1024); // 150MB in bytes
define('MAX_FILE_SIZE_MB', 150 );
define('TIMEOUT_SECONDS', 600 );