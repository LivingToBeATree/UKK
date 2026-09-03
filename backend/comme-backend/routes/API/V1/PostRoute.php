<?php

use App\Http\Controllers\API\V1\PostBookmarkController;
use App\Http\Controllers\API\V1\PostController;
use App\Http\Controllers\API\V1\PostLikeController;
use Illuminate\Support\Facades\Route;

Route::get('posts', [PostController::class, 'index']);
Route::get('posts/{post}', [PostController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me/bookmarks', [PostBookmarkController::class, 'userBookmarks']);
    Route::get('me/likes', [PostLikeController::class, 'userLikes']);
    Route::post('posts/{post}/like', [PostLikeController::class, 'toggleLike']);
    Route::post('posts/{post}/bookmark', [PostBookmarkController::class, 'toggleBookmark']);
    Route::post('posts', [PostController::class, 'store']);
    Route::match(['put', 'patch'], 'posts/{post}', [PostController::class, 'update']);
    Route::delete('posts/{post}', [PostController::class, 'destroy']);
});
