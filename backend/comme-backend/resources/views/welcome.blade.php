@extends('layouts.app')

@section('title', 'Comme REST API Documentation')

@section('content')
    {{-- 1. Hero & Overview --}}
    @include('partials.docs.hero')

    {{-- 2. Headers & Auth Specs --}}
    @include('partials.docs.auth-flow')

    {{-- 3. Authentication & Account Endpoints --}}
    @include('partials.docs.auth-endpoints')

    {{-- 4. Artist Applications & Seller Vetting --}}
    @include('partials.docs.artist-applications')

    {{-- 5. Commission Services & Orders --}}
    @include('partials.docs.commissions')

    {{-- 6. Commission Chat --}}
    @include('partials.docs.commission-chat')

    {{-- 7. Feed, Posts & Social --}}
    @include('partials.docs.social-feed')

    {{-- 8. Notifications --}}
    @include('partials.docs.notifications')

    {{-- 9. Midtrans Payments & Webhooks --}}
    @include('partials.docs.payments')

    {{-- 10. Moderation & Support Tickets --}}
    @include('partials.docs.moderation')
@endsection
