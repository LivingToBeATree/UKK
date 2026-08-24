<!-- Section 4: Feed & Social -->
<section id="social-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">4. Feed, Posts & Social</h2>
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
