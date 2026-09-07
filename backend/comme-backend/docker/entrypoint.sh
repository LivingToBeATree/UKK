#!/bin/sh
set -e

# Ensure PORT is defined (defaults to 8080 for Cloud Run)
PORT="${PORT:-8080}"
echo "==> Starting Comme Backend Container on port ${PORT}..."

# Create runtime directories if missing
mkdir -p /run/nginx /var/log/nginx /var/lib/nginx/tmp \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/storage/app/public \
    /var/www/html/bootstrap/cache

# Write clean Nginx configuration bound to IPv4 ${PORT}
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

# Ensure file ownership and permissions for web server
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /run/nginx /var/log/nginx /var/lib/nginx || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

# Clear stale host cache files
rm -f /var/www/html/bootstrap/cache/packages.php /var/www/html/bootstrap/cache/services.php /var/www/html/bootstrap/cache/config.php /var/www/html/bootstrap/cache/routes-v7.php || true

# Re-discover packages and create storage link
php artisan package:discover --ansi || true
php artisan storage:link --force || true

# Run migrations if explicitly requested
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "==> Running database migrations..."
    php artisan migrate --force || echo "Warning: Migration failed, continuing startup..."
fi

# Cache views if in production
if [ "${APP_ENV:-local}" = "production" ]; then
    php artisan view:cache || true
fi

echo "==> Handing over to Supervisord (PHP-FPM + NGINX)..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
