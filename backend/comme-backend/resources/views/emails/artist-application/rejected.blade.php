@extends('emails.layouts.email')

@section('title', 'Artist Application Update')

@section('content')
<h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">Artist application update</h1>
<p style="margin: 18px 0 0; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
    Hello {{ $user->display_name ?? $user->username }}, thank you for applying to become a verified artist on Comme. After careful review, our moderation team was unable to approve your application at this time.
</p>
<div style="margin: 24px 0; padding: 18px; background: #fbf0ea; border: 1px solid #e8cbba; border-left: 4px solid #b35900; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #6b3500; border-radius: 2px;">
    <strong>Feedback from our review team:</strong>
    <p style="margin: 8px 0 0; color: #24221f;">{{ $rejectionReason }}</p>
</div>
<p style="margin: 0 0 16px; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.65;">
    You are welcome to update your portfolio and submit a new application once you have addressed the feedback above.
</p>
<p style="margin: 0 0 28px; color: #746a5c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6;">
    If you believe this decision was made in error or have questions, please submit a support ticket from your account.
</p>
@endsection
