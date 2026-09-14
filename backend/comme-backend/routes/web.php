<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::withoutMiddleware([
    StartSession::class,
    EncryptCookies::class,
    ShareErrorsFromSession::class,
    ValidateCsrfToken::class,
])->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });

    Route::get('/explore', function () {
        return view('explore');
    });

    Route::get('/errors', function () {
        return view('errors');
    });

    if (app()->environment('local', 'testing')) {
        Route::get('/emails', function () {
            return view('emails-preview');
        });

        Route::get('/emails/render/{template}', function (string $template, Request $request) {
            $format = $request->query('format', 'html');
            $mockUser = (object) [
                'username' => 'alex_creator',
                'display_name' => 'Alex Rivera',
                'email' => 'alex@example.com',
            ];

            $templates = [
                'reset-password' => [
                    'view' => $format === 'text' ? 'emails.auth.reset-password-text' : 'emails.auth.reset-password',
                    'subject' => 'Reset Your Password',
                    'data' => [
                        'user' => $mockUser,
                        'resetUrl' => config('app.frontend_url') . '/reset-password?token=sample_verification_token_123456789&email=' . urlencode('alex@example.com'),
                        'expireMinutes' => 60,
                    ],
                ],
                'registration-code' => [
                    'view' => $format === 'text' ? 'emails.auth.registration-code-text' : 'emails.auth.registration-code',
                    'subject' => 'Verify your email - Your registration code',
                    'data' => [
                        'code' => '849201',
                        'ttlMinutes' => 15,
                    ],
                ],
                'password-changed' => [
                    'view' => $format === 'text' ? 'emails.auth.password-changed-text' : 'emails.auth.password-changed',
                    'subject' => 'Security Alert: Password Changed',
                    'data' => [
                        'user' => $mockUser,
                        'changedAt' => now()->format('F j, Y, g:i a T'),
                        'ipAddress' => '192.168.1.105 (Jakarta, Indonesia)',
                    ],
                ],
                'new-device' => [
                    'view' => $format === 'text' ? 'emails.auth.new-device-text' : 'emails.auth.new-device',
                    'subject' => 'Security Alert: New device sign-in',
                    'data' => [
                        'user' => $mockUser,
                        'loginTime' => now()->format('F j, Y, g:i a T'),
                        'ipAddress' => '192.168.1.105 (Jakarta, Indonesia)',
                        'userAgent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                    ],
                ],
            ];

            if (!isset($templates[$template])) {
                abort(404, 'Email template preview not found.');
            }

            $config = $templates[$template];
            $content = view($config['view'], $config['data'])->render();

            if ($format === 'text') {
                return response($content, 200, ['Content-Type' => 'text/plain; charset=utf-8']);
            }

            return response($content, 200, ['Content-Type' => 'text/html; charset=utf-8']);
        });
    }

    Route::get('/migrate-deploy', function (Request $request) {
        // Enforce strict environment or secret deployment token gate
        if (! app()->environment('local')) {
            $secret = config('app.deploy_secret');
            $provided = $request->header('X-Deploy-Token') ?: $request->query('token');
            if (empty($secret) || ! hash_equals((string) $secret, (string) $provided)) {
                abort(403, 'Unauthorized migration trigger.');
            }
        }

        try {
            Artisan::call('migrate:sync-existing');
            $syncOutput = Artisan::output();

            Artisan::call('migrate', ['--force' => true]);
            $migrateOutput = Artisan::output();

            return response()->json([
                'status' => 'SUCCESS',
                'sync_output' => $syncOutput,
                'migrate_output' => $migrateOutput,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Public migration trigger failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'ERROR',
                'message' => 'Migration execution failed. Check system logs for details.',
            ], 500);
        }
    });
});

// Direct storage file provider with directory traversal defense and strict public scope
Route::get('storage/{path}', function (Request $request, string $path) {
    $raw = urldecode($path);

    // Directory traversal defense: reject null bytes, directory climbs, and path separators
    if (str_contains($raw, "\0") || str_contains($raw, '..') || str_contains($raw, '\\')) {
        abort(404, 'Invalid storage path.');
    }

    $cleanPath = ltrim(explode('?', $raw)[0], '/');

    $allowedBases = array_filter([
        realpath(storage_path('app/public')),
        realpath(public_path('storage')),
    ]);

    $candidates = [
        storage_path('app/public/' . $cleanPath),
        public_path('storage/' . $cleanPath),
    ];

    $fullPath = null;
    foreach ($candidates as $candidate) {
        $real = realpath($candidate);
        if ($real && is_file($real)) {
            foreach ($allowedBases as $base) {
                if (str_starts_with($real, $base . DIRECTORY_SEPARATOR) || $real === $base) {
                    $fullPath = $real;
                    break 2;
                }
            }
        }
    }

    if (! $fullPath) {
        abort(404, 'File not found in storage: ' . $cleanPath);
    }

    $mimeType = @mime_content_type($fullPath) ?: 'application/octet-stream';
    $origin = $request->header('Origin');
    $allowedOrigins = config('cors.allowed_origins', []);
    $isAllowed = $origin && (in_array($origin, $allowedOrigins, true) || in_array('*', $allowedOrigins, true));
    $headers = [
        'Access-Control-Allow-Origin' => $isAllowed ? $origin : ($origin ?: '*'),
        'Access-Control-Allow-Methods' => 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers' => '*',
        'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Length',
        'Content-Type' => $mimeType,
    ];
    if ($isAllowed) {
        $headers['Access-Control-Allow-Credentials'] = 'true';
    }

    if ($request->has('download') || $request->query('download') === '1') {
        $filename = $request->query('name') ?: basename($fullPath);
        $filename = preg_replace('/[^\w\.\-\s\(\)\[\]]/', '_', $filename);
        return response()->download($fullPath, $filename, $headers);
    }

    return response()->file($fullPath, $headers);
})->where('path', '.*');

