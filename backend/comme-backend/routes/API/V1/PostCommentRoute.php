<?php

use App\Http\Controllers\API\V1\PostCommentController;
use Illuminate\Support\Facades\Route;

Route::get('posts/{post}/comments', [PostCommentController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('posts/{post}/comments', [PostCommentController::class, 'store']);
    Route::get('comments/{comment}', [PostCommentController::class, 'show']);
    Route::match(['put', 'patch'], 'comments/{comment}', [PostCommentController::class, 'update']);
    Route::delete('comments/{comment}', [PostCommentController::class, 'destroy']);
});
