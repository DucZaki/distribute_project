#!/usr/bin/env bash
# Khởi động lần lượt local (không qua docker) - hữu ích khi dev.
set -euo pipefail
cd "$(dirname "$0")/.."

MVN="./mvnw"
[ -x "$MVN" ] || MVN="mvn"

run() {
    local module=$1
    echo "[*] Starting $module"
    (cd "$module" && $MVN spring-boot:run) &
    sleep 3
}

echo "Make sure MySQL, Redis, Kafka, Zipkin are running (docker compose up -d mysql redis kafka zipkin)"

run discovery-server
sleep 10
run config-server
sleep 5
run identity-service
run tour-service
run booking-service
run payment-service
run review-service
run notification-service
run integration-service
run api-gateway
run web-bff

wait
