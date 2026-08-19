#!/bin/sh
set -e

# Support Cloud Run dynamic $PORT environment variable (defaults to 8000)
PORT=${PORT:-8000}
sed -i "s/listen 8000;/listen ${PORT};/g" /etc/nginx/http.d/default.conf || true
sed -i "s/listen \[::\]:8000;/listen \[::\]:${PORT};/g" /etc/nginx/http.d/default.conf || true

# Run migrations if RUN_MIGRATIONS is set to true
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

# In production, optimize caches
if [ "${APP_ENV:-local}" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

exec /usr/bin/supervisord -c /etc/supervisord.conf
