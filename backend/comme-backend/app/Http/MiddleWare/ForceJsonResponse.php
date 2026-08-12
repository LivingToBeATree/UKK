<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Forces every request to declare Accept: application/json, regardless
     * of what the client actually sent. Guarantees Laravel's error
     * responses (validation failures, 404s, 500s) always come back as
     * JSON — never an HTML error page — which matters here since a React
     * frontend can't parse HTML as an API response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
