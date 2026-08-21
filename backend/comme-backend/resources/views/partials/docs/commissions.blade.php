<!-- SECTION 3: COMMISSION SERVICES & ORDERS -->
<section id="commissions-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">3. Commission Services & Orders</h2>
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
