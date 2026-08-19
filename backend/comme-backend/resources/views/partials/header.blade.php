<header style="border-bottom: 1px solid var(--border-subtle); background: rgba(15, 12, 27, 0.92); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 100; height: var(--header-height);">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 24px; max-width: 1400px; margin: 0 auto; width: 100%;">
        <!-- Brand & Title -->
        <div style="display: flex; align-items: center; gap: 16px;">
            <button id="toggleSidebarBtn" style="display: none; background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 20px;" aria-label="Toggle Sidebar">
                ☰
            </button>
            <a href="{{ url('/') }}" style="display: flex; align-items: center; gap: 12px;">
                <img src="{{ asset('icons/64x64.png') }}" alt="Comme Icon" style="width: 32px; height: 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(156, 11, 218, 0.35);" />
                <img src="{{ asset('images/Comme_Wordmark.svg') }}" alt="Comme" style="height: 24px; width: auto; object-fit: contain;" />
            </a>
            <span style="background: rgba(156, 11, 218, 0.15); color: #c464fa; border: 1px solid rgba(156, 11, 218, 0.3); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.05em;">
                API v1.0
            </span>
        </div>

        <!-- Right Action Controls -->
        <div style="display: flex; align-items: center; gap: 14px;">
            <!-- Base URL Switcher -->
            <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 4px 10px; border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Host:</span>
                <select id="baseUrlSelect" style="background: transparent; border: none; color: var(--text-primary); font-size: 12px; font-family: 'JetBrains Mono', monospace; outline: none; cursor: pointer;">
                    <option value="{{ url('') }}" selected>{{ request()->getHost() }}</option>
                    <option value="http://localhost:8000">localhost:8000</option>
                    <option value="https://comme-backend-861966182598.asia-southeast2.run.app">Cloud Run (Live)</option>
                </select>
            </div>

            <!-- Health status badge -->
            <div class="badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: rgba(22, 225, 170, 0.12); color: var(--brand-teal); border: 1px solid rgba(22, 225, 170, 0.28);">
                <span class="badge-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand-teal);"></span>
                <span>Operational</span>
            </div>
        </div>
    </div>
</header>
<style>
    @media (max-width: 960px) {
        #toggleSidebarBtn { display: block !important; }
    }
</style>
