<?php

namespace App\Http\Controllers\API\V1;

use App\Enum\CommissionStatus;
use App\Models\Commission;
use App\Models\User;
use Illuminate\Http\Response;

class ArtistBadgeController extends Controller
{
    /**
     * Render a dynamic, high-DPI SVG badge displaying the artist's real-time commission status.
     */
    public function show(string $username): Response
    {
        $user = User::whereRaw('LOWER(username) = ?', [strtolower($username)])
            ->with('artistProfile')
            ->first();

        if (! $user || ! $user->artistProfile) {
            $svg = $this->renderSvgBadge('Comme', 'Artist Not Found', '#EF4444');
            return response($svg, 404)
                ->header('Content-Type', 'image/svg+xml; charset=utf-8')
                ->header('Cache-Control', 'no-cache')
                ->header('Access-Control-Allow-Origin', '*');
        }

        $profile = $user->artistProfile;
        $status = strtolower($profile->commission_status ?? ($profile->commission_open ? 'open' : 'closed'));

        $activeOrders = Commission::where('artist_profile_id', $profile->id)
            ->whereIn('status', [
                CommissionStatus::ACCEPTED->value,
                CommissionStatus::IN_PROGRESS->value,
                CommissionStatus::REVISION->value,
            ])
            ->count();

        [$color, $statusLabel] = match ($status) {
            'open' => [
                '#10B981',
                $activeOrders > 0 ? "Commissions: OPEN ({$activeOrders} in progress)" : 'Commissions: OPEN'
            ],
            'busy' => [
                '#F59E0B',
                $activeOrders > 0 ? "Commissions: BUSY ({$activeOrders} active)" : 'Commissions: BUSY'
            ],
            default => [
                '#64748B',
                'Commissions: CLOSED'
            ],
        };

        $leftLabel = "Comme • @" . $user->username;
        $svg = $this->renderSvgBadge($leftLabel, $statusLabel, $color);

        return response($svg, 200)
            ->header('Content-Type', 'image/svg+xml; charset=utf-8')
            ->header('Cache-Control', 'public, max-age=60')
            ->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Generate pure vector SVG shield badge.
     */
    private function renderSvgBadge(string $leftText, string $rightText, string $statusColor): string
    {
        $leftCharCount = mb_strlen($leftText);
        $rightCharCount = mb_strlen($rightText);

        $leftWidth = max(90, (int) round($leftCharCount * 7.5 + 24));
        $rightWidth = max(110, (int) round($rightCharCount * 7.2 + 30));
        $totalWidth = $leftWidth + $rightWidth;
        $height = 28;

        $leftTextX = (int) round($leftWidth / 2);
        $rightTextX = (int) round($leftWidth + ($rightWidth / 2) + 4);
        $dotX = $leftWidth + 14;
        $heightMinusSix = $height - 6;
        $totalMinusSix = $totalWidth - 6;

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="{$totalWidth}" height="{$height}" viewBox="0 0 {$totalWidth} {$height}" role="img" aria-label="{$leftText}: {$rightText}">
  <defs>
    <linearGradient id="grad-left" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="grad-right" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{$statusColor}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="{$statusColor}"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#shadow)">
    <!-- Outer container with rounded corners -->
    <rect width="{$totalWidth}" height="{$height}" rx="6" fill="#0F172A"/>

    <!-- Left section -->
    <path d="M 6 0 L {$leftWidth} 0 L {$leftWidth} {$height} L 6 {$height} A 6 6 0 0 1 0 {$heightMinusSix} L 0 6 A 6 6 0 0 1 6 0 Z" fill="url(#grad-left)"/>

    <!-- Right section -->
    <path d="M {$leftWidth} 0 L {$totalMinusSix} 0 A 6 6 0 0 1 {$totalWidth} 6 L {$totalWidth} {$heightMinusSix} A 6 6 0 0 1 {$totalMinusSix} {$height} L {$leftWidth} {$height} Z" fill="url(#grad-right)"/>

    <!-- Divider line -->
    <line x1="{$leftWidth}" y1="0" x2="{$leftWidth}" y2="{$height}" stroke="#334155" stroke-width="1"/>

    <!-- Status dot on right section -->
    <circle cx="{$dotX}" cy="14" r="3.5" fill="#FFFFFF" opacity="0.95"/>
  </g>

  <!-- Text elements -->
  <g fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" text-anchor="middle" dominant-baseline="central">
    <!-- Left text -->
    <text x="{$leftTextX}" y="14.5" fill="#F8FAFC" letter-spacing="0.2">{$leftText}</text>
    <!-- Right text -->
    <text x="{$rightTextX}" y="14.5" fill="#FFFFFF" letter-spacing="0.2">{$rightText}</text>
  </g>
</svg>
SVG;
    }
}
