<!-- Section 9: Payments & Escrow Payouts -->
<section id="payments-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Midtrans Payments & Escrow Payouts</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Snap token generation, webhook status callbacks, artist payout accounts, and Iris disbursements.</p>
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
  "status": "success",
  "data": {
    "token": "midtrans-snap-token-xyz-12345",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /api/me/payout-account -->
    <div class="endpoint-card" id="get-api-me-payout-account">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/me/payout-account</span>
            </div>
            <span class="auth-badge">Artist Account</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Returns the authenticated artist's payout bank destination with masked account numbers for data protection.</p>
        </div>
    </div>

    <!-- PUT /api/me/payout-account -->
    <div class="endpoint-card" id="put-api-me-payout-account">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-put">PUT</span>
                <span>/api/me/payout-account</span>
            </div>
            <span class="auth-badge">Artist Account</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Configures artist bank transfer destination. Bank account numbers are encrypted at rest.</p>
        </div>
    </div>

    <!-- POST /api/midtrans/webhook -->
    <div class="endpoint-card" id="post-api-midtrans-webhook">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/midtrans/webhook</span>
            </div>
            <span class="auth-badge">Midtrans Server Webhook</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Validates SHA-512 signature from Midtrans Snap and transitions commission payment to <code>PAID</code>.
            </p>
        </div>
    </div>

    <!-- POST /api/midtrans/iris-webhook -->
    <div class="endpoint-card" id="post-api-midtrans-iris-webhook">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/midtrans/iris-webhook</span>
            </div>
            <span class="auth-badge">Midtrans Iris Webhook</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Midtrans Iris payout callback. Implements challenge verification against Iris API before updating payout status to <code>COMPLETED</code>.
            </p>
        </div>
    </div>
</section>
