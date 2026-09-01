<?php

use App\Http\Controllers\API\V1\GifController;
use Illuminate\Support\Facades\Route;

Route::get('/gifs', [GifController::class, 'index']);
