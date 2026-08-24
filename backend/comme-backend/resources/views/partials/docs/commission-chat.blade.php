<!-- Section 3b: Commission Chat -->
<section id="chat-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">3b. Commission Chat</h2>
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
