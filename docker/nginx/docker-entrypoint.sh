#!/usr/bin/env sh
set -eu

envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf

exec "$@"