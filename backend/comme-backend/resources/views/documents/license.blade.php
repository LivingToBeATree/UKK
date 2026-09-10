<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Authenticity & License — {{ $licenseNumber }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #F8FAFC;
            color: #0F172A;
            line-height: 1.6;
            padding: 32px 16px;
        }
        .cert-container {
            max-width: 840px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
            border: 8px double #D97706; /* Gold double border */
            padding: 48px;
            position: relative;
            overflow: hidden;
        }
        .cert-header {
            text-align: center;
            margin-bottom: 36px;
        }
        .cert-badge {
            font-family: 'Cinzel', serif;
            font-size: 13px;
            font-weight: 700;
            color: #D97706;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 8px;
        }
        .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 28px;
            font-weight: 900;
            color: #0F172A;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .cert-sub {
            font-size: 14px;
            color: #64748B;
            max-width: 500px;
            margin: 0 auto;
        }
        .cert-number {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: #64748B;
            margin-top: 12px;
            background: #F8FAFC;
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            border: 1px solid #E2E8F0;
        }
        .cert-body {
            margin: 32px 0;
            font-size: 15px;
            color: #334155;
            text-align: center;
            line-height: 1.8;
        }
        .grantee-box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 24px;
            margin: 28px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            text-align: left;
        }
        .label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #D97706;
            letter-spacing: 0.8px;
        }
        .val-title {
            font-size: 16px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 2px;
        }
        .rights-box {
            border: 1px solid #FEF3C7;
            background: #FFFBEB;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
            text-align: left;
        }
        .rights-title {
            font-size: 13px;
            font-weight: 700;
            color: #92400E;
            margin-bottom: 6px;
        }
        .rights-desc {
            font-size: 13px;
            color: #B45309;
            line-height: 1.5;
        }
        .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 48px;
            margin-top: 48px;
            padding-top: 24px;
        }
        .sig-line {
            border-top: 1px solid #CBD5E1;
            padding-top: 8px;
            text-align: center;
            font-size: 13px;
            color: #64748B;
        }
        .sig-name {
            font-weight: 700;
            color: #0F172A;
        }
        .action-bar {
            max-width: 840px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            text-decoration: none;
        }
        .btn-primary { background: #0F172A; color: #FFFFFF; }
        .btn-primary:hover { background: #1E293B; }
        .btn-outline { background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; }
        .btn-outline:hover { background: #F1F5F9; }

        @media print {
            body { padding: 0; background: #FFFFFF; }
            .action-bar { display: none; }
            .cert-container { box-shadow: none; border-width: 4px; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="action-bar">
        <button class="btn btn-outline" onclick="window.close()">← Close</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save Certificate (PDF)</button>
    </div>

    <div class="cert-container">
        <div class="cert-header">
            <div class="cert-badge">Comme Creator Registry</div>
            <h1 class="cert-title">Certificate of Authenticity</h1>
            <p class="cert-sub">Official record of digital commission rights and artistic authorship</p>
            <div class="cert-number">{{ $licenseNumber }}</div>
        </div>

        <div class="cert-body">
            This document certifies that the artwork commissioned under Order <strong>#{{ $commission->id }}</strong> titled <em>"{{ $commission->title ?: ($commission->service->title ?? 'Custom Artwork') }}"</em> was uniquely authored and delivered through the Comme platform.
        </div>

        <div class="grantee-box">
            <div>
                <div class="label">Licensor & Author</div>
                <div class="val-title">{{ $commission->artistProfile->user->display_name ?? $commission->artistProfile->user->username }}</div>
                <div style="font-size: 12px; color: #64748B;">Verified Creator Studio (@<span>{{ $commission->artistProfile->user->username }}</span>)</div>
            </div>
            <div>
                <div class="label">Licensee & Rights Holder</div>
                <div class="val-title">{{ $commission->user->display_name ?? $commission->user->username }}</div>
                <div style="font-size: 12px; color: #64748B;">Registered Collector (@<span>{{ $commission->user->username }}</span>)</div>
            </div>
        </div>

        <div class="rights-box">
            <div class="rights-title">
                Scope of Grant: {{ !empty($hasCommercialRights) ? 'FULL COMMERCIAL LICENSE' : 'PERSONAL NON-COMMERCIAL USE ONLY' }}
            </div>
            <div class="rights-desc">
                @if(!empty($hasCommercialRights))
                    The licensee is granted a perpetual, worldwide, non-exclusive license to reproduce, distribute, display, and commercially exploit the commissioned artwork for marketing, merchandise, streaming, and business purposes, with author credit where appropriate.
                @else
                    The licensee is granted non-exclusive rights for personal, non-commercial use (including avatars, personal social media banners, and non-monetized displays). Commercial resale, mass printing, and unauthorized commercial exploitation are strictly prohibited without written consent.
                @endif
            </div>
        </div>

        <div class="signatures">
            <div class="sig-line">
                <div class="sig-name">{{ $commission->artistProfile->user->display_name ?? $commission->artistProfile->user->username }}</div>
                <div>Creator / Artistic Licensor</div>
            </div>
            <div class="sig-line">
                <div class="sig-name">Comme Digital Verification</div>
                <div>Automated Smart Escrow Verification</div>
            </div>
        </div>
    </div>

    @if($autoPrint)
    <script>
        window.addEventListener('DOMContentLoaded', () => window.print());
    </script>
    @endif
</body>
</html>
