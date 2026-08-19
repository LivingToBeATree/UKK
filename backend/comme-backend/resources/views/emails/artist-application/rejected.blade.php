<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Artist Application Update</title>
</head>
<body style="margin: 0; background: #f5f3ef; color: #24221f; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f5f3ef; padding: 36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #fffaf1; border: 1px solid #ded4c3;">
                    <tr>
                        <td style="padding: 34px 34px 26px;">
                            <p style="margin: 0 0 8px; color: #746a5c; font-family: Verdana, sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Comme Community</p>
                            <h1 style="margin: 0; color: #24221f; font-size: 28px; line-height: 1.2; font-weight: normal;">Artist application update</h1>
                            <p style="margin: 18px 0 0; color: #4f4a43; font-family: Verdana, sans-serif; font-size: 15px; line-height: 1.65;">
                                Hello {{ $user->display_name ?? $user->username }}, thank you for applying to become a verified artist on Comme. After careful review, our moderation team was unable to approve your application at this time.
                            </p>
                            <div style="margin: 24px 0; padding: 18px; background: #fbf0ea; border: 1px solid #e8cbba; border-left: 4px solid #b35900; font-family: Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #6b3500;">
                                <strong>Feedback from our review team:</strong>
                                <p style="margin: 8px 0 0; color: #24221f;">{{ $rejectionReason }}</p>
                            </div>
                            <p style="margin: 0 0 16px; color: #4f4a43; font-family: Verdana, sans-serif; font-size: 14px; line-height: 1.65;">
                                You are welcome to update your portfolio and submit a new application once you have addressed the feedback above.
                            </p>
                            <p style="margin: 0; color: #746a5c; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1.6;">
                                If you believe this decision was made in error or have questions, please submit a support ticket from your account.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
