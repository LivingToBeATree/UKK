<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Comme API Documentation')</title>

    <!-- Favicon & Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('icons/32x32.png') }}">
    <link rel="icon" type="image/png" sizes="64x64" href="{{ asset('icons/64x64.png') }}">
    <link rel="apple-touch-icon" sizes="128x128" href="{{ asset('icons/128x128.png') }}">
    <link rel="apple-touch-icon" sizes="256x256" href="{{ asset('icons/256x256.png') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Design System Tokens & Base Styles -->
    <style>
        :root {
            --bg-body: #090713;
            --bg-sidebar: #0e0a1e;
            --bg-surface: #140f29;
            --bg-surface-elevated: #1b1536;
            --bg-code: #080512;
            
            --border-subtle: #231b42;
            --border-strong: #382c63;
            --border-focus: #9c0bda;

            --text-primary: #f8f6fc;
            --text-secondary: #a89ec4;
            --text-muted: #6f648d;
            --text-on-accent: #ffffff;

            --brand-purple: #9c0bda;
            --brand-teal: #16e1aa;
            --brand-yellow: #f7bd26;
            --brand-rose: #ff4365;
            
            --brand-gradient: linear-gradient(135deg, #9c0bda 0%, #7000ff 50%, #16e1aa 100%);
            
            --method-get: #16e1aa;
            --method-post: #b84eff;
            --method-patch: #f7bd26;
            --method-delete: #ff4365;
            
            --sidebar-width: 320px;
            --header-height: 72px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        code, pre {
            font-family: 'JetBrains Mono', monospace;
        }

        /* Documentation Layout */
        .docs-wrapper {
            display: flex;
            width: 100%;
            min-height: calc(100vh - var(--header-height));
            justify-content: center;
        }

        /* Drawer Overlay */
        .drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(4, 3, 8, 0.7);
            backdrop-filter: blur(8px);
            z-index: 150;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .drawer-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        /* Off-canvas Slide-out Drawer */
        .docs-drawer {
            position: fixed;
            top: 0;
            left: 0;
            width: var(--sidebar-width);
            height: 100vh;
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border-subtle);
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
            overflow-y: auto;
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            box-shadow: 12px 0 40px rgba(0, 0, 0, 0.6);
            scrollbar-width: thin;
            scrollbar-color: var(--border-strong) transparent;
        }

        .docs-drawer.active {
            transform: translateX(0);
        }

        .docs-content {
            flex: 1;
            min-width: 0;
            padding: 48px 32px 140px 32px;
            max-width: 1080px;
            margin: 0 auto;
        }

        /* Header Navigation Styles */
        .header-search-container {
            flex: 1;
            max-width: 480px;
            margin: 0 24px;
            position: relative;
        }

        .header-search-input {
            width: 100%;
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            padding: 9px 40px 9px 42px;
            color: var(--text-primary);
            font-size: 13px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s ease;
        }

        .header-search-input:focus {
            border-color: var(--brand-purple);
            box-shadow: 0 0 0 3px rgba(156, 11, 218, 0.25);
            background: var(--bg-surface-elevated);
        }

        .header-search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            opacity: 0.65;
            pointer-events: none;
        }

        .header-search-shortcut {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--border-subtle);
            border-radius: 4px;
            padding: 1px 6px;
            font-size: 11px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }

        /* Buttons & Badges */
        .btn-menu {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-menu:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: var(--border-strong);
            transform: scale(1.02);
        }

        .btn-menu img {
            width: 20px;
            height: 20px;
        }

        .btn-copy {
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-secondary);
            border: 1px solid var(--border-subtle);
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: inherit;
        }

        .btn-copy:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.12);
            border-color: var(--border-strong);
        }

        /* Method Pills */
        .method-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            letter-spacing: 0.04em;
            font-family: 'JetBrains Mono', monospace;
        }

        .method-get { background: rgba(22, 225, 170, 0.12); color: var(--method-get); border: 1px solid rgba(22, 225, 170, 0.28); }
        .method-post { background: rgba(156, 11, 218, 0.16); color: var(--method-post); border: 1px solid rgba(156, 11, 218, 0.35); }
        .method-patch { background: rgba(247, 189, 38, 0.12); color: var(--method-patch); border: 1px solid rgba(247, 189, 38, 0.28); }
        .method-delete { background: rgba(255, 67, 101, 0.12); color: var(--method-delete); border: 1px solid rgba(255, 67, 101, 0.28); }

        .auth-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 600;
            padding: 3px 9px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-secondary);
            border: 1px solid var(--border-subtle);
        }

        .auth-badge.staff {
            background: rgba(247, 189, 38, 0.1);
            color: var(--brand-yellow);
            border-color: rgba(247, 189, 38, 0.25);
        }

        /* Endpoint Card */
        .endpoint-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 14px;
            margin-bottom: 28px;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .endpoint-card:hover {
            border-color: var(--border-strong);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }

        .endpoint-header {
            padding: 18px 24px;
            background: var(--bg-surface-elevated);
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .endpoint-path {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-primary);
        }

        .endpoint-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Schema Tables */
        .param-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 8px;
        }

        .param-table th {
            text-align: left;
            padding: 10px 14px;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            border-bottom: 1px solid var(--border-subtle);
        }

        .param-table td {
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            vertical-align: top;
        }

        .param-name {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: #d1b4ff;
        }

        .param-type {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: var(--brand-teal);
        }

        .param-required {
            font-size: 10px;
            font-weight: 700;
            color: var(--brand-rose);
            text-transform: uppercase;
            margin-left: 4px;
        }

        .param-optional {
            font-size: 10px;
            color: var(--text-muted);
            margin-left: 4px;
        }

        /* Code & Previews */
        .code-container {
            background: var(--bg-code);
            border: 1px solid var(--border-subtle);
            border-radius: 10px;
            overflow: hidden;
            margin-top: 8px;
        }

        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 9px 16px;
            background: rgba(255, 255, 255, 0.025);
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text-muted);
            font-family: 'JetBrains Mono', monospace;
        }

        .code-block {
            padding: 18px;
            font-size: 12px;
            line-height: 1.6;
            color: #e2def2;
            overflow-x: auto;
            white-space: pre;
        }

        /* Nav Drawer Items */
        .nav-category {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13px;
            color: var(--text-secondary);
            transition: all 0.15s ease;
            margin-bottom: 3px;
        }

        .nav-link:hover {
            color: var(--text-primary);
            background: var(--bg-surface);
        }
    </style>
</head>
<body>
    <!-- Top Header -->
    @include('partials.header')

    <!-- Drawer Overlay -->
    <div id="drawerOverlay" class="drawer-overlay"></div>

    <!-- Off-canvas Sidebar Drawer -->
    @include('partials.docs-sidebar')

    <!-- Main Content Container -->
    <div class="docs-wrapper">
        <main class="docs-content">
            @yield('content')
        </main>
    </div>

    <!-- Footer -->
    @include('partials.footer')

    <!-- Interactive Scripts -->
    <script>
        function copyCode(btn, elementId) {
            const el = document.getElementById(elementId);
            if (!el) return;
            navigator.clipboard.writeText(el.innerText).then(() => {
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                btn.style.color = '#16e1aa';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.color = '';
                }, 1800);
            });
        }

        function copyCurl(btn, method, path, body = null) {
            const baseUrl = window.location.origin;
            let cmd = `curl -X ${method} "${baseUrl}${path}" \\\n  -H "Accept: application/json"`;
            
            if (method !== 'GET' && method !== 'DELETE') {
                cmd += ` \\\n  -H "Content-Type: application/json"`;
            }
            cmd += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
            
            if (body) {
                cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
            }

            navigator.clipboard.writeText(cmd).then(() => {
                const orig = btn.innerText;
                btn.innerText = 'cURL Copied!';
                btn.style.color = '#16e1aa';
                setTimeout(() => {
                    btn.innerText = orig;
                    btn.style.color = '';
                }, 1800);
            });
        }

        // Drawer toggle controls
        function toggleDrawer(open = null) {
            const drawer = document.getElementById('docsDrawer');
            const overlay = document.getElementById('drawerOverlay');
            if (!drawer || !overlay) return;

            const shouldOpen = open !== null ? open : !drawer.classList.contains('active');
            if (shouldOpen) {
                drawer.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const toggleBtn = document.getElementById('menuToggleBtn');
            const closeBtn = document.getElementById('drawerCloseBtn');
            const overlay = document.getElementById('drawerOverlay');
            const searchInput = document.getElementById('docsSearch');

            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleDrawer(true);
                });
            }

            if (closeBtn) {
                closeBtn.addEventListener('click', () => toggleDrawer(false));
            }

            if (overlay) {
                overlay.addEventListener('click', () => toggleDrawer(false));
            }

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') toggleDrawer(false);
                // Shortcut / to focus search
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    searchInput?.focus();
                }
            });

            // Close drawer when clicking any nav link
            document.querySelectorAll('.docs-drawer .nav-link').forEach(link => {
                link.addEventListener('click', () => toggleDrawer(false));
            });

            // Live Endpoint Search Filter
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    const cards = document.querySelectorAll('.endpoint-card');
                    
                    cards.forEach(card => {
                        const text = card.innerText.toLowerCase();
                        card.style.display = text.includes(query) ? '' : 'none';
                    });
                });
            }
        });
    </script>
</body>
</html>
