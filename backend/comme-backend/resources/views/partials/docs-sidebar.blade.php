<aside id="docsDrawer" class="docs-drawer" aria-label="API Navigation Drawer">
    <!-- Drawer Header -->
    <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 12px;">
            <img src="{{ asset('icons/64x64.png') }}" alt="Comme" style="width: 30px; height: 30px; border-radius: 8px; box-shadow: 0 4px 14px rgba(168, 2, 245, 0.3);" />
            <div>
                <div style="font-weight: 800; font-size: 15px; color: var(--text-primary); letter-spacing: -0.02em;">API Docs</div>
                <div style="font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">v1.0 • REST</div>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Theme Toggle (Dark / Light / System) -->
            <div class="theme-toggle">
                <button class="theme-toggle-btn active" data-theme="dark" title="Dark mode">
                    <img src="{{ asset('icons/SVGs/Night/night-white.svg') }}" class="icon-themed" style="width: 16px; height: 16px;" alt="Dark" />
                </button>
                <button class="theme-toggle-btn" data-theme="light" title="Light mode">
                    <img src="{{ asset('icons/SVGs/Day/day-white.svg') }}" class="icon-themed" style="width: 16px; height: 16px;" alt="Light" />
                </button>
                <button class="theme-toggle-btn" data-theme="system" title="System theme">
                    <img src="{{ asset('icons/SVGs/System/system-white.svg') }}" class="icon-themed" style="width: 16px; height: 16px;" alt="System" />
                </button>
            </div>

            <!-- Close Button -->
            <button id="drawerCloseBtn" style="background: rgba(128,128,128,0.08); border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; transition: all 0.15s ease;" title="Close Menu">
                ✕
            </button>
        </div>
    </div>

    <!-- Drawer Search -->
    <div class="drawer-search">
        <div class="drawer-search-wrapper">
            <img src="{{ asset('icons/SVGs/Search/search-white.svg') }}" alt="" class="search-icon-drawer icon-themed" />
            <input type="text" id="drawerSearch" class="drawer-search-input" placeholder="Filter endpoints..." autocomplete="off" />
        </div>
    </div>

    <!-- Navigation Tree -->
    <nav class="drawer-nav">
        <!-- Quick Links -->
        <div style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 2px;">
            <a href="{{ url('/') }}#getting-started" class="nav-link nav-page-link" data-page="/" data-hash="getting-started" style="font-family: inherit; font-weight: 600; font-size: 13px;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <img src="{{ asset('icons/SVGs/Paper/paper-white.svg') }}" class="icon-themed" style="width: 14px; height: 14px;" alt="" /> Introduction
                </span>
            </a>
            <a href="{{ url('/') }}#authentication-flow" class="nav-link nav-page-link" data-page="/" data-hash="authentication-flow" style="font-family: inherit; font-weight: 600; font-size: 13px;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <img src="{{ asset('icons/SVGs/Lock/lock-white.svg') }}" class="icon-themed" style="width: 14px; height: 14px;" alt="" /> Auth & Headers
                </span>
            </a>
            <a href="{{ url('/explore') }}" class="nav-link nav-page-link" data-page="/explore" style="font-family: inherit; font-weight: 600; font-size: 13px;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <img src="{{ asset('icons/SVGs/Zap/zap-white.svg') }}" class="icon-themed" style="width: 14px; height: 14px;" alt="" /> API Explorer
                </span>
            </a>
            <a href="{{ url('/errors') }}" class="nav-link nav-page-link" data-page="/errors" style="font-family: inherit; font-weight: 600; font-size: 13px;">
                <span style="display: flex; align-items: center; gap: 8px;">
                    <img src="{{ asset('icons/SVGs/Shield/shield-white.svg') }}" class="icon-themed" style="width: 14px; height: 14px;" alt="" /> Error Reference
                </span>
            </a>
        </div>

        <div style="height: 1px; background: var(--border-subtle); margin: 4px 0 14px;"></div>

        <!-- Auth & Account -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(168, 2, 245, 0.12);">
                        <img src="{{ asset('icons/SVGs/Key/key-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Auth & Account</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">8</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#post-api-register" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-register"><span class="method-pill method-post">POST</span> /register</a>
                <a href="{{ url('/') }}#post-api-register-confirm" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-register-confirm"><span class="method-pill method-post">POST</span> /register/confirm</a>
                <a href="{{ url('/') }}#post-api-login" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-login"><span class="method-pill method-post">POST</span> /login</a>
                <a href="{{ url('/') }}#get-api-me" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-me"><span class="method-pill method-get">GET</span> /me</a>
                <a href="{{ url('/') }}#post-api-logout" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-logout"><span class="method-pill method-post">POST</span> /logout</a>
                <a href="{{ url('/') }}#post-api-forgot-password" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-forgot-password"><span class="method-pill method-post">POST</span> /forgot-password</a>
                <a href="{{ url('/') }}#post-api-reset-password" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-reset-password"><span class="method-pill method-post">POST</span> /reset-password</a>
                <a href="{{ url('/') }}#post-api-change-password" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-change-password"><span class="method-pill method-post">POST</span> /change-password</a>
            </div>
        </div>

        <!-- Artist Applications -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(245, 170, 2, 0.12);">
                        <img src="{{ asset('icons/SVGs/Paint/paint-tray-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Artist Applications</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">5</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#post-api-artist-applications" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-artist-applications"><span class="method-pill method-post">POST</span> /artist-applications</a>
                <a href="{{ url('/') }}#get-api-artist-applications-my" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-artist-applications-my"><span class="method-pill method-get">GET</span> /applications/my</a>
                <a href="{{ url('/') }}#get-api-artist-applications" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-artist-applications"><span class="method-pill method-get">GET</span> /artist-applications</a>
                <a href="{{ url('/') }}#post-api-artist-applications-approve" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-artist-applications-approve"><span class="method-pill method-post">POST</span> .../{id}/approve</a>
                <a href="{{ url('/') }}#post-api-artist-applications-reject" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-artist-applications-reject"><span class="method-pill method-post">POST</span> .../{id}/reject</a>
            </div>
        </div>

        <!-- Commissions -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(2, 245, 168, 0.12);">
                        <img src="{{ asset('icons/SVGs/Suitcase/suitcase-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Commissions</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">7</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#get-api-commission-services" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-commission-services"><span class="method-pill method-get">GET</span> /commission-services</a>
                <a href="{{ url('/') }}#post-api-commission-services" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-commission-services"><span class="method-pill method-post">POST</span> /commission-services</a>
                <a href="{{ url('/') }}#get-api-commissions" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-commissions"><span class="method-pill method-get">GET</span> /commissions</a>
                <a href="{{ url('/') }}#post-api-commissions" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-commissions"><span class="method-pill method-post">POST</span> /commissions</a>
                <a href="{{ url('/') }}#patch-api-commissions-status" class="nav-link link-patch nav-page-link" data-page="/" data-hash="patch-api-commissions-status"><span class="method-pill method-patch">PATCH</span> /{id}/status</a>
                <a href="{{ url('/') }}#post-api-commission-revisions" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-commission-revisions"><span class="method-pill method-post">POST</span> /commission-revisions</a>
                <a href="{{ url('/') }}#post-api-commission-reviews" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-commission-reviews"><span class="method-pill method-post">POST</span> /commission-reviews</a>
            </div>
        </div>

        <!-- Commission Chat -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(56, 152, 255, 0.12);">
                        <img src="{{ asset('icons/SVGs/Chat/chat-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Commission Chat</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">2</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#get-api-commission-messages" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-commission-messages"><span class="method-pill method-get">GET</span> /{id}/messages</a>
                <a href="{{ url('/') }}#post-api-commission-messages" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-commission-messages"><span class="method-pill method-post">POST</span> /{id}/messages</a>
            </div>
        </div>

        <!-- Feed & Social -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(245, 170, 2, 0.12);">
                        <img src="{{ asset('icons/SVGs/Picture/picture-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Feed & Social</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">8</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#get-api-posts" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-posts"><span class="method-pill method-get">GET</span> /posts</a>
                <a href="{{ url('/') }}#post-api-posts" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-posts"><span class="method-pill method-post">POST</span> /posts</a>
                <a href="{{ url('/') }}#post-api-posts-like" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-posts-like"><span class="method-pill method-post">POST</span> /posts/{id}/like</a>
                <a href="{{ url('/') }}#post-api-posts-bookmark" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-posts-bookmark"><span class="method-pill method-post">POST</span> /posts/{id}/bookmark</a>
                <a href="{{ url('/') }}#get-api-me-bookmarks" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-me-bookmarks"><span class="method-pill method-get">GET</span> /me/bookmarks</a>
                <a href="{{ url('/') }}#post-api-post-comments" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-post-comments"><span class="method-pill method-post">POST</span> /post-comments</a>
                <a href="{{ url('/') }}#post-api-users-follow" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-users-follow"><span class="method-pill method-post">POST</span> /users/{id}/follow</a>
                <a href="{{ url('/') }}#get-api-users-followers" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-users-followers"><span class="method-pill method-get">GET</span> /users/{id}/followers</a>
            </div>
        </div>

        <!-- Notifications -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(168, 2, 245, 0.12);">
                        <img src="{{ asset('icons/SVGs/Bell/bell-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Notifications</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">4</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#get-api-notifications" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-notifications"><span class="method-pill method-get">GET</span> /notifications</a>
                <a href="{{ url('/') }}#get-api-notifications-unread" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-notifications-unread"><span class="method-pill method-get">GET</span> /unread-count</a>
                <a href="{{ url('/') }}#patch-api-notifications-read-all" class="nav-link link-patch nav-page-link" data-page="/" data-hash="patch-api-notifications-read-all"><span class="method-pill method-patch">PATCH</span> /read-all</a>
                <a href="{{ url('/') }}#patch-api-notifications-read" class="nav-link link-patch nav-page-link" data-page="/" data-hash="patch-api-notifications-read"><span class="method-pill method-patch">PATCH</span> /{id}/read</a>
            </div>
        </div>

        <!-- Payments -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(2, 245, 168, 0.12);">
                        <img src="{{ asset('icons/SVGs/Card/card-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Payments</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">2</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#post-api-payments-token" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-payments-token"><span class="method-pill method-post">POST</span> /{id}/payment-token</a>
                <a href="{{ url('/') }}#post-api-webhooks-midtrans" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-webhooks-midtrans"><span class="method-pill method-post">POST</span> /webhooks/midtrans</a>
            </div>
        </div>

        <!-- Moderation -->
        <div class="nav-group">
            <div class="nav-group-toggle">
                <div class="nav-group-label">
                    <div class="nav-group-icon" style="background: rgba(255, 67, 101, 0.12);">
                        <img src="{{ asset('icons/SVGs/Shield/shield-white.svg') }}" class="icon-themed" alt="" />
                    </div>
                    <span class="nav-group-title">Moderation</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="nav-group-count">3</span>
                    <span class="nav-group-chevron">▶</span>
                </div>
            </div>
            <div class="nav-group-items">
                <a href="{{ url('/') }}#post-api-reports" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-reports"><span class="method-pill method-post">POST</span> /reports</a>
                <a href="{{ url('/') }}#get-api-tickets" class="nav-link link-get nav-page-link" data-page="/" data-hash="get-api-tickets"><span class="method-pill method-get">GET</span> /tickets</a>
                <a href="{{ url('/') }}#post-api-tickets-messages" class="nav-link link-post nav-page-link" data-page="/" data-hash="post-api-tickets-messages"><span class="method-pill method-post">POST</span> /{id}/messages</a>
            </div>
        </div>
    </nav>

    <!-- Drawer Footer -->
    <div class="drawer-footer">
        <img src="{{ asset('icons/32x32.png') }}" alt="Comme" style="width: 18px; height: 18px; border-radius: 5px; opacity: 0.7;" />
        <span style="font-size: 11px; color: var(--text-muted);">Comme Platform &copy; {{ date('Y') }}</span>
    </div>
</aside>
