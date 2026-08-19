Reset Your Password

Hello {{ $user->display_name ?? $user->username }},

We received a request to reset the password for your Comme account.

To reset your password, visit the following link:
{{ $resetUrl }}

This password reset link will expire in {{ $expireMinutes }} minutes.

If you did not request a password reset, no further action is required.
