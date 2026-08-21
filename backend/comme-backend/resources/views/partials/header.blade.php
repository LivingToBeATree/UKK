<header style="border-bottom: 1px solid var(--border-subtle); background: var(--bg-sidebar); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; height: var(--header-height);">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 20px; width: 100%;">
        <!-- Left: Menu SVG Button + Wordmark + Version Badge -->
        <div style="display: flex; align-items: center; gap: 16px;">
            <button id="menuToggleBtn" class="btn-menu" aria-label="Open Navigation Menu" title="Open Navigation Menu">
                <img src="{{ asset('icons/SVGs/Menu/menu-white.svg') }}" alt="Menu" class="icon-themed" />
            </button>

            <a href="{{ url('/') }}" style="display: flex; align-items: center; gap: 14px; text-decoration: none;">
                <img src="{{ asset('images/Comme_Wordmark.svg') }}" alt="Comme" style="height: 36px; width: auto; object-fit: contain;" />
                <span style="background: rgba(168, 2, 245, 0.16); color: #c464fa; border: 1px solid rgba(168, 2, 245, 0.35); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace;">
                    API v1.0
                </span>
            </a>
        </div>

        <!-- Middle: Search Bar -->
        <div class="header-search-container">
            <img src="{{ asset('icons/SVGs/Search/search-white.svg') }}" alt="Search" class="header-search-icon icon-themed" />
            <input type="text" id="docsSearch" class="header-search-input" placeholder="Search API endpoints, methods, models..." autocomplete="off" />
            <span class="header-search-shortcut">/</span>
        </div>

        <!-- Right: Explore API JSON & Error Reference -->
        <div style="display: flex; align-items: center; gap: 10px;">
            <a href="{{ url('/errors') }}" class="btn-copy" style="font-size: 12px; padding: 6px 12px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                <span>Error Codes</span>
                <span style="color: var(--brand-rose); font-size: 10px;">•</span>
            </a>
            <a href="{{ url('/explore') }}" class="btn-copy" style="font-size: 12px; padding: 6px 14px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                <span>Explore API JSON</span>
                <span style="color: var(--brand-teal); font-size: 10px;">↗</span>
            </a>
        </div>
    </div>
</header>
