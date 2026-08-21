@extends('layouts.app')

@section('title', 'Explore API — Comme')

@section('content')
<!-- Hero Section -->
<section style="margin-bottom: 40px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span class="auth-badge" style="background: rgba(2, 245, 168, 0.12); color: var(--brand-teal); border-color: rgba(2, 245, 168, 0.25);">
            Interactive Sandbox
        </span>
        <span style="font-size: 13px; color: var(--text-muted);">Live REST API Tester</span>
    </div>

    <h1 class="heading-gradient" style="font-size: 34px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px;">
        Explore API JSON
    </h1>

    <p style="font-size: 15px; color: var(--text-secondary); max-width: 760px; line-height: 1.65; margin-bottom: 24px;">
        Test and inspect Comme API responses in real-time. Select an endpoint below or enter any path to preview live data. For authenticated routes, provide your Bearer token in the auth field.
    </p>

    <!-- Bearer Token Input Bar -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px 20px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 280px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(168, 2, 245, 0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="{{ asset('icons/SVGs/Key/key-white.svg') }}" class="icon-themed" style="width: 16px; height: 16px;" alt="Key" />
            </div>
            <div style="flex: 1;">
                <div style="font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Bearer Token (Optional)</div>
                <input
                    id="explorerAuthToken"
                    type="password"
                    placeholder="Paste Sanctum personal access token (e.g. 1|AbCdEf...)"
                    style="width: 100%; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); font-size: 13px; font-family: 'JetBrains Mono', monospace; outline: none;"
                    onchange="saveToken(this.value)"
                    oninput="saveToken(this.value)"
                />
            </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-copy" onclick="toggleTokenVisibility()" style="font-size: 12px; padding: 7px 12px;">
                <span id="tokenToggleText">Show Token</span>
            </button>
            <button class="btn-copy" onclick="clearToken()" style="font-size: 12px; padding: 7px 12px; color: var(--brand-rose); border-color: rgba(255, 67, 101, 0.3);">
                Clear
            </button>
        </div>
    </div>
</section>

<!-- Endpoint Explorer Cards -->
<section style="margin-bottom: 48px;">
    <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
        <span>Featured Endpoints</span>
        <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); background: rgba(128,128,128,0.1); padding: 2px 8px; border-radius: 10px;">Quick Test</span>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px;">
        @php
            $endpoints = [
                ['method' => 'GET', 'path' => 'api/posts', 'label' => 'Feed Posts', 'desc' => 'Browse paginated artwork posts from artists.'],
                ['method' => 'GET', 'path' => 'api/commission-services', 'label' => 'Commission Services', 'desc' => 'View available commission listings & prices.'],
                ['method' => 'GET', 'path' => 'api/me', 'label' => 'Current User (/me)', 'desc' => 'Get profile & artist status of logged in user.'],
                ['method' => 'GET', 'path' => 'api/notifications/unread-count', 'label' => 'Unread Notifications', 'desc' => 'Count of unread alerts for current user.'],
            ];
        @endphp

        @foreach ($endpoints as $ep)
            <div class="endpoint-card" style="margin-bottom: 0;">
                <div class="endpoint-header" style="padding: 14px 18px;">
                    <div class="endpoint-path" style="font-size: 13px;">
                        <span class="method-pill method-{{ strtolower($ep['method']) }}">{{ $ep['method'] }}</span>
                        <span>/{{ $ep['path'] }}</span>
                    </div>
                </div>
                <div class="endpoint-body" style="padding: 18px; gap: 14px;">
                    <div>
                        <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">{{ $ep['label'] }}</div>
                        <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.4;">{{ $ep['desc'] }}</p>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-copy" onclick="testEndpoint('{{ $ep['path'] }}')" style="background: rgba(2, 245, 168, 0.1); border-color: rgba(2, 245, 168, 0.3); color: var(--brand-teal); font-weight: 600; padding: 6px 14px; cursor: pointer;">
                            Test Live ⚡
                        </button>
                        <button class="btn-copy" onclick="copyCurl(this, '{{ $ep['method'] }}', '/{{ $ep['path'] }}')">Copy cURL</button>
                        <a href="{{ url($ep['path']) }}" target="_blank" class="btn-copy" title="Open raw response in new tab" style="font-size: 11px; padding: 6px 10px; color: var(--text-muted); text-decoration: none;">
                            Raw Tab ↗
                        </a>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</section>

<!-- Live JSON Fetcher Console -->
<section id="explorer-console" style="margin-bottom: 64px; scroll-margin-top: 100px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
        <div>
            <h2 style="font-size: 20px; font-weight: 700;">Live Request Console</h2>
            <p style="font-size: 13px; color: var(--text-secondary);">Send live HTTP requests and view formatted JSON responses, status codes, and latency.</p>
        </div>
    </div>

    <!-- Request Input Bar -->
    <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0 12px; flex: 1; min-width: 280px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-muted); padding-right: 6px; user-select: none;">
                {{ url('') }}/
            </span>
            <input
                id="explorerPathInput"
                type="text"
                value="api/posts"
                style="flex: 1; background: transparent; border: none; padding: 12px 0; color: var(--text-primary); font-size: 14px; font-family: 'JetBrains Mono', monospace; outline: none;"
                placeholder="api/posts"
                onkeydown="if(event.key==='Enter') fetchExplorerJson()"
            />
        </div>
        <button
            id="explorerFetchBtn"
            onclick="fetchExplorerJson()"
            style="background: var(--brand-purple); color: white; border: none; border-radius: 10px; padding: 12px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px;"
        >
            <span>Send Request</span>
            <span>▶</span>
        </button>
    </div>

    <!-- Response Container -->
    <div class="code-container" id="explorerResponseContainer" style="display: block;">
        <div class="code-header" style="padding: 10px 16px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span id="explorerResponseStatus" style="font-weight: 700; font-size: 12px;">Ready</span>
                <span id="explorerResponseTime" style="font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;"></span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-copy" onclick="copyCode(this, 'explorerResponseBody')">Copy JSON</button>
            </div>
        </div>
        <div id="explorerResponseBody" class="code-block" style="max-height: 520px; overflow-y: auto; color: var(--text-secondary);">
// Click "Send Request" or "Test Live" above to inspect the API JSON response...
        </div>
    </div>
</section>

<!-- Quick Link to Error Reference -->
<section style="padding: 24px 28px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 14px; margin-bottom: 64px;">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(255, 67, 101, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="{{ asset('icons/SVGs/Shield/shield-white.svg') }}" class="icon-themed" style="width: 22px; height: 22px;" alt="" />
            </div>
            <div>
                <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">Receiving 401 Unauthenticated or 422 Validation errors?</div>
                <p style="font-size: 13px; color: var(--text-secondary);">Check our Error Collection for full explanations, status code definitions, and frontend handling tips.</p>
            </div>
        </div>
        <a href="{{ url('/errors') }}" class="btn-copy" style="text-decoration: none; padding: 9px 18px; font-weight: 600; color: var(--brand-rose); border-color: rgba(255, 67, 101, 0.3);">
            View Error Catalog →
        </a>
    </div>
</section>

<script>
    // Token Persistence
    function saveToken(token) {
        if (token.trim()) {
            localStorage.setItem('comme-api-token', token.trim());
        } else {
            localStorage.removeItem('comme-api-token');
        }
    }

    function clearToken() {
        localStorage.removeItem('comme-api-token');
        const input = document.getElementById('explorerAuthToken');
        if (input) input.value = '';
    }

    function toggleTokenVisibility() {
        const input = document.getElementById('explorerAuthToken');
        const text = document.getElementById('tokenToggleText');
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            text.innerText = 'Hide Token';
        } else {
            input.type = 'password';
            text.innerText = 'Show Token';
        }
    }

    // Quick Test Endpoint
    function testEndpoint(path) {
        const pathInput = document.getElementById('explorerPathInput');
        if (pathInput) {
            pathInput.value = path;
        }
        document.getElementById('explorer-console')?.scrollIntoView({ behavior: 'smooth' });
        fetchExplorerJson();
    }

    // Execute Request
    async function fetchExplorerJson() {
        const pathInput = document.getElementById('explorerPathInput');
        const container = document.getElementById('explorerResponseContainer');
        const body = document.getElementById('explorerResponseBody');
        const status = document.getElementById('explorerResponseStatus');
        const timeBadge = document.getElementById('explorerResponseTime');
        const btn = document.getElementById('explorerFetchBtn');
        const tokenInput = document.getElementById('explorerAuthToken');

        const path = pathInput.value.trim().replace(/^\//, '');
        const url = `{{ url('') }}/${path}`;
        const token = tokenInput ? tokenInput.value.trim() : (localStorage.getItem('comme-api-token') || '');

        btn.innerText = 'Fetching...';
        btn.disabled = true;
        container.style.display = 'block';
        body.innerText = 'Sending request...';
        status.innerText = 'Waiting for response...';
        status.style.color = 'var(--text-muted)';
        timeBadge.innerText = '';

        const headers = {
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const startTime = performance.now();

        try {
            const res = await fetch(url, {
                headers: headers,
                credentials: 'same-origin',
            });

            const durationMs = Math.round(performance.now() - startTime);
            const contentType = res.headers.get('content-type') || '';
            let formatted;

            if (contentType.includes('application/json')) {
                const json = await res.json();
                formatted = JSON.stringify(json, null, 2);
            } else {
                formatted = await res.text();
            }

            status.innerText = `Status: ${res.status} ${res.statusText || (res.status === 401 ? 'Unauthorized' : '')}`;
            status.style.color = res.ok ? 'var(--brand-teal)' : 'var(--brand-rose)';
            timeBadge.innerText = `${durationMs} ms`;
            body.innerText = formatted;
        } catch (err) {
            status.innerText = 'Network Error';
            status.style.color = 'var(--brand-rose)';
            timeBadge.innerText = '';
            body.innerText = `Failed to fetch: ${err.message}`;
        }

        btn.innerHTML = '<span>Send Request</span> <span>▶</span>';
        btn.disabled = false;
    }

    // Load saved token on page ready
    document.addEventListener('DOMContentLoaded', () => {
        const saved = localStorage.getItem('comme-api-token');
        const input = document.getElementById('explorerAuthToken');
        if (saved && input) {
            input.value = saved;
        }
    });
</script>
@endsection
