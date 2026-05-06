$ErrorActionPreference = 'Stop'

Write-Host 'Starting database and backend containers...'
docker compose --env-file .env.devdb up -d database backend | Out-Host

$backendId = (docker compose --env-file .env.devdb ps -q backend).Trim()
if (-not $backendId) {
  throw 'Backend container is not running.'
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$marker = "volume-test-$stamp.txt"

Write-Host "Writing marker file: $marker"
docker compose --env-file .env.devdb exec -T backend sh -lc "echo persisted-$stamp > /var/www/html/collection/$marker" | Out-Host

Write-Host 'Restarting backend container...'
docker compose --env-file .env.devdb restart backend | Out-Host

$content = docker compose --env-file .env.devdb exec -T backend sh -lc "cat /var/www/html/collection/$marker"
if (-not $content -or ($content -notmatch "persisted-$stamp")) {
  throw 'Marker file was not found after restart. Volume persistence check failed.'
}

$inspectJson = docker inspect $backendId
$inspect = $inspectJson | ConvertFrom-Json
$mount = $inspect[0].Mounts | Where-Object { $_.Destination -eq '/var/www/html/collection' } | Select-Object -First 1

if (-not $mount) {
  throw 'Could not find mount info for /var/www/html/collection.'
}

$mountType = $mount.Type
$volumeName = $mount.Name
$sourcePath = $mount.Source

Write-Host ''
Write-Host 'Volume persistence check passed.' -ForegroundColor Green
Write-Host "Mount type: $mountType"
Write-Host "Volume name: $volumeName"
Write-Host "Source path: $sourcePath"
Write-Host "Marker file survived restart: $marker"
