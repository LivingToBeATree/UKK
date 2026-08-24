@extends('layouts.app')

@section('title', 'Comme API — Error Codes & Error Collection Reference')

@section('content')
<!-- Hero Section -->
<section style="margin-bottom: 56px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 40px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span class="auth-badge" style="background: rgba(255, 67, 101, 0.15); color: var(--brand-rose); border-color: rgba(255, 67, 101, 0.3);">
            Error Catalog v1.0
        </span>
        <span style="font-size: 13px; color: var(--text-muted);">Standardized RFC-7807 Compliant Envelopes</span>
    </div>
    
    <h1 class="heading-gradient" style="font-size: 38px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px;">
        API Error Collection & Handling Guide
    </h1>
    
    <p style="font-size: 16px; color: var(--text-secondary); max-width: 840px; line-height: 1.65; margin-bottom: 28px;">
        Every failure response across the Comme REST API adheres to a unified JSON error envelope with predictable HTTP status codes, machine-parseable status tokens, human-readable explanations, and field-level validation dictionaries.
    </p>

    <!-- Standard Error Envelope Blueprint -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 24px; margin-top: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--brand-rose); box-shadow: 0 0 10px var(--brand-rose);"></span>
                <span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Standard Error Response Envelope</span>
            </div>
            <button class="btn btn-copy" onclick="copyCode(this, 'code-error-envelope')">Copy Envelope</button>
        </div>

        <div class="code-container" style="margin: 0;">
            <div class="code-header">
                <span>JSON Error Envelope Schema</span>
                <span style="color: var(--brand-rose); font-weight: 600;">Status: ERROR</span>
            </div>
            <div id="code-error-envelope" class="code-block">{
  "status_code": 401,
  "status": "ERROR",
  "message": "Unauthenticated.",
  "errors": null
}</div>
        </div>

        <!-- Envelope Attributes Table -->
        <table class="param-table" style="margin-top: 18px;">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="param-name">status_code</span></td>
                    <td><span class="param-type">integer</span></td>
                    <td>Mirrors the HTTP response status code (e.g. <code>401</code>, <code>403</code>, <code>422</code>, <code>429</code>).</td>
                </tr>
                <tr>
                    <td><span class="param-name">status</span></td>
                    <td><span class="param-type">string</span></td>
                    <td>Always literal <code>"ERROR"</code> for failure responses (and <code>"SUCCESS"</code> for successful requests).</td>
                </tr>
                <tr>
                    <td><span class="param-name">message</span></td>
                    <td><span class="param-type">string</span></td>
                    <td>Human-readable summary of the error suitable for toast notifications or alerts.</td>
                </tr>
                <tr>
                    <td><span class="param-name">errors</span></td>
                    <td><span class="param-type">object | null</span></td>
                    <td>Granular field-specific validation errors dictionary (present on <code>422</code>), or <code>null</code>.</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>

<!-- Error Filter Bar -->
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; align-items: center;">
    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-right: 6px;">Filter Codes:</span>
    <a href="#error-401" class="method-pill method-post" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">401 Unauthenticated</a>
    <a href="#error-403" class="method-pill method-patch" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">403 Forbidden</a>
    <a href="#error-422" class="method-pill method-delete" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">422 Validation</a>
    <a href="#error-404" class="method-pill method-get" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">404 Not Found</a>
    <a href="#error-409" class="method-pill method-patch" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">409 Conflict</a>
    <a href="#error-429" class="method-pill method-delete" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">429 Throttled</a>
    <a href="#error-405" class="method-pill method-post" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">405 Method</a>
    <a href="#error-400" class="method-pill method-get" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">400 Bad Request</a>
    <a href="#error-500" class="method-pill method-delete" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">500 Server Error</a>
</div>

<!-- 401 Unauthenticated -->
<div class="endpoint-card" id="error-401">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-delete">401</span>
            <span>UNAUTHORIZED / UNAUTHENTICATED</span>
        </div>
        <span class="auth-badge" style="color: var(--brand-rose); border-color: rgba(255, 67, 101, 0.3);">Auth Barrier</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned whenever an API route protected by <code>auth:sanctum</code> is accessed without a valid Bearer token, or if the token has expired, been revoked, or contains an invalid signature.
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (401 Unauthorized)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-401')">Copy</button>
            </div>
            <div id="code-error-401" class="code-block">{
  "status_code": 401,
  "status": "ERROR",
  "message": "Unauthenticated."
}</div>
        </div>

        <div style="background: rgba(168, 2, 245, 0.08); border-left: 3px solid var(--brand-purple); border-radius: 6px; padding: 12px 16px; margin-top: 14px;">
            <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Frontend Integration Tip</div>
            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                When your HTTP interceptor (e.g. Axios) receives a <code>401</code>, clear the stored token from localStorage / cookies and redirect the user to the login screen. Ensure all authenticated requests send the header:
                <code style="color: var(--brand-teal); font-size: 12px;">Authorization: Bearer &lt;token&gt;</code>
            </div>
        </div>
    </div>
</div>

<!-- 403 Forbidden -->
<div class="endpoint-card" id="error-403">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-patch">403</span>
            <span>FORBIDDEN / ACCESS DENIED</span>
        </div>
        <span class="auth-badge staff">Role / Permission Check</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            The user is authenticated, but does not have permission to perform this specific action.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 10px;">
            <!-- Example A: Non-Staff Accessing Staff Endpoints -->
            <div class="code-container">
                <div class="code-header"><span>Non-Staff on Staff Route</span></div>
                <div class="code-block">{
  "status_code": 403,
  "status": "ERROR",
  "message": "This action is unauthorized."
}</div>
            </div>

            <!-- Example B: Non-Artist Creating Services -->
            <div class="code-container">
                <div class="code-header"><span>Regular User Creating Service</span></div>
                <div class="code-block">{
  "status_code": 403,
  "status": "ERROR",
  "message": "You must have an approved artist profile to create commission services."
}</div>
            </div>

            <!-- Example C: Third Party Accessing Order Chat -->
            <div class="code-container">
                <div class="code-header"><span>Unauthorized Commission Chat</span></div>
                <div class="code-block">{
  "status_code": 403,
  "status": "ERROR",
  "message": "Only commission order participants may view or send messages."
}</div>
            </div>
        </div>
    </div>
</div>

<!-- 422 Validation Error -->
<div class="endpoint-card" id="error-422">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-delete">422</span>
            <span>UNPROCESSABLE ENTITY / VALIDATION ERROR</span>
        </div>
        <span class="auth-badge">Input Validation</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when request payload fails schema or business validation rules. The <code>errors</code> dictionary contains an array of failure reasons keyed by input field names.
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (422 Unprocessable Content)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-422')">Copy</button>
            </div>
            <div id="code-error-422" class="code-block">{
  "status_code": 422,
  "status": "ERROR",
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email field must be a valid email address.",
      "The email has already been taken."
    ],
    "username": [
      "The username may only contain letters, numbers, and underscores."
    ],
    "password": [
      "The password confirmation does not match.",
      "The password must be at least 8 characters."
    ]
  }
}</div>
        </div>

        <div style="background: rgba(2, 245, 168, 0.08); border-left: 3px solid var(--brand-teal); border-radius: 6px; padding: 12px 16px; margin-top: 14px;">
            <div style="font-weight: 700; font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Frontend Form Binding</div>
            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                In React/Vue, iterate over <code>Object.entries(response.data.errors)</code> to attach red error helper text directly below the corresponding form input fields.
            </div>
        </div>
    </div>
</div>

<!-- 404 Not Found -->
<div class="endpoint-card" id="error-404">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-get">404</span>
            <span>NOT FOUND</span>
        </div>
        <span class="auth-badge">Resource Resolution</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when the requested URL does not match any registered endpoint, or when an Eloquent model ID passed in the route parameter does not exist in the database (e.g. <code>/api/commissions/99999</code>).
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (404 Not Found)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-404')">Copy</button>
            </div>
            <div id="code-error-404" class="code-block">{
  "status_code": 404,
  "status": "ERROR",
  "message": "The requested resource was not found."
}</div>
        </div>
    </div>
</div>

<!-- 409 Conflict -->
<div class="endpoint-card" id="error-409">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-patch">409</span>
            <span>CONFLICT / BUSINESS RULE VIOLATION</span>
        </div>
        <span class="auth-badge">State Collision</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when an action cannot be completed due to a state collision with existing business rules.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 10px;">
            <div class="code-container">
                <div class="code-header"><span>Duplicate Artist Application</span></div>
                <div class="code-block">{
  "status_code": 409,
  "status": "ERROR",
  "message": "You already have a pending artist application under review."
}</div>
            </div>

            <div class="code-container">
                <div class="code-header"><span>Self Follow Collision</span></div>
                <div class="code-block">{
  "status_code": 409,
  "status": "ERROR",
  "message": "You cannot follow your own account."
}</div>
            </div>

            <div class="code-container">
                <div class="code-header"><span>Duplicate Review Submission</span></div>
                <div class="code-block">{
  "status_code": 409,
  "status": "ERROR",
  "message": "You have already submitted a review for this commission."
}</div>
            </div>
        </div>
    </div>
</div>

<!-- 429 Too Many Requests -->
<div class="endpoint-card" id="error-429">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-delete">429</span>
            <span>TOO MANY REQUESTS / RATE LIMIT EXCEEDED</span>
        </div>
        <span class="auth-badge" style="color: var(--brand-gold); border-color: rgba(245, 170, 2, 0.3);">Throttling Guard</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when a client sends more requests than permitted by the rate limit tier. Look at the <code>Retry-After</code> response header for the number of seconds to back off before retrying.
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (429 Too Many Requests)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-429')">Copy</button>
            </div>
            <div id="code-error-429" class="code-block">{
  "status_code": 429,
  "status": "ERROR",
  "message": "Too Many Requests."
}</div>
        </div>

        <table class="param-table" style="margin-top: 16px;">
            <thead>
                <tr>
                    <th>Endpoint Group</th>
                    <th>Rate Limit Tier</th>
                    <th>Window</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="param-name">Standard API Endpoints</span></td>
                    <td><code>60 requests</code></td>
                    <td>per minute per user/IP</td>
                </tr>
                <tr>
                    <td><span class="param-name">POST /api/register (OTP Dispatch)</span></td>
                    <td><code>5 attempts</code></td>
                    <td>per 15-minute OTP window</td>
                </tr>
                <tr>
                    <td><span class="param-name">POST /api/forgot-password & Reset</span></td>
                    <td><code>6 requests</code></td>
                    <td>per minute</td>
                </tr>
                <tr>
                    <td><span class="param-name">POST /api/email/verification-notification</span></td>
                    <td><code>6 requests</code></td>
                    <td>per minute</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- 405 Method Not Allowed -->
<div class="endpoint-card" id="error-405">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-post">405</span>
            <span>METHOD NOT ALLOWED</span>
        </div>
        <span class="auth-badge">HTTP Verbs</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when calling a route with an unsupported HTTP method (for instance, performing a <code>GET</code> request on <code>/api/register</code> which only accepts <code>POST</code>).
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (405 Method Not Allowed)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-405')">Copy</button>
            </div>
            <div id="code-error-405" class="code-block">{
  "status_code": 405,
  "status": "ERROR",
  "message": "This HTTP method is not supported for this endpoint."
}</div>
        </div>
    </div>
</div>

<!-- 400 Bad Request -->
<div class="endpoint-card" id="error-400">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-get">400</span>
            <span>BAD REQUEST</span>
        </div>
        <span class="auth-badge">Malformed Request</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when the client sends malformed JSON syntax in the request body, or fails low-level protocol expectations.
        </p>

        <div class="code-container">
            <div class="code-header">
                <span>Response (400 Bad Request)</span>
                <button class="btn btn-copy" onclick="copyCode(this, 'code-error-400')">Copy</button>
            </div>
            <div id="code-error-400" class="code-block">{
  "status_code": 400,
  "status": "ERROR",
  "message": "Malformed JSON payload or invalid request syntax."
}</div>
        </div>
    </div>
</div>

<!-- 500 Internal Server Error -->
<div class="endpoint-card" id="error-500">
    <div class="endpoint-header">
        <div class="endpoint-path">
            <span class="method-pill method-delete">500</span>
            <span>INTERNAL SERVER ERROR</span>
        </div>
        <span class="auth-badge" style="color: var(--brand-rose); border-color: rgba(255, 67, 101, 0.3);">Server Exception</span>
    </div>
    <div class="endpoint-body">
        <p style="font-size: 14px; color: var(--text-secondary);">
            Returned when an unhandled server exception or critical database outage occurs. In production environments, internals and traces are masked for security.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-top: 10px;">
            <div class="code-container">
                <div class="code-header"><span>Production Response (Masked)</span></div>
                <div class="code-block">{
  "status_code": 500,
  "status": "ERROR",
  "message": "Something went wrong. Please try again later."
}</div>
            </div>

            <div class="code-container">
                <div class="code-header"><span>Local Debug (APP_DEBUG=true)</span></div>
                <div class="code-block">{
  "status_code": 500,
  "status": "ERROR",
  "message": "SQLSTATE[08006] Connection refused...",
  "errors": {
    "exception": "Illuminate\\Database\\QueryException"
  }
}</div>
            </div>
        </div>
    </div>
</div>
@endsection
