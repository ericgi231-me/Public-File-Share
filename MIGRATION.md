# Migration Guide (Old Server -> Docker Stack)

This project now supports persistent database and file storage with Docker volumes:

- MySQL data volume: `db_data`
- Uploaded files volume: `files_data` mounted at `/var/www/html/collection` in the backend container

## 1. Prepare Environment Variables

Create a `.env` file at the project root with at least:

```env
APP_NAME=public-fileshare
FRONTEND_IMAGE=public-fileshare-frontend:local
BACKEND_IMAGE=public-fileshare-backend:local

DB_NAME=portfolio
DB_USER=portfolio_user
DB_PASSWORD=change_me
DB_ROOT_PASSWORD=change_me_root

DEV_PUBLIC_PORT=8080
```

## 2. Export Existing Data from Old Server

Export database:

```bash
mysqldump -u <old_user> -p <old_db_name> > backup.sql
```

Copy files from old collection folder:

```bash
rsync -av /path/to/old/collection/ ./migration/files/
```

## 3. Start the New Stack

```bash
docker compose up -d --build
```

## 4. Import Database into Containerized MySQL

```bash
docker compose exec -T database mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backup.sql
```

## 5. Import Files into Persistent Volume

```bash
docker compose cp ./migration/files/. backend:/var/www/html/collection/
```

If needed, fix ownership inside backend container:

```bash
docker compose exec backend chown -R www-data:www-data /var/www/html/collection
```

## 6. Verify

Check DB rows:

```bash
docker compose exec database mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT COUNT(*) FROM ${DB_NAME}.files;"
```

Check backend can read files:

```bash
docker compose exec backend ls -la /var/www/html/collection | head
```

Then verify in app:

- Existing items load in the frontend
- Existing files open by URL
- Upload, rename, and delete flows still work

## Notes

- Container filesystems are ephemeral. Keep all persistent data in mounted volumes.
- Keep filename conventions unchanged (`name.file_type`) so existing DB rows continue to resolve to the same file names.

## Local Test Workflow (Before Migration)

Use this flow to test with:

- React frontend in dev mode
- Local PHP dev server
- Dockerized MySQL
- Persistent local files in `packages/php/collection`

### 1. Start only the database container

```bash
npm run dev:db
```

MySQL is exposed to the host at `127.0.0.1:${DEV_DB_PORT:-3307}` via compose override.

### 2. Create schema (first run only)

```bash
docker compose exec -T database mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "CREATE TABLE IF NOT EXISTS files (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, file_type VARCHAR(32) NOT NULL, special TINYINT(1) NOT NULL DEFAULT 0, created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_name_type (name, file_type));"
```

### 3. Add a sample row and sample file

```bash
docker compose exec -T database mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "INSERT IGNORE INTO files (name, file_type, special, created) VALUES ('sample','jpg',0,NOW());"
```

Create file at `packages/php/collection/sample.jpg`.

### 4. Start backend and frontend in dev

```bash
npm run dev:backend
```

In a second terminal:

```bash
npm run dev:frontend
```

### 5. Verify

- Page loads at frontend dev URL (usually `http://localhost:5173`)
- Existing sample item appears
- Upload creates DB row and file in `packages/php/collection`
- Rename updates both file and DB record
- Delete removes both file and DB record

### 6. Stop database when done

```bash
npm run dev:db:down
```
