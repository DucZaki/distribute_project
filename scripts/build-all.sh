#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[*] Building all modules with Maven..."
if [ -x ./mvnw ]; then
    ./mvnw -B -DskipTests clean package
else
    mvn -B -DskipTests clean package
fi

echo "[*] Building docker images..."
docker compose build

echo "[OK] Done. Run: docker compose up -d"
