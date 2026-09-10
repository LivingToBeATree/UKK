<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-ID');

        if (empty($requestId) || ! is_string($requestId) || strlen($requestId) > 64) {
            $requestId = (string) Str::uuid();
            $request->headers->set('X-Request-ID', $requestId);
        }

        $context = [
            'request_id' => $requestId,
            'ip' => $request->ip(),
            'method' => $request->method(),
            'path' => $request->path(),
        ];

        if ($request->user()) {
            $context['user_id'] = $request->user()->id;
        }

        Log::withContext($context);

        $response = $next($request);

        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
