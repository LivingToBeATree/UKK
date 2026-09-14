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
                Approves application. Promotes user role to <code>artist</code>, creates artist profile, and dispatches a real-time in-app bell notification.
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
            <p style="font-size: 14px; color: var(--text-secondary);">Rejects application with structured reason. Dispatches an in-app notification and allows the user to reapply later.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">reason</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Rejection explanation sent to applicant via in-app notification.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- GET /api/artist-profiles/{id} -->
    <div class="endpoint-card" id="get-api-artist-profiles-id">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/artist-profiles/{id}</span>
            </div>
            <span class="auth-badge">Public</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Retrieves the public artist studio profile, including master commission availability status, biography, ratings summary, and verified social handles.</p>
        </div>
    </div>

    <!-- PUT /api/artist-profiles/{id} -->
    <div class="endpoint-card" id="put-api-artist-profiles-id">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-put">PUT</span>
                <span>/api/artist-profiles/{id}</span>
            </div>
            <span class="auth-badge">Artist Profile Owner</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Updates studio settings and public profile customization. Regulates master commission availability across the entire marketplace.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">commission_status</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Master availability: <code>open</code> (available), <code>busy</code> (waitlist only), or <code>closed</code> (orders paused).</td></tr>
                    <tr><td><span class="param-name">bio</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Studio specialty, working style, and commission terms.</td></tr>
                    <tr><td><span class="param-name">website</span> <span class="param-optional">opt</span></td><td><span class="param-type">url</span></td><td>Personal website or agency portfolio link.</td></tr>
                    <tr><td><span class="param-name">portfolio_url</span> <span class="param-optional">opt</span></td><td><span class="param-type">url</span></td><td>External portfolio link (ArtStation, Behance, Carrd).</td></tr>
                    <tr><td><span class="param-name">social_links</span> <span class="param-optional">opt</span></td><td><span class="param-type">object</span></td><td>Social media handles (e.g. <code>{"twitter": "@handle", "artstation": "user", "instagram": "@user"}</code>).</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- GET /api/artist-profiles/{id}/queue -->
    <div class="endpoint-card" id="get-api-artist-profiles-queue">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/artist-profiles/{id}/queue</span>
            </div>
            <span class="auth-badge">Public (Optional Auth)</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Retrieves live studio commission queue metrics and stage progress. Features built-in privacy masking for client identities (e.g. <code>r***n</code>) to prevent scraping, while transparently unmasking the client's own order with an <code>is_current_user: true</code> spotlight when authenticated.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">id</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>Artist profile ID.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "status": "success",
  "message": "Commission queue retrieved successfully.",
  "data": {
    "artist": {
      "id": 2,
      "username": "reya_art",
      "display_name": "Reya Vance"
    },
    "stats": {
      "total_active": 3,
      "capacity": 5,
      "waitlist_count": 1,
      "in_progress_count": 1,
      "review_count": 1,
      "completed_recent_count": 4,
      "is_full": false,
      "commission_open": true,
      "commission_status": "open"
    },
    "queue": [
      {
        "id": 14,
        "code": "COM-#14",
        "slug": "com-14-cyberpunk-avatar",
        "stage": "in_progress",
        "stage_label": "Active Production",
        "status": "in_progress",
        "position": 1,
        "service_name": "Digital Anime Illustration",
        "option_name": "Full Body + Background",
        "client_name": "a***x",
        "is_current_user": false,
        "deadline": "2026-09-28",
        "review_deadline": null,
        "completed_at": null,
        "created_at": "2026-09-08T14:20:00.000000Z"
      },
      {
        "id": 19,
        "code": "COM-#19",
        "slug": "com-19-chibi-emotes",
        "stage": "waitlist",
        "stage_label": "Queued / Waitlist",
        "status": "accepted",
        "position": 2,
        "service_name": "Twitch Emotes Pack",
        "option_name": "Set of 3",
        "client_name": "John Doe",
        "is_current_user": true,
        "deadline": "2026-10-05",
        "review_deadline": null,
        "completed_at": null,
        "created_at": "2026-09-12T08:11:00.000000Z"
      }
    ],
    "recent_completed": [
      {
        "id": 11,
        "code": "COM-#11",
        "stage": "completed",
        "stage_label": "Delivered & Accepted",
        "status": "completed",
        "position": null,
        "service_name": "Concept Character Art",
        "client_name": "k***9",
        "completed_at": "2026-09-07T16:45:00.000000Z"
      }
    ]
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /artists/{username}/badge.svg -->
    <div class="endpoint-card" id="get-api-artists-badge">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/artists/{username}/badge.svg</span>
            </div>
            <span class="auth-badge">Public (CORS Enabled)</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Renders a dynamic, high-DPI SVG badge displaying the artist's real-time commission status and active queue workload. Ideal for embedding directly into GitHub READMEs, personal portfolios, ArtStation bios, or Carrd landing pages.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">username</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Unique username handle of the artist.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Markdown Embedding Example</span></div>
                <div class="code-block">[![Comme Commissions](https://comme-backend-861966182598.asia-southeast2.run.app/artists/reya_art/badge.svg)](https://comme.art/artists/reya_art)</div>
            </div>
            <div class="code-container">
                <div class="code-header"><span>HTML Embedding Example</span></div>
                <div class="code-block">&lt;a href="https://comme.art/artists/reya_art"&gt;
  &lt;img src="https://comme-backend-861966182598.asia-southeast2.run.app/artists/reya_art/badge.svg" alt="Commission Status" /&gt;
&lt;/a&gt;</div>
            </div>
        </div>
    </div>
</section>
