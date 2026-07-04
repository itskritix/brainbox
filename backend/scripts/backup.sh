#!/usr/bin/env bash
# Nightly backup of the Brainbox Postgres DB + local file storage.
# Keeps the last 14 daily backups. Wired via crontab (see `crontab -l`).
set -euo pipefail

BACKUP_DIR="/home/ubuntu/brainbox-backups"
APP_DIR="/home/ubuntu/brainbox/backend"
STAMP="$(date +%Y%m%d-%H%M%S)"
RETAIN_DAYS=14

mkdir -p "$BACKUP_DIR"

# Pull DATABASE_URL from the app env file.
DB_URL="$(grep -E '^DATABASE_URL=' "$APP_DIR/.env" | cut -d= -f2-)"

# Postgres dump (custom format, compressed).
pg_dump "$DB_URL" -Fc -f "$BACKUP_DIR/db-$STAMP.dump"

# Local uploaded files (screenshots / crops / sessions). The bundled prod build
# resolves its storage dir to the repo root, dev/tests to backend/ - cover both.
STORAGE_DIRS=()
[ -d "/home/ubuntu/brainbox/.storage" ] && STORAGE_DIRS+=(-C /home/ubuntu/brainbox .storage)
[ -d "$APP_DIR/.storage" ] && STORAGE_DIRS+=(-C "$APP_DIR" .storage)
if [ ${#STORAGE_DIRS[@]} -gt 0 ]; then
  tar -czf "$BACKUP_DIR/storage-$STAMP.tar.gz" "${STORAGE_DIRS[@]}"
fi

# Prune anything older than the retention window.
find "$BACKUP_DIR" -name 'db-*.dump' -mtime +"$RETAIN_DAYS" -delete
find "$BACKUP_DIR" -name 'storage-*.tar.gz' -mtime +"$RETAIN_DAYS" -delete

echo "[$(date -Is)] backup ok: db-$STAMP.dump + storage-$STAMP.tar.gz"
