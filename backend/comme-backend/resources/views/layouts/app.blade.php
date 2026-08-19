<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name', 'Comme')) - Commission & Art Marketplace API</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <!-- Styles -->
    <style>
        :root {
            --bg-primary: #0b0c10;
            --bg-secondary: #12141a;
            --bg-card: #181b22;
            --border-color: #232732;
            --text-primary: #f0f2f7;
            --text-secondary: #8c93a4;
            --text-muted: #5e6475;
            --accent-purple: #8b5cf6;
            --accent-indigo: #6366f1;
            --accent-gradient: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            --accent-green: #10b981;
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
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
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
            background: #20242e;
            border-color: #313746;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(16, 185, 129, 0.12);
            color: var(--accent-green);
            border: 1px solid rgba(16, 185, 129, 0.24);
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: var(--accent-green);
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
