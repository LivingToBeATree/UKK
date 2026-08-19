<header style="border-bottom: 1px solid var(--border-color); background: rgba(18, 14, 34, 0.88); backdrop-filter: blur(14px); position: sticky; top: 0; z-index: 50;">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between; height: 76px;">
        <!-- Official Brand Logo -->
        <a href="{{ url('/') }}" style="display: flex; align-items: center; gap: 14px;">
            <img src="{{ asset('icons/64x64.png') }}" alt="Comme Icon" style="width: 36px; height: 36px; border-radius: 8px; box-shadow: 0 4px 12px rgba(156, 11, 218, 0.35);" />
            <img src="{{ asset('images/Comme_Wordmark.svg') }}" alt="Comme" style="height: 28px; width: auto; object-fit: contain;" />
        </a>

        <!-- Status & Navigation -->
        <div style="display: flex; align-items: center; gap: 16px;">
            <div class="badge">
                <span class="badge-dot"></span>
                <span>API v1 Online</span>
            </div>

            <a href="{{ url('/api/posts') }}" class="btn btn-secondary" style="font-size: 13px; padding: 8px 16px;">
                Explore API
            </a>
        </div>
    </div>
</header>
