<?php

use App\Models\PendingRegistration;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('model:prune', [
    '--model' => [PendingRegistration::class],
])->hourly();

Schedule::command('commissions:release-due-payouts')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('commissions:reconcile-payouts')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('commissions:retry-failed-payouts')
    ->everyThirtyMinutes()
    ->withoutOverlapping()
    ->runInBackground();
