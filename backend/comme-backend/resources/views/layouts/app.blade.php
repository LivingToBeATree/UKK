<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Comme API Documentation')</title>

    <!-- Favicon & Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('icons/32x32.png') }}">
    <link rel="icon" type="image/png" sizes="64x64" href="{{ asset('icons/64x64.png') }}">
    <link rel="apple-touch-icon" sizes="128x128" href="{{ asset('icons/128x128.png') }}">
    <link rel="apple-touch-icon" sizes="256x256" href="{{ asset('icons/256x256.png') }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Design System CSS -->
    <link rel="stylesheet" href="{{ asset('css/docs.css') }}">

    <!-- Prevent FOUC: apply saved theme immediately -->
    <script>
        (function() {
            var t = localStorage.getItem('comme-theme') || 'dark';
            if (t === 'system') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', t);
        })();
    </script>
</head>
<body>
    <!-- Top Header -->
    @include('partials.header')

    <!-- Drawer Overlay -->
    <div id="drawerOverlay" class="drawer-overlay"></div>

    <!-- Off-canvas Sidebar Drawer -->
    @include('partials.docs-sidebar')

    <!-- Main Content Container -->
    <div class="docs-wrapper">
        <main class="docs-content">
            @yield('content')
        </main>
    </div>

    <!-- Footer -->
    @include('partials.footer')

    <!-- Interactive Scripts -->
    <script src="{{ asset('js/docs.js') }}"></script>
</body>
</html>
