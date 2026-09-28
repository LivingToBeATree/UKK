<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * Default to a locked-down proxy list unless explicitly configured via env.
     * A wildcard is intentionally not trusted here.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = ['127.0.0.1', '::1'];

    protected $headers =
        Request::HEADER_X_FORWARDED_FOR
        | Request::HEADER_X_FORWARDED_HOST
        | Request::HEADER_X_FORWARDED_PORT
        | Request::HEADER_X_FORWARDED_PROTO;
}
