<?php
$collectionPath = dirname(__DIR__) . '/php/collection';

return [
    'DB_HOST' => '127.0.0.1:3307',
    'DB_NAME' => getenv('DB_NAME') ?: 'god',
    'DB_USER' => getenv('DB_USER') ?: 'god_user',
    'DB_PASS' => getenv('DB_PASSWORD') ?: 'test_password',
    'COLLECTION_PATH' => $collectionPath,

    // Legacy keys retained for compatibility with older constants usage.
    'DB_NAME_ENV' => getenv('DB_NAME') ?: 'god',
    'DB_USER_ENV' => getenv('DB_USER') ?: 'god_user',
    'DB_PASS_ENV' => getenv('DB_PASSWORD') ?: 'test_password',
    'COLLECTION_PATH_ENV' => $collectionPath,
    'DEBUG' => true,
];
