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

    <!-- Escrow Refund & Scheduled Automation Guide -->
    <div style="margin-top: 32px; padding: 24px; background: rgba(2, 245, 168, 0.04); border: 1px solid rgba(2, 245, 168, 0.2); border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <img src="{{ asset('icons/SVGs/Shield/shield-white.svg') }}" class="icon-themed" style="width: 18px; height: 18px;" alt="" />
            Escrow Protection, Automated Refunds & Digital Receipts
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
            When orders are mutually cancelled or cancelled while paid, funds held in escrow are immediately refunded to the buyer via the Midtrans direct refund API (with local ledger fallback). A permanent immutable digital receipt record (<code>REC-COM-{id}-{hash}</code>) tracks the refund timestamp, reason, and settlement audit logs.
        </p>

        <h4 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Artisan Scheduled Commands</h4>
        <ul style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; padding-left: 20px;">
            <li><code>php artisan commissions:auto-release</code> &mdash; Automatically releases escrow payouts to creator bank accounts 7 days after review delivery if unconfirmed.</li>
            <li><code>php artisan commissions:reconcile-payouts</code> &mdash; Polls Iris payout status for pending disbursements to resolve transient network drops.</li>
            <li><code>php artisan commissions:retry-payouts</code> &mdash; Safely retries failed bank disbursements up to 3 attempts before flagging for staff audit.</li>
        </ul>
    </div>
</section>
