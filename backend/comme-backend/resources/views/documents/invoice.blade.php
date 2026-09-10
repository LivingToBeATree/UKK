<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Invoice — {{ $receiptNumber }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #F8FAFC;
            color: #0F172A;
            line-height: 1.5;
            padding: 32px 16px;
        }
        .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
            border: 1px solid #E2E8F0;
            overflow: hidden;
        }
        .header {
            padding: 36px 40px;
            background: #0F172A;
            color: #FFFFFF;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .logo-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo-title span { color: #38BDF8; }
        .invoice-meta { text-align: right; }
        .invoice-number {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #94A3B8;
        }
        .status-badge {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #10B981;
            color: #FFFFFF;
        }
        .content { padding: 40px; }
        .party-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 36px;
            padding-bottom: 24px;
            border-bottom: 1px solid #E2E8F0;
        }
        .party-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748B;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
        }
        .party-name { font-size: 16px; font-weight: 700; color: #0F172A; }
        .party-sub { font-size: 13px; color: #64748B; }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
        }
        .items-table th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #64748B;
            padding: 12px 16px;
            background: #F1F5F9;
            letter-spacing: 0.5px;
        }
        .items-table th.amount, .items-table td.amount { text-align: right; }
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #F1F5F9;
            font-size: 14px;
        }
        .item-desc { font-size: 12px; color: #64748B; margin-top: 2px; }

        .summary-grid {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 36px;
        }
        .summary-box { width: 320px; }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #475569;
        }
        .summary-row.total {
            border-top: 2px solid #0F172A;
            padding-top: 12px;
            margin-top: 6px;
            font-size: 18px;
            font-weight: 800;
            color: #0F172A;
        }

        .footer-note {
            background: #F8FAFC;
            padding: 24px 32px;
            border-radius: 12px;
            font-size: 12px;
            color: #64748B;
            line-height: 1.6;
        }

        .action-bar {
            max-width: 800px;
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
            transition: all 0.15s ease;
            text-decoration: none;
        }
        .btn-primary { background: #0F172A; color: #FFFFFF; }
        .btn-primary:hover { background: #1E293B; }
        .btn-outline { background: #FFFFFF; border: 1px solid #CBD5E1; color: #334155; }
        .btn-outline:hover { background: #F1F5F9; }

        @media print {
            body { padding: 0; background: #FFFFFF; }
            .action-bar { display: none; }
            .invoice-card { box-shadow: none; border: none; max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="action-bar">
        <button class="btn btn-outline" onclick="window.close()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Close
        </button>
        <button class="btn btn-primary" onclick="window.print()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print / Save as PDF
        </button>
    </div>

    <div class="invoice-card">
        <div class="header">
            <div>
                <div class="logo-title">COMME<span>.</span></div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Digital Creator Commission Marketplace</div>
            </div>
            <div class="invoice-meta">
                <div class="invoice-number">{{ $receiptNumber }}</div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 2px;">Date: {{ $commission->created_at->format('M d, Y') }}</div>
                <div class="status-badge">{{ strtoupper($commission->status instanceof \App\Enum\CommissionStatus ? $commission->status->value : $commission->status) }}</div>
            </div>
        </div>

        <div class="content">
            <div class="party-grid">
                <div>
                    <div class="party-title">Billed To (Buyer)</div>
                    <div class="party-name">{{ $commission->user->display_name ?? $commission->user->username }}</div>
                    <div class="party-sub">@<span>{{ $commission->user->username }}</span></div>
                    <div class="party-sub">{{ $commission->user->email }}</div>
                </div>
                <div>
                    <div class="party-title">Creator Studio (Artist)</div>
                    <div class="party-name">{{ $commission->artistProfile->user->display_name ?? $commission->artistProfile->user->username }}</div>
                    <div class="party-sub">@<span>{{ $commission->artistProfile->user->username }}</span></div>
                    @if($commission->artistProfile->website)
                        <div class="party-sub">{{ $commission->artistProfile->website }}</div>
                    @endif
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="amount">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>{{ $commission->title ?: ($commission->service->name ?? $commission->service->title ?? 'Custom Artwork Commission') }}</strong>
                            <div class="item-desc">Commission Order #{{ $commission->id }} • Licensed for {{ !empty($hasCommercialRights) ? 'Commercial Use' : 'Personal Use' }}</div>
                        </td>
                        <td class="amount">Rp {{ number_format($commission->base_price ?: ($commission->total_price ?: 0), 0, ',', '.') }}</td>
                    </tr>
                    @foreach($commission->addonsSelections as $addon)
                    <tr>
                        <td>
                            <strong>+ {{ $addon->title ?: ($addon->addon->name ?? 'Service Add-on') }}</strong>
                            <div class="item-desc">Selected Add-on Option</div>
                        </td>
                        <td class="amount">Rp {{ number_format($addon->price ?: 0, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="summary-grid">
                <div class="summary-box">
                    <div class="summary-row">
                        <span>Base Price</span>
                        <span>Rp {{ number_format($commission->base_price ?: ($commission->total_price ?: 0), 0, ',', '.') }}</span>
                    </div>
                    @if($commission->addonsSelections->isNotEmpty())
                    <div class="summary-row">
                        <span>Add-ons Total</span>
                        <span>Rp {{ number_format($commission->addonsSelections->sum('price'), 0, ',', '.') }}</span>
                    </div>
                    @endif
                    <div class="summary-row">
                        <span>Escrow Service Fee</span>
                        <span>Rp 0</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total Paid</span>
                        <span>Rp {{ number_format($commission->total_price ?: 0, 0, ',', '.') }}</span>
                    </div>
                </div>
            </div>

            <div class="footer-note">
                <strong>Transaction Security & Escrow Protection:</strong> Funds were securely handled through Comme Escrow Protection and Midtrans Payment Gateway. Official digital receipt generated automatically upon order lifecycle completion.
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
