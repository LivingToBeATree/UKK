@extends('emails.layouts.email')

@section('title', 'Verify your email')

@section('content')
<h1 style="margin: 0; color: #24221f; font-size: 30px; line-height: 1.2; font-weight: normal;">Verify your email</h1>
<p style="margin: 18px 0 0; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
    Use this code to finish creating your account. Your account will not be created until the code is confirmed.
</p>
<div style="margin: 28px 0; padding: 22px; background: #24221f; color: #fffaf1; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 34px; letter-spacing: 0.28em; font-weight: 700; border-radius: 4px;">
    {{ $code }}
</div>
<p style="margin: 0 0 28px; color: #746a5c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6;">
    This code expires in {{ $ttlMinutes }} minutes. If you did not request this, you can safely ignore this email.
</p>
@endsection
