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
            <span class="auth-badge" style="background: rgba(245, 158, 11, 0.12); color: var(--brand-gold); border-color: rgba(245, 158, 11, 0.28);">Local / Testing Only</span>
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

    <!-- POST /artists/{username}/tip -->
    <div class="endpoint-card" id="post-api-artists-tip">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/artists/{username}/tip</span>
            </div>
            <span class="auth-badge">Public / Optional Auth</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Initializes a direct creator micro-donation / tip via Midtrans Snap. Supports regional currencies (<code>USD</code>, <code>EUR</code>, <code>JPY</code>, <code>SGD</code>, <code>GBP</code>, <code>IDR</code>) with currency-aware minimum validation and server-side rate conversion to IDR for gateway settlement.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">amount</span> <span class="param-required">req</span></td><td><span class="param-type">numeric</span></td><td>Tip amount (min 10,000 IDR, 100 JPY, or 1.00 USD/EUR/GBP/SGD).</td></tr>
                    <tr><td><span class="param-name">currency</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Billing currency code: <code>IDR</code>, <code>USD</code>, <code>EUR</code>, <code>JPY</code>, <code>SGD</code>, <code>GBP</code> (defaults to <code>IDR</code>).</td></tr>
                    <tr><td><span class="param-name">message</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Support note or message of encouragement (max 500 characters).</td></tr>
                    <tr><td><span class="param-name">supporter_name</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Display name of donor (defaults to authenticated username or "Generous Supporter").</td></tr>
                    <tr><td><span class="param-name">supporter_email</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Donor email for Midtrans transaction receipt.</td></tr>
                </tbody>
            </table>
            <div class="code-container">
                <div class="code-header"><span>Response (201 Created)</span></div>
                <div class="code-block">{
  "status": "success",
  "message": "Tip payment initialized successfully.",
  "data": {
    "tip_id": 8,
    "amount": 79365,
    "currency": "USD",
    "original_amount": 5.0,
    "supporter_name": "CyberFan99",
    "snap_token": "midtrans-snap-token-xyz-12345",
    "artist": {
      "username": "reya_art",
      "display_name": "Reya Vance"
    }
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /artists/{username}/tips -->
    <div class="endpoint-card" id="get-api-artists-tips">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/artists/{username}/tips</span>
            </div>
            <span class="auth-badge">Public</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Returns paginated list of public, settled tip messages and supporter contributions for the specified artist.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">username</span> <span class="param-required">req</span></td><td><span class="param-type">string</span></td><td>Unique username handle of the artist.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- GET /api/exchange-rates -->
    <div class="endpoint-card" id="get-api-exchange-rates">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/exchange-rates</span>
            </div>
            <span class="auth-badge">Public (Cached 6h)</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Retrieves live multi-currency exchange rates and purchasing power parity (PPP) conversion tables with <code>IDR</code> as the marketplace base. Includes formatted currency symbols, localized names, and client geographic location detection.
            </p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "status": "success",
  "message": "Exchange rates retrieved successfully.",
  "data": {
    "base": "IDR",
    "rates": {
      "IDR": 1.0,
      "USD": 0.000063,
      "EUR": 0.000058,
      "JPY": 0.0095,
      "SGD": 0.000085,
      "GBP": 0.000049
    },
    "rates_to_idr": {
      "IDR": 1,
      "USD": 15873,
      "EUR": 17241,
      "JPY": 105.26,
      "SGD": 11764,
      "GBP": 20408
    },
    "symbols": {
      "IDR": "Rp",
      "USD": "$",
      "EUR": "€",
      "JPY": "¥",
      "SGD": "S$",
      "GBP": "£"
    },
    "updated_at": "2026-09-14T02:00:00.000000Z",
    "user_location": {
      "ip": "103.24.12.8",
      "country_code": "ID",
      "currency": "IDR"
    }
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /api/geo/location -->
    <div class="endpoint-card" id="get-api-geo-location">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/geo/location</span>
            </div>
            <span class="auth-badge">Public</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Resolves the visitor's geographic country code and default billing currency using reverse proxy headers (Cloudflare, Google Cloud, Fly.io) with local GeoIP fallback.
            </p>
            <div class="code-container">
                <div class="code-header"><span>Response (200 OK)</span></div>
                <div class="code-block">{
  "status": "success",
  "message": "Client location retrieved successfully.",
  "data": {
    "ip": "203.0.113.195",
    "country_code": "US",
    "currency": "USD"
  }
}</div>
            </div>
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
