<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name', 'Comme')) - Commission & Art Marketplace API</title>

    <!-- Favicon & Icons from /icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('icons/32x32.png') }}">
    <link rel="icon" type="image/png" sizes="64x64" href="{{ asset('icons/64x64.png') }}">
    <link rel="apple-touch-icon" sizes="128x128" href="{{ asset('icons/128x128.png') }}">
    <link rel="apple-touch-icon" sizes="256x256" href="{{ asset('icons/256x256.png') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Styles -->
    <style>
        :root {
            --bg-primary: #0a0812;
            --bg-secondary: #120e22;
            --bg-card: #19142e;
            --border-color: #2b234d;
            --text-primary: #f8f6fc;
            --text-secondary: #a39cb8;
            --text-muted: #6e6785;
            --accent-purple: #9c0bda;
            --accent-teal: #16e1aa;
            --accent-yellow: #f7bd26;
            --accent-gradient: linear-gradient(135deg, #9c0bda 0%, #16e1aa 100%);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            line-height: 1.6;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .container {
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
            padding: 0 24px;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
            border: 1px solid transparent;
        }

        .btn-primary {
            background: var(--accent-gradient);
            color: #ffffff;
            box-shadow: 0 4px 18px rgba(156, 11, 218, 0.35);
        }

        .btn-primary:hover {
            opacity: 0.92;
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--bg-card);
            color: var(--text-primary);
            border-color: var(--border-color);
        }

        .btn-secondary:hover {
            background: #231c40;
            border-color: #3f346e;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(22, 225, 170, 0.12);
            color: var(--accent-teal);
            border: 1px solid rgba(22, 225, 170, 0.28);
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--accent-teal);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        @yield('styles')
    </style>
</head>
<body>
    @include('partials.header')

    <main style="flex: 1;">
        @yield('content')
    </main>

    @include('partials.footer')

    @yield('scripts')
</body>
</html>
