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
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

    <!-- Design System Tokens & Base Styles -->
    <style>
        :root {
            --bg-body: #0a0812;
            --bg-sidebar: #0f0c1b;
            --bg-surface: #141024;
            --bg-surface-elevated: #1b1630;
            --bg-code: #08060f;
            
            --border-subtle: #231c3d;
            --border-strong: #372d5c;
            --border-focus: #9c0bda;

            --text-primary: #f5f3fa;
            --text-secondary: #a79fc0;
            --text-muted: #6e6488;
            --text-on-accent: #ffffff;

            --brand-purple: #9c0bda;
            --brand-teal: #16e1aa;
            --brand-yellow: #f7bd26;
            --brand-rose: #ff4365;
            
            --brand-gradient: linear-gradient(135deg, #9c0bda 0%, #7000ff 50%, #16e1aa 100%);
            
            --method-get: #16e1aa;
            --method-post: #9c0bda;
            --method-patch: #f7bd26;
            --method-delete: #ff4365;
            
            --sidebar-width: 300px;
            --header-height: 68px;
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
        }

        .docs-sidebar {
            width: var(--sidebar-width);
            flex-shrink: 0;
            position: sticky;
            top: var(--header-height);
            height: calc(100vh - var(--header-height));
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border-subtle);
            overflow-y: auto;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            scrollbar-width: thin;
            scrollbar-color: var(--border-strong) transparent;
        }

        .docs-content {
            flex: 1;
            min-width: 0;
            padding: 40px 48px 120px 48px;
            max-width: 1040px;
        }

        @media (max-width: 960px) {
            .docs-wrapper {
                flex-direction: column;
            }
            .docs-sidebar {
                display: none;
                width: 100%;
                height: auto;
                position: static;
                border-right: none;
                border-bottom: 1px solid var(--border-subtle);
            }
            .docs-sidebar.active {
                display: flex;
            }
            .docs-content {
                padding: 24px 20px 80px 20px;
            }
        }

        /* Buttons & Badges */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            border: 1px solid transparent;
            font-family: inherit;
        }

        .btn-primary {
            background: var(--brand-gradient);
            color: var(--text-on-accent);
            box-shadow: 0 4px 14px rgba(156, 11, 218, 0.35);
        }

        .btn-primary:hover {
            opacity: 0.94;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--bg-surface-elevated);
            color: var(--text-primary);
            border-color: var(--border-subtle);
        }

        .btn-secondary:hover {
            background: #231c40;
            border-color: var(--border-strong);
        }

        .btn-copy {
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-secondary);
            border: 1px solid var(--border-subtle);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
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
        .method-post { background: rgba(156, 11, 218, 0.15); color: #c464fa; border: 1px solid rgba(156, 11, 218, 0.35); }
        .method-patch { background: rgba(247, 189, 38, 0.12); color: var(--method-patch); border: 1px solid rgba(247, 189, 38, 0.28); }
        .method-delete { background: rgba(255, 67, 101, 0.12); color: var(--method-delete); border: 1px solid rgba(255, 67, 101, 0.28); }

        .auth-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
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
            border-radius: 12px;
            margin-bottom: 32px;
            overflow: hidden;
            transition: border-color 0.2s;
        }

        .endpoint-card:hover {
            border-color: var(--border-strong);
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
            letter-spacing: 0.05em;
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
            border-radius: 8px;
            overflow: hidden;
            margin-top: 8px;
        }

        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 14px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text-muted);
        }

        .code-block {
            padding: 16px;
            font-size: 12px;
            line-height: 1.55;
            color: #e2def2;
            overflow-x: auto;
            white-space: pre;
        }

        /* Search & Nav items */
        .search-input {
            width: 100%;
            background: var(--bg-surface);
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 10px 14px 10px 36px;
            color: var(--text-primary);
            font-size: 13px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s;
        }

        .search-input:focus {
            border-color: var(--brand-purple);
            box-shadow: 0 0 0 3px rgba(156, 11, 218, 0.2);
        }

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
            padding: 7px 12px;
            border-radius: 6px;
            font-size: 13px;
            color: var(--text-secondary);
            transition: all 0.15s;
            margin-bottom: 2px;
        }

        .nav-link:hover {
            color: var(--text-primary);
            background: var(--bg-surface);
        }

        .nav-link.active {
            color: #ffffff;
            background: var(--bg-surface-elevated);
            border-left: 2px solid var(--brand-teal);
        }
    </style>
</head>
<body>
    @include('partials.header')

    <div class="docs-wrapper">
        @include('partials.docs-sidebar')

        <main class="docs-content">
            @yield('content')
        </main>
    </div>

    @include('partials.footer')

    <!-- Interactive Copy & Search Script -->
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
            const baseUrl = document.getElementById('baseUrlSelect')?.value || window.location.origin;
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

        // Live Endpoint Search Filter
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('docsSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.toLowerCase().trim();
                    const cards = document.querySelectorAll('.endpoint-card');
                    const navLinks = document.querySelectorAll('.nav-link');
                    
                    cards.forEach(card => {
                        const text = card.innerText.toLowerCase();
                        card.style.display = text.includes(query) ? '' : 'none';
                    });

                    navLinks.forEach(link => {
                        const text = link.innerText.toLowerCase();
                        link.style.display = text.includes(query) ? '' : 'none';
                    });
                });
            }

            // Mobile menu toggle
            const toggleBtn = document.getElementById('toggleSidebarBtn');
            const sidebar = document.querySelector('.docs-sidebar');
            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('active');
                });
            }
        });
    </script>
</body>
</html>
