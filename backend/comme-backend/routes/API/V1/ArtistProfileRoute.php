<?php

use App\Http\Controllers\API\V1\ArtistProfileController;
use Illuminate\Support\Facades\Route;

Route::apiResource('artist-profiles', ArtistProfileController::class);
