<?php

use App\Http\Controllers\API\V1\FollowController;
use Illuminate\Support\Facades\Route;

Route::post('users/{user}/follow', [FollowController::class, 'toggle']);
Route::get('users/{user}/followers', [FollowController::class, 'followers']);
Route::get('users/{user}/following', [FollowController::class, 'following']);
