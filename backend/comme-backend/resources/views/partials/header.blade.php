<header style="border-bottom: 1px solid var(--border-subtle); background: rgba(14, 10, 30, 0.94); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100; height: var(--header-height);">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 28px; max-width: 1440px; margin: 0 auto; width: 100%;">
        <!-- Left: Menu SVG Button + Wordmark + Version Badge -->
        <div style="display: flex; align-items: center; gap: 16px;">
            <!-- Menu SVG Button (Triggers Drawer) -->
            <button id="menuToggleBtn" class="btn-menu" aria-label="Open Navigation Menu" title="Open Navigation Menu">
                <img src="{{ asset('icons/SVGs/Menu/menu-white.svg') }}" alt="Menu" />
            </button>

            <!-- Brand Wordmark (Enlarged) & Version Badge -->
            <a href="{{ url('/') }}" style="display: flex; align-items: center; gap: 14px; text-decoration: none;">
                <img src="{{ asset('images/Comme_Wordmark.svg') }}" alt="Comme" style="height: 36px; width: auto; object-fit: contain;" />
                <span style="background: rgba(156, 11, 218, 0.16); color: #c464fa; border: 1px solid rgba(156, 11, 218, 0.35); font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace;">
                    API v1.0
                </span>
            </a>
        </div>

        <!-- Middle: Prominent Search Bar -->
        <div class="header-search-container">
            <img src="{{ asset('icons/SVGs/Search/search-white.svg') }}" alt="Search" class="header-search-icon" />
            <input type="text" id="docsSearch" class="header-search-input" placeholder="Search API endpoints, methods, models..." autocomplete="off" />
            <span class="header-search-shortcut">/</span>
        </div>

        <!-- Right: Clean Minimal Status / Link -->
        <div style="display: flex; align-items: center; gap: 14px;">
            <a href="{{ url('/api/posts') }}" target="_blank" class="btn-copy" style="font-size: 12px; padding: 6px 14px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                <span>Explore API JSON</span>
                <span style="color: var(--brand-teal); font-size: 10px;">↗</span>
            </a>
        </div>
    </div>
</header>
