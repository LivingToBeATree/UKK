<!-- Section 4b: Notifications -->
<section id="notifications-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">4b. Notifications</h2>
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
