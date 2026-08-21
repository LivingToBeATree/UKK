<!-- Authentication Flow Guide -->
<section id="authentication-flow" style="margin-bottom: 56px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 40px;">
    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Authentication & Headers</h2>
    <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
        All authenticated API requests should include the following standard HTTP headers:
    </p>

    <div class="code-container">
        <div class="code-header">
            <span>HTTP Request Headers</span>
            <button class="btn btn-copy" onclick="copyCode(this, 'code-headers')">Copy</button>
        </div>
        <div id="code-headers" class="code-block">Accept: application/json
Content-Type: application/json
Authorization: Bearer &lt;personal_access_token&gt;</div>
    </div>
</section>
