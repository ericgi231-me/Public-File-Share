CREATE TABLE IF NOT EXISTS files (
    name varchar(300) NOT NULL,
    file_type varchar(30) NOT NULL,
    special tinyint(1) NOT NULL DEFAULT '0',
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;