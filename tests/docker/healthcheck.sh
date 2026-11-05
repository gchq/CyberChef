#!/usr/bin/env bash
# Copyright 2026 Crown Copyright
# Licensed under the Apache License, Version 2.0.
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <built-cyberchef-image>" >&2
    exit 1
fi

container=""
cleanup() {
    if [ -n "$container" ]; then
        docker rm -f "$container" >/dev/null
    fi
}
trap cleanup EXIT

# No published ports or external network are needed. Proxy settings must not
# redirect the local probe, even when inherited from a deployment environment.
container=$(docker run -d --network none \
    --health-interval=1s --health-timeout=10s \
    --health-start-period=1s --health-retries=1 \
    -e http_proxy=http://127.0.0.1:1 -e HTTP_PROXY=http://127.0.0.1:1 \
    -e ALL_PROXY=http://127.0.0.1:1 -e NO_PROXY= -e no_proxy= "$1")

wait_for_health() {
    local expected="$1"
    local actual
    for ((attempt = 0; attempt < 30; attempt++)); do
        actual=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$container")
        if [ "$actual" = "$expected" ]; then
            echo "Health status: $actual"
            return
        fi
        if [ "$actual" = missing ]; then
            echo "The image has no health check." >&2
            return 1
        fi
        sleep 1
    done
    docker inspect --format '{{json .State.Health}}' "$container" >&2
    echo "Expected health status: $expected" >&2
    return 1
}

wait_for_health healthy
# Force an HTTP error without stopping the container or nginx.
docker exec --user 0 "$container" mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.saved
wait_for_health unhealthy
docker exec --user 0 "$container" mv /usr/share/nginx/html/index.html.saved /usr/share/nginx/html/index.html
wait_for_health healthy
