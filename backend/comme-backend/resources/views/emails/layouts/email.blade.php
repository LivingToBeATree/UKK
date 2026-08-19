<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Comme Notification')</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; color: #24221f; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f3ef; padding: 40px 16px;">
        <tr>
            <td align="center">
                <!-- Main Card Table -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #fffaf1; border: 1px solid #ded4c3; border-radius: 4px; box-shadow: 0 2px 8px rgba(36, 34, 31, 0.04);">
                    <tr>
                        <td style="padding: 36px 36px 32px;">
                            <!-- Header Partial -->
                            @include('emails.partials.header')

                            <!-- Main Content Slot -->
                            @yield('content')

                            <!-- Footer Partial -->
                            @include('emails.partials.footer')
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
