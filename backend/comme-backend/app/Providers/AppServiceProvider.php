<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Keyed by email+IP together, not just IP — a shared office/campus
        // IP shouldn't lock out everyone just because one person is
        // guessing passwords on one account.
        RateLimiter::for('login', function (Request $request) {
            if (app()->environment('local')) {
                return Limit::none();
            }
            return Limit::perMinute(5)->by($request->input('email').'|'.$request->ip());
        });

        // Keyed by IP alone — there's no email to key against yet on a
        // brand-new account, so this is your only real defense against
        // spam registration bots.
        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });

        // A 6-digit code is only 1,000,000 combinations — at 5 attempts
        // per minute, exhausting that within the 15-minute code lifetime
        // is completely infeasible, keyed by email and IP so it doesn't collide
        // with the login limiter's attempt budget or lock out on null emails.
        RateLimiter::for('register-confirm', function (Request $request) {
            return Limit::perMinute(5)->by(($request->input('email') ?? 'none').'|'.$request->ip());
        });

        // General catch-all for everything else — by user ID once logged
        // in (fair per-person), falling back to IP for anything
        // unauthenticated that slips through.
        RateLimiter::for('api', function(Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        /**
         * By default, Laravel builds the verification link as a signed
         * URL pointing at a backend route — fine for a Blade app, wrong
         * for a React SPA, since the emailed link needs to open the
         * frontend, not raw JSON. This overrides the URL Laravel puts in
         * the email while still using Laravel's own signed-URL generator
         * underneath, so the signature/expiry are exactly what the
         * 'signed' middleware on the real API route expects to see.
         */

        VerifyEmail::createUrlUsing(function ($notifiable) {
            $signedUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
            );

            $query = parse_url($signedUrl, PHP_URL_QUERY);

            return config('app.frontend_url')."/verify-email/{$notifiable->getKey()}/".sha1($notifiable->getEmailForVerification())."?{$query}";
        });

        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            return config('app.frontend_url').'/reset-password?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
