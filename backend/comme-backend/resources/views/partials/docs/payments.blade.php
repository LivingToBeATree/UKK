<!-- Section 9: Payments & Escrow Payouts -->
<section id="payments-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Midtrans Payments & Escrow Payouts</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Snap token generation, status reconciliation, simulation testing, artist payout accounts, and Iris disbursements.</p>
    </div>

    <!-- POST /api/commissions/{commission}/payment -->
    <div class="endpoint-card" id="post-api-commissions-payment">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{commission}/payment</span>
            </div>
            <span class="auth-badge">Commission Buyer</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Generates Midtrans Snap token or initializes transaction for instant escrow payment checkout.</p>
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

    <!-- POST /api/commissions/{commission}/payment/check-status -->
    <div class="endpoint-card" id="post-api-commissions-payment-check-status">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{commission}/payment/check-status</span>
            </div>
            <span class="auth-badge">Commission Participants</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Synchronizes live transaction status directly with Midtrans gateway API (also available via <code>GET</code>) to resolve pending states if webhooks are delayed.</p>
        </div>
    </div>

    <!-- POST /api/commissions/{commission}/payment/simulate -->
    <div class="endpoint-card" id="post-api-commissions-payment-simulate">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/commissions/{commission}/payment/simulate</span>
            </div>
            <span class="auth-badge" style="background: rgba(255, 170, 0, 0.15); color: #ffa726; border-color: rgba(255, 170, 0, 0.3);">Local / Testing Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Simulates successful escrow payment settlement in development/sandbox. Guarded by environment check; returns 404 in production.</p>
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

    <!-- DELETE /api/me/payout-account -->
    <div class="endpoint-card" id="delete-api-me-payout-account">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-delete">DELETE</span>
                <span>/api/me/payout-account</span>
            </div>
            <span class="auth-badge">Artist Account</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Removes the configured bank payout destination account for the authenticated artist.</p>
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
            <li><code>php artisan commissions:release-due-payouts</code> &mdash; Automatically releases escrow payouts to creator bank accounts 7 days after review delivery if unconfirmed (every minute, background).</li>
            <li><code>php artisan commissions:reconcile-payouts</code> &mdash; Polls Iris payout status for pending disbursements to resolve transient network drops (every 5 minutes).</li>
            <li><code>php artisan commissions:retry-failed-payouts</code> &mdash; Safely retries failed bank disbursements up to 3 attempts before flagging for staff audit (every 30 minutes).</li>
            <li><code>php artisan model:prune --model=PendingRegistration</code> &mdash; Cleans expired unverified registrations (hourly).</li>
            <li><code>php artisan migrate:sync-existing</code> &mdash; Safely reconciles schema differences without destructive table dropping.</li>
        </ul>
    </div>
</section>
