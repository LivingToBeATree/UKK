<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Build CORS headers for file downloads that support credentials.
     * When withCredentials: true or fetch credentials: 'include' is sent by clients,
     * W3C CORS prohibits wildcard '*'. We dynamically reflect the allowed request Origin.
     */
    protected function getDownloadCorsHeaders(?Request $request = null, array $additionalHeaders = []): array
    {
        $request = $request ?? request();
        $origin = $request->header('Origin');
        $allowedOrigins = config('cors.allowed_origins', []);
        $isAllowed = $origin && (in_array($origin, $allowedOrigins, true) || in_array('*', $allowedOrigins, true));

        $headers = [
            'Access-Control-Allow-Origin' => $isAllowed ? $origin : ($origin ?: '*'),
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ];

        if ($isAllowed) {
            $headers['Access-Control-Allow-Credentials'] = 'true';
        }

        return array_merge($headers, $additionalHeaders);
    }
}
