<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Artist Application Approved</title>
</head>
<body style="margin: 0; background: #f5f3ef; color: #24221f; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f5f3ef; padding: 36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #fffaf1; border: 1px solid #ded4c3;">
                    <tr>
                        <td style="padding: 34px 34px 26px;">
                            <p style="margin: 0 0 8px; color: #746a5c; font-family: Verdana, sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Comme Community</p>
                            <h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">Welcome to Comme Artists!</h1>
                            <p style="margin: 18px 0 0; color: #4f4a43; font-family: Verdana, sans-serif; font-size: 15px; line-height: 1.65;">
                                Congratulations, {{ $user->display_name ?? $user->username }}! Your application to become a verified artist on Comme has been approved.
                            </p>
                            <div style="margin: 26px 0; padding: 20px; background: #f0f7ee; border: 1px solid #cbe4c7; border-left: 4px solid #3c763d; font-family: Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #2b542c;">
                                <strong>Your artist profile is now active!</strong> You can start creating commission services, posting portfolio artwork, and accepting client requests.
                            </div>
                            <p style="margin: 0 0 16px; color: #4f4a43; font-family: Verdana, sans-serif; font-size: 14px; line-height: 1.65;">
                                Head over to your dashboard to complete your artist profile settings, configure your commission slots, and set up your portfolio.
                            </p>
                            <p style="margin: 0; color: #746a5c; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1.6;">
                                We're excited to see your work on Comme. If you have any questions, feel free to reach out to our staff support.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
