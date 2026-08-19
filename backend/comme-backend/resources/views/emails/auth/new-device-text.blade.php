New Device Sign-in

Hello {{ $user->display_name ?? $user->username }},

We detected a new sign-in to your Comme account:

- Time: {{ $loginTime }}
- IP Address: {{ $ipAddress }}
- Device: {{ $userAgent }}

If this was you, you can safely ignore this email.

If you did not sign in, please change your password immediately and revoke all other active sessions from your account security settings.
