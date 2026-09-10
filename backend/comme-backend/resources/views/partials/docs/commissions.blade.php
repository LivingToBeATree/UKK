<!-- Section 3: Commission Services & Orders -->
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

    <!-- POST /api/commissions/{id}/accept -->
    <div class="endpoint-card" id="post-api-commissions-accept">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/accept</span>
            </div>
            <span class="auth-badge">Assigned Artist</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Artist accepts a pending commission order. Transitions order status to <code>accepted</code> and alerts the buyer.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/decline -->
    <div class="endpoint-card" id="post-api-commissions-decline">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/decline</span>
            </div>
            <span class="auth-badge">Assigned Artist</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Artist declines a pending commission order. Transitions status to <code>declined</code> with optional reason notes.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/deliver -->
    <div class="endpoint-card" id="post-api-commissions-deliver">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/deliver</span>
            </div>
            <span class="auth-badge">Assigned Artist</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Artist delivers completed artwork files and attachments. Transitions order status to <code>review</code> and initiates buyer review period.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/confirm -->
    <div class="endpoint-card" id="post-api-commissions-confirm">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/confirm</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Buyer approves delivered artwork. Transitions status to <code>completed</code> and schedules automatic escrow payout release to artist.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/request-revision -->
    <div class="endpoint-card" id="post-api-commission-revisions">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/request-revision</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Buyer requests revisions during the review period. Increments revision counter and returns status to <code>in_progress</code>.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">notes</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Specific feedback or changes requested.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/request-cancellation -->
    <div class="endpoint-card" id="post-api-commission-request-cancellation">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/request-cancellation</span>
            </div>
            <span class="auth-badge">Order Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Initiates mutual cancellation request when an order is active (<code>accepted</code>, <code>in_progress</code>, or <code>review</code>). Flags order with pending cancellation and notifies counterparty.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">reason</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Reason for requesting order cancellation.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/accept-cancellation -->
    <div class="endpoint-card" id="post-api-commission-accept-cancellation">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/accept-cancellation</span>
            </div>
            <span class="auth-badge">Counterparty</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Accepts mutual cancellation request. Marks order as <code>cancelled</code>. <strong>If payment was completed in escrow, automatically triggers a Midtrans API refund to buyer and updates payment status to <code>refunded</code>.</strong></p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/decline-cancellation -->
    <div class="endpoint-card" id="post-api-commission-decline-cancellation">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/decline-cancellation</span>
            </div>
            <span class="auth-badge">Counterparty</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Declines mutual cancellation request and resumes active order progress under original terms.</p>
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
            <p style="font-size: 14px; color: var(--text-secondary);">Direct cancellation for <code>pending</code> orders (or orders where both parties have agreed). Automatically reverses escrow payment if already settled.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/propose-deadline -->
    <div class="endpoint-card" id="post-api-commissions-propose-deadline">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/propose-deadline</span>
            </div>
            <span class="auth-badge">Assigned Artist</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Proposes a new delivery deadline with justification note. Awaiting buyer confirmation.</p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">proposed_deadline</span> <span class="param-required">req</span></td><td><span class="param-type">date</span></td><td>Proposed new target completion date.</td></tr>
                    <tr><td><span class="param-name">reason</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Reason for deadline extension request.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/accept-deadline -->
    <div class="endpoint-card" id="post-api-commissions-accept-deadline">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/accept-deadline</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Buyer accepts the artist's proposed deadline extension, updating order deadline.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{id}/decline-deadline -->
    <div class="endpoint-card" id="post-api-commissions-decline-deadline">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{id}/decline-deadline</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Buyer declines the proposed deadline extension. Retains current active deadline.</p>
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

    <!-- PUT /api/reviews/{review} -->
    <div class="endpoint-card" id="put-api-reviews">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-put">PUT</span>
                <span>/api/reviews/{review}</span>
            </div>
            <span class="auth-badge">Review Author</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Updates rating and text of an existing review. Restricted to the original review author.</p>
        </div>
    </div>

    <!-- PATCH /api/reviews/{review}/reply -->
    <div class="endpoint-card" id="patch-api-reviews-reply">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-patch">PATCH</span>
                <span>/api/reviews/{review}/reply</span>
            </div>
            <span class="auth-badge">Assigned Artist</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Allows the commissioned artist to post a public response to the client's review.</p>
        </div>
    </div>

    <!-- DELETE /api/reviews/{review} -->
    <div class="endpoint-card" id="delete-api-reviews">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-delete">DELETE</span>
                <span>/api/reviews/{review}</span>
            </div>
            <span class="auth-badge">Review Author / Admin</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Deletes an existing review and recalculates the artist's average rating.</p>
        </div>
    </div>
</section>
