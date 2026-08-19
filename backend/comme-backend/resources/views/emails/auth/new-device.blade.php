@extends('emails.layouts.email')

@section('title', 'New Device Sign-in')

@section('content')
<h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">New device sign-in</h1>
<p style="margin: 18px 0 0; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
    Hello {{ $user->display_name ?? $user->username }}, we detected a new sign-in to your Comme account from an unrecognized device or browser.
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background: #f5f0e6; border: 1px solid #ded4c3; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px;">
    <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #ded4c3; color: #746a5c; width: 30%;"><strong>Time</strong></td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #ded4c3; color: #24221f;">{{ $loginTime }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #ded4c3; color: #746a5c;"><strong>IP Address</strong></td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #ded4c3; color: #24221f;">{{ $ipAddress }}</td>
    </tr>
    <tr>
        <td style="padding: 12px 16px; color: #746a5c;"><strong>Device</strong></td>
        <td style="padding: 12px 16px; color: #24221f; word-break: break-all;">{{ $userAgent }}</td>
    </tr>
</table>
<div style="margin: 26px 0; padding: 16px; background: #fff2e8; border-left: 4px solid #b35900; color: #6b3500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; border-radius: 2px;">
    <strong>Didn't sign in?</strong> Your account password may have been compromised. We recommend changing your password immediately and revoking other active sessions in your security settings.
</div>
<p style="margin: 0 0 28px; color: #746a5c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6;">
    If this was you, you can safely ignore this email — this device has been added to your recognized devices.
</p>
@endsection
