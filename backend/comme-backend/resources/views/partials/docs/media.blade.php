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
</section>
