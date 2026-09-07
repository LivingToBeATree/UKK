#!/bin/sh

# Set fallback port
PORT="${PORT:-8080}"
echo "==> Starting Comme Backend on PORT=${PORT}..."

# Ensure all runtime directories exist with www-data permissions
mkdir -p /run/nginx \
         /var/log/nginx \
         /var/lib/nginx/tmp/client_body \
         /var/lib/nginx/tmp/proxy \
         /var/lib/nginx/tmp/fastcgi \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /run/nginx /var/log/nginx /var/lib/nginx
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Write clean default.conf for Nginx listening on ${PORT}
cat <<EOF > /etc/nginx/http.d/default.conf
server {
    listen ${PORT} default_server;
    server_name _;
    root /var/www/html/public;
    client_max_body_size 100M;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php\$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Clear stale host cache files
rm -f /var/www/html/bootstrap/cache/packages.php \
      /var/www/html/bootstrap/cache/services.php \
      /var/www/html/bootstrap/cache/config.php \
      /var/www/html/bootstrap/cache/routes-v7.php 2>/dev/null || true

# If APP_KEY is empty, generate one so encryption and cookie middleware don't throw MissingAppKeyException
if [ -z "${APP_KEY}" ]; then
    echo "==> APP_KEY not provided, generating key..."
    php artisan key:generate --no-interaction || true
fi

# Re-discover packages and create storage symlink safely
php artisan package:discover --ansi || true
php artisan storage:link --force || true

# Run migrations if RUN_MIGRATIONS=true
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "==> Waiting for database connection..."
    for i in $(seq 1 20); do
        if php artisan db:monitor >/dev/null 2>&1; then
            echo "==> Database connection established."
            break
        fi
        sleep 1
    done
    echo "==> Running database migrations..."
    php artisan migrate --force || echo "Warning: Migration failed, continuing startup..."
fi

echo "==> Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
