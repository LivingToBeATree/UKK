@extends('layouts.app')

@section('title', 'Comme REST API Documentation')

@section('content')
<!-- Hero Section -->
<section id="getting-started" style="margin-bottom: 56px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 40px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span class="auth-badge" style="background: rgba(156, 11, 218, 0.15); color: #c464fa; border-color: rgba(156, 11, 218, 0.3);">REST API v1</span>
        <span style="font-size: 13px; color: var(--text-muted);">JSON:API Compliant</span>
    </div>
    
    <h1 style="font-size: 38px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px; background: linear-gradient(135deg, #ffffff 0%, #d1c8e8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Comme Platform API Reference
    </h1>
    
    <p style="font-size: 16px; color: var(--text-secondary); max-width: 800px; line-height: 1.65; margin-bottom: 28px;">
        Complete developer documentation for the Comme creator & art commission platform. Integrate registration with email OTP verification, artist vetting, custom commission orders with revision workflows, direct messaging, feed engagement, and Midtrans Snap payments.
    </p>

    <!-- Base URLs & Quick Specs -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Live Production URL</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--brand-teal); word-break: break-all;">
                https://comme-backend-861966182598.asia-southeast2.run.app
            </div>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Local Docker URL</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--brand-yellow);">
                http://localhost:8000
            </div>
        </div>
    </div>
</section>

<!-- Authentication Flow Guide -->
<section id="authentication-flow" style="margin-bottom: 56px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 40px;">
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Authentication & Headers</h2>
    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        All API requests should include the following standard HTTP headers:
    </p>

    <div class="code-container">
        <div class="code-header">
            <span>HTTP Request Headers</span>
            <button class="btn btn-copy" onclick="copyCode(this, 'code-headers')">Copy</button>
        </div>
        <div id="code-headers" class="code-block">Accept: application/json
Content-Type: application/json
Authorization: Bearer &lt;personal_access_token&gt;</div>
    </div>
</section>

<!-- SECTION 1: AUTHENTICATION -->
<section id="auth-section" style="margin-bottom: 64px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div>
            <h2 style="font-size: 24px; font-weight: 700;">1. Authentication & Security</h2>
            <p style="font-size: 14px; color: var(--text-secondary);">Email OTP registration, login with device tracking, session, and password management.</p>
        </div>
    </div>

    <!-- POST /api/register -->
    <div class="endpoint-card" id="post-api-register">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/register</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Public</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/register', { email: 'user@example.com', username: 'artist_reya', password: 'Password123!', password_confirmation: 'Password123!' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Submits initial registration details. Instead of creating the user immediately, sends a 6-digit OTP code to the email.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">email</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Valid email address (unique in users and pending).</td></tr>
                    <tr><td><span class="param-name">username</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Unique handle (3-30 chars, alphanumeric/underscore).</td></tr>
                    <tr><td><span class="param-name">password</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Minimum 8 characters.</td></tr>
                    <tr><td><span class="param-name">password_confirmation</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Must match password.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "message": "Verification code sent to your email.",
  "email": "user@example.com",
  "expires_in_minutes": 15
}</div>
            </div>
        </div>
    </div>

    <!-- POST /api/register/confirm -->
    <div class="endpoint-card" id="post-api-register-confirm">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/register/confirm</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Public</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/register/confirm', { email: 'user@example.com', code: '123456' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Confirms the 6-digit email OTP. Automatically creates the verified user record and returns the Sanctum authentication token.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">email</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Registered email address.</td></tr>
                    <tr><td><span class="param-name">code</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>6-digit numeric verification code.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (201 Created)</span></div>
                <div class="code-block">{
  "token": "1|AbCdEf123456...",
  "user": {
    "id": 1,
    "username": "artist_reya",
    "email": "user@example.com",
    "display_name": "artist_reya",
    "role": "user",
    "email_verified_at": "2026-08-19T09:00:00.000000Z"
  }
}</div>
            </div>
        </div>
    </div>

    <!-- POST /api/login -->
    <div class="endpoint-card" id="post-api-login">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/login</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Public</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/login', { email: 'user@example.com', password: 'Password123!' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Authenticates user by email/password. Automatically detects unknown devices and dispatches security alert email on unrecognized sign-in.
            </p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "token": "2|XyZ789...",
  "user": {
    "id": 1,
    "username": "artist_reya",
    "display_name": "artist_reya",
    "role": "artist",
    "artist_profile": { "id": 1, "commission_status": "open" }
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /api/me -->
    <div class="endpoint-card" id="get-api-me">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/me</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Returns currently logged-in user profile, roles, and artist profile if applicable.</p>
        </div>
    </div>

    <!-- POST /api/logout -->
    <div class="endpoint-card" id="post-api-logout">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/logout</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Authenticated</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/logout')">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Revokes the current Sanctum token and ends the session.</p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{ "message": "Logged out successfully." }</div>
            </div>
        </div>
    </div>

    <!-- POST /api/forgot-password -->
    <div class="endpoint-card" id="post-api-forgot-password">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/forgot-password</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Public</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/forgot-password', { email: 'user@example.com' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Sends a password reset link to the provided email address. Rate-limited to 6 requests per minute.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">email</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Registered email address.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{ "message": "Password reset link sent." }</div>
            </div>
        </div>
    </div>

    <!-- POST /api/reset-password -->
    <div class="endpoint-card" id="post-api-reset-password">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/reset-password</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Public</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'POST', '/api/reset-password', { token: 'reset-token', email: 'user@example.com', password: 'NewPassword123!', password_confirmation: 'NewPassword123!' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Resets user password using the token from the email link. Sends a "Password Changed" confirmation notification.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">token</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Password reset token from email.</td></tr>
                    <tr><td><span class="param-name">email</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Registered email address.</td></tr>
                    <tr><td><span class="param-name">password</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>New password (min 8 chars).</td></tr>
                    <tr><td><span class="param-name">password_confirmation</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Must match password.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- PUT /api/profile/password (change password) -->
    <div class="endpoint-card" id="post-api-change-password">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">PUT</span>
                <span>/api/profile/password</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span class="auth-badge">Authenticated</span>
                <button class="btn btn-copy" onclick="copyCurl(this, 'PUT', '/api/profile/password', { current_password: 'OldPassword!', password: 'NewPassword123!', password_confirmation: 'NewPassword123!' })">Copy cURL</button>
            </div>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Changes password for the authenticated user. Requires current password verification. Sends a "Password Changed" notification.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">current_password</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Existing password for verification.</td></tr>
                    <tr><td><span class="param-name">password</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>New password (min 8 chars).</td></tr>
                    <tr><td><span class="param-name">password_confirmation</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Must match new password.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- SECTION 2: ARTIST APPLICATIONS -->
<section id="apps-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">2. Artist Applications & Seller Vetting</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Submission, queue moderation, and atomic artist profile activation on approval.</p>
    </div>

    <!-- POST /api/artist-applications -->
    <div class="endpoint-card" id="post-api-artist-applications">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/artist-applications</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Submits portfolio links and bio to request seller privileges. Only 1 pending application allowed per user.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">portfolio_url</span> <span class="param-required">req</span></td><td><span class="param-type">url</span></td><td>External portfolio link (ArtStation, Behance, X, etc.).</td></tr>
                    <tr><td><span class="param-name">social_links</span> <span class="param-optional">opt</span></td><td><span class="param-type">array</span></td><td>List of social profile URLs.</td></tr>
                    <tr><td><span class="param-name">note</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Pitch or message to reviewing staff.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (201 Created)</span></div>
                <div class="code-block">{
  "id": 1,
  "user_id": 4,
  "status": "pending",
  "portfolio_url": "https://artstation.com/reya_art",
  "created_at": "2026-08-19T09:15:00.000000Z"
}</div>
            </div>
        </div>
    </div>

    <!-- GET /api/artist-applications/my-application -->
    <div class="endpoint-card" id="get-api-artist-applications-my">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/artist-applications/my-application</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Returns the current user's own artist application and its status (pending/approved/rejected).</p>
        </div>
    </div>

    <!-- GET /api/artist-applications -->
    <div class="endpoint-card" id="get-api-artist-applications">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/artist-applications</span>
            </div>
            <span class="auth-badge staff">Staff Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists all artist applications with pagination. Staff/admin only — regular users receive 403.</p>
        </div>
    </div>

    <!-- POST /api/artist-applications/{id}/approve -->
    <div class="endpoint-card" id="post-api-artist-applications-approve">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/artist-applications/{id}/approve</span>
            </div>
            <span class="auth-badge staff">Staff Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Approves application. Promotes user role to <code>artist</code>, creates artist profile, and dispatches approval email.
            </p>
        </div>
    </div>

    <!-- POST /api/artist-applications/{id}/reject -->
    <div class="endpoint-card" id="post-api-artist-applications-reject">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/artist-applications/{id}/reject</span>
            </div>
            <span class="auth-badge staff">Staff Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Rejects application with structured reason. Allows the user to reapply later.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">reason</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Rejection explanation sent to applicant via email.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- SECTION 3: COMMISSION SERVICES & ORDERS -->
<section id="commissions-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">3. Commission Services & Orders</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Service catalog, order lifecycle, status transitions, revisions, and reviews.</p>
    </div>

    <!-- GET /api/commission-services -->
    <div class="endpoint-card" id="get-api-commission-services">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/commission-services</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists all available commission service listings with pricing, categories, and artist info. Paginated.</p>
        </div>
    </div>

    <!-- POST /api/commission-services -->
    <div class="endpoint-card" id="post-api-commission-services">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commission-services</span>
            </div>
            <span class="auth-badge">Artist Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Creates a new commission service listing. Only users with an artist profile can create services.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">title</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Service title (e.g. "Full Character Illustration").</td></tr>
                    <tr><td><span class="param-name">description</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Detailed description of the service.</td></tr>
                    <tr><td><span class="param-name">price</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>Price in IDR (smallest unit).</td></tr>
                    <tr><td><span class="param-name">max_revisions</span> <span class="param-optional">opt</span></td><td><span class="param-type">integer</span></td><td>Maximum free revisions included.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- GET /api/commissions -->
    <div class="endpoint-card" id="get-api-commissions">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/commissions</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists commissions for the authenticated user — both as buyer and as artist. Paginated.</p>
        </div>
    </div>

    <!-- POST /api/commissions -->
    <div class="endpoint-card" id="post-api-commissions">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Creates a new commission order from a service listing. The artist receives a notification.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">commission_service_id</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>ID of the service to order.</td></tr>
                    <tr><td><span class="param-name">notes</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Additional instructions for the artist.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- PATCH /api/commissions/{id}/cancel -->
    <div class="endpoint-card" id="patch-api-commissions-status">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-patch">PATCH</span>
                <span>/api/commissions/{id}/cancel</span>
            </div>
            <span class="auth-badge">Order Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Cancels the commission. Can be called by either buyer or artist depending on commission status.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/revisions -->
    <div class="endpoint-card" id="post-api-commission-revisions">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/revisions</span>
            </div>
            <span class="auth-badge">Order Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Submits a revision request or deliverable on the commission. Tracks revision count against the max allowed.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/reviews -->
    <div class="endpoint-card" id="post-api-commission-reviews">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/reviews</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Leaves a review and rating on a completed commission. One review per commission.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">rating</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>1-5 star rating.</td></tr>
                    <tr><td><span class="param-name">comment</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Review text.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- SECTION 3b: COMMISSION CHAT -->
<section id="chat-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">3b. Commission Chat</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Direct messaging between buyer and artist within a commission order.</p>
    </div>

    <!-- GET /api/commissions/{id}/messages -->
    <div class="endpoint-card" id="get-api-commission-messages">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/commissions/{id}/messages</span>
            </div>
            <span class="auth-badge">Order Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists chat history for an active commission between buyer and artist.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/messages -->
    <div class="endpoint-card" id="post-api-commission-messages">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/messages</span>
            </div>
            <span class="auth-badge">Order Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Sends a message on a commission thread and notifies the recipient.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">message</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Message content.</td></tr>
                    <tr><td><span class="param-name">media_ids</span> <span class="param-optional">opt</span></td><td><span class="param-type">array</span></td><td>Attached media file IDs.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>

<!-- SECTION 4: FEED & SOCIAL -->
<section id="social-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">4. Feed, Posts & Social</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Explore posts, like/bookmark artwork, comment, and follow artists.</p>
    </div>

    <!-- GET /api/posts -->
    <div class="endpoint-card" id="get-api-posts">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/posts</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists public feed posts from artists. Paginated with optional filters.</p>
        </div>
    </div>

    <!-- POST /api/posts -->
    <div class="endpoint-card" id="post-api-posts">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/posts</span>
            </div>
            <span class="auth-badge">Artist Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Creates a new artwork post. Artists can share portfolio pieces, WIPs, and completed commissions.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">content</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Post caption or description.</td></tr>
                    <tr><td><span class="param-name">media_ids</span> <span class="param-optional">opt</span></td><td><span class="param-type">array</span></td><td>Array of uploaded media IDs to attach.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- POST /api/posts/{id}/like -->
    <div class="endpoint-card" id="post-api-posts-like">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/posts/{id}/like</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Toggles post like state (adds like if not liked, unlikes if already liked).</p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{ "liked": true, "likes_count": 42 }</div>
            </div>
        </div>
    </div>

    <!-- POST /api/posts/{id}/bookmark -->
    <div class="endpoint-card" id="post-api-posts-bookmark">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/posts/{id}/bookmark</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Toggles bookmark for current user. Saved posts appear in <code>GET /api/me/bookmarks</code>.</p>
        </div>
    </div>

    <!-- GET /api/me/bookmarks -->
    <div class="endpoint-card" id="get-api-me-bookmarks">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/me/bookmarks</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists all posts bookmarked by the current user. Paginated.</p>
        </div>
    </div>

    <!-- POST /api/post-comments -->
    <div class="endpoint-card" id="post-api-post-comments">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/posts/{post}/comments</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Adds a comment to a post. Notifies the post author.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">body</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Comment text.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- POST /api/users/{id}/follow -->
    <div class="endpoint-card" id="post-api-users-follow">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/users/{id}/follow</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Toggles follow/unfollow for the target user. Cannot follow yourself.</p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{ "following": true }</div>
            </div>
        </div>
    </div>

    <!-- GET /api/users/{id}/followers -->
    <div class="endpoint-card" id="get-api-users-followers">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/users/{id}/followers</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists users who follow the specified user. Paginated.</p>
        </div>
    </div>
</section>

<!-- SECTION 4b: NOTIFICATIONS -->
<section id="notifications-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">4b. Notifications</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Query, manage, and mark notifications as read for the authenticated user.</p>
    </div>

    <!-- GET /api/notifications -->
    <div class="endpoint-card" id="get-api-notifications">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/notifications</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Fetches paginated user notifications. Filter with <code>?unread=true</code>.</p>
        </div>
    </div>

    <!-- GET /api/notifications/unread-count -->
    <div class="endpoint-card" id="get-api-notifications-unread">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/notifications/unread-count</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Returns the count of unread notifications for badge display.</p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{ "unread_count": 7 }</div>
            </div>
        </div>
    </div>

    <!-- PATCH /api/notifications/read-all -->
    <div class="endpoint-card" id="patch-api-notifications-read-all">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-patch">PATCH</span>
                <span>/api/notifications/read-all</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Marks all of the current user's notifications as read in one batch.</p>
        </div>
    </div>

    <!-- PATCH /api/notifications/{id}/read -->
    <div class="endpoint-card" id="patch-api-notifications-read">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-patch">PATCH</span>
                <span>/api/notifications/{id}/read</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Marks a single notification as read. Only the notification owner can mark it.</p>
        </div>
    </div>
</section>

<!-- SECTION 5: PAYMENTS -->
<section id="payments-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">5. Midtrans Payments & Webhooks</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Snap token generation and webhook status callbacks.</p>
    </div>

    <!-- POST /api/commissions/{id}/payment-token -->
    <div class="endpoint-card" id="post-api-payments-token">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/payment-token</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Generates Midtrans Snap token for instant escrow payment checkout.</p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "snap_token": "midtrans-snap-token-xyz-12345",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
}</div>
            </div>
        </div>
    </div>

    <!-- POST /api/webhooks/midtrans -->
    <div class="endpoint-card" id="post-api-webhooks-midtrans">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/webhooks/midtrans</span>
            </div>
            <span class="auth-badge">Midtrans Server Webhook</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Validates SHA-512 signature from Midtrans and updates commission payment status to <code>paid</code> or <code>failed</code>.
            </p>
        </div>
    </div>
</section>

<!-- SECTION 6: MODERATION & SUPPORT -->
<section id="moderation-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700;">6. Moderation & Support Tickets</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Content reporting, support tickets, and staff moderation workflows.</p>
    </div>

    <!-- POST /api/reports -->
    <div class="endpoint-card" id="post-api-reports">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/reports</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Submits a content report for review by staff. Can report posts, users, or commission disputes.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">reportable_type</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Type of content being reported (e.g. "post", "user").</td></tr>
                    <tr><td><span class="param-name">reportable_id</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>ID of the reported content.</td></tr>
                    <tr><td><span class="param-name">reason</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Reason for the report.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- GET /api/tickets -->
    <div class="endpoint-card" id="get-api-tickets">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/tickets</span>
            </div>
            <span class="auth-badge">Authenticated</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Lists support tickets for the current user. Staff can view all tickets.</p>
        </div>
    </div>

    <!-- POST /api/tickets/{id}/messages -->
    <div class="endpoint-card" id="post-api-tickets-messages">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/tickets/{id}/messages</span>
            </div>
            <span class="auth-badge">Ticket Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Sends a message on a support ticket thread. Ticket owner and staff can reply.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">message</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Message content.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</section>
@endsection
