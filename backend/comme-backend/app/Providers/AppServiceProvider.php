<?php

namespace App\Providers;

use App\Enum\UserRole;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\ArtistProfile;
use App\Models\CommissionOrder;
use App\Models\CommissionReview;
use App\Models\CommissionService;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Observers\CacheInvalidationObserver;
use App\Policies\ReportPolicy;
use App\Policies\TicketMessagePolicy;
use App\Policies\TicketPolicy;

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
        Gate::policy(Report::class, ReportPolicy::class);
        Gate::policy(Ticket::class, TicketPolicy::class);
        Gate::policy(TicketMessage::class, TicketMessagePolicy::class);

        Gate::define('viewPulse', function (?User $user = null) {
            return app()->environment('local', 'testing') || ($user && $user->role === UserRole::ADMIN);
        });

        Gate::define('viewLogViewer', function (?User $user = null) {
            return app()->environment('local', 'testing') || ($user && $user->role === UserRole::ADMIN);
        });

        DB::whenQueryingForLongerThan(500, function ($connection) {
            Log::warning("Slow database query detected on [{$connection->getName()}]: {$connection->totalQueryDuration()}ms");
        });

        // Smart Cache Invalidation Observers
        Post::observe(CacheInvalidationObserver::class);
        CommissionService::observe(CacheInvalidationObserver::class);
        ArtistProfile::observe(CacheInvalidationObserver::class);
        CommissionReview::observe(CacheInvalidationObserver::class);

        Relation::morphMap([
            'post' => Post::class,
            'post_comment' => PostComment::class,
            'commission_review' => CommissionReview::class,
            'portfolio' => Portfolio::class,
            'commission_service' => CommissionService::class,
            'user' => User::class,
            'commission' => CommissionOrder::class,
        ]);
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

        // Role-tiered API rate limiter:
        // Admin: 300/min, Moderator: 240/min, Artist: 180/min, Buyer/User: 120/min, Guest: 60/min
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            if ($user) {
                if ($user->role === UserRole::ADMIN) {
                    return Limit::perMinute(300)->by($user->id);
                }
                if ($user->role === UserRole::MODERATOR) {
                    return Limit::perMinute(240)->by($user->id);
                }
                if ($user->artistProfile()->exists()) {
                    return Limit::perMinute(180)->by($user->id);
                }
                return Limit::perMinute(120)->by($user->id);
            }
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('media-upload', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('payment-checkout', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
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
