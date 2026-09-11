<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Comme Notification')</title>
    <style>
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            outline: none;
            text-decoration: none;
        }
        @media only screen and (max-width: 620px) {
            .email-outer-cell {
                padding: 24px 16px !important;
            }
            .email-card-cell {
                padding: 28px 22px 24px !important;
            }
            .email-card-table {
                width: 100% !important;
                border-radius: 10px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #f5f3ef; color: #24221f; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f3ef; margin: 0; padding: 0; width: 100%;">
        <tr>
            <td align="center" class="email-outer-cell" style="padding: 48px 24px; background-color: #f5f3ef;">
                <!-- Main Card Table -->
                <table role="presentation" class="email-card-table" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #fffaf1; border: 1px solid #ded4c3; border-radius: 12px; box-shadow: 0 4px 20px rgba(36, 34, 31, 0.08); overflow: hidden;">
                    <tr>
                        <td class="email-card-cell" style="padding: 40px 40px 36px;">
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
