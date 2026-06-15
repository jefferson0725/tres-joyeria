#!/bin/sh
set -e

echo "[entrypoint] Ejecutando migraciones..."
node scripts/migrate.js

echo "[entrypoint] Iniciando servidor..."
exec "$@"
