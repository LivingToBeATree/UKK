@extends('emails.layouts.email')

@section('title', 'Artist Application Approved')

@section('content')
<h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">Welcome to Comme Artists!</h1>
<p style="margin: 18px 0 0; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65;">
    Congratulations, {{ $user->display_name ?? $user->username }}! Your application to become a verified artist on Comme has been approved.
</p>
<div style="margin: 26px 0; padding: 20px; background: #f0f7ee; border: 1px solid #cbe4c7; border-left: 4px solid #3c763d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #2b542c; border-radius: 2px;">
    <strong>Your artist profile is now active!</strong> You can start creating commission services, posting portfolio artwork, and accepting client requests.
</div>
<p style="margin: 0 0 16px; color: #4f4a43; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.65;">
    Head over to your dashboard to complete your artist profile settings, configure your commission slots, and set up your portfolio.
</p>
<p style="margin: 0 0 28px; color: #746a5c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.6;">
    We're excited to see your work on Comme. If you have any questions, feel free to reach out to our staff support.
</p>
@endsection
