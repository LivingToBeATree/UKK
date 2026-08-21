<!-- SECTION 6: MODERATION & SUPPORT -->
<section id="moderation-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">6. Moderation & Support Tickets</h2>
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
