<?php

use App\Http\Controllers\API\V1\PostBookmarkController;
use App\Http\Controllers\API\V1\PostController;
use App\Http\Controllers\API\V1\PostLikeController;
use Illuminate\Support\Facades\Route;

Route::get('me/bookmarks', [PostBookmarkController::class, 'userBookmarks']);
Route::post('posts/{post}/like', [PostLikeController::class, 'toggleLike']);
Route::post('posts/{post}/bookmark', [PostBookmarkController::class, 'toggleBookmark']);

Route::apiResource('posts', PostController::class);
