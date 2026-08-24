<!-- Section 2: Artist Applications -->
<section id="apps-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">2. Artist Applications & Seller Vetting</h2>
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
