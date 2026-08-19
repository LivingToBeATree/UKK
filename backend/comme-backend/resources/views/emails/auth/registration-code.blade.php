<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify your email</title>
</head>
<body style="margin: 0; background: #f5f3ef; color: #24221f; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f5f3ef; padding: 36px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #fffaf1; border: 1px solid #ded4c3;">
                    <tr>
                        <td style="padding: 34px 34px 26px;">
                            <p style="margin: 0 0 8px; color: #746a5c; font-family: Verdana, sans-serif; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Comme</p>
                            <h1 style="margin: 0; color: #24221f; font-size: 30px; line-height: 1.2; font-weight: normal;">Verify your email</h1>
                            <p style="margin: 18px 0 0; color: #4f4a43; font-family: Verdana, sans-serif; font-size: 15px; line-height: 1.65;">
                                Use this code to finish creating your account. Your account will not be created until the code is confirmed.
                            </p>
                            <div style="margin: 28px 0; padding: 22px; background: #24221f; color: #fffaf1; text-align: center; font-family: Verdana, sans-serif; font-size: 34px; letter-spacing: 0.28em; font-weight: 700;">
                                {{ $code }}
                            </div>
                            <p style="margin: 0; color: #746a5c; font-family: Verdana, sans-serif; font-size: 13px; line-height: 1.6;">
                                This code expires in {{ $ttlMinutes }} minutes. If you did not request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
