@extends('layouts.app')

@section('title', '500 - Server Error | Comme API')

@section('content')
<div style="min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px;">
    <div style="font-size: 80px; font-weight: 800; font-family: 'JetBrains Mono', monospace; background: linear-gradient(135deg, var(--brand-rose) 0%, var(--brand-gold) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 16px;">
        500
    </div>
    
    <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
        Internal Server Error
    </h1>
    
    <p style="font-size: 15px; color: var(--text-secondary); max-width: 500px; line-height: 1.6; margin-bottom: 30px;">
        An unexpected condition was encountered on the server. If this issue persists, please consult the Error Catalog for troubleshooting guidance.
    </p>

    <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;">
        <a href="{{ url('/') }}" class="btn-copy" style="font-size: 13px; padding: 10px 20px; font-weight: 600; text-decoration: none; color: #fff; background: var(--brand-purple); border-color: var(--brand-purple);">
            Back to API Docs
        </a>
        <a href="{{ url('/errors') }}" class="btn-copy" style="font-size: 13px; padding: 10px 20px; font-weight: 600; text-decoration: none;">
            Browse Error Catalog
        </a>
    </div>
</div>
@endsection
