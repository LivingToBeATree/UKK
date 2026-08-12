<?php

use App\Http\Controllers\API\V1\PostCommentController;
use Illuminate\Support\Facades\Route;

Route::apiResource('posts.comments', PostCommentController::class)
    ->shallow();
