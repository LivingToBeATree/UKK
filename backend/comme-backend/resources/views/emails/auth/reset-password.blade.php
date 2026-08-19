@extends('emails.layouts.email')

@section('title', 'Reset Your Password')

@section('content')
<h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">Reset your password</h1>
<p style="margin: 18px 0 0; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
    Hello {{ $user->display_name ?? $user->username }}, we received a request to reset the password for your Comme account. Click the button below to choose a new password.
</p>
<div style="margin: 30px 0; text-align: center;">
    <a href="{{ $resetUrl }}" style="display: inline-block; background: #24221f; color: #fffaf1; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 4px; letter-spacing: 0.04em;">Reset Password</a>
</div>
<p style="margin: 0 0 16px; color: #746a5c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6;">
    This password reset link will expire in {{ $expireMinutes }} minutes. If you did not request a password reset, no further action is required.
</p>
<hr style="border: none; border-top: 1px solid #ded4c3; margin: 24px 0;">
<p style="margin: 0 0 28px; color: #8e8476; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.5; word-break: break-all;">
    If you are having trouble clicking the button, copy and paste this URL into your web browser:<br>
    <a href="{{ $resetUrl }}" style="color: #24221f; text-decoration: underline;">{{ $resetUrl }}</a>
</p>
@endsection
