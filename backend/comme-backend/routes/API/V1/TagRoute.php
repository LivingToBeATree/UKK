<?php

use App\Http\Controllers\API\V1\TagController;
use Illuminate\Support\Facades\Route;

Route::get('/tags', [TagController::class, 'index']);
