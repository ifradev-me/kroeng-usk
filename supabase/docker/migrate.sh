#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# KROENG USK – Migration Runner
# Dijalankan oleh service db-migrate di docker-compose.yml
# Idempotent: tracking tabel _app_migrations mencegah re-run migration
# ─────────────────────────────────────────────────────────────────────────────

set -e

DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"
MIGRATIONS_DIR="/migrations"

echo "[migrate] Menunggu PostgreSQL siap..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -q; do
  sleep 2
done
echo "[migrate] Database siap."

# Buat tabel tracking migration jika belum ada
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "
  CREATE TABLE IF NOT EXISTS _app_migrations (
    name        TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  );
"

# Fungsi: jalankan satu migration jika belum diapply
run_migration() {
  local filepath="$1"
  local name
  name="$(basename "$filepath")"

  local count
  count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM _app_migrations WHERE name = '$name';" | tr -d '[:space:]')

  if [ "$count" = "0" ]; then
    echo "[migrate] Applying: $name"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$filepath"
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
      "INSERT INTO _app_migrations (name) VALUES ('$name');"
    echo "[migrate] Done: $name"
  else
    echo "[migrate] Skip (already applied): $name"
  fi
}

# ─── Jalankan migrations dalam urutan ─────────────────────────────────────────
run_migration "$MIGRATIONS_DIR/20260312171626_001_initial_schema.sql"
run_migration "$MIGRATIONS_DIR/20260411000000_002_divisions_and_member_email.sql"
run_migration "$MIGRATIONS_DIR/20260411000001_003_divisions_links.sql"
run_migration "$MIGRATIONS_DIR/20260411000001_003_news_knowledge_links.sql"
run_migration "$MIGRATIONS_DIR/20260412000000_004_member_applications.sql"
run_migration "$MIGRATIONS_DIR/20260414000000_005_security_fixes.sql"

echo "[migrate] Semua migration selesai."
