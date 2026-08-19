@extends('layouts.app')

@section('title', 'Comme API Overview')

@section('content')
<div class="container" style="padding-top: 60px; padding-bottom: 40px;">
    <!-- Hero Section -->
    <div style="text-align: center; max-width: 720px; margin: 0 auto 60px auto;">
        <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <span class="badge">Production Ready</span>
            <span style="font-size: 13px; color: var(--text-secondary);">REST API & Microservices</span>
        </div>
        <h1 style="font-size: 42px; font-weight: 800; line-height: 1.15; letter-spacing: -0.04em; margin-bottom: 16px;">
            Next-Gen Creator Commission Marketplace
        </h1>
        <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 32px;">
            Powering commissioned art, verified artist reviews, custom portfolios, automated notifications, and seamless Midtrans payments.
        </p>
        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
            <a href="{{ url('/api/posts') }}" class="btn btn-primary">
                View Public Posts API
            </a>
            <a href="{{ url('/api/artist-applications') }}" class="btn btn-secondary">
                Artist Applications Queue
            </a>
        </div>
    </div>

    <!-- Core Features Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <!-- Card 1 -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 20px;">
                🎨
            </div>
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Artist Application & Review</h3>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
                Vetting workflow for artists before seller privileges. Atomic profile creation on approval, rejection logs, and email notifications.
            </p>
        </div>

        <!-- Card 2 -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 20px;">
                💬
            </div>
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Direct Commission Chat</h3>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
                Built-in messaging threads for buyers and artists on active orders, complete with in-app notification alerts and staff audit access.
            </p>
        </div>

        <!-- Card 3 -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 20px;">
                💳
            </div>
            <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Midtrans Snap Payments</h3>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
                Seamless payment tokens, automated callback webhook signature validation, and instant commission status progression.
            </p>
        </div>
    </div>
</div>
@endsection
