<!-- Section: Media Upload & Assets -->
<section id="media-section" style="margin-bottom: 64px;">
    <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary);">Media & Asset Storage</h2>
        <p style="font-size: 14px; color: var(--text-secondary);">Multipart file uploads, asset metadata queries, and ownership-protected deletion.</p>
    </div>

    <!-- POST /api/media -->
    <div class="endpoint-card" id="post-api-media">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-post">POST</span>
                <span>/api/media</span>
            </div>
            <span class="auth-badge">Authenticated User</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Uploads multipart image or video asset. Automatically attaches authenticated user as owner.</p>
            <div class="code-container">
                <div class="code-header"><span>Form-Data Request</span></div>
                <div class="code-block">file: [binary file] (jpeg, png, webp, mp4, max 25MB)
is_thumbnail: false (optional boolean)
sort_order: 0 (optional integer)</div>
            </div>
            <div class="code-container">
                <div class="code-header"><span>Response (201 Created)</span></div>
                <div class="code-block">{
  "status": "success",
  "message": "Media uploaded successfully.",
  "data": {
    "id": 12,
    "user_id": 4,
    "file_name": "artwork.png",
    "file_path": "uploads/2026/08/uuid.png",
    "url": "http://localhost:8000/storage/uploads/2026/08/uuid.png",
    "media_type": "image",
    "file_size": 204800,
    "mime_type": "image/png",
    "sort_order": 0,
    "is_thumbnail": false,
    "created_at": "2026-08-31T08:00:00.000000Z"
  }
}</div>
            </div>
        </div>
    </div>

    <!-- GET /api/media/{id} -->
    <div class="endpoint-card" id="get-api-media-id">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/media/{id}</span>
            </div>
            <span class="auth-badge">Public Access</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Retrieves metadata and public URL for a given media asset.</p>
        </div>
    </div>

    <!-- DELETE /api/media/{id} -->
    <div class="endpoint-card" id="delete-api-media-id">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-delete">DELETE</span>
                <span>/api/media/{id}</span>
            </div>
            <span class="auth-badge">Owner / Admin Only</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Deletes media record and purges physical file from storage. Strictly protected by <code>MediaPolicy</code>.
            </p>
        </div>
    </div>

    <!-- GET /storage/{path} -->
    <div class="endpoint-card" id="get-storage-path">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/storage/{path}</span>
            </div>
            <span class="auth-badge">Public Access</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">Direct storage asset streaming and download provider with automatic CORS headers (<code>Access-Control-Allow-Origin: *</code>). Resolves files across public storage disks and mounts. Supports forced attachment downloads via <code>?download=1&name=custom_name.ext</code> query parameter.</p>
        </div>
    </div>

    <!-- GET /api/media/private/{media}/download -->
    <div class="endpoint-card" id="get-api-media-private-download">
        <div class="endpoint-header">
            <div class="endpoint-path">
                <span class="method-pill method-get">GET</span>
                <span>/api/media/private/{media}/download</span>
            </div>
            <span class="auth-badge">Order Participants / Owner / Staff</span>
        </div>
        <div class="endpoint-body">
            <p style="font-size: 14px; color: var(--text-secondary);">
                Securely serves private, access-controlled media assets stored on non-public disks. Strictly enforces cryptographic authorization checks: file owner, assigned commission buyer or artist, and platform moderation staff.
            </p>
            <table class="param-table">
                <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span class="param-name">media</span> <span class="param-required">req</span></td><td><span class="param-type">integer</span></td><td>Media record ID.</td></tr>
                    <tr><td><span class="param-name">type</span> <span class="param-optional">opt</span></td><td><span class="param-type">string</span></td><td>Pass <code>thumb</code> to download or view thumbnail instead of original file.</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Dual Deliverable & Anti-Art Theft Architecture Guide -->
    <div style="margin-top: 32px; padding: 24px; background: rgba(0, 195, 255, 0.04); border: 1px solid rgba(0, 195, 255, 0.2); border-radius: 12px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <img src="{{ asset('icons/SVGs/Shield/shield-white.svg') }}" class="icon-themed" style="width: 18px; height: 18px;" alt="" />
            Dual Deliverable & Anti-Art Theft Security Pipeline
        </h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
            To eliminate buyer-side art theft and chargeback fraud, Comme implements an automated two-tier deliverable isolation pipeline:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px;">
                <div style="font-size: 13px; font-weight: 700; color: var(--brand-gold); margin-bottom: 6px;">1. Review State: Automated Watermarked Previews</div>
                <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                    When artists deliver work (<code>POST /api/commissions/{id}/deliver</code>), an unwatermarked master is placed in private disk storage. A background job uses PHP GD to stamp an aggressive diagonal repeating watermark pattern (<code>COMME PREVIEW • UNPAID • ORDER #[ID]</code>). The client inspects deliverables via <code>GET /api/commissions/{id}/proof/{media}</code> with zero risk of unpaid asset extraction.
                </p>
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px;">
                <div style="font-size: 13px; font-weight: 700; color: var(--brand-teal); margin-bottom: 6px;">2. Completed State: Gated Full-Resolution Masters</div>
                <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                    Pristine, full-resolution deliverable downloads (<code>GET /api/commissions/{id}/download-original/{media}</code>) remain cryptographically locked behind the commission completion gate. Once the buyer clicks <strong>Approve Delivery</strong> (<code>POST .../confirm</code>), funds in escrow disburse to the creator and the original unwatermarked downloads unlock permanently.
                </p>
            </div>
        </div>
    </div>
</section>
