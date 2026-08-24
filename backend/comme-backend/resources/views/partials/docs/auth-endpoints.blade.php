<!-- Section 1: Authentication -->
<section id="auth-section" style="margin-bottom: 64px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <div>
            <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">1. Authentication & Security</h2>
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
