@extends('layouts.app')

@section('title', 'Explore API — Comme')

@section('content')
<!-- Hero Section -->
<section style="margin-bottom: 48px;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span class="auth-badge" style="background: rgba(22, 225, 170, 0.12); color: var(--brand-teal); border-color: rgba(22, 225, 170, 0.25);">Interactive Explorer</span>
    </div>

    <h1 style="font-size: 34px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 14px; background: linear-gradient(135deg, #ffffff 0%, #b4fae2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Explore API JSON
    </h1>

    <p style="font-size: 15px; color: var(--text-secondary); max-width: 760px; line-height: 1.65; margin-bottom: 32px;">
        Try Comme API endpoints directly. Select a resource below and see the live JSON response from the server. All public endpoints are available without authentication.
    </p>
</section>

<!-- Endpoint Explorer Cards -->
<section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 64px;">

    <!-- Public Endpoints Card -->
    @php
        $endpoints = [
            ['method' => 'GET', 'path' => '/api/posts', 'label' => 'Public Feed Posts', 'desc' => 'Browse paginated artwork posts from artists on the platform.'],
            ['method' => 'GET', 'path' => '/api/commission-services', 'label' => 'Commission Services', 'desc' => 'View available commission service listings and pricing.'],
        ];
    @endphp

    @foreach ($endpoints as $ep)
        <div class="endpoint-card">
            <div class="endpoint-header">
                <div class="endpoint-path">
                    <span class="method-pill method-{{ strtolower($ep['method']) }}">{{ $ep['method'] }}</span>
                    <span>{{ $ep['path'] }}</span>
                </div>
            </div>
            <div class="endpoint-body" style="gap: 16px;">
                <div>
                    <div style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">{{ $ep['label'] }}</div>
                    <p style="font-size: 13px; color: var(--text-secondary);">{{ $ep['desc'] }}</p>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <a href="{{ url($ep['path']) }}" target="_blank" class="btn-copy" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; background: rgba(22, 225, 170, 0.08); border-color: rgba(22, 225, 170, 0.25); color: var(--brand-teal);">
                        <span>Open JSON</span>
                        <span style="font-size: 10px;">↗</span>
                    </a>
                    <button class="btn-copy" onclick="copyCurl(this, '{{ $ep['method'] }}', '{{ $ep['path'] }}')">Copy cURL</button>
                </div>
            </div>
        </div>
    @endforeach
</section>

<!-- Live JSON Fetcher Section -->
<section style="margin-bottom: 64px;">
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px;">Live JSON Preview</h2>
    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">
        Enter any API path below to fetch and preview the response from this server. Authenticated endpoints will return <code>401 Unauthenticated</code> unless you provide a token.
    </p>

    <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 260px; position: relative;">
            <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; pointer-events: none;">{{ url('') }}/</span>
            <input
                id="explorerPathInput"
                type="text"
                value="api/posts"
                style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 12px 14px 12px {{ strlen(url('')) * 7.5 + 22 }}px; color: var(--text-primary); font-size: 14px; font-family: 'JetBrains Mono', monospace; outline: none; transition: border-color 0.2s;"
                onfocus="this.style.borderColor='var(--brand-purple)'"
                onblur="this.style.borderColor='var(--border-subtle)'"
                placeholder="api/posts"
            />
        </div>
        <button
            id="explorerFetchBtn"
            onclick="fetchExplorerJson()"
            style="background: var(--brand-purple); color: white; border: none; border-radius: 10px; padding: 12px 28px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;"
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='1'"
        >
            Send Request
        </button>
    </div>

    <!-- Response Output -->
    <div class="code-container" id="explorerResponseContainer" style="display: none;">
        <div class="code-header">
            <span id="explorerResponseStatus">Response</span>
            <button class="btn-copy" onclick="copyCode(this, 'explorerResponseBody')">Copy</button>
        </div>
        <div id="explorerResponseBody" class="code-block" style="max-height: 600px; overflow-y: auto;">
        </div>
    </div>
</section>

<!-- Quick Links back to Docs -->
<section style="margin-bottom: 64px; padding: 28px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 14px;">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div>
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Looking for full endpoint documentation?</div>
            <p style="font-size: 13px; color: var(--text-secondary);">View request/response schemas, parameter tables, permission badges, and cURL examples.</p>
        </div>
        <a href="{{ url('/') }}" style="background: rgba(156, 11, 218, 0.12); color: #c464fa; border: 1px solid rgba(156, 11, 218, 0.3); padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 0.15s;" onmouseover="this.style.background='rgba(156,11,218,0.22)'" onmouseout="this.style.background='rgba(156,11,218,0.12)'">
            ← Back to API Docs
        </a>
    </div>
</section>

<script>
    async function fetchExplorerJson() {
        const pathInput = document.getElementById('explorerPathInput');
        const container = document.getElementById('explorerResponseContainer');
        const body = document.getElementById('explorerResponseBody');
        const status = document.getElementById('explorerResponseStatus');
        const btn = document.getElementById('explorerFetchBtn');

        const path = pathInput.value.trim().replace(/^\//, '');
        const url = `{{ url('') }}/${path}`;

        btn.innerText = 'Fetching...';
        btn.disabled = true;
        container.style.display = 'block';
        body.innerText = 'Loading...';
        status.innerText = 'Fetching...';

        try {
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            const contentType = res.headers.get('content-type') || '';
            let text;

            if (contentType.includes('application/json')) {
                const json = await res.json();
                text = JSON.stringify(json, null, 2);
            } else {
                text = await res.text();
            }

            status.innerText = `Response (${res.status} ${res.statusText})`;
            status.style.color = res.ok ? 'var(--brand-teal)' : 'var(--brand-rose)';
            body.innerText = text;
        } catch (err) {
            status.innerText = 'Error';
            status.style.color = 'var(--brand-rose)';
            body.innerText = `Network error: ${err.message}`;
        }

        btn.innerText = 'Send Request';
        btn.disabled = false;
    }
</script>
@endsection
