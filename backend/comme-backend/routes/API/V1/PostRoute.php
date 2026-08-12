<?php

use App\Http\Controllers\API\V1\PostController;
use Illuminate\Support\Facades\Route;

Route::apiResource('postfolios', PostController::class);
