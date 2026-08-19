<aside class="docs-sidebar">
    <!-- Live Search Input -->
    <div style="position: relative;">
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px;">🔍</span>
        <input type="text" id="docsSearch" class="search-input" placeholder="Filter endpoints..." autocomplete="off" />
    </div>

    <!-- Navigation Tree -->
    <nav style="display: flex; flex-direction: column; gap: 20px;">
        <!-- Group: Overview -->
        <div>
            <div class="nav-category">Overview</div>
            <a href="#getting-started" class="nav-link"><span>Introduction & Base URLs</span></a>
            <a href="#authentication-flow" class="nav-link"><span>Auth & OTP Flow</span></a>
            <a href="#errors-status-codes" class="nav-link"><span>Errors & Status Codes</span></a>
        </div>

        <!-- Group: Authentication -->
        <div>
            <div class="nav-category">
                <span>Auth & Account</span>
                <span style="font-size: 10px; opacity: 0.6;">8</span>
            </div>
            <a href="#post-api-register" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/register</span></a>
            <a href="#post-api-register-confirm" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/register/confirm</span></a>
            <a href="#post-api-login" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/login</span></a>
            <a href="#get-api-me" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/me</span></a>
            <a href="#post-api-logout" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/logout</span></a>
            <a href="#post-api-forgot-password" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/forgot-password</span></a>
            <a href="#post-api-reset-password" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/reset-password</span></a>
            <a href="#post-api-change-password" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/change-password</span></a>
        </div>

        <!-- Group: Artist Applications -->
        <div>
            <div class="nav-category">
                <span>Artist Applications</span>
                <span style="font-size: 10px; opacity: 0.6;">5</span>
            </div>
            <a href="#post-api-artist-applications" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/artist-applications</span></a>
            <a href="#get-api-artist-applications-my" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/applications/my</span></a>
            <a href="#get-api-artist-applications" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/artist-applications</span></a>
            <a href="#post-api-artist-applications-approve" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">.../{id}/approve</span></a>
            <a href="#post-api-artist-applications-reject" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">.../{id}/reject</span></a>
        </div>

        <!-- Group: Commission Services & Orders -->
        <div>
            <div class="nav-category">
                <span>Commissions & Services</span>
                <span style="font-size: 10px; opacity: 0.6;">7</span>
            </div>
            <a href="#get-api-commission-services" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/commission-services</span></a>
            <a href="#post-api-commission-services" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commission-services</span></a>
            <a href="#get-api-commissions" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/commissions</span></a>
            <a href="#post-api-commissions" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commissions</span></a>
            <a href="#patch-api-commissions-status" class="nav-link"><span class="method-pill method-patch">PATCH</span> <span style="margin-left: 8px;">/commissions/{id}/status</span></a>
            <a href="#post-api-commission-revisions" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commission-revisions</span></a>
            <a href="#post-api-commission-reviews" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commission-reviews</span></a>
        </div>

        <!-- Group: Messages / Chat -->
        <div>
            <div class="nav-category">
                <span>Commission Chat</span>
                <span style="font-size: 10px; opacity: 0.6;">2</span>
            </div>
            <a href="#get-api-commission-messages" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/commissions/{id}/messages</span></a>
            <a href="#post-api-commission-messages" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commissions/{id}/messages</span></a>
        </div>

        <!-- Group: Feed & Social -->
        <div>
            <div class="nav-category">
                <span>Feed, Posts & Social</span>
                <span style="font-size: 10px; opacity: 0.6;">8</span>
            </div>
            <a href="#get-api-posts" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/posts</span></a>
            <a href="#post-api-posts" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/posts</span></a>
            <a href="#post-api-posts-like" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/posts/{id}/like</span></a>
            <a href="#post-api-posts-bookmark" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/posts/{id}/bookmark</span></a>
            <a href="#get-api-me-bookmarks" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/me/bookmarks</span></a>
            <a href="#post-api-post-comments" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/post-comments</span></a>
            <a href="#post-api-users-follow" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/users/{id}/follow</span></a>
            <a href="#get-api-users-followers" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/users/{id}/followers</span></a>
        </div>

        <!-- Group: Notifications -->
        <div>
            <div class="nav-category">
                <span>Notifications</span>
                <span style="font-size: 10px; opacity: 0.6;">4</span>
            </div>
            <a href="#get-api-notifications" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/notifications</span></a>
            <a href="#get-api-notifications-unread" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/notifications/unread-count</span></a>
            <a href="#patch-api-notifications-read-all" class="nav-link"><span class="method-pill method-patch">PATCH</span> <span style="margin-left: 8px;">/notifications/read-all</span></a>
            <a href="#patch-api-notifications-read" class="nav-link"><span class="method-pill method-patch">PATCH</span> <span style="margin-left: 8px;">/notifications/{id}/read</span></a>
        </div>

        <!-- Group: Payments -->
        <div>
            <div class="nav-category">
                <span>Midtrans Payments</span>
                <span style="font-size: 10px; opacity: 0.6;">2</span>
            </div>
            <a href="#post-api-payments-token" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/commissions/{id}/payment-token</span></a>
            <a href="#post-api-webhooks-midtrans" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/webhooks/midtrans</span></a>
        </div>

        <!-- Group: Moderation & Tickets -->
        <div>
            <div class="nav-category">
                <span>Moderation & Support</span>
                <span style="font-size: 10px; opacity: 0.6;">3</span>
            </div>
            <a href="#post-api-reports" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/reports</span></a>
            <a href="#get-api-tickets" class="nav-link"><span class="method-pill method-get">GET</span> <span style="margin-left: 8px;">/tickets</span></a>
            <a href="#post-api-tickets-messages" class="nav-link"><span class="method-pill method-post">POST</span> <span style="margin-left: 8px;">/tickets/{id}/messages</span></a>
        </div>
    </nav>
</aside>
