<header style="border-bottom: 1px solid var(--border-color); background: rgba(18, 20, 26, 0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50;">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between; height: 72px;">
        <!-- Brand Logo -->
        <a href="{{ url('/') }}" style="display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 22px; letter-spacing: -0.03em;">
            <span style="width: 38px; height: 38px; border-radius: 10px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);">
                C
            </span>
            <span style="background: linear-gradient(to right, #ffffff, #d1d5db); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Comme
            </span>
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
