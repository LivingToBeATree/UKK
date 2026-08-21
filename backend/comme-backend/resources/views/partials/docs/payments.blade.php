<!-- SECTION 5: PAYMENTS -->
<section id="payments-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">5. Midtrans Payments & Webhooks</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Snap token generation and webhook status callbacks.</p>
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
  "snap_token": "midtrans-snap-token-xyz-12345",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
}</div>
            </div>
        </div>
    </div>

    <!-- POST /api/webhooks/midtrans -->
    <div class="endpoint-card" id="post-api-webhooks-midtrans">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/webhooks/midtrans</span>
            </div>
            <span class="auth-badge">Midtrans Server Webhook</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Validates SHA-512 signature from Midtrans and updates commission payment status to <code>paid</code> or <code>failed</code>.
            </p>
        </div>
    </div>
</section>
